// balkonius-combinations.js
// Statische Produktdaten für den Balkonius-Shop
// Import: import { combinations, filterCombinations, filterOptions } from './data/balkonius-combinations'

const combinations = [

  // ─── VIEL SONNE · GESCHÜTZT ──────────────────────────────

  {
    id: "vs-g-natur",
    titel: "Mediterrane Wildheit",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Mediterrane Wildheit.png?v=20260510-1",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "mai-oktober",
      farbwelt: "lila-blau",
      biodiversitaet: true,
      winterfest: true,
      mehrjaehrig: true,
      duftend: true,
      giftig: false,
      familie: false,
      kueche: false,
    },
    pflanzen: [
      "Lavendel",
      "Schafgarbe",
      "Goldfetthenne",
      "Oregano Dost",
      "Blauschwingel",
    ],
    beschreibung: "Mediterrane Hitzekombination. Duftend, bienenfreundlich, winterfest. Fast wartungsfrei.",
  },

  {
    id: "vs-g-klassik",
    titel: "Klassischer Sommerflair",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Klassischer Sommerflair.png?v=20260510-2",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "klassik",
      pflege: "mittel",
      bluetezeit: "mai-oktober",
      farbwelt: "bunt",
      biodiversitaet: false,
      winterfest: false,
      mehrjaehrig: false,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Eisenkraut Verbene",
      "Kapuzinerkresse",
      "Ringelblume",
      "Löwenmäulchen",
      "Zaubergloeckchen",
    ],
    beschreibung: "Üppige Sommerblüte, viele Farben, lange Saison bis Frost.",
  },

  {
    id: "vs-g-sweet",
    titel: "Rosa Wolke",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Rosa Wolke.png",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "sweet",
      pflege: "niedrig",
      bluetezeit: "mai-oktober",
      farbwelt: "rosa-weiss",
      biodiversitaet: false,
      winterfest: false,
      mehrjaehrig: false,
      duftend: true,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Fleissiges Lieschen",
      "Elfenspiegel",
      "Duftsteinrich",
      "Elfensporn",
      "Teppichschleierkraut",
    ],
    beschreibung: "Zartes Rosa-Weiss, kompakt, romantisch, lange Blüte.",
  },

  {
    id: "vs-g-luxus",
    titel: "Goldene Stunde",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Goldene Stunde.png?v=20260510-3",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "luxus",
      pflege: "mittel",
      bluetezeit: "juni-oktober",
      farbwelt: "warm-gold",
      biodiversitaet: false,
      winterfest: false,
      mehrjaehrig: false,
      duftend: true,
      giftig: false,
      familie: false,
      kueche: false,
    },
    pflanzen: [
      "Dahlie",
      "Vanilleblume",
      "Schmuckkörbchen",
      "Kokardenblume",
      "Blauschwingel",
    ],
    beschreibung: "Strukturiert, hochwertig, dramatische Blüten, Sommer bis Herbst.",
  },

  {
    id: "vs-g-bienen",
    titel: "Bienenparadies",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Bienenparadies.png?v=20260510-4",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "juni-september",
      farbwelt: "lila-blau",
      biodiversitaet: true,
      winterfest: true,
      mehrjaehrig: true,
      duftend: true,
      giftig: false,
      familie: false,
      kueche: false,
    },
    pflanzen: [
      "Lavendel",
      "Schafgarbe",
      "Duftnessel",
      "Oregano Dost",
      "Rauer Sonnenhut",
    ],
    beschreibung: "Insektenmagnet, duftend, naturnahe Ästhetik, mehrjährig robust.",
  },

  {
    id: "vs-g-familie",
    titel: "Kindersicher & bunt",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Kindersicher & bunt.png?v=20260510-6",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "klassik",
      pflege: "niedrig",
      bluetezeit: "juni-oktober",
      farbwelt: "bunt",
      biodiversitaet: false,
      winterfest: false,
      mehrjaehrig: false,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Ringelblume",
      "Kapuzinerkresse",
      "Sonnenblume Zwerg",
      "Löwenmäulchen",
      "Fleissiges Lieschen",
    ],
    beschreibung: "Alle Pflanzen ungiftig. Essbare Arten dabei. Kinder können mitgärtnern.",
    badge: "Kinderfreundlich",
  },

  {
    id: "vs-g-duft",
    titel: "Balkon-Parfümerie",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Balkon-Parfümerie.png?v=20260510-7",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "juni-september",
      farbwelt: "lila-blau",
      biodiversitaet: true,
      winterfest: true,
      mehrjaehrig: true,
      duftend: true,
      giftig: false,
      familie: false,
      kueche: false,
    },
    pflanzen: [
      "Lavendel",
      "Vanilleblume",
      "Duftsteinrich",
      "Oregano Dost",
      "Apothekersalbei",
    ],
    beschreibung: "Intensive Duftkulisse, mediterran, Bienen inklusive.",
  },

  {
    id: "vs-g-kueche",
    titel: "Kräuterküche",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Kräuterküche.png?v=20260510-8",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "naturgarten",
      pflege: "mittel",
      bluetezeit: "mai-oktober",
      farbwelt: "lila-blau",
      biodiversitaet: true,
      winterfest: true,
      mehrjaehrig: true,
      duftend: true,
      giftig: false,
      familie: true,
      kueche: true,
    },
    pflanzen: [
      "Thymian",
      "Oregano Dost",
      "Apothekersalbei",
      "Lavendel",
      "Blauschwingel",
    ],
    beschreibung: "Alle Kräuter küchentauglich, dekorativ, winterfest, mehrjährig.",
    badge: "Essbar",
  },

  // ─── VIEL SONNE · WINDIG ─────────────────────────────────

  {
    id: "vs-w-natur",
    titel: "Strandgefühl",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Strandgefühl.png?v=20260510-9",
    tags: {
      sonne: "viel",
      wind: "windig",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "mai-september",
      farbwelt: "lila-blau",
      biodiversitaet: true,
      winterfest: true,
      mehrjaehrig: true,
      duftend: false,
      giftig: false,
      familie: false,
      kueche: false,
    },
    pflanzen: [
      "Strandnelke",
      "Strandhafer",
      "Strandflieder Meerlavendel",
      "Schafgarbe",
      "Blauschwingel",
    ],
    beschreibung: "Küstenoptik, grau-silbrige Töne, sehr windtolerant.",
    hinweis: "Strandhafer separat in eigenem Topf setzen – wuchert stark.",
  },

  {
    id: "vs-w-klassik",
    titel: "Robuste Klassik",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Robuste Klassik.png?v=20260510-10",
    tags: {
      sonne: "viel",
      wind: "windig",
      stil: "klassik",
      pflege: "niedrig",
      bluetezeit: "juni-oktober",
      farbwelt: "bunt",
      biodiversitaet: false,
      winterfest: false,
      mehrjaehrig: false,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Eisenkraut Verbene niedrig",
      "Mittagsblume",
      "Husarenknöpfchen",
      "Duftsteinrich",
      "Portulakröschen",
    ],
    beschreibung: "Niedrig, kompakt, trotzt Wind und Hitze. Lange Blüte.",
  },

  {
    id: "vs-w-luxus",
    titel: "Silber & Gold",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/SilberGold.png?v=20260510-11",
    tags: {
      sonne: "viel",
      wind: "windig",
      stil: "luxus",
      pflege: "niedrig",
      bluetezeit: "juni-september",
      farbwelt: "warm-gold",
      biodiversitaet: false,
      winterfest: true,
      mehrjaehrig: true,
      duftend: true,
      giftig: false,
      familie: false,
      kueche: false,
    },
    pflanzen: [
      "Apothekersalbei",
      "Strandnelke",
      "Kokardenblume",
      "Strandflieder Meerlavendel",
      "Blauschwingel",
    ],
    beschreibung: "Silbrig-goldene Farbpalette, anspruchsvolles Gesamtbild, windtolerant.",
  },

  // ─── WENIG SONNE · GESCHÜTZT ─────────────────────────────

  {
    id: "ws-g-natur",
    titel: "Schattengarten",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Schattengarten.png?v=20260510-12",
    tags: {
      sonne: "wenig",
      wind: "geschuetzt",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "maerz-oktober",
      farbwelt: "rosa-weiss",
      biodiversitaet: false,
      winterfest: true,
      mehrjaehrig: true,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Bergenie",
      "Funkie",
      "Gundermann",
      "Purpurglocken",
      "Golderdbeere",
    ],
    beschreibung: "Schattentolerante Stauden, strukturreich durch Blattformen, winterfest.",
  },

  {
    id: "ws-g-sweet",
    titel: "Schattenzauber",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Schattenzauber.png?v=20260510-13",
    tags: {
      sonne: "wenig",
      wind: "geschuetzt",
      stil: "sweet",
      pflege: "niedrig",
      bluetezeit: "april-oktober",
      farbwelt: "rosa-weiss",
      biodiversitaet: false,
      winterfest: true,
      mehrjaehrig: true,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Fleissiges Lieschen",
      "Purpurglocken",
      "Gundermann",
      "Schleifenblume",
      "Teppichschleierkraut",
    ],
    beschreibung: "Rosa-Weiss-Violett, sanft, romantisch auch ohne direkte Sonne.",
  },

  {
    id: "ws-g-luxus",
    titel: "Schatteneleganz",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Schatteneleganz.png?v=20260510-14",
    tags: {
      sonne: "wenig",
      wind: "geschuetzt",
      stil: "luxus",
      pflege: "niedrig",
      bluetezeit: "dezember-oktober",
      farbwelt: "gruen-struktur",
      biodiversitaet: false,
      winterfest: true,
      mehrjaehrig: true,
      duftend: false,
      giftig: true,
      familie: false,
      kueche: false,
    },
    pflanzen: [
      "Funkie grosse Sorte",
      "Purpurglocken Edelsorten",
      "Lenzrose ⚠️",
      "Bergenie",
      "Bärenfellgras",
    ],
    beschreibung: "Elegante Schattenkomposition durch Blattstrukturen, wenig Pflege.",
    badge: "Giftig – nicht für Kinder",
  },

  {
    id: "ws-g-familie",
    titel: "Sicherer Halbschatten",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Sicherer Halbschatten.png?v=20260510-15",
    tags: {
      sonne: "wenig",
      wind: "geschuetzt",
      stil: "klassik",
      pflege: "niedrig",
      bluetezeit: "maerz-oktober",
      farbwelt: "rosa-weiss",
      biodiversitaet: false,
      winterfest: true,
      mehrjaehrig: true,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Fleissiges Lieschen",
      "Bergenie",
      "Golderdbeere",
      "Schleifenblume",
      "Gundermann",
    ],
    beschreibung: "Ausschliesslich ungiftige Pflanzen, kinderfreundlich, pflegeleicht.",
    badge: "Kinderfreundlich",
  },

  // ─── KEINE SONNE ─────────────────────────────────────────

  {
    id: "ks-g-natur",
    titel: "Nordbalkon-Natur",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Nordbalkon-Natur.png?v=20260510-16",
    tags: {
      sonne: "keine",
      wind: "geschuetzt",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "ganzjaehrig",
      farbwelt: "gruen-struktur",
      biodiversitaet: false,
      winterfest: true,
      mehrjaehrig: true,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Funkie",
      "Bergenie",
      "Gundermann",
      "Bärenfellgras",
      "Purpurglocken",
    ],
    beschreibung: "Vollschatten-Spezialisten. Überwiegend Blattstruktur, ruhige Ästhetik.",
  },

  {
    id: "ks-w-natur",
    titel: "Nordwind-Robust",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Nordwind-Robust.png?v=20260510-17",
    tags: {
      sonne: "keine",
      wind: "windig",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "ganzjaehrig",
      farbwelt: "gruen-struktur",
      biodiversitaet: false,
      winterfest: true,
      mehrjaehrig: true,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Bergenie",
      "Funkie kompakt",
      "Bärenfellgras",
      "Gundermann",
      "Golderdbeere",
    ],
    beschreibung: "Für den schwierigsten Standort. Alle mehrjährig, winterfest, robust.",
  },

  // ─── SAISONALE SPECIALS ───────────────────────────────────

  {
    id: "herbst",
    titel: "Balkon im Oktober",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Balkon im Oktober.png?v=20260510-18",
    tags: {
      sonne: "viel",
      wind: "geschuetzt",
      stil: "klassik",
      pflege: "niedrig",
      bluetezeit: "september-november",
      farbwelt: "warm-gold",
      biodiversitaet: false,
      winterfest: false,
      mehrjaehrig: false,
      duftend: false,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Kissenaster",
      "Herbstchrysantheme",
      "Zierkohl",
      "Purpurglocken",
      "Lampenputzergras",
    ],
    beschreibung: "Volle Herbstoptik bis zum ersten Frost.",
    badge: "Saisonal",
  },

  {
    id: "dachterrasse",
    titel: "Hitzewelle",
    preis: { s: 129, m: 149, l: 169 },
    bild: "assets/Hitzewelle.png?v=20260510-19",
    tags: {
      sonne: "viel",
      wind: "windig",
      stil: "naturgarten",
      pflege: "niedrig",
      bluetezeit: "mai-oktober",
      farbwelt: "warm-gold",
      biodiversitaet: true,
      winterfest: true,
      mehrjaehrig: true,
      duftend: true,
      giftig: false,
      familie: true,
      kueche: false,
    },
    pflanzen: [
      "Mittagsblume",
      "Portulakröschen",
      "Lavendel",
      "Husarenknöpfchen",
      "Goldfetthenne",
    ],
    beschreibung: "Für extreme Südlagen, Dachterrassen, Penthouse-Balkone. Alle trockenresistent.",
    badge: "Dachterrasse",
  },

];

