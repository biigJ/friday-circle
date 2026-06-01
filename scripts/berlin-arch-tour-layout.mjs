/** Day order, extra stops, and photo corner labels for Berlin Architecture Tour. */

export const DAY_LAYOUT = [
  {
    id: 1,
    themeDe: "Berlin Mitte",
    themeEn: "Berlin Mitte",
    navDe: "Tag 1 · Berlin Mitte",
    navEn: "Day 1 · Berlin Mitte",
    eraDe: "",
    eraEn: "",
    routeDe: "",
    routeEn: "",
    stopIds: [
      "d2-shellhaus",
      "d4-nl",
      "d1-boros",
      "d5-times-art",
      "d6-altes-museum",
      "d6-neues",
      "d6-james",
      "d6-bastian",
      "d6-chip-campus",
      "d4-dhm",
      "d2-nng",
      "d2-philharmonie",
      "d4-sony",
      "d4-dz",
      "d2-babylon",
    ],
  },
  {
    id: 2,
    themeDe: "Berlins Westen I",
    themeEn: "Berlin West I",
    navDe: "Tag 2 · Berlins Westen I",
    navEn: "Day 2 · Berlin West I",
    eraDe: "",
    eraEn: "",
    routeDe: "",
    routeEn: "",
    stopIds: [
      "d1-onkel",
      "d1-schorlemer",
      "d1-u3-krumme",
      "d1-fischerhuette-106",
      "d1-gropius",
      "d1-chipperfield-villa",
    ],
  },
  {
    id: 3,
    themeDe: "Spreebogen & Tiergarten",
    themeEn: "Spreebogen & Tiergarten",
    navDe: "Tag 3 · Spreebogen & Tiergarten",
    navEn: "Day 3 · Spreebogen & Tiergarten",
    eraDe: "",
    eraEn: "",
    routeDe: "",
    routeEn: "",
    stopIds: [
      "d3-holocaust",
      "d4-band",
      "d3-topo",
      "d4-reichstag",
      "d3-botschaft",
      "d2-hkw",
      "d4-siegessaeule",
      "d2-hansa",
      "d1-bauhaus-archiv",
    ],
  },
  {
    id: 4,
    themeDe: "Berlins Westen II",
    themeEn: "Berlin West II",
    navDe: "Tag 4 · Berlins Westen II",
    navEn: "Day 4 · Berlin West II",
    eraDe: "",
    eraEn: "",
    routeDe: "",
    routeEn: "",
    stopIds: [
      "d4-icc",
      "d1-unite",
      "d1-olympia",
      "d2-pavillon-breitscheid",
      "d2-gedaechtniskirche",
      "d2-bikini",
      "d2-co-berlin",
      "d4-newton",
      "d2-hamburger-bahnhof",
      "d1-siemens",
      "d4-aeg-turbinen",
      "d4-strandbad-ploetzensee",
    ],
  },
  {
    id: 5,
    themeDe: "Ostberlin",
    themeEn: "East Berlin",
    navDe: "Tag 5 · Ostberlin",
    navEn: "Day 5 · East Berlin",
    eraDe: "",
    eraEn: "",
    routeDe: "",
    routeEn: "",
    stopIds: [
      "d5-lemke",
      "d2-kino",
      "d5-cafe-moskau",
      "d2-kma",
      "d5-berghain",
      "d5-oberbaum",
      "d5-amazon",
      "d5-tacheles",
      "d4-tchoban",
    ],
  },
  {
    id: 6,
    themeDe: "Ums Tempelhofer Feld",
    themeEn: "Around Tempelhof Field",
    navDe: "Tag 6 · Ums Tempelhofer Feld",
    navEn: "Day 6 · Around Tempelhof Field",
    eraDe: "",
    eraEn: "",
    routeDe: "",
    routeEn: "",
    stopIds: [
      "d1-hufeisen",
      "d6-taut-neukoelln",
      "d5-ullsteinhaus",
      "d5-tempelhof",
      "d1-lokdepot",
      "d6-hallesches-ufer",
      "d5-kottbusser-tor",
      "d3-zanderroth",
      "d3-bonjour-tristesse",
      "d6-so36",
      "d5-paul-lincke",
      "d6-ankerklause",
    ],
  },
  {
    id: 7,
    themeDe: "Berlin Kreuzberg",
    themeEn: "Berlin Kreuzberg",
    navDe: "Tag 7 · Berlin Kreuzberg",
    navEn: "Day 7 · Berlin Kreuzberg",
    eraDe: "",
    eraEn: "",
    routeDe: "",
    routeEn: "",
    stopIds: [
      "d3-ig-metall",
      "d5-koenig",
      "d3-berlinische",
      "d6-r50",
      "d3-krier",
      "d5-springer",
      "d3-jm",
      "d3-taz",
      "d3-lima",
      "d3-hejduk",
      "d4-quartier-schuetzen",
      "d3-checkpoint",
    ],
  },
];

