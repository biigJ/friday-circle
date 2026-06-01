#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PHOTO_BY_STOP, NEW_STOPS_META, DINING_PHOTOS } from "./berlin-arch-tour-photos.mjs";
import {
  DAY_LAYOUT,
  EXTRA_STOPS,
  STOP_OVERRIDES,
  LABELS_BY_ID,
  LABEL_DEFS,
  LABEL_ORDER,
  DEFAULT_DINING,
  DINING_BY_DAY,
} from "./berlin-arch-tour-layout.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outPath = join(rootDir, "berlinarchtour.html");
const imgDir = join(rootDir, "assets", "berlin-arch-tour");

const HERO_LOCAL_SRC = join(rootDir, "assets", "neuenationalgalerie.jpeg");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadImage(url, destPath, optional = false) {
  if (existsSync(destPath)) return true;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "FridayCircleBot/1.0 (friday-circle static build)" },
      redirect: "follow",
    });
    if (res.ok) {
      writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
      await sleep(1200);
      return true;
    }
    if (res.status === 429 && attempt < 4) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    if (optional) return false;
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  if (optional) return false;
  throw new Error(`Download failed: ${url}`);
}

function assetPath(filename) {
  return `assets/berlin-arch-tour/${filename}`;
}

function applyLocalPhotoCatalog() {
  for (const day of DAYS) {
    for (const stop of day.stops) {
      const files = PHOTO_BY_STOP[stop.id];
      if (!files?.length) continue;
      stop.photo = assetPath(files[0]);
      stop.gallery = files.length > 1 ? files.slice(1).map(assetPath) : undefined;
    }
    for (const [key, filename] of Object.entries(DINING_PHOTOS)) {
      const [dayId, mealKey] = key.split("-");
      const d = DAYS.find((x) => String(x.id) === dayId);
      if (d?.[mealKey] && filename) d[mealKey].photo = assetPath(filename);
    }
  }

  for (const meta of NEW_STOPS_META) {
    const day = DAYS.find((d) => d.id === meta.dayId);
    const files = PHOTO_BY_STOP[meta.id];
    if (!day || !files?.length) continue;
    day.stops.push({
      id: meta.id,
      nameDe: meta.nameDe,
      nameEn: meta.nameEn,
      metaDe: meta.metaDe || `${meta.districtDe} · Berlin`,
      metaEn: meta.metaEn || `${meta.districtDe} · Berlin`,
      tag: meta.tag,
      teaserDe: meta.teaserDe,
      teaserEn: meta.teaserEn,
      bodyDe: meta.bodyDe || meta.teaserDe,
      bodyEn: meta.bodyEn || meta.teaserEn,
      accessDe: meta.accessDe || "Von außen zugänglich, sofern nicht anders angegeben.",
      accessEn: meta.accessEn || "Accessible from outside unless noted otherwise.",
      photo: assetPath(files[0]),
      gallery: files.length > 1 ? files.slice(1).map(assetPath) : undefined,
    });
  }
}

