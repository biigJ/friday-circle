(function () {
  function resolvePage() {
    var path = location.pathname;
    if (/\/register-accountability(\/|$)/.test(path)) return "register-accountability";
    if (/\/register-training(\/|$)/.test(path)) return "register-training";
    if (/\/biig-interior(\/|$)/.test(path)) return "biig-interior";
    var tail = path.split("/").pop() || "index.html";
    if (!tail || tail === "") return "index.html";
    if (!/\./.test(tail)) return "index.html";
    return tail.replace(/^\//, "");
  }
  var PAGE = resolvePage();

  /** @type {Record<string, Array<{s:string,de:string,en:string,html?:boolean}>>} */
  var MAP = {
    "index.html": [
      { s: "#fc-stoerer .gogl-stoerer__welcome-copy", html: true, de: 'Das Gefühl, ins Wochenende zu starten. Am Freitag zurückschauen und genauso nach vorne. FRIDAY CIRCLE steht für die Werte Gemeinschaft, Routine, Lebensfreude, Bewegung & Alles geben. Eine private Gruppe im Gym ist der Namensgeber. Unter dem Namen möchte ich sukzesiv alles sammeln, was uns hilft, aus dem Alleinsein, aus Desinformation, aus permanenter Ablenkung und aus Dogmen wieder beweglich zu werden.<br /> Ich will mit Euch die Welt mit wohlwollendem Interesse anschauen. Sich frei und zufrieden fühlen - frei nach dem Song: "It\'s Friday ..." Lass uns reden! Herzlichst, Joscha', en: 'That Friday feeling before the weekend. Looking back on Friday and forward with clarity. FRIDAY CIRCLE stands for community, routine, joy, movement, and giving your all. A private gym group gave us the name. Under it I gather what helps us move again: out of isolation, disinformation, constant distraction, and dogma.<br /> I want to look at the world with benevolent interest together with you. Feeling free and content — as the song says: "It\'s Friday ..." Let\'s talk! Warmly, Joscha' },
      { s: '#fc-stoerer a[href="gogogo-landing.html"]', de: "Mir geht's um Sport", en: "I'm here for sport" },
      { s: "#fc-stoerer .gogl-stoerer__cta--dismiss-only", de: "FRIDAY CIRCLE", en: "FRIDAY CIRCLE" },
      { s: "#hero-heading .nowrap:nth-child(1)", de: "Programme für echten Antrieb", en: "Programs for real momentum" },
      { s: "#hero-heading .nowrap:nth-child(2)", de: "im Alltag", en: "in everyday life" },
      { s: ".hero__lede", de: "Digitale Überstimulierung ist das zentrale Problem unserer Zeit. Friday Circle findet menschliche Gegengewichte für Klarheit und Authentizität.", en: "Digital overstimulation is the central problem of our time. Friday Circle finds human counterweights for clarity and authenticity." },
      { s: "#landing-name-heading .nowrap:nth-child(1)", de: "Warum der Name", en: "Why the name" },
      { s: "#landing-name-heading .nowrap:nth-child(2)", de: "FRIDAY CIRCLE?", en: "FRIDAY CIRCLE?" },
      { s: ".landing-name-story__quote", de: "„It's Friday.“", en: '"It\'s Friday."' },
      { s: ".landing-name-story__prose .landing-name-story__text:nth-of-type(1)", de: "Am Freitagmittag kommt Freude auf. Du hast etwas geschafft – und bevor das Wochenende beginnt, gibst du noch eine ehrliche Antwort auf deine aktuelle Herausforderung. Mit dem Tribe ein letztes Zirkeltraining. Oder erst das E-Mail-Paket schnüren, dann schwitzen, dann zufrieden in den Wochenendmodus starten. Du merkst, dass du selbstwirksam bist.", en: "On Friday afternoon, joy arrives. You have achieved something — and before the weekend begins, you give an honest answer to your current challenge. A final circuit with the tribe. Or pack up email first, then sweat, then start the weekend satisfied. You feel self-effective." },
      { s: ".landing-name-story__prose .landing-name-story__text:nth-of-type(2)", de: "Wir glauben an den Wochenzyklus und diese bewusst gesetzten Momente. Wir glauben an eine gute Zeit mit unseren glückdienlichen Routinen und Momenten des Flows und der Ausgelassenheit. „It's Friday…“", en: "We believe in the weekly cycle and these consciously set moments. We believe in good times with life-affirming routines and moments of flow and ease. \"It's Friday…\"" },
    ],
    "ziele.html": [
      { s: "#ziele-heading .nowrap:nth-child(1)", de: "Ziele von", en: "Goals of" },
      { s: "#ziele-heading .nowrap:nth-child(2)", de: "Friday Circle", en: "Friday Circle" },
      { s: ".hero__lede", de: "Du hast genug Informationen. Genug Apps. Genug Optionen. Was fehlt ist jemand der mit dir herausfindet was davon wirklich zählt – und was nur Lärm ist.", en: "You have enough information. Enough apps. Enough options. What is missing is someone who helps you find out what really matters — and what is just noise." },
      { s: ".goals-overlay__copy p:nth-of-type(1)", de: "Friday Circle baut Programme die genau das tun. Bewegung zuerst, weil sie das wirksamste und zugänglichste Werkzeug ist. Dann Alltag, Raum, Fokus. Jedes Programm hat ein Ende – weil Abhängigkeit nicht unser Ziel ist. Deine Autonomie schon.", en: "Friday Circle builds programs that do exactly that. Movement first, because it is the most effective and accessible tool. Then everyday life, space, focus. Every program has an end — because dependency is not our goal. Your autonomy is." },
      { s: ".goals-overlay__copy p:nth-of-type(2)", de: "Technologie beschleunigt seit Jahrzehnten – Buchdruck, Dampfmaschine, Internet. Der Unterschied heute: die Beschleunigung findet permanent in deiner Hosentasche statt. Friday Circle ist kein Gegner von Technologie. Aber ein Mensch der seinen Körper kennt, seinen Alltag im Griff hat und weiß was ihm wichtig ist, nutzt Technologie besser als jemand der von ihr getrieben wird.", en: "Technology has been accelerating for decades — printing press, steam engine, internet. The difference today: acceleration happens permanently in your pocket. Friday Circle is not against technology. But someone who knows their body, has control of their week, and knows what matters uses technology better than someone driven by it." },
      { s: ".goals-overlay__copy p:nth-of-type(3)", de: "Unsere Mission: Menschen handlungsfähig machen. Schnell. Ohne Umwege.", en: "Our mission: make people capable of action. Quickly. Without detours." },
      { s: ".goals-overlay__cta", html: true, de: '→ Erstes Programm: <span class="goals-overlay__cta-brand">gogogo</span>', en: '→ First program: <span class="goals-overlay__cta-brand">gogogo</span>' },
    ],
    "loesungen.html": [
      { s: "#loesungen-heading .nowrap:nth-child(1)", de: "Wir streben", en: "We pursue" },
      { s: "#loesungen-heading .nowrap:nth-child(2)", de: "Lösungen an.", en: "solutions." },
      { s: ".hero__lede", de: "Wir bauen Angebote die du irgendwann nicht mehr brauchst. Das ist unser Geschäftsmodell – nicht deine Abhängigkeit.", en: "We build offers you will eventually no longer need. That is our business model — not your dependency." },
      { s: ".loesungen-overlay__copy p:nth-of-type(1)", de: "Jedes Programm ist darauf ausgelegt, dass du am Ende weißt, wie es geht: klar, effektiv, abgeschlossen.", en: "Every program is designed so that in the end you know how it works: clear, effective, complete." },
      { s: ".loesungen-overlay__subhead:nth-of-type(1)", de: "Warum Friday Circle entstanden ist.", en: "Why Friday Circle was created." },
      { s: ".loesungen-overlay__copy p:nth-of-type(2)", de: "Es gibt genug Angebote. Es fehlt die Frage: Was hält dich in deiner Woche wirklich auf? Wir nehmen uns Zeit für deine Geschichte und deine Kapazitäten.", en: "There are enough offers. What is missing is the question: what really holds you back in your week? We take time for your story and your capacity." },
      { s: ".loesungen-overlay__subhead:nth-of-type(2)", de: "Was uns unterscheidet.", en: "What sets us apart." },
      { s: ".loesungen-overlay__copy p:nth-of-type(3)", de: "Wir verdienen an deinem Ergebnis, nicht an Dauerbindung. Weniger Overhead, weniger Lifestyle, mehr Substanz.", en: "We earn from your outcome, not from lock-in. Less overhead, less lifestyle, more substance." },
      { s: ".page-continuation h2:nth-of-type(1)", de: "Was Minimalismus bei uns bedeutet.", en: "What minimalism means for us." },
      { s: ".page-continuation__inner > p:nth-of-type(1)", de: "Nicht weniger besitzen. Nicht bewusster konsumieren. Nicht ein weiterer Lifestyle dem du folgst. Minimalismus bei Friday Circle bedeutet: Überflüssiges aus dem Weg räumen damit das Wesentliche Raum bekommt. Das gilt für deinen Trainingsplan genauso wie für dein Büro, deine Garderobe, deine Woche.", en: "Not owning less. Not consuming more mindfully. Not another lifestyle to follow. Minimalism at Friday Circle means clearing what is unnecessary so the essential has room. That applies to your training plan as much as your office, wardrobe, and week." },
      { s: ".page-continuation__inner > p:nth-of-type(2)", de: "Jedes Programm folgt derselben Logik: Erst verstehen was im Weg steht. Dann so wenig wie nötig verändern um den größten Effekt zu erzielen.", en: "Every program follows the same logic: first understand what is in the way. Then change as little as necessary for the greatest effect." },
      { s: ".page-continuation h2:nth-of-type(2)", de: "Keine Datenverwertung. Keine wirtschaftlichen Interessenkonflikte.", en: "No data exploitation. No economic conflicts of interest." },
      { s: ".page-continuation__inner > p:nth-of-type(3)", de: "Was du uns erzählst bleibt bei uns. Wir verkaufen keine Nutzerdaten, keine Bewegungsprofile, keine aggregierten Insights. Wir haben keine Investoren die Wachstum über Substanz stellen. Friday Circle ist ein Berliner Serviceangebot – gebaut von einem Menschen der dasselbe Problem hatte wie du.", en: "What you tell us stays with us. We do not sell user data, movement profiles, or aggregated insights. We have no investors who put growth over substance. Friday Circle is a Berlin service — built by someone who had the same problem as you." },
      { s: ".page-continuation h2:nth-of-type(3)", de: "Niedrigschwellig in der Hürde. Nicht im Anspruch.", en: "Low threshold to start. Not low standards." },
      { s: ".page-continuation__inner > p:nth-of-type(4)", de: "Du brauchst keine Ausrüstung, kein Vorwissen, keine bestehende Routine. Aber du bekommst dasselbe Niveau wie jemand der das Dreifache zahlt. Der Einstieg ist einfach – weil er einfach sein soll. Nicht weil das Angebot billig ist.", en: "You need no equipment, no prior knowledge, no existing routine. But you get the same level as someone paying three times as much. Entry is simple — because it should be. Not because the offer is cheap." },
      { s: ".page-continuation h2:nth-of-type(4)", de: "Ein Gespräch überzeugt mehr als jede Erklärung.", en: "A conversation convinces more than any explanation." },
      { s: ".page-continuation__cta", de: "→ Erstgespräch buchen", en: "→ Book intro call" },
    ],
    "projekte.html": [
      { s: "#projekte-heading .nowrap:nth-child(1)", de: "Programme von", en: "Programs from" },
      { s: "#projekte-heading .nowrap:nth-child(2)", de: "Friday Circle", en: "Friday Circle" },
      { s: ".hero__lede", de: "Du hast alles parat und wir geben dir nicht noch eine App, sondern für alle Bereiche ein Gegenüber. Folgende Programme starten wir mit dir zusammen, wenn du Interesse hast.", en: "You have everything you need — we do not give you another app, but a human counterpart for every area. We start the following programs with you when you are interested." },
      { s: "#gogogo .product__kicker", de: "Woher Du kommst und was Du willst ist individuell – so auch die echte & menschliche Betreuung.", en: "Where you come from and what you want is individual — and so is genuine human support." },
      { s: "#gogogo .product__tagline", de: "Komm in Bewegung.", en: "Get moving." },
      { s: "#gogogo .product__cta", de: "mehr lesen", en: "read more" },
      { s: "#haima .product__kicker", de: "Platzhalter – Kurzzeile wie beim gogogo-Kicker. Text folgt.", en: "Placeholder — short line like the gogogo kicker. Copy to follow." },
      { s: "#haima .product__tagline", de: "Platzhalter – eine Zeile wie „Komm in Bewegung.“", en: 'Placeholder — one line like "Get moving."' },
      { s: "#haima .product__cta", de: "offline", en: "offline" },
    ],
    "biig-interior": [
      {
        s: 'meta[name="description"]',
        attr: "content",
        de: "Mach Deinen Raum passend zum Lebensentwurf — Interiordesign und Architektur von Joscha.",
        en: "Make your space fit your life design — interior design and architecture by Joscha.",
      },
    ],
    "programmierung.html": [
      { s: ".programmierung-sub__intro .landing-bridge__kicker", de: "Pragmatischer Optimismus", en: "Pragmatic Optimism" },
      { s: "#fc-life-headline", html: true, de: "Dein Leben verläuft parallel zum Leben des Internets.", en: "Your life runs parallel to the life of the internet." },
      { s: ".fc-life-squares .subline", de: "90 Quadrate stellen eine aktuell langes Leben dar. Klick auf ein Jahr und erinnere Dich an was war und was vielleicht sein wird. Unten kannst Du Feedback und Ideen senden.", en: "90 squares represent a currently long life. Click a year and remember what was and what may come. Below you can send feedback and ideas." },
      { s: ".fc-life-squares .ctrl-label", de: "Geburtsjahr:", en: "Birth year:" },
      { s: '.fc-life-squares .toggle-btn[data-mode="neg"]', de: "↓ Herausforderungen", en: "↓ Challenges" },
      { s: '.fc-life-squares .toggle-btn[data-mode="pos"]', de: "↑ Chancen & Wandel", en: "↑ Opportunities & change" },
      { s: '.fc-life-squares .toggle-btn[data-mode="global"]', de: "🌍 Welt außerhalb", en: "🌍 World outside" },
      { s: "#geschichte-kontext .hero-eyebrow", de: "Kontext · Gesellschaft · Technologie · Macht", en: "Context · Society · Technology · Power" },
      { s: "#geschichte-kontext .hero-title", html: true, de: "Wie unsere Welt<br>wirklich funktioniert.", en: "How our world<br>really works." },
      { s: "#geschichte-kontext .hero-sub", de: "Faktenbasierter Überblick über die Entwicklung des Internets, sozialer Medien und technologischer Machtstrukturen — und deren Einfluss auf Demokratie, Meinungsbildung und Gesellschaft.", en: "Fact-based overview of the internet, social media, and technological power structures — and their influence on democracy, opinion, and society." },
      { s: "#geschichte-kontext .era:nth-of-type(1) .era-title", de: "Das Internet entsteht", en: "The internet emerges" },
      { s: "#geschichte-kontext .era:nth-of-type(2) .era-title", de: "Die Stanford-Mafia", en: "The Stanford mafia" },
      { s: "#geschichte-kontext .era:nth-of-type(3) .era-title", de: "Social Media als Kontrollinfrastruktur", en: "Social media as control infrastructure" },
      { s: "#geschichte-kontext .era:nth-of-type(4) .era-title", de: "Surveillance Capitalism trifft Demokratie", en: "Surveillance capitalism meets democracy" },
      { s: "#geschichte-kontext .era:nth-of-type(5) .era-title", de: "Technologische Autokratie im Aufbau", en: "Technological autocracy in the making" },
      { s: "#geschichte-kontext .era:nth-of-type(6) .era-title", de: "Künstliche Intelligenz — der nächste Filter auf Realität", en: "Artificial intelligence — the next filter on reality" },
      { s: "#geschichte-kontext .analysis-title", de: "Das System — wie alles zusammenhängt", en: "The system — how it all connects" },
      { s: "#geschichte-kontext .sources-title", de: "Quellenhinweise & weiterführende Lektüre", en: "Sources & further reading" },
      { s: "#geschichte-kontext .footnote", de: "Diese Seite ist eine kuratierte Zusammenfassung öffentlich verfügbarer Fakten und dokumentierter Ereignisse. Zuletzt aktualisiert: Mai 2026.", en: "This page is a curated summary of publicly available facts and documented events. Last updated: May 2026." },
      { s: ".fc-life-squares .legend-item:nth-child(1)", de: "Vor dem Web", en: "Before the web" },
      { s: ".fc-life-squares .legend-item:nth-child(2)", de: "Frühes Internet", en: "Early internet" },
      { s: ".fc-life-squares .legend-item:nth-child(3)", de: "Social Media", en: "Social media" },
      { s: ".fc-life-squares .legend-item:nth-child(4)", de: "Krise", en: "Crisis" },
      { s: ".fc-life-squares .legend-item:nth-child(5)", de: "Heute", en: "Today" },
      { s: ".fc-life-squares .legend-item:nth-child(6)", de: "Zukunft", en: "Future" },
      { s: "#panelPlaceholder .detail-panel-placeholder__text", de: "klick auf ein Jahr", en: "click on a year" },
    ],
  };

  /** Auto-translate card blocks in Geschichte section (title + teaser text) */
  var GESCHICHTE_CARDS = [
    ["ARPANET — das erste Netz", "ARPANET — the first network"],
    ["World Wide Web — Tim Berners-Lee", "World Wide Web — Tim Berners-Lee"],
    ["Palantir — CIA, Thiel & Überwachung", "Palantir — CIA, Thiel & surveillance"],
    ["Google — \"Don't be evil\"", "Google — \"Don't be evil\""],
    ["Facebook — von Chronik zur Empörungsmaschine", "Facebook — from timeline to outrage machine"],
    ["Twitter — politisches Leitmedium", "Twitter — political lead medium"],
    ["Snowden / PRISM / NSA", "Snowden / PRISM / NSA"],
    ["Cambridge Analytica", "Cambridge Analytica"],
    ["TikTok — die Identitätsmaschine", "TikTok — the identity machine"],
    ["Crypto — Parallel-Infrastruktur", "Crypto — parallel infrastructure"],
    ["ChatGPT", "ChatGPT"],
    ["Llama", "Llama"],
    ["Claude / Gemini", "Claude / Gemini"],
  ];

  var originals = new WeakMap();

  function applyEntry(el, entry, lang) {
    if (!originals.has(el)) {
      originals.set(el, {
        html: entry.html,
        de: entry.de,
        en: entry.en,
        attr: entry.attr || null,
      });
    }
    var o = originals.get(el);
    var val = lang === "en" ? o.en : o.de;
    if (o.attr) {
      el.setAttribute(o.attr, val);
      return;
    }
    if (o.html) el.innerHTML = val;
    else el.textContent = val;
  }

  function applyGogogoTiles(lang) {
    if (!window.GOGL_TILE_I18N) return;
    var tiles = document.querySelectorAll("#gogl-tile-grid .gogl-tile");
    window.GOGL_TILE_I18N.forEach(function (row, i) {
      var tile = tiles[i];
      if (!tile) return;
      var titleEl = tile.querySelector(".gogl-tile__title");
      var bodyEl = tile.querySelector(".gogl-tile__body > p");
      if (titleEl) {
        applyEntry(titleEl, { de: row.titleDe, en: row.titleEn }, lang);
      }
      if (bodyEl) {
        applyEntry(bodyEl, { de: row.bodyDe, en: row.bodyEn }, lang);
      }
    });
    document.querySelectorAll(".gogl-tile__bg-btn").forEach(function (btn) {
      applyEntry(btn, { de: "Hintergrund →", en: "Background →" }, lang);
    });
    document.querySelectorAll(".gogl-tile__cta-mail").forEach(function (a) {
      applyEntry(a, { de: "Erstgespräch buchen", en: "Book intro call" }, lang);
    });
    document.querySelectorAll(".gogl-tile__bg > h4").forEach(function (h4) {
      var stored = originals.get(h4);
      var deKey = stored ? stored.de : h4.textContent.trim();
      if (deKey === "Warum Begleitung wirkt") {
        applyEntry(h4, { de: "Warum Begleitung wirkt", en: "Why companionship works" }, lang);
      } else {
        applyEntry(h4, { de: "Wissenschaftlicher Hintergrund", en: "Scientific background" }, lang);
      }
    });
  }

  function applyGogogoCarousel(lang) {
    if (!window.GOGL_CAROUSEL_I18N) return;
    window.GOGL_CAROUSEL_I18N.forEach(function (row) {
      var card = document.getElementById(row.id);
      if (!card) return;
      var pill = card.querySelector('[style*="top:20px"] span');
      if (pill) applyEntry(pill, { de: row.labelDe, en: row.labelEn }, lang);
      var collapsedH3 = card.querySelector(".cc-collapsed h3");
      var expandedH3 = card.querySelector(".cc-expanded h3");
      var expandedP = card.querySelector(".cc-expanded p[style*='Georgia']");
      var expandedA = card.querySelector(".cc-expanded a");
      if (collapsedH3) applyEntry(collapsedH3, { html: true, de: row.titleDe, en: row.titleEn }, lang);
      if (expandedH3) applyEntry(expandedH3, { html: true, de: row.titleDe, en: row.titleEn }, lang);
      if (expandedP) applyEntry(expandedP, { de: row.bodyDe, en: row.bodyEn }, lang);
      if (expandedA) applyEntry(expandedA, { de: row.ctaDe, en: row.ctaEn }, lang);
    });
  }

  function applyGogogoFpTiles(lang) {
    if (!window.GOGL_FP_I18N) return;
    window.GOGL_FP_I18N.forEach(function (row) {
      var tile = document.getElementById(row.id);
      if (!tile) return;
      var labelP = tile.querySelector(".fp-collapsed > p");
      if (labelP) applyEntry(labelP, { de: row.labelDe, en: row.labelEn }, lang);
      var collapsedH4 = tile.querySelector(".fp-collapsed h4");
      if (collapsedH4) applyEntry(collapsedH4, { de: row.titleDe, en: row.titleEn }, lang);
      var expandedP = tile.querySelector(".fp-expanded p[style*='Georgia']");
      if (expandedP) applyEntry(expandedP, { de: row.bodyDe, en: row.bodyEn }, lang);
    });
  }

  function applyGogogoAria(lang) {
    var prev = document.querySelector(".gogl-program-slider-arrow--prev");
    var next = document.querySelector(".gogl-program-slider-arrow--next");
    if (prev) {
      applyEntry(prev, { attr: "aria-label", de: "Vorheriges Programm", en: "Previous program" }, lang);
    }
    if (next) {
      applyEntry(next, { attr: "aria-label", de: "Nächstes Programm", en: "Next program" }, lang);
    }
    var labelsDe = [
      "Sportsfreunde versammeln",
      "Mitglied werden",
      "Den passenden Trainer",
      "CIRCLE TRAINING",
      "Factfulness",
      "Upper Body",
      "Mobilityroutine",
      "Triff Joscha",
    ];
    var labelsEn = [
      "Gather your sports friends",
      "Become a member",
      "Find the right trainer",
      "CIRCLE TRAINING",
      "Factfulness",
      "Upper body",
      "Mobility routine",
      "Meet Joscha",
    ];
    document.querySelectorAll(".gogl-program-slider__dot").forEach(function (dot, i) {
      applyEntry(
        dot,
        { attr: "aria-label", de: labelsDe[i] || "", en: labelsEn[i] || "" },
        lang
      );
    });
    var popup = document.getElementById("member-popup");
    if (popup) {
      applyEntry(popup, { attr: "aria-label", de: "Mitgliedschaft auswählen", en: "Choose membership" }, lang);
      var close = popup.querySelector(".member-popup__close");
      if (close) {
        applyEntry(close, { attr: "aria-label", de: "Popup schließen", en: "Close popup" }, lang);
      }
    }
    var langGroup = document.querySelector(".nav__lang");
    if (langGroup) {
      applyEntry(langGroup, { attr: "aria-label", de: "Sprache", en: "Language" }, lang);
    }
  }

  function applyRegisterPlaceholder(el, de, en, lang) {
    if (!originals.has(el)) {
      originals.set(el, {
        attr: "placeholder",
        de: el.getAttribute("placeholder") || de,
        en: en,
        html: false,
      });
    }
    applyEntry(el, originals.get(el), lang);
  }

  function applyRegisterCheckboxLabels(pairs, lang) {
    document.querySelectorAll(".gogl-motive .gogl-check").forEach(function (label, i) {
      var pair = pairs[i];
      if (!pair) return;
      if (!originals.has(label)) {
        originals.set(label, { html: false, de: pair[0], en: pair[1], attr: null });
      }
      var o = originals.get(label);
      var text = lang === "en" ? o.en : o.de;
      var input = label.querySelector("input");
      if (input) input.setAttribute("value", text);
      var nodes = [];
      label.childNodes.forEach(function (n) {
        if (n.nodeType === 3) nodes.push(n);
      });
      nodes.forEach(function (n) {
        label.removeChild(n);
      });
      label.appendChild(document.createTextNode(text));
    });
  }

  function applyRegisterPage(lang) {
    var cfg = window.REGISTER_I18N;
    if (!cfg) return;
    var pageKey = PAGE === "register-accountability" ? "accountability" : "training";
    var page = cfg[pageKey];
    var shared = cfg.shared;
    if (!page || !shared) return;

    shared.placeholders.forEach(function (row) {
      document.querySelectorAll(row.s).forEach(function (el) {
        applyRegisterPlaceholder(el, row.de, row.en, lang);
      });
    });

    var legend = document.querySelector(".gogl-motive__legend");
    if (legend) applyEntry(legend, shared.legend, lang);

    document.querySelectorAll("#gogl-dsgvo").forEach(function (input) {
      var span = input.parentElement && input.parentElement.querySelector("span");
      if (span) applyEntry(span, shared.consentPrivacy, lang);
    });
    document.querySelectorAll("#gogl-membership").forEach(function (input) {
      var span = input.parentElement && input.parentElement.querySelector("span");
      if (span) applyEntry(span, shared.consentMembership, lang);
    });

    shared.footer.forEach(function (row) {
      document.querySelectorAll(row.s).forEach(function (el) {
        applyEntry(el, row, lang);
      });
    });

    var logo = document.querySelector(".gogogo-landing__logo");
    if (logo) applyEntry(logo, { attr: "aria-label", de: shared.logoAria.de, en: shared.logoAria.en }, lang);
    var nav = document.querySelector(".nav");
    if (nav) applyEntry(nav, { attr: "aria-label", de: shared.navAria.de, en: shared.navAria.en }, lang);
    var footer = document.querySelector(".footer");
    if (footer) applyEntry(footer, { attr: "aria-label", de: shared.footerAria.de, en: shared.footerAria.en }, lang);
    var footerNav = document.querySelector(".footer__links");
    if (footerNav) {
      applyEntry(footerNav, { attr: "aria-label", de: shared.footerLinksAria.de, en: shared.footerLinksAria.en }, lang);
    }
    var langGroup = document.querySelector(".nav__lang");
    if (langGroup) {
      applyEntry(langGroup, { attr: "aria-label", de: "Sprache", en: "Language" }, lang);
    }

    var h1 = document.getElementById("gogl-form-h");
    if (h1) applyEntry(h1, page.h1, lang);
    var submit = document.querySelector(".gogl-form__submit");
    if (submit) applyEntry(submit, page.submit, lang);
    var msg = document.getElementById("gogl-message");
    if (msg) applyRegisterPlaceholder(msg, page.messagePlaceholder.de, page.messagePlaceholder.en, lang);

    var benefitsAside = document.querySelector(".gogl-form-stage__benefits");
    if (benefitsAside) {
      applyEntry(benefitsAside, { attr: "aria-label", de: page.benefitsAria.de, en: page.benefitsAria.en }, lang);
    }
    var below = document.querySelector(".gogl-form-below");
    if (below) {
      applyEntry(below, { attr: "aria-label", de: page.belowAria.de, en: page.belowAria.en }, lang);
    }

    if (page.intro) {
      document.querySelectorAll(".gogl-form-stage__benefits-intro p").forEach(function (p, i) {
        if (page.intro[i]) applyEntry(p, page.intro[i], lang);
      });
    }
    if (page.outro) {
      document.querySelectorAll(".gogl-form-stage__benefits-outro p").forEach(function (p) {
        applyEntry(p, page.outro, lang);
      });
    }
    document.querySelectorAll(".gogl-form-stage__benefits-list li").forEach(function (li, i) {
      if (page.benefits[i]) applyEntry(li, page.benefits[i], lang);
    });

    applyRegisterCheckboxLabels(page.checkboxes, lang);

    document.querySelectorAll(".gogl-form-below__headline").forEach(function (el, i) {
      if (page.belowHeadlines[i]) {
        applyEntry(el, { de: page.belowHeadlines[i][0], en: page.belowHeadlines[i][1] }, lang);
      }
    });

    document.title = lang === "en" ? page.title.en : page.title.de;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      if (!originals.has(meta)) {
        originals.set(meta, {
          attr: "content",
          de: meta.getAttribute("content") || page.meta.de,
          en: page.meta.en,
          html: false,
        });
      }
      applyEntry(meta, originals.get(meta), lang);
    }
  }

  function applyGogogoLanding(lang) {
    var list = window.GOGL_I18N_ENTRIES || [];
    list.forEach(function (entry) {
      document.querySelectorAll(entry.s).forEach(function (el) {
        applyEntry(el, entry, lang);
      });
    });
    applyGogogoTiles(lang);
    applyGogogoCarousel(lang);
    applyGogogoFpTiles(lang);
    applyGogogoAria(lang);
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      if (!originals.has(meta)) {
        originals.set(meta, {
          attr: "content",
          de: meta.getAttribute("content") || "",
          en: "You know what to do. We build the plan that actually works. No subscription. No course. A person who stays with you. First step free.",
          html: false,
        });
      }
      applyEntry(meta, originals.get(meta), lang);
    }
    document.title =
      lang === "en" ? "gogogo – Get moving | Friday Circle" : "gogogo – Komm in Bewegung | Friday Circle";
  }

  function applyGeschichteCards(lang) {
    if (PAGE !== "programmierung.html") return;
    document.querySelectorAll("#geschichte-kontext .card-title").forEach(function (el) {
      var t = el.textContent.trim();
      GESCHICHTE_CARDS.forEach(function (pair) {
        if (t === pair[0]) {
          if (!originals.has(el)) originals.set(el, { html: false, de: pair[0], en: pair[1] });
          el.textContent = lang === "en" ? pair[1] : pair[0];
        }
      });
    });
  }

  function applyPage(lang) {
    var list = MAP[PAGE];
    if (list) {
      list.forEach(function (entry) {
        document.querySelectorAll(entry.s).forEach(function (el) {
          applyEntry(el, entry, lang);
        });
      });
    }
    applyGeschichteCards(lang);
    if (PAGE === "gogogo-landing.html") {
      applyGogogoLanding(lang);
    }
    if (PAGE === "register-accountability" || PAGE === "register-training") {
      applyRegisterPage(lang);
    }
    if (PAGE === "biig-interior") {
      document.title =
        lang === "en" ? "biig Interior — Friday Circle" : "biig Interior — Friday Circle";
    }
    if (PAGE === "programmierung.html") {
      document.querySelectorAll("#geschichte-kontext .expand-btn").forEach(function (btn) {
        if (!originals.has(btn)) {
          originals.set(btn, { html: false, de: "+ Mehr Details", en: "+ More details" });
        }
        var o = originals.get(btn);
        btn.textContent = lang === "en" ? o.en : o.de;
        if (btn.closest(".expandable") && btn.closest(".expandable").classList.contains("open")) {
          btn.textContent = lang === "en" ? "− Less" : "− Weniger";
        }
      });
    }
    document.querySelectorAll("main [data-i18n-de][data-i18n-en]").forEach(function (el) {
      var de = el.getAttribute("data-i18n-de");
      var en = el.getAttribute("data-i18n-en");
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = lang === "en" ? en : de;
      } else {
        el.textContent = lang === "en" ? en : de;
      }
    });
  }

  window.FC_I18N_APPLY = applyPage;

  document.addEventListener("fc-lang-change", function (e) {
    applyPage(e.detail.lang);
  });

  function bootI18n() {
    var lang =
      document.body.classList.contains("en") || document.documentElement.lang === "en" ? "en" : "de";
    applyPage(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootI18n);
  } else {
    bootI18n();
  }
})();
