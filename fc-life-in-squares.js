// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const NOW = 2026;
const SPAN = 90;
const MIN_BIRTH_YEAR = 1960;
const AGENCY_FROM_YEAR = 2027;
const LIFE_YEARS_DATA_URL = 'data/life-years.json';

const GLOBAL_KEYS = ['usa', 'china', 'alte_welt', 'neue_welt', 'crypto', 'handel'];
const CHANCEN_KEYS = ['mental', 'koerper', 'gemeinschaft', 'technologie'];
const POS_ICONS = ['🧠', '💪', '🤝', '🔬'];

const FC_COPY = {
  de: {
    globalRegions: ['Weltmacht USA', 'Aufstrebendes China', 'Alte Welt', 'Neue Welt', 'Crypto', 'Handel'],
    posTitles: ['Mentales', 'Körper', 'Gemeinschaft', 'Technologie'],
    era: { PRE: 'Vor dem Web', EARLY: 'Frühes Internet', SOCIAL: 'Social Media', CRISIS: 'Krise & Wandel', NOW: 'Heute', FUTURE: 'Zukunft' },
    tabs: { global: 'Welt', society: 'Gesellschaft', pos: 'Chancen', agency: 'Was kann ich schon heute tun?' },
    idleYear: 'klick auf eine Jahreszahl ↑',
    idleInsights: 'Wähle ein Jahr, um die Hauptthemen zu sehen.',
    idleAgency: 'Wähle ein Jahr, um einen alters- und kontextabhängigen Handlungstext zu sehen.',
    idleCategory: 'Kategorie aktiv.',
    bannerWebBorn: 'Das Web existiert seitdem Du geboren bist.',
    bannerWebAge: (n) => `Das Web existiert seit du ${n} Jahre alt warst.`,
    banner: (age, pct, web) => `Du bist ${age} Jahre alt. Du hast ${pct}% deines Lebens hinter dir. ${web}`,
    stats: {
      screen: { label: 'Screentime', desc: 'Std/Tag/Mensch', trend: { bad: '↑ kritisch', ok: '↑ bedenklich', good: '→ normal' } },
      friends: { label: 'Freundschaften', desc: 'Echte Freundschaften / Mensch (westl. Gesellschaft)', trend: { bad: '↓ Einsamkeits-Krise', ok: '↓ sinkend', good: '→ stabil' } },
      freiheit: { label: 'Freiheit', desc: '% freie Gesellschaft weltweit', trend: { bad: '↓ niedrig', ok: '→ gemäßigt', good: '↑ relativ hoch', base: '→ Basiseinheit gespeichert' } },
      bmi: { label: 'BMI', desc: 'Durchm. BMI weltweit', trend: { bad: '↑ Fettleibigkeit', ok: '↑ Übergewicht normal', good: '→ Normalbereich' } },
      polar: { label: 'Polarisierung', desc: '% mediale Polarisierung inkl. Social Media weltweit', trend: { bad: '↑ histor. Maximum', ok: '↑ steigend', good: '→ gemäßigt' } },
    },
    futureYear: (y) => `${y} — Zukunft`,
    ageLived: 'Gelebte Jahre',
    agePct: 'Deines Lebens',
    ageRemain: 'Verbleibend',
    statBase: 'Basiseinheit',
  },
  en: {
    globalRegions: ['USA superpower', 'Rising China', 'Old World', 'New World', 'Crypto', 'Trade'],
    posTitles: ['Mental', 'Body', 'Community', 'Technology'],
    era: { PRE: 'Before the web', EARLY: 'Early internet', SOCIAL: 'Social media', CRISIS: 'Crisis & change', NOW: 'Today', FUTURE: 'Future' },
    tabs: { global: 'World', society: 'Society', pos: 'Opportunities', agency: 'What can I do today?' },
    idleYear: 'click a year above ↑',
    idleInsights: 'Choose a year to see the main themes.',
    idleAgency: 'Choose a year to see age- and context-specific guidance.',
    idleCategory: 'Category active.',
    bannerWebBorn: 'The web has existed since you were born.',
    bannerWebAge: (n) => `The web has existed since you were ${n} years old.`,
    banner: (age, pct, web) => `You are ${age} years old. You have lived ${pct}% of your life. ${web}`,
    stats: {
      screen: { label: 'Screen time', desc: 'hrs/day/person', trend: { bad: '↑ critical', ok: '↑ concerning', good: '→ normal' } },
      friends: { label: 'Friendships', desc: 'Close friendships / person (Western societies)', trend: { bad: '↓ loneliness crisis', ok: '↓ declining', good: '→ stable' } },
      freiheit: { label: 'Freedom', desc: '% free societies worldwide', trend: { bad: '↓ low', ok: '→ moderate', good: '↑ relatively high', base: '→ baseline stored' } },
      bmi: { label: 'BMI', desc: 'Avg. BMI worldwide', trend: { bad: '↑ obesity', ok: '↑ overweight normal', good: '→ normal range' } },
      polar: { label: 'Polarisation', desc: '% media polarisation incl. social media worldwide', trend: { bad: '↑ historic high', ok: '↑ rising', good: '→ moderate' } },
    },
    futureYear: (y) => `${y} — Future`,
    ageLived: 'Years lived',
    agePct: 'Of your life',
    ageRemain: 'Remaining',
    statBase: 'Baseline',
  },
};

