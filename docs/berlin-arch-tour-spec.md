# Berlin Architecture Tour — Vollständige Spezifikation für Cursor

**Datei:** `berlinarchtour.html`  
**Ziel-URL:** `fridaycircle.club/berlinarchtour`  
**Sprachen:** Deutsch / Englisch (DE/EN Toggle)  
**Stand:** Mai 2026

---

## 1. Konzept & Idee

Eine Architektur-Studienreise durch Berlin, kuratiert als öffentliche Subpage von fridaycircle.club. Die Tour richtet sich an Architektur-Enthusiasten und ist bewusst nicht exklusiv auf eine bestimmte Gruppe zugeschnitten — alle Texte und Hinweise sind neutral und für jeden Besucher verwendbar.

### Kernprinzip der Tour-Logik

Die Route folgt der Stadt **geografisch**, nicht chronologisch. Epochen und Stile werden als Kontext mitgeführt. Vor- und Rückgriffe zwischen Perioden sind Teil der Logik. Beispiel: Das Olympiastadion (1936) und die Unité d'Habitation (1958) liegen beide in Westend, direkt nebeneinander — sie sind deshalb auf **Tag 1** (thematisch Weimar & Klassische Moderne), nicht auf einem eigenen "Nachkrieg"-Tag. Der geografische Weg bestimmt die Reihenfolge. Der Kontrast ist bewusst.

### Inhaltliche Tiefe

Jedes Projekt hat:
- Einen kurzen Teaser (Kartentext)
- Einen langen Fließtext im Modal (fachlich, keine LLM-Rhetorik)
- Optional einen "Story"-Block (hervorgehobene Einzelgeschichte)
- Einen Zugangs-Block (Öffnungszeiten, Buchung, Anreise)

### Was diese Tour von anderen unterscheidet

- Das Berghain wird als DDR-Industriearchitektur behandelt, nicht als Club-Mythos
- Die Schweizer Botschaft — kaum bekannt — ist der stärkste Story-Anker für die dunklen Jahre
- Kino International hat eine der präzisesten Einzelgeschichten Berlins (9. November 1989)
- Das Olympiastadion wird einbezogen, weil Verdrängen das Gegenteil von Aufarbeitung ist
- Die DZ Bank hat zwei Gesichter: außen brav (Stadtgestaltungssatzung Pariser Platz), innen Gehrys spektakulärster Innenraum

---

## 2. Design-System

### Referenz-Sites
- **fridaycircle.club** — Gesamtästhetik, Tonalität
- **gogogo-landing (Slide 4 "CYCLE TRAINING")** — Typografie-Referenz: große Display-Schrift, Beige-Background, schwarze Sections

### Farben
```
--beige:   #f0eee6   (Seiten-Background, Nav, Footer, Interlude-Abschnitte)
--black:   #0d0d0d   (Day-Sections Background)
--white:   #ffffff
--red:     #c8312a   (Akzent: Tags, aktive Nav, Story-Border, Dining-Label)
```

### Typografie
- **Font:** `'Helvetica Neue', Helvetica, Arial, sans-serif`
- **Day Title:** `font-weight: 200` + `font-weight: 700 (strong)`, `text-transform: uppercase`, `letter-spacing: -0.01em`
- **Größe Day Title:** `clamp(2.2rem, 5vw, 4.4rem)`
- **Body-Texte in Modalen:** `font-size: 14.5px`, `line-height: 1.84`, `color: rgba(255,255,255,0.72)`
- **Stop-Teaser:** `font-size: 13.5px`, `color: rgba(255,255,255,0.68)`
- **Stop-Name:** `font-size: 17px`, `font-weight: 500`, `color: #ffffff`
- **Tags (rot):** `font-size: 11px`, `letter-spacing: 0.12em`, `text-transform: uppercase`
- **Nav/Labels:** `font-size: 10–11px`, `letter-spacing: 0.1–0.15em`, `text-transform: uppercase`

### Wichtige Schrift-Regel
Kein grauer Text in schwarzen Sections. Alle Texte haben mindestens `rgba(255,255,255,0.45)` für Metadaten, `rgba(255,255,255,0.68)` für Teasertexte, `rgba(255,255,255,0.88)` für Hauptinhalt.

### Abstände & Strukturelemente

- Nav-Höhe: `50px`, sticky
- Day-Nav: sticky bei `top: 50px`, ebenfalls sticky scrollend
- Day-Header Padding: `3rem 2.5rem 1.8rem`
- Stops-Grid: `repeat(auto-fill, minmax(290px, 1fr))`
- Stop-Foto-Höhe: `192px`
- Modal max-width: `680px`
- Modal-Bild-Höhe: `272px`

### Keine Gedankenstriche (em dash)
In allen Texten: kein `—` (em dash). Wenn nötig, einfaches Minus ` - ` mit Leerzeichen. Bevorzugt: Sätze umstrukturieren.

### Keine "Nicht X sondern Y"-Konstruktionen
Texte formulieren was etwas ist, nicht was es nicht ist.

---

## 3. Seitenstruktur

```
<nav>
  Logo "Friday Circle" → fridaycircle.club
  Sprach-Toggle DE / EN
  Kurzlinks 1–6 (nur Desktop)

<hero>
  Fullscreen, Bild-Overlay mit opacity 0.22
  Eyebrow, großer Titel "Berlin ARCHITECTURE"
  Subtitle, 3 Meta-Werte (Dauer, Projekte, Zeitraum)

<intro>
  Beige Section, 2 Absätze, max-width 720px

<day-nav>
  Sticky unter Nav, 6 Links mit aktiver Hervorhebung (IntersectionObserver)

[6 × Day-Section] (schwarzer Hintergrund)
  day-header (Tag-Nummer, Titel, Epoche, Routenhinweis)
  stops-grid (Karten)
  dining-strip (Mittag + Abendessen)
  [optional: interlude] (beige)

<footer>
  Link fridaycircle.club | Text "Berlin Architektur · 6 Tage"

<modal>
  Overlay mit Blur
  Foto, Tag, Titel, Architekt/Datum, Fließtext, Story-Block, Zugangs-Block
  Schließbar: ✕-Button, Klick außerhalb, Escape-Taste
```

---

## 4. Features & Verhalten

### Sprachumschaltung DE/EN
- `<body class="de">` oder `<body class="en">`
- Klassen `.de-t` und `.en-t` auf allen zweisprachigen Elementen
- `body.en .de-t { display: none }` / `body.de .en-t { display: none }`
- Beim Umschalten wird auch das offene Modal neu gerendert (aktuelle Sprache)
- Sprachumschalter: zwei Buttons oben rechts, aktiver Button schwarzer Hintergrund

### Modal
- Öffnet beim Klick auf eine Stop-Karte
- Zeigt Inhalt in aktueller Sprache
- Foto (falls vorhanden), Tag, Titel, Architekt-Zeile, Fließtext, optionaler Story-Block, optionaler Zugangs-Block
- `document.body.style.overflow = 'hidden'` beim Öffnen

### Active Day-Nav
- `IntersectionObserver` mit `threshold: 0.25`
- Aktive Section hebt entsprechenden Nav-Link hervor (roter Border-Bottom)

### Foto-Fallback
- `<img onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">` auf jedem Stop-Foto
- Fallback: `<div class="stop-ph">` mit Projekt-Name als Placeholder

---

## 5. Tages-Routen — Übersicht

| Tag | Thema | Zeitraum | Geografischer Bogen |
|-----|-------|----------|---------------------|
| 1 | Weimar & Klassische Moderne | 1920–1958 | Westend → Zehlendorf → Spandau |
| 2 | Kalter Krieg | 1945–1968 | Tiergarten → Kulturforum → Friedrichshain |
| 3 | Dunkle Jahre | 1933–45 im Stadtbild | Regierungsviertel → Mitte → Kreuzberg |
| 4 | Wende & Berliner Republik | 1989–2005 | Potsdamer Platz → Pariser Platz → Unter den Linden |
| 5 | Osten | 1932 · 1950er · 1990er | Hohenschönhausen → Friedrichshain → Mitte |
| 6 | 21. Jahrhundert | 2000–2024 | Museumsinsel → Mitte |

---

## 6. Vollständige Stop-Liste

### Tag 1 — Weimar & Klassische Moderne