async function localizeTourImages() {
  mkdirSync(imgDir, { recursive: true });
  applyLocalPhotoCatalog();
  const heroPath = join(imgDir, "hero.jpg");
  if (existsSync(HERO_LOCAL_SRC)) {
    copyFileSync(HERO_LOCAL_SRC, heroPath);
  }
  const heroLocal = "assets/berlin-arch-tour/hero.jpg";

  const skipDownload = process.env.BAT_SKIP_DOWNLOAD === "1";

  for (const day of DAYS) {
    for (const stop of day.stops) {
      if (!stop.photo || stop.photo.startsWith("assets/")) continue;
      if (skipDownload) {
        const dest = join(imgDir, `${stop.id}.jpg`);
        if (existsSync(dest)) stop.photo = `assets/berlin-arch-tour/${stop.id}.jpg`;
        continue;
      }
      const dest = join(imgDir, `${stop.id}.jpg`);
      await downloadImage(stop.photo, dest);
      stop.photo = `assets/berlin-arch-tour/${stop.id}.jpg`;
    }
    for (const key of ["lunch", "dinner"]) {
      const meal = day[key];
      if (!meal?.photo || meal.photo.startsWith("assets/")) continue;
      if (skipDownload) continue;
      const dest = join(imgDir, `dining-d${day.id}-${key}.jpg`);
      const ok = await downloadImage(meal.photo, dest, true);
      if (ok) meal.photo = `assets/berlin-arch-tour/dining-d${day.id}-${key}.jpg`;
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
    lunch: {
      nameDe: "Wirtshaus Schildhorn",
      nameEn: "Wirtshaus Schildhorn",
      bodyDe:
        "Am Schildhorn, Zehlendorf. Historisches Ausflugslokal direkt am Havel-Ufer, seit 1842. Klassische Berliner Küche, Gartenrestaurant.",
      bodyEn:
        "Am Schildhorn, Zehlendorf. Historic excursion inn on the Havel since 1842. Classic Berlin cuisine, garden restaurant.",
      url: "https://www.wirtshaus-schildhorn.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Berlin_-_Havel_-_Schildhorn_%282%29.jpg/1280px-Berlin_-_Havel_-_Schildhorn_%282%29.jpg",
    },
    dinner: {
      nameDe: "Café Hardenberg",
      nameEn: "Café Hardenberg",
      bodyDe: "Hardenbergstraße, Charlottenburg. Günstig, solid, neben der TU Berlin.",
      bodyEn: "Hardenbergstraße, Charlottenburg. Affordable, solid, next to TU Berlin.",
      url: "https://www.cafe-hardenberg.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Berlin_Charlottenburg_Technische_Universit%C3%A4t_Ehrenhof.jpg/1280px-Berlin_Charlottenburg_Technische_Universit%C3%A4t_Ehrenhof.jpg",
    },
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
    lunch: {
      nameDe: "Café Moskau",
      nameEn: "Café Moskau",
      bodyDe: "Karl-Marx-Allee 34. Josef Kaiser, 1964. Elegantes DDR-Modernes Gebäude auf der Allee selbst.",
      bodyEn: "Karl-Marx-Allee 34. Josef Kaiser, 1964. Elegant GDR modern building on the boulevard.",
      url: "https://www.cafemoskau.com/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Caf%C3%A9_Moskau_Berlin.jpg/1280px-Caf%C3%A9_Moskau_Berlin.jpg",
    },
    dinner: {
      nameDe: "Pauly Saal",
      nameEn: "Pauly Saal",
      bodyDe: "Auguststraße 11–13, Mitte. Im ehemaligen Gemeindehaus der Jüdischen Mädchenschule.",
      bodyEn: "Auguststraße 11–13, Mitte. In the former Jewish girls' school community house.",
      url: "https://www.pauly-saal.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Berlin-Mitte_Auguststra%C3%9Fe_J%C3%BCdische_M%C3%A4dchenschule.jpg/1280px-Berlin-Mitte_Auguststra%C3%9Fe_J%C3%BCdische_M%C3%A4dchenschule.jpg",
    },
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
    lunch: {
      nameDe: "Sale e Tabacchi",
      nameEn: "Sale e Tabacchi",
      bodyDe: "Rudi-Dutschke-Straße 23, Kreuzberg. Klassisch italienisch, nahe allen Projekten des Tages.",
      bodyEn: "Rudi-Dutschke-Straße 23, Kreuzberg. Classic Italian, near all projects of the day.",
      url: "https://www.saleetabacchi.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Berlin_Kreuzberg_Rudi-Dutschke-Stra%C3%9Fe.jpg/1280px-Berlin_Kreuzberg_Rudi-Dutschke-Stra%C3%9Fe.jpg",
    },
    dinner: {
      nameDe: "Clärchens Ballhaus",
      nameEn: "Clärchens Ballhaus",
      bodyDe: "Auguststraße 24, Mitte. Tanzsaal von 1913. Weimarer Republik, DDR, Wende.",
      bodyEn: "Auguststraße 24, Mitte. Dance hall from 1913. Weimar, GDR, reunification.",
      url: "https://www.claerchensballhaus.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Cl%C3%A4rchens_Ballhaus_Berlin.jpg/1280px-Cl%C3%A4rchens_Ballhaus_Berlin.jpg",
    },
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
    lunch: {
      nameDe: "Borchardt",
      nameEn: "Borchardt",
      bodyDe: "Französische Straße 47, Mitte. Historischer Gründerzeit-Saal.",
      bodyEn: "Französische Straße 47, Mitte. Historic Wilhelmine dining room.",
      url: "https://www.borchardt-restaurant.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Borchardt_Berlin.jpg/1280px-Borchardt_Berlin.jpg",
    },
    dinner: {
      nameDe: "Lutter & Wegner",
      nameEn: "Lutter & Wegner",
      bodyDe: "Charlottenstraße 56, Mitte. Weinrestaurant seit 1811.",
      bodyEn: "Charlottenstraße 56, Mitte. Wine restaurant since 1811.",
      url: "https://www.lutter-wegner.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lutter_%26_Wegner_Berlin.jpg/1280px-Lutter_%26_Wegner_Berlin.jpg",
    },
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
    lunch: {
      nameDe: "Café Moskau",
      nameEn: "Café Moskau",
      bodyDe: "Karl-Marx-Allee 34, Friedrichshain.",
      bodyEn: "Karl-Marx-Allee 34, Friedrichshain.",
      url: "https://www.cafemoskau.com/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Caf%C3%A9_Moskau_Berlin.jpg/1280px-Caf%C3%A9_Moskau_Berlin.jpg",
    },
    dinner: {
      nameDe: "Pauly Saal",
      nameEn: "Pauly Saal",
      bodyDe: "Auguststraße 11–13, Mitte.",
      bodyEn: "Auguststraße 11–13, Mitte.",
      url: "https://www.pauly-saal.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Berlin-Mitte_Auguststra%C3%9Fe_J%C3%BCdische_M%C3%A4dchenschule.jpg/1280px-Berlin-Mitte_Auguststra%C3%9Fe_J%C3%BCdische_M%C3%A4dchenschule.jpg",
    },
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
    lunch: {
      nameDe: "Café im Zeughaus",
      nameEn: "Café im Zeughaus",
      bodyDe: "Unter den Linden 2 (DHM).",
      bodyEn: "Unter den Linden 2 (German Historical Museum).",
      url: "https://www.dhm.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Zeughaus_Berlin.jpg/1280px-Zeughaus_Berlin.jpg",
    },
    dinner: {
      nameDe: "Lutter & Wegner",
      nameEn: "Lutter & Wegner",
      bodyDe: "Charlottenstraße 56, Mitte.",
      bodyEn: "Charlottenstraße 56, Mitte.",
      url: "https://www.lutter-wegner.de/",
      photo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lutter_%26_Wegner_Berlin.jpg/1280px-Lutter_%26_Wegner_Berlin.jpg",
    },
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
.bat-hero__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1}
.bat-hero__shell{position:relative;z-index:1;width:100%;padding:clamp(48px,8vw,96px) 0 clamp(32px,5vw,56px)}
.bat-hero__inner{width:100%;min-width:0}
.bat-hero__eyebrow{font-size:11px;letter-spacing:.15em;text-transform:uppercase;opacity:.7;margin:0 0 12px;text-shadow:0 1px 10px rgba(0,0,0,.5),0 0 1px rgba(0,0,0,.85)}
.bat-hero__title{margin:0;width:100%;max-width:100%;font-size:clamp(2rem,min(11.5vw,9.2cqw),4.85rem);font-weight:200;line-height:.92;letter-spacing:-.02em;text-transform:uppercase;text-shadow:0 2px 18px rgba(0,0,0,.55),0 0 2px rgba(0,0,0,.9)}
.bat-hero__title-line{display:block}
.bat-hero__title-line--strong{font-weight:700}
.bat-hero__sub{margin:20px 0 0;max-width:39.5rem;font-size:clamp(.95rem,1.6vw,1.15rem);line-height:1.5;opacity:.88;text-shadow:0 1px 10px rgba(0,0,0,.5),0 0 1px rgba(0,0,0,.85)}
.bat-hero__meta{display:flex;flex-wrap:wrap;gap:clamp(16px,3vw,32px);margin-top:28px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.65;text-shadow:0 1px 8px rgba(0,0,0,.5),0 0 1px rgba(0,0,0,.85)}
.bat-tour-intro{position:sticky;top:var(--bat-sticky-top,72px);z-index:90;width:100%;background:var(--bg);padding-bottom:clamp(16px,2.5vw,24px);border-bottom:1px solid rgba(13,13,13,.06);box-sizing:border-box}
.bat-tour-intro__inner{width:100%;max-width:var(--content-max);margin-left:auto;margin-right:auto;padding-left:var(--nav-pad-x);padding-right:var(--nav-pad-x);box-sizing:border-box}
.bat-day-strip{padding:clamp(18px,3vw,28px) 0 clamp(14px,2vw,18px);background:transparent}
.bat-day-strip__days{display:flex;flex-wrap:nowrap;gap:clamp(10px,1.4vw,18px);overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.bat-day-strip__days::-webkit-scrollbar{display:none}
.bat-day-strip a{display:block;padding:0;font-size:clamp(8.5px,0.72vw,10px);letter-spacing:.04em;text-transform:none;text-decoration:none;color:var(--text);opacity:1;border-bottom:none;white-space:nowrap;font-weight:400;line-height:1.25;flex-shrink:0}
.bat-day-strip a:hover,.bat-day-strip a.is-active{font-weight:600}
.bat-day-strip a.is-active{text-decoration:underline;text-underline-offset:.22em}
.bat-intro{padding:0 0 clamp(10px,1.6vw,14px)}
.bat-intro p{margin:0;max-width:720px;font-size:13.5px;line-height:1.45;font-weight:300;color:color-mix(in srgb,var(--text) 68%,transparent);letter-spacing:.01em}
.bat-label-filter{display:flex;justify-content:center;flex-wrap:wrap;gap:clamp(6px,1.2vw,10px);padding:clamp(4px,1vw,8px) 0 0}
.bat-label-filter__btn{margin:0;padding:5px 10px;border:none;border-radius:2px;font-family:var(--font-sans);font-size:10px;font-weight:400;letter-spacing:.08em;line-height:1.2;cursor:pointer;transition:opacity .2s ease,transform .15s ease}
.bat-label-filter__btn.is-on{opacity:1}
.bat-label-filter__btn.is-off{opacity:.32}
.bat-label-filter__btn:hover,.bat-label-filter__btn:focus-visible{transform:translateY(-1px);outline:none}
.bat-label-filter__btn.is-off:hover,.bat-label-filter__btn.is-off:focus-visible{opacity:.5}
.bat-label-filter__btn--privat.is-off{box-shadow:inset 0 0 0 1px rgba(13,13,13,.22)}
.bat-stop.is-filter-hidden{display:none!important}
.bat-lang{display:flex;flex-shrink:0;border:1px solid rgba(13,13,13,.2);border-radius:999px;overflow:hidden}
.bat-lang button{border:none;background:transparent;padding:6px 12px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;font-family:inherit;color:var(--text)}
.bat-lang button.is-active{background:var(--bat-black);color:var(--bat-white)}
.bat-day{background:var(--bat-black);color:var(--bat-white);padding:0 0 clamp(40px,6vw,64px);scroll-margin-top:var(--bat-day-scroll-margin,220px)}
.bat-day__header{padding:clamp(36px,5vw,56px) 0 clamp(24px,3vw,32px);display:grid;gap:12px}
@media(min-width:761px){.bat-day__header{grid-template-columns:auto 1fr;gap:24px 40px;align-items:center}}
.bat-day__num{font-size:clamp(3rem,8vw,5rem);font-weight:200;line-height:1;opacity:.42;color:rgba(255,255,255,.42);margin:0;align-self:center}
.bat-day__title{margin:0;font-size:clamp(2.2rem,5vw,4.4rem);font-weight:200;line-height:1.02;letter-spacing:-.01em;text-transform:uppercase}
.bat-day__title strong{font-weight:700}
.bat-day__meta{font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.55;margin:0}
.bat-day__route{font-size:13.5px;line-height:1.6;opacity:.68;margin:8px 0 0;max-width:40rem}
.bat-stops{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:clamp(16px,2.5vw,24px);row-gap:clamp(32px,5vw,48px);padding:0 0 clamp(32px,4vw,48px)}
@media(max-width:960px){.bat-stops{grid-template-columns:repeat(2,minmax(0,1fr))}}
.bat-stop{display:flex;flex-direction:column;align-items:stretch;width:100%;border:none;background:rgba(255,255,255,.04);padding:0;margin:0;text-align:left;cursor:pointer;font-family:inherit;color:inherit;border-radius:4px;overflow:hidden;transition:background .15s;-webkit-appearance:none;appearance:none;line-height:1.5}
.bat-stop:hover,.bat-stop:focus-visible{background:rgba(255,255,255,.08);outline:none}
.bat-stop__img-wrap{position:relative;display:block;width:100%;aspect-ratio:1/1;height:auto;min-height:0;margin:0;padding:0;line-height:0;font-size:0;background:rgba(255,255,255,.06);overflow:hidden;flex-shrink:0}
body.bat-page .bat-stop__img-wrap img.bat-stop__img{position:absolute;top:0;left:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;border-radius:0;object-fit:cover;object-position:top center;display:block}
.bat-stop__ph{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:20px;text-align:center;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.45;background:rgba(255,255,255,.06)}
.bat-stop__labels{position:absolute;top:8px;right:8px;z-index:2;display:flex;flex-direction:column;align-items:flex-end;gap:4px;pointer-events:none}
.bat-stop__label{display:block;padding:3px 7px;font-size:9px;font-weight:400;letter-spacing:.08em;line-height:1.2;text-transform:none;border-radius:2px;white-space:nowrap}
.bat-stop__body{padding:16px 18px 20px}
.bat-stop__tag{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--bat-red);margin:0 0 8px}
.bat-stop__name{margin:0 0 8px;font-size:17px;font-weight:500;color:var(--bat-white)}
.bat-stop__teaser{margin:0;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.68)}
.bat-dining{padding:0 0 clamp(32px,4vw,48px);display:grid;gap:16px}
@media(min-width:640px){.bat-dining{grid-template-columns:1fr 1fr;gap:24px}}
.bat-dining__card{display:flex;flex-direction:row;align-items:stretch;height:192px;min-height:192px;border:1px solid rgba(255,255,255,.12);border-radius:4px;overflow:hidden;background:rgba(255,255,255,.03)}
.bat-dining__body{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-start;padding:14px 16px 12px}
.bat-dining__label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--bat-red);margin:0 0 6px}
.bat-dining__name{margin:0 0 6px;font-size:15px;font-weight:500;line-height:1.25;color:var(--bat-white)}
.bat-dining__text{margin:0;font-size:13px;line-height:1.5;color:rgba(255,255,255,.72);overflow-wrap:anywhere;word-break:break-word}
.bat-dining__link{display:inline-block;margin-top:auto;padding-top:10px;font-size:12px;letter-spacing:.04em;color:var(--bat-red);text-decoration:none}
.bat-dining__link:hover,.bat-dining__link:focus-visible{text-decoration:underline}
.bat-dining__photo{position:relative;flex:0 0 192px;width:192px;height:192px;background:rgba(255,255,255,.06);overflow:hidden}
body.bat-page .bat-dining__photo img{position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;object-fit:cover;object-position:center;display:block}
.bat-interlude{background:var(--bg);color:var(--text);padding:clamp(32px,5vw,48px) var(--nav-pad-x);text-align:center;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.7}
.bat-modal{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:clamp(12px,3vw,24px)}
.bat-modal.is-open{display:flex}
.bat-modal__backdrop{position:absolute;inset:0;background:rgba(13,13,13,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.bat-modal__panel{position:relative;z-index:1;display:flex;flex-direction:column;width:min(560px,92vw);max-height:min(92vh,100%);overflow:hidden;background:var(--bat-black);color:var(--bat-white);border-radius:12px;margin:0}
#bat-modal-media{flex:0 0 auto;width:100%;overflow:hidden;background:var(--bat-black)}
.bat-modal__media-stack{width:100%}
.bat-modal__frame{position:relative;width:100%;aspect-ratio:5/3;overflow:hidden;background:var(--bat-black)}
.bat-modal__media-bound{position:absolute;inset:0;overflow:hidden}
.bat-modal__labels{position:absolute;bottom:8px;right:8px;z-index:4;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:0;pointer-events:none}
body.bat-page .bat-modal__media-bound img.bat-modal__img{max-width:none;max-height:none;width:100%;height:100%;object-fit:contain;object-position:center;display:block}
.bat-modal__gallery{position:absolute;inset:0;display:flex;flex-direction:column;background:transparent}
.bat-modal__gallery-track{position:absolute;inset:0;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.bat-modal__gallery-track::-webkit-scrollbar{display:none}
.bat-modal__gallery-slide{flex:0 0 100%;width:100%;height:100%;scroll-snap-align:start;scroll-snap-stop:always}
.bat-modal__gallery-nav{position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 8px;pointer-events:none;z-index:2}
.bat-modal__gallery-nav button{pointer-events:auto;width:40px;height:40px;border:none;border-radius:50%;background:rgba(0,0,0,.55);color:var(--bat-white);font-size:22px;line-height:1;cursor:pointer}
.bat-modal__gallery-dots{position:absolute;z-index:3;bottom:8px;left:50%;transform:translateX(-50%);display:flex;justify-content:center;gap:8px;margin:0;padding:0}
.bat-modal__gallery-dots button{width:7px;height:7px;padding:0;border:none;border-radius:50%;background:rgba(255,255,255,.35);cursor:pointer}
.bat-modal__gallery-dots button.is-active{background:var(--bat-red)}
.bat-modal__ph{position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:14px;letter-spacing:.1em;text-transform:uppercase;opacity:.45}
.bat-modal__inner{flex:1 1 auto;min-height:0;overflow-y:auto;padding:clamp(14px,2.4vw,20px) clamp(16px,3vw,24px);-webkit-overflow-scrolling:touch}
.bat-modal__close{position:absolute;top:10px;right:10px;z-index:6;width:36px;height:36px;border:none;border-radius:50%;background:rgba(0,0,0,.55);color:var(--bat-white);font-size:20px;line-height:1;cursor:pointer}
.bat-modal__tag{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--bat-red);margin:0 0 6px}
.bat-modal__title{margin:0 0 4px;font-size:clamp(1.05rem,2.6vw,1.35rem);font-weight:500;line-height:1.2}
.bat-modal__meta{margin:0 0 10px;font-size:11px;opacity:.55;letter-spacing:.04em}
.bat-modal__body{margin:0 0 12px;font-size:13px;line-height:1.65;color:rgba(255,255,255,.72)}
.bat-modal__story{margin:0 0 12px;padding:12px 14px;border-left:3px solid var(--bat-red);background:rgba(255,255,255,.04);font-size:12.5px;line-height:1.6;color:rgba(255,255,255,.88)}
.bat-modal__story strong{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--bat-red);margin-bottom:6px;font-weight:600}
.bat-modal__access{margin:0;font-size:12px;line-height:1.55;color:rgba(255,255,255,.55)}
.bat-modal__access strong{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;color:rgba(255,255,255,.75)}
@supports (container-type: inline-size){.bat-hero__inner{container-type:inline-size}}
@media(max-width:640px){.bat-stops{grid-template-columns:1fr}.bat-hero__title{font-size:clamp(1.85rem,10.5vw,3.1rem)}.bat-modal{padding:clamp(8px,2.5vw,16px)}.bat-modal__panel{width:min(560px,94vw);border-radius:8px}.bat-modal__close{top:8px;right:8px;width:32px;height:32px;font-size:18px}.bat-modal__labels{bottom:6px;right:6px}.bat-modal__gallery-nav button{width:34px;height:34px;font-size:18px}.bat-modal__gallery-dots{bottom:6px}}`;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function diningCard(meal, labelDe, labelEn) {
  const photoHtml = meal.photo
    ? `<img src="${esc(meal.photo)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true">`
    : "";
  return `<article class="bat-dining__card">
        <div class="bat-dining__body">
          <p class="bat-dining__label"><span class="de-t">${esc(labelDe)}</span><span class="en-t">${esc(labelEn)}</span></p>
          <h3 class="bat-dining__name"><span class="de-t">${esc(meal.nameDe)}</span><span class="en-t">${esc(meal.nameEn)}</span></h3>
          <p class="bat-dining__text"><span class="de-t">${esc(meal.bodyDe)}</span><span class="en-t">${esc(meal.bodyEn)}</span></p>
          <a class="bat-dining__link" href="${esc(meal.url)}" target="_blank" rel="noopener noreferrer"><span class="de-t">Website des Betreibers</span><span class="en-t">Venue website</span> →</a>
        </div>
        <div class="bat-dining__photo">${photoHtml}</div>
      </article>`;
}

function imgBlock(photo, name, clsImg, clsPh) {
  if (photo) {
    return `<img class="${clsImg}" src="${esc(photo)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.style.display='flex'"><div class="${clsPh}" aria-hidden="true">${esc(name)}</div>`;
  }
  return `<div class="${clsPh}" style="display:flex" aria-hidden="true">${esc(name)}</div>`;
}

function sortLabels(labels) {
  const order = new Map(LABEL_ORDER.map((k, i) => [k, i]));
  return [...labels].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
}

function normalizeLabels(labels) {
  const sorted = sortLabels(labels);
  if (!sorted.includes("brd")) return sorted;
  return sorted.filter((l) => l !== "vor1939");
}

function renderLabelFilter() {
  const buttons = LABEL_ORDER
    .filter((k) => LABEL_DEFS[k])
    .map((k) => {
      const def = LABEL_DEFS[k];
      return `<button type="button" class="bat-label-filter__btn is-on bat-label-filter__btn--${k}" data-label-filter="${k}" aria-pressed="true" style="background:${def.bg};color:${def.color}"><span class="de-t">${esc(def.de)}</span><span class="en-t">${esc(def.en)}</span></button>`;
    })
    .join("");
  return `<div class="bat-label-filter" role="group" aria-label="Labels filtern">${buttons}</div>`;
}

function buildHtml(heroImg) {
let daysHtml = "";
for (const day of DAYS) {
  const stopsHtml = day.stops
    .map(
      (s) => `
    <button type="button" class="bat-stop" data-stop-id="${esc(s.id)}" data-labels="${esc((s.labels || LABELS_BY_ID[s.id] || []).join(","))}" aria-label="${esc(s.nameDe)}">
      <div class="bat-stop__img-wrap">
        ${renderStopLabels(s)}
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
        ${day.eraDe ? `<p class="bat-day__meta"><span class="de-t">${esc(day.eraDe)}</span><span class="en-t">${esc(day.eraEn)}</span></p>` : ""}
        ${day.routeDe ? `<p class="bat-day__route"><span class="de-t">${esc(day.routeDe)}</span><span class="en-t">${esc(day.routeEn)}</span></p>` : ""}
      </div>
    </header>
    <div class="bat-shell">
      <div class="bat-stops">${stopsHtml}</div>
      <div class="bat-dining">
        ${diningCard(day.lunch, "Mittagessen", "Lunch")}
        ${diningCard(day.dinner, "Abendessen", "Dinner")}
      </div>
    </div>
  </section>`;
}

const dayNavHtml = DAYS.map(
  (d) =>
    `<a href="#day-${d.id}" data-day-link="${d.id}"><span class="de-t">${esc(d.navDe || `Tag ${d.id}`)}</span><span class="en-t">${esc(d.navEn || `Day ${d.id}`)}</span></a>`
).join("");

const totalStops = DAYS.reduce((n, d) => n + d.stops.length, 0);

return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Berlin Architecture Tour | FRIDAY CIRCLE</title>
<meta name="description" content="Sieben Tage Architektur durch Berlin - kuratierte Studienreise von Friday Circle. ${totalStops} Projekte, 1920 bis heute.">
<meta property="og:title" content="Berlin Architecture Tour">
<meta property="og:description" content="Sieben Tage Architektur durch Berlin. Geografische Route, DE/EN.">
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
  <div class="bat-hero__shell bat-shell">
    <div class="bat-hero__inner">
      <p class="bat-hero__eyebrow"><span class="de-t">Ausflugsziele in der Hauptstadt</span><span class="en-t">Excursions in the capital</span></p>
      <h1 id="bat-hero-title" class="bat-hero__title">
        <span class="bat-hero__title-line">Berlin</span>
        <span class="bat-hero__title-line bat-hero__title-line--strong">Architecture</span>
      </h1>
      <p class="bat-hero__sub">
        <span class="de-t">Eine Auswahl an gebauten Zeitzeugen des europäischen Zentrums mit Kontextualisierung zur deutschen Geschichte von 1920 bis Heute.</span>
        <span class="en-t">A selection of built witnesses in Europe's centre, contextualising German history from 1920 to the present.</span>
      </p>
      <div class="bat-hero__meta">
        <span><span class="de-t">7 Tage</span><span class="en-t">7 days</span></span>
        <span>${totalStops} <span class="de-t">Projekte</span><span class="en-t">projects</span></span>
        <span>1920–2024</span>
      </div>
    </div>
  </div>
</section>

<div class="bat-tour-intro">
  <div class="bat-tour-intro__inner">
  <nav class="bat-day-strip" aria-label="Tage">
    <div class="bat-day-strip__days">${dayNavHtml}</div>
  </nav>
  <section class="bat-intro" aria-label="Einleitung">
    <p class="de-t">Die Aufteilung in Tage erfolgt teilweise historisch aber aus praktischen Gründen hauptsächlich geografisch. Jede Projektkarte hat eine Information und praktische Zugangshinweise. Klick auf eine Karte, um die Details zu lesen und ggf. weitere Fotos zu sehen.</p>
    <p class="en-t">Days are partly historical but mainly geographic for practical reasons. Each project card includes information and practical access notes. Click a card to read details and view additional photos where available.</p>
  </section>
  ${renderLabelFilter()}
  </div>
</div>

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
const LABEL_DEFS = ${JSON.stringify(LABEL_DEFS)};
const LABEL_ORDER = ${JSON.stringify(LABEL_ORDER)};
let lang = (function(){try{return localStorage.getItem('fcLang')||'de'}catch(e){return 'de'}})();
let openId = null;

function sortLabels(labels) {
  return labels.slice().sort(function (a, b) {
    return LABEL_ORDER.indexOf(a) - LABEL_ORDER.indexOf(b);
  });
}

function normalizeLabels(labels) {
  const sorted = sortLabels(labels);
  if (sorted.indexOf('brd') === -1) return sorted;
  return sorted.filter(function (l) { return l !== 'vor1939'; });
}

function renderModalLabelsHtml(s) {
  const labels = normalizeLabels(s.labels || []);
  if (!labels.length) return '';
  const chips = labels.map(function (key) {
    const def = LABEL_DEFS[key];
    if (!def) return '';
    return '<span class="bat-stop__label bat-stop__label--' + key + '" style="background:' + def.bg + ';color:' + def.color + '"><span class="de-t">' + def.de + '</span><span class="en-t">' + def.en + '</span></span>';
  }).join('');
  return '<div class="bat-modal__labels">' + chips + '</div>';
}

function wrapModalFrame(inner, labelsHtml) {
  return '<div class="bat-modal__frame"><div class="bat-modal__media-bound">' + inner + '</div>' + labelsHtml + '</div>';
}

function wrapModalMedia(labelsHtml, inner) {
  return '<div class="bat-modal__media-stack">' + wrapModalFrame(inner, labelsHtml) + '</div>';
}

function findStop(id) {
  for (const day of TOUR) {
    const s = day.stops.find(x => x.id === id);
    if (s) return s;
  }
  return null;
}

function setLang(next) {
  lang = next === 'en' ? 'en' : 'de';
  document.body.classList.toggle('en', lang === 'en');
  document.body.classList.toggle('de', lang === 'de');
  document.documentElement.lang = lang;
  try { localStorage.setItem('fcLang', lang); } catch (e) {}
  if (openId) renderModal(openId);
}
document.addEventListener('fc-lang-change', function (e) { setLang(e.detail.lang); });
setLang(lang);

let modalGalleryIndex = 0;

function getModalPhotos(s) {
  return [s.photo].concat(s.gallery || []).filter(Boolean);
}

function renderModalMedia(s, name) {
  const media = document.getElementById('bat-modal-media');
  const photos = getModalPhotos(s);
  const safeName = name.replace(/</g, '&lt;');
  const labelsHtml = renderModalLabelsHtml(s);
  if (!photos.length) {
    if (s.photo) {
      media.innerHTML = wrapModalMedia(
        labelsHtml,
        '<img class="bat-modal__img" src="' +
        s.photo.replace(/"/g, '&quot;') +
        '" alt="" onerror="this.hidden=true;this.nextElementSibling.style.display=\\'flex\\'">' +
        '<div class="bat-modal__ph" aria-hidden="true">' +
        safeName +
        '</div>'
      );
    } else {
      media.innerHTML = wrapModalMedia(
        labelsHtml,
        '<div class="bat-modal__ph" style="display:flex" aria-hidden="true">' + safeName + '</div>'
      );
    }
    return;
  }
  if (photos.length === 1) {
    media.innerHTML = wrapModalMedia(
      labelsHtml,
      '<img class="bat-modal__img" src="' +
      photos[0].replace(/"/g, '&quot;') +
      '" alt="" onerror="this.hidden=true;this.nextElementSibling.style.display=\\'flex\\'">' +
      '<div class="bat-modal__ph" aria-hidden="true">' +
      safeName +
      '</div>'
    );
    return;
  }
  modalGalleryIndex = 0;
  const imgs = photos
    .map(
      (src) =>
        '<div class="bat-modal__gallery-slide"><img class="bat-modal__img" src="' + src.replace(/"/g, '&quot;') + '" alt="" onerror="this.hidden=true"></div>'
    )
    .join('');
  const dots = photos
    .map(
      (_, i) =>
        '<button type="button" data-gallery-dot="' + i + '"' + (i ? '' : ' class="is-active"') + ' aria-label="' + (i + 1) + '/' + photos.length + '"></button>'
    )
    .join('');
  media.innerHTML = wrapModalMedia(
    labelsHtml,
    '<div class="bat-modal__gallery" data-gallery-count="' +
    photos.length +
    '">' +
    '<div class="bat-modal__gallery-track" id="bat-modal-gallery-track">' +
    imgs +
    '</div>' +
    '<div class="bat-modal__gallery-nav">' +
    '<button type="button" data-gallery-prev aria-label="Vorheriges Bild">‹</button>' +
    '<button type="button" data-gallery-next aria-label="Nächstes Bild">›</button>' +
    '</div>' +
    '<div class="bat-modal__gallery-dots" id="bat-modal-gallery-dots">' +
    dots +
    '</div>' +
    '<div class="bat-modal__ph" aria-hidden="true">' +
    safeName +
    '</div></div>'
  );
  bindModalGallery(photos.length);
}

function bindModalGallery(count) {
  const track = document.getElementById('bat-modal-gallery-track');
  if (!track) return;
  const dots = document.querySelectorAll('[data-gallery-dot]');
  function show(i) {
    modalGalleryIndex = (i + count) % count;
    track.scrollTo({ left: track.clientWidth * modalGalleryIndex, behavior: 'smooth' });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === modalGalleryIndex);
    });
  }
  const prev = document.querySelector('[data-gallery-prev]');
  const next = document.querySelector('[data-gallery-next]');
  if (prev) prev.onclick = () => show(modalGalleryIndex - 1);
  if (next) next.onclick = () => show(modalGalleryIndex + 1);
  dots.forEach((dot) => {
    dot.onclick = () => show(Number(dot.dataset.galleryDot));
  });
}

function renderModal(id) {
  const s = findStop(id);
  if (!s) return;
  const content = document.getElementById('bat-modal-content');
  const name = lang === 'en' ? s.nameEn : s.nameDe;
  const body = lang === 'en' ? s.bodyEn : s.bodyDe;
  const access = lang === 'en' ? s.accessEn : s.accessDe;
  const story = lang === 'en' ? (s.storyEn || '') : (s.storyDe || '');
  const accessLabel = lang === 'en' ? 'Access' : 'Zugang';

  renderModalMedia(s, name);

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

const activeLabelFilters = new Set(Object.keys(LABEL_DEFS));

function applyLabelFilter() {
  document.querySelectorAll('.bat-stop').forEach(function (btn) {
    const raw = btn.getAttribute('data-labels') || '';
    const labels = raw ? raw.split(',').filter(Boolean) : [];
    const show = labels.length === 0 || labels.every(function (l) { return activeLabelFilters.has(l); });
    btn.classList.toggle('is-filter-hidden', !show);
  });
}

document.querySelectorAll('[data-label-filter]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const key = btn.getAttribute('data-label-filter');
    if (activeLabelFilters.has(key)) {
      activeLabelFilters.delete(key);
      btn.classList.remove('is-on');
      btn.classList.add('is-off');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      activeLabelFilters.add(key);
      btn.classList.add('is-on');
      btn.classList.remove('is-off');
      btn.setAttribute('aria-pressed', 'true');
    }
    applyLabelFilter();
  });
});

applyLabelFilter();

const daySections = document.querySelectorAll('.bat-day');
const dayLinks = document.querySelectorAll('[data-day-link]');

function getBatStickyOffset() {
  var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bat-sticky-top')) || 72;
  var intro = document.querySelector('.bat-tour-intro');
  return navH + (intro ? intro.offsetHeight : 0);
}

function scrollDayIntoView(section) {
  var sticky = getBatStickyOffset();
  var gap = 14;
  var anchor = section.querySelector('.bat-day__title') || section.querySelector('.bat-day__header') || section;
  var rect = anchor.getBoundingClientRect();
  window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - sticky - gap), behavior: 'smooth' });
}

dayLinks.forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    var section = document.getElementById(href.slice(1));
    if (!section) return;
    history.replaceState(null, '', href);
    dayLinks.forEach(function (a) { a.classList.toggle('is-active', a === link); });
    scrollDayIntoView(section);
  });
});

if (location.hash && location.hash.indexOf('#day-') === 0) {
  var initial = document.getElementById(location.hash.slice(1));
  if (initial) {
    requestAnimationFrame(function () { scrollDayIntoView(initial); });
  }
}

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

function syncBatStickyTop() {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var h = Math.ceil(nav.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--bat-sticky-top', h + 'px');
  document.documentElement.style.setProperty('--bat-day-scroll-margin', (getBatStickyOffset() + 14) + 'px');
}

function initBatStickyTop() {
  function attach(nav) {
    syncBatStickyTop();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncBatStickyTop).observe(nav);
      var intro = document.querySelector('.bat-tour-intro');
      if (intro) new ResizeObserver(syncBatStickyTop).observe(intro);
    }
  }

  function waitForNav() {
    var nav = document.querySelector('.nav');
    if (nav) {
      attach(nav);
      return;
    }
    var host = document.getElementById('fc-site-header');
    if (host && typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(function () {
        nav = document.querySelector('.nav');
        if (nav) {
          mo.disconnect();
          attach(nav);
        }
      });
      mo.observe(host, { childList: true, subtree: true });
    }
    setTimeout(waitForNav, 120);
  }

  waitForNav();
  window.addEventListener('resize', syncBatStickyTop);
  window.addEventListener('load', syncBatStickyTop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBatStickyTop);
} else {
  initBatStickyTop();
}
</script>
<script src="nav.js" defer></script>
<script src="fc-lang.js" defer></script>
</body>
</html>`;
}