let LIFE_YEARS = {};
let LIFE_YEARS_RAW = {};

const ERA_DEF = {
  PRE:    { cls:'sq-pre',    tag:'#e2dfd7', tagFg:'#5a5a54' },
  EARLY:  { cls:'sq-early',  tag:'#ceeac4', tagFg:'#1a5a2a' },
  SOCIAL: { cls:'sq-social', tag:'#fde6c0', tagFg:'#7a3a08' },
  CRISIS: { cls:'sq-crisis', tag:'#fad4cc', tagFg:'#8a1a0a' },
  NOW:    { cls:'sq-now',    tag:'#1a1a18', tagFg:'#f0eee6' },
  FUTURE: { cls:'sq-future', tag:'#dddbd3', tagFg:'#6a6a60' },
};

function getLang() {
  return document.body.classList.contains('en') || document.documentElement.lang === 'en' ? 'en' : 'de';
}

function copy() {
  return FC_COPY[getLang()] || FC_COPY.de;
}

function eraLabel(key) {
  return copy().era[key] || FC_COPY.de.era[key];
}

function era(y) {
  if (y < 1991) return 'PRE';
  if (y < 2004) return 'EARLY';
  if (y < 2016) return 'SOCIAL';
  if (y < 2023) return 'CRISIS';
  if (y <= NOW)  return 'NOW';
  return 'FUTURE';
}

function lerpRgb(a, b, t) {
  const u = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * u),
    Math.round(a[1] + (b[1] - a[1]) * u),
    Math.round(a[2] + (b[2] - a[2]) * u),
  ];
}

function rgbCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function textOnRgb(rgb) {
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return lum > 0.58 ? '#1a1a18' : '#f0eee6';
}

const COLOR_FROM_YEAR = 1969;

/** Ab 1969: Gold → dunkles Gold (2022) → Rotorange (ab 2023). Davor: weiß. */
function squareColors(year) {
  const goldLight = [248, 236, 196];
  const goldMid = [214, 178, 102];
  const goldDark = [118, 82, 32];
  const redOrange = [198, 78, 48];

  if (year < COLOR_FROM_YEAR) {
    return { bg: '#ffffff', fg: '#1a1a18' };
  }
  if (year > NOW) {
    const c = lerpRgb(redOrange, [232, 210, 190], Math.min(1, (year - NOW) / 24));
    return { bg: rgbCss(c), fg: textOnRgb(c) };
  }
  if (year < 1991) {
    const t = (year - COLOR_FROM_YEAR) / (1990 - COLOR_FROM_YEAR);
    const c = lerpRgb(goldLight, goldMid, t);
    return { bg: rgbCss(c), fg: textOnRgb(c) };
  }
  if (year <= 2022) {
    const t = (year - 1991) / (2022 - 1991);
    const c = lerpRgb(goldMid, goldDark, t);
    return { bg: rgbCss(c), fg: textOnRgb(c) };
  }
  const t = (year - 2023) / (Math.max(NOW, 2023) - 2023);
  const c = lerpRgb(goldDark, redOrange, t);
  return { bg: rgbCss(c), fg: textOnRgb(c) };
}

