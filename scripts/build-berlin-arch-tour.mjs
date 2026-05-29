#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outPath = join(rootDir, "berlinarchtour.html");
const imgDir = join(rootDir, "assets", "berlin-arch-tour");

const HERO_REMOTE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Berlin_Reichstag_Building_%28Ank_Kumar%29_07.jpg/1280px-Berlin_Reichstag_Building_%28Ank_Kumar%29_07.jpg";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) return;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "FridayCircleBot/1.0 (friday-circle static build)" },
      redirect: "follow",
    });
    if (res.ok) {
      writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
      await sleep(1200);
      return;
    }
    if (res.status === 429 && attempt < 4) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
}

async function localizeTourImages() {
  mkdirSync(imgDir, { recursive: true });
  const heroPath = join(imgDir, "hero.jpg");
  await downloadImage(HERO_REMOTE, heroPath);
  const heroLocal = "assets/berlin-arch-tour/hero.jpg";

  for (const day of DAYS) {
    for (const stop of day.stops) {
      if (!stop.photo || stop.photo.startsWith("assets/")) continue;
      const dest = join(imgDir, `${stop.id}.jpg`);
      await downloadImage(stop.photo, dest);
      stop.photo = `assets/berlin-arch-tour/${stop.id}.jpg`;
    }
  }
  return heroLocal;
}

