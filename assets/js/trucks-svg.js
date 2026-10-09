/* Side-view truck illustrations, drawn in code so every listing has a clean visual
   until owners upload real photos. Facing right. viewBox 0 0 340 150. */
function truckSVG(type, opts) {
  opts = opts || {};
  const big = !!opts.big;          // tandem rear axle
  const body = opts.body || '#FFFFFF';
  const cab = opts.cab || '#1450F5';
  const ink = '#071A3D';
  const glass = '#BFD3FF';
  const G = 124; // ground line (wheel bottom)
  const wheel = (cx, r = 15) =>
    `<g><circle cx="${cx}" cy="${G - r}" r="${r}" fill="${ink}"/><circle cx="${cx}" cy="${G - r}" r="${r * 0.46}" fill="#E7EEFC"/><circle cx="${cx}" cy="${G - r}" r="${r * 0.14}" fill="${ink}"/></g>`;
  const shadow = `<ellipse cx="170" cy="${G + 4}" rx="150" ry="5" fill="${ink}" opacity=".10"/>`;

  // Standard truck cab (cab-over style) from x to x+w
  const truckCab = (x, top = 40, w = 72) => {
    const y2 = G - 22;
    return `<path d="M${x} ${y2} V${top + 6} q0-6 6-6 H${x + w - 22} q8 0 12 8 l10 22 q2 4 2 9 V${y2} Z" fill="${cab}"/>
      <path d="M${x + w - 26} ${top + 8} h6 l11 22 h-17 Z" fill="${glass}"/>
      <rect x="${x + 8}" y="${top + 8}" width="${w - 42}" height="20" rx="3" fill="${glass}"/>
      <rect x="${x + w - 6}" y="${y2 - 18}" width="6" height="7" rx="1.5" fill="#FFFFFF" opacity=".9"/>
      <rect x="${x}" y="${y2 - 4}" width="${w + 2}" height="6" rx="2" fill="${ink}" opacity=".85"/>`;
  };
  const chassis = (x1, x2) => `<rect x="${x1}" y="${G - 26}" width="${x2 - x1}" height="7" rx="2" fill="${ink}"/>`;
  const stripe = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="6" fill="${cab}"/>`;
  const rear = big ? wheel(62) + wheel(98) : wheel(80);

  let art = '';
  switch (type) {
    case 'ute': {
      art = `
        <path d="M150 98 V62 q0-6 6-6 h52 q8 0 13 7 l17 22 h26 q10 0 12 10 l2 5 V98 Z" fill="${cab}"/>
        <path d="M188 62 h18 q5 0 8 4 l13 17 h-39 Z" fill="${glass}"/>
        <rect x="158" y="62" width="25" height="21" rx="3" fill="${glass}"/>
        <rect x="40" y="74" width="112" height="24" rx="3" fill="${body}" stroke="${ink}" stroke-width="3"/>
        <line x1="40" y1="86" x2="152" y2="86" stroke="${ink}" stroke-width="1.5" opacity=".35"/>
        <rect x="36" y="96" width="232" height="8" rx="3" fill="${ink}"/>
        ${wheel(80, 16)}${wheel(232, 16)}`;
      break;
    }
    case 'van': {
      art = `
        <path d="M34 106 V44 q0-10 10-10 H220 q14 0 24 12 l34 40 q6 7 6 16 V106 Z" fill="${body}" stroke="${ink}" stroke-width="3"/>
        <path d="M226 44 h4 q8 0 14 7 l26 33 h-44 Z" fill="${glass}"/>
        <rect x="176" y="44" width="40" height="30" rx="4" fill="${glass}"/>
        ${stripe(36, 84, 246)}
        <line x1="150" y1="40" x2="150" y2="104" stroke="${ink}" stroke-width="1.5" opacity=".3"/>
        <rect x="30" y="102" width="258" height="8" rx="3" fill="${ink}"/>
        ${wheel(84, 16)}${wheel(238, 16)}`;
      break;
    }
    case 'box':
    case 'fridge':
    case 'curtain': {
      const top = big ? 18 : 24;
      art = `${chassis(28, 250)}
        <rect x="24" y="${top}" width="184" height="${G - 30 - top}" rx="4" fill="${body}" stroke="${ink}" stroke-width="3"/>
        ${type === 'curtain'
          ? [...Array(9)].map((_, i) => `<line x1="${40 + i * 19}" y1="${top + 6}" x2="${40 + i * 19}" y2="${G - 36}" stroke="${ink}" stroke-width="1.5" opacity=".28"/>`).join('') + stripe(26, top + 4, 180)
          : stripe(26, G - 52, 180)}
        ${type === 'fridge' ? `<rect x="198" y="${top + 6}" width="18" height="30" rx="3" fill="${ink}"/><g fill="#E7EEFC">${[0,1,2].map(i=>`<rect x="202" y="${top+11+i*8}" width="10" height="3" rx="1"/>`).join('')}</g>` : ''}
        ${truckCab(212, top + 16)}
        ${rear}${wheel(258)}`;
      break;
    }
    case 'tray': {
      art = `${chassis(28, 250)}
        <rect x="22" y="${G - 40}" width="188" height="10" rx="2" fill="${ink}"/>
        <rect x="22" y="${G - 54}" width="188" height="14" rx="2" fill="${body}" stroke="${ink}" stroke-width="3"/>
        ${[...Array(6)].map((_, i) => `<rect x="${40 + i * 30}" y="${G - 52}" width="3" height="10" fill="${ink}" opacity=".3"/>`).join('')}
        <rect x="204" y="${G - 92}" width="8" height="52" rx="2" fill="${ink}"/>
        ${truckCab(214, 34)}
        ${rear}${wheel(258)}`;
      break;
    }
    case 'tipper': {
      art = `${chassis(28, 250)}
        <path d="M24 ${G - 74} H206 L198 ${G - 32} H34 Z" fill="${body}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
        ${stripe(30, G - 62, 172)}
        <path d="M206 ${G - 74} l6 -12 h4 v12" fill="${ink}"/>
        ${truckCab(214, 34)}
        ${rear}${wheel(258)}`;
      break;
    }
    case 'tilt': {
      art = `${chassis(28, 250)}
        <g transform="rotate(-6 210 ${G - 34})">
          <rect x="10" y="${G - 44}" width="200" height="12" rx="2" fill="${body}" stroke="${ink}" stroke-width="3"/>
          <rect x="16" y="${G - 40}" width="188" height="3" fill="${cab}"/>
        </g>
        <path d="M150 ${G - 30} L120 ${G - 46}" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
        ${truckCab(214, 34)}
        ${rear}${wheel(258)}`;
      break;
    }
    default:
      return truckSVG('box', opts);
  }
  const label = opts.title ? `<title>${opts.title}</title>` : '';
  return `<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.title || 'Truck illustration'}" class="truck-svg">${label}${shadow}${art}</svg>`;
}