// ─── FILTER-OPTIONEN (für UI-Buttons) ────────────────────────

const filterOptions = {
  sonne: [
    { value: "viel",   label: "Viel Sonne" },
    { value: "wenig",  label: "Wenig Sonne" },
    { value: "keine",  label: "Keine Sonne" },
  ],
  wind: [
    { value: "geschuetzt", label: "Geschützt" },
    { value: "windig",    label: "Windig" },
  ],
  stil: [
    { value: "naturgarten", label: "Naturgarten" },
    { value: "klassik",     label: "Balkonklassiker" },
    { value: "sweet",       label: "Sweet" },
    { value: "luxus",       label: "Luxus" },
  ],
  pflege: [
    { value: "niedrig", label: "Pflegeleicht" },
    { value: "mittel",  label: "Etwas Pflege" },
  ],
  farbwelt: [
    { value: "bunt",          label: "Bunt" },
    { value: "rosa-weiss",    label: "Rosa & Weiss" },
    { value: "lila-blau",     label: "Lila & Blau" },
    { value: "warm-gold",     label: "Warm & Gold" },
    { value: "gruen-struktur",label: "Grün & Struktur" },
  ],
  bluetezeit: [
    { value: "maerz-oktober",    label: "Frühjahr–Herbst" },
    { value: "mai-oktober",      label: "Sommer–Herbst" },
    { value: "juni-oktober",     label: "Hochsommer–Herbst" },
    { value: "september-november", label: "Herbst" },
    { value: "ganzjaehrig",      label: "Ganzjährig" },
  ],
  extras: [
    { value: "biodiversitaet", label: "🐝 Bienen & Insekten" },
    { value: "duftend",        label: "🌸 Duftend" },
    { value: "winterfest",     label: "❄ Winterfest" },
    { value: "mehrjaehrig",     label: "♻ Mehrjährig" },
    { value: "familie",        label: "👨‍👩‍👧 Familien" },
    { value: "kueche",         label: "🌿 Küchenkräuter" },
  ],
};