#### Hufeisensiedlung
- **Architekt:** Bruno Taut & Fritz Förster
- **Jahr:** 1925–1933
- **Ort:** Neukölln, Britz
- **Status:** UNESCO Welterbe
- **Tag/Label:** UNESCO · Bruno Taut · 1930
- **Teaser DE:** Rund 1.000 Wohneinheiten für Arbeiter — würdevoll, farbig, radikal. Taut zeigt, dass sozialer Wohnungsbau kein Kompromiss sein muss.
- **Teaser EN:** Around 1,000 workers' dwellings — dignified, colourful, radical. Taut shows social housing need not be a compromise.
- **Fließtext DE:** Bruno Taut und Fritz Förster bauten hier zwischen 1925 und 1933 rund 1.000 Wohneinheiten für Arbeiter — erschwinglich, würdevoll, farbig. Das Herzstück ist der namensgebende Hufeisenbau: ein halbrundes, fünfgeschossiges Gebäude um einen großen Grünraum. Taut nutzte Farbe nicht als Dekoration, sondern als strukturierendes Element. Jeder Hauseingang hat eine andere Akzentfarbe. Die sozialdemokratisch regierten Kommunen finanzierten diese Projekte als politisches Programm: gute Räume für alle. 1933 endete das.
- **Story:** UNESCO 2008 — 2008 wurden die Hufeisensiedlung und fünf weitere Berliner Siedlungen als UNESCO-Welterbe anerkannt: sie dokumentieren die erste systematische Antwort auf die soziale Wohnungsnot der Industrialisierung.
- **Zugang:** Jederzeit von außen zugänglich. U-Bahn U8 Haltestelle Parchimer Allee.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Hufeisensiedlung_Berlin_Britz.jpg/1200px-Hufeisensiedlung_Berlin_Britz.jpg

#### Siedlung Onkel-Toms-Hütte
- **Architekt:** Bruno Taut / Hugo Häring / Otto Rudolf Salvisberg
- **Jahr:** 1926–1931
- **Ort:** Zehlendorf
- **Status:** UNESCO Welterbe
- **Tag/Label:** UNESCO · Taut / Häring · 1931
- **Teaser DE:** Stadtwald als Wohnlandschaft. Organischer als Britz. Hugo Härings Beitrag als Kontrapunkt zu Taut.
- **Teaser EN:** Urban forest as living landscape. More organic than Britz. Hugo Häring's contribution as counterpoint to Taut.
- **Fließtext DE:** Die Siedlung liegt im Zehlendorfer Kiefernwald. Taut, Häring und Salvisberg entwarfen Reihenhäuser, die sich in den Wald einschmiegen — organische Wegeführung, Dialog zwischen Gebäude und Baum. Hugo Häring war Tauts intellektueller Gegenspieler: Er interessierte sich für Formen, die aus der Funktion entstehen, nicht aus geometrischen Vorgaben. Die U-Bahnstation "Onkel Toms Hütte" von Alfred Grenander (1929) ist ein eigenes Meisterwerk der Weimarer Moderne.
- **Story:** —
- **Zugang:** Jederzeit von außen zugänglich. U-Bahn U3 Haltestelle Onkel Toms Hütte.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Siedlung_Onkel_Tom_2009.jpg/1200px-Siedlung_Onkel_Tom_2009.jpg

#### Haus Abraham · Haus Lewin (Gropius)
- **Architekt:** Arthur Korn & Siegfried Weitzmann / Walter Gropius
- **Jahr:** 1928
- **Ort:** Fischerhüttenstraße, Zehlendorf
- **Status:** Baudenkmal · Privatgebäude
- **Tag/Label:** Baudenkmal · Korn & Gropius · 1928
- **Teaser DE:** Funktionalismus im Villenmilieu. Beide für jüdische Auftraggeber — das erklärt, warum so wenige dieser Bauten erhalten sind.
- **Teaser EN:** Functionalism in a villa neighbourhood. Both for Jewish clients — which explains why so few such buildings survived.
- **Fließtext DE:** Haus Abraham (1928, Arthur Korn & Siegfried Weitzmann): Ein weißer Rechteckqubus mit konvexem verglastem Treppenhaus. Die Berliner Denkmaldatenbank beschreibt es als "seltenes wie prägnantes Beispiel für die funktionalistische Architekturauffassung der klassischen Moderne." Architekten und Bauherr waren jüdisch. Haus Lewin von Walter Gropius steht direkt in der Nachbarschaft, ebenfalls für jüdische Auftraggeber. Viele Bauten dieser Art verschwanden nach 1933. Beide Häuser sind Privatgebäude, von der Straße aus gut lesbar.
- **Story:** —
- **Zugang:** Privatgebäude. Von der Straße lesbar. S-Bahn S1 Haltestelle Schlachtensee.
- **Foto:** (kein öffentliches Foto — Placeholder verwenden)

#### Großsiedlung Siemensstadt
- **Architekt:** Hans Scharoun, Walter Gropius, Hugo Häring, Otto Bartning, Fred Forbát
- **Jahr:** 1929–1931
- **Ort:** Spandau
- **Status:** UNESCO Welterbe
- **Tag/Label:** UNESCO · Scharoun / Gropius · 1930
- **Teaser DE:** Sechs Architekten, ein Manifest. Licht, Luft, Grün gegen die Mietskaserne der Gründerzeit.
- **Teaser EN:** Six architects, one manifesto. Light, air, green space against the tenement block of the industrial era.
- **Fließtext DE:** Sechs der bedeutendsten Architekten ihrer Zeit bauten je einen Abschnitt einer zusammenhängenden Siedlung. Kein einheitlicher Masterplan, kein durchgehender Stil — ein Dialog. Die Zeilenbauweise gibt der Siedlung ihre Struktur: lange parallele Wohnriegel nach Süden, dazwischen Grün und Luft. Scharouns Abschnitt bricht als einziger die Strenge der Zeile auf. Hier ist zu erahnen, was er dreißig Jahre später mit der Philharmonie tun wird.
- **Story:** —
- **Zugang:** Jederzeit von außen zugänglich. U-Bahn U7 Haltestelle Rohrdamm.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Siemensstadtsiedlung_Goebelstrasse.jpg/1200px-Siemensstadtsiedlung_Goebelstrasse.jpg

#### Olympiastadion
- **Architekt:** Werner March
- **Jahr:** 1936
- **Ort:** Westend
- **Status:** Denkmal · öffentlich zugänglich
- **Tag/Label:** Werner March · 1936 · Kontrast
- **Teaser DE:** Neoklassizismus als Machtgeste. Liegt direkt neben dem Corbusier-Haus — der Kontrast ist Teil der Route.
- **Teaser EN:** Neoclassicism as an act of power. Right next to the Corbusier building — the contrast is part of the itinerary.
- **Fließtext DE:** Das Olympiastadion liegt direkt neben dem Corbusier-Haus in Westend — der Kontrast ist Teil dieser Route. Auf der einen Seite die Wohnmaschine der Interbau 1957, auf der anderen die Machtarchitektur von 1936. Werner March entwarf das Stadion ursprünglich sachlicher — Hitler ließ es nachträglich in Neoklassizismus umplanen. Der Naturstein, die Kolonnaden, die Monumentalität: Architektur, die Größe als Unterwerfung inszeniert. Räumlich ist das Stadion beeindruckend. Die Frage, die es stellt, ist: wozu?
- **Story:** Ambivalenz — Das Olympiastadion in einer Architektur-Tour aufzunehmen ist berechtigt. Das Verdrängen ist das Gegenteil von Aufarbeitung. Das Stadion steht noch. Hinschauen lohnt sich.
- **Zugang:** Täglich geöffnet, Öffnungszeiten saisonal. Führungen buchbar über olympiastadion-berlin.de. S-Bahn S5/S75 Haltestelle Olympiastadion.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Olympiastadion_Berlin_2015.jpg/1200px-Olympiastadion_Berlin_2015.jpg

#### Unité d'Habitation
- **Architekt:** Le Corbusier
- **Jahr:** 1957–1958
- **Ort:** Flatowallee, Westend
- **Status:** Wohngebäude · Denkmal
- **Tag/Label:** Le Corbusier · 1958
- **Teaser DE:** Corbusiers Berliner Wohnmaschine — für die Interbau 1957 gebaut, heute Wohnanlage. Direkt neben dem Olympiastadion.
- **Teaser EN:** Corbusier's Berlin living machine — built for Interbau 1957, today a residential building. Right next to the Olympiastadion.
- **Fließtext DE:** Corbusiers Berliner Unité ist nicht die bekannteste — das ist Marseille (1952). Aber sie ist die politischste. Als Interbau-Beitrag gebaut, war sie das westliche Bekenntnis zur sozialen Wohnmaschine: Wohnen als Infrastruktur. Das Prinzip der Cité Radieuse: alle Funktionen in einem Körper. Wohnungen, Geschäfte, Kindergarten, Dachterrasse. Der Weg vom Olympiastadion zur Unité ist kurz. Der Kontrastwechsel erheblich: hier horizontale Ausbreitung der Macht, dort der vertikale Stapel des Lebens.
- **Story:** —
- **Zugang:** Wohngebäude, nicht öffentlich zugänglich. Von außen gut lesbar. Auf dem Weg zurück vom Olympiastadion.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Unite_d_habitation_Berlin.jpg/1200px-Unite_d_habitation_Berlin.jpg