function applyDiningPhotos() {
  for (const day of DAYS) {
    for (const [key, filename] of Object.entries(DINING_PHOTOS)) {
      const [dayId, mealKey] = key.split("-");
      if (String(day.id) !== dayId || !day[mealKey] || !filename) continue;
      day[mealKey].photo = assetPath(filename);
    }
  }
}

function resolveDiningPhotoFallbacks() {
  for (const day of DAYS) {
    for (const key of ["lunch", "dinner"]) {
      const meal = day[key];
      if (!meal?.photo || meal.photo.startsWith("assets/")) continue;
      const fallback = day.stops.find((s) => s.photo?.startsWith("assets/"));
      if (fallback) meal.photo = fallback.photo;
    }
  }
}

function flattenAllStops() {
  const map = new Map();
  for (const day of DAYS) {
    for (const stop of day.stops) {
      map.set(stop.id, { ...stop });
    }
  }
  for (const meta of NEW_STOPS_META) {
    if (map.has(meta.id)) continue;
    const files = PHOTO_BY_STOP[meta.id];
    map.set(meta.id, {
      id: meta.id,
      nameDe: meta.nameDe,
      nameEn: meta.nameEn,
      metaDe: meta.metaDe || `${meta.districtDe} · Berlin`,
      metaEn: meta.metaEn || `${meta.districtDe} · Berlin`,
      tag: meta.tag,
      teaserDe: meta.teaserDe,
      teaserEn: meta.teaserEn,
      bodyDe: meta.bodyDe || meta.teaserDe,
      bodyEn: meta.bodyEn || meta.teaserEn,
      accessDe: meta.accessDe || "Von außen zugänglich, sofern nicht anders angegeben.",
      accessEn: meta.accessEn || "Accessible from outside unless noted otherwise.",
      photo: files?.length ? assetPath(files[0]) : undefined,
      gallery: files?.length > 1 ? files.slice(1).map(assetPath) : undefined,
    });
  }
  for (const [id, stop] of Object.entries(EXTRA_STOPS)) {
    const files = PHOTO_BY_STOP[id];
    const merged = { ...stop };
    if (files?.length && !merged.photo?.startsWith("assets/")) {
      merged.photo = assetPath(files[0]);
      merged.gallery = files.length > 1 ? files.slice(1).map(assetPath) : undefined;
    }
    map.set(id, { ...map.get(id), ...merged });
  }
  for (const [id, patch] of Object.entries(STOP_OVERRIDES)) {
    if (!map.has(id)) continue;
    map.set(id, { ...map.get(id), ...patch });
  }
  for (const [id, labels] of Object.entries(LABELS_BY_ID)) {
    if (!map.has(id)) continue;
    map.set(id, { ...map.get(id), labels: normalizeLabels(labels) });
  }
  return map;
}

