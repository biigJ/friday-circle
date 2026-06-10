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

const BK_QL = {1:'Standard', 2:'Gehoben', 3:'Premium'};
const BK_CR = {1:'1×', 2:'2×', 3:'3×', 4:'Unlimitiert (300%)'};
const BK_SL = {kl_zimmer:'Kleines Zimmer', gr_zimmer:'Großes Zimmer', teile:'Teile der Wohnung / des Büros', etage:'Komplette Wohnung / komplettes Büro', haus:'Große Wohn- / Büroetag(e)', haus_garten:'Haus'};
const BK_BKI = {1:550, 2:850, 3:1500};
/** Außen-BKI je m² als Anteil der Innen-BKI (gleicher Faktor wie Baukosten-Orientierung). */
const BK_BKI_OUTDOOR = 0.28;

function bkQmOutHon(qmOut) {
  return qmOut > 0 ? qmOut * BK_BKI_OUTDOOR : 0;
}

const BK_TRACKS = [
  {
    id:'ordnung',
    icon:'ti-stack-2',
    title:'Ordnung & Sortierung',
    desc:'ab 200 €',
    info:'Wir sortieren Räume, Möbel oder Ideen — ohne Umbau oder neue Pläne. Ziel ist Klarheit, weniger Chaos und eine Struktur, mit der Du selbst weiterarbeiten kannst.',
  },
  {
    id:'arrangement',
    icon:'ti-layout-dashboard',
    title:'Grundplanung Raum-Arrangement',
    desc:'Grundriss + Möbelplan + Visu · ab 450 €',
    info:'Du bekommst Entwurf auf dem Bestandsgrundriss: Möbelplanung, Stauraum und Visualisierung. Die Umsetzung mit Handwerkern liegt bei Dir — ich liefere die belastbare Planungsvorlage.',
  },
  {
    id:'allinclusive',
    icon:'ti-building',
    title:'Entwurf bis Umsetzung',
    desc:'Planung + Handwerk · ab 2.500 €',
    info:'Vom ersten Entwurf bis zur koordinierten Umsetzung — je nach gewählter Leistungsphase in Schritt 4. Ein durchgängiger Ablauf statt einzelner Planungslieferung.',
  },
];

const BK_PHASES = [
  {
    id:'konzept', steps:'①', title:'Nur Planung', desc:'Entwurf, Grundriss, Visualisierung',
    info:'Du erhältst Planung und Visualisierung — ohne Gewerkesuche, Angebotsvergleich oder Baustellenkoordination. Die Umsetzung verantwortest Du selbst oder mit eigenen Handwerkern.',
  },
  {
    id:'planung_bau', steps:'①②', title:'+ Vermittlung', desc:'inkl. Gewerke suchen & Angebote koordinieren · +25%',
    info:'Alles aus Stufe 1, plus ich suche passende Gewerke und koordiniere Angebote. Die Verträge mit Handwerkern schließt Du; ich strukturiere Auswahl und Vergleich.',
  },
  {
    id:'bauleitung', steps:'①②③', title:'+ Bauleitung', desc:'inkl. Koordination auf der Baustelle · +45%',
    info:'Alles aus Stufe 2, plus laufende Steuerung auf der Baustelle — Termine, Abläufe und Qualität vor Ort. Ich bin Dein Ansprechpartner zwischen Plan und Ausführung.',
  },
  {
    id:'gue', steps:'①②③④', title:'Alles aus einer Hand', desc:'inkl. einem Vertrag für alle Leistungen · +65%',
    info:'Das Komplettpaket: Planung, Vermittlung, Bauleitung und ein gemeinsamer Vertragsrahmen. Du hast einen Ansprechpartner; ich steuere Gewerke und Ablauf end-to-end.',
  },
];

function bkInfoBtnHtml(label, info) {
  return `<button type="button" class="bk-info-btn" aria-label="Umfang: ${label}">
    <span class="bk-info__mark" aria-hidden="true">i</span>
    <span class="bk-info__tip" role="tooltip">${info}</span>
  </button>`;
}