const DAYS = [
  {
    id: 1,
    themeDe: "Weimar & Klassische Moderne",
    themeEn: "Weimar & Classical Modernism",
    eraDe: "1920–1958",
    eraEn: "1920–1958",
    routeDe: "Westend → Zehlendorf → Spandau",
    routeEn: "Westend → Zehlendorf → Spandau",
    lunchDe: "Wirtshaus Schildhorn — Am Schildhorn, Zehlendorf. Historisches Ausflugslokal direkt am Havel-Ufer, seit 1842. Klassische Berliner Küche, Gartenrestaurant.",
    lunchEn: "Wirtshaus Schildhorn — Am Schildhorn, Zehlendorf. Historic excursion inn on the Havel since 1842. Classic Berlin cuisine, garden restaurant.",
    dinnerDe: "Café Hardenberg — Hardenbergstraße, Charlottenburg. Günstig, solid, neben der TU Berlin.",
    dinnerEn: "Café Hardenberg — Hardenbergstraße, Charlottenburg. Affordable, solid, next to TU Berlin.",
    stops: [
      {
        id: "d1-hufeisen",
        nameDe: "Hufeisensiedlung",
        nameEn: "Horseshoe Estate",
        metaDe: "Bruno Taut & Fritz Förster · 1925–1933",
        metaEn: "Bruno Taut & Fritz Förster · 1925–1933",
        tag: "UNESCO · Bruno Taut · 1930",
        teaserDe:
          "Rund 1.000 Wohneinheiten für Arbeiter - würdevoll, farbig, radikal. Taut zeigt, dass sozialer Wohnungsbau kein Kompromiss sein muss.",
        teaserEn:
          "Around 1,000 workers' dwellings - dignified, colourful, radical. Taut shows social housing need not be a compromise.",
        bodyDe:
          "Bruno Taut und Fritz Förster bauten hier zwischen 1925 und 1933 rund 1.000 Wohneinheiten für Arbeiter - erschwinglich, würdevoll, farbig. Das Herzstück ist der namensgebende Hufeisenbau: ein halbrundes, fünfgeschossiges Gebäude um einen großen Grünraum. Taut nutzte Farbe nicht als Dekoration, sondern als strukturierendes Element. Jeder Hauseingang hat eine andere Akzentfarbe. Die sozialdemokratisch regierten Kommunen finanzierten diese Projekte als politisches Programm: gute Räume für alle. 1933 endete das.",
        bodyEn:
          "Bruno Taut and Fritz Förster built around 1,000 affordable workers' dwellings here between 1925 and 1933 - dignified and colourful. The horseshoe block wraps a large green courtyard. Taut used colour as structure, not decoration. Each entrance has a different accent. Municipal funding made this a political programme of good housing for all. It ended in 1933.",
        storyDe:
          "UNESCO 2008 - 2008 wurden die Hufeisensiedlung und fünf weitere Berliner Siedlungen als UNESCO-Welterbe anerkannt: sie dokumentieren die erste systematische Antwort auf die soziale Wohnungsnot der Industrialisierung.",
        storyEn:
          "UNESCO 2008 - In 2008 the Horseshoe Estate and five other Berlin estates were listed as UNESCO World Heritage, documenting the first systematic response to industrial housing need.",
        accessDe: "Jederzeit von außen zugänglich. U-Bahn U8 Haltestelle Parchimer Allee.",
        accessEn: "Accessible from outside at all times. U8 Parchimer Allee.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Berlin_Hufeisensiedlung_UAV_04-2017.jpg/1280px-Berlin_Hufeisensiedlung_UAV_04-2017.jpg",
      },
      {
        id: "d1-onkel",
        nameDe: "Siedlung Onkel-Toms-Hütte",
        nameEn: "Onkel Tom's Cabin Estate",
        metaDe: "Bruno Taut / Hugo Häring / Otto Rudolf Salvisberg · 1926–1931",
        metaEn: "Bruno Taut / Hugo Häring / Otto Rudolf Salvisberg · 1926–1931",
        tag: "UNESCO · Taut / Häring · 1931",
        teaserDe: "Stadtwald als Wohnlandschaft. Organischer als Britz. Hugo Härings Beitrag als Kontrapunkt zu Taut.",
        teaserEn: "Urban forest as living landscape. More organic than Britz. Hugo Häring's counterpoint to Taut.",
        bodyDe:
          "Die Siedlung liegt im Zehlendorfer Kiefernwald. Taut, Häring und Salvisberg entwarfen Reihenhäuser, die sich in den Wald einschmiegen - organische Wegeführung, Dialog zwischen Gebäude und Baum. Hugo Häring war Tauts intellektueller Gegenspieler: Er interessierte sich für Formen, die aus der Funktion entstehen, nicht aus geometrischen Vorgaben. Die U-Bahnstation Onkel Toms Hütte von Alfred Grenander (1929) ist ein eigenes Meisterwerk der Weimarer Moderne.",
        bodyEn:
          "The estate sits in Zehlendorf's pine forest. Taut, Häring and Salvisberg designed row houses woven into the trees. Häring pursued forms arising from function, not geometry. Alfred Grenander's U-Bahn station (1929) is a Weimar-era masterpiece in its own right.",
        accessDe: "Jederzeit von außen zugänglich. U-Bahn U3 Haltestelle Onkel Toms Hütte.",
        accessEn: "Accessible from outside at all times. U3 Onkel Toms Hütte.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/0/0a/Siedlung_Onkel_Toms_H%C3%BCtte-_Argentinische_Allee.jpg",
      },
      {
        id: "d1-gropius",
        nameDe: "Haus Abraham · Haus Lewin (Gropius)",
        nameEn: "Haus Abraham · Haus Lewin (Gropius)",
        metaDe: "Arthur Korn & Siegfried Weitzmann / Walter Gropius · 1928",
        metaEn: "Arthur Korn & Siegfried Weitzmann / Walter Gropius · 1928",
        tag: "Baudenkmal · Korn & Gropius · 1928",
        teaserDe:
          "Funktionalismus im Villenmilieu. Beide für jüdische Auftraggeber - das erklärt, warum so wenige dieser Bauten erhalten sind.",
        teaserEn:
          "Functionalism in a villa neighbourhood. Both built for Jewish clients - which explains why so few such buildings survived.",
        bodyDe:
          "Haus Abraham (1928, Arthur Korn & Siegfried Weitzmann): Ein weißer Rechteckkubus mit konvexem verglastem Treppenhaus. Haus Lewin von Walter Gropius steht in der Nachbarschaft, ebenfalls für jüdische Auftraggeber. Viele Bauten dieser Art verschwanden nach 1933. Beide Häuser sind Privatgebäude, von der Straße aus gut lesbar.",
        bodyEn:
          "Haus Abraham (1928): a white cube with a convex glazed stair tower. Gropius's Haus Lewin is nearby. Both were built for Jewish clients; many such houses were lost after 1933. Private buildings, readable from the street.",
        accessDe: "Privatgebäude. Von der Straße lesbar. S-Bahn S1 Haltestelle Schlachtensee.",
        accessEn: "Private buildings. Readable from the street. S1 Schlachtensee.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Arthur_Korn%2C_Haus_Dr._Abraham%2C_Zustand_2015.jpg/1280px-Arthur_Korn%2C_Haus_Dr._Abraham%2C_Zustand_2015.jpg",
      },
      {
        id: "d1-siemens",
        nameDe: "Großsiedlung Siemensstadt",
        nameEn: "Siemensstadt Housing Estate",
        metaDe: "Hans Scharoun, Walter Gropius, Hugo Häring u.a. · 1929–1931",
        metaEn: "Hans Scharoun, Walter Gropius, Hugo Häring et al. · 1929–1931",
        tag: "UNESCO · Scharoun / Gropius · 1930",
        teaserDe: "Sechs Architekten, ein Manifest. Licht, Luft, Grün gegen die Mietskaserne der Gründerzeit.",
        teaserEn: "Six architects, one manifesto. Light, air and green space against the tenement block.",
        bodyDe:
          "Sechs der bedeutendsten Architekten ihrer Zeit bauten je einen Abschnitt einer zusammenhängenden Siedlung. Die Zeilenbauweise gibt der Siedlung ihre Struktur: lange parallele Wohnriegel nach Süden, dazwischen Grün und Luft. Scharouns Abschnitt bricht als einziger die Strenge der Zeile auf.",
        bodyEn:
          "Six leading architects each built a section of one continuous estate. Parallel housing rows face south with green between them. Scharoun's section alone breaks the strict line.",
        accessDe: "Jederzeit von außen zugänglich. U-Bahn U7 Haltestelle Rohrdamm.",
        accessEn: "Accessible from outside at all times. U7 Rohrdamm.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Hugo_H%C3%A4rings_Bauten_Ringsiedlung_Siemensstadt_Berlin_%282026%29.jpg/1280px-Hugo_H%C3%A4rings_Bauten_Ringsiedlung_Siemensstadt_Berlin_%282026%29.jpg",
      },
      {
        id: "d1-olympia",
        nameDe: "Olympiastadion",
        nameEn: "Olympic Stadium",
        metaDe: "Werner March · 1936",
        metaEn: "Werner March · 1936",
        tag: "Werner March · 1936 · Kontrast",
        teaserDe:
          "Neoklassizismus als Machtgeste. Liegt direkt neben dem Corbusier-Haus - der Kontrast ist Teil der Route.",
        teaserEn:
          "Neoclassicism as an act of power. Right next to the Corbusier building - the contrast is part of the itinerary.",
        bodyDe:
          "Das Olympiastadion liegt direkt neben dem Corbusier-Haus in Westend. Auf der einen Seite die Wohnmaschine der Interbau 1957, auf der anderen die Machtarchitektur von 1936. Werner March entwarf das Stadion ursprünglich sachlicher - Hitler ließ es nachträglich in Neoklassizismus umplanen.",
        bodyEn:
          "The stadium sits next to Corbusier's Unité in Westend: Interbau housing machine on one side, power architecture of 1936 on the other. March's design was reworked into neoclassical monumentality.",
        storyDe:
          "Ambivalenz - Das Olympiastadion in einer Architektur-Tour aufzunehmen ist berechtigt. Das Verdrängen ist das Gegenteil von Aufarbeitung. Das Stadion steht noch. Hinschauen lohnt sich.",
        storyEn:
          "Ambivalence - Including the Olympic Stadium is justified. Erasure is the opposite of working through history. The building still stands.",
        accessDe:
          "Täglich geöffnet, Öffnungszeiten saisonal. Führungen buchbar über olympiastadion-berlin.de. S-Bahn S5/S75 Haltestelle Olympiastadion.",
        accessEn:
          "Open daily, seasonal hours. Tours via olympiastadion-berlin.de. S5/S75 Olympiastadion.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Berliner_Olympiastadion_night.jpg/1280px-Berliner_Olympiastadion_night.jpg",
      },
      {
        id: "d1-unite",
        nameDe: "Unité d'Habitation",
        nameEn: "Unité d'Habitation",
        metaDe: "Le Corbusier · 1957–1958",
        metaEn: "Le Corbusier · 1957–1958",
        tag: "Le Corbusier · 1958",
        teaserDe:
          "Corbusiers Berliner Wohnmaschine - für die Interbau 1957 gebaut, heute Wohnanlage. Direkt neben dem Olympiastadion.",
        teaserEn:
          "Corbusier's Berlin living machine - built for Interbau 1957, today a housing block. Right next to the Olympiastadion.",
        bodyDe:
          "Corbusiers Berliner Unité ist nicht die bekannteste - das ist Marseille (1952). Als Interbau-Beitrag gebaut, war sie das westliche Bekenntnis zur sozialen Wohnmaschine: Wohnen als Infrastruktur. Der Weg vom Olympiastadion zur Unité ist kurz. Der Kontrastwechsel erheblich.",
        bodyEn:
          "Berlin's Unité is not the famous one - that is Marseille (1952). Built for Interbau, it declared housing as infrastructure. The walk from the stadium to the Unité is short; the contrast is vast.",
        accessDe: "Wohngebäude, nicht öffentlich zugänglich. Von außen gut lesbar.",
        accessEn: "Residential building, not open to the public. Readable from outside.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Corbusierhaus%2C_Berlin-msu-2021-2276-.jpg/1280px-Corbusierhaus%2C_Berlin-msu-2021-2276-.jpg",
      },
    ],
  },
  {
    id: 2,
    themeDe: "Kalter Krieg",
    themeEn: "Cold War",
    eraDe: "1945–1968",
    eraEn: "1945–1968",
    routeDe: "Tiergarten → Kulturforum → Friedrichshain",
    routeEn: "Tiergarten → Kulturforum → Friedrichshain",
    lunchDe: "Café Moskau — Karl-Marx-Allee 34. Josef Kaiser, 1964. Elegantes DDR-Modernes Gebäude auf der Allee selbst.",
    lunchEn: "Café Moskau — Karl-Marx-Allee 34. Josef Kaiser, 1964. Elegant GDR modern building on the boulevard.",
    dinnerDe: "Pauly Saal — Auguststraße 11–13, Mitte. Im ehemaligen Gemeindehaus der Jüdischen Mädchenschule.",
    dinnerEn: "Pauly Saal — Auguststraße 11–13, Mitte. In the former Jewish girls' school community house.",
    stops: [
      {
        id: "d2-hkw",
        nameDe: "Schwangere Auster (Haus der Kulturen der Welt)",
        nameEn: "House of World Cultures",
        metaDe: "Hugh A. Stubbins · 1957",
        metaEn: "Hugh A. Stubbins · 1957",
        tag: "Hugh Stubbins · 1957",
        teaserDe:
          "US-Propagandabau, bewusst sichtbar von der DDR-Grenze. Der Architekt selbst nannte es einen Propagandabau Richtung Sowjets.",
        teaserEn:
          "US propaganda building, deliberately visible from the GDR border. The architect called it propaganda aimed at the Soviets.",
        bodyDe:
          "Schenkung der USA an West-Berlin, 1957. Hugh Stubbins entwarf eine freitragende Spannbeton-Schale. Am 21. Mai 1980 stürzte ein Teil des Daches ein. Nach dem Wiederaufbau 1987 gilt das Gebäude als politisches Dokument.",
        bodyEn:
          "A US gift to West Berlin, 1957. Stubbins designed a cantilevered concrete shell. Part of the roof collapsed in 1980; rebuilt by 1987 as a political document.",
        storyDe:
          "Propagandabau - Man ließ einen Hügel aufschütten, damit die Bürger der DDR das Gebäude von der Grenze aus sehen konnten.",
        storyEn:
          "Propaganda building - A mound was raised so GDR citizens could see the building from the border.",
        accessDe: "Frei zugänglich als Außenanlage. hkw.de für Programm. Bus 100/187 Haus der Kulturen der Welt.",
        accessEn: "Exterior freely accessible. hkw.de for events. Bus 100/187.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Haus_der_Kulturen_der_Welt%2C_Blaue_Stunde%2C_Berlin%2C_160521%2C_ako.jpg/1280px-Haus_der_Kulturen_der_Welt%2C_Blaue_Stunde%2C_Berlin%2C_160521%2C_ako.jpg",
      },
      {
        id: "d2-hansa",
        nameDe: "Hansaviertel",
        nameEn: "Hansaviertel",
        metaDe: "Interbau 1957",
        metaEn: "Interbau 1957",
        tag: "Interbau 1957",
        teaserDe:
          "53 internationale Architekten, ein westliches Manifest. Die direkte Antwort auf die Stalinallee - beide zur selben Zeit gebaut.",
        teaserEn:
          "53 international architects, one western manifesto. The direct answer to Stalinallee - both built at the same time.",
        bodyDe:
          "Die Interbau 1957 lud 53 internationale Architekten ein. Alvar Aalto, Oscar Niemeyer, Walter Gropius - das Hansaviertel funktioniert als Gesamtbild, weil die Unterschiede nicht nivelliert wurden.",
        bodyEn:
          "Interbau 1957 invited 53 international architects. Aalto, Niemeyer, Gropius - the quarter works because differences were not flattened.",
        accessDe: "Jederzeit von außen zugänglich. S-Bahn Tiergarten oder Bellevue.",
        accessEn: "Accessible from outside at all times. S-Bahn Tiergarten or Bellevue.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Hansaviertel_Hansaplatz.JPG/1280px-Hansaviertel_Hansaplatz.JPG",
      },
      {
        id: "d2-philharmonie",
        nameDe: "Philharmonie + Neue Nationalbibliothek",
        nameEn: "Philharmonie + State Library",
        metaDe: "Hans Scharoun · 1963 / 1978",
        metaEn: "Hans Scharoun · 1963 / 1978",
        tag: "Hans Scharoun · 1963 / 1978",
        teaserDe:
          "Scharoun gegen das rechte Winkel-Dogma. Organische Expressivität als West-Berliner Gegenentwurf.",
        teaserEn:
          "Scharoun against the right-angle dogma. Organic expressivity as West Berlin's counter-proposal.",
        bodyDe:
          "Die Philharmonie ist sein Hauptwerk: das Orchester im Zentrum, Zuschauer ringsum auf terrassierten Ebenen. Am Kulturforum stehen Scharoun und Mies nebeneinander - zwei Haltungen, zwei Welten.",
        bodyEn:
          "The Philharmonie places the orchestra at the centre with terraced seating around it. At the Kulturforum Scharoun and Mies stand side by side - two attitudes, two worlds.",
        accessDe: "berliner-philharmoniker.de für Führungen und Konzertkarten.",
        accessEn: "berliner-philharmoniker.de for tours and tickets.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Philharmonie%2C_Berlin%2C_170518%2C_ako.jpg/1280px-Philharmonie%2C_Berlin%2C_170518%2C_ako.jpg",
      },
      {
        id: "d2-nng",
        nameDe: "Neue Nationalgalerie",
        nameEn: "Neue Nationalgalerie",
        metaDe: "Ludwig Mies van der Rohe (1968) · Sanierung David Chipperfield (2021)",
        metaEn: "Ludwig Mies van der Rohe (1968) · Restoration David Chipperfield (2021)",
        tag: "Mies 1968 · Chipperfield 2021",
        teaserDe:
          "Mies' Rückkehr nach Deutschland. Sein letztes europäisches Werk. Chipperfields Sanierung ist kaum sichtbar - das ist der Erfolg.",
        teaserEn:
          "Mies' return to Germany. His last European work. Chipperfield's restoration is barely visible - that is its success.",
        bodyDe:
          "Ein Stahlglas-Tempel für den universellen Raum. Chipperfields Sanierung (2015–2021) dokumentierte jede Oberfläche und restaurierte originalgetreu. Kaum sichtbar - das ist der Erfolg.",
        bodyEn:
          "A steel-and-glass temple for the universal space. Chipperfield's 2015–2021 restoration is almost invisible - that is its success.",
        storyDe:
          "Chipperfield-Faden - Neue Nationalgalerie, Neues Museum, James Simon Galerie, Haus Bastian, Joachimstraße-Campus - fünf Berliner Werke eines Architekten.",
        storyEn:
          "Chipperfield thread - Neue Nationalgalerie, Neues Museum, James Simon Galerie, Haus Bastian, Joachimstraße campus - five Berlin works by one architect.",
        accessDe: "smb.museum · Di–Fr 10–18 Uhr, Do bis 20 Uhr. Eintritt ca. 14 €.",
        accessEn: "smb.museum · Tue–Fri 10–18, Thu until 20. Admission approx. €14.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Berlin_Neue_Nationalgalerie_asv2021-11_img1.jpg/1280px-Berlin_Neue_Nationalgalerie_asv2021-11_img1.jpg",
      },
      {
        id: "d2-kma",
        nameDe: "Karl-Marx-Allee",
        nameEn: "Karl-Marx-Allee",
        metaDe: "DDR · 1952–1965",
        metaEn: "GDR · 1952–1965",
        tag: "DDR · 1952–1965",
        teaserDe: "Zu Fuß vom Frankfurter Tor: erst Zuckerbäckerstil, dann DDR-Moderne. Zwei Epochen auf einem Boulevard.",
        teaserEn: "On foot from Frankfurter Tor: Stalinist wedding-cake, then GDR modernism. Two eras on one boulevard.",
        bodyDe:
          "Abschnitt 1: Sozialistischer Klassizismus. Abschnitt 2 nach 1953: internationaler Modernismus. Das Kino International und das Café Moskau entstanden hier.",
        bodyEn:
          "Section 1: socialist classicism. After 1953, section 2 turns to international modernism. Kino International and Café Moskau were built here.",
        accessDe: "Jederzeit zugänglich. U5 Frankfurter Tor.",
        accessEn: "Accessible at all times. U5 Frankfurter Tor.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Berlin-Friedrichshain%2C_Strausberger_Platz_Dm09085179_met_de_Fernsehturm_op_de_achtergrond_Dm09065023_IMG_5373_2024-09-05_09.56.jpg/1280px-Berlin-Friedrichshain%2C_Strausberger_Platz_Dm09085179_met_de_Fernsehturm_op_de_achtergrond_Dm09065023_IMG_5373_2024-09-05_09.56.jpg",
      },
      {
        id: "d2-kino",
        nameDe: "Kino International",
        nameEn: "Kino International",
        metaDe: "Josef Kaiser / Heinz Aust · 1963",
        metaEn: "Josef Kaiser / Heinz Aust · 1963",
        tag: "Josef Kaiser · 1963",
        teaserDe:
          'Am 9. November 1989 lief hier "Coming Out" - der erste queere DDR-Film. Der Kinosaal stand noch offen.',
        teaserEn:
          'On 9 November 1989 "Coming Out" - the GDR\'s first queer film - screened here as the Wall opened.',
        bodyDe:
          "Das eleganteste Gebäude der DDR-Moderne an der Allee. Am 9. November 1989 lief hier Coming Out. Nach der Vorstellung erfuhren die Besucher, dass die Mauer geöffnet worden war.",
        bodyEn:
          "The most elegant GDR modern building on the boulevard. On 9 November 1989 Coming Out screened here; after the show, audiences learned the Wall had opened.",
        storyDe:
          "9. November 1989 - Kein anderes Gebäude Berlins verdichtet die Widersprüche der DDR so präzise.",
        storyEn:
          "9 November 1989 - Few buildings compress GDR contradictions as precisely as this one.",
        accessDe: "Sanierung bis voraussichtlich 2026 - vorab prüfen: kino-international.com. U5 Schillingstraße.",
        accessEn: "Renovation until approx. 2026 - check kino-international.com. U5 Schillingstraße.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Kino_International_Berlin%2C_2024_%2802%29.jpg/1280px-Kino_International_Berlin%2C_2024_%2802%29.jpg",
      },
    ],
  },
  {
    id: 3,
    themeDe: "Dunkle Jahre",
    themeEn: "Dark Years",
    eraDe: "1933–45 im Stadtbild",
    eraEn: "1933–45 in the cityscape",
    routeDe: "Regierungsviertel → Mitte → Kreuzberg",
    routeEn: "Government quarter → Mitte → Kreuzberg",
    lunchDe: "Sale e Tabacchi — Rudi-Dutschke-Straße 23, Kreuzberg. Klassisch italienisch, nahe allen Projekten des Tages.",
    lunchEn: "Sale e Tabacchi — Rudi-Dutschke-Straße 23, Kreuzberg. Classic Italian, near all projects of the day.",
    dinnerDe: "Clärchens Ballhaus — Auguststraße 24, Mitte. Tanzsaal von 1913 - Weimarer Republik, DDR, Wende.",
    dinnerEn: "Clärchens Ballhaus — Auguststraße 24, Mitte. Dance hall from 1913 - Weimar, GDR, reunification.",
    stops: [
      {
        id: "d3-botschaft",
        nameDe: "Schweizer Botschaft + Diener & Diener Anbau",
        nameEn: "Swiss Embassy + Diener & Diener extension",
        metaDe: "Stadtpalais 1919 · Diener & Diener 2000",
        metaEn: "Town palace 1919 · Diener & Diener 2000",
        tag: "Stadtpalais 1919 · Diener & Diener 2000",
        teaserDe:
          "Das einzige Gebäude im Spreebogen, das Speers Germania-Pläne überstand. Am 28. April 1945 Hauptquartier für den Sturm auf den Reichstag.",
        teaserEn:
          "The only building in the Spreebogen that survived Speer's Germania plans. HQ for the assault on the Reichstag in April 1945.",
        bodyDe:
          "Die Schweizer Botschaft steht direkt neben dem Reichstag - das einzige Gebäude im Spreebogen, das Germania-Pläne, Bombardierungen und die Zeit danach überlebte. Der Anbau von Diener & Diener (2000) erinnert an Carlo Scarpa.",
        bodyEn:
          "The Swiss Embassy beside the Reichstag is the only Spreebogen building that survived Germania plans and bombing. Diener & Diener's 2000 extension recalls Carlo Scarpa.",
        storyDe:
          "Glück der Neutralität - Die These, die Alliierten hätten die Botschaft absichtlich verschont, gilt als unplausibel.",
        storyEn:
          "Luck of neutrality - The claim that Allies deliberately spared the embassy is considered implausible.",
        accessDe: "Außenansicht jederzeit. Botschafts-Open-Days jährlich.",
        accessEn: "Exterior anytime. Embassy open days annually.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Berlin-Tiergarten%2C_die_Schweizer_Botschaft.jpg/1280px-Berlin-Tiergarten%2C_die_Schweizer_Botschaft.jpg",
      },
      {
        id: "d3-topo",
        nameDe: "Topographie des Terrors",
        nameEn: "Topography of Terror",
        metaDe: "Ursula Wilms · 2010",
        metaEn: "Ursula Wilms · 2010",
        tag: "Ursula Wilms · 2010",
        teaserDe:
          "Auf den Kellerfundamenten von SS und Gestapo. Architektur als Rahmung des Verbrechens - ein Dokument.",
        teaserEn:
          "On the cellar foundations of the SS and Gestapo. Architecture framing crime - a document.",
        bodyDe:
          "Kein Denkmal, sondern ein Dokumentationszentrum auf dem Grundriss eines Verbrechens. Der Freiraum zeigt noch die Kellermauern.",
        bodyEn:
          "Not a memorial but a documentation centre on the footprint of crime. The open ground still shows cellar walls.",
        accessDe: "Eintritt frei. topographie.de. U2 oder S-Bahn Potsdamer Platz.",
        accessEn: "Free admission. topographie.de. U2 or S-Bahn Potsdamer Platz.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Topographie_des_Terrors_November_2013.jpg/1280px-Topographie_des_Terrors_November_2013.jpg",
      },
      {
        id: "d3-holocaust",
        nameDe: "Holocaust-Mahnmal",
        nameEn: "Holocaust Memorial",
        metaDe: "Peter Eisenman · 2005",
        metaEn: "Peter Eisenman · 2005",
        tag: "Peter Eisenman · 2005",
        teaserDe: "2711 Stelen. Desorientierung als architektonische Sprache.",
        teaserEn: "2711 stelae. Disorientation as architectural language.",
        bodyDe:
          "2711 Stelen ohne Namen. Eisenmans These: Desorientierung als Methode. Das Mahnmal erzeugt einen Zustand.",
        bodyEn:
          "2711 stelae without names. Eisenman's method: disorientation as experience. The memorial produces a state, not a story.",
        storyDe:
          "Debatte - Eisenman wollte kein Pietätsbild, sondern einen Raum, der das Unbegreifliche körperlich erfahrbar macht.",
        storyEn:
          "Debate - Eisenman sought not piety but a space that makes the incomprehensible physically felt.",
        accessDe: "Mahnmal jederzeit. Informationszentrum: holocaust-denkmal.de.",
        accessEn: "Memorial anytime. Information centre: holocaust-denkmal.de.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Stelen_Holocaust-Mahnmal.jpg/1280px-Stelen_Holocaust-Mahnmal.jpg",
      },
      {
        id: "d3-jm",
        nameDe: "Jüdisches Museum",
        nameEn: "Jewish Museum",
        metaDe: "Daniel Libeskind · 1999",
        metaEn: "Daniel Libeskind · 1999",
        tag: "Daniel Libeskind · 1999",
        teaserDe:
          "Die Voids sind das Gebäude. Kein Ausstellungsstück muss erklärt werden, wenn man den Raum kennt.",
        teaserEn:
          "The voids are the building. No exhibit needs explanation once you know the space.",
        bodyDe:
          "Libeskinds Durchbruch: Architektur als Aussage. Die Voids stehen für Abwesenheit. Der Garten des Exils: 49 Betonsäulen auf geneigtem Boden.",
        bodyEn:
          "Libeskind's breakthrough: architecture as statement. The voids stand for absence. Garden of Exile: 49 concrete columns on sloped ground.",
        accessDe: "Täglich 10–20 Uhr. Eintritt ca. 8 €. jmberlin.de.",
        accessEn: "Daily 10–20. Admission approx. €8. jmberlin.de.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Libeskind-Bau_%28J%C3%BCdisches_Museum_Berlin%29.jpg/1280px-Libeskind-Bau_%28J%C3%BCdisches_Museum_Berlin%29.jpg",
      },
      {
        id: "d3-checkpoint",
        nameDe: "Haus am Checkpoint Charlie",
        nameEn: "Haus am Checkpoint Charlie",
        metaDe: "Peter Eisenman · IBA 1985",
        metaEn: "Peter Eisenman · IBA 1985",
        tag: "Peter Eisenman · IBA 1985",
        teaserDe:
          "IBA-Wohnungsbau im Mauerstreifen. West-Berlin als Laboratorium - Eisenman experimentiert, 200 Meter weiter Bewaffnete.",
        teaserEn:
          "IBA housing in the death strip. West Berlin as laboratory - Eisenman experiments while armed guards stand 200 metres away.",
        bodyDe:
          "Die IBA 1984/87 war ein Experiment für zeitgenössische Architektur mitten im Kalten Krieg. Eisenmans Beitrag steht am Checkpoint Charlie.",
        bodyEn:
          "IBA 1984/87 was an experiment in contemporary architecture during the Cold War. Eisenman's housing stands at Checkpoint Charlie.",
        accessDe: "Wohngebäude. Von außen zugänglich. U6 Kochstraße.",
        accessEn: "Residential. Viewable from outside. U6 Kochstraße.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/2022-09-02-Haus-am-Checkpoint-Charlie-Rudi-Dutschke-Str.jpg/1280px-2022-09-02-Haus-am-Checkpoint-Charlie-Rudi-Dutschke-Str.jpg",
      },
    ],
  },
  {
    id: 4,
    themeDe: "Wende & Berliner Republik",
    themeEn: "Turning Point & Berlin Republic",
    eraDe: "1989–2005",
    eraEn: "1989–2005",
    routeDe: "Potsdamer Platz → Pariser Platz → Unter den Linden",
    routeEn: "Potsdamer Platz → Pariser Platz → Unter den Linden",
    lunchDe: "Borchardt — Französische Straße 47, Mitte. Historischer Gründerzeit-Saal.",
    lunchEn: "Borchardt — Französische Straße 47, Mitte. Historic Wilhelmine dining room.",
    dinnerDe: "Lutter & Wegner — Charlottenstraße 56, Mitte. Weinrestaurant seit 1811.",
    dinnerEn: "Lutter & Wegner — Charlottenstraße 56, Mitte. Wine restaurant since 1811.",
    stops: [
      {
        id: "d4-sony",
        nameDe: "Potsdamer Platz · Sony Center",
        nameEn: "Potsdamer Platz · Sony Center",
        metaDe: "Renzo Piano, Helmut Jahn, Hans Kollhoff · 1993–2000",
        metaEn: "Renzo Piano, Helmut Jahn, Hans Kollhoff · 1993–2000",
        tag: "Piano · Jahn · Kollhoff · 1993–2000",
        teaserDe: "Größtes privates Stadtbauprojekt Europas nach 1989. Drei Architekten, drei Haltungen, ein Platz.",
        teaserEn: "Largest private urban project in Europe after 1989. Three architects, three positions, one square.",
        bodyDe:
          "Nach der Wende entstand auf leerem Terrain ein neues Stück Stadt. Pianos Blöcke, Jahns Sony Center, Kollhoffs Backstein-Hochhaus.",
        bodyEn:
          "After reunification a new city quarter rose on empty ground. Piano's blocks, Jahn's Sony Center, Kollhoff's brick tower.",
        accessDe: "Öffentlicher Raum. Sony Center: frei begehbares Atrium. U/S Potsdamer Platz.",
        accessEn: "Public space. Sony Center atrium freely accessible. U/S Potsdamer Platz.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Sony_Center_Berlin.jpg/1280px-Sony_Center_Berlin.jpg",
      },
      {
        id: "d4-reichstag",
        nameDe: "Reichstag · Foster-Kuppel",
        nameEn: "Reichstag · Foster dome",
        metaDe: "Norman Foster · 1999",
        metaEn: "Norman Foster · 1999",
        tag: "Norman Foster · 1999",
        teaserDe:
          "Transparenz als Demokratie-Metapher. Der Besucher steht über dem Parlament und schaut in den Plenarsaal.",
        teaserEn:
          "Transparency as democracy. Visitors stand above parliament and look down into the chamber.",
        bodyDe:
          "Foster gewann 1992. Die Kuppel aus Stahl und Glas: Besucher gehen über eine Spiralrampe und schauen durch einen Spiegel in den Plenarsaal. Voranmeldung obligatorisch.",
        bodyEn:
          "Foster won in 1992. The glass dome lets visitors spiral up and look down into the chamber via a mirror. Registration required.",
        accessDe: "Voranmeldung: besucherservice.bundestag.de. Kostenlos. Früh buchen.",
        accessEn: "Register at besucherservice.bundestag.de. Free. Book early.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Berlin_Reichstag_Building_%28Ank_Kumar%29_07.jpg/1280px-Berlin_Reichstag_Building_%28Ank_Kumar%29_07.jpg",
      },
      {
        id: "d4-band",
        nameDe: "Regierungsviertel · Band des Bundes",
        nameEn: "Government quarter · Band des Bundes",
        metaDe: "Schultes Frank · 1990er–2001",
        metaEn: "Schultes Frank · 1990s–2001",
        tag: "Band des Bundes · 1990er",
        teaserDe:
          "Das Band des Bundes verbindet Ost- und West-Berlin physisch. Mit der Schweizer Botschaft ergibt sich die Lektüre des Spreebogens.",
        teaserEn:
          "The Band des Bundes physically links East and West Berlin. With the Swiss Embassy, the Spreebogen reads complete.",
        bodyDe:
          "Lineares Gebäude über die Spree. Das Kanzleramt daneben. Im Kontext der Schweizer Botschaft: das Überlebende, das Neue, das Amtliche.",
        bodyEn:
          "A linear building across the Spree. The Chancellery beside it. With the Swiss Embassy: what survived, what is new, what is official.",
        accessDe: "Außenraum jederzeit. Kanzleramt: Führungen an bestimmten Tagen.",
        accessEn: "Exterior anytime. Chancellery tours on selected days.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Paul-L%C3%B6be-Haus%2C_Westseite%2C_Frontalansicht%2C_Berlin-Mitte%2C_151223%2C_ako.jpg/1280px-Paul-L%C3%B6be-Haus%2C_Westseite%2C_Frontalansicht%2C_Berlin-Mitte%2C_151223%2C_ako.jpg",
      },
      {
        id: "d4-dz",
        nameDe: "DZ Bank",
        nameEn: "DZ Bank",
        metaDe: "Frank O. Gehry · 2001",
        metaEn: "Frank O. Gehry · 2001",
        tag: "Frank Gehry · 2001",
        teaserDe:
          "Außen brav, innen spektakulär. Die Stadtgestaltungssatzung zwang Gehry zur Zurückhaltung an der Fassade.",
        teaserEn:
          "Restrained outside, spectacular inside. Planning rules forced Gehry to hold back on the facade.",
        bodyDe:
          "Sandstein und geschlossene Fassade nach außen. Innen eine biomorphe Stahl-Glas-Konstruktion - Gehrys wildester Berliner Raum.",
        bodyEn:
          "Sandstone facade outside. Inside a biomorphic steel-and-glass conference landscape - Gehry's wildest Berlin interior.",
        storyDe: "Zugang - Innenhof nur mit Führung (axica.de / ticket-b.de).",
        storyEn: "Access - Interior courtyard only with guided tours (axica.de / ticket-b.de).",
        accessDe: "Fassade jederzeit. Innen nur mit Führung.",
        accessEn: "Facade anytime. Interior by tour only.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Berlin_DZ_bank_haus_gehry.jpg/1280px-Berlin_DZ_bank_haus_gehry.jpg",
      },
      {
        id: "d4-dhm",
        nameDe: "Deutsches Historisches Museum · Pei-Erweiterung",
        nameEn: "German Historical Museum · Pei extension",
        metaDe: "I. M. Pei · 2003",
        metaEn: "I. M. Pei · 2003",
        tag: "I. M. Pei · 2003",
        teaserDe:
          "Peis Glasspiral verbindet das Barockzeughaus mit zeitgenössischen Ausstellungsräumen.",
        teaserEn:
          "Pei's glass spiral links the baroque Zeughaus with contemporary exhibition spaces.",
        bodyDe:
          "Pei baute mit 73 Jahren. Die Glasspiral verbindet das Zeughaus (1706) mit neuen Räumen - zurückhaltende Verbindung zweier Zeitebenen.",
        bodyEn:
          "Pei built at 73. The glass spiral links the 1706 Zeughaus with new galleries - a restrained bridge between eras.",
        accessDe: "dhm.de · Täglich 10–18 Uhr. Eintritt ca. 8 €.",
        accessEn: "dhm.de · Daily 10–18. Admission approx. €8.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Historisches_Museum_Eingang_Pei-Bau.jpg/1280px-Historisches_Museum_Eingang_Pei-Bau.jpg",
      },
      {
        id: "d4-nl",
        nameDe: "Niederländische Botschaft",
        nameEn: "Netherlands Embassy",
        metaDe: "OMA / Rem Koolhaas · 2003",
        metaEn: "OMA / Rem Koolhaas · 2003",
        tag: "OMA · Rem Koolhaas · 2003",
        teaserDe:
          "Eine spiralförmige Wegführung durch alle Stockwerke. Einer der wichtigsten Botschaftsbauten weltweit.",
        teaserEn:
          "A spiral route through all floors. One of the most significant embassy buildings worldwide.",
        bodyDe:
          "Koolhaas' überzeugendstes Gebäude in Berlin: eine Rampe durch alle Etagen, Fenster transparent oder opak je nach Raum.",
        bodyEn:
          "Among Koolhaas' strongest Berlin works: a ramp through every floor, windows opaque or clear by function.",
        accessDe: "Außenansicht jederzeit. Open Days gelegentlich.",
        accessEn: "Exterior anytime. Open days occasionally.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Embassy_of_the_Netherlands_in_Berlin_November_2013.jpg/1280px-Embassy_of_the_Netherlands_in_Berlin_November_2013.jpg",
      },
    ],
  },
  {
    id: 5,
    themeDe: "Osten",
    themeEn: "East",
    eraDe: "1932 · 1950er · 1990er",
    eraEn: "1932 · 1950s · 1990s",
    routeDe: "Hohenschönhausen → Friedrichshain → Mitte",
    routeEn: "Hohenschönhausen → Friedrichshain → Mitte",
    lunchDe: "Café Moskau — Karl-Marx-Allee 34, Friedrichshain.",
    lunchEn: "Café Moskau — Karl-Marx-Allee 34, Friedrichshain.",
    dinnerDe: "Pauly Saal — Auguststraße 11–13, Mitte.",
    dinnerEn: "Pauly Saal — Auguststraße 11–13, Mitte.",
    stops: [
      {
        id: "d5-lemke",
        nameDe: "Haus Lemke",
        nameEn: "Haus Lemke",
        metaDe: "Ludwig Mies van der Rohe · 1932/33",
        metaEn: "Ludwig Mies van der Rohe · 1932/33",
        tag: "Mies van der Rohe · 1932/33 · Eintritt frei",
        teaserDe:
          "Letztes deutsches Wohnhaus vor Mies' Emigration. L-förmiger Klinkerbau am Obersee.",
        teaserEn:
          "Mies' last German house before emigration. L-shaped brick building on the Obersee.",
        bodyDe:
          "Eingeschossiger L-förmiger Klinkerbau am Obersee. Erste Umsetzung des Hofhaus-Prinzips. Nach 1945 von der Stasi als Lager genutzt, heute Ausstellungsort.",
        bodyEn:
          "Single-storey L-shaped brick house on the Obersee. First courtyard-house principle. Later Stasi storage, now exhibition venue.",
        accessDe: "Eintritt frei. Di–So 11–17 Uhr. miesvanderrohehaus.de.",
        accessEn: "Free admission. Tue–Sun 11–17. miesvanderrohehaus.de.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mies-van-der-rohe-haus-berlin-weissensee.jpg/1280px-Mies-van-der-rohe-haus-berlin-weissensee.jpg",
      },
      {
        id: "d5-kma2",
        nameDe: "Karl-Marx-Allee · Abschnitt 2 · Café Moskau",
        nameEn: "Karl-Marx-Allee · section 2 · Café Moskau",
        metaDe: "Josef Kaiser / Werner Dutschke · 1958–1965",
        metaEn: "Josef Kaiser / Werner Dutschke · 1958–1965",
        tag: "DDR-Moderne · 1958–1965",
        teaserDe: "Die architektonische Selbstkorrektur der DDR nach Stalins Tod.",
        teaserEn: "The GDR's architectural self-correction after Stalin's death.",
        bodyDe:
          "Nach 1953 sollte die DDR modern werden. Das Café Moskau (1964) ist das eleganteste Gebäude der Allee.",
        bodyEn:
          "After 1953 the GDR turned modern. Café Moskau (1964) is the boulevard's most elegant building.",
        accessDe: "Jederzeit von außen zugänglich. U5 Schillingstraße.",
        accessEn: "Accessible from outside. U5 Schillingstraße.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Caf%C3%A9_Moskau_Berlin.jpg/1280px-Caf%C3%A9_Moskau_Berlin.jpg",
      },
      {
        id: "d5-berghain",
        nameDe: "Berghain",
        nameEn: "Berghain",
        metaDe: "Heizkraftwerk DDR 1953 · Club 2004",
        metaEn: "GDR heating plant 1953 · club 2004",
        tag: "DDR-Heizkraftwerk 1953 · Club 2004",
        teaserDe:
          'Für die Stalinallee gebaut, von Mitarbeitern "Fernheizoper" genannt. 2016 als Hochkultur anerkannt.',
        teaserEn:
          'Built for Stalinallee heating, nicknamed "district-heating opera". Recognised as high culture in 2016.',
        bodyDe:
          "DDR-Heizkraftwerk von 1953, 2004 Club. Der Name verbindet Friedrichshain und Kreuzberg. Von außen gut lesbar als Industriearchitektur.",
        bodyEn:
          "1953 GDR heating plant, club since 2004. The name joins Friedrichshain and Kreuzberg. Readable from outside as industrial architecture.",
        storyDe:
          "Nachnutzung - Der Umbau durch studio karhard ist ein Lehrstück für Industriearchitektur.",
        storyEn:
          "Reuse - studio karhard's conversion is a lesson in industrial adaptation.",
        accessDe: "Außenansicht jederzeit. Club: Wochenende, Einlass selektiv.",
        accessEn: "Exterior anytime. Club weekends, selective entry.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Berghain_in_Berlin_%282023%29.jpg/1280px-Berghain_in_Berlin_%282023%29.jpg",
      },
      {
        id: "d5-tacheles",
        nameDe: "Tacheles",
        nameEn: "Tacheles",
        metaDe: "AEG-Kaufhaus 1909 · Kunsthaus 1990–2012",
        metaEn: "AEG department store 1909 · art house 1990–2012",
        tag: "Geschichte · 1990–2012",
        teaserDe:
          "Zwölf Jahre anarchisches Kunstzentrum in einer Bombentruine, dann Kapitulation an den Immobilienmarkt.",
        teaserEn:
          "Twelve years of anarchic art centre in a bombed shell, then surrender to the property market.",
        bodyDe:
          "Von 1990 bis 2012 als Kunstzentrum genutzt, heute Luxusprojekt. Das Ende 2012 signalisierte: der Markt holte die Wende-Anarchie ein.",
        bodyEn:
          "Art centre 1990–2012, luxury project today. Its 2012 end signalled the property market catching up with post-Wall anarchy.",
        accessDe: "Von außen, Oranienburger Straße. S1/S2/S25 Oranienburger Straße.",
        accessEn: "Exterior only, Oranienburger Straße. S1/S2/S25.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Kunsthaus_tacheles.berlin.II.JPG/1280px-Kunsthaus_tacheles.berlin.II.JPG",
      },
      {
        id: "d5-springer",
        nameDe: "Axel Springer Campus",
        nameEn: "Axel Springer Campus",
        metaDe: "OMA / Rem Koolhaas · 2020",
        metaEn: "OMA / Rem Koolhaas · 2020",
        tag: "OMA · Rem Koolhaas · 2020",
        teaserDe:
          "Über dem Mauerstreifen gebaut. Der Riss im Grundriss folgt dem Mauerverlauf.",
        teaserEn:
          "Built over the death strip. The split in the plan follows the Wall.",
        bodyDe:
          "Auf einem Grundstück, das der Mauerstreifen durchschnitt. Koolhaas organisiert den Grundriss entlang des Mauerverlaufs.",
        bodyEn:
          "On land cut by the Wall. Koolhaas/OMA align the plan with the Wall's course.",
        accessDe: "Außenansicht. Foyer ggf. zugänglich. U6 Kochstraße.",
        accessEn: "Exterior view. Foyer sometimes accessible. U6 Kochstraße.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/2025-08-19-Axel-Springer-Campus-Berlin-Kreuzberg.jpg/1280px-2025-08-19-Axel-Springer-Campus-Berlin-Kreuzberg.jpg",
      },
    ],
  },
  {
    id: 6,
    themeDe: "21. Jahrhundert",
    themeEn: "21st Century",
    eraDe: "2000–2024",
    eraEn: "2000–2024",
    routeDe: "Museumsinsel → Mitte",
    routeEn: "Museum Island → Mitte",
    lunchDe: "Café im Zeughaus — Unter den Linden 2 (DHM).",
    lunchEn: "Café im Zeughaus — Unter den Linden 2 (DHM).",
    dinnerDe: "Lutter & Wegner — Charlottenstraße 56, Mitte.",
    dinnerEn: "Lutter & Wegner — Charlottenstraße 56, Mitte.",
    stops: [
      {
        id: "d6-neues",
        nameDe: "Neues Museum",
        nameEn: "Neues Museum",
        metaDe: "David Chipperfield · 2009",
        metaEn: "David Chipperfield · 2009",
        tag: "David Chipperfield · 2009",
        teaserDe:
          "Das Zerstörte wurde nicht rekonstruiert, sondern ehrlich belassen. Kontinuität vor Perfektion.",
        teaserEn:
          "The destroyed was retained honestly, not reconstructed. Continuity over perfection.",
        bodyDe:
          "Chipperfield ergänzte Zerstörtes in neuer Materialität - Beton statt Stuck. Einschusslöcher und verblichene Fresken bleiben sichtbar.",
        bodyEn:
          "Chipperfield added new material where destroyed - concrete instead of stucco. Bullet holes and faded frescoes remain visible.",
        storyDe:
          "Kontinuität - Das Alte tritt in Dialog mit dem Neuen. Denkmalpflege als architektonische Haltung.",
        storyEn:
          "Continuity - Old and new in dialogue. Conservation as architectural attitude.",
        accessDe: "smb.museum · Eintritt ca. 14 €. Museumsinsel-Ticket 19 €.",
        accessEn: "smb.museum · Admission approx. €14. Museum Island ticket €19.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Berlin_-_Neues_Museum.jpg/1280px-Berlin_-_Neues_Museum.jpg",
      },
      {
        id: "d6-james",
        nameDe: "James Simon Galerie",
        nameEn: "James Simon Galerie",
        metaDe: "David Chipperfield · 2019",
        metaEn: "David Chipperfield · 2019",
        tag: "David Chipperfield · 2019",
        teaserDe:
          "Neues Eingangsgebäude der Museumsinsel - benannt nach dem jüdischen Mäzen James Simon.",
        teaserEn:
          "New entrance to Museum Island - named after Jewish patron James Simon.",
        bodyDe:
          "Zurückhaltende Kolonnade am Kupfergraben. Foyer für alle fünf Museen der Insel.",
        bodyEn:
          "Restrained colonnade on the Kupfergraben. Foyer for all five museums on the island.",
        accessDe: "Freier Zugang als öffentlicher Raum.",
        accessEn: "Free access as public space.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Berlin_James-Simon-Galerie_asv2019-07_img2.jpg/1280px-Berlin_James-Simon-Galerie_asv2019-07_img2.jpg",
      },
      {
        id: "d6-bastian",
        nameDe: "Haus Bastian",
        nameEn: "Haus Bastian",
        metaDe: "David Chipperfield · 2007",
        metaEn: "David Chipperfield · 2007",
        tag: "David Chipperfield · 2007",
        teaserDe:
          "Galerie für kulturelle Bildung am Kupfergraben. Der dritte Chipperfield-Eingriff in unmittelbarer Nähe.",
        teaserEn:
          "Gallery for cultural education on the Kupfergraben. The third nearby Chipperfield intervention.",
        bodyDe:
          "Der ruhigste der drei Chipperfield-Bauten auf der Museumsinsel. Weiß verputzt, präzise Öffnungen.",
        bodyEn:
          "The quietest of Chipperfield's three Museum Island buildings. White render, precise openings.",
        accessDe: "Programmabhängig - smb.museum.",
        accessEn: "Program-dependent - smb.museum.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kupfergraben_10_November_2013.jpg/1280px-Kupfergraben_10_November_2013.jpg",
      },
      {
        id: "d6-sauerbruch",
        nameDe: "Emnify / Sauerbruch Hutton Bauten",
        nameEn: "Emnify / Sauerbruch Hutton buildings",
        metaDe: "Louisa Hutton & Matthias Sauerbruch",
        metaEn: "Louisa Hutton & Matthias Sauerbruch",
        tag: "Sauerbruch Hutton",
        teaserDe:
          "Farbe als architektonisches System. Das Berliner Büro mit dem konsequentesten ästhetischen Eigensinn der Stadt.",
        teaserEn:
          "Colour as architectural system. Berlin's practice with the most consistent aesthetic identity.",
        bodyDe:
          "Das GSW-Hochhaus (1999) mit doppelter Fassade: Energie und changierendes Farbbild.",
        bodyEn:
          "GSW tower (1999) with double facade: energy performance and shifting colour.",
        accessDe: "Außenansicht jederzeit. Führungen über sauerbruchhutton.com.",
        accessEn: "Exterior anytime. Tours via sauerbruchhutton.com.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Berlin_GSW_dk3586.jpg/1280px-Berlin_GSW_dk3586.jpg",
      },
      {
        id: "d6-chip-campus",
        nameDe: "Chipperfield Campus Joachimstraße",
        nameEn: "Chipperfield campus Joachimstraße",
        metaDe: "David Chipperfield Architects",
        metaEn: "David Chipperfield Architects",
        tag: "David Chipperfield Architects",
        teaserDe:
          "Das Büro als gebaute Aussage. Abschluss des Chipperfield-Fadens durch Tag 2, 4 und 6.",
        teaserEn:
          "The office as built statement. Closing the Chipperfield thread across days 2, 4 and 6.",
        bodyDe:
          "Ensemble aus Berliner Altbauten, behutsam zusammengefügt. Die Haltung vor dem Projekt.",
        bodyEn:
          "Ensemble of Berlin period buildings, carefully joined. Attitude before project.",
        accessDe: "Büro, kein öffentlicher Zugang. Außenansicht jederzeit.",
        accessEn: "Office, no public access. Exterior anytime.",
        photo:
          "https://live.staticflickr.com/65535/50185101993_3b73d38264_b.jpg",
      },
      {
        id: "d6-reichstag-end",
        nameDe: "Reichstag · Abschluss (optional)",
        nameEn: "Reichstag · closing (optional)",
        metaDe: "Norman Foster · 1999 · Optional",
        metaEn: "Norman Foster · 1999 · Optional",
        tag: "Norman Foster · 1999 · Optional",
        teaserDe:
          "Von der Kuppel aus ist die gesamte Geografie der Tour sichtbar.",
        teaserEn:
          "From the dome, the entire geography of the tour is visible.",
        bodyDe:
          "Tiergarten, Spreebogen, Potsdamer Platz, Unter den Linden, Karl-Marx-Allee: Berlin als Karte der eigenen Woche.",
        bodyEn:
          "Tiergarten, Spreebogen, Potsdamer Platz, Unter den Linden, Karl-Marx-Allee: Berlin as a map of your week.",
        accessDe: "Voranmeldung: besucherservice.bundestag.de.",
        accessEn: "Register: besucherservice.bundestag.de.",
        photo:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Berlin_Reichstag_Building_%28Ank_Kumar%29_07.jpg/1280px-Berlin_Reichstag_Building_%28Ank_Kumar%29_07.jpg",
      },
    ],
  },
];