**Dining Tag 1:**
- Mittagessen: Wirtshaus Schildhorn — Am Schildhorn, Zehlendorf. Historisches Ausflugslokal direkt am Havel-Ufer, seit 1842. Klassische Berliner Küche, Gartenrestaurant.
- Abendessen: Café Hardenberg — Hardenbergstraße, Charlottenburg. Günstig, solid, neben der TU Berlin.

---

### Tag 2 — Kalter Krieg

#### Schwangere Auster (Haus der Kulturen der Welt)
- **Architekt:** Hugh A. Stubbins
- **Jahr:** 1957
- **Ort:** Tiergarten
- **Status:** Öffentliches Kulturgebäude
- **Tag/Label:** Hugh Stubbins · 1957
- **Teaser DE:** US-Propagandabau, bewusst sichtbar von der DDR-Grenze. Der Architekt selbst nannte es einen Propagandabau Richtung Sowjets.
- **Teaser EN:** US propaganda building, deliberately visible from the GDR border. The architect himself called it a propaganda building aimed at the Soviets.
- **Fließtext DE:** Schenkung der USA an West-Berlin, 1957. Der Standort im Tiergarten nahe der Sektorengrenze war bewusst gewählt. Hugh Stubbins entwarf eine freitragende, doppelt gekrümmte Spannbeton-Schale, die von Fachkreisen schon bei der Eröffnung kritisch diskutiert wurde. Am 21. Mai 1980 stürzte ein Teil des Daches ein. Nach langem Streit — Abriss oder Wiederaufbau — entschied man sich für den Wiederaufbau mit der Begründung, das Gebäude sei ein "geschichtliches und politisches Dokument." 1987 wiedereröffnet. Stubbins soll über sein Gebäude gesagt haben: "Das war in Wirklichkeit ein Propagandabau, der sich an die Sowjets richtete."
- **Story:** Propagandabau — Man ließ einen Hügel aufschütten, damit die Bürger der DDR das Gebäude von der Grenze aus sehen konnten. Das Dach sollte tagsüber Sonnenlicht reflektieren und nachts beleuchtet sein.
- **Zugang:** Frei zugänglich als Außenanlage. Veranstaltungsgebäude, Öffnungszeiten programmabhängig. hkw.de für aktuelles Programm. Bus 100/187 Haltestelle Haus der Kulturen der Welt.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Haus_der_Kulturen_der_Welt_-_Kongresshalle.jpg/1200px-Haus_der_Kulturen_der_Welt_-_Kongresshalle.jpg

#### Hansaviertel
- **Architekt:** Aalto, Niemeyer, Gropius, Jacobsen u.a.
- **Jahr:** 1957 (Interbau)
- **Ort:** Tiergarten
- **Status:** Öffentlich zugänglich
- **Tag/Label:** Interbau 1957
- **Teaser DE:** 53 internationale Architekten, ein westliches Manifest. Die direkte Antwort auf die Stalinallee — beide zur selben Zeit gebaut.
- **Teaser EN:** 53 international architects, one western manifesto. The direct answer to the Stalinallee — both built at the same time.
- **Fließtext DE:** Die Interbau 1957 lud 53 internationale Architekten ein, ein "demokratisches" Wohnviertel zu bauen. Das Ergebnis ist heterogen, manchmal widersprüchlich, immer spannend. Alvar Aalto: Mehrfamilienhaus mit geschwungenen Loggien. Oscar Niemeyer: ein Wohnblock, der wie ein Brasília-Fragment wirkt. Walter Gropius: seine Rückkehr nach Deutschland — er war vor den Nazis geflohen. Das Hansaviertel funktioniert als Gesamtbild, weil die Unterschiede nicht nivelliert wurden.
- **Story:** —
- **Zugang:** Jederzeit von außen zugänglich. S-Bahn S5/S7/S75 Haltestelle Tiergarten oder Bellevue.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Hansaviertel_Berlin_2009.jpg/1200px-Hansaviertel_Berlin_2009.jpg

#### Philharmonie + Neue Nationalbibliothek
- **Architekt:** Hans Scharoun
- **Jahr:** 1963 / 1978
- **Ort:** Kulturforum
- **Status:** Konzerthaus (Tickets) / Öffentliche Bibliothek
- **Tag/Label:** Hans Scharoun · 1963 / 1978
- **Teaser DE:** Scharoun gegen das rechte Winkel-Dogma. Organische Expressivität als West-Berliner Gegenentwurf zur Macht-Architektur des Ostens.
- **Teaser EN:** Scharoun against the right-angle dogma. Organic expressivity as West Berlin's counter-proposal to the power architecture of the East.
- **Fließtext DE:** Hans Scharoun ist der Antipode zu Mies. Wo Mies reduziert, universalisiert, entmaterialisiert, fügt Scharoun hinzu, spezifiziert, verräumlicht. Die Philharmonie ist sein Hauptwerk. Der Grundgedanke: Musik steht im Mittelpunkt, buchstäblich. Das Orchester sitzt im Zentrum, die Zuschauer ringsum auf terrassierten Ebenen. Eine demokratische Raumordnung für Musik. Am Kulturforum stehen Scharoun und Mies nebeneinander — Philharmonie und Neue Nationalgalerie, zwei Haltungen, zwei Welten.
- **Story:** —
- **Zugang:** berliner-philharmoniker.de für Führungen und Konzertkarten. Freies Mittagskonzert freitags 13 Uhr. Bus 200 Haltestelle Philharmonie.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Philharmonie_Berlin.jpg/1200px-Philharmonie_Berlin.jpg

#### Neue Nationalgalerie
- **Architekt:** Ludwig Mies van der Rohe (1968) · Sanierung David Chipperfield (2021)
- **Jahr:** 1965–1968 / Sanierung 2015–2021
- **Ort:** Kulturforum
- **Status:** Museum · smb.museum
- **Tag/Label:** Mies 1968 · Chipperfield 2021
- **Teaser DE:** Mies' Rückkehr nach Deutschland. Sein letztes europäisches Werk. Chipperfields Sanierung ist kaum sichtbar — das ist der Erfolg.
- **Teaser EN:** Mies' return to Germany. His last European work. Chipperfield's restoration is barely visible — that is its success.
- **Fließtext DE:** Die Neue Nationalgalerie ist Mies' Rückkehr nach Deutschland — und sein letztes großes europäisches Werk. Ein Stahlglas-Tempel, der die Idee des "universellen Raums" konsequent zu Ende denkt. Das gläserne Obergeschoss ist stützenfrei, 50 x 50 Meter, für temporäre Ausstellungen eigentlich ungeeignet (zu viel Licht, zu wenig Wand). Mies wusste das und akzeptierte es. Der Raum ist der Raum. Chipperfields Sanierung (2015–2021): das Gebäude wurde komplett entkernt, jede Oberfläche dokumentiert, originalgetreu restauriert. Kaum sichtbar — das ist der Erfolg.
- **Story:** Chipperfield-Faden — Neue Nationalgalerie (Sanierung), Neues Museum, James Simon Galerie, Haus Bastian, Joachimstraße-Campus — fünf Berliner Werke eines Architekten, verteilt über 20 Jahre.
- **Zugang:** smb.museum · Di–Fr 10–18 Uhr, Do bis 20 Uhr, Sa/So 11–18 Uhr. Eintritt ca. 14 €. U-Bahn U2 Haltestelle Potsdamer Platz.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Neue_Nationalgalerie_Berlin_2015.jpg/1200px-Neue_Nationalgalerie_Berlin_2015.jpg

#### Karl-Marx-Allee
- **Architekt:** Abschnitt 1: Hermann Henselmann, Richard Paulick · Abschnitt 2: Josef Kaiser, Werner Dutschke
- **Jahr:** 1952–1965
- **Ort:** Mitte/Friedrichshain
- **Status:** Öffentlicher Raum · Denkmal
- **Tag/Label:** DDR · 1952–1965
- **Teaser DE:** Zu Fuß vom Frankfurter Tor: erst Zuckerbäckerstil, dann DDR-Moderne. Zwei Epochen auf einem Boulevard.
- **Teaser EN:** On foot from Frankfurter Tor: first Stalinist wedding-cake, then GDR modernism. Two eras on one boulevard.
- **Fließtext DE:** Auf keiner anderen Straße der Welt kann man so direkt den Stilwandel einer Ideologie ablesen. Zu Fuß vom Frankfurter Tor zum Alexanderplatz ist eine Reise durch zwei DDR-Epochen. Abschnitt 1 (Frankfurter Tor bis Strausberger Platz): Sozialistischer Klassizismus, "Zuckerbäckerstil", Stalin persönlich gefällig. Abschnitt 2 (Strausberger Platz bis Alexanderplatz): Nach Stalins Tod 1953 wechselte die DDR den Stil. Kaiser gewann den Wettbewerb mit internationalem Modernismus. Das Kino International und das Café Moskau entstanden hier.
- **Story:** —
- **Zugang:** Jederzeit zugänglich. Zu Fuß am besten von Frankfurter Tor westwärts. U-Bahn U5 Haltestelle Frankfurter Tor.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Strausberger_Platz_Berlin.jpg/1200px-Strausberger_Platz_Berlin.jpg