function bkRenderStep1Tracks() {
  const el = document.getElementById('bk-step1-tracks');
  if (!el) return;
  el.innerHTML = BK_TRACKS.map(t => {
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

const BK_ORD_LABELS = {ideen:'Ideen strukturieren', moeblierung:'Möbel sortieren', stauraum_sys:'Stauraum-System', chaos:'Chaos-Zonen'};
const BK_ZIELE_LABELS = {stauraum:'Mehr Stauraum', ruhe:'Ruhe & Rückzug', gaeste:'Gäste', homeoffice:'Homeoffice', kinder:'Kinder', aesthetik:'Ästhetik', fluss:'Raumfluss', licht:'Licht', kueche:'Küche', bad:'Bad'};
const BK_FUNK_LABELS = {kinder_b:'Kinderbereiche', eltern:'Mastersuite', gaestezimmer:'Gästezimmer', homeoffice_f:'Homeoffice', fitness:'Fitness', hauswirtschaft:'Hauswirtschaft'};
const BK_MAT_LABELS = {holz_hell:'Holz (hell)', holz_dunkel:'Holz (dunkel)', naturstein:'Naturstein', marmor:'Marmor', metall:'Metall', beton:'Beton', textil:'Textilien', farbe:'Farbige Wände'};
const BK_KOORD_LABELS = {kueche_koord:'Küchenplanung', moebel:'Möbelplanung', kunst:'Kunst & Objekte', licht_koord:'Lichtplanung', textil_koord:'Textil & Vorhänge', bauleitung_koord:'Bauleitung'};
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
  bkSt.track = [trackId];
  bkRenderStep1Tracks();
  bkGoTo(2);
};

window.bkGoTo = function(n) {
  document.querySelectorAll('.bk-step').forEach(s => s.classList.remove('active'));
  const el = n === 99 ? document.getElementById('bk-step-done') : document.getElementById('bk-step' + n);
  if (el) el.classList.add('active');
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
  if (sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
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
  if (el) el.textContent = BK_QL[v];
  bkSyncSlOpts('ql', v);
  bkUpdateCart();
};

window.bkUpdCr = function(v) {
  bkSt.cr = v;
  const el = document.getElementById('bk-cr-val');
  if (el) el.textContent = BK_CR[v];
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
    msgs.push('Küchenplanung ist bereits in Schritt 3 berücksichtigt — kein Doppelaufschlag.');
  if ((bkSt.koord||[]).includes('bauleitung_koord') && bkSt.track.includes('allinclusive') && bkSt.aii_phase === 'bauleitung')
    msgs.push('Bauleitung ist in Deiner Leistungsphase bereits enthalten — Koordinationsaufschlag entfällt.');
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
  return bkSt.size !== 'kl_zimmer';
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
  if (bkStep5ShowsKochen() && !bkSt.kochen) return false;
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
    honItems.push({l:'Ordnung & Sortierung', v:Math.round(bInner * fokusMult)});
    base += (bInner + honOut) * fokusMult;
  }
  if (bkSt.track.includes('arrangement')) {
    const honOut = bkHonOutAbove(qm, qmOut, 30, 4.5);
    const bInner = Math.max(450, 450 + (qm - 30) * 4.5);
    honOutTotal += honOut;
    honItems.push({l:'Raum-Arrangement + Visu', v:Math.round(bInner)});
    base += bInner + honOut;
  }
  if (bkSt.track.includes('allinclusive')) {
    const honOut = bkHonOutAbove(qm, qmOut, 60, 20);
    const bInner = Math.max(2500, 2500 + (qm - 60) * 20);
    const phaseMult = bkAiiPhaseMult();
    honOutTotal += honOut * phaseMult;
    const bTotal = (bInner + honOut) * phaseMult;
    honItems.push({l:'Entwurf bis Umsetzung', v:Math.round(bInner * phaseMult)});
    base += bTotal;
  }

  const aufmassHon = bkCalcAufmassHon(qm, qmOutHon);
  if (aufmassHon > 0) {
    honItems.push({l:'Aufmaß vor Ort', v:aufmassHon});
    base += aufmassHon;
  }

  if (qmOut > 0 && honOutTotal > 0) {
    honItems.push({
      l: 'Außen ~' + qmOut + ' m² (BKI ×' + Math.round(BK_BKI_OUTDOOR * 100) + '%)',
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
  if (koord.includes('moebel')) { multi += .06; auf.push('Möbelplanung +6%'); }
  if (koord.includes('kunst')) { multi += .04; auf.push('Kunst +4%'); }
  if (koord.includes('licht_koord')) { multi += .05; auf.push('Lichtplanung +5%'); }
  if (koord.includes('textil_koord')) { multi += .04; auf.push('Textil +4%'); }
  const bauleitungSchonDrin = bkSt.track.includes('allinclusive') && bkSt.aii_phase === 'bauleitung';
  if (koord.includes('bauleitung_koord') && !bauleitungSchonDrin) { multi += .15; auf.push('Bauleitung +15%'); }

  const step7Done = bkStep7Valid();
  const step8Done = bkStep8Valid();

  const qlM = step7Done ? ([1, 1, 1.35, 1.75][bkSt.ql] || 1) : 1;
  if (step7Done && qlM > 1) auf.push(BK_QL[bkSt.ql] + ' +' + Math.round((qlM - 1) * 100) + '%');
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
    bauItems.push({l:'Umbau ~' + qm + ' m² (' + BK_QL[bkSt.ql] + ')', v:Math.round(umbau)});
    if (z.includes('kueche')) { const kv = bkSt.ql===3?28000:bkSt.ql===2?14000:7000; bauBase+=kv; bauItems.push({l:'Küche', v:kv}); }
    if (z.includes('bad')) { const bv = bkSt.ql===3?20000:bkSt.ql===2?10000:4500; bauBase+=bv; bauItems.push({l:'Bad', v:bv}); }
    if (qmOut > 0) { const av = Math.round(qmOut * bkiM * BK_BKI_OUTDOOR); bauBase+=av; bauItems.push({l:'Außen ~'+qmOut+' m² (BKI)', v:av}); }
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
    if (ctH) ctH.textContent = '—';
    if (ctB) ctB.textContent = '—';
    if (crEl) crEl.innerHTML = '';
    return;
  }
  if (ctH) {
    ctH.textContent = honorarOpen
      ? 'ab ' + honLow.toLocaleString('de-DE') + ' €'
      : honLow.toLocaleString('de-DE') + ' – ' + honHigh.toLocaleString('de-DE') + ' €';
  }
  if (ctB) ctB.textContent = bauLow ? bauLow.toLocaleString('de-DE') + ' – ' + bauHigh.toLocaleString('de-DE') + ' €' : '—';
  let html = '';
  honItems.forEach(i => html += `<div class="bk-cr"><span>${i.l}</span><b>${i.v.toLocaleString('de-DE')} €</b></div>`);
  if (aufItems.length) html += `<div class="bk-cr aufschlag" style="font-size:10px"><span style="line-height:1.6">${aufItems.join(' · ')}</span></div>`;
  if (bauItems.length) {
    html += `<div class="bk-cr" style="margin-top:3px;font-size:10px;opacity:.6"><span>Baukosten-Orientierung (BKI)</span></div>`;
    bauItems.forEach(i => html += `<div class="bk-cr bau-row"><span>${i.l}</span><b>${i.v.toLocaleString('de-DE')} €</b></div>`);
  }
  if (crEl) crEl.innerHTML = html;
}

function bkRenderS4() {
  const tr = bkSt.track;
  let html = '';

  if (tr.includes('ordnung')) {
    html += `<div class="bk-sdiv">Ordnung & Sortierung</div>
    <div class="bk-q">Was soll sortiert werden?<small>Jede Option +6% auf den Ordnungs-Block</small></div>
    <div class="bk-tags">
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('ideen')?'sel':''}" data-k="ord_fokus" data-v="ideen" onclick="bkToggleTag(this)">Ideen & Wünsche strukturieren +6%</button>
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('moeblierung')?'sel':''}" data-k="ord_fokus" data-v="moeblierung" onclick="bkToggleTag(this)">Möbel & Objekte sortieren +6%</button>
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('stauraum_sys')?'sel':''}" data-k="ord_fokus" data-v="stauraum_sys" onclick="bkToggleTag(this)">Stauraum-System +6%</button>
      <button class="bk-tag ${(bkSt.ord_fokus||[]).includes('chaos')?'sel':''}" data-k="ord_fokus" data-v="chaos" onclick="bkToggleTag(this)">Chaos-Zonen +6%</button>
    </div>
    <div class="bk-q">Darf ich auch beim Aufräumen & Wegwerfen helfen?</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.ord_aufraumen==='ja'?'sel':''}" onclick="bkPickOpt('ord_aufraumen','ja',this)">
        <i class="ti ti-trash" aria-hidden="true"></i>
        <div><span class="bk-ot">Ja gerne</span><span class="bk-os">Gemeinsam aussortieren · +150 €</span></div>
      </button>
      <button class="bk-opt ${bkSt.ord_aufraumen==='nein'?'sel':''}" onclick="bkPickOpt('ord_aufraumen','nein',this)">
        <i class="ti ti-check" aria-hidden="true"></i>
        <div><span class="bk-ot">Nein, ich mache das selbst</span></div>
      </button>
    </div>`;
  }

  if (tr.includes('arrangement')) {
    html += `<div class="bk-sdiv">Raum-Arrangement</div>
    <div class="bk-q">Ausgangspunkt?</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.arr_fokus==='leer'?'sel':''}" onclick="bkPickOpt('arr_fokus','leer',this)">
        <i class="ti ti-box" aria-hidden="true"></i><div><span class="bk-ot">Leerer Raum</span></div>
      </button>
      <button class="bk-opt ${bkSt.arr_fokus==='bestand'?'sel':''}" onclick="bkPickOpt('arr_fokus','bestand',this)">
        <i class="ti ti-refresh" aria-hidden="true"></i><div><span class="bk-ot">Bestand optimieren</span></div>
      </button>
      <button class="bk-opt ${bkSt.arr_fokus==='misch'?'sel':''}" onclick="bkPickOpt('arr_fokus','misch',this)">
        <i class="ti ti-layers-difference" aria-hidden="true"></i><div><span class="bk-ot">Mischung</span></div>
      </button>
    </div>
    <div class="bk-q">Stauraum als…</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.stauraum_typ==='einbau'?'sel':''}" onclick="bkPickOpt('stauraum_typ','einbau',this)"><i class="ti ti-wall" aria-hidden="true"></i><div><span class="bk-ot">Einbauschränke</span></div></button>
      <button class="bk-opt ${bkSt.stauraum_typ==='freistehend'?'sel':''}" onclick="bkPickOpt('stauraum_typ','freistehend',this)"><i class="ti ti-box" aria-hidden="true"></i><div><span class="bk-ot">Freistehende Möbel</span></div></button>
      <button class="bk-opt ${bkSt.stauraum_typ==='beides'?'sel':''}" onclick="bkPickOpt('stauraum_typ','beides',this)"><i class="ti ti-stack-2" aria-hidden="true"></i><div><span class="bk-ot">Beides</span></div></button>
    </div>`;
  }

  if (tr.includes('allinclusive')) {
    html += `<div class="bk-sdiv">Entwurf bis Umsetzung</div>
    <div class="bk-q">Welche Leistungsphase brauchst Du?<small>Weiter unten = mehr Leistung enthalten — kein Ersatz, sondern Stufen</small></div>
    <div class="bk-opts bk-opts--phases">${
      BK_PHASES.map(p => {
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
    <div class="bk-q">Soll die Raumstruktur verändert werden?<small>Wände versetzen, Grundriss ändern, Installationsleitungen verlegen — nicht gemeint sind Möbel, Oberflächen oder Ausstattung</small></div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.struktur_eingriff==='ja'?'sel':''}" onclick="bkPickOpt('struktur_eingriff','ja',this)">
        <i class="ti ti-home-edit" aria-hidden="true"></i>
        <div><span class="bk-ot">Ja — Eingriff in die Struktur</span><span class="bk-os">Wände, Leitungen, Grundriss · +15%</span></div>
      </button>
      <button class="bk-opt ${bkSt.struktur_eingriff==='nein'?'sel':''}" onclick="bkPickOpt('struktur_eingriff','nein',this)">
        <i class="ti ti-check" aria-hidden="true"></i>
        <div><span class="bk-ot">Nein — nur Ausbau & Ausstattung</span><span class="bk-os">Oberflächen, Möbel, Technik</span></div>
      </button>
      <button class="bk-opt ${bkSt.struktur_eingriff==='unklar'?'sel':''}" onclick="bkPickOpt('struktur_eingriff','unklar',this)">
        <i class="ti ti-question-mark" aria-hidden="true"></i>
        <div><span class="bk-ot">Noch unklar</span><span class="bk-os">Klären wir gemeinsam · +7% Planungspuffer</span></div>
      </button>
    </div>
    <div class="bk-q">Handwerker-Situation?</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.handwerker_status==='vorhanden'?'sel':''}" onclick="bkPickOpt('handwerker_status','vorhanden',this)">
        <i class="ti ti-check" aria-hidden="true"></i><div><span class="bk-ot">Eigene Handwerker vorhanden</span><span class="bk-os">Kein Aufschlag</span></div>
      </button>
      <button class="bk-opt ${bkSt.handwerker_status==='suchen'?'sel':''}" onclick="bkPickOpt('handwerker_status','suchen',this)">
        <i class="ti ti-search" aria-hidden="true"></i><div><span class="bk-ot">Handwerker noch suchen</span><span class="bk-os">+7%</span></div>
      </button>
      <button class="bk-opt ${bkSt.handwerker_status==='offen'?'sel':''}" onclick="bkPickOpt('handwerker_status','offen',this)">
        <i class="ti ti-question-mark" aria-hidden="true"></i><div><span class="bk-ot">Noch unklar</span><span class="bk-os">+4% Planungspuffer</span></div>
      </button>
    </div>`;
  }

  if (tr.includes('arrangement') || tr.includes('allinclusive')) {
    const phaseHint = tr.includes('allinclusive')
      ? '<small>Bei Entwurf bis Umsetzung anteilig zur gewählten Leistungsphase</small>'
      : '<small>Zusatzleistung — separat ausgewiesen · ab 300 € je nach m²</small>';
    html += `<div class="bk-sdiv">Aufmaß</div>
    <div class="bk-q">Aufmaß vor Ort notwendig?${phaseHint}</div>
    <div class="bk-opts">
      <button class="bk-opt ${bkSt.aufmass===true?'sel':''}" onclick="bkPickAufmass(true,this)">
        <i class="ti ti-ruler" aria-hidden="true"></i><div><span class="bk-ot">Ja, Aufmaß notwendig</span><span class="bk-os">ab 300 € je nach m²</span></div>
      </button>
      <button class="bk-opt ${bkSt.aufmass===false?'sel':''}" onclick="bkPickAufmass(false,this)">
        <i class="ti ti-file-description" aria-hidden="true"></i><div><span class="bk-ot">Nein, Pläne vorhanden</span></div>
      </button>
    </div>`;
  }

  if (!html) html = '<p style="font-size:12px;color:var(--bk-text2)">Bitte gehe zurück und wähle eine Leistung.</p>';
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
  const qm = Math.max(bkSt.qmIn || 10, 5);
  const aufmassHon = bkCalcAufmassHon(qm, bkQmOutHon(bkSt.qmOut || 0));
  const {honLow, honHigh, bauLow, bauHigh} = bkCalcPrice();
  const tL = {ordnung:'Ordnung & Sortierung', arrangement:'Raum-Arrangement', allinclusive:'Entwurf bis Umsetzung'};
  const phaseL = Object.fromEntries(BK_PHASES.map(p => [p.id, p.steps + ' ' + p.title]));
  const feelL = {retreat:'Ruhiges Retreat', lebhaft:'Lebhaftes Zuhause', repraesentation:'Repräsentation', funktional:'Maximal funktional'};
  const neuanL = {ja:'Neue Möbel geplant', nein:'Nur Vorhandenes', wenig:'Wenige gezielte Stücke'};
  const nutzerL = {allein:'Alleine', paar:'Zu zweit', familie:'Familie mit Kindern', wg:'WG'};
  const kochenL = {aufwendig:'Häufig & aufwendig', schnell:'Schnell & pragmatisch', selten:'Selten'};
  const smhL = {ja:'Ja, Licht & mehr', licht:'Nur Licht', nein:'Kein Thema'};
  const kvL = {nie:'Nicht nötig', meilensteine:'An Meilensteinen', monatlich:'Monatlich', laufend:'Laufend'};
  const aendL = {keine:'Einmal entscheiden, dann final', wenige:'Gelegentliche Korrekturen (+30%)', viele:'Spielraum (×2 Honorar)'};
  const dlL = {hart:'Fixer Termin', weich:'Ungefähr', offen:'Noch offen'};
  const bewL = {ja:'Bewohnt', leer:'Leer', beides:'Beides möglich'};
  const kommL = {mail:'E-Mail', whatsapp:'WhatsApp', call:'Anruf'};
  const krL = {bis20k:'bis 20.000 €', '20_60k':'20–60.000 €', '60_150k':'60–150.000 €', '150kplus':'150.000 € +', offen:'Noch offen'};
  const stilL = {warm:'Warm-zeitlos', clean:'Modern-clean', japanisch:'Ruhig-japanisch', urban:'Urban-elegant', maximal:'Maximalistisch', offen:'Noch offen'};
  const sizeStr = (BK_SL[bkSt.size]||'—') + (bkSt.qmIn ? ', ' + bkSt.qmIn + ' m²' : '');
  const aussenStr = bkSt.aussen && bkSt.aussen !== 'kein' ? (bkSt.aussen + (bkSt.qmOut ? ' ' + bkSt.qmOut + ' m²' : '')) : null;

  const hard = [
    {k:'Leistung', v:bkSt.track.map(t=>tL[t]).join(', ')||'—'},
    bkSt.track.includes('allinclusive') && bkSt.aii_phase ? {k:'Leistungsphase', v:phaseL[bkSt.aii_phase]||bkSt.aii_phase} : null,
    {k:'Projektgröße', v:sizeStr},
    aussenStr ? {k:'Außenbereich', v:aussenStr} : null,
    {k:'Qualitätsniveau', v:BK_QL[bkSt.ql]},
    aufmassHon > 0 ? {k:'Aufmaß vor Ort', v:aufmassHon.toLocaleString('de-DE') + ' €'} : null,
    {k:'Honorar-Schätzung', v:honLow ? honLow.toLocaleString('de-DE')+' – '+honHigh.toLocaleString('de-DE')+' €' : '—', hl:true},
    bauLow ? {k:'Baukosten-Orientierung', v:bauLow.toLocaleString('de-DE')+' – '+bauHigh.toLocaleString('de-DE')+' €'} : null,
    bkSt.kostenrahmen ? {k:'Mein Kostenrahmen', v:krL[bkSt.kostenrahmen]||bkSt.kostenrahmen} : null,
  ].filter(Boolean);

  const soft = [
    bkSt.ziele.length ? {k:'Ziele', v:bkSt.ziele.map(z=>BK_ZIELE_LABELS[z]||z).join(', ')} : null,
    bkSt.feel ? {k:'Atmosphäre', v:feelL[bkSt.feel]||bkSt.feel} : null,
    bkSt.stil ? {k:'Stil', v:stilL[bkSt.stil]||bkSt.stil} : null,
    bkSt.mat && bkSt.mat.length ? {k:'Materialien', v:bkSt.mat.map(m=>BK_MAT_LABELS[m]||m).join(', ')} : null,
    bkSt.funktionen && bkSt.funktionen.length ? {k:'Raumfunktionen', v:bkSt.funktionen.map(f=>BK_FUNK_LABELS[f]||f).join(', ')} : null,
    bkSt.nutzer ? {k:'Bewohner', v:nutzerL[bkSt.nutzer]||bkSt.nutzer} : null,
    bkSt.kochen ? {k:'Kochen', v:kochenL[bkSt.kochen]||bkSt.kochen} : null,
    bkSt.smarthome ? {k:'Smart Home', v:smhL[bkSt.smarthome]||bkSt.smarthome} : null,
    bkSt.koord && bkSt.koord.length ? {k:'Koordination', v:bkSt.koord.map(c=>BK_KOORD_LABELS[c]||c).join(', ')} : null,
    bkSt.track.includes('allinclusive') && bkSt.struktur_eingriff
      ? {k:'Raumstruktur', v:{ja:'Eingriff geplant', nein:'Nur Ausbau & Ausstattung', unklar:'Noch zu klären'}[bkSt.struktur_eingriff] || bkSt.struktur_eingriff}
      : null,
    bkSt.neuan ? {k:'Möbel', v:neuanL[bkSt.neuan]||bkSt.neuan} : null,
    bkSt.hon_typ ? {k:'Honorarstruktur', v:{pauschale:'Pauschale', stunden:'Stundennachweis', egal:'Flexibel'}[bkSt.hon_typ]||bkSt.hon_typ} : null,
    bkSt.kv ? {k:'Kostenverfolgung', v:kvL[bkSt.kv]||bkSt.kv} : null,
    bkSt.aend ? {k:'Anpassung nach Freigabe', v:aendL[bkSt.aend]||bkSt.aend} : null,
    bkSt.dl_typ ? {k:'Deadline', v:(dlL[bkSt.dl_typ]||bkSt.dl_typ)+(bkSt.dl_text?' — '+bkSt.dl_text:'')} : null,
    bkSt.bewohnt ? {k:'Während des Projekts', v:bewL[bkSt.bewohnt]||bkSt.bewohnt} : null,
    bkSt.komm ? {k:'Kontakt bevorzugt', v:kommL[bkSt.komm]||bkSt.komm} : null,
    bkSt.gesetzt ? {k:'Gesetzte Möbel', v:bkSt.gesetzt} : null,
    bkSt.nogo ? {k:'No-Go', v:bkSt.nogo} : null,
  ].filter(Boolean);

  const row = (r, isSoft) =>
    `<div class="bk-sr${isSoft?' soft':''}${r.hl?' highlight':''}">
      <span class="bk-sk">${r.k}</span>
      <span class="bk-sv">${r.v}</span>
    </div>`;

  const el = document.getElementById('bk-final-summary');
  if (el) el.innerHTML = `
    <div class="bk-smr">
      <div class="bk-smr-t">Zusammenfassung Deiner Anfrage</div>
      ${hard.map(r => row(r, false)).join('')}
      ${soft.length ? '<div class="bk-smr-section-label">Details & Wünsche</div>' : ''}
      ${soft.map(r => row(r, true)).join('')}
    </div>`;
}

window.bkSubmit = function() {
  const fn = document.getElementById('bk-fname').value.trim();
  const em = document.getElementById('bk-femail').value.trim();
  if (!fn || !em) { alert('Bitte Vorname und E-Mail ausfüllen.'); return; }
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

function bkInitKonfigurator() {
  bkRenderStep1Tracks();
  bkSyncSlOpts('ql', bkSt.ql);
  bkSyncSlOpts('cr', bkSt.cr);
  bkUpdateStep5();
  bkUpdateNavButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bkInitKonfigurator);
} else {
  bkInitKonfigurator();
}

})();