/** Stops not in the original DAYS array (or renamed ids). */
export const EXTRA_STOPS = {
  "d1-bauhaus-archiv": {
    id: "d1-bauhaus-archiv",
    nameDe: "Bauhaus-Archiv",
    nameEn: "Bauhaus Archive",
    metaDe: "Walter Gropius · geplant · Wiederaufbau 2022–2025",
    metaEn: "Walter Gropius · planned · rebuild 2022–2025",
    tag: "Bauhaus · Museum",
    labels: ["ausstellung", "moderne"],
    teaserDe: "Sammlung und Geschichte des Bauhauses - von Weimar über Dessau nach Berlin.",
    teaserEn: "Collection and history of the Bauhaus - from Weimar via Dessau to Berlin.",
    bodyDe:
      "Das Bauhaus-Archiv dokumentiert die einflussreichste Design- und Architekturschule des 20. Jahrhunderts. Der Wiederaufbau nach Gropius' Entwurf setzt das Archiv als gebautes Statement in Tiergarten fort.",
    bodyEn:
      "The Bauhaus Archive documents the most influential design and architecture school of the 20th century. Rebuilding to Gropius' design continues the archive as a built statement in Tiergarten.",
    accessDe: "Vor Besuch Öffnungszeiten auf bauhaus-archiv.de prüfen. U-Bahn U1/U2 Potsdamer Platz.",
    accessEn: "Check opening hours at bauhaus-archiv.de before visiting. U1/U2 Potsdamer Platz.",
    photo: "assets/berlin-arch-tour/Bauhaus_Archiv_Berlin.jpg",
  },
  "d1-boros": {
    id: "d1-boros",
    nameDe: "Boros Bunker",
    nameEn: "Boros Collection Bunker",
    metaDe: "Reichsbahnbunker · Sammlung Boros",
    metaEn: "Reichsbahn bunker · Boros collection",
    tag: "Bunker · Zeitgenössische Kunst",
    labels: ["ausstellung"],
    teaserDe: "Flakturm als Privatmuseum - zeitgenössische Kunst in betonierter Hülle.",
    teaserEn: "Flak tower as private museum - contemporary art in a concrete shell.",
    bodyDe:
      "Der Reichsbahnbunker aus dem Zweiten Weltkrieg beherbergt die Sammlung Boros. Führungen nur nach Voranmeldung - Architektur und Kunst als intensive Innenraumerfahrung.",
    bodyEn:
      "The WWII Reichsbahn bunker houses the Boros collection. Tours by appointment only - architecture and art as an intense interior experience.",
    accessDe: "Nur mit gebuchter Führung: sammlung-boros.de. Außenansicht jederzeit von der Reinhardtstraße.",
    accessEn: "Guided tours only: sammlung-boros.de. Exterior view anytime from Reinhardtstraße.",
    photo: "assets/berlin-arch-tour/BorosBunker.jpeg",
  },
  "d1-chipperfield-villa": {
    id: "d1-chipperfield-villa",
    nameDe: "Chipperfield-Villa",
    nameEn: "Chipperfield Villa",
    metaDe: "David Chipperfield · Fischerhüttenstraße · Zehlendorf",
    metaEn: "David Chipperfield · Fischerhüttenstraße · Zehlendorf",
    tag: "David Chipperfield · Villa",
    labels: ["postmoderne", "privat"],
    teaserDe: "Zurückhaltende Villenarchitektur in Zehlendorf - Chipperfields Berliner Wohnbau in Villenform.",
    teaserEn: "Restrained villa architecture in Zehlendorf - Chipperfield's Berlin housing in villa form.",
    bodyDe:
      "Die Villa in der Fischerhüttenstraße zeigt Chipperfields frühe Haltung: präzise Proportionen, zurückhaltende Materialität, Dialog mit dem Bestand der Villenkolonie.",
    bodyEn:
      "The villa on Fischerhüttenstraße shows Chipperfield's early attitude: precise proportions, restrained materials, dialogue with the villa colony context.",
    accessDe: "Privatgebäude. Von der Straße lesbar. S-Bahn S1 Schlachtensee.",
    accessEn: "Private building. Readable from the street. S1 Schlachtensee.",
    photo: "assets/berlin-arch-tour/Chipperfield_Villa.JPG",
  },
  "d4-icc": {
    id: "d4-icc",
    nameDe: "Messe Berlin · ICC",
    nameEn: "Messe Berlin · ICC",
    metaDe: "Ralf Schüler & Ursulina Schüler · 1979",
    metaEn: "Ralf Schüler & Ursulina Schüler · 1979",
    tag: "Postmoderne · Messe",
    labels: ["postmoderne", "privat"],
    teaserDe: "Raumschiff am Funkturm - High-Tech-Postmoderne als Messepalast des Westens.",
    teaserEn: "Spaceship at the Funkturm - high-tech postmodernism as the West's fair palace.",
    bodyDe:
      "Das ICC ist eines der größten und spektakulärsten Gebäude der Berliner Nachkriegsmoderne. Der Beton-Metall-Körper dominiert das Messegelände - Zugang derzeit eingeschränkt, Außenwirkung prägend.",
    bodyEn:
      "The ICC is among the largest and most spectacular buildings of Berlin's post-war modernism. Its concrete-and-metal body dominates the fairgrounds - access currently limited, exterior impact defining.",
    accessDe: "Außenansicht vom Messegelände und S-Bahn Messe Nord/ICC. Innenraum derzeit meist geschlossen.",
    accessEn: "Exterior from the fairgrounds and S-Bahn Messe Nord/ICC. Interior mostly closed.",
    photo: "assets/berlin-arch-tour/ICC_Berliner_Messe.jpg",
  },
  "d4-aeg-turbinen": {
    id: "d4-aeg-turbinen",
    nameDe: "AEG Turbinenhalle",
    nameEn: "AEG Turbine Factory",
    metaDe: "Peter Behrens · 1909",
    metaEn: "Peter Behrens · 1909",
    tag: "Peter Behrens · Industriearchitektur",
    labels: ["moderne", "privat"],
    teaserDe: "Geburt der modernen Industriearchitektur - Glas, Stahl, klare Konstruktion.",
    teaserEn: "Birth of modern industrial architecture - glass, steel, clear structure.",
    bodyDe:
      "Peter Behrens' Turbinenhalle für AEG gilt als Meilenstein: Industriebau wird architektonisches Programm. Heute in Nutzung - von außen die Konstruktionslogik gut lesbar.",
    bodyEn:
      "Peter Behrens' AEG turbine hall is a milestone: industrial building as architectural programme. Still in use - construction logic readable from outside.",
    accessDe: "Betriebsgelände. Außenansicht von der Huttenstraße. U7 Siemensdamm.",
    accessEn: "Industrial site. Exterior view from Huttenstraße. U7 Siemensdamm.",
    photo: "assets/berlin-arch-tour/AEG_Turbinenhalle_Behrens.jpg",
  },
  "d5-cafe-moskau": {
    id: "d5-cafe-moskau",
    nameDe: "Café Moskau",
    nameEn: "Café Moskau",
    metaDe: "Josef Kaiser · 1964",
    metaEn: "Josef Kaiser · 1964",
    tag: "DDR-Moderne · Karl-Marx-Allee",
    labels: ["ddr", "ausstellung"],
    teaserDe: "Das eleganteste Gebäude der Allee - schwebendes Dach, Glas, Mosaik.",
    teaserEn: "The boulevard's most elegant building - floating roof, glass, mosaic.",
    bodyDe:
      "Das Café Moskau (1964) steht für die architektonische Selbstkorrektur der DDR nach 1953: internationaler Modernismus statt Zuckerbäckerstil. Restaurant und Veranstaltungsort auf der Karl-Marx-Allee.",
    bodyEn:
      "Café Moskau (1964) stands for the GDR's post-1953 architectural turn: international modernism instead of wedding-cake classicism. Restaurant and venue on Karl-Marx-Allee.",
    accessDe: "Gastronomie und Events - cafemoskau.com. U5 Schillingstraße.",
    accessEn: "Dining and events - cafemoskau.com. U5 Schillingstraße.",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Caf%C3%A9_Moskau_Berlin.jpg/1280px-Caf%C3%A9_Moskau_Berlin.jpg",
  },
  "d6-taut-neukoelln": {
    id: "d6-taut-neukoelln",
    nameDe: "Wohnhaus Bruno Taut · Neukölln",
    nameEn: "Bruno Taut housing · Neukölln",
    metaDe: "Bruno Taut · Neukölln",
    metaEn: "Bruno Taut · Neukölln",
    tag: "Bruno Taut · Neukölln",
    labels: ["moderne", "privat"],
    teaserDe:
      "Tauts farbige Moderne in Neukölln - Wohnbau als Teil der großen Siedlungsprogramme der Weimarer Republik.",
    teaserEn:
      "Taut's colourful modernism in Neukölln - housing as part of the Weimar Republic's large estate programmes.",
    bodyDe:
      "Bruno Taut prägte Neukölln und Britz mit farbigem, sozial orientiertem Wohnungsbau. Neben der Hufeisensiedlung finden sich weitere Zeugnisse seiner Haltung: Farbe als Struktur, Würde im Alltag.",
    bodyEn:
      "Bruno Taut shaped Neukölln and Britz with colourful, socially oriented housing. Beyond the Horseshoe Estate, further witnesses to his approach remain: colour as structure, dignity in everyday life.",
    accessDe: "Wohngebäude. Von außen zugänglich, sofern nicht anders gekennzeichnet. U-Bahn U7 oder U8 Richtung Neukölln/Britz.",
    accessEn: "Residential building. Viewable from outside unless marked otherwise. U7 or U8 towards Neukölln/Britz.",
    photo: "assets/berlin-arch-tour/2024-11-16-Wohnhaus_BrunoTaut-Neukölln.jpg",
  },
  "d1-fischerhuette-106": {
    id: "d1-fischerhuette-106",
    nameDe: "Wohnhaus Fischerhüttenstraße 106, Gropius",
    nameEn: "Fischerhüttenstraße 106 housing, Gropius",
    metaDe: "Walter Gropius · 1928 · Zehlendorf",
    metaEn: "Walter Gropius · 1928 · Zehlendorf",
    tag: "Walter Gropius · 1928",
    teaserDe:
      "Gropius' Haus Lewin in der Villenkolonie Zehlendorf - kompakter Kubus, großzügige Verglasung, Moderne im Grünen.",
    teaserEn:
      "Gropius's Lewin House in Zehlendorf's villa colony - compact cube, generous glazing, modernism in the green.",
    bodyDe:
      "Das Wohnhaus in der Fischerhüttenstraße 106 (1928) entstand für jüdische Auftraggeber und zeigt Gropius' Übergang vom Bauhaus zur freien Praxis: klare Geometrie, offene Grundrisse, zurückhaltende Materialität im Dialog mit der Umgebung.",
    bodyEn:
      "The house at Fischerhüttenstraße 106 (1928) was built for Jewish clients and shows Gropius's shift from the Bauhaus to private practice: clear geometry, open plans, restrained materials in dialogue with the surroundings.",
    accessDe: "Privatgebäude. Von der Straße lesbar. S-Bahn S1 Schlachtensee.",
    accessEn: "Private building. Readable from the street. S1 Schlachtensee.",
    photo: "assets/berlin-arch-tour/Fischerhüttenstraße106_1.JPG",
  },
  "d4-strandbad-ploetzensee": {
    id: "d4-strandbad-ploetzensee",
    nameDe: "Strandbad Plötzensee",
    nameEn: "Plötzensee open-air pool",
    metaDe: "Martin Päuler · 1929 · Wedding",
    metaEn: "Martin Päuler · 1929 · Wedding",
    tag: "Martin Päuler · 1929",
    teaserDe:
      "Weimarer Freibad-Moderne am See - flache Dachterrassen, klare Linien, Stadtstrand für Wedding.",
    teaserEn:
      "Weimar-era open-air pool modernism by the lake - flat roof terraces, clear lines, Wedding's urban beach.",
    bodyDe:
      "Das 1929 eröffnete Strandbad Plötzensee gehört zu Berlins großen Freibädern der 1920er: funktionalistische Baukörper, Liegewiesen und Uferpromenade als öffentlicher Raum. Nach Sanierung wieder Badebetrieb und beliebter Sommerort.",
    bodyEn:
      "Opened in 1929, Plötzensee is among Berlin's great 1920s open-air pools: functionalist structures, lawns and lakeside promenade as public space. Restored and again a popular summer destination.",
    accessDe: "Öffentliches Freibad (saisonal). U9 Amrumer Straße, Tram M27.",
    accessEn: "Public open-air pool (seasonal). U9 Amrumer Straße, tram M27.",
  },
  "d5-tacheles": {
    id: "d5-tacheles",
    nameDe: "Am Tacheles",
    nameEn: "Am Tacheles",
    metaDe: "Herzog & de Meuron · 2018–2024 · Mitte",
    metaEn: "Herzog & de Meuron · 2018–2024 · Mitte",
    tag: "Herzog & de Meuron · Quartier",
    teaserDe:
      "Vom Kunsthaus zur Passage – neues Stadtquartier mit Fotografiska, erhaltenem Torbau und öffentlichen Höfen.",
    teaserEn:
      "From art house to urban quarter – new development with Fotografiska, preserved gateway and public courtyards.",
    bodyDe:
      "Nach dem Ende des besetzten Kunsthauses (2012) entstand unter Herzog & de Meuron das Quartier Am Tacheles: Sanierung des historischen Gebäudes, Neubauten, wiederbelebte Friedrichstraßenpassage zwischen Oranienburger und Friedrichstraße.",
    bodyEn:
      "After the occupied art house closed (2012), Herzog & de Meuron's Am Tacheles quarter followed: restoration of the historic building, new blocks, revived passage between Oranienburger and Friedrichstraße.",
    accessDe: "Öffentliche Passagen und Höfe. Fotografiska: fotografiska.com. S1/S2 Oranienburger Straße.",
    accessEn: "Public passages and courtyards. Fotografiska: fotografiska.com. S1/S2 Oranienburger Straße.",
  },
  "d6-so36": {
    id: "d6-so36",
    nameDe: "SO36",
    nameEn: "SO36",
    metaDe: "Oranienstraße 190 · Kreuzberg",
    metaEn: "Oranienstraße 190 · Kreuzberg",
    tag: "Kultur · Kreuzberg",
    labels: ["brd", "privat"],
    teaserDe: "Legendärer Kreuzberger Kulturort - Nachkriegsgebäude, Subkultur, Stadtgeschichte.",
    teaserEn: "Legendary Kreuzberg venue - post-war building, subculture, urban history.",
    bodyDe:
      "Das SO36 in der Oranienstraße ist seit den 1970ern Bühne für Punk, Queer-Kultur und Berliner Nachtleben. Das Gebäude steht für Kreuzbergs Selbstverständnis als Gegenentwurf.",
    bodyEn:
      "SO36 on Oranienstraße has been a stage for punk, queer culture and Berlin nightlife since the 1970s. The building stands for Kreuzberg's counter-identity.",
    accessDe: "Veranstaltungsbetrieb - Programm auf so36.de. U1 Görlitzer Bahnhof.",
    accessEn: "Venue - programme at so36.de. U1 Görlitzer Bahnhof.",
    photo: "assets/berlin-arch-tour/SO36_Oranienstrasse.jpg",
  },
  "d6-ankerklause": {
    id: "d6-ankerklause",
    nameDe: "Ankerklause",
    nameEn: "Ankerklause",
    metaDe: "Kottbusser Damm 104 · Kreuzberg",
    metaEn: "Kottbusser Damm 104 · Kreuzberg",
    tag: "Hafenbar · Landwehrkanal",
    teaserDe:
      "Maritime Kneipe am Kanal - Schiffsbauch-Atmosphäre, Terrasse über dem Wasser, legendäre Jukebox.",
    teaserEn:
      "Maritime pub on the canal - ship's-hold atmosphere, terrace over the water, legendary jukebox.",
    bodyDe:
      "Die Ankerklause am Landwehrkanal zwischen Kreuzberg und Neukölln ist seit Jahrzehnten Ankerpunkt am Maybachufer: Frühstück und Snacks tagsüber, Bar und Club abends - mit Blick auf Markt und Kanalufer.",
    bodyEn:
      "Ankerklause on the Landwehr Canal between Kreuzberg and Neukölln has been a fixture on the Maybachufer for decades: breakfast and snacks by day, bar and club by night - with views of the market and canal.",
    accessDe: "Gastronomie und Bar - Öffnungszeiten auf ankerklause.de. U8 Kottbusser Tor.",
    accessEn: "Food and bar - hours at ankerklause.de. U8 Kottbusser Tor.",
  },
  "d6-hallesches-ufer": {
    id: "d6-hallesches-ufer",
    nameDe: "Wohnbebauung Hallesches Ufer",
    nameEn: "Hallesches Ufer housing",
    metaDe: "Fehling + Gogel · 1968–1971 · Kreuzberg",
    metaEn: "Fehling + Gogel · 1968–1971 · Kreuzberg",
    tag: "Fehling + Gogel · 1971",
    teaserDe:
      "Polygonaler Hochpunkt am Landwehrkanal – runde Eckbalkone, Spätexpressionismus gegenüber Scharouns AOK-Bau.",
    teaserEn:
      "Polygonal high point on the Landwehr Canal – round corner balconies, late expressionism opposite Scharoun's AOK building.",
    bodyDe:
      "Das denkmalgeschützte Wohn- und Geschäftshaus (Hallesches Ufer 24–28) von Fehling + Gogel setzt mit siebengeschossigem und 22-geschossigem Bauteil einen städtebaulichen Akzent am Kanal – Dialog mit Hans Scharoun am gegenüberliegenden Ufer.",
    bodyEn:
      "The listed mixed-use block (Hallesches Ufer 24–28) by Fehling + Gogel marks the canal with seven- and 22-storey sections – in dialogue with Hans Scharoun across the water.",
    accessDe: "Wohngebäude. Von der Straße und vom Ufer lesbar. U1/U3 Hallesches Tor.",
    accessEn: "Residential. Readable from street and canal. U1/U3 Hallesches Tor.",
  },
};