#### Kino International
- **Architekt:** Josef Kaiser / Heinz Aust
- **Jahr:** 1963
- **Ort:** Karl-Marx-Allee 33, Friedrichshain
- **Status:** Sanierung 2024–2026, dann wieder öffentlich
- **Tag/Label:** Josef Kaiser · 1963
- **Teaser DE:** Am 9. November 1989, als die Mauer fiel, lief hier "Coming Out" — der erste queere DDR-Film. Der Kinosaal stand noch offen.
- **Teaser EN:** On 9 November 1989, as the Wall fell, "Coming Out" — the GDR's first queer film — screened here. The auditorium was still open.
- **Fließtext DE:** Das Kino International ist das eleganteste Gebäude der DDR-Moderne an der Allee. Kaiser orientierte sich an internationalen Kinobauten der Zeit — der erste Stock ragt neun Meter stützenfrei über das Erdgeschoss hinaus. Es war das Premierenkino der DDR. Walter Ulbricht war zur Eröffnung 1963 anwesend. Hier feierten DEFA-Produktionen Premiere — aber auch ausgewählte Westfilme wie "Cabaret" und "Dirty Dancing." Am 9. November 1989 lief hier "Coming Out" — Heiner Carows erster queerer DDR-Film. Nach der Vorstellung erfuhren die Besucher, dass die Mauer geöffnet worden war.
- **Story:** 9. November 1989 — Kein anderes Gebäude Berlins verdichtet die Widersprüche der DDR so präzise. Staatsprestige, Jugendkultur, Zensur — und jener eine Abend, an dem Film und Geschichte gleichzeitig Geschichte wurden.
- **Zugang:** Sanierung bis voraussichtlich 2026 — vorab prüfen: kino-international.com. U-Bahn U5 Haltestelle Schillingstraße.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Kino_International_Berlin.jpg/1200px-Kino_International_Berlin.jpg

**Dining Tag 2:**
- Mittagessen: Café Moskau — Karl-Marx-Allee 34. Josef Kaiser, 1964. Elegantes DDR-Modernes Gebäude auf der Allee selbst — Mittagessen hier ist Teil des Besuchs.
- Abendessen: Pauly Saal — Auguststraße 11–13, Mitte. Im ehemaligen Gemeindehaus der Jüdischen Mädchenschule. Gehobene Küche, außergewöhnlicher Raum.

---

### Tag 3 — Dunkle Jahre

#### Schweizer Botschaft + Diener & Diener Anbau
- **Architekt:** Stadtpalais (1919) + Anbau Diener & Diener (2000)
- **Jahr:** 1919 / 2000
- **Ort:** Spreebogen, direkt neben dem Reichstag
- **Status:** Botschaft · Außenansicht frei
- **Tag/Label:** Stadtpalais 1919 · Diener & Diener 2000
- **Teaser DE:** Das einzige Gebäude im Spreebogen, das Speers Germania-Pläne überstand. Am 28. April 1945 richtete die Rote Armee hier ihr Hauptquartier für den Sturm auf den Reichstag ein.
- **Teaser EN:** The only building in the Spreebogen that survived Speer's Germania plans. On 28 April 1945, the Red Army made it their headquarters for the assault on the Reichstag.
- **Fließtext DE:** Die Schweizer Botschaft ist das unbekannteste der wichtigsten Gebäude Berlins. Sie steht direkt neben dem Reichstag, zwischen Kanzleramt und Brandenburger Tor — das einzige Gebäude im Spreebogen, das Albert Speers "Germania"-Pläne überstand, die Bombardierungen überlebte und bis heute in Originalsubstanz steht. Im April 1945 richtete die 150. Division der Roten Armee im Botschaftsgebäude ihr Hauptquartier ein, um den Sturm auf den Reichstag vorzubereiten. Die verbliebenen Botschaftsmitarbeiter wurden in den Keller gesperrt. Botschafter Hans Fröhlicher bleibt historisch umstritten: Er empfahl dem Bundesrat, deutschen Forderungen nach Einschränkung der Schweizer Pressefreiheit entgegenzukommen. Der Anbau von Diener & Diener (2000) erinnert in seiner materiellen Sorgfalt an Carlo Scarpa — präziser Beton, klare Geometrie.
- **Story:** Glück der Neutralität — Historiker halten die These, die Alliierten hätten die Botschaft absichtlich verschont, für unplausibel. Das Gebäude hatte schlicht außerordentliches Glück.
- **Zugang:** Außenansicht jederzeit. Botschaft, kein regulärer öffentlicher Zugang. Führungen im Rahmen von Botschafts-Open-Days (jährlich, eda.admin.ch). Fußläufig vom Reichstag.
- **Foto:** (kein öffentlich verfügbares Foto — Placeholder)

#### Topographie des Terrors
- **Architekt:** Ursula Wilms / Heinle Wischer Partner
- **Jahr:** 2010
- **Ort:** Niederkirchnerstraße 8, Kreuzberg
- **Status:** Dokumentationszentrum · Eintritt frei
- **Tag/Label:** Ursula Wilms · 2010
- **Teaser DE:** Auf den Kellerfundamenten von SS und Gestapo. Architektur als Rahmung des Verbrechens — kein Denkmal, ein Dokument.
- **Teaser EN:** On the cellar foundations of the SS and Gestapo. Architecture as framing of crime — not a memorial, a document.
- **Fließtext DE:** Die Topographie des Terrors ist kein Denkmal. Sie ist ein Dokumentationszentrum auf dem Grundriss eines Verbrechens. Wo heute nüchterne Ausstellungsräume stehen, befanden sich die Kellergefängnisse und Verhörräume von SS, Gestapo und SD. Der Freiraum zeigt noch die Kellermauern: offene Ausgrabungsstellen, die den Maßstab des Gebäudekomplexes erahnen lassen. Das Gebäude selbst ist sachlich bis zur Absicht. Der Inhalt ist die Aussage.
- **Story:** —
- **Zugang:** Eintritt frei. Mai–Sept. 10–20 Uhr, Okt.–Apr. 10–18 Uhr. topographie.de. U2 oder S-Bahn Potsdamer Platz.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Topografie_des_Terrors.jpg/1200px-Topografie_des_Terrors.jpg

#### Holocaust-Mahnmal
- **Architekt:** Peter Eisenman
- **Jahr:** 2005
- **Ort:** Cora-Berliner-Straße 1, Mitte
- **Status:** Öffentlich zugänglich · Eintritt frei
- **Tag/Label:** Peter Eisenman · 2005
- **Teaser DE:** 2711 Stelen auf dem Boden des ehemaligen Ministeriumsviertels. Desorientierung als architektonische Sprache.
- **Teaser EN:** 2711 stelae on the ground of the former ministerial quarter. Disorientation as architectural language.
- **Fließtext DE:** Das Denkmal für die ermordeten Juden Europas steht auf dem ehemaligen Ministergarten des Dritten Reichs. 2711 Stelen, keine Namen, keine Daten, keine Erklärung. Eisenmans These: Desorientierung als Methode. Die Stelen steigen in der Mitte auf über zwei Meter, der Boden wellenförmig. Man verliert die Orientierung, hört die Stadtgeräusche gedämpft. Das Mahnmal erzählt keine Geschichte. Es erzeugt einen Zustand.
- **Story:** Debatte — Das Denkmal war jahrelang politisch und ästhetisch umstritten. Eisenman antwortete: er wolle kein Pietätsbild schaffen, sondern einen Raum, der das Unbegreifliche körperlich erfahrbar macht.
- **Zugang:** Mahnmal jederzeit zugänglich. Unterirdisches Informationszentrum: Di–So 10–20 Uhr (Apr.–Sept.), 10–19 Uhr (Okt.–März). Eintritt frei. holocaust-denkmal.de.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Memorial_to_the_Murdered_Jews_of_Europe_Berlin.jpg/1200px-Memorial_to_the_Murdered_Jews_of_Europe_Berlin.jpg