function parseScreenTime(val) {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (!val) return 0;
  const m = String(val).replace(',', '.').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function normalizeGlobalArray(global) {
  const arr = Array.isArray(global) ? [...global] : [];
  while (arr.length < GLOBAL_KEYS.length) arr.push('');
  return arr.slice(0, GLOBAL_KEYS.length);
}

function localizedYearRec(rec, lang) {
  if (lang !== 'en' || !rec?.en) return rec;
  const en = rec.en;
  return {
    jahr: rec.jahr,
    label: en.label || rec.label,
    ueberschrift: en.ueberschrift || rec.ueberschrift,
    welt: { ...rec.welt, ...en.welt },
    gesellschaft: {
      text: en.gesellschaft?.text || rec.gesellschaft?.text,
      metriken: rec.gesellschaft?.metriken || en.gesellschaft?.metriken || {},
    },
    chancen: { ...rec.chancen, ...en.chancen },
    was_tun: en.was_tun || rec.was_tun,
  };
}

function mapYearRecord(rec, lang) {
  const src = localizedYearRec(rec, lang);
  const m = src.gesellschaft?.metriken || {};
  const w = src.welt || {};
  const c = src.chancen || {};
  const pos = CHANCEN_KEYS.map((key) => c[key] || '').filter(Boolean);
  return {
    event: src.ueberschrift || '',
    sub: src.label || '',
    eraLabel: src.label || null,
    screen: parseScreenTime(m.screentime_std_tag),
    friends: m.freundschaften ?? 0,
    freiheit: m.freiheit_pct ?? null,
    bmi: m.bmi_weltweit ?? 0,
    polar: m.polarisierung_pct ?? 0,
    neg: src.gesellschaft?.text ? [src.gesellschaft.text] : [],
    pos: pos.length ? pos : CHANCEN_KEYS.map((key) => c[key] || ''),
    global: GLOBAL_KEYS.map((key) => w[key] || ''),
    agency: src.was_tun
      ? { jung: src.was_tun.jung || '', aelter: src.was_tun.aelter || '' }
      : null,
  };
}


function agencyText(d, year) {
  if (!d?.agency) return '';
  if (d.agency.intro) return d.agency.intro;
  const age = year - birthYear;
  if (age < 50 && d.agency.jung) return d.agency.jung;
  if (d.agency.aelter) return d.agency.aelter;
  return d.agency.jung || '';
}

function renderGlobalBlocks(container, globalTexts, placeholder) {
  if (!container) return;
  const texts = normalizeGlobalArray(globalTexts);
  const regions = copy().globalRegions;
  container.innerHTML = regions.map(
    (region, i) => `
    <div class="global-block">
      <div class="global-region">${region}</div>
      <div class="global-text">${texts[i] || placeholder || ''}</div>
    </div>`
  ).join('');
}

function rebuildLifeYearsIndex() {
  const lang = getLang();
  LIFE_YEARS = {};
  Object.entries(LIFE_YEARS_RAW).forEach(([key, rec]) => {
    const year = typeof rec.jahr === 'number' ? rec.jahr : parseInt(key, 10);
    if (!Number.isNaN(year)) LIFE_YEARS[year] = mapYearRecord(rec, lang);
  });
}

function ingestLifeYearsPayload(payload) {
  const years = payload?.years || payload;
  if (!years || typeof years !== 'object') return false;
  LIFE_YEARS_RAW = {};
  Object.entries(years).forEach(([key, rec]) => {
    const year = typeof rec.jahr === 'number' ? rec.jahr : parseInt(key, 10);
    if (!Number.isNaN(year)) LIFE_YEARS_RAW[year] = rec;
  });
  rebuildLifeYearsIndex();
  return Object.keys(LIFE_YEARS).length > 0;
}

async function loadLifeYears() {
  if (window.__FC_LIFE_YEARS__ && ingestLifeYearsPayload(window.__FC_LIFE_YEARS__)) return;

  try {
    const res = await fetch(new URL(LIFE_YEARS_DATA_URL, window.location.href).href);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!ingestLifeYearsPayload(payload)) throw new Error('empty payload');
  } catch (err) {
    LIFE_YEARS = {};
    console.error('[fc-life-squares] Jahresdaten nicht geladen — data/life-years.js einbinden oder data/life-years.json bereitstellen.', err);
  }
}

function setPanelOpen(open) {
  const panel = document.getElementById('panel');
  const placeholder = document.getElementById('panelPlaceholder');
  if (panel) panel.classList.toggle('visible', open);
  if (placeholder) placeholder.classList.toggle('is-hidden', open);
}