// ─── FILTER-HELPER ────────────────────────────────────────────

const filterCombinations = (activeFilters = {}) => {
  const hasSelected = key => {
    const selected = activeFilters[key];
    if (!selected || (Array.isArray(selected) && selected.length === 0)) return false;
    return true;
  };

  const matchesFilter = (key, value) => {
    const selected = activeFilters[key];
    return Array.isArray(selected) ? selected.includes(value) : selected === value;
  };

  const hasExtra = key => {
    const selected = activeFilters.extras;
    return Array.isArray(selected) ? selected.includes(key) : !!activeFilters[key];
  };

  return combinations.filter(k => {
    const t = k.tags;
    if (hasSelected("sonne") && !matchesFilter("sonne", t.sonne)) return false;
    if (hasSelected("wind") && !matchesFilter("wind", t.wind)) return false;
    if (hasSelected("stil") && !matchesFilter("stil", t.stil)) return false;
    if (hasSelected("pflege") && !matchesFilter("pflege", t.pflege)) return false;
    if (hasSelected("farbwelt") && !matchesFilter("farbwelt", t.farbwelt)) return false;
    if (hasSelected("bluetezeit") && !matchesFilter("bluetezeit", t.bluetezeit)) return false;
    // Boolean extras
    if (hasExtra("biodiversitaet") && !t.biodiversitaet) return false;
    if (hasExtra("duftend")        && !t.duftend)        return false;
    if (hasExtra("winterfest")     && !t.winterfest)     return false;
    if (hasExtra("mehrjaehrig")    && !t.mehrjaehrig)    return false;
    if (hasExtra("familie")        && !t.familie)        return false;
    if (hasExtra("kueche")         && !t.kueche)         return false;
    return true;
  });
};


window.BalkoniusCombinations = { combinations, filterOptions, filterCombinations };