#### Jüdisches Museum
- **Architekt:** Daniel Libeskind
- **Jahr:** 1999
- **Ort:** Lindenstraße 9–14, Kreuzberg
- **Status:** Museum · jmberlin.de
- **Tag/Label:** Daniel Libeskind · 1999
- **Teaser DE:** Die Voids — begehbare Leerstellen — sind das Gebäude. Kein Ausstellungsstück muss erklärt werden, wenn man den Raum kennt.
- **Teaser EN:** The voids — walkable absences — are the building. No exhibit needs explanation once you know the space.
- **Fließtext DE:** Das Jüdische Museum war Libeskinds Durchbruch — und bis heute sein überzeugendster Bau. Seine These: Architektur muss nicht Hintergrund für Ausstellungen sein, sondern kann selbst Aussage sein. Die "Voids" — leere, unbeheizte Betontürme — sind nicht nutzbar. Sie stehen für Abwesenheit. Der "Garten des Exils": 49 Betonsäulen auf geneigtem Boden. Man verliert das Gleichgewicht. Libeskind war das erste Nachwendeprojekt, das international für Aufsehen sorgte.
- **Story:** —
- **Zugang:** Täglich 10–20 Uhr. Eintritt ca. 8 €. jmberlin.de. U-Bahn U1/U3 Haltestelle Hallesches Tor.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Jewish_Museum_Berlin_Garden_of_Exile.jpg/1200px-Jewish_Museum_Berlin_Garden_of_Exile.jpg

#### Haus am Checkpoint Charlie
- **Architekt:** Peter Eisenman (IBA)
- **Jahr:** 1985
- **Ort:** Kochstraße / Friedrichstraße, Kreuzberg
- **Status:** Wohngebäude · von außen zugänglich
- **Tag/Label:** Peter Eisenman · IBA 1985
- **Teaser DE:** IBA-Wohnungsbau im Mauerstreifen. West-Berlin als Laboratorium — Eisenman experimentiert, während 200 Meter weiter Bewaffnete stehen.
- **Teaser EN:** IBA housing in the death strip. West Berlin as laboratory — Eisenman experiments while armed guards stand 200 metres away.
- **Fließtext DE:** Die Internationale Bauausstellung Berlin 1984/87 (IBA) war ein Experiment: West-Berlin als Laboratorium für zeitgenössische Architektur, mitten im Kalten Krieg. Eisenman, Koolhaas, Hejduk, Rossi — die Avantgarde der damaligen Zeit baute in Kreuzberg. Eisenmans Beitrag steht am Checkpoint Charlie, dem bekanntesten Grenzübergang der Mauer. Sein Wohnhaus ignoriert die Orthogonalität der Berliner Stadtstruktur.
- **Story:** —
- **Zugang:** Wohngebäude. Von außen zugänglich. U-Bahn U6 Haltestelle Kochstraße.
- **Foto:** (Placeholder)

**Dining Tag 3:**
- Mittagessen: Sale e Tabacchi — Rudi-Dutschke-Straße 23, Kreuzberg. Klassisch italienisch, solid, nahe allen Projekten des Tages.
- Abendessen: Clärchens Ballhaus — Auguststraße 24, Mitte. Tanzsaal von 1913 — Weimarer Republik, DDR, Wende, alles noch im Raum. Original-Interieur.

---

### Tag 4 — Wende & Berliner Republik

#### Potsdamer Platz · Sony Center
- **Architekt:** Renzo Piano, Helmut Jahn, Hans Kollhoff
- **Jahr:** 1993–2000
- **Ort:** Tiergarten
- **Status:** Öffentlicher Raum
- **Tag/Label:** Piano · Jahn · Kollhoff · 1993–2000
- **Teaser DE:** Größtes privates Stadtbauprojekt Europas nach 1989. Drei Architekten, drei Haltungen, ein Platz.
- **Teaser EN:** Largest private urban development project in Europe after 1989. Three architects, three positions, one square.
- **Fließtext DE:** Der Potsdamer Platz war nach dem Krieg Niemandsland. Nach der Wende: das größte private Stadtbauprojekt Europas. In wenigen Jahren entstand ein neues Stück Stadt auf leerem Terrain. Renzo Pianos Blöcke im Süden — ruhig, maßstäblich. Helmut Jahns Sony Center (2000) — spektakulär, glasgetrieben, das schwebende Dach als stärkstes Einzelelement. Hans Kollhoffs Hochhaus — American-Skyscraper-Pastiche aus rotem Backstein. Der Potsdamer Platz zeigt, was passiert, wenn eine Stadt zu schnell zu viel will. Das Ergebnis ist nicht langweilig.
- **Story:** —
- **Zugang:** Öffentlicher Raum, jederzeit zugänglich. Sony Center: frei begehbares Atrium. U-Bahn/S-Bahn Potsdamer Platz.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Sony_Center_Potsdamer_Platz_Berlin.jpg/1200px-Sony_Center_Potsdamer_Platz_Berlin.jpg

#### Reichstag · Foster-Kuppel
- **Architekt:** Norman Foster
- **Jahr:** 1999
- **Ort:** Platz der Republik 1, Mitte
- **Status:** Öffentlich zugänglich · Voranmeldung erforderlich
- **Tag/Label:** Norman Foster · 1999
- **Teaser DE:** Transparenz als Demokratie-Metapher. Der Besucher steht buchstäblich über dem Parlament und schaut hinunter in den Plenarsaal.
- **Teaser EN:** Transparency as a metaphor for democracy. The visitor literally stands above parliament and looks down into the chamber.
- **Fließtext DE:** Foster gewann den Wettbewerb 1992, kurz nach der Wiedervereinigung. Die Kuppel aus Stahl und Glas sitzt über dem Plenarsaal. Besucher gehen über eine Spiralrampe nach oben und schauen durch einen zentralen Spiegel in den Plenarsaal hinunter. Der Bürger steht buchstäblich über dem Parlament. Die Voranmeldung ist obligatorisch.
- **Story:** —
- **Zugang:** Voranmeldung zwingend: besucherservice.bundestag.de. Kostenlos, aber begrenzte Kapazität — frühzeitig buchen. Täglich 8–24 Uhr. S/U-Bahn Hauptbahnhof oder U55 Bundestag.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Reichstag_building_Berlin_view_from_west_before_sunset.jpg/1200px-Reichstag_building_Berlin_view_from_west_before_sunset.jpg

#### Regierungsviertel · Band des Bundes
- **Architekt:** Axel Schultes & Charlotte Frank (Kanzleramt: Schultes Frank) / Busmann + Haberer (Paul-Löbe-Haus)
- **Jahr:** 1990er–2001
- **Ort:** Spreebogen
- **Status:** Außenraum frei zugänglich
- **Tag/Label:** Band des Bundes · Schultes Frank · 1990er
- **Teaser DE:** Das Band des Bundes verbindet Ost- und West-Berlin physisch. Im Kontext der Schweizer Botschaft ergibt sich die vollständige Lektüre des Spreebogens.
- **Teaser EN:** The Band of the Federation physically connects East and West Berlin. In the context of the Swiss Embassy, a complete reading of the Spreebogen emerges.
- **Fließtext DE:** Das Band des Bundes von Axel Schultes und Charlotte Frank ist die städtebauliche Geste der Berliner Republik: ein lineares Gebäude, das die Spree überquert und Ost- und West-Berlin physisch verbindet. Das Bundeskanzleramt (2001) liegt unmittelbar daneben — ein wuchtiger Baukörper, im Volksmund "Waschmaschine" oder "Kohlosseum" genannt. Im Kontext der Schweizer Botschaft nebenan ergibt sich die vollständige Lektüre des Spreebogens: das Überlebende, das Neue, das Amtliche.
- **Story:** —
- **Zugang:** Außenraum jederzeit zugänglich. Kanzleramt: Außenansicht frei, Führungen an bestimmten Tagen — bundesregierung.de. S/U-Bahn Hauptbahnhof.
- **Foto:** (Placeholder)

#### DZ Bank
- **Architekt:** Frank O. Gehry / Schlaich Bergermann & Partner
- **Jahr:** 2001
- **Ort:** Pariser Platz 3, Mitte
- **Status:** Bürogebäude · Innen nur mit Führung
- **Tag/Label:** Frank Gehry · 2001
- **Teaser DE:** Außen brav, innen spektakulär. Die Stadtgestaltungssatzung zwang Gehry zur Zurückhaltung an der Fassade — er baute seinen wildesten Raum dahinter.
- **Teaser EN:** Restrained outside, spectacular inside. Planning regulations forced Gehry to hold back on the facade — he built his wildest space behind it.
- **Fließtext DE:** Die Stadtgestaltungssatzung am Pariser Platz schreibt Sandstein, geschlossene Fassade und zurückhaltende Öffnungen vor. Gehry fügte sich nach außen vollständig. Innen wächst aus dem Boden eine skulpturale Stahl-Glas-Konstruktion — ein biomorphes Konferenzgehäuse, das Gehry als sein bestes Werk bezeichnete. Der Konferenzraum fasst 80 Personen, darunter ein Forum für bis zu 500 Gäste. Das Gebäude stellt eine direkte Frage an Stadtplanung: Was geht verloren, wenn Gestaltungsregeln zu eng werden?
- **Story:** Zugang — Der Innenhof ist nicht öffentlich zugänglich. Gruppenführungen buchbar über Axica (axica.de) oder Ticket B Berlin (ticket-b.de).
- **Zugang:** Fassade jederzeit. Innen nur mit Führung (axica.de / ticket-b.de). S/U-Bahn Brandenburger Tor.
- **Foto:** (kein gutes öffentliches Foto verfügbar — Placeholder)