function buildStatsHtml(d) {
  const c = copy();
  const s = c.stats;
  const rows = [
    { ...s.screen, val: `${d.screen}h`, cls: d.screen > 20 ? 'bad' : d.screen > 10 ? 'ok' : 'good', tr: d.screen > 20 ? s.screen.trend.bad : d.screen > 10 ? s.screen.trend.ok : s.screen.trend.good },
    { ...s.friends, val: d.friends, cls: d.friends < 5 ? 'bad' : d.friends < 9 ? 'ok' : 'good', tr: d.friends < 5 ? s.friends.trend.bad : d.friends < 9 ? s.friends.trend.ok : s.friends.trend.good },
    { ...s.freiheit, val: d.freiheit != null ? `${d.freiheit}%` : '—', cls: d.freiheit != null && d.freiheit < 30 ? 'bad' : d.freiheit != null && d.freiheit < 45 ? 'ok' : 'good', tr: d.freiheit != null ? (d.freiheit < 30 ? s.freiheit.trend.bad : d.freiheit < 45 ? s.freiheit.trend.ok : s.freiheit.trend.good) : s.freiheit.trend.base },
    { ...s.bmi, val: d.bmi, cls: d.bmi > 29 ? 'bad' : d.bmi > 27 ? 'ok' : 'good', tr: d.bmi > 29 ? s.bmi.trend.bad : d.bmi > 27 ? s.bmi.trend.ok : s.bmi.trend.good },
    { ...s.polar, val: `${d.polar}%`, cls: d.polar > 65 ? 'bad' : d.polar > 45 ? 'ok' : 'good', tr: d.polar > 65 ? s.polar.trend.bad : d.polar > 45 ? s.polar.trend.ok : s.polar.trend.good },
  ];
  return rows.map((r) => `
    <div class="stat-cell">
      <div class="stat-label">${r.label}</div>
      <div class="stat-val">${r.val}</div>
      <div class="stat-desc">${r.desc}</div>
      <div class="stat-trend ${r.cls}">${r.tr}</div>
    </div>`).join('');
}

function renderIdlePanel() {
  const yearEl = document.getElementById('pYear');
  const eraEl = document.getElementById('pEra');
  const eventEl = document.getElementById('pEvent');
  const tabsEl = document.getElementById('panelTabs');
  if (!yearEl || !tabsEl) return;
  const c = copy();

  yearEl.textContent = c.idleYear;
  yearEl.classList.add('panel-year--hint');
  if (eraEl) eraEl.style.display = 'none';
  if (eventEl) eventEl.style.display = 'none';

  const tabs = [
    { id: 'global', label: c.tabs.global },
    { id: 'society', label: c.tabs.society },
    { id: 'pos', label: c.tabs.pos },
    { id: 'agency', label: c.tabs.agency },
  ];
  tabsEl.innerHTML = tabs
    .map(
      (t) =>
        `<button class="ptab${t.id === activeTab ? ' active' : ''}" onclick="switchTab('${t.id}')">${t.label}</button>`
    )
    .join('');

  const s = c.stats;
  document.getElementById('pStats').innerHTML = [s.screen, s.friends, s.freiheit, s.bmi, s.polar].map((st) => `
    <div class="stat-cell"><div class="stat-label">${st.label}</div><div class="stat-val">—</div><div class="stat-desc">${st.desc}</div><div class="stat-trend">${c.statBase}</div></div>`).join('');
  document.getElementById('pInsights').innerHTML =
    `<div class="insight-flow"><div class="insight-text">${c.idleInsights}</div></div>`;
  document.getElementById('pPos').innerHTML = c.posTitles.map((title, i) => `
    <div class="pos-block"><div class="pos-head"><span class="pos-icon">${POS_ICONS[i]}</span><span class="pos-title">${title}</span></div><div class="pos-text">${c.idleCategory}</div></div>`).join('');
  document.getElementById('pGlobal').innerHTML = c.globalRegions.map(
    (region) =>
      `<div class="global-block"><div class="global-region">${region}</div><div class="global-text">${c.idleCategory}</div></div>`
  ).join('');
  document.getElementById('pAgencyIntro').innerHTML = c.idleAgency;

  switchTab(activeTab);
  setPanelOpen(true);
}

// Jahr-Daten: data/life-years.json (siehe scripts/build-life-years.mjs)