/** Overrides applied after flattening all stops. */
export const STOP_OVERRIDES = {
  "d2-hansa": {
    nameDe: "Hansaviertel mit u.a. Oskar Niemeyer",
    nameEn: "Hansaviertel incl. Oscar Niemeyer",
    tag: "Interbau 1957 · Hansaviertel",
    teaserDe:
      "53 internationale Architekten, ein westliches Manifest – mit Oscar Niemeyers geschwungenem Betonvordach im Viertel.",
    teaserEn:
      "53 international architects, one western manifesto – including Oscar Niemeyer's curved concrete canopy in the quarter.",
    bodyDe:
      "Die Interbau 1957 lud 53 internationale Architekten ein. Alvar Aalto, Walter Gropius und Oscar Niemeyer – das Hansaviertel funktioniert als Gesamtbild, weil die Unterschiede nicht nivelliert wurden. Niemeyers Haus mit dem markanten Vordach ist einer der bekanntesten Einzelbauten.",
    bodyEn:
      "Interbau 1957 invited 53 international architects. Aalto, Gropius and Oscar Niemeyer – the quarter works because differences were not flattened. Niemeyer's house with its distinctive canopy is among the best-known individual buildings.",
  },
  "d1-gropius": {
    nameDe: "Haus Abraham",
    nameEn: "Haus Abraham",
    metaDe: "Arthur Korn & Siegfried Weitzmann · 1928 · Fischerhüttenstraße",
    metaEn: "Arthur Korn & Siegfried Weitzmann · 1928 · Fischerhüttenstraße",
    tag: "Arthur Korn · 1928",
    labels: ["moderne", "privat"],
  },
  "d4-sony": {
    nameDe: "Potsdamer Platz",
    nameEn: "Potsdamer Platz",
    metaDe: "Renzo Piano · Helmut Jahn · Hans Kollhoff · 1993–2000",
    metaEn: "Renzo Piano · Helmut Jahn · Hans Kollhoff · 1993–2000",
    tag: "Sony Center · Kollhoff · Piano · Jahn",
    labels: ["postmoderne", "brd"],
    teaserDe:
      "Größtes privates Stadtbauprojekt Europas nach 1989: Sony Center, Kollhoff-Hochhaus, Pianos Quartiere - drei Architekten, ein Platz.",
    teaserEn:
      "Europe's largest private urban project after 1989: Sony Center, Kollhoff tower, Piano's blocks - three architects, one square.",
    bodyDe:
      "Nach der Wende entstand auf leerem Terrain ein neues Stück Stadt. Jahns Sony Center mit Zeltdach, Kollhoffs Backstein-Turm und Pianos Blockrandbebauung lesen sich als Kontrastprogramm der Berliner Republik.",
    bodyEn:
      "After reunification a new city quarter rose on empty ground. Jahn's Sony Center with its tent roof, Kollhoff's brick tower and Piano's perimeter blocks read as the Berlin Republic's contrast programme.",
  },
  "d4-band": {
    nameDe: "Bundesministerium der Finanzen",
    nameEn: "Federal Ministry of Finance",
    metaDe: "Ehem. Reichsluftfahrtministerium · 1935–1936",
    metaEn: "Former Reich Aviation Ministry · 1935–1936",
    tag: "NS-Architektur · Spreebogen",
    labels: ["moderne", "brd"],
    teaserDe:
      "Ehemaliges Reichsluftfahrtministerium - im Keller der Führerbunker, im Stadtbild des Dritten Reiches.",
    teaserEn:
      "Former Reich Aviation Ministry - Hitler's bunker in the cellar, Third Reich in the cityscape.",
    bodyDe:
      "Das monumentale Gebäude am Detlev-Rohwedder-Platz beherbergte das Reichsluftfahrtministerium. Im Keller lagerte sich der Führerbunker an. Heute nutzt das Bundesfinanzministerium den Baukörper - ein zentraler Ort der deutschen Aufarbeitungsgeschichte.",
    bodyEn:
      "The monumental building at Detlev-Rohwedder-Platz housed the Reich Aviation Ministry. The Führerbunker adjoined its cellar. Today the Federal Ministry of Finance uses the structure - a central site of Germany's reckoning with history.",
    accessDe: "Außenraum jederzeit. Kein Zugang zu Bunkerresten. U2 Mohrenstraße.",
    accessEn: "Exterior anytime. No access to bunker remains. U2 Mohrenstraße.",
  },
  "d5-oberbaum": {
    teaserDe:
      "Verbindung über die Spree - Brücke, Mauer, Wiedervereinigung. U-Bahn-Station Oberbaumbrücke als ehemalige Grenzstation.",
    teaserEn:
      "Connection across the Spree - bridge, Wall, reunification. Oberbaumbrücke U-Bahn station as a former border crossing.",
    bodyDe:
      "Die Oberbaumbrücke verbindet Friedrichshain und Kreuzberg. Während der Teilung war sie Grenzübergang - die U-Bahn-Station Oberbaumbrücke (U1) markiert die ehemalige Grenzstation im Stadtgefüge.",
    bodyEn:
      "Oberbaum Bridge links Friedrichshain and Kreuzberg. During division it was a border crossing - Oberbaumbrücke U-Bahn station (U1) marks the former border station in the urban fabric.",
  },
  "d3-zanderroth": {
    nameDe: "WH_17",
    nameEn: "WH_17",
    metaDe: "Zanderroth Architekten · Kreuzberg",
    metaEn: "Zanderroth Architekten · Kreuzberg",
  },
  "d2-philharmonie": {
    nameDe: "Philharmonie",
    nameEn: "Philharmonie",
  },
};