#### Deutsches Historisches Museum · Pei-Erweiterung
- **Architekt:** I. M. Pei
- **Jahr:** 2003
- **Ort:** Unter den Linden 2, Mitte
- **Status:** Museum · dhm.de
- **Tag/Label:** I. M. Pei · 2003
- **Teaser DE:** Peis Glasspiral verbindet das Barockzeughaus mit zeitgenössischen Ausstellungsräumen. Sein letztes europäisches Werk.
- **Teaser EN:** Pei's glass spiral connects the baroque Zeughaus with contemporary exhibition spaces. His last European work.
- **Fließtext DE:** Pei baute seinen Berliner Erweiterungsbau mit 73 Jahren. Die Glasspiral verbindet das Zeughaus (1706, das älteste Gebäude Unter den Linden) mit neuen Ausstellungsräumen. Man dreht sich hinauf und gelangt dabei immer wieder zu Ausblicken auf den barocken Zeughausbau daneben. Peis Berliner Bau ist das Gegenstück zur Pariser Pyramide im Louvre (1989): dort das spektakuläre Statement, hier die zurückhaltende Verbindung zweier Zeitebenen.
- **Story:** —
- **Zugang:** dhm.de · Täglich 10–18 Uhr. Eintritt ca. 8 €. Bus 100/TXL Unter den Linden.
- **Foto:** (Placeholder)

#### Niederländische Botschaft
- **Architekt:** OMA / Rem Koolhaas
- **Jahr:** 2003
- **Ort:** Klosterstraße 50, Mitte
- **Status:** Botschaft · Außenansicht frei
- **Tag/Label:** OMA · Rem Koolhaas · 2003
- **Teaser DE:** Eine spiralförmige Wegführung durch alle Stockwerke. Körper und Transparenz in Spannung. Einer der wichtigsten Botschaftsbauten weltweit.
- **Teaser EN:** A spiral route through all floors. Volume and transparency in tension. One of the most significant embassy buildings in the world.
- **Fließtext DE:** Die Niederländische Botschaft ist eines von Koolhaas' überzeugendsten Gebäuden — und kaum jemand kennt es. Eine spiralförmige Wegführung durch alle Stockwerke: eine Rampe, die sich durch das Gebäude windet und dabei immer wieder Ausblicke und Überraschungen bietet. Von außen: ein Kubus mit unregelmäßig gesetzten Fenstern — transparent oder opak je nach Funktion des dahinterliegenden Raums.
- **Story:** —
- **Zugang:** Botschaft, kein öffentlicher Zugang. Außenansicht jederzeit. Open Days gelegentlich (niederlaendische-botschaft.de). U-Bahn U2 Haltestelle Klosterstraße.
- **Foto:** (Placeholder)

**Dining Tag 4:**
- Mittagessen: Borchardt — Französische Straße 47, Mitte. Historischer Gründerzeit-Saal, Stuckdecke, gut erhaltenes Interieur. Berliner Institution.
- Abendessen: Lutter & Wegner — Charlottenstraße 56, Mitte. Weinrestaurant seit 1811. Gründerzeitinterieur, österreichische Küche, nahe Gendarmenmarkt.

---

### Tag 5 — Osten

#### Haus Lemke
- **Architekt:** Ludwig Mies van der Rohe
- **Jahr:** 1932/33
- **Ort:** Oberseestraße 60, Hohenschönhausen
- **Status:** Öffentlich zugänglich · Eintritt frei
- **Tag/Label:** Mies van der Rohe · 1932/33 · Eintritt frei
- **Teaser DE:** Letztes deutsches Wohnhaus vor Mies' Emigration. L-förmiger Klinkerbau am Obersee. Erstmalige Umsetzung des Hofhaus-Prinzips. Von der Stasi als Lager genutzt.
- **Teaser EN:** Mies' last German house before emigration. L-shaped brick building on the Obersee. First realisation of the courtyard house principle. Used by the Stasi as a storage facility.
- **Fließtext DE:** Haus Lemke ist das letzte Wohnhaus, das Mies van der Rohe in Deutschland baute, bevor er 1938 vor den Nazis emigrierte. Für den Druckereibesitzer Karl Lemke und seine Frau Martha entstand ein eingeschossiger L-förmiger Klinkerbau am Obersee. Es ist die erste Umsetzung des Hofhaus-Prinzips: Der Hof als erweiterter Wohnraum, kein Drinnen und Draußen. Die breiten Glasfronten zur Terrasse lösen die Grenze auf. Die Familie bewohnte das Haus bis 1945. Dann beschlagnahmt, später von der Stasi als Lager genutzt. Nach der Wende restauriert, heute Ausstellungsort. Neben der Neuen Nationalgalerie ist es Mies' wichtigster Berliner Beitrag — das kleinere, intimere der beiden.
- **Story:** —
- **Zugang:** Eintritt frei. Di–So 11–17 Uhr. Gruppenführungen mit Anmeldung: miesvanderrohehaus.de. Tram M5 Haltestelle Oberseestraße.
- **Foto:** (Placeholder)

#### Karl-Marx-Allee · Abschnitt 2 · Café Moskau
- **Architekt:** Josef Kaiser / Werner Dutschke
- **Jahr:** 1958–1965
- **Ort:** Karl-Marx-Allee, Friedrichshain
- **Status:** Öffentlicher Raum · Café Moskau als Restaurant
- **Tag/Label:** DDR-Moderne · 1958–1965
- **Teaser DE:** Die architektonische Selbstkorrektur der DDR nach Stalins Tod. Plattenbau trifft internationale Moderne. Café Moskau als elegantes Herzstück.
- **Teaser EN:** The GDR's architectural self-correction after Stalin's death. Prefab meets international modernism. Café Moskau as its elegant centrepiece.
- **Fließtext DE:** Nach Stalins Tod 1953 und Chruschtschows Kritik an "Exzessen" sollte die DDR modern werden. Kaiser gewann den Wettbewerb mit einem Entwurf, der Plattenbauweise mit internationalem Modernismus verband. Das Café Moskau (1964) ist das eleganteste Gebäude: schwebende Dachkonstruktion, Glasfassade, Mosaik im Innenraum. Ein Ort, an dem die DDR-Nomenklatura kosmopolitisch erscheinen wollte.
- **Story:** —
- **Zugang:** Jederzeit von außen zugänglich. U-Bahn U5 Haltestelle Schillingstraße.
- **Foto:** (Placeholder)

#### Berghain
- **Architekt:** Heizkraftwerk (DDR, 1953) · Umbau: studio karhard (2004)
- **Jahr:** 1953 / 2004
- **Ort:** Rüdersdorfer Straße, Friedrichshain
- **Status:** Club · Außenansicht frei
- **Tag/Label:** DDR-Heizkraftwerk 1953 · Club 2004
- **Teaser DE:** Für die Stalinallee gebaut, von Mitarbeitern "Fernheizoper" genannt. 2016 von einem deutschen Gericht als Hochkultur anerkannt. Der Name selbst ein Wende-Symbol.
- **Teaser EN:** Built to heat the Stalinallee, nicknamed "district-heating opera" by workers. Recognised as high culture by a German court in 2016. The name itself a symbol of reunification.
- **Fließtext DE:** Das Berghain ist ein DDR-Heizkraftwerk aus dem Jahr 1953 — im Stil des sozialistischen Klassizismus für die Stalinallee gebaut. Die Mitarbeiter nannten es "Fernheizoper." 1988 vom Netz gegangen, jahrzehntelang leer. 2004 Umbau zum Club durch studio karhard. Das Berghain wurde schnell zum bekanntesten Club der Welt. 2016 erkannte ein deutsches Finanzgericht es als Ort der Hochkultur an — seine Veranstaltungen sind steuerlich mit Konzerten gleichgestellt. Der Name: ein Kofferwort aus Friedrichshain (Ost) und Kreuzberg (West). Das Gebäude steht auf der Grenze der früheren Sektoren.
- **Story:** Nachnutzung als Architektur — Das Berghain ist von außen gut lesbar: die Dimension des Maschinenhauses, die Gliederung der Fassade. Der Umbau durch studio karhard ist ein Lehrstück für Nachnutzung von Industriearchitektur.
- **Zugang:** Außenansicht jederzeit. Club: Wochenende (Fr–Mo), Einlass selektiv, keine Garantie. S-Bahn S5/S7/S75 Haltestelle Ostbahnhof.
- **Foto:** (Placeholder)

