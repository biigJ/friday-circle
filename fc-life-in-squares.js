// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const NOW = 2026;
const SPAN = 90;

const ERA_DEF = {
  PRE:    { label:'Vor dem Web',     cls:'sq-pre',    tag:'#e2dfd7', tagFg:'#5a5a54' },
  EARLY:  { label:'Frühes Internet', cls:'sq-early',  tag:'#ceeac4', tagFg:'#1a5a2a' },
  SOCIAL: { label:'Social Media',    cls:'sq-social', tag:'#fde6c0', tagFg:'#7a3a08' },
  CRISIS: { label:'Krise & Wandel',  cls:'sq-crisis', tag:'#fad4cc', tagFg:'#8a1a0a' },
  NOW:    { label:'Heute',           cls:'sq-now',    tag:'#1a1a18', tagFg:'#f0eee6' },
  FUTURE: { label:'Zukunft',         cls:'sq-future', tag:'#dddbd3', tagFg:'#6a6a60' },
};

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

function setPanelOpen(open) {
  const panel = document.getElementById('panel');
  const placeholder = document.getElementById('panelPlaceholder');
  if (panel) panel.classList.toggle('visible', open);
  if (placeholder) placeholder.classList.toggle('is-hidden', open);
}

function renderIdlePanel() {
  const yearEl = document.getElementById('pYear');
  const eraEl = document.getElementById('pEra');
  const eventEl = document.getElementById('pEvent');
  const tabsEl = document.getElementById('panelTabs');
  if (!yearEl || !tabsEl) return;

  yearEl.textContent = 'klick auf eine Jahreszahl ↑';
  yearEl.classList.add('panel-year--hint');
  if (eraEl) eraEl.style.display = 'none';
  if (eventEl) eventEl.style.display = 'none';

  const tabs = [
    { id: 'global', label: 'Welt' },
    { id: 'society', label: 'Gesellschaft' },
    { id: 'pos', label: 'Chancen' },
    { id: 'agency', label: 'Was kann ich schon heute tun?' },
  ];
  tabsEl.innerHTML = tabs
    .map(
      (t) =>
        `<button class="ptab${t.id === activeTab ? ' active' : ''}" onclick="switchTab('${t.id}')">${t.label}</button>`
    )
    .join('');

  document.getElementById('pStats').innerHTML = `
    <div class="stat-cell"><div class="stat-label">Screentime</div><div class="stat-val">—</div><div class="stat-desc">Std/Tag/Mensch</div><div class="stat-trend">Basiseinheit</div></div>
    <div class="stat-cell"><div class="stat-label">Freundschaften</div><div class="stat-val">—</div><div class="stat-desc">Echte Freundschaften / Mensch (westl. Gesellschaft)</div><div class="stat-trend">Basiseinheit</div></div>
    <div class="stat-cell"><div class="stat-label">Freiheit</div><div class="stat-val">—</div><div class="stat-desc">% freie Gesellschaft weltweit</div><div class="stat-trend">Basiseinheit</div></div>
    <div class="stat-cell"><div class="stat-label">BMI</div><div class="stat-val">—</div><div class="stat-desc">Durchm. BMI weltweit</div><div class="stat-trend">Basiseinheit</div></div>
    <div class="stat-cell"><div class="stat-label">Polarisierung</div><div class="stat-val">—</div><div class="stat-desc">% mediale Polarisierung inkl. Social Media weltweit</div><div class="stat-trend">Basiseinheit</div></div>
  `;
  document.getElementById('pInsights').innerHTML =
    '<div class="insight-flow"><div class="insight-text">Wähle ein Jahr, um die Hauptthemen zu sehen.</div></div>';
  document.getElementById('pPos').innerHTML = `
    <div class="pos-block"><div class="pos-head"><span class="pos-icon">🧠</span><span class="pos-title">Mentales</span></div><div class="pos-text">Kategorie aktiv.</div></div>
    <div class="pos-block"><div class="pos-head"><span class="pos-icon">💪</span><span class="pos-title">Körper</span></div><div class="pos-text">Kategorie aktiv.</div></div>
    <div class="pos-block"><div class="pos-head"><span class="pos-icon">🤝</span><span class="pos-title">Gemeinschaft</span></div><div class="pos-text">Kategorie aktiv.</div></div>
    <div class="pos-block"><div class="pos-head"><span class="pos-icon">🔬</span><span class="pos-title">Technologie</span></div><div class="pos-text">Kategorie aktiv.</div></div>
  `;
  document.getElementById('pGlobal').innerHTML = `
    <div class="global-block"><div class="global-region">Weltmacht USA</div><div class="global-text">Kategorie aktiv.</div></div>
    <div class="global-block"><div class="global-region">Aufstrebendes China</div><div class="global-text">Kategorie aktiv.</div></div>
    <div class="global-block"><div class="global-region">Alte Welt</div><div class="global-text">Kategorie aktiv.</div></div>
    <div class="global-block"><div class="global-region">Neue Welt</div><div class="global-text">Kategorie aktiv.</div></div>
  `;
  document.getElementById('pAgencyIntro').innerHTML =
    'Wähle ein Jahr, um einen alters- und kontextabhängigen Handlungstext zu sehen.';

  switchTab(activeTab);
  setPanelOpen(true);
}