// ═══════════════════════════════════════════════════════════
// INTERPOLATION HELPER
// ═══════════════════════════════════════════════════════════
// Call getData(year) for any year 1950–2050.
// Returns exact data if available, interpolated otherwise.

function getData(year) {
  if (LIFE_YEARS[year]) return LIFE_YEARS[year];

  const keys = Object.keys(LIFE_YEARS).map(Number).sort((a, b) => a - b);
  if (!keys.length) {
    return {
      event: String(year),
      sub: '',
      eraLabel: null,
      screen: 0,
      friends: 0,
      freiheit: null,
      bmi: 0,
      polar: 0,
      neg: [],
      pos: ['', '', '', ''],
      global: ['', '', '', '', '', ''],
      agency: null,
    };
  }

  let lo = keys[0];
  let hi = keys[keys.length - 1];
  for (const k of keys) { if (k <= year) lo = k; }
  for (const k of [...keys].reverse()) { if (k >= year) hi = k; }
  if (lo === hi) return LIFE_YEARS[lo];

  const t = (year - lo) / (hi - lo);
  const L = LIFE_YEARS[lo];
  const H = LIFE_YEARS[hi];
  const lerp = (a, b) => Math.round((a + (b - a) * t) * 10) / 10;

  return {
    event: year >= NOW ? copy().futureYear(year) : String(year),
    sub: L.sub || '',
    eraLabel: L.eraLabel || H.eraLabel,
    screen: lerp(L.screen, H.screen),
    friends: lerp(L.friends, H.friends),
    freiheit:
      L.freiheit != null && H.freiheit != null
        ? lerp(L.freiheit, H.freiheit)
        : (L.freiheit ?? H.freiheit),
    bmi: lerp(L.bmi, H.bmi),
    polar: lerp(L.polar, H.polar),
    neg: L.neg,
    pos: L.pos,
    global: L.global,
    agency: year >= AGENCY_FROM_YEAR ? (H.agency || L.agency) : null,
  };
}

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
let birthYear = 1995;
let activeSq = null;
let mode = 'neg'; // neg | pos | global
let activeTab = 'society';

// ═══════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════
async function init() {
  const sel = document.getElementById('birthSel');
  if (!sel) return;
  for (let y = MIN_BIRTH_YEAR; y <= 1995; y++) {
    const o=document.createElement('option');
    o.value=y; o.textContent=y;
    if (y === 1995) o.selected = true;
    sel.appendChild(o);
  }
  await loadLifeYears();
  rebuild();
  renderIdlePanel();
}

function modeToTab(m) {
  return m === 'neg' ? 'society' : m === 'pos' ? 'pos' : 'global';
}

function tabToMode(id) {
  if (id === 'society') return 'neg';
  if (id === 'pos') return 'pos';
  if (id === 'global') return 'global';
  return mode;
}

