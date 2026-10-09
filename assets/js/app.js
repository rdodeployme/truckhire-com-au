/* TruckHire.com.au — shared app code */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n, dp) => '$' + Number(n || 0).toLocaleString('en-AU', { minimumFractionDigits: dp ?? (n % 1 ? 2 : 0), maximumFractionDigits: dp ?? 2 });
const qs = k => new URLSearchParams(location.search).get(k);
function iso(d) { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); }
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- storage (per-browser, prototype only) ---------- */
const Store = {
  get(k, d) { try { const v = localStorage.getItem('th:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('th:' + k, JSON.stringify(v)); } catch (e) {} },
  push(k, v) { const a = Store.get(k, []); a.unshift(v); Store.set(k, a); return a; }
};
function allTrucks() { return [...Store.get('listings', []).filter(t => !t.paused), ...TH_TRUCKS_SAMPLE]; }
function findTruck(id) { return [...Store.get('listings', []), ...TH_TRUCKS_SAMPLE].find(t => t.id === id); }
function user() { return Store.get('user', null); }

/* ---------- licence helpers ---------- */
const canDrive = (held, needed) => (TH_LIC_RANK[held] || 0) >= (TH_LIC_RANK[needed] || 99);
const licName = c => (TH_LICENCES.find(l => l.code === c) || {}).name || c;

/* ---------- ABN checksum (ATO algorithm) ---------- */
function validABN(abn) {
  const d = String(abn).replace(/\s/g, '');
  if (!/^\d{11}$/.test(d)) return false;
  const w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const n = d.split('').map(Number); n[0] -= 1;
  return n.reduce((s, x, i) => s + x * w[i], 0) % 89 === 0;
}
const fmtABN = v => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,3}).*/, (m, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));

/* ---------- toast ---------- */
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- truck card ---------- */
function truckCard(t, opts = {}) {
  const lic = t.licence;
  const photo = t.photo ? `<img src="${t.photo}" alt="" loading="lazy">` : truckSVG(t.type, { big: t.axles >= 3, title: t.title });
  const driveable = opts.held ? canDrive(opts.held, lic) : null;
  return `<a class="truck-card ${driveable === false ? 'is-locked' : ''}" href="truck.html?id=${encodeURIComponent(t.id)}">
    <div class="tc-media">${photo}
      <span class="lic-chip lic-${lic}">${lic === 'C' ? 'Car licence' : lic + ' licence'}</span>
      ${t.instant ? '<span class="instant-chip" title="Instant book">⚡ Instant</span>' : ''}
      ${driveable === false ? `<span class="lock-chip">Needs ${lic}</span>` : ''}
    </div>
    <div class="tc-body">
      <h3>${esc(t.title)}</h3>
      <p class="tc-meta">${esc(t.suburb)}, ${esc(t.state)} · ${t.m3 ? t.m3 + ' m³ · ' : ''}${(t.payload / 1000).toFixed(1)} t payload</p>
      <div class="tc-foot"><span class="tc-price"><strong>${money(t.dayRate)}</strong>/day</span><span class="tc-type">${TH_TYPE[t.type]?.short || ''}</span></div>
    </div>
  </a>`;
}