const YEAR_DATA = {

  // ─────────────────────────────────────────────
  // PRE-INTERNET ERA  1950–1968
  // ─────────────────────────────────────────────

  1950: {
    event: "Kein Internet — Welt der Briefe, Telefone, Zeitungen",
    sub: "Information reist langsam. Meinung bildet sich im Gespräch, nicht im Feed.",
    screen: 0, friends: 18, bmi: 22.5, polar: 25,
    neg: [
      "Körperliche Arbeit ist Alltag für die Mehrheit — aber Armut, schlechte Ernährung und fehlende Gesundheitsversorgung kosten Lebensjahre.",
      "Massenmedien beginnen: Zeitungen und Radio formen Meinung. Propaganda-Erfahrung aus dem Krieg ist frisch.",
      "Bildung bleibt Privileg: Wer nicht aus der richtigen Familie kommt, hat kaum Chancen auf höhere Bildung."
    ],
    pos: [
      "Wohlfahrtsstaaten entstehen: Soziale Sicherung, Krankenversicherung, Rente für alle — historisch einmalig.",
      "Körper in Bewegung: Gehen, Radfahren, körperliche Arbeit sind Norm. Übergewicht ist selten.",
      "Wiederaufbau als kollektive Energie: Gemeinschaft entsteht durch geteilte Aufgabe.",
      "Erste Antibiotika: Penicillin rettet Millionen. Medizinischer Fortschritt beschleunigt sich."
    ],
    global: [
      "USA und Sowjetunion teilen die Welt in zwei Blöcke. Kalter Krieg beginnt — gefährlich, aber mit klaren Regeln.",
      "China: Mao gründet Volksrepublik 1949. 600 Millionen Menschen hinter dem Bambusvorhang.",
      "Korea-Krieg 1950–53: Erster Proxy-Krieg der Supermächte. 3 Millionen Tote.",
      "Dekolonisierung beginnt: Indien unabhängig seit 1947. Afrika und Asien streben nach Selbstbestimmung."
    ],
    agency: null
  },

  1951: {
    event: "UNIVAC I — erster kommerzieller Computer in den USA",
    sub: "Nur Regierungen und Großkonzerne können ihn sich leisten. Zimmergroß.",
    screen: 0, friends: 18, bmi: 22.6, polar: 25,
    neg: [
      "Arbeitswelt: Fabrikarbeit dominiert. Körper verschleißt schnell, Renteneintritt oft zu spät.",
      "Radio als Leitmedium: Wer das Mikrofon hat, hat die Macht. McCarthyismus in den USA.",
      "Frauen systematisch aus Bildung und Beruf ausgeschlossen — Hälfte des Potenzials verschwendet."
    ],
    pos: [
      "Gemeinschaftsleben blüht: Vereine, Gewerkschaften, Kirchen als echter sozialer Kitt.",
      "Ernährung: Frisch, saisonal, selbstgekocht — noch keine Fertigprodukte in der Breite.",
      "Bildungsreformen beginnen in Nordeuropa: Chancen für Arbeiterkinder wachsen.",
      "Internationale Institutionen entstehen: UN, WHO, IMF — erste Versuche globaler Kooperation."
    ],
    global: [
      "NATO gegründet 1949. Westeuropa unter US-Schutzschirm — Frieden durch Abschreckung.",
      "Japan: US-Besatzung endet. Demokratie und Wirtschaftswunder beginnen.",
      "Sowjetunion testet Atombombe 1949. Gleichgewicht des Schreckens als Friedensstrategie.",
      "Ägypten, Iran: Erste Nationalisierungen von Ressourcen. Westen reagiert mit Interventionen."
    ],
    agency: null
  },

  1952: {
    event: "Erste Transistor-Radios — Massenmedium für alle",
    sub: "Information wird mobil. Jeder kann überall hören, was die Welt bewegt.",
    screen: 0, friends: 18, bmi: 22.7, polar: 25,
    neg: [
      "Smog-Katastrophe London 1952: 12.000 Tote. Industrialisierung hat unsichtbare Kosten.",
      "Radio-Propaganda: Korea-Krieg zeigt, wie Medien Feindbilder konstruieren.",
      "Rassentrennung in den USA offiziell — Millionen Bürger zweiter Klasse."
    ],
    pos: [
      "Polio-Impfstoff in Entwicklung (Salk, 1952/53): Kinderlähmung wird besiegbar.",
      "Wirtschaftswunder beginnt in Deutschland: Vollbeschäftigung, Wohlstand für breite Schichten.",
      "Frauenwahlrecht setzt sich global durch: Neue Länder geben Frauen Stimme.",
      "Erste Herzoperationen: Medizin tritt ins Zeitalter der Reparatur."
    ],
    global: [
      "Eisenhower wird US-Präsident: Kalter Krieg professionalisiert sich.",
      "Ägypten: Nasser-Revolution. Arabische Welt sucht eigenen Weg zwischen den Blöcken.",
      "Sowjetunion nach Stalins Tod (1953): Entstalinisierung beginnt zaghaft.",
      "Mau-Mau-Aufstand Kenia: Koloniale Unterdrückung und antikolonialer Widerstand eskalieren."
    ],
    agency: null
  },

  1953: {
    event: "DNA-Doppelhelix entdeckt — Watson & Crick",
    sub: "Das Buch des Lebens wird lesbar. Medizin und Biologie werden nie mehr dieselben sein.",
    screen: 0, friends: 18, bmi: 22.7, polar: 24,
    neg: [
      "Herz-Kreislauf-Erkrankungen steigen: Erste Folgen der sich verändernden Ernährung und Rauchen.",
      "McCarthyismus USA: Hysterie, Denunziation, Meinungsfreiheit unter Druck.",
      "Korea-Krieg endet ohne Sieger: Erste Generation lernt, dass Krieg keine Lösung ist."
    ],
    pos: [
      "DNA-Entdeckung: Grundlage für Genetik, Medizin, Forensik. Jahrhundertfund.",
      "Stalins Tod: 100 Millionen Menschen unter Gulag-System atmen auf.",
      "Mount Everest bezwungen: Menschliche Grenzen werden neu gezogen.",
      "UN-Flüchtlingskonvention 1951 tritt in Kraft: Schutz für Vertriebene als Rechtsprinzip."
    ],
    global: [
      "Stalin stirbt. Sowjetunion beginnt vorsichtige Öffnung unter Chruschtschow.",
      "Korea-Waffenstillstand: Geteiltes Land, gefrorener Konflikt bis heute.",
      "Iran: CIA und MI6 stürzen gewählten Premier Mossadegh — Öl als Motiv.",
      "Kenia, Kongo, Gold Coast: Antikolonialer Widerstand wächst überall."
    ],
    agency: null
  },

  1954: {
    event: "Erster Transistor-Computer (TRADIC) — Miniaturisierung beginnt",
    sub: "Computer werden kleiner. Noch Jahrzehnte entfernt vom Heimgerät — aber der Weg ist geebnet.",
    screen: 0.2, friends: 18, bmi: 22.8, polar: 24,
    neg: [
      "Erste TV-Geräte in deutschen Haushalten: Das Wohnzimmer verändert sich. Gespräch wird weniger.",
      "Werbung entdeckt das Fernsehen: Konsum als Lebensmodell beginnt.",
      "Bildungszugang: Gymnasium bleibt für Arbeiterkinder faktisch verschlossen."
    ],
    pos: [
      "Bundesverfassungsgericht gegründet: Rechtsstaat als Institution gestärkt.",
      "Erster Nierentransplantation (USA): Organmedizin wird real.",
      "UNESCO: Globale Alphabetisierungsprogramme starten.",
      "Wirtschaftswunder: Vollbeschäftigung in Deutschland, Österreich, Frankreich."
    ],
    global: [
      "McCarthy-Hearings live im TV: Amerika sieht Demagogie in Echtzeit — und wendet sich ab.",
      "Dien Bien Phu: Frankreich verliert gegen Vietnam. Kolonialzeit läuft ab.",
      "Guatemala: CIA-Putsch gegen gewählte Regierung. Kalter Krieg hat keine Regeln.",
      "Erster Kernkraftreaktor (Sowjetunion): Atomkraft als Hoffnung und Bedrohung."
    ],
    agency: null
  },

  1955: {
    event: "IBM 650 — erster Massencomputer für Unternehmen",
    sub: "Banken und Universitäten beginnen zu rechnen. Verwaltung wird digital.",
    screen: 0.3, friends: 17, bmi: 22.9, polar: 24,
    neg: [
      "Fernsehen nimmt Platz in 40% der US-Haushalte: Abendprogramm ersetzt Gespräch.",
      "Konsumgesellschaft nimmt Form an: Kredit, Auto, Kühlschrank als Statussymbole.",
      "Erste Fast-Food-Ketten (McDonald's 1955): Ernährungskultur beginnt sich zu verschieben."
    ],
    pos: [
      "Polio-Impfstoff zugelassen (Salk): Kinderkrankheit wird besiegbar.",
      "Rosa Parks verweigert den Platz: Bürgerrechtsbewegung nimmt Fahrt auf.",
      "Disneyland eröffnet: Massenunterhaltung — aber auch kollektive Freude.",
      "Volkswagen Käfer: Mobilität für alle. Erste Generation fährt selbst."
    ],
    global: [
      "Warschauer Pakt gegründet: Europa in zwei Militärblöcke geteilt.",
      "Bandung-Konferenz: 29 afroasiatische Länder fordern Neutralität und Selbstbestimmung.",
      "Vietnam: USA übernimmt französische Rolle. Eskalation beginnt leise.",
      "Argentinien: Perón gestürzt. Lateinamerika zwischen Militär und Demokratie."
    ],
    agency: null
  },

  1956: {
    event: "Erste Computerprogrammiersprache FORTRAN in Entwicklung",
    sub: "Menschen beginnen, Maschinen in ihrer eigenen Sprache zu befehlen.",
    screen: 0.4, friends: 17, bmi: 22.9, polar: 25,
    neg: [
      "Ungarn-Aufstand niedergeschlagen: Freiheitshoffnung von Panzern überrollt.",
      "Suez-Krise: Großmächte zeigen, dass internationale Regeln für sie nicht gelten.",
      "Rüstungsausgaben fressen Sozialbudgets auf beiden Seiten des Eisernen Vorhangs."
    ],
    pos: [
      "Chruschtschow-Rede: Stalin-Verbrechen offiziell anerkannt — Wahrheit hat Kraft.",
      "Elvis, Rock'n'Roll: Jugend findet eigene Stimme und Kultur.",
      "Erster Transatlantikflug für Passagiere: Welt rückt zusammen.",
      "Sudan, Marokko, Tunesien unabhängig: Dekolonisierung beschleunigt sich."
    ],
    global: [
      "Ungarn-Aufstand und Suez-Krise gleichzeitig: Westliche Doppelmoral sichtbar.",
      "Japan: Wirtschaftswunder beginnt. Erster asiatischer Industriestaat entsteht.",
      "Sowjetunion: Chruschtschow öffnet vorsichtig. Kulturell Tauwetter.",
      "Ghana 1957 unabhängig: Ersten unabhängigen Schwarzafrikanischen Staat. Nkrumah als Symbol."
    ],
    agency: null
  },

  1957: {
    event: "Sputnik — erster Satellit im Weltall",
    sub: "Sowjetunion schickt einen Ball um die Erde. Kalter Krieg geht ins All. DARPA wird gegründet.",
    screen: 0.5, friends: 17, bmi: 23.0, polar: 25,
    neg: [
      "Weltraum-Rüstung beginnt: Milliarden fließen in Raketen statt in Schulen.",
      "Atomangst: Schulkinder üben 'Duck and Cover'. Existenzielle Bedrohung als Alltag.",
      "Massenkonsum beschleunigt: Wegwerfkultur beginnt mit Plastik."
    ],
    pos: [
      "DARPA gegründet: Aus Militärforschung wird Jahrzehnte später das Internet entstehen.",
      "Weltraumfahrt als Vorbild: Eine ganze Generation träumt von Wissenschaft.",
      "Europäische Gemeinschaft gegründet (1957): Frieden durch wirtschaftliche Integration.",
      "Polio weltweit fast ausgerottet: Impfungen wirken."
    ],
    global: [
      "USA: Sputnik-Schock führt zu Bildungsinvestition. NASA entsteht 1958.",
      "Sowjetunion: Technologischer Triumph. Kurze Phase des Optimismus.",
      "Ghana unabhängig: Pan-Afrikanismus als Bewegung, Nkrumah als Stimme.",
      "Asien: Indien unter Nehru — blockfreie Bewegung als dritter Weg."
    ],
    agency: null
  },

  1958: {
    event: "DARPA gegründet — Mutter des späteren Internets",
    sub: "Das Militär will ein bombensicheres Kommunikationsnetz. Aus dieser Aufgabe entsteht ARPANET.",
    screen: 0.5, friends: 17, bmi: 23.0, polar: 25,
    neg: [
      "Mao: Großer Sprung nach vorn beginnt — einer der größten Hunger-Katastrophen des 20. Jh.",
      "Algerien-Krieg eskaliert: Frankreich kämpft für Kolonialbesitz mit brutalen Mitteln.",
      "Atomwaffentests: USA und USSR testen in Atmosphäre — radioaktiver Fallout weltweit."
    ],
    pos: [
      "NASA gegründet: Öffentliche Raumfahrt als gemeinsames Projekt der Menschheit.",
      "EG Römische Verträge: Europa als Friedensprojekt nimmt Form an.",
      "Stereophon-Schallplatten: Musik als Massenkultur.",
      "Erste Kreditkarte (BankAmericard): Neue wirtschaftliche Freiheit — mit Risiken."
    ],
    global: [
      "Eisenhower warnt vor 'militärisch-industriellem Komplex' — weitsichtig, ignoriert.",
      "China: Mao's Experiment beginnt. 15–55 Millionen Tote durch Hungersnot bis 1962.",
      "Frankreich: De Gaulle kehrt zurück. 5. Republik. Algerien-Krise.",
      "Afrika: 17 Länder werden 1960 unabhängig — 'Jahr Afrikas'."
    ],
    agency: null
  },

  1959: {
    event: "Integrierter Schaltkreis (Chip) erfunden — Kilby & Noyce",
    sub: "Aus Zimmern werden Schreibtische. Der Weg zum persönlichen Computer ist geebnet.",
    screen: 0.6, friends: 17, bmi: 23.1, polar: 25,
    neg: [
      "Kuba-Revolution: Castro übernimmt. USA verliert Einfluss vor der eigenen Haustür.",
      "Rüstungswettlauf kostet beide Supermächte Billionen, die in Bildung fehlen.",
      "Frauen in Westdeutschland brauchen Erlaubnis des Mannes für Berufstätigkeit und Bankkonto."
    ],
    pos: [
      "Chip-Erfindung: Jahrzehnte später in jedem Smartphone. Größte Erfindung des Jahrhunderts.",
      "Bürgerrechtsbewegung USA nimmt Fahrt: Sit-ins, Boykotte — gewaltloser Widerstand funktioniert.",
      "Antarktis-Vertrag: 12 Länder erklären Kontinent zur wissenschaftsfreien Zone. Kooperation funktioniert.",
      "Erste Pille zugelassen (USA, 1960): Reproduktive Selbstbestimmung für Frauen."
    ],
    global: [
      "Kuba-Revolution: Kleines Land trotzt Supermacht. Symbol für den Globalen Süden.",
      "China-Sowjet-Bruch beginnt: Kommunismus ist keine Einheit.",
      "Kongo unabhängig 1960: Belgien zieht in Chaos ab. Lumumba ermordet — westliche Beteiligung.",
      "OPEC gegründet 1960: Rohstoffländer organisieren sich gegen Preisdiktat."
    ],
    agency: null
  },

  1960: {
    event: "Erste Lasertechnologie — Bell Labs",
    sub: "Licht wird steuerbar. Jahrzehnte später: Glasfaserkabel, die das Internet tragen.",
    screen: 0.7, friends: 17, bmi: 23.2, polar: 26,
    neg: [
      "TV-Debatte Kennedy-Nixon: Wer gut aussieht, gewinnt. Politik wird zur Inszenierung.",
      "Erste Fast-Food-Expansion: Ernährungsgewohnheiten verschieben sich schnell.",
      "Rassismus in Europa: Gastarbeiter ohne Rechte, ohne Perspektive auf Teilhabe."
    ],
    pos: [
      "Kennedy-Wahl: Junge Generation übernimmt Verantwortung. Optimismus ist real.",
      "17 afrikanische Staaten unabhängig: Selbstbestimmung als gelebte Realität.",
      "Welternährungsprogramm entsteht: Globale Hunger-Bekämpfung koordiniert.",
      "Verhütungspille: Frauen gewinnen Kontrolle über ihr Leben."
    ],
    global: [
      "Kongo: Chaos nach Unabhängigkeit. UN-Mission. Lumumba ermordet.",
      "China: Hungersnot tötet Millionen. Information davon geheim gehalten.",
      "Sowjetunion: Erster Mensch im Weltall vorbereitet (Gagarin 1961).",
      "Lateinamerika: Kubanische Revolution als Inspiration und Warnung."
    ],
    agency: null
  },

  1961: {
    event: "Gagarin im All — und erster US-Astronaut",
    sub: "Mensch verlässt die Erde. Für einen Moment ist die Welt geeint im Staunen.",
    screen: 0.8, friends: 17, bmi: 23.2, polar: 26,
    neg: [
      "Berliner Mauer gebaut: 28 Jahre Trennung von Familien. Freiheit als verlorenes Privileg.",
      "Bay of Pigs: USA scheitert mit Invasion Kubas. Interventionismus als Prinzip.",
      "Atombombentests eskalieren: Radioaktiver Fallout in der Nahrung aller Menschen."
    ],
    pos: [
      "Gagarin: Ein Mensch im All. Russisch, aber die Welt feiert gemeinsam.",
      "Peace Corps gegründet: Junge Amerikaner helfen weltweit. Idealismus in Aktion.",
      "Amnesty International gegründet: Menschenrechte als zivilgesellschaftliche Aufgabe.",
      "UNICEF wächst: Kinderschutz global koordiniert."
    ],
    global: [
      "Berliner Mauer: Europa offiziell geteilt. Symbolbild des Kalten Krieges.",
      "Vietnam: Kennedy schickt 'Berater'. Eskalation beginnt.",
      "Algerien: Unabhängigkeitskrieg endet. Frankreich verliert. Dekolonisierung unaufhaltsam.",
      "Non-Alignment: Jugoslawien, Indien, Indonesien — dritter Weg zwischen den Blöcken."
    ],
    agency: null
  },

  1962: {
    event: "Erste Telekommunikations-Satelliten (Telstar)",
    sub: "TV-Bilder über den Atlantik in Echtzeit. Die Welt schrumpft.",
    screen: 1.0, friends: 17, bmi: 23.3, polar: 27,
    neg: [
      "Kuba-Krise: 13 Tage am Rand des Atomkriegs. Die Welt hält den Atem an.",
      "Rachel Carson 'Silent Spring': Pestizide vergiften Natur still. Niemand bemerkt es.",
      "Thalidomid-Skandal: Contergan verursacht Fehlbildungen. Pharmaindustrie ohne ausreichende Kontrolle."
    ],
    pos: [
      "Kuba-Krise endet durch Diplomatie: Gesprächskanäle retten die Welt.",
      "Silent Spring: Umweltbewegung beginnt. Erstes globales Umweltbewusstsein.",
      "Zweites Vatikanisches Konzil: Katholische Kirche öffnet sich zaghaft.",
      "Algerien frei: 132 Jahre Kolonialherrschaft enden."
    ],
    global: [
      "Kuba-Krise: Welt am Abgrund. Atomkrieg durch Zufall vermieden.",
      "China-Indien-Krieg: Blockfreie Bewegung zeigt Risse.",
      "Algerien unabhängig nach 7 Jahren Krieg: 1 Million Tote.",
      "Uganda, Kenia, Tansania: Ostafrika wird unabhängig."
    ],
    agency: null
  },

  1963: {
    event: "ARPANET-Konzept entsteht — J.C.R. Licklider schreibt das erste Memo",
    sub: "Ein Psychologe am MIT beschreibt ein 'galaktisches Computernetzwerk'. Die Blaupause ist gezeichnet.",
    screen: 1.0, friends: 17, bmi: 23.3, polar: 27,
    neg: [
      "Kennedy ermordet: Erstes politisches Trauma live im Fernsehen. Eine Generation verliert ihre Hoffnung.",
      "Vietnam: Johnson eskaliert. Erster moderner Medienkrieg beginnt.",
      "Rassentrennung USA: Bürgerrechtler werden ermordet. King marschiert."
    ],
    pos: [
      "Licklider-Memo: Das Konzept des Internets ist geboren — von einem Humanisten, nicht einem Militär.",
      "King: 'I have a Dream' — einer der wirkungsvollsten Reden der Geschichte.",
      "Heißer Draht Moskau-Washington: Direkte Kommunikation nach Kuba-Krise.",
      "Frauen im Weltall: Walentina Tereschkowa, erste Frau im All."
    ],
    global: [
      "Kennedy-Mord: Vertrauen in Institutionen in den USA beginnt zu bröckeln.",
      "OAU gegründet: Afrika organisiert sich politisch.",
      "Vietnam: USA tief verwickelt. Domino-Theorie treibt Entscheidungen.",
      "Malaysia gegründet: Postkoloniales Nation-Building in Südostasien."
    ],
    agency: null
  },

  1964: {
    event: "IBM System/360 — erste universelle Computerfamilie",
    sub: "Computer sprechen jetzt eine gemeinsame Sprache. Kompatibilität als Prinzip.",
    screen: 1.1, friends: 16, bmi: 23.4, polar: 28,
    neg: [
      "Tonkin-Zwischenfall: Konstruierter Kriegsanlass. Medien berichten unreflektiert.",
      "Erste Tabakstudien belegen Krebs-Zusammenhang — Industrie kämpft dagegen jahrzehntelang.",
      "Rassengesetze in Südafrika auf dem Höhepunkt: Apartheid als Staatsdoktrin."
    ],
    pos: [
      "Civil Rights Act USA: Diskriminierung offiziell verboten. Recht als Fortschrittsmotor.",
      "Marshallplan-Nachwirkung: Europas Mittelschicht wächst und wächst.",
      "Erste Herzschrittmacher: Technologie verlängert Leben.",
      "Nelson Mandela verurteilt, aber nicht gebrochen: Moralische Autorität wächst im Gefängnis."
    ],
    global: [
      "Vietnam: Tonkin-Resolution gibt Johnson Blankovollmacht. Krieg ohne Kriegserklärung.",
      "China: Atombombe getestet. Vierte Atommacht.",
      "Südafrika: Mandela zu lebenslanger Haft. Welt schaut weg.",
      "Tansania, Sambia: Julius Nyerere — afrikanischer Sozialismus als Experiment."
    ],
    agency: null
  },

  1965: {
    event: "Moore's Law — Chip-Dichte verdoppelt sich alle zwei Jahre",
    sub: "Gordon Moore beschreibt ein Prinzip, das 50 Jahre gilt und die Digitalisierung antreibt.",
    screen: 1.2, friends: 16, bmi: 23.5, polar: 28,
    neg: [
      "Vietnam-Krieg: Erste Antikriegs-Demos. Gesellschaft beginnt sich zu spalten.",
      "Watts-Aufstand Los Angeles: Rassismus und Armut explodieren. Reform nicht Realität.",
      "Erste Beschreibungen von TV-Sucht: Passivität als gesellschaftliches Problem."
    ],
    pos: [
      "Medicare/Medicaid USA: Gesundheitsversorgung für Arme und Alte als Staatsaufgabe.",
      "Voting Rights Act: Schwarze Amerikaner bekommen Wahlrecht effektiv.",
      "Minikleid: Frauen bestimmen selbst, wie sie aussehen.",
      "Beatles: Populärkultur als globale Sprache."
    ],
    global: [
      "Vietnam: Erste US-Kampftruppen. 500.000 Soldaten bis 1968.",
      "Indonesien: Suharto-Putsch, bis zu 500.000 Kommunisten ermordet. Westen schaut weg.",
      "Rhodesien: Weiße Minderheit erklärt einseitig Unabhängigkeit. Apartheid in neuer Form.",
      "Indien-Pakistan-Krieg: Kaschmir-Konflikt schwelt bis heute."
    ],
    agency: null
  },

  1966: {
    event: "ARPANET offiziell finanziert — DARPA bewilligt Mittel",
    sub: "Das Netz, aus dem das Internet wird, bekommt sein Budget. Noch kein einziges Kabel verlegt.",
    screen: 1.3, friends: 16, bmi: 23.5, polar: 29,
    neg: [
      "Kulturrevolution China: Bildung zerstört, Intellektuelle verfolgt. Jahrzehnte des Rückschritts.",
      "Vietnam: Napalm, Agentum Orange — Krieg als Medienereignis erzieht eine Generation zur Skepsis.",
      "Erste McDonald's in Deutschland: Fast Food als Normalität etabliert sich."
    ],
    pos: [
      "Star Trek erste Folge: Diverse Crew, Frauen in Führung, Technologie als Hoffnung.",
      "Umweltbewegung wächst: Erste Greenpeace-Vorläufer.",
      "Computerwissenschaft als Studienfach entsteht: Neue Generation lernt Programmieren.",
      "Antibabyhormon: Frauen in Europa gewinnen reproduktive Freiheit."
    ],
    global: [
      "China Kulturrevolution: 1–2 Millionen Tote, Bildungssystem zerstört.",
      "Sowjetunion: Kosmos-Programm. Erste unbemannte Mondlandung.",
      "Israel-Arabien: 6-Tage-Krieg 1967 in Vorbereitung. Nahostkonflikt neu konfiguriert.",
      "Afrika: Biafra-Krieg kündigt sich an. Post-koloniale Grenzen als Bürgerkriegsursache."
    ],
    agency: null
  },

  1967: {
    event: "Erste ATM-Geldautomaten — Barclays Bank London",
    sub: "Geld wird automatisiert. Ein kleiner Schritt zur bargeldlosen Gesellschaft.",
    screen: 1.4, friends: 16, bmi: 23.6, polar: 29,
    neg: [
      "Sommer der Liebe — aber auch Rassenunruhen in 150 US-Städten.",
      "Erster Herzinfarkt als 'Managerkrankheit': Stress und Bewegungsmangel als Zivilisationskrankheit.",
      "Werbung entdeckt Jugendkultur: Rebellion wird kommerzialisiert."
    ],
    pos: [
      "Barnard: Erste Herztransplantation. Medizin besiegt Grenzen.",
      "Beatles 'Sgt. Pepper': Kunst und Populärkultur verschmelzen.",
      "EG wächst: Wohlstand und Frieden in Westeuropa normalisiert.",
      "Erster Umweltgipfel in Vorbereitung (Stockholm 1972)."
    ],
    global: [
      "6-Tage-Krieg: Israel besetzt Westbank, Gaza, Sinai. Konflikt bis heute ungelöst.",
      "Vietnam: Tet-Offensive 1968 in Vorbereitung. USA kann nicht gewinnen.",
      "Che Guevara getötet: Symbol des Widerstands stirbt, Mythos entsteht.",
      "Biafra-Krieg: Nigeria. 1–3 Millionen Hungertote. Westliche Medien berichten endlich."
    ],
    agency: null
  },

  1968: {
    event: "Intel gegründet — Moore und Noyce bauen die Chip-Fabrik",
    sub: "Die Firma, die jahrzehntelang jeden Computer mit dem Gehirn versorgt.",
    screen: 1.5, friends: 16, bmi: 23.7, polar: 31,
    neg: [
      "1968: King ermordet, Kennedy ermordet, Paris-Mai, Prag-Frühling niedergewalzt. Eine Generation verliert Glauben.",
      "Tet-Offensive: USA-Militär hat Öffentlichkeit belogen. Medienvertrauen bricht erstmals.",
      "Konsumgesellschaft vs. Rebellion: Werte-Konflikt, der bis heute nachwirkt."
    ],
    pos: [
      "Pille für alle: Reproduktive Revolution setzt sich in Europa durch.",
      "Erster Erdaufgang-Foto (Apollo 8): Menschen sehen ihren Planeten erstmals von außen.",
      "Studentenbewegungen: Demokratisierung von Universitäten und Gesellschaft.",
      "Internationale Menschenrechtskonventionen gestärkt."
    ],
    global: [
      "Prag: Dubček's 'Sozialismus mit menschlichem Antlitz' von Panzern zerquetscht.",
      "Vietnam: Tet zeigt, USA kann nicht siegen. Rückzug wird vorbereitet.",
      "Mexiko: Studentenmassaker vor Olympia. Regierungen weltweit schießen auf Bürger.",
      "Nordkorea: Kim Il-sung konsolidiert Macht. Dynastische Diktatur entsteht."
    ],
    agency: null
  },

  // ─────────────────────────────────────────────
  // INTERNET BORN  1969–1990
  // ─────────────────────────────────────────────

  1969: {
    event: "ARPANET — erster Knoten verbindet UCLA mit Stanford",
    sub: "Am 29. Oktober 1969: 'lo'. Das erste Wort im Netz. Absturz nach zwei Buchstaben. Login wird nicht fertig.",
    screen: 1.5, friends: 16, bmi: 23.8, polar: 30,
    neg: [
      "Woodstock und Altamont: Utopie und Gewalt im selben Jahr. Gegen-Kultur hat keine Antworten.",
      "Mondlandung live im TV: Erster echter Medien-Hype. Nachher folgt Desillusionierung.",
      "Vietnam-Krieg auf dem Höhepunkt: 58.000 US-Tote. Gesellschaft tief gespalten."
    ],
    pos: [
      "Mondlandung: Menschen verlassen die Erde. Alles scheint möglich.",
      "ARPANET: Eine Idee, die die Welt verändern wird — noch weiß es niemand.",
      "Stonewall-Aufstand: LGBTQ+-Bewegung nimmt Fahrt auf.",
      "Willy Brandt Kanzler: Entspannungspolitik als europäische Vision."
    ],
    global: [
      "Mondlandung: USA gewinnt symbolisch den Wettlauf.",
      "Vietnam: USA beginnt Rückzug unter Nixon. 'Vietnamisierung' des Krieges.",
      "Gadaffi übernimmt Libyen: Arabischer Nationalismus in neuer Form.",
      "Biafra-Krieg endet: Millionen Hungertote. Erster Krieg mit TV-Bildern."
    ],
    agency: null
  },

  1970: {
    event: "ARPANET wächst auf 10 Knoten — erste E-Mails folgen",
    sub: "Noch ein Werkzeug für Forscher. Niemand ahnt, dass daraus die größte Kommunikations-Infrastruktur der Geschichte wird.",
    screen: 1.6, friends: 16, bmi: 23.9, polar: 30,
    neg: [
      "Erstes Umweltschutzamt (EPA) USA: Beweise, dass Industrie die Natur zerstört.",
      "Disco beginnt: Eskapismus als kulturelle Antwort auf Vietnam und Watergate.",
      "Erste Übergewichts-Studien erscheinen: Fast Food zeigt Wirkung."
    ],
    pos: [
      "Earth Day: Umweltbewegung wird Massenbewegung — 20 Millionen Menschen.",
      "Erste Frauenhäuser: Häusliche Gewalt als gesellschaftliches Problem anerkannt.",
      "Willy Brandts Kniefall Warschau: Versöhnung durch Demut.",
      "Normalisierung mit China beginnt: Nixon-Kissinger-Diplomatie."
    ],
    global: [
      "Allende gewählt Chile: Demokratischer Sozialismus. 1973 durch CIA-Coup beendet.",
      "China: Lin Biao-Affäre. Mao-Ära zeigt erste Risse.",
      "Bangla Desh: Indien-Pakistan-Krieg. 3 Millionen Tote.",
      "Nairobi: UN-Umweltprogramm (UNEP) gegründet — erste globale Umweltbehörde."
    ],
    agency: null
  },

  1971: {
    event: "Erste E-Mail gesendet — Ray Tomlinson erfindet @-Zeichen",
    sub: "user@host.network. Eine Konvention, die bis heute gilt. Post wird digital.",
    screen: 1.6, friends: 16, bmi: 23.9, polar: 30,
    neg: [
      "Nixon beendet Goldstandard: Dollar von Gold entkoppelt. Finanzialisierung beginnt.",
      "Pentagon Papers: US-Regierung hat Öffentlichkeit über Vietnam belogen. Presse kämpft.",
      "Erstes Handy (Prototyp, 1973): Noch keine Auswirkungen, aber Richtung ist gesetzt."
    ],
    pos: [
      "@-Zeichen: Tomlinson erfindet es. Elegante Lösung für digitale Adressen.",
      "Greenpeace gegründet: Umweltschutz wird zur globalen Bewegung.",
      "Amnesty International Nobel Peace Prize: Menschenrechte als globale Norm anerkannt.",
      "Bangladesh unabhängig: Trotz allem entsteht Neues."
    ],
    global: [
      "Pentagon Papers: Watergate kündigt sich an. US-Staatspresse-Konflikt.",
      "China tritt UN bei: 1 Milliarde Menschen in der Weltgemeinschaft.",
      "Idi Amin putcht Uganda: Afrika kämpft mit kolonialen Erbschaften.",
      "Bangladesch entsteht: Aus Krieg und Leid ein neuer Staat."
    ],
    agency: null
  },

  1972: {
    event: "ARPANET mit 37 Knoten — erster öffentlicher Demo auf Konferenz",
    sub: "Erstmals zeigen Forscher das Netz der Öffentlichkeit. Staunen, aber keine Ahnung der Tragweite.",
    screen: 1.7, friends: 16, bmi: 24.0, polar: 30,
    neg: [
      "Watergate: Nixon lässt Demokraten bespitzeln. Vertrauen in Regierungen sinkt dauerhaft.",
      "Club of Rome: 'Grenzen des Wachstums' — Welt ignoriert die Warnung.",
      "Olympia München: Terroranschlag. Sicherheit als neues Paradigma."
    ],
    pos: [
      "Erster Umweltgipfel Stockholm: Nationen reden über Planeten. Erster Schritt.",
      "Title IX USA: Frauen gleichberechtigt im Hochschulsport. Dominoeffekt.",
      "Apollo 17: Letzter Mondflug. Schönstes Erdaufgangfoto.",
      "Erste CT-Scanner: Medizinische Bildgebung revolutioniert Diagnose."
    ],
    global: [
      "Nixon in China: Diplomatischer Durchbruch. Realpolitik funktioniert.",
      "Münchner Attentat: Terror als politisches Werkzeug. Neue Ära beginnt.",
      "Grenzen des Wachstums: Erste systemische Warnung. Ignoriert.",
      "Bangladesh: Erste Mikrokreditprojekte. Yunus beginnt sein Werk."
    ],
    agency: null
  },

  1973: {
    event: "TCP/IP konzipiert — Cerf & Kahn erfinden die gemeinsame Sprache des Netzes",
    sub: "Alle Computer der Welt sollen dieselbe Sprache sprechen. Das ist die eigentliche Erfindung des Internets.",
    screen: 1.7, friends: 15, bmi: 24.1, polar: 31,
    neg: [
      "Ölkrise: Erste Erkenntnis der Abhängigkeit von fossilen Brennstoffen. Ignoriert.",
      "Chile-Coup: Gewählte Regierung durch Militär gestürzt. USA involviert.",
      "Inflation in Europa: Wirtschaftswunder endet, Unsicherheit beginnt."
    ],
    pos: [
      "TCP/IP: Die universelle Sprache des Internets wird konzipiert. Cerf & Kahn.",
      "Roe v. Wade USA: Reproduktive Rechte für Frauen als Rechtsprinzip.",
      "Vietnam: Waffenstillstand. USA zieht ab — ein Krieg ohne Sinn endet.",
      "Erster MRT-Scanner in Entwicklung: Revolution der Medizin."
    ],
    global: [
      "Ölembargo: OPEC zeigt Macht. Westliche Welt lernt Verwundbarkeit.",
      "Chile: Pinochet. Erste Testphase des Neoliberalismus unter Militär.",
      "Yom-Kippur-Krieg: Nahost wieder in Flammen.",
      "Apartheid Südafrika: Internationaler Druck wächst. Boykott als Waffe."
    ],
    agency: null
  },

  1974: {
    event: "Erste persönliche Computer erscheinen — Altair 8800",
    sub: "Ein Bausatz für Hobbyisten. Bill Gates und Paul Allen schreiben dafür die erste Software.",
    screen: 1.8, friends: 15, bmi: 24.1, polar: 31,
    neg: [
      "Watergate: Nixon tritt zurück. Amerika vertraut seiner Regierung nicht mehr.",
      "Inflation + Rezession gleichzeitig: Stagflation — Wirtschaftstheorie versagt.",
      "Erste Supermarkt-Barcodes: Konsumgesellschaft beschleunigt sich."
    ],
    pos: [
      "Nixon-Rücktritt: Checks and Balances funktionieren. Demokratie überlebt.",
      "Altair 8800: Erste Hobbyisten bauen Computer zuhause. Community entsteht.",
      "Portugal: Nelken-Revolution. Diktatur endet gewaltlos.",
      "Erstes Hospiz in Deutschland: Sterben als Teil des Lebens anerkannt."
    ],
    global: [
      "Nixon-Rücktritt: USA-Demokratie besteht ihren ersten echten Stresstest.",
      "Äthiopien: Haile Selassie gestürzt. Afrika in turbulenten Transformationen.",
      "Indien: Atomtest. Drittes Land im Süden mit Nuklearwaffe.",
      "Portugal/Spanien: Letzte Diktaturen Westeuropas enden."
    ],
    agency: null
  },

  1975: {
    event: "Microsoft gegründet — Gates & Allen in Albuquerque",
    sub: "Zwei 19-jährige träumen davon, dass jeder Schreibtisch einen Computer hat. Revolutionär.",
    screen: 1.9, friends: 15, bmi: 24.3, polar: 31,
    neg: [
      "Saigon fällt: USA-Vietnam endet. 58.000 Tote für nichts. Trauma einer Generation.",
      "Kambodscha: Rote Khmer übernehmen. 2 Millionen Menschen sterben.",
      "Erste Beschreibungen von Couch-Potato-Kultur: TV-Stunden steigen."
    ],
    pos: [
      "Microsoft gegründet: Gates' Vision — jeder Schreibtisch mit Computer.",
      "Angola, Mosambik unabhängig: Portugal-Kolonialreich endet.",
      "Helsinki-Konferenz: Menschenrechte als gesamteuropäisches Prinzip.",
      "Erster Heimdialyse: Chronisch Kranke können zuhause behandelt werden."
    ],
    global: [
      "Vietnam: Kommunistische Einheit. Amerikanisches Trauma nachwirkt Jahrzehnte.",
      "Kambodscha: Pol Pot. Einer der schlimmsten Genozide des 20. Jahrhunderts.",
      "Angola: Bürgerkrieg nach Unabhängigkeit. Kalt-Kriegs-Proxy-Krieg.",
      "Spanien nach Franco: Demokratie durch Transition — Modell für andere."
    ],
    agency: null
  },

  1976: {
    event: "Apple Computer gegründet — Jobs & Wozniak in der Garage",
    sub: "Computer sollen nicht wie Instrumente für Experten aussehen — sondern wie Produkte für Menschen.",
    screen: 2.0, friends: 15, bmi: 24.4, polar: 31,
    neg: [
      "Disco und Konsum: Politische Energie der 60er verflüchtigt sich in Unterhaltung.",
      "Erster Skandal um synthetische Lebensmittel: Was ist noch natürlich?",
      "Armut in der Dritten Welt steigt: Strukturanpassungsprogramme des IWF beginnen."
    ],
    pos: [
      "Apple gegründet: Design trifft Technologie. Wozniak baut, Jobs verkauft.",
      "Jimmy Carter: Menschenrechte als Außenpolitik.",
      "Erste Herzbypass-Operationen in der Breite: Herzkrankheiten behandelbar.",
      "Concorde: Überschallflug als Realität — Technologie ohne Grenzen."
    ],
    global: [
      "Mao stirbt: China nach Mao. Viererbande, dann Deng.",
      "Südafrika: Soweto-Aufstand. Schüler sterben für das Recht auf Bildung.",
      "Angola-Bürgerkrieg eskaliert: Kuba sendet Truppen. Kaltkrieg in Afrika.",
      "Israel-PLO: Entebbe. Terrorismus als Waffe kleiner Gruppen."
    ],
    agency: null
  },

  1977: {
    event: "Apple II, TRS-80, Commodore PET — Heimcomputer werden Massenprodukt",
    sub: "Erstmals drei erschwingliche Computer für zuhause. Eine Generation lernt tippen.",
    screen: 2.1, friends: 15, bmi: 24.5, polar: 31,
    neg: [
      "Punk: Systemkritik als Stil. Aber auch Nihilismus — kein Angebot, nur Ablehnung.",
      "Erste Videospiele (Atari): Bildschirmzeit steigt bei Kindern.",
      "Erster Monokultur-Fast-Food-Boom: Ernährungsvielfalt schwindet."
    ],
    pos: [
      "Star Wars: Kino wird zur Massenunterhaltung — und Technologie zum Freund.",
      "Amnesty International wächst: 100.000 Mitglieder weltweit.",
      "Camp David: Carter vermittelt Israel-Ägypten-Frieden. Diplomatie wirkt.",
      "Erster MRT klinisch getestet: Medizin ohne Röntgenstrahlen."
    ],
    global: [
      "Camp David beginnt: Carter, Begin, Sadat. Frieden möglich.",
      "Kambodscha: Rote Khmer auf dem Höhepunkt des Terrors.",
      "Somalia-Äthiopien-Krieg: Afrikanische Grenzen aus Kolonialzeit explodieren.",
      "Pakistan: Bhutto gestürzt, Zia ul-Haq. Islamismus als Staatsdoktrin."
    ],
    agency: null
  },

  1978: {
    event: "TCP/IP-Protokoll finalisiert — das Fundament des Internets steht",
    sub: "Vint Cerf und Bob Kahn legen den Standard fest. Jedes Gerät, das je mit dem Internet verbunden wird, nutzt ihn.",
    screen: 2.2, friends: 15, bmi: 24.6, polar: 31,
    neg: [
      "Jonestown: 900 Tote in kollektivem Selbstmord. Gruppen-Manipulation als reale Gefahr.",
      "Iran: Islamische Revolution kündigt sich an. Westen versteht nicht.",
      "Erste Adipositas-Epidemie-Warnungen: Forscher bemerken den Trend."
    ],
    pos: [
      "TCP/IP finalisiert: Das Internet bekommt seine Sprache.",
      "Louise Brown: Erstes Retortenbaby. Reproduktionsmedizin revolutioniert.",
      "Camp David-Abkommen: Israel und Ägypten schließen Frieden.",
      "Deng Xiaoping öffnet China: Größtes Wirtschaftsexperiment der Geschichte beginnt."
    ],
    global: [
      "Iran-Revolution: Schah fällt, Khomeini kommt. Islamismus als politische Kraft.",
      "China: Deng Xiaoping. Vier Modernisierungen. Aufstieg beginnt.",
      "Camp David: Frieden zwischen Israel und Ägypten — möglich, wenn man will.",
      "Afghanistan: Kommunistischer Putsch. Widerstand mit US-Unterstützung beginnt."
    ],
    agency: null
  },

  1979: {
    event: "Erste kommerziellen Online-Dienste (CompuServe)",
    sub: "Wer ein Modem hat und zahlen kann, geht ins Netz. Noch 0,001% der Bevölkerung.",
    screen: 2.3, friends: 15, bmi: 24.7, polar: 32,
    neg: [
      "Iran-Geiselkrise: 444 Tage. USA erniedrigt. Islam-Westen-Konflikt beginnt.",
      "Sowjet-Invasion Afghanistan: Beginn eines 40-jährigen Konflikts.",
      "Thatcher: Deregulierung, Gewerkschaftszerschlagung. Schere beginnt zu öffnen."
    ],
    pos: [
      "Mutter Teresa Nobel Peace Prize: Mitgefühl als globale Botschaft.",
      "Sony Walkman: Musik wird mobil, persönlich.",
      "OPEC2-Krise führt zu: Energieeffizienz-Bewegung, erste Solarforschung.",
      "Erste CT-Scanner in europäischen Kliniken: Krebsdiagnose revolutioniert."
    ],
    global: [
      "Iran-Revolution: Islamische Republik. Neue globale Konfliktlinie entsteht.",
      "Afghanistan: Sowjetinvasion. USA finanziert Mudschaheddin. Späte Folgen: 9/11.",
      "Zimbabwe unabhängig (1980): Mugabe zunächst Hoffnung, dann Katastrophe.",
      "Nicaragua: Sandinisten stürzen Somoza. USA finanziert Contras."
    ],
    agency: null
  },

  1980: {
    event: "IBM PC und erste Personalcomputer-Welle",
    sub: "IBM legitimiert den Heimcomputer. Gates lizenziert DOS. Das Betriebssystem-Monopol beginnt.",
    screen: 2.5, friends: 14, bmi: 24.8, polar: 33,
    neg: [
      "Reagan: Steuersenkungen für Reiche, Sozialabbau. Ungleichheit steigt systematisch.",
      "MTV startet: Bilder ersetzen Texte. Aufmerksamkeit wird kürzer.",
      "Erste Beschreibungen des Burnout-Syndroms: Arbeitswelt krankt."
    ],
    pos: [
      "IBM PC: Computer werden Business-Standard. Eine neue Branche entsteht.",
      "Post-it erfunden: Kleine Innovation, große Wirkung.",
      "WHO erklärt Pocken für ausgerottet: Erster Sieg über eine Krankheit durch globale Kooperation.",
      "Lech Wałęsa: Solidarność — Arbeiter kämpfen gewaltlos für Würde."
    ],
    global: [
      "Reagan und Thatcher: Neoliberale Revolution. Jahrzehnte wirtschaftlicher Prägung.",
      "Iran-Irak-Krieg: 8 Jahre. 1 Million Tote. Westen unterstützt beide Seiten.",
      "Solidarność Polen: Erster Riss im Ostblock von innen.",
      "Zimbabwe: Mugabe — Hoffnung und erste Warnsignale."
    ],
    agency: null
  },

  1981: {
    event: "IBM PC mit MS-DOS — Microsoft dominiert",
    sub: "Gates lizenziert das Betriebssystem, das er nicht besitzt. Schlauester Deal der Tech-Geschichte.",
    screen: 2.6, friends: 14, bmi: 24.9, polar: 33,
    neg: [
      "AIDS erstmals beschrieben: Eine neue Epidemie beginnt. Ignoriert von Regierungen.",
      "Hunger in Äthiopien: Live-Aid 1985 noch nicht — aber das Elend beginnt.",
      "Erste Videospiel-Sucht-Berichte: Pac-Man in Spielhallen zieht Kinder.",
    ],
    pos: [
      "Space Shuttle Columbia: Raumfahrt als Routine — Technologie reift.",
      "MTV: Musikvideo als Kunstform — visuelle Kreativität explodiert.",
      "Erste Laptop-Prototypen: Computer werden mobil.",
      "Umweltschutzgesetze: Katalysator-Pflicht in Europa beginnt."
    ],
    global: [
      "Sadat ermordet: Friedensschließer stirbt. Nahost-Pessimismus.",
      "Polen: Kriegsrecht nach Solidarność. Aber der Geist ist frei.",
      "El Salvador, Nicaragua: USA finanziert Terror-Regimes gegen Linke.",
      "Indien: Indira Gandhi — Stärke und Fehler einer Demokratie."
    ],
    agency: null
  },

  1982: {
    event: "Erster kommerzieller CD-Player — Philips & Sony",
    sub: "Digitale Information auf Kunststoff. Das analoge Zeitalter der Musik endet.",
    screen: 2.7, friends: 14, bmi: 24.9, polar: 33,
    neg: [
      "Falkland-Krieg: Diktatur nutzt Krieg als Ablenkung. Medien als Kriegspropaganda.",
      "Libanon: Israel-Invasion, Sabra-Shatila-Massaker. Nahosten ohne Ausweg.",
      "Schulden-Krise Lateinamerika: IWF-Programme zerstören Sozialsysteme."
    ],
    pos: [
      "CD-Player: Digitale Qualität für Konsumenten. Technologie verbessert Alltag.",
      "Erster Arzt-Computer in Praxen: Medizin wird datenfähig.",
      "Mahatma Gandhi Film: Oscar. Gewaltlosigkeit als globale Botschaft.",
      "Greenpeace wächst: Umweltschutz als Massenbewegung."
    ],
    global: [
      "Falkland: Militärdiktatur Argentinien scheitert. Demokratie folgt.",
      "Israel-Libanon: Massaker. Sharon — Kriegsverbrechen ohne Konsequenz.",
      "China: Deng beschleunigt Öffnung. Sonderwirtschaftszonen boomen.",
      "Mexiko, Brasilien, Argentinien: Schulden-Krise. IWF übernimmt Kontrolle."
    ],
    agency: null
  },

  1983: {
    event: "TCP/IP offiziell eingeführt — das Internet entsteht formal",
    sub: "1. Januar 1983: Alle ARPANET-Computer wechseln auf TCP/IP. Das Internet ist offiziell geboren.",
    screen: 2.8, friends: 14, bmi: 25.0, polar: 33,
    neg: [
      "Reagan: 'Star Wars' SDI — Rüstungsspirale, Billionen verschwendet.",
      "Erste Berichte über Ozonloch: Menschheit zerstört Atmosphäre.",
      "AIDS-Krise: 3.000 Tote in USA. Reagan schweigt 6 Jahre lang."
    ],
    pos: [
      "Internet offiziell geboren: TCP/IP. Jedes Gerät kann jetzt verbunden werden.",
      "Erster Mobiltelefon-Dienst kommerziell (Chicago): Kommunikation wird mobil.",
      "Microsoft Word: Schreiben demokratisiert.",
      "Erste MRT in deutschen Krankenhäusern: Diagnose ohne Strahlung."
    ],
    global: [
      "KAL 007: Sowjets schießen Passagierflugzeug ab. Kalter Krieg gefährlich nah.",
      "Grenada: USA-Invasion eines Karibikinselstaats. Interventionismus.",
      "Libanon: US-Marines-Kaserne gebombt. 241 Tote. USA zieht ab.",
      "Äthiopien: Dürre und Bürgerkrieg. Hungersnot beginnt."
    ],
    agency: null
  },

  1984: {
    event: "Apple Macintosh — erste grafische Benutzeroberfläche für Massen",
    sub: "Maus und Fenster statt Kommandozeile. Computer werden menschlich.",
    screen: 3.0, friends: 14, bmi: 25.1, polar: 34,
    neg: [
      "Bhopal-Katastrophe: 20.000 Tote durch Industrieunfall. Konzerne ohne Verantwortung.",
      "Orwell-Jahr: Überwachungsgesellschaft als Gedanke präsent. Noch Utopie.",
      "AIDS: 7.000 Tote USA. Reagan schweigt noch immer."
    ],
    pos: [
      "Mac: Benutzeroberfläche für alle. Computer wird Werkzeug, nicht Expertensystem.",
      "Live Aid 1985 in Vorbereitung: Solidarität als Massenphänomen.",
      "Erste Datenschutzgesetze in Europa: Recht auf Privatsphäre im digitalen Zeitalter.",
      "Mandela-Kampagne wächst weltweit: Internationaler Druck auf Apartheid."
    ],
    global: [
      "Reagan Wiederwahl: USA bleibt konservativ für weitere Dekade.",
      "Indien: Indira Gandhi ermordet. Sikh-Pogrome.",
      "Äthiopien: Hungersnot. Live Aid (1985) wird globales Bewusstsein wecken.",
      "Nicaragua: USA finanziert Contras. Kongress verbietet es — Iran-Contra-Skandal folgt."
    ],
    agency: null
  },

  1985: {
    event: "Online-Dienste (Compuserve, AOL Vorläufer) — erste Massen-Vernetzung",
    sub: "100.000 Menschen sind online. Noch exklusiv, noch langsam. Aber es wächst.",
    screen: 3.1, friends: 14, bmi: 25.2, polar: 34,
    neg: [
      "Erste Beschreibungen 'Computer Addiction': Mediensucht als Begriff entsteht.",
      "Ozonloch bestätigt: FCKW zerstört Schutzschicht. Erste internationale Kooperation nötig.",
      "Schulden-Krise Afrika: IWF-Auflagen zerstören Gesundheitssysteme."
    ],
    pos: [
      "Live Aid: Bob Geldof mobilisiert Milliarden. Solidarität über Grenzen.",
      "Gorbatschow: Glasnost und Perestroika beginnen. Hoffnung hinter dem Eisernen Vorhang.",
      "Ozonloch-Entdeckung führt 1987 zu: Montreal-Protokoll — Chemikalien verboten. Es wirkt.",
      "Erste Krebsfrüherkennungs-Programme in Europa."
    ],
    global: [
      "Gorbatschow: Neue Führung in Sowjetunion. Reform-Hoffnung.",
      "Apartheid: Ausnahmezustand in Südafrika. Widerstand wächst.",
      "Philippinen: Corazon Aquino — demokratische Revolution gegen Marcos.",
      "Kolumbien: Pablo Escobar auf dem Höhepunkt. Drogenhandel als Staatsbedrohung."
    ],
    agency: null
  },

  1986: {
    event: "Tschernobyl — Nuklearkatastrophe und erster globaler Medien-Unfall",
    sub: "Radioaktive Wolke kennt keine Grenzen. Umweltschäden werden global sichtbar.",
    screen: 3.2, friends: 14, bmi: 25.3, polar: 35,
    neg: [
      "Tschernobyl: Atomkraft-Optimismus endet abrupt. Vertrauen in Technologie bricht.",
      "Space Shuttle Challenger explodiert live im TV: Technologie kann scheitern.",
      "Iran-Contra: USA-Regierung bricht Gesetz heimlich. Institutionen geschwächt."
    ],
    pos: [
      "Tschernobyl-Folge: Anti-Atomkraft-Bewegung, Grüne Partei gestärkt.",
      "Challenger-Schock führt zu: NASA-Sicherheitsreform. Fehlerkultur als Lernprozess.",
      "Chernobyl zeigt Glasnost: Gorbatschow muss informieren. Offenheit als Notwendigkeit.",
      "Montreal-Protokoll in Vorbereitung: Erstes funktionierendes Umwelt-Abkommen."
    ],
    global: [
      "Tschernobyl: Sowjetunion kann Katastrophe nicht verbergen. Glasnost wird real.",
      "Philippinen: Marcos flieht. Friedliche Revolution als Modell.",
      "Südafrika: Tutu, Mandela-Kampagne wächst. Sanctions beginnen zu wirken.",
      "Haiti: Duvalier gestürzt. Demokratie als Hoffnung."
    ],
    agency: null
  },

  1987: {
    event: "NSFNET — das Internet bekommt seine Infrastruktur",
    sub: "National Science Foundation baut das Backbone. Internet wird schneller und breiter.",
    screen: 3.3, friends: 13, bmi: 25.4, polar: 35,
    neg: [
      "Schwarzer Montag: Börsencrash. Finanzmärkte können in Stunden kollabieren.",
      "AIDS: 50.000 Tote USA. Reagan spricht endlich öffentlich — zu spät.",
      "Erste Berichte über 'TV-Kinder': Aufmerksamkeitsspannen sinken messbar."
    ],
    pos: [
      "Montreal-Protokoll: FCKW global verboten. Erstes globales Umwelt-Erfolg.",
      "INF-Vertrag: Reagan und Gorbatschow vernichten erstmals Atomwaffen.",
      "Erste Statin-Medikamente: Herzinfarkt-Risiko senkbar.",
      "NSFNET: Wissenschaftler aller Länder vernetzen sich."
    ],
    global: [
      "Reagan-Gorbatschow: INF-Vertrag. Erstmals Abrüstung statt Aufrüstung.",
      "Palästina: Erste Intifada. Stein gegen Panzer. Medien auf Seite der Schwachen.",
      "Korea: Demokratische Wahlen nach Diktatur.",
      "Mosambik: Bürgerkrieg. Renamo von Südafrika und USA finanziert."
    ],
    agency: null
  },

  1988: {
    event: "Erster Internet-Wurm (Morris Worm) — Cybersecurity entsteht",
    sub: "Robert Morris infiziert 6.000 Computer. Erstmals: Netz kann als Waffe genutzt werden.",
    screen: 3.4, friends: 13, bmi: 25.5, polar: 35,
    neg: [
      "Lockerbie: 270 Tote durch Bombenanschlag auf Passagierflugzeug.",
      "Halabja: Saddam Hussein vergast Kurden. Westen schaut weg.",
      "Erste Berichte über Kindheit im Schatten des Bildschirms."
    ],
    pos: [
      "Morris Worm: Security-Bewusstsein entsteht. CERT gegründet.",
      "Seoul-Olympia: Erster gesamtkoreanischer Moment seit Jahrzehnten.",
      "Erster kommerzieller Mobilfunk Europa (Scandinavien): Telefon wird mobil.",
      "Brundtland-Bericht: 'Sustainable Development' als Begriff geprägt."
    ],
    global: [
      "Afghanistan: Sowjetunion zieht ab. Mudschaheddin — künftige Taliban — triumphieren.",
      "Irak: Giftgasangriffe auf Kurden. Saddam Husseins Verbrechen.",
      "Pakistan: Benazir Bhutto — erste weibliche Regierungschefin eines muslimischen Landes.",
      "Palästina: PLO erkennt Israel an. Frieden möglich? Oslo in Vorbereitung."
    ],
    agency: null
  },

  1989: {
    event: "Tim Berners-Lee schreibt das WWW-Proposal — 'Vague but exciting'",
    sub: "Sein Chef schreibt das auf den Antrag. Am CERN entsteht die Idee, die alles verändert.",
    screen: 3.5, friends: 13, bmi: 25.6, polar: 34,
    neg: [
      "Tiananmen: China schießt auf Studenten. Reformhoffnung endet blutig.",
      "Exxon Valdez: Ölkatastrophe zeigt Umweltrisiken der Industrie.",
      "Berliner Mauer fällt — aber Euphorie deckt Probleme des Übergangs zu."
    ],
    pos: [
      "Berliner Mauer fällt: Größte Freiheitsbewegung des 20. Jahrhunderts ohne Blutvergießen.",
      "WWW-Proposal: Berners-Lee plant das offene Web.",
      "Tiananmen-Überlebende: Dissidenten verbreiten Ideen trotz Unterdrückung.",
      "Lech Wałęsa polnischer Präsident: Solidarność siegt."
    ],
    global: [
      "Mauer fällt: Osteuropa befreit sich. Friedlich, unerwartet, wunderschön.",
      "Tiananmen: China wählt Kontrolle statt Freiheit. Weichenstellung für Jahrzehnte.",
      "Rumänien: Einzige blutige Revolution des Ostblocks. Ceaușescu hingerichtet.",
      "Sowjetunion: Satelliten frei. Glasnost zeigt volle Wirkung."
    ],
    agency: null
  },

  1990: {
    event: "ARPANET offiziell abgeschaltet — das zivile Internet übernimmt",
    sub: "Das Militärnetz hat ausgedient. Was als Waffe gedacht war, gehört der Welt.",
    screen: 3.5, friends: 13, bmi: 25.7, polar: 34,
    neg: [
      "Deutsche Wiedervereinigung: Euphorie überdeckt reale Anpassungsschmerzen.",
      "Irak besetzt Kuwait: Erste Krise nach Kaltem Krieg.",
      "Erste Burn-out-Epidemie in Unternehmensberatungen beschrieben."
    ],
    pos: [
      "ARPANET endet, Internet lebt: Das Netz gehört jetzt der Welt.",
      "Mandela frei: Nach 27 Jahren. Würde als Waffe.",
      "Wiedervereinigung: 40 Jahre getrennte Familien vereint.",
      "Hubble Weltraumteleskop: Welt sieht Universum erstmals klar."
    ],
    global: [
      "Irak besetzt Kuwait: Erste Post-Kaltkrieg-Krise. USA als einzige Supermacht.",
      "Mandela frei: Apartheid-Ära endet langsam.",
      "Sowjetunion: Letzte Tage. Baltenrepubliken streben nach Freiheit.",
      "Deutschland: Einheit. 80 Millionen — größtes Land Westeuropas."
    ],
    agency: null
  },

  // ─────────────────────────────────────────────
  // WORLD WIDE WEB ERA  1991–2003
  // ─────────────────────────────────────────────

  1991: {
    event: "World Wide Web öffentlich — erste Website geht live",
    sub: "info.cern.ch erklärt, was das Web ist. Wenige beachten es. Berners-Lee patentiert nichts.",
    screen: 3.6, friends: 13, bmi: 25.8, polar: 35,
    neg: [
      "Golfkrieg: Erster TV-Krieg in Echtzeit. CNN zeigt Bomben. Krieg als Spektakel.",
      "Sowjetunion zerfällt: 15 neue Staaten, viele ohne Erfahrung mit Demokratie.",
      "Jugoslawien-Krieg beginnt: Erster Krieg in Europa seit 1945."
    ],
    pos: [
      "WWW: Berners-Lee verschenkt die Erfindung. Offenheit als Grundprinzip.",
      "Sowjetunion fällt: 300 Millionen Menschen befreit aus Autoritarismus.",
      "Desert Storm-Koalition: UN-System funktioniert. Multilateralismus lebt.",
      "Human Genome Project: Menschliches Erbgut wird lesbar."
    ],
    global: [
      "Sowjetunion löst sich auf: Größte geopolitische Verschiebung seit 1945.",
      "Kuwait befreit: UN-Koalition als Modell — funktioniert es dauerhaft?",
      "Jugoslawien: Serbien, Kroatien, Bosnien — Europa versagt.",
      "Äthiopien: Derg-Regime fällt. Erste demokratische Wahlen."
    ],
    agency: null
  },

  1992: {
    event: "Erste kommerzielle Internet-Provider (AOL, Prodigy)",
    sub: "Wer eine Telefonleitung hat, kann jetzt online. Still langsam — 9.600 baud.",
    screen: 3.7, friends: 13, bmi: 25.9, polar: 35,
    neg: [
      "LA Riots: Rassismus explodiert nach Rodney King. 63 Tote.",
      "Bosnien-Krieg: Europas erste ethnische Säuberungen seit WW2.",
      "Rio-Erdgipfel: Versprechen ohne Bindung. Erste Enttäuschung in Klimapolitik."
    ],
    pos: [
      "Rio-Erdgipfel: Erste globale Klimakonferenz. Bewusstsein entsteht.",
      "SMS wird Standard: Kurznachrichten verändern Kommunikation.",
      "Maastricht-Vertrag: EU als politisches Projekt.",
      "Barcelona-Olympia: Sport als globales Fest."
    ],
    global: [
      "Bosnien-Krieg: Europa schaut zu. UN-Schutzzone als Illusion.",
      "Somalia: 'Black Hawk Down'. Humanitäre Intervention scheitert.",
      "Rio: 'Agenda 21' — größte globale Umwelt-Einigung. Ignoriert danach.",
      "Südafrika: Apartheid-Ende in Sicht. ANC und NP verhandeln."
    ],
    agency: null
  },

  1993: {
    event: "Mosaic-Browser — das Web bekommt Bilder",
    sub: "Marc Andreessen macht das Web klickbar. Erstmals sehen statt lesen.",
    screen: 3.8, friends: 13, bmi: 26.0, polar: 35,
    neg: [
      "Oslo-Friedensprozess: Hoffnung auf Israel-Palästina-Frieden — wird scheitern.",
      "Waco, Ruby Ridge: Staatsgewalt und extreme Reaktion. Polarisierung wächst.",
      "EU-Rezession: Erste Massenarbeitslosigkeit in vereintem Europa."
    ],
    pos: [
      "Mosaic: Das Web wird visuell. Millionen können es jetzt verstehen.",
      "Oslo-Akkordo: Für einen Moment — Frieden scheint möglich.",
      "Tschechien und Slowakei: Friedliche Teilung. Demokratie als Werkzeug.",
      "Nelson Mandela Nobel Peace Prize: Mit de Klerk. Versöhnung als Weg."
    ],
    global: [
      "Ruanda: Mord-Infrastruktur wird aufgebaut. Welt warnt nicht rechtzeitig.",
      "Somalien: USA zieht ab. Humanitärer Interventionismus endet.",
      "Bosnien: Srebrenica kündigt sich an. Europa versagt.",
      "Nordkorea: Erstes Atom-Programm. Kim Il-sung stirbt 1994."
    ],
    agency: null
  },

  1994: {
    event: "Netscape Navigator — Browser-Krieg beginnt",
    sub: "Das Web bekommt Kommerz. Amazon, Yahoo gegründet. Internet als Business entsteht.",
    screen: 4.0, friends: 12, bmi: 26.1, polar: 36,
    neg: [
      "Ruanda-Genozid: 800.000 Tote in 100 Tagen. Welt schaut zu.",
      "Internet-Hype beginnt: Erster Dot-com-Optimismus ohne Grundlage.",
      "Northridge-Erdbeben: Naturkatastrophen und Klimarisiken steigen."
    ],
    pos: [
      "Südafrika: Mandela wird Präsident. Apartheid endet. Eine Wahl verändert alles.",
      "Jordan: Friedensvertrag mit Israel.",
      "Amazon gegründet: Bücher für alle, überall.",
      "Kanal-Tunnel: Europa physisch verbunden."
    ],
    global: [
      "Ruanda: 800.000 Tote. UN versagt. Weltgemeinschaft beschämt.",
      "Südafrika: Mandela. Vorbild für die Welt.",
      "Mexiko: NAFTA und Zapatista-Aufstand gleichzeitig. Freihandel hat Verlierer.",
      "Haiti: US-Intervention nach Militärcoup. Demokratie durch Druck von außen."
    ],
    agency: null
  },

  1995: {
    event: "Windows 95, Netscape IPO — Dot-com-Ära beginnt",
    sub: "Milliarden fließen in Internet-Ideen. Jeder glaubt, reich zu werden.",
    screen: 4.2, friends: 12, bmi: 26.2, polar: 36,
    neg: [
      "Oklahoma City: Rechtsextremer Terrorismus. Inlandsterror als reale Bedrohung.",
      "Srebrenica: 8.000 Morde. UN-'Schutzzone' versagt. Europa beschämt.",
      "Dot-com-Gier: Unternehmen ohne Geschäftsmodell werden Milliarden wert."
    ],
    pos: [
      "Windows 95: Computer für alle. 40 Millionen Kopien in ersten Monaten.",
      "Dayton-Abkommen: Bosnien-Krieg endet.",
      "Erste DSL-Pläne: Internet wird schneller.",
      "Erste randomisierte Krebsscreening-Studien zeigen: Früherkennung rettet Leben."
    ],
    global: [
      "Srebrenica: Europa versagt im eigenen Hinterhof.",
      "China-Taiwan: Raketentests. USA schickt Kriegsschiffe. Krise endet knapp.",
      "Nigeria: Ken Saro-Wiwa hingerichtet. Shell und Militär-Regime.",
      "Mosambik: Erste freie Wahlen nach Bürgerkrieg. Frieden durch Erschöpfung."
    ],
    agency: null
  },

  1996: {
    event: "Google-Vorläufer 'BackRub' — Page & Brin an Stanford",
    sub: "Zwei Doktoranden bauen eine Suchmaschine nach Linken, nicht nach Worten. Revolution in Vorbereitung.",
    screen: 4.4, friends: 12, bmi: 26.4, polar: 37,
    neg: [
      "Klonen: Dolly das Schaf. Ethische Grenzen der Biotechnologie.",
      "Dot-com-Spekulationsblase bläst sich auf.",
      "Erste Studie: Kinder mit mehr TV haben schlechtere Schulleistungen."
    ],
    pos: [
      "Olympia Atlanta: Sport als globales Friedensprojekt.",
      "Pfizer Viagra: Lebensqualität-Medizin als neue Kategorie.",
      "Comprehensive Test Ban Treaty: 183 Länder verbieten Atomtests.",
      "Erste Antiretrovirale Therapien: AIDS nicht mehr Todesurteil."
    ],
    global: [
      "Taliban übernehmen Afghanistan: Frauen verlieren alle Rechte.",
      "Tschetschenien-Krieg: Russland bombardiert eigene Bürger.",
      "Zaire: Mobutu fällt. DR Kongo-Chaos beginnt. 5 Millionen Tote folgen.",
      "Peru, Kolumbien: Friedensgespräche mit Guerilla. Langer Weg."
    ],
    agency: null
  },

  1997: {
    event: "Deep Blue schlägt Kasparov — KI besiegt erstmals Weltmeister",
    sub: "Ein Computer schlägt den besten Schachspieler. KI-Diskussion beginnt ernsthaft.",
    screen: 4.6, friends: 12, bmi: 26.5, polar: 37,
    neg: [
      "Asien-Krise: Finanzmärkte zerstören Jahre wirtschaftlichen Aufbau in Tagen.",
      "Erste Studien: Internet-Nutzung korreliert mit Einsamkeit (Kraut et al.).",
      "Klonstreit: Gesellschaft nicht bereit für biotechnologische Ethikfragen."
    ],
    pos: [
      "Deep Blue: KI-Forschung beschleunigt sich. Jahrzehnte später: Medizin-Revolutionen.",
      "Kyoto-Protokoll: Erster verbindlicher Klimavertrag — schwach, aber ein Anfang.",
      "Hongkong-Übergabe: Friedlich, trotz aller Spannungen.",
      "Erste AIDS-Medikamente zeigen Langzeitwirkung: HIV wird chronische Krankheit."
    ],
    global: [
      "Asien-Krise: Heiße Finanzströme können Volkswirtschaften zerstören.",
      "Hongkong an China: 'Ein Land, zwei Systeme'. Vertrauen auf Probe.",
      "Albanien: Pyramidensystem-Kollaps. Staatszerfall als reale Option.",
      "Kongo: Kabila overthrows Mobutu. Ressourcenkrieg beginnt."
    ],
    agency: null
  },

  1998: {
    event: "Google gegründet — PageRank revolutioniert Suche",
    sub: "Page und Brin in Stanford. Claim: 'Don't be evil.' Im Code of Conduct. 2018 gestrichen.",
    screen: 4.8, friends: 12, bmi: 26.6, polar: 37,
    neg: [
      "Clinton-Lewinsky: Politik als Reality-Show. Öffentliche Demütigung als Spektakel.",
      "LTCM-Kollaps: Hedgefonds riskiert Weltwirtschaft. Bailout durch Fed.",
      "Erstes Studie über 'Multitasking': Gehirn kann es nicht — aber alle glauben es."
    ],
    pos: [
      "Google: Suche nach Relevanz, nicht nach Geld (zunächst).",
      "Karfreitagsabkommen Nordirland: 30 Jahre Bürgerkrieg endet.",
      "First iPhone ist noch ferne Zukunft — aber Mobilfunk verbindet erstmals Milliarden.",
      "Antiretrovirale Kombinationstherapie: AIDS-Tote sinken dramatisch."
    ],
    global: [
      "Indien und Pakistan testen Atombombe: Proliferation nicht gestoppt.",
      "Kosovo-Krieg: NATO bombardiert ohne UN-Mandat.",
      "Indonesien: Suharto fällt nach 32 Jahren. Asien-Krise erzwingt Demokratisierung.",
      "Nigeria: Obasanjo — Demokratie nach Militärdiktatur."
    ],
    agency: null
  },

  1999: {
    event: "Napster — erste Peer-to-Peer-Plattform, erstes Urheberrechtsproblem",
    sub: "Shawn Fanning ermöglicht Musik-Tausch. Die Musikindustrie lernt, dass Internet Regeln bricht.",
    screen: 5.0, friends: 12, bmi: 26.8, polar: 38,
    neg: [
      "Y2K-Panik: Erstes globales Tech-Angst-Ereignis. Lernt nichts über Resilienz.",
      "Columbine: Erstes Schulmassaker im Medienzeitalter. 24h-Berichterstattung.",
      "Dot-com-Blase auf dem Gipfel: Firmen ohne Produkt werden Milliarden wert."
    ],
    pos: [
      "Napster: Idee des freien Wissens-/Kulturtransfers als Massenphänomen.",
      "Kosovo-Intervention: Trotz Fehlern — ethnische Säuberung gestoppt.",
      "Timor-Leste unabhängig: 24 Jahre Besatzung durch Indonesia endet.",
      "Erster Roaming-Handy-Standard in Europa: Grenzenlose Kommunikation."
    ],
    global: [
      "Kosovo: NATO-Intervention ohne UN. Souveränität vs. Menschenrechte.",
      "Osttimor: Unabhängigkeit nach jahrzehntelangem Kampf.",
      "Russland: Tschetschenien Krieg 2. Putin aufstieg beginnt.",
      "WTO Seattle: Erste Globalisierungskritik als Massenprotest."
    ],
    agency: null
  },

  2000: {
    event: "Dot-com-Boom auf dem Höhepunkt — dann Crash",
    sub: "Nasdaq bei 5.048 im März. Dann: Absturz. 5 Billionen Dollar vernichtet. Ernüchterung.",
    screen: 5.2, friends: 12, bmi: 26.9, polar: 39,
    neg: [
      "Dot-com-Crash: Milliarden vernichtet, Vertrauen in 'New Economy' gebrochen.",
      "Erste Studie: Übergewicht korreliert mit Sitzzeit. Noch kaum beachtet.",
      "Human Genome Project komplett: Aber was tun wir damit? Ethik läuft hinterher."
    ],
    pos: [
      "Milleniumsziele (MDGs): UN setzt erste globale Entwicklungsziele.",
      "Human Genome Project: Menschliches Erbgut gelesen. Medizin-Revolution.",
      "Erste Hybridautos (Prius 1997): Sauberere Mobilität entsteht.",
      "Korea-Gipfel: Kim Dae-jung und Kim Jong-il treffen sich. Hoffnung."
    ],
    global: [
      "Putin Präsident Russland: Neue Ära beginnt. Noch kaum wahrgenommen.",
      "Israel zieht aus Libanon ab. Frieden durch Rückzug.",
      "Sierra Leone-Bürgerkrieg endet. UN-Mission — langwieriger Aufbau.",
      "Nigeria: Erste freie Wahlen seit Dekaden. Demokratie im größten Afrika-Land."
    ],
    agency: null
  },

  2001: {
    event: "9/11 — und Wikipedia gegründet",
    sub: "Am selben Jahr: Terroranschlag verändert die Welt. Und Jimmy Wales baut freies Weltwissen.",
    screen: 5.4, friends: 11, bmi: 27.0, polar: 42,
    neg: [
      "9/11: 3.000 Tote. Und dann: Patriot Act, Massenüberwachung legitimiert durch Angst.",
      "Anthrax-Briefe: Terror als Dauerbedrohung. Institutionen unter Druck.",
      "Dot-com-Krise: Millionen Arbeitsstellen vernichtet."
    ],
    pos: [
      "Wikipedia: Freies Wissen von allen, für alle. Größtes Bildungsprojekt der Geschichte.",
      "iPod: Digitale Musik legal und schön. Jobs zeigt, Design und Tech zusammengehören.",
      "Erste Stammzell-Forschung: Regenerative Medizin als Vision.",
      "Globaler Fonds HIV/Malaria/TB: Millionen Leben gerettet."
    ],
    global: [
      "9/11: 19 Terroristen, 3.000 Tote, Jahrzehnte Konsequenzen.",
      "Afghanistan: USA bombardiert. Taliban flieht. Aufbau beginnt — endet 2021.",
      "Indien-Pakistan: Nuklearmächte am Rande des Krieges nach Parlamentsanschlag.",
      "Brasilien: Lula kandidiert. Linksruck in Lateinamerika."
    ],
    agency: null
  },

  2002: {
    event: "Friendster — erstes Social Network mit echten Namen",
    sub: "Erstmals: Online-Identität ist die echte Identität. Profil als Selbstdarstellung.",
    screen: 5.6, friends: 11, bmi: 27.1, polar: 41,
    neg: [
      "Irak-Kriegs-Propaganda: Medien verbreiten falsche WMD-Berichte unreflektiert.",
      "Enron-Skandal: Vertrauen in Wirtschaft und Wirtschaftsprüfer bricht.",
      "Erste Bali-Anschlag: Globaler Terrorismus erreicht Tourismus."
    ],
    pos: [
      "Euro als Bargeld: Europa gemeinsam. 300 Millionen Menschen, eine Währung.",
      "Erster Erdgipfel Johannesburg: Ziele nach Rio überprüft.",
      "PayPal: Geldtransfer demokratisiert.",
      "Erste mRNA-Forschungsfortschritte — 20 Jahre vor COVID-Impfstoff."
    ],
    global: [
      "Irak: USA baut Koalition auf Lüge. Deutschland und Frankreich verweigern.",
      "Côte d'Ivoire: Bürgerkrieg. Westafrika destabilisiert.",
      "Brasilien: Lula gewählt. Größter linker Erdrutsch in Lateinamerika.",
      "Venezuela: Chávez überlebt Coup-Versuch. Öl als Waffe."
    ],
    agency: null
  },

  2003: {
    event: "Irak-Krieg, MySpace, Skype — Medien und Krieg live",
    sub: "Erster Krieg mit Blogs und Embedded Journalists. Und Skype macht Ferngespräche kostenlos.",
    screen: 5.8, friends: 11, bmi: 27.2, polar: 43,
    neg: [
      "Irak-Invasion: Ohne UN-Mandat, ohne WMDs. Vertrauen in westliche Institutionen beschädigt.",
      "SARS: Erste globale Pandemie-Warnung. WHO funktioniert — aber kaum.",
      "MySpace: Erste toxische Online-Dynamiken. Erste Cyber-Mobbing-Fälle."
    ],
    pos: [
      "Skype: Internationales Telefonieren kostenlos. Familien weltweit verbunden.",
      "Human Genome: Erste medizinische Anwendungen der Genomforschung.",
      "Anti-Irak-Demos: Größte globale Friedensdemo aller Zeiten (15. Feb 2003).",
      "Erste Windparks im Meer (Offshore): Erneuerbarer Strom skaliert."
    ],
    global: [
      "Irak-Invasion: 100.000+ Zivilisten tot bis 2006. IS entsteht aus dem Chaos.",
      "SARS: China verbirgt Ausbruch. WHO reagiert trotzdem schnell.",
      "Georgien: Rosenrevolution. Postsowjetische Demokratisierung.",
      "Liberia: Ellen Johnson Sirleaf — erste weibliche Staatschefin Afrikas."
    ],
    agency: null
  },

  // ─────────────────────────────────────────────
  // SOCIAL MEDIA ERA  2004–2015
  // ─────────────────────────────────────────────

  2004: {
    event: "Facebook gegründet — thefacebook.com startet in Harvard",
    sub: "Zuckerberg ist 19. Peter Thiel investiert 500.000 Dollar. Eine Erfindung, die mehr verändert als irgendjemand ahnt.",
    screen: 6.0, friends: 12, bmi: 26.9, polar: 43,
    neg: [
      "Identität als Produkt: Erstmals baut man online ein Profil, das die echte Person ist.",
      "Abu Ghraib: Folterbilder aus dem Irak erschüttern westliche Selbstwahrnehmung.",
      "Erste Studie: Social Networks erhöhen sozialen Vergleichsdruck."
    ],
    pos: [
      "Facebook: Familien weltweit bleiben verbunden — echte Nutzung, echte Freude.",
      "Tsunami-Hilfe: Erste koordinierte Katastrophenhilfe über Internet.",
      "Hybrid-Autos werden Massenprodukt. Prius verkauft eine Million.",
      "Erste antiretrovirale Massenversorgung in Afrika: AIDS-Tode sinken."
    ],
    global: [
      "Irak: Abu Ghraib. Westliche Moral in Trümmern.",
      "Indien-Pakistan: Friedensprozess unter Musharraf, Vajpayee.",
      "Sudan: Darfur-Genozid beginnt. Welt schaut abermals zu.",
      "Ukraine: Orangene Revolution. Postsowjetische Demokratie under Druck."
    ],
    agency: null
  },

  2005: {
    event: "YouTube gegründet — Video für alle",
    sub: "Drei PayPal-Mitarbeiter: Jeder kann Videos teilen. In einem Jahr: 100 Millionen Views täglich.",
    screen: 6.5, friends: 12, bmi: 27.0, polar: 44,
    neg: [
      "Hurrikan Katrina: Staatliches Versagen bei Armen und Schwarzen. Ungleichheit tötet.",
      "London-Bombenanschlag: Inländische Terroristen. Radikalisierung als Inland-Problem.",
      "Erste Studie: Sitzzeit und Adipositas korrelieren stark."
    ],
    pos: [
      "YouTube: Demokratisierung von Video. Erste Bürgerjournalisten.",
      "Kyoto-Protokoll tritt in Kraft: Trotz US-Verweigerung.",
      "Mikrokredite: Yunus Nobel Peace Prize 2006. Arme können sich selbst helfen.",
      "Antiretroviral-Therapie: 1 Million Afrikaner behandelt."
    ],
    global: [
      "Irak: Bürgerkrieg. Sunniten vs. Schiiten — US-Invasion hat Pandora geöffnet.",
      "Sudan: Darfur. 300.000 Tote. ICC klagt an — Bashir bleibt frei.",
      "Hamas gewinnt Gaza-Wahl: Demokratie produziert Ergebnis, das Westen nicht will.",
      "China: Wirtschaftswachstum 10%+. 400 Millionen aus Armut gehoben."
    ],
    agency: null
  },

  2006: {
    event: "Twitter gegründet — Jack Dorsey, 140 Zeichen",
    sub: "Kurznachrichten als Medium. Erste Nutzung: Dorsey twittert, er macht gerade Frühstück.",
    screen: 7.0, friends: 11, bmi: 27.2, polar: 45,
    neg: [
      "Twitter: 140 Zeichen erzwingen Vereinfachung. Nuancen passen nicht mehr.",
      "Erste Mobbing-Studien: Cyberbullying als neues Phänomen.",
      "MySpace auf dem Höhepunkt: Erste Toxizitäten sozialer Netzwerke sichtbar."
    ],
    pos: [
      "Mikrokredite: Yunus bekommt Nobel Peace Prize. Armut bekämpfbar.",
      "Human Genome skaliert: Erste personalisierten Krebstherapien.",
      "Solar-Boom: Kosten beginnen zu fallen. 40%/Jahr.",
      "Lebanon-Waffenstillstand: Diplomatie funktioniert doch."
    ],
    global: [
      "Israel-Hezbollah-Krieg: Keine Sieger. Keine Lösung.",
      "Nordkorea testet Atombombe: Proliferation gescheitert.",
      "Äthiopien-Somalia: Islamischer Gerichtshof vs. USA-finanziertes Äthiopien.",
      "Bolivien: Evo Morales — indigene Führung als lateinamerikanische Premiere."
    ],
    agency: null
  },

  2007: {
    event: "iPhone — Steve Jobs hält drei Geräte in einer Hand",
    sub: "iPod + Telefon + Internet. Alles in einem. Die Welt wird nie dieselbe sein.",
    screen: 8.0, friends: 11, bmi: 27.3, polar: 46,
    neg: [
      "Smartphone beginnt: Handy kommt auf den Tisch, ins Bett, ins Bad.",
      "Subprime-Krise: Finanzindustrie hat Weltrisiko gebaut. Crash kommt.",
      "Twitter-Politik beginnt: Erste Politiker nutzen es als Direktkanal."
    ],
    pos: [
      "iPhone: Computer in der Tasche. Navigationssystem, Kamera, Kommunikation — alles.",
      "IPCC 4. Bericht: Klimawandel ist menschgemacht — 97% Konsens.",
      "Al Gore Nobel Peace Prize: Klimawandel als politisches Thema.",
      "Erste App-Stores in Vorbereitung: Neue Ökonomie für Entwickler."
    ],
    global: [
      "Kenia-Wahlen: Post-Wahl-Gewalt. 1.000 Tote. SMS-Netzwerke warnen.",
      "Myanmar: Safran-Revolution. Buddhistische Mönche gegen Junta.",
      "Pakistan: Bhutto ermordet. Demokratie unter Beschuss.",
      "Irak: Surge — kurzfristige Stabilisierung durch mehr Militär."
    ],
    agency: null
  },

  2008: {
    event: "Finanzkrise — und App Store, Android, Airbnb",
    sub: "Das schlimmste Wirtschaftsjahr seit 1929. Und gleichzeitig: neue Wirtschaftsmodelle entstehen.",
    screen: 8.5, friends: 11, bmi: 27.5, polar: 48,
    neg: [
      "Finanzkrise: 20 Millionen Arbeitslose. Banken gerettet, Mittelstand opfert.",
      "Erste Massenentlassungen durch Digitalisierung: Reisebüros, Zeitungsbranche.",
      "Übergewichts-Epidemie: WHO erklärt globale Adipositas-Pandemie."
    ],
    pos: [
      "Obama: Erster schwarzer US-Präsident. Historisch und emotional bedeutsam.",
      "Android: Google öffnet Smartphone-Ökosystem für alle.",
      "Erste Offshore-Windparks kommerziell: Erneuerbare skalieren.",
      "Airbnb gegründet: Sharing Economy als neue Wirtschaftsform."
    ],
    global: [
      "Georgien-Krieg: Russland greift an. Welt schaut überrascht zu.",
      "China Olympia: Größte Selbstdarstellung einer Nation seit Berlin 1936.",
      "Mugabe Zimbabwe: Hyperinflation, 231 Millionen Prozent. Staatsversagen.",
      "Congo: UN-Mission — größte der Geschichte. Konflikt dauert an."
    ],
    agency: null
  },

  2009: {
    event: "Like-Button — Facebook ändert alles",
    sub: "Justin Rosenstein erfindet ihn. Ein Klick. Variable Belohnung. Der Anfang der Dopamin-Ökonomie.",
    screen: 10.0, friends: 10, bmi: 27.6, polar: 50,
    neg: [
      "Like-Button: Variable Belohnung wie Spielautomat — stärkste Suchtstruktur.",
      "Swine Flu: Erste moderne Pandemie-Übung. Globale Koordination funktioniert — mäßig.",
      "Arbeitslosigkeit nach Finanzkrise: Vertrauensverlust in Wirtschaftssystem."
    ],
    pos: [
      "Smartphone-Penetration: Milliarden erstmals mobil vernetzt.",
      "WhatsApp gegründet: Internationale Kommunikation kostenlos für alle.",
      "Erste vollständig sequenzierte Krebsgenome: Präzisionsonkologie beginnt.",
      "Kopenhagen-Klimagipfel: Scheitert — aber globale Debatte bleibt."
    ],
    global: [
      "Iran: Grüne Bewegung. Millionen protestieren. Niedergeschlagen.",
      "Honduras: Coup. Lateinamerika rückwärts.",
      "Piraterie Somalia: Staatsversagen mit globalen Folgen.",
      "Afghanistan: Obama sendet 30.000 mehr Soldaten. Kein Ende."
    ],
    agency: null
  },

  2010: {
    event: "Instagram, iPad, WikiLeaks — Transparenz und Bilder",
    sub: "WikiLeaks veröffentlicht Kriegsverbrechen. Instagram feiert Schönheit. Zwei Realitäten.",
    screen: 11.0, friends: 10, bmi: 27.8, polar: 52,
    neg: [
      "Instagram beginnt: Körperbild-Vergleich als Massenphänomen.",
      "WikiLeaks: Collateral Murder-Video. Kein Konsens, wie mit Staatstransparenz umgehen.",
      "BP-Ölkatastrophe: Regulierungsversagen der Industrie."
    ],
    pos: [
      "Arabischer Frühling kündigt sich an: Social Media als Organisationstool.",
      "Erste iPads: Digitale Bücher für alle.",
      "Gates-Buffett Giving Pledge: Superreiche verpflichten sich zu Großspenden.",
      "Erste Exoskelette: Gelähmte gehen wieder."
    ],
    global: [
      "Haiti: Erdbeben, 230.000 Tote. Humanitäre Hilfe und Fehler.",
      "Chile: 33 Bergleute gerettet. Kompetenz und Ausdauer.",
      "Mexiko: Drogenkrieg. 60.000 Tote bis 2012.",
      "Thailand: Rothemd-Proteste. Politische Spaltung als Dauerzustand."
    ],
    agency: null
  },

  2011: {
    event: "Arabischer Frühling — Social Media als Revolutionstool",
    sub: "Tunesien, Ägypten, Libyen, Syrien — Twitter und Facebook organisieren Millionen. Und scheitern danach.",
    screen: 12.0, friends: 10, bmi: 28.0, polar: 54,
    neg: [
      "Arabischer Frühling: Euphorie — dann Militär, Bürgerkriege, IS.",
      "Fukushima: Atomkatastrophe. Technik scheitert wieder.",
      "Occupy Wall Street: Symptom ohne Programm. Ungleichheit als Problem benannt, nicht gelöst."
    ],
    pos: [
      "Tunesien-Jasmin-Revolution: Erste echte Demokratie aus Arabischem Frühling.",
      "Bin Laden getötet: Symbol des globalen Terrorismus beseitigt.",
      "Erste CAR-T-Zell-Therapien in Versuchen: Krebs durch eigenes Immunsystem bekämpfen.",
      "Occupy: 'Wir sind die 99%' — Ungleichheit auf politische Agenda."
    ],
    global: [
      "Arabischer Frühling: Tunisien, Ägypten, Libyen, Syrien. Hoffnung und dann Chaos.",
      "Japan: Erdbeben, Tsunami, Fukushima. Dreifache Katastrophe.",
      "Südsudan unabhängig: Jüngster Staat der Welt. Gleich im Bürgerkrieg.",
      "Elfenbeinküste: Gbagbo verhaftet. Demokratie durch externe Intervention."
    ],
    agency: null
  },

  2012: {
    event: "Instagram (1 Mrd. $ Facebook-Kauf), Snapchat — Bild-Gesellschaft",
    sub: "Zuckerberg kauft Instagram für 1 Milliarde. Bild-Kommunikation wird dominant.",
    screen: 13.5, friends: 10, bmi: 28.2, polar: 55,
    neg: [
      "Instagram-Kauf: Wettbewerb beendet. Monopol als Strategie.",
      "Erste klinische Depressions-Studien bei Instagram-Nutzenden (Teenagern).",
      "Sandy Hook: 20 Kinder getötet. USA ändert nichts an Waffengesetzen."
    ],
    pos: [
      "Erste CRISPR-Anwendungen in Forschung: Genschere wird möglich.",
      "SpaceX Falcon 9: Private Raumfahrt als Realität.",
      "Erneuerbare: Erstmals mehr neue Solar-/Windkapazität als Kohle.",
      "Higgs-Boson entdeckt: Teilchenphysik bestätigt. Wissenschaft funktioniert."
    ],
    global: [
      "Syrien-Krieg eskaliert: 5 Millionen Flüchtlinge in den Folgejahren.",
      "Mali: Islamistischer Aufstand. Frankreich interveniert.",
      "Xi Jinping: Übernahme der Macht in China. Neue Ära.",
      "Myanmar: Demokratisierung. Suu Kyi frei. (Rückfall 2021.)"
    ],
    agency: null
  },

  2013: {
    event: "Snowden / NSA + Facebook schaltet chronologischen Newsfeed ab",
    sub: "Zwei Ereignisse, die zeigen: Daten sind Macht. Staatlich und kommerziell.",
    screen: 15.0, friends: 9, bmi: 28.4, polar: 57,
    neg: [
      "Newsfeed-Algorithmus: Empörung schlägt Information. System optimiert auf Wut.",
      "PRISM: Apple, Google, Facebook kooperieren mit NSA. Privatsphäre als Illusion.",
      "Erste Einsamkeits-Studien als gesellschaftliche Katastrophenwarnungen."
    ],
    pos: [
      "Snowden: Demokratische Debatte über Überwachung erzwungen.",
      "DSGVO in Vorbereitung: Europa entwickelt Datenschutz als Recht.",
      "Tesla Model S: Elektromobilität als Luxus — und Beweis, dass es geht.",
      "Erste CAR-T Klinische Studien: Leukämie heilbar ohne Chemo."
    ],
    global: [
      "Ägypten: Militärcoup gegen Mursi. Demokratie endet wieder.",
      "Philippinen: Haiyan — stärkster Taifun. Klimakrise im Tropical Typhoon.",
      "Zentralafrikanische Republik: Staatszerfall. UN überfordert.",
      "Iran: Rohani. Atomverhandlungen beginnen. Hoffnung."
    ],
    agency: null
  },

  2014: {
    event: "WhatsApp Kauf (19 Mrd. $), ALS Ice Bucket, Echt-Zeit-Welt",
    sub: "Facebook kauft Messenger. Soziale Medien als Fundraising-Instrument.",
    screen: 16.0, friends: 9, bmi: 28.5, polar: 59,
    neg: [
      "Russland annektiert Krim: Grenzen in Europa verschieben sich erstmals seit 1945.",
      "IS: Islamischer Staat auf dem Höhepunkt. Propagandavideos viral.",
      "Ebola: Westafrikanische Epidemie. Gesundheitssystem-Schwäche sichtbar."
    ],
    pos: [
      "Ice Bucket Challenge: 220 Millionen Dollar für ALS-Forschung. Viral für Gutes.",
      "Erste CRISPR-Anwendungen an menschlichen Zellen: Medizin-Revolution.",
      "Narendra Modi: Digitales Indien als Vision — Milliarden online.",
      "Ebola gestoppt: WHO lernt aus Fehlern."
    ],
    global: [
      "Ukraine-Krim: Russlands neue Doktrin. Grenzen verhandlungsfähig.",
      "IS auf dem Höhepunkt: Mosul fällt. Neue Art von Terrorstaat.",
      "Ferguson: Schwarze Männer sterben durch Polizeigewalt. BLM entsteht.",
      "Ebola: Westafrikanische Epidemie. 11.000 Tote. Globalgesundheit unter Druck."
    ],
    agency: null
  },

  2015: {
    event: "Paris-Klimaabkommen — und Facebook Reactions",
    sub: "196 Länder einigen sich auf 1,5 Grad. Und Facebook gibt der Empörung mehr Ausdrucksmittel.",
    screen: 17.0, friends: 9, bmi: 28.7, polar: 61,
    neg: [
      "Reactions: Wut-Button. Empörung hat jetzt eigenes Symbol.",
      "Flüchtlingskrise Europa: Gesellschaft polarisiert sich.",
      "Paris-Anschläge: Terror in Europas Metropole. Angst als Alltag."
    ],
    pos: [
      "Paris-Klimaabkommen: 196 Länder. Historisch. Ob es reicht — offen.",
      "Sustainable Development Goals: Ersetzen MDGs. Konkrete Ziele.",
      "CRISPR: Erste therapeutische Anwendungen. Erbkrankheiten heilbar.",
      "Marriage Equality USA: Oberster Gerichtshof. Gleichstellung real."
    ],
    global: [
      "Syrien: 4 Millionen Flüchtlinge. Europa reagiert unterschiedlich.",
      "Iran-Deal: Obama, EU, Russland, China einigen sich. Diplomatie wirkt.",
      "Nepal-Erdbeben: 9.000 Tote. Internationale Hilfe.",
      "Nigerias Boko Haram: 20.000 Tote. Westafrikanische Koalition."
    ],
    agency: null
  },

  // ─────────────────────────────────────────────
  // CRISIS & FRACTURE  2016–2022
  // ─────────────────────────────────────────────

  2016: {
    event: "Trump + Brexit + Cambridge Analytica — Demokratie als Datenproblem",
    sub: "87 Millionen Facebook-Profile genutzt, um Wahlen zu beeinflussen. Es funktioniert.",
    screen: 18.0, friends: 8, bmi: 28.8, polar: 66,
    neg: [
      "Microtargeting: Demokratie als Optimierungsproblem. Ängste skalierbar.",
      "Fake News: Begriff entsteht. Meinung und Fakt nicht mehr trennbar für viele.",
      "Polarisierung bricht Rekord: Familien zerrissen durch politische Zugehörigkeit."
    ],
    pos: [
      "Gravitationswellen entdeckt: Einstein hatte recht. Wissenschaft triumphiert.",
      "Erneuerbare: Solar unter 1$/Watt erstmals. Wendezeit.",
      "Erste erfolgreiche CAR-T-Leukämietherapien: Kinder geheilt.",
      "LGBTQ+ Rechte: Weltweit mehr Länder mit Marriage Equality."
    ],
    global: [
      "Aleppo fällt: Syriens Niederlage sichtbar. Assad überlebt durch Russland.",
      "Brexit: UK verlässt EU. Jahrzehnte Integration rückgängig.",
      "Duterte Philippinen: Extralegale Tötungen. Demokratie unter Druck.",
      "Kolumbien: Friedensvertrag FARC. 52 Jahre Bürgerkrieg endet."
    ],
    agency: null
  },

  2017: {
    event: "#MeToo viral — soziale Gerechtigkeit über Social Media",
    sub: "Tarana Burke, Harvey Weinstein. Millionen Frauen sprechen. Systemischer Wandel beginnt.",
    screen: 18.5, friends: 8, bmi: 28.9, polar: 67,
    neg: [
      "Trump-Twitter: Erster Präsident, der Außenpolitik per Tweet macht.",
      "Rohingya-Genozid: Facebook wird in Myanmar für Hassverbreitung genutzt.",
      "Opioid-Krise USA: 70.000 Tote. Pharmaindustrie ohne Verantwortung."
    ],
    pos: [
      "#MeToo: Systemischer Sexismus als gesellschaftliches Thema. Machtverhältnisse hinterfragt.",
      "CRISPR: Erste klinische Studien Krebs. Gene-Editing als Therapie.",
      "Elektroautos: Tesla Model 3 — Massenmarkt beginnt.",
      "Namibia, Botswana: Stärkste Demokratien Afrikas wachsen."
    ],
    global: [
      "Rohingya: Myanmar-Militär vertreibt 700.000. Facebook als Propagandakanal.",
      "Nordkorea: ICBM-Test. Fähigkeit, USA zu erreichen.",
      "Katalonien: Unabhängigkeitserklärung. Europäische Verfassungskrise.",
      "Zimbabwe: Mugabe fällt. 37 Jahre enden. Militär übernimmt."
    ],
    agency: null
  },

  2018: {
    event: "DSGVO + Facebook-Skandale + Google löscht 'Don't be evil'",
    sub: "Europa setzt Datenschutz als Recht. USA: Cambridge Analytica-Anhörung. Zuckerberg vor dem Kongress.",
    screen: 19.0, friends: 8, bmi: 29.0, polar: 68,
    neg: [
      "Facebook-Anhörung: Senatoren verstehen Algorithmen nicht. Regulierung hinkt.",
      "Fake-News-Epidemie: Brasiliens Wahl, Indien-WhatsApp-Lynchjustiz.",
      "IPCC-Sonderbericht: 12 Jahre für 1,5 Grad. Welt auf 3+ Grad-Pfad."
    ],
    pos: [
      "DSGVO: Europa setzt globalen Standard für Datenschutz.",
      "Paris-Abkommen erste Messungen: Einige Länder liefern.",
      "CRISPR-Babies: He Jiankui editiert menschliche Embryonen. Weltweiter Schock führt zu globaler Regulierung.",
      "Erste CAR-T FDA-zugelassen: Revolution in Onkologie."
    ],
    global: [
      "Brasilien: Bolsonaro gewählt. Amazonas-Abholzung steigt.",
      "Saudi-Arabien: Khashoggi ermordet. Pressefreiheit unter Druck.",
      "Ungarn: Orbán konsolidiert Macht. EU-Demokratie erodiert von innen.",
      "Yemen: Saudisch-geführter Krieg. Größte humanitäre Krise der Welt."
    ],
    agency: null
  },

  2019: {
    event: "TikTok global dominant — Identitätsmaschine",
    sub: "ByteDance-Algorithmus braucht keine Freunde. 35 Minuten bis zum vollständigen Profil.",
    screen: 20.0, friends: 7, bmi: 29.2, polar: 70,
    neg: [
      "TikTok: Identitätsformung schneller und tiefer als je zuvor.",
      "Einsamkeits-Minister: UK erkennt Einsamkeit als Gesundheitskrise. 1 von 3 Erwachsenen.",
      "Hongkong: Millionen-Proteste niedergeschlagen. Freiheit verloren."
    ],
    pos: [
      "Fridays for Future: Greta Thunberg. Gen Z politisiert sich massiv.",
      "Erste schwarze Löcher fotografiert: Wissenschaft überwindet Unmöglichkeit.",
      "GLP-1 Forschung: Ozempic in Entwicklung. Adipositas wird behandelbar.",
      "WHO erklärt: Kindersterblichkeit Rekordtief. Entwicklungsfortschritt funktioniert."
    ],
    global: [
      "Hongkong: 2 Millionen auf der Straße. Sicherheitsgesetz folgt 2020.",
      "Sudan: al-Bashir gestürzt. Hoffnung auf Demokratie.",
      "Bolivien: Evo Morales flüchtet. Linker Rückschlag.",
      "Chile, Ecuador, Irak, Libanon: Überall Massenproteste. System unter Druck."
    ],
    agency: null
  },

  2020: {
    event: "COVID-19 Pandemie — und mRNA-Revolution",
    sub: "Der Körper wird politisch. Und: Impfstoff in 10 Monaten. Medizin neu gedacht.",
    screen: 25.0, friends: 5, bmi: 29.5, polar: 74,
    neg: [
      "Lockdown: Screen Time +60%. Einsamkeit auf Maximum.",
      "Infodemic: Falschinformationen über COVID so schnell wie Virus.",
      "Schere: Milliardäre verdoppeln Vermögen. Armut steigt weltweit erstmals seit 20 Jahren."
    ],
    pos: [
      "mRNA-Impfstoff: 10 Monate von Sequenzierung zur Zulassung. Medizin-Revolution.",
      "Homeoffice: Ortsunabhängigkeit als Massenphänomen.",
      "Nachbarschaftshilfe: Analog-Renaissance in Krisenzeit.",
      "BLM: Größte Bürgerrechtsbewegung seit 1968."
    ],
    global: [
      "China: Erste Kontrolle des Ausbruchs. Überwachung als Argument.",
      "USA: 500.000 Tote bis 2021. Politisierung der Pandemie.",
      "Impfstoff-Ungleichheit: Reiche Länder horten, arme warten.",
      "Belarus: Lukaschenka fälscht Wahl. Millionen protestieren. Niederschlag."
    ],
    agency: null
  },

  2021: {
    event: "Facebook Papers + Meta + Capitol-Sturm",
    sub: "Frances Haugen beweist: Facebook wusste und schwieg. Zuckerberg flieht ins Metaverse.",
    screen: 26.0, friends: 5, bmi: 29.6, polar: 76,
    neg: [
      "Capitol-Sturm: Social Media als Radikalisierungskanal wirkt in die Realität.",
      "Facebook Papers: 30% Mädchen zeigen klinische Symptome nach Instagram. Gewusst.",
      "Afghanistan: Taliban zurück. 20 Jahre und 2 Billionen — zurück zum Start."
    ],
    pos: [
      "COVID-Impfung: 8 Milliarden Dosen in einem Jahr. Größte Impfkampagne je.",
      "Webb-Teleskop gestartet: Sehen bis an den Anfang des Universums.",
      "COP26: Kohleausstieg in Sicht. Methan-Reduzierung vereinbart.",
      "Erste mRNA-Krebsimpfstoffe in Studien: Krebs als impfbare Krankheit?"
    ],
    global: [
      "Afghanistan: Taliban. 20 Jahre, 2 Billionen, zurück zu 2001.",
      "Myanmar: Militärcoup. Suu Kyi verhaftet. Demokratie zerstört.",
      "Israel-Gaza: 11-Tage-Krieg. Eskalation ohne Lösung.",
      "Äthiopien: Tigray-Krieg. 500.000 Tote. Welt schaut kaum hin."
    ],
    agency: null
  },

  2022: {
    event: "Musk kauft Twitter + Ukraine-Krieg + ChatGPT",
    sub: "Erster Krieg in Europa seit 1945. Und KI verändert, was als Information gilt.",
    screen: 27.0, friends: 5, bmi: 29.7, polar: 77,
    neg: [
      "X/Twitter: Hassinhalte +100% nach Übernahme. Extremismus normalisiert.",
      "Energiekrise Europa: Abhängigkeit von Russland. Ignorierte Warnung.",
      "KI-Desinformation: Erste Deepfakes in politischem Einsatz."
    ],
    pos: [
      "ChatGPT: Wissen und Kreativität für alle. Jeder hat einen Tutor.",
      "Ukraine: Demokratie verteidigt sich. Überraschende Stärke.",
      "Solar-Kipp-Punkt: Günstigste Energiequelle aller Zeiten.",
      "Longevity-Forschung: Erste klinische Studien zu Alters-Reversal."
    ],
    global: [
      "Russland greift Ukraine an: Größter Landkrieg in Europa seit 1945.",
      "China: Zero-Covid-Proteste. Bevölkerung fordert erstmals kollektiv Rechte.",
      "BRICS+: Expansion. Saudi, Iran, Argentinien, Äthiopien bewerben sich.",
      "Iran: Frauen-Revolution. 'Frau, Leben, Freiheit.' — Mahsa Amini."
    ],
    agency: null
  },

  // ─────────────────────────────────────────────
  // AI ERA & TODAY  2023–2026
  // ─────────────────────────────────────────────

  2023: {
    event: "GPT-4 + Gemini — KI-Rasse beginnt",
    sub: "Microsoft, Google, Meta, Anthropic: Alle bauen gleichzeitig. KI filtet Realität.",
    screen: 27.5, friends: 4, bmi: 29.8, polar: 78,
    neg: [
      "KI-Desinformation skaliert: Deepfakes, gefälschte Nachrichten industriell produzierbar.",
      "Gaza-Krieg: 40.000+ Tote. Polarisierung auf Social Media maximal.",
      "Hitzerekorde: 2023 wärmstes Jahr je gemessen."
    ],
    pos: [
      "KI in Medizin: AlphaFold 2 — alle Protein-Strukturen bekannt. Medikamenten-Revolution.",
      "Erneuerbare 30%+ Weltstroms: Kipp-Punkt überschritten.",
      "mRNA-Krebsimpfstoff: Erste Patienten geheilt. Revolution nahe.",
      "Analog-Renaissance: Sauna-Clubs, Dinner-Circles, lokale Gemeinschaften wachsen."
    ],
    global: [
      "Gaza: Israel-Hamas. 40.000+ Tote. Westliche Doppelstandards sichtbar.",
      "Ukraine: Gegenoffensive stockt. Krieg wird lang.",
      "Wagner-Meuterei: Russlands Fragilität kurz sichtbar.",
      "Indien: Mondlandung. Erste asiatische Nation auf Mondpol."
    ],
    agency: {
      intro: "2023 ist vorbei — aber die Entscheidungen damals wirken noch. Was aus diesem Jahr lernst du für heute?",
      items: [
        { icon:'📱', title:'Digitale Hygiene', choice:'Setze Grenzen, bevor Algorithmen es für dich tun', why:'2023 war das Jahr, in dem KI-generierte Inhalte nicht mehr von echten unterscheidbar waren. Wer jetzt keine eigene Erkenntnistheorie hat — wie erkenne ich verlässliche Information? — ist anfällig.' },
        { icon:'🏋️', title:'Körper in Krisenzeiten', choice:'Bewegung ist nicht optional', why:'2023: Erste Studien zeigen, körperliche Fitness ist der beste Puffer gegen mentale Krisen. Schlechte Zeiten kommen. Wer einen starken Körper hat, hat eine Ressource.' },
        { icon:'🤝', title:'Gemeinschaft bauen', choice:'3 echte Verbindungen sind mehr wert als 300 Follower', why:'Einsamkeit war 2023 tödlicher als Rauchen (Harvard). Die Analog-Renaissance ist real. Nutze sie.' },
        { icon:'🧠', title:'KI verstehen', choice:'Lerne, wie KI denkt — nicht nur, was es produziert', why:'Wer versteht, wie Large Language Models funktionieren, ist weniger anfällig für ihre Fehler und besser in der Lage, sie zu nutzen.' },
        { icon:'🌍', title:'Globales denken', choice:'Erweitere deinen Horizont über Westeuropa hinaus', why:'2023 zeigte: Globaler Süden entwickelt eigene Regeln. Indien auf dem Mond. BRICS+ expandiert. Wer das versteht, hat einen Informationsvorsprung.' },
        { icon:'💚', title:'Klimahandeln', choice:'Konkret und lokal, nicht abstrakt und global', why:'2023 war wärmstes Jahr je. Abstrakte Klimaangst lähmt. Konkrete lokale Handlungen (Ernährung, Mobilität, Energie) schaffen Handlungsfähigkeit.' },
      ]
    }
  },

  2024: {
    event: "Technologische Autokratie — Stargate, DOGE, Staatskaptur",
    sub: "Private Firmen bauen staatliche Infrastruktur. Demokratische Kontrolle wird umgangen.",
    screen: 28.0, friends: 4, bmi: 29.9, polar: 79,
    neg: [
      "Staatskaptur: 3 Privatfirmen kontrollieren US-Regierungsdaten.",
      "1 Milliarde adipös: WHO 2024. Bewegungsarmut als globale Krise.",
      "60% der unter 30 ohne enge Freundschaften: Einsamkeit generational."
    ],
    pos: [
      "GLP-1 Medikamente (Ozempic): Adipositas-Behandlung als Durchbruch.",
      "Community-Bewegung: Sauna-Clubs, lokale Clubs wachsen massiv.",
      "Open Source KI: Llama, Mistral — Gegenmacht zu Big Tech.",
      "Erste mRNA-Krebsimpfstoff Phase-3-Studien: Hoffnung."
    ],
    global: [
      "Gaza: 50.000+ Tote. ICC klagt Israel und Hamas an.",
      "Russland-Ukraine: Stellungskrieg. Europa rüstet auf wie seit 1945 nicht.",
      "Taiwan: Wahlen. Tsai-Nachfolger. China-Druck eskaliert.",
      "Bangladesch: Hasina gestürzt. Studenten-Revolution."
    ],
    agency: {
      intro: "2024 ist gerade hinter uns. Was nimmst du mit? Und was entscheidest du für 2025 und darüber hinaus?",
      items: [
        { icon:'💪', title:'Körper als Kapital', choice:'Investiere so früh wie möglich in Muskelmasse', why:'WHO 2024: Bewegungsarmut tötet. GLP-1-Medikamente helfen — aber Bewegung ist die Basis, die keine Pille ersetzt. Muskelmasse ist der wichtigste Longevity-Marker.' },
        { icon:'🤝', title:'Echte Verbindung', choice:'Baue einen physischen Kreis — jetzt', why:'60% unter 30 ohne enge Freundschaften. Du kannst in die andere 40% gehen. Heute.' },
        { icon:'🧠', title:'Informationshygiene', choice:'Wähle deine Quellen aktiv, nicht passiv', why:'2024: Algorithmen bestimmen dein Weltbild, wenn du es nicht selbst tust. Drei verlässliche, unabhängige Quellen definieren — und täglich nutzen.' },
        { icon:'💰', title:'Finanzielle Resilienz', choice:'Baue Puffer auf — Automatisierung trifft Mittelklasse', why:'Erste Massenentlassungen durch KI 2024. Puffer (6 Monatseinkommen flüssig) sind die günstigste Versicherung.' },
        { icon:'🌿', title:'Natur als Medizin', choice:'30 Minuten täglich draußen — nicht optional', why:'2024: Erste Studien zeigen Natur-Exposition senkt Kortisol, verbessert Schlaf, stärkt Immunsystem. Kostenlos. Sofort wirksam.' },
        { icon:'📚', title:'Tiefes Lernen', choice:'Ein Buch pro Monat — kein Algorithmus ersetzt das', why:'In einer Welt voller Kurzinhalte ist tiefes Lesen eine Superkraft. Kognitive Flexibilität, die KI nicht geben kann.' },
      ]
    }
  },

  2025: {
    event: "KI wird Alltagswerkzeug — für alle",
    sub: "KI schreibt Code, diagnostiziert Krankheiten, unterrichtet. Die Frage ist nicht ob, sondern wie.",
    screen: 28.5, friends: 4, bmi: 30.0, polar: 79,
    neg: [
      "KI-Arbeitslosigkeit: Erste große Branchen betroffen — Verwaltung, einfache Programmierung.",
      "Desinformation industriell: Deepfakes von Staatschefs als Standard.",
      "Einsamkeit: Soziale Kontakte durch KI-Companions ersetzt — Symptom, nicht Lösung."
    ],
    pos: [
      "KI in Medizin: Diagnosen besser als Ärzte in Radiologie. Leben gerettet.",
      "Solar + Batterien: 40% des Weltstroms aus Erneuerbaren.",
      "Longevity: Erste Blutspiegel-Tests, die biologisches Alter messen — kommerziell verfügbar.",
      "Community-Renaissance: Lokale Gruppen als Gegenbewegung zur digitalen Isolation."
    ],
    global: [
      "Russland-Ukraine: Verhandlungen? Erschöpfung auf beiden Seiten.",
      "China: Wirtschaftliche Schwäche. Xi unter Druck. Taiwan-Risiko.",
      "Afrika: Erster Kontinent mit jüngster Bevölkerung UND wachsender Mittelklasse.",
      "Globale Governance: UN-Reform-Debatte. Sicherheitsrat nicht mehr repräsentativ."
    ],
    agency: {
      intro: "Wir sind in 2025. Das ist die Gegenwart. Hier sind die Hebel, die heute wirken.",
      items: [
        { icon:'🏃', title:'Bewegung als Identität', choice:'Finde deine sportliche Disziplin — und mache sie zu dir', why:'Nicht Sport als Pflicht. Sport als Selbstbild. Menschen, die Bewegung als Identität rahmen, bleiben dabei. Die Longevity-Daten sind eindeutig: Muskelmasse schützt.' },
        { icon:'👁', title:'Aufmerksamkeit schützen', choice:'Definiere 2 Stunden täglich als Algorithmus-freie Zeit', why:'Deine Aufmerksamkeit ist das wertvollste Gut, das du hast. 2025 kämpfen hunderte Milliarden-Dollar-Systeme darum. Du kannst entscheiden.' },
        { icon:'🤝', title:'Gemeinschaft', choice:'Friday Circle: Baue deinen lokalen Kreis', why:'Einsamkeit ist die Epidemie unserer Zeit. Die Lösung ist einfach und schwer zugleich: physische, regelmäßige, verbindliche Gemeinschaft.' },
        { icon:'🤖', title:'KI als Werkzeug', choice:'Lerne KI aktiv zu steuern — nicht passiv zu konsumieren', why:'KI ist das Werkzeug, das alle anderen Werkzeuge verändert. Wer es nutzen kann, hat einen Vorsprung in jedem Berufsfeld.' },
        { icon:'💵', title:'Einkommensresilienz', choice:'Baue eine zweite Einkommensquelle auf', why:'KI-Disruption ist nicht abstrakt. Wer heute eine zweite Quelle entwickelt, hat 2030 Optionen. 500€ monatlich reichen als Anfang.' },
        { icon:'🌿', title:'Regeneration', choice:'Schlaf, Natur, Stille als nicht-verhandelbare Basis', why:'Körper und Geist regenerieren sich nur im Parasympathikus. HRV tracken. 7–9h Schlaf. Täglich 20 Min draußen. Das ist das Fundament.' },
      ]
    }
  },

  2026: {
    event: "KI-Zeitalter — Schwelle zwischen Drift und Gestaltung",
    sub: "Mehr Menschen suchen echte Verbindung, echten Körper, echten Kontext. Die Gegenbewegung ist real.",
    screen: 29.0, friends: 4, bmi: 30.1, polar: 79,
    neg: [
      "7h Screen Time täglich. Kinder über 8h.",
      "Schere: Top 1% besitzt mehr als untere 50% zusammen — historisches Maximum.",
      "Demokratie-Erosion: Institutionen unter Druck in 50+ Ländern."
    ],
    pos: [
      "Analog-Renaissance: Die bewusste Minderheit wächst. Du bist Teil davon.",
      "Longevity: Biologisches Alter messbar, optimierbar.",
      "Open Source: Dezentrale Infrastruktur wächst — Signal, Mastodon, lokale KI.",
      "Community als Gegenmacht: Kleine Kreise als stabilste soziale Einheit."
    ],
    global: [
      "Multipolare Unordnung: Keine Supermacht setzt Regeln. Chaos als Normalzustand.",
      "KI als Waffe: Deepfakes, Desinformation in 30+ Ländern als Staatsstrategie.",
      "Klimakrise: Erste Megastädte mit struktureller Wasserknappheit.",
      "BRICS+: Dollar-Hegemonie wackelt erstmals seit Bretton Woods."
    ],
    agency: {
      intro: "Das ist heute. Die Frage ist nicht, was die Welt mit dir macht — sondern was du mit dem Rest deines Lebens machst.",
      items: [
        { icon:'🏃', title:'Körper', choice:'Starte ein Langzeit-Athletik-Projekt', why:'Longevity-Forschung ist eindeutig: Wer mit 40–50 Muskelmasse aufbaut, hat mit 60–70 einen Jahrzehnte-Vorsprung. Hyrox, Schwimmen, Kraft — wähle eine Disziplin, die dich trägt.' },
        { icon:'🧭', title:'Klarheit', choice:'Definiere, was du weißt — und was nur Meinung ist', why:'In einer Welt voller Algorithmen ist epistemische Klarheit (Wer erzählt mir das? Warum? Was sind die Belege?) die wertvollste Fähigkeit.' },
        { icon:'🤝', title:'Gemeinschaft', choice:'Baue deinen Friday Circle', why:'3–5 Menschen, mit denen du tief verbunden bist, sind das wichtigste Gesundheitsmittel deines Lebens. Nicht 500 Follower.' },
        { icon:'📱', title:'Digitale Souveränität', choice:'Wähle deine Tools bewusst — nicht durch Default', why:'Jede App, die du nutzt, optimiert gegen deine Interessen. Signal statt WhatsApp. Mastodon statt X. Open-Source-KI statt Cloud-Monopole.' },
        { icon:'💰', title:'Unabhängigkeit', choice:'Finanzielle Freiheit als 5-Jahres-Projekt', why:'Wer 2031 nicht von einem einzigen Job abhängig ist, hat Optionen in einer Welt, die sich schnell wandelt.' },
        { icon:'🌱', title:'Regeneration', choice:'Recovery ist kein Luxus — es ist das System', why:'HRV, Schlaf, Atemübungen, Natur. Wer systematisch regeneriert, kann systematisch leisten. Das ist die Infrastruktur.' },
      ]
    }
  },

  // ─────────────────────────────────────────────
  // FUTURE  2027–2050
  // ─────────────────────────────────────────────

  2027: {
    event: "Zukunft — KI in jedem Werkzeug, jedem Arzt, jeder Schule",
    sub: "Noch offen. Wird von dem geprägt, was wir jetzt entscheiden.",
    screen: 30, friends: 4, bmi: 30.2, polar: 80,
    neg: [
      "KI-Beschäftigungsverschiebung: Erste Branchen strukturell verändert.",
      "Deepfakes als Normalzustand: Was ist noch wahr?",
      "Einsamkeit: Ohne Gegenbewegung weiter auf Rekordhöhe."
    ],
    pos: [
      "KI-Medizin: Diagnosegenauigkeit übertrifft Spezialisten in 5 Fachbereichen.",
      "mRNA-Krebs: Erste therapeutische Impfstoffe zugelassen.",
      "Erneuerbare: 50% des Weltstroms. Energiewende irreversibel.",
      "Community-Bewegung: Lokale Gruppen, Friday Circles als Gegenentwurf."
    ],
    global: [
      "Taiwan: Spannungen. Wahrscheinlichste geopolitische Krise der Dekade.",
      "Afrika: Demografie als Chance — wenn Bildung und Jobs folgen.",
      "KI-Governance: Erste internationale Verträge versucht.",
      "Wasser: Erste Kriege um Süßwasser-Zugang."
    ],
    agency: {
      intro: "2027 ist zwei Jahre entfernt. Was du heute säst, wächst dann. Konkrete Entscheidungen mit 2-Jahres-Horizont.",
      items: [
        { icon:'💪', title:'Körper 2027', choice:'Setze dir ein messbares Athletik-Ziel für 2027', why:'Hyrox, Marathon, 100kg Deadlift — konkrete Ziele schaffen Struktur und Identität. Nicht "fitter werden", sondern "10km unter 55 Minuten".' },
        { icon:'🤖', title:'KI-Kompetenz', choice:'Lerne, ein KI-Tool wirklich zu beherrschen', why:'Bis 2027 werden KI-Kompetenzen in jedem Berufsfeld erwartet. Wer jetzt Tiefe aufbaut, ist dann Senior.' },
        { icon:'🤝', title:'Verbindung', choice:'Initiiere eine regelmäßige Gruppe', why:'Monatliches Dinner, wöchentliches Training, quartärliches Retreat. Wer die Initiative ergreift, gewinnt Gemeinschaft.' },
        { icon:'📚', title:'Wissen', choice:'Lies 24 Bücher bis 2027', why:'2 pro Monat. Kein Algorithmus. Bücher sind das Medium für komplexes Denken — und das bleibt.' },
        { icon:'💵', title:'Einkommen', choice:'Erste 500€ monatlich aus zweiter Quelle', why:'Beratung, Kurs, Mieteinnahme, Dividende. Der erste Schritt ist der schwierigste.' },
        { icon:'🌿', title:'Natur', choice:'1 Natur-Erfahrung pro Monat außerhalb der Stadt', why:'Wald, See, Berge. Gehirn-Reset. Perspektive. Demut. Kostenlos.' },
      ]
    }
  },

  2028: {
    event: "Zukunft — US-Wahl, KI-Governance, Post-Musk-Ära?",
    sub: "Politisch offenes Jahr. Technologisch: KI-Regulierung oder Wilder Westen.",
    screen: 30.5, friends: 4, bmi: 30.3, polar: 80,
    neg: [
      "US-Wahl: Welche Richtung nimmt die weltmächtigste Demokratie?",
      "KI ohne Governance: Deepfakes, autonome Waffen.",
      "Klimakrise: Erste permanente Evakuierungen von Küstenstädten."
    ],
    pos: [
      "Longevity-Mainstream: Erste 120-Jahres-Therapien in klinischen Tests.",
      "Fusion: Erste kommerzielle Fusionskraftwerks-Prototypen?",
      "Offene KI: Dezentralisierung als Gegenmodell zum Monopol.",
      "Psychedelika-Therapie: FDA-zugelassen für PTSD, Depression."
    ],
    global: [
      "USA-Wahl 2028: Vance? Demokratie? Entscheidend.",
      "China: Innenpolitischer Druck. Wirtschaft schwächer. Xi unter Druck.",
      "Sahel: Klimamigration. 50 Millionen Menschen.",
      "Indien: Größte Volkswirtschaft? BIP überholt USA?"
    ],
    agency: {
      intro: "2028 ist politisch entscheidend. Was kannst du tun, damit die Welt in diese Richtung geht — und damit dein Leben robust bleibt, egal was kommt?",
      items: [
        { icon:'🗳️', title:'Politisches Engagement', choice:'Engagiere dich lokal — nicht nur national', why:'Gemeinderäte, Stadtplanung, lokale Initiativen. Hier ist dein Einfluss am größten. Nationale Politik ist schwer zu bewegen. Lokale Politik ist es.' },
        { icon:'💪', title:'Körper', choice:'Halte deinen Trainingsrhythmus durch politische Krisen', why:'Krisen sind die Zeit, in der Menschen aufhören, für sich zu sorgen. Tu das Gegenteil.' },
        { icon:'🧠', title:'Urteilsvermögen', choice:'Entwickle eine bewusste Medienstrategie für Wahljahre', why:'2028 wird Desinformations-Intensität auf neuem Level sein. Wer seine Quellen kennt, ist resilienter.' },
        { icon:'🤝', title:'Gemeinschaft', choice:'Dein Kreis ist dein Anker in unsicheren Zeiten', why:'Wer eine stabile Gemeinschaft hat, übersteht politische Stürme. Wer isoliert ist, ist anfällig.' },
        { icon:'💰', title:'Wirtschaftliche Resilienz', choice:'Prüfe: Ist dein Einkommen konjunkturresistent?', why:'Rezessionsrisiken durch KI-Disruption sind real. Drei Fragen: Was tust du, das KI nicht kann? Wie diversifiziert ist dein Einkommen? Wie groß ist dein Puffer?' },
        { icon:'🌍', title:'Globale Perspektive', choice:'Reise — echte Länder, echte Menschen, keine Tourismusblasen', why:'In einer polarisierten Welt ist eigene Erfahrung mit anderen Kulturen der beste Schutz gegen Feindbilder.' },
      ]
    }
  },

  2030: {
    event: "Zukunft — möglicher Wendepunkt",
    sub: "Offen. Hängt von Entscheidungen ab, die wir heute treffen.",
    screen: 31, friends: 4, bmi: 30.5, polar: 80,
    neg: [
      "KI-Beschäftigung: Mittelklasse-Jobs strukturell verändert. Umschulung als Massenaufgabe.",
      "Klimamigration: 50–100 Millionen Menschen unterwegs.",
      "Polarisierung: Ohne Kurskorrektur — historisches Maximum."
    ],
    pos: [
      "Erneuerbare: 60%+ Weltstrom. Kipp-Punkt irreversibel.",
      "Longevity: Biologisches Altern messbar und veränderbar.",
      "Community-Renaissance: Neue Formen lokaler Gemeinschaft etabliert.",
      "mRNA-Krebs: Mehrere Krebsarten als behandelbare Krankheiten."
    ],
    global: [
      "Multipolare Welt: USA, China, Indien, EU, Afrika-Union — keine dominiert.",
      "KI-Governance: Erste internationale Verträge — oder nicht.",
      "Wasserknappheit: Geopolitischer Konfliktstoff.",
      "Demografischer Wandel: Überalternde Gesellschaften in Europa und China."
    ],
    agency: {
      intro: "2030 ist 4 Jahre entfernt. Du wirst dann 4 Jahre älter sein. Die Frage ist nur: Welche Version von dir?",
      items: [
        { icon:'💪', title:'Körper 2030', choice:'4-Jahres-Athletik-Projekt beginnen', why:'Wer 2030 mit 40 seine Muskelmasse aufgebaut hat, hat mit 50 einen 10-Jahres-Vorsprung. Beginne heute.' },
        { icon:'🏠', title:'Gemeinschaft 2030', choice:'Baue physischen Kreis — lokale Verankerung', why:'2030 wird echte Gemeinschaft Luxus oder Gegenentwurf sein. Wer jetzt beginnt, ist dann etabliert.' },
        { icon:'🤖', title:'KI 2030', choice:'Lerne KI als Werkzeug, nicht als Bedrohung', why:'Die Qualifikationslücke wird 2030 riesig sein. Wer KI-Kompetenz hat, ist massiv im Vorteil.' },
        { icon:'📍', title:'Ortsunabhängigkeit', choice:'Remote Work: Baue Location Independence auf', why:'2030 wird physischer Ort zunehmend trennbar von Einkommen — für die, die es vorbereitet haben.' },
        { icon:'🌱', title:'Resilienz', choice:'Puffer in Zeit, Geld, Gesundheit, Gemeinschaft', why:'Klimaereignisse und wirtschaftliche Schocks werden häufiger. Resilienz ist keine Paranoia — es ist Vorbereitung.' },
        { icon:'🎓', title:'Wissen', choice:'Definiere dein Kernwissensgebiet und geh tief', why:'Generalisten sind austauschbar. Ein tiefer Wissensbereich — plus Vernetzungskompetenz — ist das Kapital der 2030er.' },
      ]
    }
  },

  2035: {
    event: "Zukunft — Longevity-Gesellschaft",
    sub: "Biologisches und chronologisches Alter entkoppeln sich. Was bedeutet alt sein noch?",
    screen: 33, friends: 3, bmi: 30.7, polar: 81,
    neg: [
      "Longevity-Ungleichheit: Wer kann sich 120 gesunde Jahre leisten?",
      "KI-Gesellschaft: Massive Umverteilung von Arbeit.",
      "Klima: Erste permanente Evakuierungen von Inseln und Küstenstädten."
    ],
    pos: [
      "Longevity: Biologisches Alter messbar, 10–15 Jahre Differenz möglich.",
      "Krebs: Die meisten behandelbar wie chronische Krankheiten.",
      "Fusion: Erste kommerzielle Testanlagen.",
      "Bildung: KI als persönlicher Tutor für jeden."
    ],
    global: [
      "Afrika: 1,8 Milliarden Menschen. Wenn Bildung und Jobs folgen — größte Wirtschaft.",
      "China: Post-Xi? Wie öffnet sich eine Gesellschaft nach Diktatur?",
      "KI-Souveränität: Welche Länder kontrollieren eigene KI-Infrastruktur?",
      "Wasser: 40 Länder mit struktureller Knappheit."
    ],
    agency: {
      intro: "2035 ist 9 Jahre entfernt. Was du heute als Identität aufbaust, trägt dich dann. Nicht Ziele — Gewohnheiten.",
      items: [
        { icon:'🧬', title:'Biologisches Alter', choice:'Messe und optimiere — Longevity als Projekt', why:'2035 werden Bluttests biologisches Alter messen. Wer ab heute trainiert, ernährt, schläft — ist biologisch jünger als sein Kalenderalter.' },
        { icon:'🏡', title:'Heimat', choice:'Baue Ort, der trägt — physische Gemeinschaft', why:'2035 wird physische Gemeinschaft teurer oder seltener. Wer sie jetzt aufbaut, hat sie dann.' },
        { icon:'💡', title:'Compound Learning', choice:'1h täglich = 3.000h bis 2035', why:'Tiefes Wissen in einem Bereich schlägt Oberflächenwissen in zehn. Wer täglich lernt, ist 2035 Experte.' },
        { icon:'🌐', title:'Digitale Souveränität', choice:'Kontrolliere deine Daten und Tools', why:'2035 entscheidet, wer digitale Identität besitzt. Open Source, eigene Server, Datensouveränität.' },
        { icon:'💞', title:'Tiefe Beziehungen', choice:'Investiere in Menschen, nicht in Netzwerke', why:'3–5 tiefe Verbindungen schlagen 500 Follower. Das ist die Formel.' },
        { icon:'⚖️', title:'Finanzielle Freiheit', choice:'Vermögen, das nicht an Job gebunden ist', why:'2035: Angestellter-Mittelstand unter Druck. Wer früh aufbaut — Aktien, Immobilien, eigene Projekte — hat Optionen.' },
      ]
    }
  },

  2040: {
    event: "Zukunft — KI-Gesellschaft etabliert",
    sub: "Niemand weiß es. Aber wir gestalten sie gerade, in diesem Moment.",
    screen: 35, friends: 3, bmi: 31.0, polar: 82,
    neg: [
      "KI ersetzt Mittelklasse-Jobs strukturell. Was bleibt?",
      "Klimakrise: Erste Megastädte unbewohnbar im Sommer.",
      "Digitale Spaltung: Wer KI nicht kann, fällt durch."
    ],
    pos: [
      "Longevity: Erste Generation mit realem Ziel 100 gesunde Jahre.",
      "Körper als Lebensprojekt: Biologisches Alter gestaltbar.",
      "Dezentralisierung: Kleine, lokale Gemeinschaften als stabilstes Modell.",
      "Medizin: Kein Krebs mehr unheilbar. Alzheimer behandelbar."
    ],
    global: [
      "Post-westliche Ordnung: Europa nicht mehr Zentrum.",
      "KI-Souveränität: Wessen KI formt die Weltsicht?",
      "Afrika: Entweder größte Wachstumskraft oder größte humanitäre Krise.",
      "Longevity-Ungleichheit: Reiche leben 120, Arme 65?"
    ],
    agency: {
      intro: "2040 — 14 Jahre entfernt. Du bist dann 14 Jahre älter. 14 Jahre bewusster Gestaltung, oder 14 Jahre Drift?",
      items: [
        { icon:'🧬', title:'Biologisches Alter', choice:'Investiere jetzt in Körper — 2040 profitierst du', why:'Wer ab heute trainiert, hat 2040 biologisch 10–15 Jahre weniger als sein Kalenderalter.' },
        { icon:'🏡', title:'Physische Heimat', choice:'Gemeinschaft jetzt aufbauen — solange alle suchen', why:'2040 wird lokale Gemeinschaft entweder Luxus oder Widerstand sein.' },
        { icon:'💡', title:'Compound-Wissen', choice:'1h täglich × 14 Jahre = 5.000 Stunden', why:'In 14 Jahren bist du Experte in dem, was du heute anfängst.' },
        { icon:'🌐', title:'Digitale Souveränität', choice:'Verstehe deine Daten', why:'2040 entscheidet, wer digitale Identität kontrolliert.' },
        { icon:'💞', title:'Tiefe Beziehungen', choice:'3–5 Menschen, die dich kennen', why:'Einsamkeit ist tödlicher als Rauchen. Das gilt 2040 noch mehr.' },
        { icon:'⚖️', title:'Finanzielle Freiheit', choice:'Vermögen aufbauen', why:'2040 ohne finanziellen Puffer ist riskant. Jeder frühe Schritt zählt.' },
      ]
    }
  },

  2045: {
    event: "Zukunft — Singularität? Oder einfach: Menschsein 2.0",
    sub: "Ray Kurzweil sagte 2045. Niemand weiß. Sicher ist: die Welt ist radikal anders.",
    screen: 38, friends: 3, bmi: 31.0, polar: 82,
    neg: [
      "Transhumanismus: Wer hat Zugang zu Körper-Erweiterungen?",
      "Klimafolgen: Irreversible Veränderungen spürbar.",
      "Demokratie: Noch vorhanden? In welcher Form?"
    ],
    pos: [
      "Menschliche Kreativität: KI kann imitieren, nicht erfinden.",
      "Longevity: 120 gesunde Jahre als realistisches Ziel.",
      "Verbindung: Echte menschliche Verbindung als wertvollste Ressource.",
      "Natur: Ökosystem-Restauration als globales Projekt."
    ],
    global: [
      "Weltordnung 2045: Unbekannt. Multipolar, instabil, oder neue Kooperation?",
      "Klima: Entweder Kipp-Punkte überwunden oder neue Normalität.",
      "Demographischer Wandel: Überalternde Gesellschaften, alternde Erde.",
      "Weltraum: Erste permanente Mondbasen. Mars als Frage."
    ],
    agency: {
      intro: "2045 klingt wie Science Fiction. Aber in 19 Jahren bist du dort. Was willst du dann über dein Leben sagen können?",
      items: [
        { icon:'🧬', title:'100 gesunde Jahre', choice:'Entscheide heute, ob das dein Ziel ist', why:'Longevity ist kein Zufall. Es ist das Ergebnis täglicher Entscheidungen über Bewegung, Ernährung, Schlaf, Verbindung. Start jetzt.' },
        { icon:'🏡', title:'Bedeutungsvolle Arbeit', choice:'Baue Arbeit, die dich 2045 noch erfüllt', why:'KI nimmt, was repetitiv ist. Was bleibt: Beziehung, Kreativität, Gestaltung. Baue darauf.' },
        { icon:'💞', title:'Tiefe Verbindungen', choice:'Die Menschen, die du heute siehst, sind 2045 dein Netz', why:'Investitionen in Beziehungen haben die längste Rendite.' },
        { icon:'🌍', title:'Etwas hinterlassen', choice:'Was ist dein Beitrag, der über dich hinausgeht?', why:'Nicht grandiös. Lokal. Dein Kreis, deine Gemeinschaft, deine Kinder, deine Ideen.' },
        { icon:'💡', title:'Weisheit', choice:'Wissen sammeln ist nicht genug — Urteilsvermögen entwickeln', why:'2045 hat jeder Zugang zu allem. Der Unterschied: Wer kann daraus handeln?' },
        { icon:'🌿', title:'Einfachheit', choice:'Halte das Einfache einfach', why:'In einer komplexen Welt ist Simplizität die Superkraft. Essen, Bewegen, Schlafen, Verbinden. Das bleibt.' },
      ]
    }
  },

  2050: {
    event: "Zukunft — Ende des Datensatzes",
    sub: "Du wärst dann zwischen 55 und 100 Jahre alt, je nach Geburtsjahr. Was zählst du dann?",
    screen: 40, friends: 3, bmi: 31.0, polar: 82,
    neg: [
      "Klimawandel: Teile der Erde unbewohnbar. Massenmigration.",
      "Ungleichheit: Biologische und soziale Schere maximal?",
      "Demokratie: Unter Druck von KI, Autokratie, Desinteresse."
    ],
    pos: [
      "Menschlichkeit: Echte Verbindung, Kreativität, Mitgefühl — kein Algorithmus ersetzt sie.",
      "Natur: Restauration möglich, wenn wir es wollen.",
      "Wissenschaft: Lösungen für alles existieren — Frage ist politischer Wille.",
      "Jede Generation wächst auf: Hoffnung ist strukturell, nicht naiv."
    ],
    global: [
      "2050-Welt: Niemand weiß. Jede Prognose von 2026 ist mit Unsicherheit behaftet.",
      "Das Einzige, was sicher ist: Was du heute tust, trägt bis dorthin.",
      "Lokal denken, global verstehen, jetzt handeln.",
      "Friday Circle: Ein Kreis, der trägt — heute, morgen, 2050."
    ],
    agency: {
      intro: "2050. Das Ende des Datensatzes. Aber nicht das Ende deines Lebens. Was willst du bis dann gelebt haben?",
      items: [
        { icon:'💝', title:'Liebe und Verbindung', choice:'Pflege die Menschen, die du liebst — jetzt', why:'Am Lebensende bereut niemand zu viel Sport oder zu viel Erfolg. Bereut wird: zu wenig Zeit mit Menschen, die zählen.' },
        { icon:'🌿', title:'Gesundheit', choice:'Dein Körper ist das einzige Haus, das du sicher hast', why:'Alles andere kann kommen und gehen. Wer seinen Körper früh als Projekt versteht, hat 2050 die meisten Optionen.' },
        { icon:'🎨', title:'Kreativität', choice:'Erschaffe etwas, das über dich hinausgeht', why:'Bauen, Schreiben, Lehren, Kochen, Gärtnern — Kreativität ist das, was KI nicht ersetzen kann und was Menschen seit Jahrtausenden verbindet.' },
        { icon:'🌍', title:'Beitrag', choice:'Frage dich: Was bleibt, wenn ich nicht mehr da bin?', why:'Nicht grandiös. Ein Garten, eine Gruppe, ein Buch, ein Mensch, dem du geholfen hast.' },
        { icon:'🧘', title:'Frieden', choice:'Lerne, mit Unsicherheit zu leben', why:'Die Welt 2050 ist unsicher. Die war sie immer. Wer gelernt hat, trotzdem zu handeln — trägt das leichter.' },
        { icon:'🏃', title:'Bewegung', choice:'Bleib in Bewegung — wörtlich und übertragen', why:'Körperliche Bewegung bis ins hohe Alter ist der stärkste Prädiktor für Lebensqualität. Und Bewegung im übertragenen Sinn — Neugier, Offenheit, Wandel — ist das, was das Leben reich macht.' },
      ]
    }
  }

};