function syncModeToggle() {
  document.querySelectorAll('#modeToggle .toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
}

function setMode(m, btn) {
  mode = m;
  activeTab = modeToTab(m);
  document.querySelectorAll('#modeToggle .toggle-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (activeSq) {
    const year = parseInt(activeSq.dataset.year);
    renderPanel(year, activeSq);
  }
}

function rebuild() {
  birthYear = Math.max(MIN_BIRTH_YEAR, parseInt(document.getElementById('birthSel').value, 10));
  renderBanner();
  renderGrid();
  closePanel();
}

function renderBanner() {
  const c = copy();
  const age = NOW - birthYear;
  const pct = Math.round(age/SPAN*100);
  const webSentence = birthYear >= 1991
    ? c.bannerWebBorn
    : c.bannerWebAge(1991 - birthYear);
  document.getElementById('bannerTxt').textContent = c.banner(age, pct, webSentence);
  document.getElementById('bannerNums').innerHTML = `
    <div class="age-stat"><div class="age-stat-val">${age}</div><div class="age-stat-label">${c.ageLived}</div></div>
    <div class="age-stat"><div class="age-stat-val">${pct}%</div><div class="age-stat-label">${c.agePct}</div></div>
    <div class="age-stat"><div class="age-stat-val">${SPAN-age}</div><div class="age-stat-label">${c.ageRemain}</div></div>
  `;
}

function renderGrid() {
  const g = document.getElementById('grid');
  g.innerHTML = '';
  for (let age = 0; age < SPAN; age++) {
    const year = birthYear + age;
    const colors = squareColors(year);
    const div = document.createElement('div');
    div.className = `sq sq--gradient ${year > NOW ? 'sq-future' : 'sq-lived'}`;
    div.dataset.year = year;
    div.style.background = colors.bg;
    div.style.color = colors.fg;
    div.innerHTML = `<span class="sq-year">${year}</span>`;
    div.addEventListener('click', () => {
      activeSq = div;
      renderPanel(year, div);
    });
    g.appendChild(div);
  }
}

function renderPanel(year, sqEl) {
  activeTab = 'society';
  mode = 'neg';
  syncModeToggle();

  document.querySelectorAll('.sq').forEach(s=>s.classList.remove('active'));
  sqEl.classList.add('active');
  activeSq=sqEl;

  const d = getData(year);
  const e = ERA_DEF[era(year)];
  const sqColors = squareColors(year);
  const c = copy();

  // header
  document.getElementById('pYear').classList.remove('panel-year--hint');
  document.getElementById('pYear').textContent=year;
  const etag=document.getElementById('pEra');
  etag.style.display = 'inline-block';
  etag.textContent = d.eraLabel || eraLabel(era(year));
  etag.style.background = sqColors.bg;
  etag.style.color = sqColors.fg;
  document.getElementById('pEvent').textContent=d.event;
  document.getElementById('pEvent').style.display = 'block';

  // build tabs
  const tabsEl = document.getElementById('panelTabs');
  const tabs = [
    {id:'global',   label: c.tabs.global},
    {id:'society',  label: c.tabs.society},
    {id:'pos',      label: c.tabs.pos},
  ];
  if (year >= AGENCY_FROM_YEAR && d.agency && (d.agency.jung || d.agency.aelter || d.agency.intro)) {
    tabs.push({id:'agency', label: c.tabs.agency});
  }

  tabsEl.innerHTML = tabs.map(t=>
    `<button class="ptab${t.id===activeTab?' active':''}" onclick="switchTab('${t.id}')">${t.label}</button>`
  ).join('');

  // ensure valid activeTab
  if (year >= AGENCY_FROM_YEAR && d.agency && activeTab==='agency') {/* ok */}
  else if (year < AGENCY_FROM_YEAR && activeTab==='agency') activeTab='society';

  document.getElementById('pStats').innerHTML = buildStatsHtml(d);

  // society top text (plain flow, no tiles/dividers/clickers)
  const insights = (d.neg || []).filter(Boolean);
  document.getElementById('pInsights').innerHTML = insights.length
    ? `<div class="insight-flow"><div class="insight-text">${insights.join(' ')}</div></div>`
    : '';

  // positive
  document.getElementById('pPos').innerHTML=(d.pos||[]).map((txt,i)=>`
    <div class="pos-block">
      <div class="pos-head"><span class="pos-icon">${POS_ICONS[i]||'✦'}</span><span class="pos-title">${c.posTitles[i]||''}</span></div>
      <div class="pos-text">${txt || '—'}</div>
    </div>`).join('');

  renderGlobalBlocks(document.getElementById('pGlobal'), d.global, c.idleCategory);

  if (d.agency) {
    document.getElementById('pAgencyIntro').innerHTML = agencyText(d, year);
  }

  // show correct tab
  switchTab(activeTab);

  setPanelOpen(true);
  setTimeout(() => document.getElementById('panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
}

function switchTab(id) {
  activeTab = id;
  if (id === 'society' || id === 'pos' || id === 'global') {
    mode = tabToMode(id);
    syncModeToggle();
  }
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById(`tab-${id}`);
  if(el) el.classList.add('active');
  document.querySelectorAll('.ptab').forEach(b=>{
    if(b.getAttribute('onclick')===`switchTab('${id}')`) b.classList.add('active');
  });
}

function closePanel() {
  document.querySelectorAll('.sq').forEach((s) => s.classList.remove('active'));
  activeSq = null;
  activeTab = 'global';
  renderIdlePanel();
}

function onLangChange() {
  rebuildLifeYearsIndex();
  renderBanner();
  if (activeSq) {
    renderPanel(parseInt(activeSq.dataset.year, 10), activeSq);
  } else {
    renderIdlePanel();
  }
}

document.addEventListener('fc-lang-change', onLangChange);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}