const CSS = `/* berlin arch tour — bündig mit .nav__inner / .hero__grid (styles.css) */
body.bat-page{--bat-black:#0d0d0d;--bat-white:#fff;--bat-red:#c8312a}
body.bat-page.en .de-t,body.bat-page.de .en-t{display:none}
.bat-shell{box-sizing:border-box;width:100%;max-width:var(--content-max);margin-left:auto;margin-right:auto;padding-left:var(--nav-pad-x);padding-right:var(--nav-pad-x)}
.bat-hero{position:relative;min-height:min(88vh,720px);display:flex;align-items:flex-end;background:var(--bat-black);color:var(--bat-white);overflow:hidden}
.bat-hero__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.22}
.bat-hero__lang-wrap{position:absolute;top:0;left:0;right:0;z-index:2;display:flex;justify-content:flex-end;padding-top:clamp(14px,2.5vw,22px)}
.bat-hero__lang-wrap .bat-lang{border-color:rgba(255,255,255,.32)}
.bat-hero__lang-wrap .bat-lang button{color:rgba(255,255,255,.88)}
.bat-hero__lang-wrap .bat-lang button.is-active{background:var(--bat-white);color:var(--bat-black)}
.bat-hero__shell{position:relative;z-index:1;width:100%;padding:clamp(48px,8vw,96px) 0 clamp(32px,5vw,56px)}
.bat-hero__inner{width:100%;min-width:0}
.bat-hero__eyebrow{font-size:11px;letter-spacing:.15em;text-transform:uppercase;opacity:.7;margin:0 0 12px}
.bat-hero__title{margin:0;width:100%;max-width:100%;font-size:clamp(2rem,min(11.5vw,9.2cqw),4.85rem);font-weight:200;line-height:.92;letter-spacing:-.02em;text-transform:uppercase}
.bat-hero__title-line{display:block}
.bat-hero__title-line--strong{font-weight:700}
.bat-hero__sub{margin:20px 0 0;max-width:36rem;font-size:clamp(.95rem,1.6vw,1.15rem);line-height:1.5;opacity:.88}
.bat-hero__meta{display:flex;flex-wrap:wrap;gap:clamp(16px,3vw,32px);margin-top:28px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.65}
.bat-day-strip{padding:clamp(18px,3vw,28px) 0 clamp(22px,3.5vw,32px);background:var(--bg);border-bottom:1px solid rgba(13,13,13,.08)}
.bat-day-strip__days{display:flex;flex-wrap:wrap;gap:0;row-gap:4px}
.bat-day-strip a{display:block;padding:8px 20px 8px 0;font-size:10px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;color:var(--text);opacity:.5;border-bottom:2px solid transparent;white-space:nowrap}
.bat-day-strip a:last-child{padding-right:0}
.bat-day-strip a:hover,.bat-day-strip a.is-active{opacity:1}
.bat-day-strip a.is-active{border-bottom-color:var(--bat-red);font-weight:600}
.bat-intro{padding:clamp(36px,6vw,64px) 0 clamp(48px,8vw,80px)}
.bat-intro p{margin:0 0 1.2em;max-width:720px;font-size:15px;line-height:1.75}
.bat-lang{display:flex;flex-shrink:0;border:1px solid rgba(13,13,13,.2);border-radius:999px;overflow:hidden}
.bat-lang button{border:none;background:transparent;padding:6px 12px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;font-family:inherit;color:var(--text)}
.bat-lang button.is-active{background:var(--bat-black);color:var(--bat-white)}
.bat-day{background:var(--bat-black);color:var(--bat-white);padding:0 0 clamp(40px,6vw,64px);scroll-margin-top:5rem}
.bat-day__header{padding:clamp(36px,5vw,56px) 0 clamp(24px,3vw,32px);display:grid;gap:12px}
@media(min-width:761px){.bat-day__header{grid-template-columns:auto 1fr;gap:24px 40px;align-items:end}}
.bat-day__num{font-size:clamp(3rem,8vw,5rem);font-weight:200;line-height:1;opacity:.35;margin:0}
.bat-day__title{margin:0;font-size:clamp(2.2rem,5vw,4.4rem);font-weight:200;line-height:1.02;letter-spacing:-.01em;text-transform:uppercase}
.bat-day__title strong{font-weight:700}
.bat-day__meta{font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.55;margin:0}
.bat-day__route{font-size:13.5px;line-height:1.6;opacity:.68;margin:8px 0 0;max-width:40rem}
.bat-stops{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:clamp(16px,2.5vw,24px);padding:0 0 clamp(32px,4vw,48px)}
.bat-stop{display:flex;flex-direction:column;align-items:stretch;width:100%;border:none;background:rgba(255,255,255,.04);padding:0;margin:0;text-align:left;cursor:pointer;font-family:inherit;color:inherit;border-radius:4px;overflow:hidden;transition:background .15s;-webkit-appearance:none;appearance:none;line-height:1.5}
.bat-stop:hover,.bat-stop:focus-visible{background:rgba(255,255,255,.08);outline:none}
.bat-stop__img-wrap{position:relative;display:block;width:100%;height:192px;min-height:192px;margin:0;padding:0;line-height:0;font-size:0;background:rgba(255,255,255,.06);overflow:hidden;flex-shrink:0}
body.bat-page .bat-stop__img-wrap img.bat-stop__img{position:absolute;top:0;left:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;border-radius:0;object-fit:cover;object-position:top center;display:block}
.bat-stop__ph{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:20px;text-align:center;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.45;background:rgba(255,255,255,.06)}
.bat-stop__body{padding:16px 18px 20px}
.bat-stop__tag{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--bat-red);margin:0 0 8px}
.bat-stop__name{margin:0 0 8px;font-size:17px;font-weight:500;color:var(--bat-white)}
.bat-stop__teaser{margin:0;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.68)}
.bat-dining{padding:0 0 clamp(32px,4vw,48px);display:grid;gap:16px}
@media(min-width:640px){.bat-dining{grid-template-columns:1fr 1fr;gap:24px}}
.bat-dining__item{padding:18px 20px;border:1px solid rgba(255,255,255,.12);border-radius:4px}
.bat-dining__label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--bat-red);margin:0 0 8px}
.bat-dining__text{margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.72)}
.bat-interlude{background:var(--bg);color:var(--text);padding:clamp(32px,5vw,48px) var(--nav-pad-x);text-align:center;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.7}
.bat-modal{position:fixed;inset:0;z-index:200;display:none;align-items:flex-end;justify-content:center;padding:0}
.bat-modal.is-open{display:flex}
.bat-modal__backdrop{position:absolute;inset:0;background:rgba(13,13,13,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.bat-modal__panel{position:relative;z-index:1;width:min(680px,100%);max-height:92vh;overflow-y:auto;background:var(--bat-black);color:var(--bat-white);border-radius:12px 12px 0 0;margin:0}
@media(min-width:640px){.bat-modal{align-items:center;padding:24px}.bat-modal__panel{border-radius:12px;max-height:88vh}}
.bat-modal__img{width:100%;height:272px;max-width:none;max-height:none;object-fit:cover;object-position:center;display:block;background:rgba(255,255,255,.08)}
.bat-modal__ph{display:none;height:272px;align-items:center;justify-content:center;font-size:14px;letter-spacing:.1em;text-transform:uppercase;opacity:.45}
.bat-modal__inner{padding:clamp(20px,4vw,32px)}
.bat-modal__close{position:absolute;top:12px;right:12px;z-index:2;width:40px;height:40px;border:none;border-radius:50%;background:rgba(0,0,0,.5);color:var(--bat-white);font-size:20px;cursor:pointer}
.bat-modal__tag{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--bat-red);margin:0 0 8px}
.bat-modal__title{margin:0 0 6px;font-size:clamp(1.4rem,3vw,1.8rem);font-weight:500}
.bat-modal__meta{margin:0 0 20px;font-size:12px;opacity:.55;letter-spacing:.04em}
.bat-modal__body{margin:0 0 20px;font-size:14.5px;line-height:1.84;color:rgba(255,255,255,.72)}
.bat-modal__story{margin:0 0 20px;padding:16px 18px;border-left:3px solid var(--bat-red);background:rgba(255,255,255,.04);font-size:14px;line-height:1.7;color:rgba(255,255,255,.88)}
.bat-modal__story strong{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--bat-red);margin-bottom:8px;font-weight:600}
.bat-modal__access{margin:0;font-size:13px;line-height:1.65;color:rgba(255,255,255,.55)}
.bat-modal__access strong{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;color:rgba(255,255,255,.75)}
@supports (container-type: inline-size){.bat-hero__inner{container-type:inline-size}}
@media(max-width:640px){.bat-stops{grid-template-columns:1fr}.bat-hero__title{font-size:clamp(1.85rem,10.5vw,3.1rem)}}`;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function imgBlock(photo, name, clsImg, clsPh) {
  if (photo) {
    return `<img class="${clsImg}" src="${esc(photo)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.style.display='flex'"><div class="${clsPh}" aria-hidden="true">${esc(name)}</div>`;
  }
  return `<div class="${clsPh}" style="display:flex" aria-hidden="true">${esc(name)}</div>`;
}