#### Tacheles
- **Jahr:** AEG-Kaufhaus 1909 · Kunsthaus 1990–2012 · heute Luxuswohnanlage
- **Ort:** Oranienburger Straße 54–56, Mitte
- **Status:** Nicht mehr als Ruine zugänglich · Außenansicht
- **Tag/Label:** Geschichte · 1990–2012
- **Teaser DE:** Zwölf Jahre anarchisches Kunstzentrum in einer Bombentruine, dann Kapitulation an den Immobilienmarkt. Das Gebäude ist Kulisse. Die Geschichte ist die Aussage.
- **Teaser EN:** Twelve years of anarchic art centre in a bombed-out shell, then surrender to the property market. The building is backdrop. The history is the statement.
- **Fließtext DE:** Das AEG-Kaufhaus von 1909, nach dem Krieg zur Ruine geworden, von 1990 bis 2012 als anarchisches Kunstzentrum genutzt, wurde 2014 umgebaut und ist heute ein Luxusprojekt. In den ersten Jahren nach der Wende gab es in Ost-Berlin Hunderte leer stehende Gebäude, die von Künstlern und Aktivisten besetzt wurden. Das Tacheles war das bekannteste. Das Ende 2012 war ein Signal: der Berliner Immobilienmarkt hatte die Wende-Anarchie eingeholt. Das Gebäude ist Kulisse. Die Geschichte ist die Aussage.
- **Story:** —
- **Zugang:** Von außen zugänglich, Oranienburger Straße. S-Bahn S1/S2/S25 Haltestelle Oranienburger Straße.
- **Foto:** (Placeholder)

#### Axel Springer Campus
- **Architekt:** OMA / Rem Koolhaas
- **Jahr:** 2020
- **Ort:** Axel-Springer-Straße, Kreuzberg
- **Status:** Bürogebäude · Außenansicht frei
- **Tag/Label:** OMA · Rem Koolhaas · 2020
- **Teaser DE:** Über dem Mauerstreifen gebaut. Der Riss im Grundriss folgt dem Mauerverlauf. Das offene Atrium als räumliches Gegenprogramm zur Teilung.
- **Teaser EN:** Built over the death strip. The split in the floor plan follows the Wall's course. The open atrium as a spatial counter-programme to division.
- **Fließtext DE:** Der Axel Springer Campus entstand auf einem Grundstück, das der Mauerstreifen durchschnitt. Koolhaas/OMA organisierten den Grundriss entlang des Mauerverlaufs — der Riss im Gebäude ist die Mauer. Das offene Atrium verbindet alle Etagen. Das ursprüngliche Axel-Springer-Hochhaus von 1966 stand absichtlich direkt an der Mauer — als provokatives West-Berliner Statement. Jetzt steht OMA auf demselben Terrain, mit demselben Bewusstsein, aber umgekehrtem Vorzeichen.
- **Story:** —
- **Zugang:** Bürogebäude, kein öffentlicher Zugang. Außenansicht und Foyer ggf. zugänglich. U-Bahn U6 Haltestelle Kochstraße.
- **Foto:** (Placeholder)

**Dining Tag 5:**
- Mittagessen: Café Moskau — Karl-Marx-Allee 34, Friedrichshain. Auf der Route, direkt an den DDR-Bauten.
- Abendessen: Pauly Saal — Auguststraße 11–13, Mitte. Im ehemaligen Gemeindehaus der Jüdischen Mädchenschule. Der Clash zwischen Geschichte und Gegenwart ist hier am direktesten spürbar.

---

### Tag 6 — 21. Jahrhundert

#### Neues Museum
- **Architekt:** David Chipperfield Architects (Restaurierung/Ergänzung)
- **Jahr:** 2009 (ursprüngliches Gebäude: Friedrich August Stüler, 1855)
- **Ort:** Museumsinsel
- **Status:** Museum · smb.museum
- **Tag/Label:** David Chipperfield · 2009
- **Teaser DE:** Das Zerstörte wurde nicht rekonstruiert, sondern ehrlich belassen. Chipperfields Grundsatz: Kontinuität vor Perfektion.
- **Teaser EN:** The destroyed was not reconstructed but honestly retained. Chipperfield's principle: continuity over perfection.
- **Fließtext DE:** Das Neues Museum war nach dem Zweiten Weltkrieg eine Ruine, jahrzehntelang vernachlässigt. Als Chipperfield 1997 den Wettbewerb gewann, entschied er sich gegen vollständige Rekonstruktion. Seine Methode: Was zerstört war, wird in neuer Materialität ergänzt — Beton statt Stuck, einfache Formen statt historisierender Ornamente. Einschusslöcher, verblichene Fresken, gesprungener Boden — dokumentiert und eingebettet, nicht getilgt. Das Museum erzählt nicht nur seine Sammlung, sondern sich selbst.
- **Story:** Kontinuität — Chipperfields Grundsatz: Das Alte wird nicht imitiert. Es tritt in Dialog mit dem Neuen. Wer das Neues Museum besucht, versteht Denkmalpflege als architektonische Haltung.
- **Zugang:** smb.museum · Di–Fr 10–18 Uhr, Do bis 20 Uhr, Sa/So 11–18 Uhr. Eintritt ca. 14 € (Museumsinsel-Ticket 19 €, alle 5 Museen). S/U-Bahn Friedrichstraße.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Neues_Museum_Berlin_2011.jpg/1200px-Neues_Museum_Berlin_2011.jpg

#### James Simon Galerie
- **Architekt:** David Chipperfield Architects
- **Jahr:** 2019
- **Ort:** Museumsinsel
- **Status:** Öffentlich zugänglich · freier Eintritt
- **Tag/Label:** David Chipperfield · 2019
- **Teaser DE:** Das neue Eingangsgebäude der Museumsinsel — benannt nach dem jüdischen Mäzen, dessen Namen die Nationalsozialisten getilgt hatten.
- **Teaser EN:** The new entrance building to the Museumsinsel — named after the Jewish patron whose name the National Socialists erased.
- **Fließtext DE:** Die James Simon Galerie ist das neue Eingangsgebäude der Museumsinsel — benannt nach James Simon, dem jüdischen Mäzen, der die Museumsinsel wesentlich mitfinanzierte und dessen Namen die Nationalsozialisten aus der Berliner Geschichte tilgten. Chipperfields Gebäude ist zurückhaltend. Eine Kolonnade entlang des Kupfergrabens, klarer Beton, wenig Geste. Der Innenraum dient als Foyer für alle fünf Museen der Insel.
- **Story:** —
- **Zugang:** Freier Zugang als öffentlicher Raum. Café und Ticketverkauf im Gebäude. S/U-Bahn Friedrichstraße.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/James_Simon_Galerie_Berlin_2019.jpg/1200px-James_Simon_Galerie_Berlin_2019.jpg

#### Haus Bastian
- **Architekt:** David Chipperfield Architects
- **Jahr:** 2007
- **Ort:** Am Kupfergraben 10
- **Status:** Galerie für kulturelle Bildung · smb.museum
- **Tag/Label:** David Chipperfield · 2007
- **Teaser DE:** Galerie für kulturelle Bildung am Kupfergraben. Sorgfältig, zurückhaltend. Der dritte Chipperfield-Eingriff in unmittelbarer Nähe.
- **Teaser EN:** Gallery for cultural education on the Kupfergraben. Careful, restrained. The third Chipperfield intervention in immediate proximity.
- **Fließtext DE:** Haus Bastian ist der ruhigste der drei Chipperfield-Bauten auf der Museumsinsel. Gestiftet von dem Mäzenatenpaar Heiner und Yvonne Bastian. Weiß verputzt, präzise gesetzte Öffnungen, zurückhaltender Sockel. Chipperfield wählt Materialien und Proportionen, die im Dialog mit dem historischen Kontext stehen, ohne ihn zu imitieren.
- **Story:** —
- **Zugang:** Programmabhängig geöffnet — smb.museum für aktuelle Ausstellungen. Fußläufig von der Museumsinsel.
- **Foto:** (Placeholder)