/* ---------- header behaviour ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = $('#navToggle'), nav = $('#siteNav');
  if (btn && nav) btn.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open);
  });
  const u = user();
  if (u) $$('[data-auth]').forEach(el => {
    el.innerHTML = `<a class="btn btn-ghost btn-sm" href="dashboard.html">${esc(u.first || 'My account')}</a>`;
  });
  // active nav
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('#siteNav a').forEach(a => { if (a.getAttribute('href') === page) a.setAttribute('aria-current', 'page'); });
  // header shadow on scroll
  const hdr = $('.site-header');
  const onScroll = () => hdr && hdr.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // reveal on scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -40px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('in'));
  // accordions
  $$('.faq-q').forEach(q => q.addEventListener('click', () => {
    const item = q.closest('.faq-item'); const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open);
  }));
});

/* ---------- multi-step form engine ---------- */
function Stepper(root, { onStep, onFinish } = {}) {
  const steps = $$('.step', root);
  const bar = $('.stepper-bar', root);
  let i = 0;
  const labels = steps.map(s => s.dataset.label);
  if (bar) bar.innerHTML = labels.map((l, n) => `<li data-n="${n}"><span>${n + 1}</span><em>${l}</em></li>`).join('');
  function show(n) {
    i = Math.max(0, Math.min(n, steps.length - 1));
    steps.forEach((s, k) => s.hidden = k !== i);
    if (bar) $$('li', bar).forEach((li, k) => { li.classList.toggle('done', k < i); li.classList.toggle('now', k === i); });
    const prog = $('.stepper-progress span', root); if (prog) prog.style.width = ((i + 1) / steps.length * 100) + '%';
    const cnt = $('.stepper-count', root); if (cnt) cnt.textContent = `Step ${i + 1} of ${steps.length} · ${labels[i]}`;
    onStep && onStep(i, steps[i]);
    const top = root.getBoundingClientRect().top + scrollY - 90;
    if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
  }
  function validate(step) {
    let ok = true, first = null;
    $$('[required]', step).forEach(f => {
      if (f.closest('[hidden]') && f.closest('[hidden]') !== step) return;
      let bad = f.type === 'checkbox' ? !f.checked : f.type === 'file' ? !f.files.length && !f.dataset.done : !f.value.trim();
      if (!bad && f.pattern && f.value && !new RegExp('^(?:' + f.pattern + ')$').test(f.value)) bad = true;
      if (!bad && f.dataset.check && window[f.dataset.check]) { const m = window[f.dataset.check](f); if (m) { bad = true; setErr(f, m); } }
      else setErr(f, bad ? (f.dataset.msg || 'Required') : '');
      if (bad) { ok = false; first = first || f; }
    });
    const extra = step.dataset.validate && window[step.dataset.validate];
    if (ok && extra) { const m = extra(step); if (m) { ok = false; toast(m); } }
    if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return ok;
  }
  root.addEventListener('click', e => {
    const nx = e.target.closest('[data-next]'), bk = e.target.closest('[data-back]');
    if (nx) { e.preventDefault(); if (validate(steps[i])) { if (i === steps.length - 1) onFinish && onFinish(); else show(i + 1); } }
    if (bk) { e.preventDefault(); show(i - 1); }
  });
  root.addEventListener('input', e => { if (e.target.closest('.field.err')) setErr(e.target, ''); });
  show(0);
  return { show, get i() { return i; } };
}
function setErr(f, msg) {
  const w = f.closest('.field') || f.parentElement; if (!w) return;
  w.classList.toggle('err', !!msg);
  let m = $('.field-msg', w);
  if (msg) { if (!m) { m = document.createElement('small'); m.className = 'field-msg'; w.appendChild(m); } m.textContent = msg; }
  else if (m) m.remove();
}

/* ---------- file upload preview ---------- */
function wireUploads(scope = document) {
  $$('.upload input[type=file]', scope).forEach(inp => {
    inp.addEventListener('change', () => {
      const box = inp.closest('.upload'); const prev = $('.upload-prev', box);
      if (!prev) return;
      prev.innerHTML = '';
      [...inp.files].slice(0, 12).forEach(f => {
        if (f.type.startsWith('image/')) {
          const r = new FileReader(); r.onload = () => { prev.insertAdjacentHTML('beforeend', `<img src="${r.result}" alt="">`); inp.dataset.preview = r.result; }; r.readAsDataURL(f);
        } else prev.insertAdjacentHTML('beforeend', `<span class="file-pill">📄 ${esc(f.name)}</span>`);
      });
      box.classList.toggle('has-file', inp.files.length > 0);
      setErr(inp, '');
    });
  });
}