// ═══════════════════════════════════════════════════════════
// INTERPOLATION HELPER
// ═══════════════════════════════════════════════════════════
// Call getData(year) for any year 1950–2050.
// Returns exact data if available, interpolated otherwise.

function getData(year) {
  if (YEAR_DATA[year]) return YEAR_DATA[year];

  const keys = Object.keys(YEAR_DATA).map(Number).sort((a, b) => a - b);
  let lo = keys[0];
  let hi = keys[keys.length - 1];

  for (const k of keys) { if (k <= year) lo = k; }
  for (const k of [...keys].reverse()) { if (k >= year) hi = k; }
  if (lo === hi) return YEAR_DATA[lo];

  const t = (year - lo) / (hi - lo);
  const L = YEAR_DATA[lo];
  const H = YEAR_DATA[hi];
  const lerp = (a, b) => Math.round((a + (b - a) * t) * 10) / 10;

  return {
    event: year < 2026 ? `${year}` : `${year} — Zukunft`,
    sub: year < 2026
      ? `Zwischen "${L.event.split('—')[0].trim()}" und "${H.event.split('—')[0].trim()}"`
      : 'Noch offen. Gestalte sie jetzt.',
    screen: lerp(L.screen, H.screen),
    friends: lerp(L.friends, H.friends),
    bmi: lerp(L.bmi, H.bmi),
    polar: lerp(L.polar, H.polar),
    neg: L.neg,
    pos: L.pos,
    global: L.global,
    agency: year > 2026 ? (H.agency || L.agency) : null
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
function init() {
  const sel = document.getElementById('birthSel');
  if (!sel) return;
  for (let y=1950; y<=1995; y++) {
    const o=document.createElement('option');
    o.value=y; o.textContent=y;
    if (y === 1995) o.selected = true;
    sel.appendChild(o);
  }
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
  birthYear = parseInt(document.getElementById('birthSel').value);
  renderBanner();
  renderGrid();
  closePanel();
}

function renderBanner() {
  const age = NOW - birthYear;
  const pct = Math.round(age/SPAN*100);
  const webSentence = birthYear >= 1991
    ? 'Das Web existiert seitdem Du geboren bist.'
    : `Das Web existiert seit du ${1991-birthYear} Jahre alt warst.`;
  document.getElementById('bannerTxt').textContent =
    `Du bist ${age} Jahre alt. Du hast ${pct}% deines Lebens hinter dir. ${webSentence}`;
  document.getElementById('bannerNums').innerHTML = `
    <div class="age-stat"><div class="age-stat-val">${age}</div><div class="age-stat-label">Gelebte Jahre</div></div>
    <div class="age-stat"><div class="age-stat-val">${pct}%</div><div class="age-stat-label">Deines Lebens</div></div>
    <div class="age-stat"><div class="age-stat-val">${SPAN-age}</div><div class="age-stat-label">Verbleibend</div></div>
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
  activeTab = modeToTab(mode);

  document.querySelectorAll('.sq').forEach(s=>s.classList.remove('active'));
  sqEl.classList.add('active');
  activeSq=sqEl;

  const d = getData(year);
  const e = ERA_DEF[era(year)];
  const sqColors = squareColors(year);
  const isFuture = year>NOW;

  // header
  document.getElementById('pYear').classList.remove('panel-year--hint');
  document.getElementById('pYear').textContent=year;
  const etag=document.getElementById('pEra');
  etag.style.display = 'inline-block';
  etag.textContent = e.label;
  etag.style.background = sqColors.bg;
  etag.style.color = sqColors.fg;
  document.getElementById('pEvent').textContent=d.event;
  document.getElementById('pEvent').style.display = 'block';

  // build tabs
  const tabsEl = document.getElementById('panelTabs');
  const tabs = [
    {id:'global',   label:'Welt'},
    {id:'society',  label:'Gesellschaft'},
    {id:'pos',      label:'Chancen'},
  ];
  if (isFuture && d.agency) tabs.push({id:'agency', label:'Was kann ich schon heute tun?'});

  tabsEl.innerHTML = tabs.map(t=>
    `<button class="ptab${t.id===activeTab?' active':''}" onclick="switchTab('${t.id}')">${t.label}</button>`
  ).join('');

  // ensure valid activeTab
  if (isFuture && d.agency && activeTab==='agency') {/* ok */}
  else if (!isFuture && activeTab==='agency') activeTab='society';

  // stats
  const statsEl=document.getElementById('pStats');
  const stats=[
    { label:'Screentime', val:`${d.screen}h`, desc:'Std/Tag/Mensch',
      cls: d.screen>20?'bad':d.screen>10?'ok':'good',
      trend: d.screen>20?'↑ kritisch':d.screen>10?'↑ bedenklich':'→ normal' },
    { label:'Freundschaften', val:d.friends, desc:'Echte Freundschaften / Mensch (westl. Gesellschaft)',
      cls: d.friends<5?'bad':d.friends<9?'ok':'good',
      trend: d.friends<5?'↓ Einsamkeits-Krise':d.friends<9?'↓ sinkend':'→ stabil' },
    { label:'Freiheit', val:'—', desc:'% freie Gesellschaft weltweit',
      cls:'ok',
      trend:'→ Basiseinheit gespeichert' },
    { label:'BMI', val:d.bmi, desc:'Durchm. BMI weltweit',
      cls: d.bmi>29?'bad':d.bmi>27?'ok':'good',
      trend: d.bmi>29?'↑ Fettleibigkeit':d.bmi>27?'↑ Übergewicht normal':'→ Normalbereich' },
    { label:'Polarisierung', val:`${d.polar}%`, desc:'% mediale Polarisierung inkl. Social Media weltweit',
      cls: d.polar>65?'bad':d.polar>45?'ok':'good',
      trend: d.polar>65?'↑ histor. Maximum':d.polar>45?'↑ steigend':'→ gemäßigt' },
  ];
  statsEl.innerHTML=stats.map(s=>`
    <div class="stat-cell">
      <div class="stat-label">${s.label}</div>
      <div class="stat-val">${s.val}</div>
      <div class="stat-desc">${s.desc}</div>
      <div class="stat-trend ${s.cls}">${s.trend}</div>
    </div>`).join('');

  // society top text (plain flow, no tiles/dividers/clickers)
  const insights = (d.neg || []).filter(Boolean);
  document.getElementById('pInsights').innerHTML = insights.length
    ? `<div class="insight-flow"><div class="insight-text">${insights.join(' ')}</div></div>`
    : '';

  // positive
  const posTitles=['Mentales','Körper','Gemeinschaft','Technologie'];
  const posIcons=['🧠','💪','🤝','🔬'];
  document.getElementById('pPos').innerHTML=(d.pos||[]).map((txt,i)=>`
    <div class="pos-block">
      <div class="pos-head"><span class="pos-icon">${posIcons[i]||'✦'}</span><span class="pos-title">${posTitles[i]||''}</span></div>
      <div class="pos-text">${txt}</div>
    </div>`).join('');

  // global
  const globalIcons=['Weltmacht USA','Aufstrebendes China','Alte Welt','Neue Welt'];
  document.getElementById('pGlobal').innerHTML=(d.global||[]).map((txt,i)=>`
    <div class="global-block">
      <div class="global-region">${globalIcons[i]||`Perspektive ${i+1}`}</div>
      <div class="global-text">${txt}</div>
    </div>`).join('');

  // agency (future)
  if (d.agency) {
    document.getElementById('pAgencyIntro').innerHTML = `${d.agency.intro}`;
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}