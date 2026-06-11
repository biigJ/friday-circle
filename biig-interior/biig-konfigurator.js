(function() {
'use strict';

const BK_TOTAL = 9;
const bkSt = {
  track:[], size:'', qmIn:0, qmOut:0, aussen:'',
  ziele:[], feel:'', stoert:'',
  ord_fokus:[], ord_aufraumen:'',
  arr_fokus:'', neuan:'', stauraum_typ:'',
  aii_phase:'', aufmass:null, struktur_eingriff:'', handwerker_status:'',
  nutzer:'', funktionen:[], kochen:'', smarthome:'',
  stil:'', mat:[], nogo:'', gesetzt:'', koord:[],
  ql:1, hon_typ:'', cr:1, kv:'', aend:'',
  dl_typ:'', dl_text:'', bewohnt:'', komm:'',
  kostenrahmen:'', note:''
};
window.bkSt = bkSt;

function bkQL(v) {
  return { 1: bkT('ql.standard'), 2: bkT('ql.gehoben'), 3: bkT('ql.premium') }[v] || '';
}
function bkCR(v) {
  return { 1: bkT('cr.1'), 2: bkT('cr.2'), 3: bkT('cr.3'), 4: bkT('cr.4') }[v] || '';
}
function bkSL(k) {
  return bkT('size.' + k);
}
const BK_BKI = {1:550, 2:850, 3:1500};
/** Außen-BKI je m² als Anteil der Innen-BKI (gleicher Faktor wie Baukosten-Orientierung). */
const BK_BKI_OUTDOOR = 0.28;

function bkQmOutHon(qmOut) {
  return qmOut > 0 ? qmOut * BK_BKI_OUTDOOR : 0;
}

function bkTracks() {
  return [
    { id:'ordnung', icon:'ti-stack-2', title: bkT('track.ordnung.title'), desc: bkT('track.ordnung.desc'), info: bkT('track.ordnung.info') },
    { id:'arrangement', icon:'ti-layout-dashboard', title: bkT('track.arrangement.title'), desc: bkT('track.arrangement.desc'), info: bkT('track.arrangement.info') },
    { id:'allinclusive', icon:'ti-building', title: bkT('track.allinclusive.title'), desc: bkT('track.allinclusive.desc'), info: bkT('track.allinclusive.info') },
  ];
}

function bkPhases() {
  return [
    { id:'konzept', steps:'①', title: bkT('phase.konzept.title'), desc: bkT('phase.konzept.desc'), info: bkT('phase.konzept.info') },
    { id:'planung_bau', steps:'①②', title: bkT('phase.planung_bau.title'), desc: bkT('phase.planung_bau.desc'), info: bkT('phase.planung_bau.info') },
    { id:'bauleitung', steps:'①②③', title: bkT('phase.bauleitung.title'), desc: bkT('phase.bauleitung.desc'), info: bkT('phase.bauleitung.info') },
    { id:'gue', steps:'①②③④', title: bkT('phase.gue.title'), desc: bkT('phase.gue.desc'), info: bkT('phase.gue.info') },
  ];
}

function bkInfoBtnHtml(label, info) {
  return `<button type="button" class="bk-info-btn" aria-label="${bkT('info.scope')} ${label}">
    <span class="bk-info__mark" aria-hidden="true">i</span>
    <span class="bk-info__tip" role="tooltip">${info}</span>
  </button>`;
}

function bkRenderStep1Tracks() {
  const el = document.getElementById('bk-step1-tracks');
  if (!el) return;
  el.innerHTML = bkTracks().map(t => {
    const sel = bkSt.track.includes(t.id);
    return `<div class="bk-opt-wrap">
      <button type="button" class="bk-opt bk-opt--track ${sel ? 'sel' : ''}" id="bk-t-${t.id}" onclick="bkToggleT('${t.id}')">
        <i class="ti ${t.icon}" aria-hidden="true"></i>
        <div><span class="bk-ot">${t.title}</span><span class="bk-os">${t.desc}</span></div>
      </button>
      ${bkInfoBtnHtml(t.title, t.info)}
    </div>`;
  }).join('');
  const b1 = document.getElementById('bk-btn1');
  if (b1) b1.disabled = bkSt.track.length === 0;
}

const BK_AUFMASS_MIN = 300;
const BK_AUFMASS_RATE = 3.5;

/** Grundhonorar Entwurf bis Umsetzung: bis 20 m² → 1.000 €, ab 20 m² → 1.500 €, ab 40 m² → 2.000 €+, darüber Skalierung ab 60 m². */
const BK_AII_BASE = {
  tier1MaxQm: 20,
  tier1Hon: 1000,
  tier2MaxQm: 40,
  tier2Hon: 1500,
  tier3Hon: 2000,
  scaleFromQm: 60,
  scaleRate: 20,
};

function bkAllinclusiveBaseInner(qm) {
  const q = Math.max(qm, 5);
  if (q <= BK_AII_BASE.tier1MaxQm) return BK_AII_BASE.tier1Hon;
  if (q < BK_AII_BASE.tier2MaxQm) return BK_AII_BASE.tier2Hon;
  if (q < BK_AII_BASE.scaleFromQm) return BK_AII_BASE.tier3Hon;
  return BK_AII_BASE.tier3Hon + (q - BK_AII_BASE.scaleFromQm) * BK_AII_BASE.scaleRate;
}

function bkAiiPhaseMult() {
  if (bkSt.aii_phase === 'bauleitung') return 1.45;
  if (bkSt.aii_phase === 'planung_bau') return 1.25;
  if (bkSt.aii_phase === 'gue') return 1.65;
  return 1;
}

function bkCalcAufmassHon(qm, qmOutHon) {
  if (bkSt.aufmass !== true) return 0;
  if (!bkSt.track.includes('arrangement') && !bkSt.track.includes('allinclusive')) return 0;
  const innen = Math.max(BK_AUFMASS_MIN, qm * BK_AUFMASS_RATE);
  const aussen = qmOutHon * BK_AUFMASS_RATE;
  let total = innen + aussen;
  if (bkSt.track.includes('allinclusive')) total *= bkAiiPhaseMult();
  return Math.round(total);
}

/** Zusätzliche Honorar-Planungsfläche aus Außen m² über Schwellenwert hinaus. */
function bkHonOutAbove(qm, qmOut, threshold, rate) {
  const qmOutHon = bkQmOutHon(qmOut);
  if (!qmOutHon) return 0;
  const inner = Math.max(qm, threshold);
  const combined = Math.max(qm + qmOutHon, threshold);
  return Math.max(0, (combined - inner) * rate);
}

function bkOrdLabels() {
  return { ideen: bkT('s4.ordnung.tag.ideen').replace(' +6%', ''), moeblierung: bkT('s4.ordnung.tag.moeblierung').replace(' +6%', ''), stauraum_sys: bkT('s4.ordnung.tag.stauraum').replace(' +6%', ''), chaos: bkT('s4.ordnung.tag.chaos').replace(' +6%', '') };
}
function bkZieleLabels() {
  return { stauraum: bkT('s3.ziele.stauraum'), ruhe: bkT('s3.ziele.ruhe'), gaeste: bkT('s3.ziele.gaeste'), homeoffice: bkT('s3.ziele.homeoffice'), kinder: bkT('s3.ziele.kinder'), aesthetik: bkT('s3.ziele.aesthetik'), fluss: bkT('s3.ziele.fluss'), licht: bkT('s3.ziele.licht'), kueche: bkT('s3.ziele.kueche').replace(' +12%', ''), bad: bkT('s3.ziele.bad').replace(' +10%', '') };
}
function bkFunkLabels() {
  return { kinder_b: bkT('s5.funk.kinder_b'), eltern: bkT('s5.funk.eltern'), gaestezimmer: bkT('s5.funk.gaestezimmer'), homeoffice_f: bkT('s5.funk.homeoffice_f').replace(' +8%', ''), fitness: bkT('s5.funk.fitness').replace(' +8%', ''), hauswirtschaft: bkT('s5.funk.hauswirtschaft') };
}
function bkMatLabels() {
  return { holz_hell: bkT('s6.mat.holz_hell'), holz_dunkel: bkT('s6.mat.holz_dunkel'), naturstein: bkT('s6.mat.naturstein'), marmor: bkT('s6.mat.marmor'), metall: bkT('s6.mat.metall'), beton: bkT('s6.mat.beton'), textil: bkT('s6.mat.textil'), farbe: bkT('s6.mat.farbe') };
}
function bkKoordLabels() {
  return { kueche_koord: bkT('s6.koord.kueche').replace(' +8%', ''), moebel: bkT('s6.koord.moebel').replace(' +6%', ''), kunst: bkT('s6.koord.kunst').replace(' +4%', ''), licht_koord: bkT('s6.koord.licht').replace(' +5%', ''), textil_koord: bkT('s6.koord.textil').replace(' +4%', ''), bauleitung_koord: bkT('s6.koord.bau').replace(' +15%', '') };
}
const BK_SIZE_BG = {
  kl_zimmer: '../assets/interior/oase-neopainting.png',
  gr_zimmer: '../assets/interior/blauesgemälde.png',
  teile: '../assets/interior/table_bronce.png',
  etage: '../assets/interior/dieffe33-vombett.png',
  haus: '../assets/interior/rene-möbliert-01.png?v=2',
  haus_garten: '../assets/interior/Neubauhaus.png',
};

function bkSetHeaderBg(sizeKey) {
  const bg = document.getElementById('bk-form-header-bg');
  if (!bg) return;
  const src = BK_SIZE_BG[sizeKey];
  bg.style.backgroundImage = src ? 'url("' + src + '")' : '';
}

window.biScrollSpaceAnpassen = function() {
  const target = document.getElementById('bi-space-anpassen');
  const nav = document.querySelector('.bi-nav');
  if (!target) return;
  const navH = nav ? nav.getBoundingClientRect().height : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - navH + 140;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
};

window.bkStartWithTrack = function(trackId) {
  if (!['ordnung', 'arrangement', 'allinclusive'].includes(trackId)) return;
  bkReleaseQuizScrollLock();
  bkSt.track = [trackId];
  bkRenderStep1Tracks();
  if (bkIsMobileQuizViewport()) {
    bkGoTo(1);
    window.setTimeout(bkSnapQuizToFormTop, 500);
    window.setTimeout(bkSnapQuizToFormTop, 900);
    window.setTimeout(bkSnapQuizToFormTop, 1300);
    return false;
  }
  bkGoTo(2);
  return false;
};

let bkQuizScrollLockTop = null;
let bkQuizScrollLockSettling = false;
let bkQuizScrollLockTimer = 0;
let bkQuizScrollLockListenersBound = false;

function bkIsMobileQuizViewport() {
  return window.matchMedia('(max-width: 520px)').matches;
}

function bkGetFormTop() {
  const form = document.querySelector('#biig-konfigurator .bk-form');
  if (!form) return 0;
  const root = document.scrollingElement || document.documentElement;
  const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
  return Math.min(maxScroll, Math.max(0, Math.round(form.getBoundingClientRect().top + window.scrollY)));
}

function bkReleaseQuizScrollLock() {
  bkQuizScrollLockTop = null;
  bkQuizScrollLockSettling = false;
  if (bkQuizScrollLockTimer) window.clearTimeout(bkQuizScrollLockTimer);
  bkQuizScrollLockTimer = 0;
}

function bkApplyQuizScrollLock() {
  if (bkQuizScrollLockTop === null || bkQuizScrollLockSettling) return;
  if (window.scrollY < bkQuizScrollLockTop - 1) {
    window.scrollTo({ top: bkQuizScrollLockTop, behavior: 'auto' });
  }
}

function bkForceQuizScrollLock() {
  if (bkQuizScrollLockTop === null) return;
  window.scrollTo({ top: bkQuizScrollLockTop, behavior: 'auto' });
}

function bkSnapQuizToFormTop() {
  if (!bkIsMobileQuizViewport() || !document.body.classList.contains('bk-quiz-active')) return;
  bkQuizScrollLockTop = bkGetFormTop();
  bkQuizScrollLockSettling = false;
  bkForceQuizScrollLock();
}

function bkLockQuizToFormTop() {
  if (!bkIsMobileQuizViewport()) {
    bkReleaseQuizScrollLock();
    return;
  }
  const top = bkGetFormTop();
  bkQuizScrollLockTop = top;
  bkQuizScrollLockSettling = true;
  window.scrollTo({ top: top, behavior: 'smooth' });
  if (bkQuizScrollLockTimer) window.clearTimeout(bkQuizScrollLockTimer);
  bkQuizScrollLockTimer = window.setTimeout(function() {
    bkQuizScrollLockSettling = false;
    bkApplyQuizScrollLock();
  }, 1100);
}

function bkBindQuizScrollLock() {
  if (bkQuizScrollLockListenersBound) return;
  bkQuizScrollLockListenersBound = true;
  window.addEventListener('scroll', bkApplyQuizScrollLock, { passive: true });
  window.addEventListener('resize', function() {
    if (!bkIsMobileQuizViewport()) {
      bkReleaseQuizScrollLock();
      return;
    }
    if (bkQuizScrollLockTop !== null) bkQuizScrollLockTop = bkGetFormTop();
    bkApplyQuizScrollLock();
  });
}

function bkScrollToPageBottom() {
  const root = document.scrollingElement || document.documentElement;
  const getBottom = function() {
    const maxH = Math.max(root.scrollHeight, document.body ? document.body.scrollHeight : 0);
    return Math.max(0, maxH - window.innerHeight);
  };
  const scroll = function(behavior) {
    window.scrollTo({ top: getBottom(), behavior: behavior });
  };
  requestAnimationFrame(function() {
    scroll('smooth');
    window.setTimeout(function() { scroll('auto'); }, 450);
    window.setTimeout(function() { scroll('auto'); }, 900);
  });
}

window.bkGoTo = function(n) {
  document.querySelectorAll('.bk-step').forEach(s => s.classList.remove('active'));
  const el = n === 99 ? document.getElementById('bk-step-done') : document.getElementById('bk-step' + n);
  if (el) el.classList.add('active');
  document.body.classList.toggle('bk-quiz-active', n >= 1 && n !== 99);
  if (n === 0 || n === 99) bkReleaseQuizScrollLock();
  if (n === 1) bkRenderStep1Tracks();
  if (n === 4) bkRenderS4();
  if (n === 5) bkUpdateStep5();
  if (n === 7) { bkSyncSlOpts('ql', bkSt.ql); bkSyncSlOpts('cr', bkSt.cr); }
  if (n === 9) bkRenderFinalSummary();
  if (bkSt.size) bkSetHeaderBg(bkSt.size);
  bkUpdateCart();
  bkUpdateNavButtons();
  bkUpdateDots(n);
  const sec = document.getElementById('biig-konfigurator');
  if (n === 0) {
    bkScrollToPageBottom();
  }
  else if (n >= 1 && n !== 99 && bkIsMobileQuizViewport()) bkLockQuizToFormTop();
  else if (sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
};

window.bkToggleT = function(t) {
  const i = bkSt.track.indexOf(t);
  if (i > -1) bkSt.track.splice(i, 1);
  else bkSt.track.push(t);
  bkRenderStep1Tracks();
  bkUpdateCart();
};

window.bkPickSize = function(s, qm) {
  bkSt.size = s; bkSt.qmIn = qm;
  document.querySelectorAll('#bk-size-opts .bk-opt').forEach(o => o.classList.remove('sel'));
  event.currentTarget.classList.add('sel');
  const wrap = document.getElementById('bk-qm-wrap');
  if (wrap) wrap.style.display = 'block';
  const qi = document.getElementById('bk-qm-in');
  if (qi) qi.value = qm;
  const b2 = document.getElementById('bk-btn2');
  if (b2) b2.disabled = false;
  const hasOut = ['terrasse','dachterrasse'].includes(bkSt.aussen);
  const qor = document.getElementById('bk-qm-out-row');
  if (qor) qor.style.display = hasOut ? 'block' : 'none';
  bkSetHeaderBg(s);
  bkUpdateStep5();
  bkUpdateCart();
};

window.bkUpdQm = function(type, v) {
  if (type === 'in') bkSt.qmIn = Math.max(1, v) || bkSt.qmIn;
  else bkSt.qmOut = v || 0;
  bkUpdateCart();
};

window.bkPickOpt = function(key, val, btn) {
  bkSt[key] = val;
  const parent = btn.closest('.bk-opts');
  if (parent) parent.querySelectorAll('.bk-opt').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  if (key === 'aussen') {
    const hasOut = ['terrasse','dachterrasse'].includes(val);
    const r = document.getElementById('bk-qm-out-row');
    if (r) r.style.display = hasOut ? 'block' : 'none';
  }
  bkUpdateCart();
  bkUpdateNavButtons();
};

window.bkToggleTag = function(btn) {
  const k = btn.dataset.k, v = btn.dataset.v;
  if (!bkSt[k]) bkSt[k] = [];
  const i = bkSt[k].indexOf(v);
  if (i > -1) { bkSt[k].splice(i, 1); btn.classList.remove('sel'); }
  else { bkSt[k].push(v); btn.classList.add('sel'); }
  if (k === 'koord') bkUpdateKoordNote();
  bkUpdateCart();
  bkUpdateNavButtons();
};

function bkSyncSlOpts(key, val) {
  document.querySelectorAll('.bk-sl-ends[data-bk-sl="' + key + '"] .bk-sl-opt').forEach(btn => {
    btn.classList.toggle('sel', +btn.dataset.v === val);
  });
}

window.bkPickSl = function(key, val) {
  const input = document.getElementById(key === 'ql' ? 'bk-sl-ql' : 'bk-sl-cr');
  if (input) input.value = val;
  if (key === 'ql') bkUpdQl(val);
  else bkUpdCr(val);
};

window.bkUpdQl = function(v) {
  bkSt.ql = v;
  const el = document.getElementById('bk-ql-val');
  if (el) el.textContent = bkQL(v);
  bkSyncSlOpts('ql', v);
  bkUpdateCart();
};

window.bkUpdCr = function(v) {
  bkSt.cr = v;
  const el = document.getElementById('bk-cr-val');
  if (el) el.textContent = bkCR(v);
  bkSyncSlOpts('cr', v);
  bkUpdateCart();
};

window.bkPickAufmass = function(val, btn) {
  bkSt.aufmass = val;
  if (btn) {
    const parent = btn.closest('.bk-opts');
    if (parent) parent.querySelectorAll('.bk-opt').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
  }
  bkUpdateCart();
  bkUpdateNavButtons();
};

function bkUpdateKoordNote() {
  const el = document.getElementById('bk-koord-note');
  if (!el) return;
  const msgs = [];
  if ((bkSt.koord||[]).includes('kueche_koord') && (bkSt.ziele||[]).includes('kueche'))
    msgs.push(bkT('koord.note.kueche'));
  if ((bkSt.koord||[]).includes('bauleitung_koord') && bkSt.track.includes('allinclusive') && bkSt.aii_phase === 'bauleitung')
    msgs.push(bkT('koord.note.bau'));
  el.style.display = msgs.length ? 'block' : 'none';
  el.textContent = msgs.join(' ');
}

function bkStep4Valid() {
  const tr = bkSt.track;
  if (!tr.length) return false;
  if (tr.includes('ordnung') && !bkSt.ord_aufraumen) return false;
  if (tr.includes('arrangement') && !['leer', 'bestand', 'misch'].includes(bkSt.arr_fokus)) return false;
  if (tr.includes('allinclusive')) {
    if (!bkSt.aii_phase || !bkSt.struktur_eingriff || !bkSt.handwerker_status) return false;
  }
  if (tr.includes('arrangement') || tr.includes('allinclusive')) {
    if (bkSt.aufmass === null) return false;
  }
  return true;
}

function bkStep5ShowsKochen() {
  return true;
}

function bkStep5ShowsFunktionen() {
  return !['kl_zimmer', 'gr_zimmer'].includes(bkSt.size);
}

function bkUpdateStep5() {
  const funkEl = document.getElementById('bk-s5-funktionen');
  const kochenEl = document.getElementById('bk-s5-kochen');
  const showFunk = bkStep5ShowsFunktionen();
  const showKochen = bkStep5ShowsKochen();
  if (funkEl) funkEl.hidden = !showFunk;
  if (kochenEl) kochenEl.hidden = !showKochen;
  if (!showFunk) bkSt.funktionen = [];
  if (!showKochen) {
    bkSt.kochen = '';
    if (kochenEl) kochenEl.querySelectorAll('.bk-opt').forEach(b => b.classList.remove('sel'));
  }
  if (!showFunk) {
    const tags = funkEl && funkEl.querySelectorAll('.bk-tag');
    if (tags) tags.forEach(b => b.classList.remove('sel'));
  }
  bkUpdateNavButtons();
}

function bkStep5Valid() {
  return !!bkSt.smarthome;
}

function bkStep7Valid() {
  return !!bkSt.hon_typ && !!bkSt.kv && !!bkSt.aend;
}

function bkStep8Valid() {
  if (!bkSt.dl_typ || !bkSt.bewohnt || !bkSt.komm) return false;
  if (bkSt.dl_typ === 'weich' && !String(bkSt.dl_text || '').trim()) return false;
  return true;
}

function bkCalcPrice() {
  if (!bkSt.track.length || !bkSt.size) return {honLow:0, honHigh:0, bauLow:0, bauHigh:0, honItems:[], aufItems:[], bauItems:[], honorarOpen:true};
  const qm = Math.max(bkSt.qmIn || 10, 5);
  const qmOut = bkSt.qmOut || 0;
  const qmOutHon = bkQmOutHon(qmOut);
  const honItems = [];
  let base = 0;
  let honOutTotal = 0;

  if (bkSt.track.includes('ordnung')) {
    let bInner = Math.max(200, 200 + (qm - 25) * 1.8);
    const honOut = bkHonOutAbove(qm, qmOut, 25, 1.8);
    if (bkSt.ord_aufraumen === 'ja') bInner += 150;
    const fokusMult = 1 + ((bkSt.ord_fokus||[]).length * 0.06);
    honOutTotal += honOut * fokusMult;
    honItems.push({l: bkT('cart.ordnung'), v:Math.round(bInner * fokusMult)});
    base += (bInner + honOut) * fokusMult;
  }
  if (bkSt.track.includes('arrangement')) {
    const honOut = bkHonOutAbove(qm, qmOut, 30, 4.5);
    const bInner = Math.max(450, 450 + (qm - 30) * 4.5);
    honOutTotal += honOut;
    honItems.push({l: bkT('cart.arrangement'), v:Math.round(bInner)});
    base += bInner + honOut;
  }
  if (bkSt.track.includes('allinclusive')) {
    const honOut = bkHonOutAbove(qm, qmOut, 60, 20);
    const bInner = bkAllinclusiveBaseInner(qm);
    const phaseMult = bkAiiPhaseMult();
    honOutTotal += honOut * phaseMult;
    const bTotal = (bInner + honOut) * phaseMult;
    honItems.push({l: bkT('cart.allinclusive'), v:Math.round(bInner * phaseMult)});
    base += bTotal;
  }

  const aufmassHon = bkCalcAufmassHon(qm, qmOutHon);
  if (aufmassHon > 0) {
    honItems.push({l: bkT('cart.aufmass'), v:aufmassHon});
    base += aufmassHon;
  }

  if (qmOut > 0 && honOutTotal > 0) {
    honItems.push({
      l: bkTfmt('cart.outdoor', { qm: qmOut, pct: Math.round(BK_BKI_OUTDOOR * 100) }),
      v: Math.round(honOutTotal),
    });
  }

  let multi = 1;
  const auf = [];
  const z = bkSt.ziele || [];

  if (z.includes('kueche') && z.includes('bad')) { multi += .25; auf.push('Küche+Bad +25%'); }
  else if (z.includes('kueche')) { multi += .12; auf.push('Küche +12%'); }
  else if (z.includes('bad')) { multi += .10; auf.push('Bad +10%'); }

  if (bkSt.track.includes('allinclusive')) {
    if (bkSt.struktur_eingriff === 'ja') { multi += .15; auf.push('Struktureingriff +15%'); }
    else if (bkSt.struktur_eingriff === 'unklar') { multi += .07; auf.push('Struktur unklar +7%'); }
    if (z.includes('bad')) { multi += .10; auf.push('Sanitär (Bad) +10%'); }
    if (z.includes('kueche') && !z.includes('bad')) { multi += .05; auf.push('Sanitär (Küche) +5%'); }
    const hs = bkSt.handwerker_status;
    if (hs === 'suchen') { multi += .07; auf.push('HW-Suche +7%'); }
    else if (hs === 'offen') { multi += .04; auf.push('HW-offen +4%'); }
  }

  const funk = bkSt.funktionen || [];
  if (funk.includes('homeoffice_f')) { multi += .08; auf.push('Homeoffice +8%'); }
  if (funk.includes('fitness')) { multi += .08; auf.push('Fitness +8%'); }
  if (bkSt.kochen === 'aufwendig') { multi += .10; auf.push('Aufwend. Küche +10%'); }
  if (bkSt.smarthome === 'ja') { multi += .12; auf.push('Smart Home +12%'); }
  else if (bkSt.smarthome === 'licht') { multi += .05; auf.push('Licht-Smart +5%'); }

  const koord = bkSt.koord || [];
  const kuecheSchonDrin = z.includes('kueche');
  if (koord.includes('kueche_koord') && !kuecheSchonDrin) { multi += .08; auf.push('Küchenkoord. +8%'); }
  if (koord.includes('moebel')) { multi += .06; auf.push(bkT('s6.koord.moebel')); }
  if (koord.includes('kunst')) { multi += .04; auf.push('Kunst +4%'); }
  if (koord.includes('licht_koord')) { multi += .05; auf.push('Lichtplanung +5%'); }
  if (koord.includes('textil_koord')) { multi += .04; auf.push('Textil +4%'); }
  const bauleitungSchonDrin = bkSt.track.includes('allinclusive') && bkSt.aii_phase === 'bauleitung';
  if (koord.includes('bauleitung_koord') && !bauleitungSchonDrin) { multi += .15; auf.push('Bauleitung +15%'); }

  const step7Done = bkStep7Valid();
  const step8Done = bkStep8Valid();

  const qlM = step7Done ? ([1, 1, 1.35, 1.75][bkSt.ql] || 1) : 1;
  if (step7Done && qlM > 1) auf.push(bkQL(bkSt.ql) + ' +' + Math.round((qlM - 1) * 100) + '%');
  multi *= qlM;

  const crM = step7Done ? ([1, 1, 1.15, 1.25, 3][bkSt.cr] || 1) : 1;
  if (step7Done && bkSt.cr === 4) auf.push('Änderungsschleifen unlimitiert (300%)');
  else if (step7Done && bkSt.cr === 3) auf.push('Änderungsschleifen 3× +25%');
  else if (step7Done && bkSt.cr === 2) auf.push('Änderungsschleifen 2× +15%');
  else if (step7Done && crM > 1) auf.push('Änderungsschleifen +' + Math.round((crM - 1) * 100) + '%');
  multi *= crM;

  if (step7Done && bkSt.hon_typ === 'pauschale') { multi *= 1.2; auf.push('Pauschale +20%'); }
  if (step7Done && bkSt.kv === 'monatlich') { multi += .05; auf.push('KV monatl. +5%'); }
  else if (step7Done && bkSt.kv === 'laufend') { multi += .10; auf.push('KV laufend +10%'); }
  if (step7Done && bkSt.aend === 'wenige') { multi *= 1.3; auf.push('Freigabe-Anpassung +30%'); }
  else if (step7Done && bkSt.aend === 'viele') { multi *= 2; auf.push('Freigabe-Anpassung ×2 (+100%)'); }
  if (step8Done && bkSt.dl_typ === 'hart') { multi *= 1.2; auf.push('Express +20%'); }
  if (step8Done && bkSt.bewohnt === 'ja') { multi *= 1.3; auf.push('Bewohnt +30%'); }

  const total = base * multi;
  const honLow = Math.round(total / 50) * 50;
  const honHigh = Math.round(honLow * 1.25 / 50) * 50;

  const bauItems = [];
  let bauBase = 0;
  if (bkSt.track.includes('allinclusive') || bkSt.track.includes('arrangement')) {
    const bkiM = BK_BKI[step7Done ? bkSt.ql : 1] || 550;
    const umbau = qm * bkiM;
    bauBase += umbau;
    bauItems.push({l: bkTfmt('cart.umbau', { qm: qm, ql: bkQL(bkSt.ql) }), v:Math.round(umbau)});
    if (z.includes('kueche')) { const kv = bkSt.ql===3?28000:bkSt.ql===2?14000:7000; bauBase+=kv; bauItems.push({l: bkT('cart.kitchen'), v:kv}); }
    if (z.includes('bad')) { const bv = bkSt.ql===3?20000:bkSt.ql===2?10000:4500; bauBase+=bv; bauItems.push({l: bkT('cart.bath'), v:bv}); }
    if (qmOut > 0) { const av = Math.round(qmOut * bkiM * BK_BKI_OUTDOOR); bauBase+=av; bauItems.push({l: bkTfmt('cart.outdoorBki', { qm: qmOut }), v:av}); }
  }
  const bauLow = bauBase ? Math.round(bauBase/500)*500 : 0;
  const bauHigh = bauLow ? Math.round(bauLow*1.35/500)*500 : 0;

  return {honLow, honHigh, bauLow, bauHigh, honItems, aufItems:auf, bauItems, honorarOpen:!step7Done};
}

function bkUpdateCart() {
  const {honLow, honHigh, bauLow, bauHigh, honItems, aufItems, bauItems, honorarOpen} = bkCalcPrice();
  const ctH = document.getElementById('bk-ct-hon');
  const ctB = document.getElementById('bk-ct-bau');
  const crEl = document.getElementById('bk-cart-rows');
  if (!honLow) {
    if (ctH) ctH.textContent = '-';
    if (ctB) ctB.textContent = '-';
    if (crEl) crEl.innerHTML = '';
    return;
  }
  if (ctH) {
    ctH.textContent = honorarOpen
      ? bkT('cart.from') + ' ' + bkFmtEuro(honLow)
      : bkFmtNum(honLow) + (bkGetLang() === 'en' ? ' to ' : ' bis ') + bkFmtEuro(honHigh);
  }
  if (ctB) ctB.textContent = bauLow ? bkFmtNum(bauLow) + (bkGetLang() === 'en' ? ' to ' : ' bis ') + bkFmtEuro(bauHigh) : '-';
  let html = '';
  honItems.forEach(i => html += `<div class="bk-cr"><span>${i.l}</span><b>${bkFmtEuro(i.v)}</b></div>`);
  if (aufItems.length) html += `<div class="bk-cr aufschlag" style="font-size:10px"><span style="line-height:1.6">${aufItems.join(' · ')}</span></div>`;
  if (bauItems.length) {
    html += `<div class="bk-cr" style="margin-top:3px;font-size:10px;opacity:.6"><span>${bkT('cart.bauGuide')}</span></div>`;
    bauItems.forEach(i => html += `<div class="bk-cr bau-row"><span>${i.l}</span><b>${bkFmtEuro(i.v)}</b></div>`);
  }
  if (crEl) crEl.innerHTML = html;
}

function bkRenderS4() {
  const tr = bkSt.track;
  let html = '';

  if (tr.includes('ordnung')) {
    html += `<div class="bk-sdiv">${bkT('s4.ordnung.head')}</div>
    <div class="bk-q">${bkT('s4.ordnung.q1')}<small>${bkT('s4.ordnung.q1Hint')}</small></div>
    <div class="bk-tags">
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('ideen')?'sel':''}" data-k="ord_fokus" data-v="ideen" onclick="bkToggleTag(this)">${bkT('s4.ordnung.tag.ideen')}</button>
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('moeblierung')?'sel':''}" data-k="ord_fokus" data-v="moeblierung" onclick="bkToggleTag(this)">${bkT('s4.ordnung.tag.moeblierung')}</button>
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('stauraum_sys')?'sel':''}" data-k="ord_fokus" data-v="stauraum_sys" onclick="bkToggleTag(this)">${bkT('s4.ordnung.tag.stauraum')}</button>
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('chaos')?'sel':''}" data-k="ord_fokus" data-v="chaos" onclick="bkToggleTag(this)">${bkT('s4.ordnung.tag.chaos')}</button>
    </div>
    <div class="bk-q">${bkT('s4.ordnung.q2')}</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.ord_aufraumen==='ja'?'sel':''}" onclick="bkPickOpt('ord_aufraumen','ja',this)">
        <i class="ti ti-trash" aria-hidden="true"></i>
        <div><span class="bk-ot">${bkT('s4.ordnung.aufr.ja.t')}</span><span class="bk-os">${bkT('s4.ordnung.aufr.ja.s')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.ord_aufraumen==='nein'?'sel':''}" onclick="bkPickOpt('ord_aufraumen','nein',this)">
        <i class="ti ti-check" aria-hidden="true"></i>
        <div><span class="bk-ot">${bkT('s4.ordnung.aufr.nein')}</span></div>
      </button>
    </div>`;
  }

  if (tr.includes('arrangement')) {
    html += `<div class="bk-sdiv">${bkT('s4.arr.head')}</div>
    <div class="bk-q">${bkT('s4.arr.q1')}</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.arr_fokus==='leer'?'sel':''}" onclick="bkPickOpt('arr_fokus','leer',this)">
        <i class="ti ti-box" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.arr.leer')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.arr_fokus==='bestand'?'sel':''}" onclick="bkPickOpt('arr_fokus','bestand',this)">
        <i class="ti ti-refresh" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.arr.bestand')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.arr_fokus==='misch'?'sel':''}" onclick="bkPickOpt('arr_fokus','misch',this)">
        <i class="ti ti-layers-difference" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.arr.misch')}</span></div>
      </button>
    </div>
    <div class="bk-q">${bkT('s4.arr.q2')}</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.stauraum_typ==='einbau'?'sel':''}" onclick="bkPickOpt('stauraum_typ','einbau',this)"><i class="ti ti-wall" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.arr.einbau')}</span></div></button>
      <button class="bk-opt ${bkSt.stauraum_typ==='freistehend'?'sel':''}" onclick="bkPickOpt('stauraum_typ','freistehend',this)"><i class="ti ti-box" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.arr.freistehend')}</span></div></button>
      <button class="bk-opt ${bkSt.stauraum_typ==='beides'?'sel':''}" onclick="bkPickOpt('stauraum_typ','beides',this)"><i class="ti ti-stack-2" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.arr.beides')}</span></div></button>
    </div>`;
  }

  if (tr.includes('allinclusive')) {
    html += `<div class="bk-sdiv">${bkT('s4.aii.head')}</div>
    <div class="bk-q">${bkT('s4.aii.q1')}<small>${bkT('s4.aii.q1Hint')}</small></div>
    <div class="bk-opts bk-opts--phases">${
      bkPhases().map(p => {
        const sel = bkSt.aii_phase === p.id;
        return `<div class="bk-opt-wrap">
          <button type="button" class="bk-opt bk-opt--phase ${sel ? 'sel' : ''}" onclick="bkPickOpt('aii_phase','${p.id}',this)">
            <span class="bk-phase-steps" aria-hidden="true">${p.steps}</span>
            <div><span class="bk-ot">${p.title}</span><span class="bk-os">${p.desc}</span></div>
          </button>
          ${bkInfoBtnHtml(p.title, p.info)}
        </div>`;
      }).join('')
    }</div>
    <div class="bk-q">${bkT('s4.aii.q2')}<small>${bkT('s4.aii.q2Hint')}</small></div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.struktur_eingriff==='ja'?'sel':''}" onclick="bkPickOpt('struktur_eingriff','ja',this)">
        <i class="ti ti-home-edit" aria-hidden="true"></i>
        <div><span class="bk-ot">${bkT('s4.aii.struktur.ja.t')}</span><span class="bk-os">${bkT('s4.aii.struktur.ja.s')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.struktur_eingriff==='nein'?'sel':''}" onclick="bkPickOpt('struktur_eingriff','nein',this)">
        <i class="ti ti-check" aria-hidden="true"></i>
        <div><span class="bk-ot">${bkT('s4.aii.struktur.nein.t')}</span><span class="bk-os">${bkT('s4.aii.struktur.nein.s')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.struktur_eingriff==='unklar'?'sel':''}" onclick="bkPickOpt('struktur_eingriff','unklar',this)">
        <i class="ti ti-question-mark" aria-hidden="true"></i>
        <div><span class="bk-ot">${bkT('s4.aii.struktur.unklar.t')}</span><span class="bk-os">${bkT('s4.aii.struktur.unklar.s')}</span></div>
      </button>
    </div>
    <div class="bk-q">${bkT('s4.aii.q3')}</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.handwerker_status==='vorhanden'?'sel':''}" onclick="bkPickOpt('handwerker_status','vorhanden',this)">
        <i class="ti ti-check" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.aii.hw.vorhanden.t')}</span><span class="bk-os">${bkT('s4.aii.hw.vorhanden.s')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.handwerker_status==='suchen'?'sel':''}" onclick="bkPickOpt('handwerker_status','suchen',this)">
        <i class="ti ti-search" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.aii.hw.suchen.t')}</span><span class="bk-os">${bkT('s4.aii.hw.suchen.s')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.handwerker_status==='offen'?'sel':''}" onclick="bkPickOpt('handwerker_status','offen',this)">
        <i class="ti ti-question-mark" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.aii.hw.offen.t')}</span><span class="bk-os">${bkT('s4.aii.hw.offen.s')}</span></div>
      </button>
    </div>`;
  }

  if (tr.includes('arrangement') || tr.includes('allinclusive')) {
    const phaseHint = tr.includes('allinclusive')
      ? '<small>' + bkT('s4.aufmass.hint.aii') + '</small>'
      : '<small>' + bkT('s4.aufmass.hint.arr') + '</small>';
    html += `<div class="bk-sdiv">${bkT('s4.aufmass.head')}</div>
    <div class="bk-q">${bkT('s4.aufmass.q')}${phaseHint}</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.aufmass===true?'sel':''}" onclick="bkPickAufmass(true,this)">
        <i class="ti ti-ruler" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.aufmass.ja.t')}</span><span class="bk-os">${bkT('s4.aufmass.ja.s')}</span></div>
      </button>
      <button class="bk-opt ${bkSt.aufmass===false?'sel':''}" onclick="bkPickAufmass(false,this)">
        <i class="ti ti-file-description" aria-hidden="true"></i><div><span class="bk-ot">${bkT('s4.aufmass.nein')}</span></div>
      </button>
    </div>`;
  }

  if (!html) html = '<p style="font-size:12px;color:var(--bk-text2)">' + bkT('summary.pickService') + '</p>';
  document.getElementById('bk-s4-content').innerHTML = html;
  bkUpdateCart();
  bkUpdateNavButtons();
}

function bkUpdateNavButtons() {
  const set = (id, ok) => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = !ok;
  };
  set('bk-btn4', bkStep4Valid());
  set('bk-btn5', bkStep5Valid());
  set('bk-btn7', bkStep7Valid());
  set('bk-btn8', bkStep8Valid());
}

window.bkUpdateNavButtons = bkUpdateNavButtons;

function bkRenderFinalSummary() {
  const zieleL = bkZieleLabels();
  const matL = bkMatLabels();
  const funkL = bkFunkLabels();
  const koordL = bkKoordLabels();
  const qm = Math.max(bkSt.qmIn || 10, 5);
  const aufmassHon = bkCalcAufmassHon(qm, bkQmOutHon(bkSt.qmOut || 0));
  const {honLow, honHigh, bauLow, bauHigh} = bkCalcPrice();
  const tL = {ordnung: bkT('cart.ordnung'), arrangement: bkT('cart.arrangement'), allinclusive: bkT('cart.allinclusive')};
  const phaseL = Object.fromEntries(bkPhases().map(p => [p.id, p.steps + ' ' + p.title]));
  const feelL = {retreat: bkT('s3.feel.retreat'), lebhaft: bkT('s3.feel.lebhaft'), repraesentation: bkT('s3.feel.repraesentation'), funktional: bkT('s3.feel.funktional')};
  const neuanL = {ja: bkT('s6.neuan.ja'), nein: bkT('s6.neuan.nein'), wenig: bkT('s6.neuan.wenig')};
  const nutzerL = {allein: bkT('s5.nutzer.allein'), paar: bkT('s5.nutzer.paar'), familie: bkT('s5.nutzer.familie'), wg: bkT('s5.nutzer.wg')};
  const kochenL = {aufwendig: bkT('s5.kochen.aufwendig.t'), schnell: bkT('s5.kochen.schnell'), selten: bkT('s5.kochen.selten')};
  const smhL = {ja: bkT('s5.smh.ja.t'), licht: bkT('s5.smh.licht.t'), nein: bkT('s5.smh.nein')};
  const kvL = {nie: bkT('s7.kv.nie'), meilensteine: bkT('s7.kv.meilensteine'), monatlich: bkT('s7.kv.monatlich.t'), laufend: bkT('s7.kv.laufend.t')};
  const aendL = {keine: bkT('s7.aend.keine.t') + ', ' + bkT('s7.aend.keine.s'), wenige: bkT('s7.aend.wenige.t') + ' (+30%)', viele: bkT('s7.aend.viele.t') + ' (×2)'};
  const dlL = {hart: bkT('s8.dl.hart.t'), weich: bkT('s8.dl.weich'), offen: bkT('s8.dl.offen')};
  const bewL = {ja: bkT('s8.bew.ja.t'), leer: bkT('s8.bew.leer'), beides: bkT('s8.bew.beides')};
  const kommL = {mail: bkT('s8.komm.mail'), whatsapp: bkT('s8.komm.whatsapp'), call: bkT('s8.komm.call')};
  const krL = {bis20k: bkT('s9.kr.bis20k'), '20_60k': bkT('s9.kr.20_60k'), '60_150k': bkT('s9.kr.60_150k'), '150kplus': bkT('s9.kr.150kplus'), '500kplus': bkT('s9.kr.500kplus'), offen: bkT('s9.kr.offen')};
  const stilL = {warm: bkT('s6.stil.warm.t'), clean: bkT('s6.stil.clean.t'), japanisch: bkT('s6.stil.japanisch.t'), urban: bkT('s6.stil.urban.t'), maximal: bkT('s6.stil.maximal.t'), offen: bkT('s6.stil.offen')};
  const sizeStr = (bkSt.size ? bkSL(bkSt.size) : '-') + (bkSt.qmIn ? ', ' + bkSt.qmIn + ' m²' : '');
  const aussenStr = bkSt.aussen && bkSt.aussen !== 'kein' ? (bkSt.aussen + (bkSt.qmOut ? ' ' + bkSt.qmOut + ' m²' : '')) : null;

  const hard = [
    {k: bkT('summary.leistung'), v:bkSt.track.map(t=>tL[t]).join(', ')||'-'},
    bkSt.track.includes('allinclusive') && bkSt.aii_phase ? {k: bkT('summary.phase'), v:phaseL[bkSt.aii_phase]||bkSt.aii_phase} : null,
    {k: bkT('summary.size'), v:sizeStr},
    aussenStr ? {k: bkT('summary.outdoor'), v:aussenStr} : null,
    {k: bkT('summary.quality'), v: bkQL(bkSt.ql)},
    aufmassHon > 0 ? {k: bkT('cart.aufmass'), v: bkFmtEuro(aufmassHon)} : null,
    {k: bkT('summary.feeEst'), v:honLow ? bkFmtNum(honLow) + (bkGetLang() === 'en' ? ' to ' : ' bis ') + bkFmtEuro(honHigh) : '-', hl:true},
    bauLow ? {k: bkT('summary.buildEst'), v: bkFmtNum(bauLow) + (bkGetLang() === 'en' ? ' to ' : ' bis ') + bkFmtEuro(bauHigh)} : null,
    bkSt.kostenrahmen ? {k: bkT('summary.budget'), v:krL[bkSt.kostenrahmen]||bkSt.kostenrahmen} : null,
  ].filter(Boolean);

  const soft = [
    bkSt.ziele.length ? {k: bkT('summary.goals'), v:bkSt.ziele.map(z=>zieleL[z]||z).join(', ')} : null,
    bkSt.feel ? {k: bkT('summary.atmosphere'), v:feelL[bkSt.feel]||bkSt.feel} : null,
    bkSt.stil ? {k: bkT('summary.style'), v:stilL[bkSt.stil]||bkSt.stil} : null,
    bkSt.mat && bkSt.mat.length ? {k: bkT('summary.materials'), v:bkSt.mat.map(m=>matL[m]||m).join(', ')} : null,
    bkSt.funktionen && bkSt.funktionen.length ? {k: bkT('summary.functions'), v:bkSt.funktionen.map(f=>funkL[f]||f).join(', ')} : null,
    bkSt.nutzer ? {k: bkT('summary.residents'), v:nutzerL[bkSt.nutzer]||bkSt.nutzer} : null,
    bkSt.kochen ? {k: bkT('summary.cooking'), v:kochenL[bkSt.kochen]||bkSt.kochen} : null,
    bkSt.smarthome ? {k: bkT('summary.smarthome'), v:smhL[bkSt.smarthome]||bkSt.smarthome} : null,
    bkSt.koord && bkSt.koord.length ? {k: bkT('summary.coordination'), v:bkSt.koord.map(c=>koordL[c]||c).join(', ')} : null,
    bkSt.track.includes('allinclusive') && bkSt.struktur_eingriff
      ? {k: bkT('summary.structure'), v:{ja: bkT('s4.aii.struktur.ja.t'), nein: bkT('s4.aii.struktur.nein.t'), unklar: bkT('s4.aii.struktur.unklar.t')}[bkSt.struktur_eingriff] || bkSt.struktur_eingriff}
      : null,
    bkSt.neuan ? {k: bkT('summary.furniture'), v:neuanL[bkSt.neuan]||bkSt.neuan} : null,
    bkSt.hon_typ ? {k: bkT('summary.feeStruct'), v:{pauschale: bkT('s7.hon.pauschale.t'), stunden: bkT('s7.hon.stunden.t'), egal: bkT('s7.hon.egal')}[bkSt.hon_typ]||bkSt.hon_typ} : null,
    bkSt.kv ? {k: bkT('summary.costTrack'), v:kvL[bkSt.kv]||bkSt.kv} : null,
    bkSt.aend ? {k: bkT('summary.approval'), v:aendL[bkSt.aend]||bkSt.aend} : null,
    bkSt.dl_typ ? {k: bkT('summary.deadline'), v:(dlL[bkSt.dl_typ]||bkSt.dl_typ)+(bkSt.dl_text?', '+bkSt.dl_text:'')} : null,
    bkSt.bewohnt ? {k: bkT('summary.during'), v:bewL[bkSt.bewohnt]||bkSt.bewohnt} : null,
    bkSt.komm ? {k: bkT('summary.contact'), v:kommL[bkSt.komm]||bkSt.komm} : null,
    bkSt.gesetzt ? {k: bkT('summary.fixedFurniture'), v:bkSt.gesetzt} : null,
    bkSt.nogo ? {k: bkT('summary.nogo'), v:bkSt.nogo} : null,
  ].filter(Boolean);

  const row = (r, isSoft) =>
    `<div class="bk-sr${isSoft?' soft':''}${r.hl?' highlight':''}">
      <span class="bk-sk">${r.k}</span>
      <span class="bk-sv">${r.v}</span>
    </div>`;

  const el = document.getElementById('bk-final-summary');
  if (el) el.innerHTML = `
    <div class="bk-smr">
      <div class="bk-smr-t">${bkT('summary.title')}</div>
      ${hard.map(r => row(r, false)).join('')}
      ${soft.length ? '<div class="bk-smr-section-label">' + bkT('summary.details') + '</div>' : ''}
      ${soft.map(r => row(r, true)).join('')}
    </div>`;
}

window.bkSubmit = function() {
  const fn = document.getElementById('bk-fname').value.trim();
  const em = document.getElementById('bk-femail').value.trim();
  if (!fn || !em) { alert(bkT('alert.contact')); return; }
  /* === FORMULAR-SUBMIT ===
     Hier Formspree, Netlify Forms oder eigenen Endpoint eintragen.
     Beispiel Formspree:
       fetch('https://formspree.io/f/DEIN_FORMSPREE_BIIG_INTERIOR', {
         method:'POST',
         headers:{'Content-Type':'application/json'},
         body: JSON.stringify({...bkSt, fname:fn, email:em})
       });
  */
  bkGoTo(99);
};

function bkUpdateDots(curr) {
  for (let i = 1; i <= BK_TOTAL; i++) {
    const el = document.getElementById('bk-prog' + i);
    if (!el) continue;
    let h = '';
    for (let d = 1; d <= BK_TOTAL; d++) {
      const cls = d < curr ? 'done' : d === curr ? 'curr' : '';
      h += `<div class="bk-dot ${cls}"></div>`;
    }
    el.innerHTML = h;
  }
}

function bkQmWheelCfgData() {
  return {
    'bk-qm-in': { min: 5, max: 800, label: bkT('wheel.inner'), type: 'in' },
    'bk-qm-out': { min: 0, max: 600, label: bkT('wheel.outer'), type: 'out' },
  };
}
const BK_QM_WHEEL_ITEM_H = 44;
let bkQmWheelEl = null;
let bkQmWheelInput = null;
let bkQmWheelScrollRaf = 0;

function bkSplitNavButtons() {
  document.querySelectorAll('.bk-nav .bk-btn').forEach(function(btn) {
    if (btn.dataset.bkSplit === '1') return;
    const text = (btn.textContent || '').trim();
    let icon = '';
    let label = text;
    if (text.indexOf('←← ') === 0) {
      icon = '←←';
      label = text.slice(3);
    } else if (text.indexOf('← ') === 0) {
      icon = '←';
      label = text.slice(2);
    } else if (text.slice(-2) === ' →') {
      icon = '→';
      label = text.slice(0, -2);
    }
    btn.innerHTML = '<span class="bk-btn__icon" aria-hidden="true">' + icon + '</span>'
      + '<span class="bk-btn__label">' + label + '</span>';
    btn.dataset.bkSplit = '1';
  });
}
window.bkSplitNavButtons = bkSplitNavButtons;

function bkQmWheelCfg(input) {
  const cfg = bkQmWheelCfgData();
  return cfg[input.id] || cfg['bk-qm-in'];
}

function bkQmWheelValueFromScroll(scroller, cfg) {
  const idx = Math.round(scroller.scrollTop / BK_QM_WHEEL_ITEM_H);
  return Math.min(cfg.max, Math.max(cfg.min, cfg.min + idx));
}

function bkQmWheelPaint(scroller) {
  const center = scroller.scrollTop + scroller.clientHeight * 0.5;
  scroller.querySelectorAll('.bk-qm-wheel__item').forEach(function(item) {
    const itemCenter = item.offsetTop + item.offsetHeight * 0.5;
    const dist = Math.abs(center - itemCenter);
    item.classList.toggle('is-selected', dist < BK_QM_WHEEL_ITEM_H * 0.5);
  });
}

function bkCloseQmWheel(apply) {
  if (!bkQmWheelEl) return;
  if (apply && bkQmWheelInput) {
    const cfg = bkQmWheelCfg(bkQmWheelInput);
    const scroller = bkQmWheelEl.querySelector('.bk-qm-wheel__scroller');
    const val = bkQmWheelValueFromScroll(scroller, cfg);
    bkQmWheelInput.value = val;
    bkUpdQm(cfg.type, val);
  }
  bkQmWheelEl.hidden = true;
  document.body.classList.remove('bk-qm-wheel-open');
  bkQmWheelInput = null;
}

function bkOpenQmWheel(input) {
  const cfg = bkQmWheelCfg(input);
  if (!bkQmWheelEl) return;
  bkQmWheelInput = input;
  const current = parseInt(input.value, 10);
  const start = Number.isFinite(current) ? current : cfg.min;
  const title = bkQmWheelEl.querySelector('.bk-qm-wheel__title');
  const scroller = bkQmWheelEl.querySelector('.bk-qm-wheel__scroller');
  if (title) title.textContent = cfg.label + ' (m²)';
  scroller.innerHTML = '';
  const padH = (scroller.clientHeight || 220) * 0.5 - BK_QM_WHEEL_ITEM_H * 0.5;
  const pad = document.createElement('div');
  pad.className = 'bk-qm-wheel__pad';
  pad.style.height = Math.max(0, padH) + 'px';
  scroller.appendChild(pad);
  for (let v = cfg.min; v <= cfg.max; v++) {
    const item = document.createElement('div');
    item.className = 'bk-qm-wheel__item';
    item.dataset.value = String(v);
    item.textContent = v + ' m²';
    scroller.appendChild(item);
  }
  scroller.appendChild(pad.cloneNode());
  bkQmWheelEl.hidden = false;
  document.body.classList.add('bk-qm-wheel-open');
  const idx = Math.min(cfg.max - cfg.min, Math.max(0, start - cfg.min));
  requestAnimationFrame(function() {
    scroller.scrollTop = idx * BK_QM_WHEEL_ITEM_H;
    bkQmWheelPaint(scroller);
  });
}

function bkCreateQmWheel() {
  if (bkQmWheelEl) return bkQmWheelEl;
  const el = document.createElement('div');
  el.id = 'bk-qm-wheel';
  el.className = 'bk-qm-wheel';
  el.hidden = true;
  el.innerHTML = '<button type="button" class="bk-qm-wheel__backdrop" aria-label="' + bkT('wheel.close') + '"></button>'
    + '<div class="bk-qm-wheel__panel" role="dialog" aria-modal="true" aria-labelledby="bk-qm-wheel-title">'
    + '<div class="bk-qm-wheel__title" id="bk-qm-wheel-title"></div>'
    + '<div class="bk-qm-wheel__frame"><div class="bk-qm-wheel__highlight" aria-hidden="true"></div>'
    + '<div class="bk-qm-wheel__scroller" tabindex="0"></div></div>'
    + '<button type="button" class="bk-qm-wheel__done" data-bk-i18n="wheel.done">' + bkT('wheel.done') + '</button></div>';
  document.body.appendChild(el);
  const scroller = el.querySelector('.bk-qm-wheel__scroller');
  scroller.addEventListener('scroll', function() {
    if (bkQmWheelScrollRaf) return;
    bkQmWheelScrollRaf = requestAnimationFrame(function() {
      bkQmWheelScrollRaf = 0;
      bkQmWheelPaint(scroller);
    });
  }, { passive: true });
  el.querySelector('.bk-qm-wheel__backdrop').addEventListener('click', function() {
    bkCloseQmWheel(false);
  });
  el.querySelector('.bk-qm-wheel__done').addEventListener('click', function() {
    bkCloseQmWheel(true);
  });
  bkQmWheelEl = el;
  return el;
}

function bkInitQmPickers() {
  bkCreateQmWheel();
  ['bk-qm-in', 'bk-qm-out'].forEach(function(id) {
    const input = document.getElementById(id);
    if (!input) return;
    input.setAttribute('inputmode', 'numeric');
    input.addEventListener('click', function(e) {
      if (!window.matchMedia('(max-width: 720px)').matches) return;
      e.preventDefault();
      bkOpenQmWheel(input);
    });
    input.addEventListener('focus', function(e) {
      if (!window.matchMedia('(max-width: 720px)').matches) return;
      e.preventDefault();
      input.blur();
      bkOpenQmWheel(input);
    });
  });
}

window.bkOnLangChange = function() {
  bkRenderStep1Tracks();
  const s4 = document.getElementById('bk-step4');
  if (s4 && s4.classList.contains('active')) bkRenderS4();
  const s9 = document.getElementById('bk-step9');
  if (s9 && s9.classList.contains('active')) bkRenderFinalSummary();
  bkSyncSlOpts('ql', bkSt.ql);
  bkSyncSlOpts('cr', bkSt.cr);
  const qlVal = document.getElementById('bk-ql-val');
  if (qlVal) qlVal.textContent = bkQL(bkSt.ql);
  const crVal = document.getElementById('bk-cr-val');
  if (crVal) crVal.textContent = bkCR(bkSt.cr);
  document.querySelectorAll('.bk-sl-ends[data-bk-sl="ql"] .bk-sl-opt').forEach(function(btn) {
    btn.textContent = bkQL(+btn.dataset.v);
  });
  document.querySelectorAll('.bk-sl-ends[data-bk-sl="cr"] .bk-sl-opt').forEach(function(btn, i) {
    const labels = [bkT('cr.1'), bkT('s7.cr.2'), bkT('s7.cr.3'), bkT('s7.cr.4')];
    btn.textContent = labels[i] || btn.textContent;
  });
  bkUpdateKoordNote();
  bkUpdateCart();
  if (bkQmWheelEl) {
    const done = bkQmWheelEl.querySelector('.bk-qm-wheel__done');
    if (done) done.textContent = bkT('wheel.done');
    const backdrop = bkQmWheelEl.querySelector('.bk-qm-wheel__backdrop');
    if (backdrop) backdrop.setAttribute('aria-label', bkT('wheel.close'));
  }
};

function bkInitKonfigurator() {
  if (typeof bkApplyKonfiguratorLang === 'function') bkApplyKonfiguratorLang();
  else bkSplitNavButtons();
  bkBindQuizScrollLock();
  bkInitQmPickers();
  bkRenderStep1Tracks();
  bkSyncSlOpts('ql', bkSt.ql);
  bkSyncSlOpts('cr', bkSt.cr);
  bkUpdateStep5();
  bkUpdateNavButtons();
  bkOnLangChange();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bkInitKonfigurator);
} else {
  bkInitKonfigurator();
}

})();