export const LABELS_BY_ID = {
  "d1-bauhaus-archiv": ["ausstellung", "moderne", "brd"],
  "d2-shellhaus": ["moderne", "vor1939"],
  "d4-nl": ["dekonstruktivismus", "nach1990"],
  "d1-boros": ["nach1990", "ausstellung"],
  "d5-times-art": ["nach1990", "ausstellung"],
  "d6-altes-museum": ["ausstellung"],
  "d6-neues": ["vor1939", "ausstellung"],
  "d6-james": ["nach1990", "ausstellung"],
  "d6-bastian": ["nach1990", "ausstellung"],
  "d4-dhm": ["postmoderne", "nach1990", "ausstellung"],
  "d2-nng": ["moderne", "ausstellung", "brd"],
  "d2-philharmonie": ["postmoderne", "brd"],
  "d4-sony": ["nach1990", "zugaenglich"],
  "d4-dz": ["nach1990", "zugaenglich"],
  "d2-babylon": ["moderne", "vor1939", "zugaenglich"],
  "d1-onkel": ["moderne", "privat", "vor1939"],
  "d1-schorlemer": ["moderne", "privat", "vor1939"],
  "d1-u3-krumme": ["moderne", "zugaenglich", "vor1939"],
  "d1-gropius": ["moderne", "privat", "vor1939"],
  "d1-fischerhuette-106": ["moderne", "privat", "vor1939"],
  "d1-chipperfield-villa": ["nach1990", "privat"],
  "d3-holocaust": ["dekonstruktivismus", "zugaenglich"],
  "d4-band": ["vor1939"],
  "d3-topo": ["ausstellung", "nach1990"],
  "d4-reichstag": ["nach1990", "zugaenglich"],
  "d3-botschaft": ["nach1990", "privat"],
  "d2-hkw": ["moderne", "brd"],
  "d4-siegessaeule": ["zugaenglich"],
  "d2-hansa": ["moderne", "brd"],
  "d4-icc": ["postmoderne", "privat"],
  "d1-unite": ["moderne", "vor1939"],
  "d1-olympia": ["vor1939"],
  "d2-pavillon-breitscheid": ["moderne", "brd"],
  "d2-gedaechtniskirche": ["moderne", "brd"],
  "d2-bikini": ["moderne", "brd"],
  "d2-co-berlin": ["moderne", "brd", "ausstellung"],
  "d4-newton": ["postmoderne", "ausstellung"],
  "d2-hamburger-bahnhof": ["nach1990", "ausstellung"],
  "d1-siemens": ["moderne", "vor1939"],
  "d4-aeg-turbinen": ["moderne", "privat", "vor1939"],
  "d4-frauenhofer": ["nach1990", "privat"],
  "d4-strandbad-ploetzensee": ["moderne", "vor1939", "zugaenglich"],
  "d5-lemke": ["moderne", "vor1939", "ausstellung"],
  "d2-kino": ["ddr", "zugaenglich"],
  "d5-cafe-moskau": ["ddr", "zugaenglich"],
  "d2-kma": ["ddr"],
  "d5-berghain": ["ddr", "privat"],
  "d5-oberbaum": ["vor1939"],
  "d5-amazon": [],
  "d5-tacheles": ["nach1990", "ausstellung"],
  "d6-chip-campus": ["nach1990", "zugaenglich"],
  "d4-tchoban": ["nach1990", "ausstellung"],
  "d1-hufeisen": ["moderne", "vor1939"],
  "d6-taut-neukoelln": ["moderne", "privat", "vor1939"],
  "d5-ullsteinhaus": [],
  "d5-tempelhof": ["vor1939"],
  "d1-lokdepot": ["nach1990", "privat"],
  "d6-hallesches-ufer": ["brd", "moderne", "privat"],
  "d5-kottbusser-tor": ["brd", "privat"],
  "d3-zanderroth": ["nach1990", "privat"],
  "d3-bonjour-tristesse": ["postmoderne", "brd", "privat"],
  "d6-so36": ["brd", "privat"],
  "d6-ankerklause": ["brd", "zugaenglich"],
  "d5-paul-lincke": ["zugaenglich"],
  "d3-ig-metall": ["moderne", "vor1939"],
  "d5-koenig": ["nach1990", "ausstellung"],
  "d3-berlinische": ["nach1990", "ausstellung"],
  "d6-r50": ["nach1990", "privat"],
  "d3-krier": ["postmoderne", "brd", "privat"],
  "d5-springer": ["nach1990", "dekonstruktivismus", "privat"],
  "d3-taz": ["nach1990", "privat"],
  "d3-lima": ["postmoderne", "brd", "privat"],
  "d3-hejduk": ["postmoderne", "brd", "privat"],
  "d4-quartier-schuetzen": ["postmoderne", "brd"],
  "d3-jm": ["nach1990", "dekonstruktivismus", "ausstellung"],
  "d3-checkpoint": ["postmoderne", "brd", "privat"],
};