function reorganizeTourDays() {
  const stopMap = flattenAllStops();
  const oldById = new Map(DAYS.map((d) => [d.id, d]));
  DAYS.length = 0;
  for (const plan of DAY_LAYOUT) {
    const prev = oldById.get(plan.id);
    const stops = plan.stopIds
      .map((id) => stopMap.get(id))
      .filter(Boolean);
    const dining = DINING_BY_DAY[plan.id] || {};
    DAYS.push({
      id: plan.id,
      themeDe: plan.themeDe,
      themeEn: plan.themeEn,
      navDe: plan.navDe,
      navEn: plan.navEn,
      eraDe: plan.eraDe || "",
      eraEn: plan.eraEn || "",
      routeDe: plan.routeDe || "",
      routeEn: plan.routeEn || "",
      lunch: dining.lunch ? { ...dining.lunch } : { ...DEFAULT_DINING.lunch },
      dinner: dining.dinner ? { ...dining.dinner } : { ...DEFAULT_DINING.dinner },
      stops,
    });
  }
}

function renderStopLabels(stop) {
  const labels = normalizeLabels(stop.labels || LABELS_BY_ID[stop.id] || []);
  if (!labels.length) return "";
  const chips = labels
    .map((key) => {
      const def = LABEL_DEFS[key];
      if (!def) return "";
      return `<span class="bat-stop__label bat-stop__label--${key}" style="background:${def.bg};color:${def.color}"><span class="de-t">${def.de}</span><span class="en-t">${def.en}</span></span>`;
    })
    .join("");
  return `<div class="bat-stop__labels">${chips}</div>`;
}

async function main() {
  const heroImg = await localizeTourImages();
  reorganizeTourDays();
  applyDiningPhotos();
  resolveDiningPhotoFallbacks();
  const html = buildHtml(heroImg);
  writeFileSync(outPath, html, "utf8");
  console.log("Wrote", outPath, "(" + html.length + " bytes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
