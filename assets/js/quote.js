/* Quote engine + availability calendar */
function hireDays(from, to) {
  if (!from || !to) return 1;
  const ms = new Date(to) - new Date(from);
  return Math.max(1, Math.round(ms / 864e5) + 1);
}
function calcQuote(t, o) {
  const days = o.days || 1;
  const km = Math.max(0, +o.km || 0);
  const cover = TH_CONFIG.cover.find(c => c.id === (o.cover || 'basic')) || TH_CONFIG.cover[0];
  const included = t.kmDay * days;
  const extraKm = Math.max(0, km - included);
  const lines = [];
  const hire = t.dayRate * days;
  lines.push([`${money(t.dayRate)} × ${days} day${days > 1 ? 's' : ''}`, hire]);
  if (extraKm) lines.push([`${extraKm} km over ${included} km included @ ${money(t.extraKm, 2)}`, +(extraKm * t.extraKm).toFixed(2)]);
  if (cover.perDay) lines.push([`${cover.name} cover (${money(cover.excess)} excess)`, cover.perDay * days]);
  (o.extras || []).forEach(id => {
    const x = TH_CONFIG.extras.find(e => e.id === id); if (!x) return;
    lines.push([x.name, x.per === 'day' ? x.price * days : x.price]);
  });
  const sub = lines.reduce((s, l) => s + l[1], 0);
  const fee = +(sub * TH_CONFIG.serviceFeePct).toFixed(2);
  lines.push(['Service fee', fee]);
  const total = +(sub + fee).toFixed(2);
  return { days, lines, total, bond: t.bond, cover, included, gst: +(total / 11).toFixed(2), ownerPayout: +((sub - (cover.perDay * days)) * (1 - TH_CONFIG.ownerCommissionPct)).toFixed(2) };
}
function quoteHTML(q) {
  return q.lines.map(l => `<div class="qline"><span>${l[0]}</span><span>${money(l[1], 2)}</span></div>`).join('') +
    `<div class="qline total"><span>Total (incl. GST)</span><span>${money(q.total, 2)}</span></div>
     <div class="qline"><span class="muted">Refundable bond hold</span><span class="muted">${money(q.bond)}</span></div>`;
}

/* deterministic "booked" days per truck so the calendar looks lived-in */
function blockedDays(id) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const out = new Set(); const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 9; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const start = 2 + (h % 50), len = 1 + (h % 3);
    for (let k = 0; k < len; k++) { const d = new Date(today); d.setDate(d.getDate() + start + k); out.add(iso(d)); }
  }
  // real bookings made in this browser
  Store.get('bookings', []).filter(b => b.truckId === id && b.status !== 'declined').forEach(b => {
    for (let d = new Date(b.from); d <= new Date(b.to); d.setDate(d.getDate() + 1)) out.add(iso(d));
  });
  return out;
}

function Calendar(el, { blocked = new Set(), from, to, onChange } = {}) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let a = from || null, b = to || null;
  function rangeOk(x, y) { for (let d = new Date(x); d <= new Date(y); d.setDate(d.getDate() + 1)) if (blocked.has(iso(d))) return false; return true; }
  function draw() {
    const y = view.getFullYear(), m = view.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
    let cells = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span class="dow">${d}</span>`).join('');
    for (let i = 0; i < first; i++) cells += '<span class="pad"></span>';
    for (let d = 1; d <= n; d++) {
      const dt = new Date(y, m, d), k = iso(dt);
      const past = dt < today, bl = blocked.has(k);
      let cls = bl ? 'blocked' : '';
      if (a && k === a || b && k === b) cls += ' sel'; else if (a && b && k > a && k < b) cls += ' range';
      cells += `<button type="button" data-d="${k}" class="${cls}" ${past || bl ? 'disabled' : ''} aria-label="${dt.toDateString()}${bl ? ' unavailable' : ''}">${d}</button>`;
    }
    el.innerHTML = `<div class="cal"><div class="cal-head"><button type="button" data-nav="-1" aria-label="Previous month">‹</button><b>${view.toLocaleString('en-AU', { month: 'long', year: 'numeric' })}</b><button type="button" data-nav="1" aria-label="Next month">›</button></div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend"><span><i style="background:var(--sky-2);border:1px solid var(--line)"></i>Available</span><span><i style="background:var(--blue)"></i>Your dates</span><span><i style="background:#fff;border:1px solid var(--line)"></i>Booked</span></div></div>`;
  }
  el.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { const nv = new Date(view); nv.setMonth(nv.getMonth() + +nav.dataset.nav); if (nv >= new Date(today.getFullYear(), today.getMonth(), 1)) view = nv; draw(); return; }
    const btn = e.target.closest('[data-d]'); if (!btn) return;
    const k = btn.dataset.d;
    if (!a || (a && b)) { a = k; b = null; }
    else if (k < a) { a = k; }
    else if (rangeOk(a, k)) { b = k; }
    else { toast('Those dates include a day that\'s already booked'); a = k; b = null; }
    draw(); onChange && onChange(a, b || a);
  });
  draw();
  return { set(x, y) { a = x; b = y; if (x) view = new Date(new Date(x).getFullYear(), new Date(x).getMonth(), 1); draw(); } };
}