export const LABEL_DEFS = {
  moderne: { de: "Moderne", en: "Modern", bg: "#2563eb", color: "#ffffff" },
  postmoderne: { de: "Postmoderne", en: "Postmodern", bg: "#ea580c", color: "#ffffff" },
  dekonstruktivismus: { de: "Dekonstruktivismus", en: "Deconstructivism", bg: "#9333ea", color: "#ffffff" },
  vor1939: { de: "vor 1939", en: "before 1939", bg: "#0d0d0d", color: "#ffffff" },
  zugaenglich: { de: "zugänglich", en: "accessible", bg: "#ca8a04", color: "#ffffff" },
  nach1990: { de: "nach 1990", en: "after 1990", bg: "#0d0d0d", color: "#ffffff" },
  privat: { de: "privat", en: "private", bg: "#ffffff", color: "#0d0d0d" },
  ausstellung: { de: "Ausstellung", en: "Exhibition", bg: "#ca8a04", color: "#ffffff" },
  brd: { de: "BRD", en: "FRG", bg: "#0d0d0d", color: "#ffffff" },
  ddr: { de: "DDR", en: "GDR", bg: "#0d0d0d", color: "#ffffff" },
};

export const LABEL_ORDER = [
  "vor1939",
  "brd",
  "ddr",
  "nach1990",
  "moderne",
  "postmoderne",
  "dekonstruktivismus",
  "ausstellung",
  "zugaenglich",
  "privat",
];