#### Emnify / Sauerbruch Hutton Bauten
- **Architekt:** Louisa Hutton & Matthias Sauerbruch
- **Jahr:** diverse (GSW-Hochhaus 1999, weitere Berliner Bauten)
- **Ort:** Mitte / Kreuzberg
- **Status:** Bürogebäude · Außenansicht frei
- **Tag/Label:** Sauerbruch Hutton
- **Teaser DE:** Farbe als architektonisches System. Das Berliner Büro mit dem konsequentesten ästhetischen Eigensinn der Stadt.
- **Teaser EN:** Colour as architectural system. The Berlin practice with the most consistent aesthetic identity in the city.
- **Fließtext DE:** Sauerbruch Hutton ist das Berliner Büro mit dem konsequentesten Farbsystem. Farbe nicht als Dekoration, sondern als Struktur, die Räume gliedert und Oberflächen differenziert. Das GSW-Hochhaus (1999, Charlottenstraße) — eine doppelte Fassade, die den Energieverbrauch reduziert und ein changierendes Farbbild erzeugt. Eines der frühen Berliner Werke des Büros und bis heute Referenzprojekt.
- **Story:** —
- **Zugang:** Bürogebäude. Außenansicht jederzeit. Führungen über sauerbruchhutton.com anfragbar.
- **Foto:** (Placeholder)

#### Chipperfield Campus Joachimstraße
- **Architekt:** David Chipperfield Architects
- **Ort:** Joachimstraße, Mitte
- **Status:** Büro · Außenansicht
- **Tag/Label:** David Chipperfield Architects
- **Teaser DE:** Das Büro als gebaute Aussage. Abschluss des Chipperfield-Fadens, der durch Tag 2, 4 und 6 läuft.
- **Teaser EN:** The office as a built statement. Closing the Chipperfield thread that runs through days 2, 4 and 6.
- **Fließtext DE:** Das Büro von Chipperfield in der Joachimstraße: ein Ensemble aus Berliner Altbauten, behutsam zusammengefügt. Das Büro zeigt, wie Chipperfield arbeitet, bevor das Projekt beginnt. Wer hier ankommt, nachdem er das Neues Museum, die Neue Nationalgalerie, die James Simon Galerie und Haus Bastian gesehen hat, versteht: Das Büro ist die Haltung, die Gebäude sind die Konsequenz.
- **Story:** —
- **Zugang:** Büro, kein öffentlicher Zugang. Außenansicht jederzeit. U-Bahn U6 Haltestelle Oranienburger Tor.
- **Foto:** (Placeholder)

#### Reichstag · Abschluss (optional)
- **Architekt:** Norman Foster
- **Jahr:** 1999
- **Ort:** Platz der Republik 1, Mitte
- **Status:** Öffentlich zugänglich · Voranmeldung
- **Tag/Label:** Norman Foster · 1999 · Optional
- **Teaser DE:** Von der Kuppel aus ist die gesamte Geografie der Tour sichtbar: Tiergarten, Spreebogen, Potsdamer Platz, Friedrichshain.
- **Teaser EN:** From the dome, the entire geography of the tour is visible: Tiergarten, Spreebogen, Potsdamer Platz, Friedrichshain.
- **Fließtext DE:** Von der Reichstagskuppel aus sieht man die vollständige Geografie aller sechs Tage: Tiergarten, Spreebogen mit Schweizer Botschaft, Potsdamer Platz, die Achse Unter den Linden, im Nordosten die Karl-Marx-Allee. Berlin als Karte der eigenen Woche.
- **Story:** —
- **Zugang:** Voranmeldung zwingend: besucherservice.bundestag.de. Kostenlos. Täglich 8–24 Uhr. Frühzeitig buchen.
- **Foto:** https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Reichstag_building_Berlin_view_from_west_before_sunset.jpg/1200px-Reichstag_building_Berlin_view_from_west_before_sunset.jpg

**Dining Tag 6:**
- Mittagessen: Café im Zeughaus — Unter den Linden 2 (DHM). Im Innenhof des Zeughaus, direkt nach dem Pei-Bau. Historischer Rahmen.
- Abendessen: Lutter & Wegner — Charlottenstraße 56, Mitte. Weinrestaurant seit 1811. Guter Abschluss einer langen Woche.

---

## 7. Textregeln (für alle Texte in der Seite)

1. **Keine Gedankenstriche (em dash —).** Wenn Pause nötig: einfaches Minus mit Leerzeichen ` - ` oder Satz neu strukturieren.
2. **Keine "Nicht X sondern Y"-Konstruktionen.** Positiv formulieren.
3. **Keine LLM-Rhetorik.** Kein "Diese Tour folgt keiner...", kein "Dies zeigt eindrucksvoll...", kein "Es ist bemerkenswert..."
4. **Keine Bindestriche in zusammengesetzten Begriffen.** "Architektur Tour" nicht "Architektur-Tour", "DDR Moderne" nicht "DDR-Moderne." (Ausnahme: etablierte Eigennamen wie "Karl-Marx-Allee")
5. **Neutrale Formulierungen.** Kein Verweis auf "Stephens Liste", "Brickworks", oder eine bestimmte Gruppe.
6. **Fachlich korrekt.** Jahreszahlen, Architektennamen, Öffnungszeiten müssen stimmen.

---

## 8. Implementierungshinweise für Cursor

### Dateistruktur
Einzelne HTML-Datei: `berlinarchtour.html`
- Kein externes CSS
- Kein externes JS
- Fonts: System-Font-Stack
- Bilder: Wikipedia Commons URLs (öffentliche Domain) mit `onerror`-Fallback auf Placeholder-Div

### JavaScript-Anforderungen
- Sprachumschaltung: `setLang('de')` / `setLang('en')` mit Body-Klasse
- Modal: `openModal(id)`, `closeModal()`, Escape-Key-Handler
- Aktive Day-Nav: `IntersectionObserver` threshold 0.25
- Beim Öffnen Modal in aktueller Sprache rendern (nicht bei Seitenaufbau vorrenden)

### Bilder
Alle Foto-URLs sind Wikipedia Commons (public domain). Pattern:
```
https://upload.wikimedia.org/wikipedia/commons/thumb/[hash]/[file]/800px-[file]
```
Für Modals: `1200px-[file]` Version.

Bei Stops ohne passendes öffentliches Foto: Placeholder-Div mit `class="stop-ph"` und Projekt-Name als Text.

### Mobile
- `grid-template-columns: 1fr` ab 640px
- Day-Header Grid collapsed
- Kurz-Nav (1–6 Zahlen) bleibt; lange Day-Nav-Texte werden bei Bedarf scrollbar

### Keine Browser-Storage-APIs
Kein localStorage, kein sessionStorage. Alle States in JS-Variablen.

---

## 9. Vollständige Prüfliste — Stopps aus Stephens Originalliste

Alle Stopps aus der Originalliste von Stephen Varady sind in der Tour enthalten:

| Stephens Stop | Tag in der Tour | Anmerkung |
|---|---|---|
| Jewish Museum (Libeskind) | Tag 3 | Vollständig |
| Holocaust Memorial (Eisenman) | Tag 3 | Vollständig |
| David Chipperfield Office Campus | Tag 6 | Vollständig |
| Neues Museum (Chipperfield) | Tag 6 | Vollständig |
| James Simon Galerie (Chipperfield) | Tag 6 | Vollständig |
| Haus Bastian (Chipperfield) | Tag 6 | Vollständig (explizit, nicht subsumiert) |
| Haus am Checkpoint Charlie (Eisenman) | Tag 3 | Vollständig |
| Neue Nationalgalerie (Mies/Chipperfield) | Tag 2 | Vollständig |
| German Historical Museum / Pei | Tag 4 | Vollständig |
| Emnify (Sauerbruch Hutton) | Tag 6 | Vollständig |
| Netherlands Embassy (OMA) | Tag 4 | Vollständig |
| Axel Springer Campus (OMA) | Tag 5 | Vollständig |
| Sale e Tabacchi (Lunch/Dinner) | Tag 3, Dining | Als Mittagessen-Empfehlung |

---

## 10. Offene Punkte / Empfehlungen an Cursor

1. **Foto-Bibliothek:** Wikipedia-URLs laden extern. Für Produktion: Fotos lokal hosten oder CDN. Bis dahin funktioniert der `onerror`-Fallback.

2. **Kino International:** Sanierung bis voraussichtlich 2026 — Öffnungsstatus in der Zugangs-Information vor Go-Live prüfen.

3. **DZ Bank Innenraum:** Für Gruppenführungen frühzeitig bei Axica (axica.de) anfragen — begrenzte Kapazität.

4. **Reichstag:** Voranmeldung über besucherservice.bundestag.de — Buchung Monate im Voraus erforderlich. Hinweis in der Tour prominent platzieren.

5. **Sprach-URLs:** Optionale Erweiterung: `?lang=en` in der URL für direkten Sprach-Link.

6. **SEO:** Wenn als echte Subpage deployed — `<meta description>`, Open Graph Tags, `<lang>` dynamisch setzen.