function buildHtml(heroImg) {
let daysHtml = "";
for (const day of DAYS) {
  const stopsHtml = day.stops
    .map(
      (s) => `
    <button type="button" class="bat-stop" data-stop-id="${esc(s.id)}" aria-label="${esc(s.nameDe)}">
      <div class="bat-stop__img-wrap">
        ${imgBlock(s.photo, s.nameDe, "bat-stop__img", "bat-stop__ph")}
      </div>
      <div class="bat-stop__body">
        <p class="bat-stop__tag">${esc(s.tag)}</p>
        <h3 class="bat-stop__name"><span class="de-t">${esc(s.nameDe)}</span><span class="en-t">${esc(s.nameEn)}</span></h3>
        <p class="bat-stop__teaser"><span class="de-t">${esc(s.teaserDe)}</span><span class="en-t">${esc(s.teaserEn)}</span></p>
      </div>
    </button>`
    )
    .join("");

  daysHtml += `
  <section class="bat-day" id="day-${day.id}" data-day="${day.id}">
    <header class="bat-day__header bat-shell">
      <p class="bat-day__num">${String(day.id).padStart(2, "0")}</p>
      <div>
        <h2 class="bat-day__title"><span class="de-t">${esc(day.themeDe)}</span><span class="en-t">${esc(day.themeEn)}</span></h2>
        <p class="bat-day__meta"><span class="de-t">${esc(day.eraDe)}</span><span class="en-t">${esc(day.eraEn)}</span></p>
        <p class="bat-day__route"><span class="de-t">${esc(day.routeDe)}</span><span class="en-t">${esc(day.routeEn)}</span></p>
      </div>
    </header>
    <div class="bat-shell">
      <div class="bat-stops">${stopsHtml}</div>
      <div class="bat-dining">
        <div class="bat-dining__item">
          <p class="bat-dining__label"><span class="de-t">Mittagessen</span><span class="en-t">Lunch</span></p>
          <p class="bat-dining__text"><span class="de-t">${esc(day.lunchDe)}</span><span class="en-t">${esc(day.lunchEn)}</span></p>
        </div>
        <div class="bat-dining__item">
          <p class="bat-dining__label"><span class="de-t">Abendessen</span><span class="en-t">Dinner</span></p>
          <p class="bat-dining__text"><span class="de-t">${esc(day.dinnerDe)}</span><span class="en-t">${esc(day.dinnerEn)}</span></p>
        </div>
      </div>
    </div>
  </section>`;
}

const dayNavHtml = DAYS.map(
  (d) =>
    `<a href="#day-${d.id}" data-day-link="${d.id}"><span class="de-t">Tag ${d.id}</span><span class="en-t">Day ${d.id}</span></a>`
).join("");

const totalStops = DAYS.reduce((n, d) => n + d.stops.length, 0);

return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Berlin Architecture Tour | FRIDAY CIRCLE</title>
<meta name="description" content="Sechs Tage Architektur durch Berlin - kuratierte Studienreise von Friday Circle. ${totalStops} Projekte, 1920 bis heute.">
<meta property="og:title" content="Berlin Architecture Tour">
<meta property="og:description" content="Sechs Tage Architektur durch Berlin. Geografische Route, DE/EN.">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<style>${CSS}</style>
</head>
<body class="de bat-page">
<div id="fc-site-header"></div>

<section class="bat-hero" aria-labelledby="bat-hero-title">
  <img class="bat-hero__img" src="${heroImg}" alt="" decoding="async">
  <div class="bat-hero__lang-wrap bat-shell">
    <div class="bat-lang" role="group" aria-label="Sprache">
      <button type="button" class="is-active" data-lang="de">DE</button>
      <button type="button" data-lang="en">EN</button>
    </div>
  </div>
  <div class="bat-hero__shell bat-shell">
    <div class="bat-hero__inner">
      <p class="bat-hero__eyebrow"><span class="de-t">Studienreise · Berlin</span><span class="en-t">Study trip · Berlin</span></p>
      <h1 id="bat-hero-title" class="bat-hero__title">
        <span class="bat-hero__title-line">Berlin</span>
        <span class="bat-hero__title-line bat-hero__title-line--strong">Architecture</span>
      </h1>
      <p class="bat-hero__sub">
        <span class="de-t">Eine Route durch die Stadt nach Geografie, nicht nach Chronologie. Epochen als Kontext, Kontraste als Methode.</span>
        <span class="en-t">A route through the city by geography, not chronology. Eras as context, contrasts as method.</span>
      </p>
      <div class="bat-hero__meta">
        <span><span class="de-t">6 Tage</span><span class="en-t">6 days</span></span>
        <span>${totalStops} <span class="de-t">Projekte</span><span class="en-t">projects</span></span>
        <span>1920–2024</span>
      </div>
    </div>
  </div>
</section>

<nav class="bat-day-strip bat-shell" aria-label="Tage">
  <div class="bat-day-strip__days">${dayNavHtml}</div>
</nav>

<section class="bat-intro bat-shell" aria-label="Einleitung">
  <p class="de-t">Die Tour folgt der Stadt geografisch. Vor- und Rückgriffe zwischen Perioden sind Teil der Logik: Das Olympiastadion und die Unité d'Habitation liegen in Westend nebeneinander und gehören deshalb auf Tag 1, nicht auf einen eigenen Nachkrieg-Tag.</p>
  <p class="en-t">The tour follows the city geographically. Leaps between periods are part of the logic: the Olympic Stadium and the Unité d'Habitation sit side by side in Westend and belong on Day 1, not on a separate post-war day.</p>
  <p class="de-t">Jedes Projekt hat einen Teaser, einen Fließtext, optional eine Story und praktische Zugangshinweise. Klick auf eine Karte öffnet das Detail.</p>
  <p class="en-t">Each project has a teaser, full text, optional story and practical access notes. Click a card to open detail.</p>
</section>

<main>${daysHtml}</main>

<div id="fc-site-footer"></div>

<div class="bat-modal" id="bat-modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="bat-modal-title">
  <div class="bat-modal__backdrop" data-close-modal></div>
  <div class="bat-modal__panel">
    <button type="button" class="bat-modal__close" data-close-modal aria-label="Schließen">✕</button>
    <div id="bat-modal-media"></div>
    <div class="bat-modal__inner" id="bat-modal-content"></div>
  </div>
</div>

<script>
const TOUR = ${JSON.stringify(DAYS)};
let lang = 'de';
let openId = null;

function findStop(id) {
  for (const day of TOUR) {
    const s = day.stops.find(x => x.id === id);
    if (s) return s;
  }
  return null;
}

function setLang(next) {
  lang = next;
  document.body.classList.toggle('en', next === 'en');
  document.body.classList.toggle('de', next === 'de');
  document.documentElement.lang = next;
  document.querySelectorAll('.bat-lang button').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.lang === next);
  });
  if (openId) renderModal(openId);
}