/** Per-day lunch/dinner overrides for the 7-day layout. */
export const DINING_BY_DAY = {
  1: {
    lunch: {
      nameDe: "VOLK",
      nameEn: "VOLK",
      bodyDe:
        "Brunnenstraße 182, Mitte. Austernbar und Bistro – französisch inspiriert, täglich wechselnde Karte, Szene-Kiez statt Touristenfallen.",
      bodyEn:
        "Brunnenstraße 182, Mitte. Oyster bar and bistro – French-inspired daily menu, neighbourhood scene not a tourist trap.",
      url: "https://volkmitte.de/",
      photo: "assets/berlin-arch-tour/VOLK_Brunnenstrasse.jpg",
    },
    dinner: {
      nameDe: "Clärchens Ballhaus",
      nameEn: "Clärchens Ballhaus",
      bodyDe:
        "Auguststraße 24, Mitte. Tanzsaal von 1913 - Weimarer Republik, DDR, Wende, Original-Interieur.",
      bodyEn:
        "Auguststraße 24, Mitte. Dance hall from 1913 - Weimar, GDR, reunification, original interior.",
      url: "https://www.claerchensballhaus.de/",
      photo: "assets/berlin-arch-tour/2018-07-21-ClärchensBallhaus.jpg",
    },
  },
  2: {
    lunch: {
      nameDe: "Der Kretaner",
      nameEn: "Der Kretaner",
      bodyDe:
        "Riemeisterstraße 129, Zehlendorf. Griechische Landhausküche direkt gegenüber der U-Bahn Onkel Tom's-Hütte (U3).",
      bodyEn:
        "Riemeisterstraße 129, Zehlendorf. Greek country-style cuisine opposite Onkel Tom's-Hütte U-Bahn (U3).",
      url: "https://derkretaner.de/",
      photo: "assets/berlin-arch-tour/2018-07-21_Restaurant_Der_Kretaner-Zehlendorf.jpg",
    },
    dinner: {
      nameDe: "Restaurant Fischerhütte am Schlachtensee",
      nameEn: "Fischerhütte am Schlachtensee",
      bodyDe:
        "Fischerhüttenstraße 136, Zehlendorf. Historisches Gasthaus seit 1723 direkt am See – Wirtshaus, Terrasse und Biergarten.",
      bodyEn:
        "Fischerhüttenstraße 136, Zehlendorf. Historic inn since 1723 on the lake – restaurant, terrace and beer garden.",
      url: "https://fischerhuette-berlin.de/",
      photo: "assets/berlin-arch-tour/schlachtensee.jpeg",
    },
  },
  3: {
    dinner: {
      nameDe: "Café am Neuen See",
      nameEn: "Café am Neuen See",
      bodyDe:
        "Lichtensteinallee 2, Tiergarten. Biergarten und Restaurant am Neuen See – mitten im Park, nahe Siegessäule und Regierungsviertel.",
      bodyEn:
        "Lichtensteinallee 2, Tiergarten. Beer garden and restaurant on the Neuer See – in the park, near the Victory Column and government quarter.",
      url: "https://www.cafeamneuensee.de/",
      photo: "assets/berlin-arch-tour/CaféAmNeuenSee.jpeg",
    },
  },
  4: {
    lunch: {
      nameDe: "Lon Men's Noodle House",
      nameEn: "Lon Men's Noodle House",
      bodyDe:
        "Kantstraße 33, Charlottenburg. Authentische taiwanesische Nudeln und Wan-Tan – Institution in der Kantstraße seit 2003.",
      bodyEn:
        "Kantstraße 33, Charlottenburg. Authentic Taiwanese noodles and wontons – a Kantstraße institution since 2003.",
      url: "https://lonmen.eatbu.com/",
      photo: "assets/berlin-arch-tour/Lon_Mens_Noodle_House.jpg",
    },
    dinner: {
      nameDe: "Paris Bar",
      nameEn: "Paris Bar",
      bodyDe:
        "Kantstraße 152, Charlottenburg. Künstlerlokal seit den 1970ern – Wände voller Kunst, französische Küche, Savignyplatz-Nähe.",
      bodyEn:
        "Kantstraße 152, Charlottenburg. Artists' haunt since the 1970s – art-covered walls, French cuisine, near Savignyplatz.",
      url: "https://www.parisbar.net/",
      photo: "assets/berlin-arch-tour/Paris_Bar_Kantstrasse.jpg",
    },
  },
  6: {
    lunch: {
      nameDe: "Goldies",
      nameEn: "Goldies",
      bodyDe:
        "Graefestraße 93, Kreuzberg. Smashburger und Street Food von zwei Sterneköchen – direkt am Kottbusser Tor.",
      bodyEn:
        "Graefestraße 93, Kreuzberg. Smash burgers and street food from two Michelin-star chefs – right by Kottbusser Tor.",
      url: "https://www.goldies-smashburger.de/",
      photo: "assets/berlin-arch-tour/2025-07-07-GoldiesBurger-Kreuzberg.jpg",
    },
    dinner: {
      nameDe: "Il Casolare",
      nameEn: "Il Casolare",
      bodyDe:
        "Grimmstraße 30, Kreuzberg. Pizza aus dem Holzofen am Landwehrkanal – gegenüber der Admiralbrücke, beliebter Kreuzberg-Klassiker.",
      bodyEn:
        "Grimmstraße 30, Kreuzberg. Wood-oven pizza on the Landwehr Canal – opposite Admiralbrücke, a Kreuzberg classic.",
      url: "https://ilcasolare.foodpearl.com/",
      photo: "assets/berlin-arch-tour/Il_Casolare_Grimmstrasse.jpg",
    },
  },
  7: {
    lunch: {
      nameDe: "Sale e Tabacchi",
      nameEn: "Sale e Tabacchi",
      bodyDe:
        "Rudi-Dutschke-Straße 23, Kreuzberg. Klassisch italienisch, nahe allen Projekten des Tages.",
      bodyEn:
        "Rudi-Dutschke-Straße 23, Kreuzberg. Classic Italian, near all projects of the day.",
      url: "https://www.saleetabacchi.de/",
      photo: "assets/berlin-arch-tour/SaleETabacchi.JPG",
    },
  },
};

/** Default dining placeholders per day (review later). */
export const DEFAULT_DINING = {
  lunch: {
    nameDe: "Mittagspause vor Ort",
    nameEn: "Lunch on route",
    bodyDe: "Empfehlung folgt - vorläufig flexibel entlang der Route wählen.",
    bodyEn: "Recommendation to follow - for now choose flexibly along the route.",
    url: "https://www.visitberlin.de/",
  },
  dinner: {
    nameDe: "Abendessen in der Nähe",
    nameEn: "Dinner nearby",
    bodyDe: "Empfehlung folgt - vorläufig flexibel entlang der Route wählen.",
    bodyEn: "Recommendation to follow - for now choose flexibly along the route.",
    url: "https://www.visitberlin.de/",
  },
};