function renderModal(id) {
  const s = findStop(id);
  if (!s) return;
  const media = document.getElementById('bat-modal-media');
  const content = document.getElementById('bat-modal-content');
  const name = lang === 'en' ? s.nameEn : s.nameDe;
  const body = lang === 'en' ? s.bodyEn : s.bodyDe;
  const access = lang === 'en' ? s.accessEn : s.accessDe;
  const story = lang === 'en' ? (s.storyEn || '') : (s.storyDe || '');
  const storyLabel = lang === 'en' ? 'Story' : 'Story';
  const accessLabel = lang === 'en' ? 'Access' : 'Zugang';

  if (s.photo) {
    media.innerHTML = '<img class="bat-modal__img" src="' + s.photo.replace(/"/g,'&quot;') + '" alt="" onerror="this.hidden=true;this.nextElementSibling.style.display=\\'flex\\'"><div class="bat-modal__ph" aria-hidden="true">' + name.replace(/</g,'&lt;') + '</div>';
  } else {
    media.innerHTML = '<div class="bat-modal__ph" style="display:flex" aria-hidden="true">' + name.replace(/</g,'&lt;') + '</div>';
  }

  let storyHtml = '';
  if (story && story.trim()) {
    const parts = story.split(' - ');
    const head = parts[0] || 'Story';
    const rest = parts.slice(1).join(' - ') || story;
    storyHtml = '<div class="bat-modal__story"><strong>' + head.replace(/</g,'&lt;') + '</strong>' + rest.replace(/</g,'&lt;') + '</div>';
  }

  content.innerHTML =
    '<p class="bat-modal__tag">' + (s.tag || '').replace(/</g,'&lt;') + '</p>' +
    '<h2 class="bat-modal__title" id="bat-modal-title">' + name.replace(/</g,'&lt;') + '</h2>' +
    '<p class="bat-modal__meta">' + (lang === 'en' ? s.metaEn : s.metaDe).replace(/</g,'&lt;') + '</p>' +
    '<p class="bat-modal__body">' + body.replace(/</g,'&lt;') + '</p>' +
    storyHtml +
    '<p class="bat-modal__access"><strong>' + accessLabel + '</strong>' + access.replace(/</g,'&lt;') + '</p>';
}

function openModal(id) {
  openId = id;
  renderModal(id);
  const modal = document.getElementById('bat-modal');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  openId = null;
  const modal = document.getElementById('bat-modal');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.bat-stop').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.stopId));
});

document.querySelectorAll('[data-close-modal]').forEach(el => {
  el.addEventListener('click', closeModal);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.querySelectorAll('.bat-lang button').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

const daySections = document.querySelectorAll('.bat-day');
const dayLinks = document.querySelectorAll('[data-day-link]');
if ('IntersectionObserver' in window && daySections.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.day;
        dayLinks.forEach(a => a.classList.toggle('is-active', a.dataset.dayLink === id));
      }
    });
  }, { threshold: 0.25, rootMargin: '-120px 0px -40% 0px' });
  daySections.forEach(sec => io.observe(sec));
}

if (location.search.includes('lang=en')) setLang('en');
</script>
<script src="nav.js" defer></script>
</body>
</html>`;
}

async function main() {
  const heroImg = await localizeTourImages();
  const html = buildHtml(heroImg);
  writeFileSync(outPath, html, "utf8");
  console.log("Wrote", outPath, "(" + html.length + " bytes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
