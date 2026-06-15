(function () {
  "use strict";

  var STORAGE_KEY = "fcCycleTableData";
  var SESSION_KEY = "fcCycleTableUser";
  var ADMIN_PIN = "friday";

  function uid() {
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { sessions: [], users: [] };
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadUser() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function saveUser(user) {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }

  function parseDurationInput(val) {
    if (val == null || val === "") return null;
    var s = String(val).trim();
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    var m = s.match(/^(\d+):(\d{1,2})$/);
    if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    var m2 = s.match(/^(\d+)m\s*(\d+)s?$/i);
    if (m2) return parseInt(m2[1], 10) * 60 + parseInt(m2[2], 10);
    return null;
  }

  function formatDuration(sec) {
    if (sec == null || isNaN(sec)) return "—";
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function sumTimes(times, roundIds) {
    var total = 0;
    var ok = false;
    roundIds.forEach(function (rid) {
      if (times && times[rid] != null) {
        total += times[rid];
        ok = true;
      }
    });
    return ok ? total : null;
  }

  function slugName(name) {
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9äöüß\-]/gi, "");
  }

  function getLang() {
    return document.documentElement.lang === "en" ? "en" : "de";
  }

  function t(de, en) {
    return getLang() === "en" ? en : de;
  }

  var state = {
    data: loadData(),
    user: loadUser(),
    admin: false,
    expandedSessions: {},
    expandedParticipants: {},
    editingSession: null,
  };

  var els = {};

  function qs(sel) {
    return document.querySelector(sel);
  }

  function initEls() {
    els.tableBody = qs("#cycl-table-body");
    els.loginBar = qs("#cycl-login-bar");
    els.loginModal = qs("#cycl-login-modal");
    els.adminPanel = qs("#cycl-admin-panel");
    els.sessionForm = qs("#cycl-session-form");
    els.emptyState = qs("#cycl-table-empty");
  }

  function openModal() {
    if (els.loginModal) els.loginModal.hidden = false;
  }

  function closeModal() {
    if (els.loginModal) els.loginModal.hidden = true;
  }

  function handleLogin(e) {
    e.preventDefault();
    var nameInput = qs("#cycl-login-name");
    var pinInput = qs("#cycl-login-pin");
    var err = qs("#cycl-login-error");
    var name = nameInput && nameInput.value.trim();
    var pin = pinInput && pinInput.value.trim();
    if (!name || !pin) {
      if (err) {
        err.textContent = t("Name und PIN eingeben.", "Enter name and PIN.");
        err.hidden = false;
      }
      return;
    }
    if (pin === ADMIN_PIN) {
      state.admin = true;
      state.user = { name: name, slug: slugName(name) };
      saveUser(state.user);
      closeModal();
      render();
      return;
    }
    var user = state.data.users.find(function (u) {
      return u.slug === slugName(name);
    });
    if (!user) {
      user = { slug: slugName(name), name: name, pin: pin };
      state.data.users.push(user);
      saveData(state.data);
    } else if (user.pin !== pin) {
      if (err) {
        err.textContent = t("PIN stimmt nicht.", "PIN does not match.");
        err.hidden = false;
      }
      return;
    }
    state.user = { name: user.name, slug: user.slug };
    saveUser(state.user);
    closeModal();
    render();
  }

  function logout() {
    state.user = null;
    state.admin = false;
    saveUser(null);
    render();
  }

  function sortedSessions() {
    return state.data.sessions.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
  }

  function createSession(e) {
    e.preventDefault();
    if (!state.admin) return;
    var dateEl = qs("#cycl-session-date");
    var workoutEl = qs("#cycl-session-workout");
    var countEl = qs("#cycl-session-rounds");
    var labelsWrap = qs("#cycl-round-labels");
    var date = dateEl && dateEl.value;
    var workoutName = workoutEl && workoutEl.value.trim();
    var count = parseInt(countEl && countEl.value, 10) || 0;
    if (!date || !workoutName || count < 1) return;
    var rounds = [];
    var inputs = labelsWrap ? labelsWrap.querySelectorAll("[data-round-label]") : [];
    for (var i = 0; i < count; i++) {
      var label = inputs[i] ? inputs[i].value.trim() : "";
      rounds.push({ id: uid(), label: label || t("Runde", "Round") + " " + (i + 1) });
    }
    state.data.sessions.push({
      id: uid(),
      date: date,
      workoutName: workoutName,
      rounds: rounds,
      participants: {},
    });
    saveData(state.data);
    if (els.sessionForm) els.sessionForm.reset();
    buildRoundLabelFields(countEl ? parseInt(countEl.value, 10) || 3 : 3);
    render();
  }

  function buildRoundLabelFields(count) {
    var wrap = qs("#cycl-round-labels");
    if (!wrap) return;
    wrap.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var lab = document.createElement("label");
      lab.className = "cycl-admin-field";
      lab.innerHTML =
        '<span class="cycl-admin-field__lab">' +
        t("Runde", "Round") +
        " " +
        (i + 1) +
        '</span><input type="text" data-round-label placeholder="' +
        t("Bezeichnung", "Label") +
        " " +
        (i + 1) +
        '" />';
      wrap.appendChild(lab);
    }
  }

  function toggleSession(id) {
    state.expandedSessions[id] = !state.expandedSessions[id];
    render();
  }

  function toggleParticipant(sessionId, slug) {
    var key = sessionId + ":" + slug;
    state.expandedParticipants[key] = !state.expandedParticipants[key];
    render();
  }

  function confirmParticipation(sessionId) {
    if (!state.user) {
      openModal();
      return;
    }
    var session = state.data.sessions.find(function (s) {
      return s.id === sessionId;
    });
    if (!session) return;
    if (!session.participants[state.user.slug]) {
      session.participants[state.user.slug] = {
        name: state.user.name,
        confirmed: true,
        times: {},
      };
      saveData(state.data);
      state.expandedSessions[sessionId] = true;
      render();
    }
  }

  function addParticipant(sessionId, name) {
    if (!state.admin || !name.trim()) return;
    var session = state.data.sessions.find(function (s) {
      return s.id === sessionId;
    });
    if (!session) return;
    var slug = slugName(name);
    if (!slug) return;
    if (!session.participants[slug]) {
      session.participants[slug] = { name: name.trim(), confirmed: true, times: {} };
      saveData(state.data);
      render();
    }
  }

  function saveTime(sessionId, slug, roundId, value) {
    var session = state.data.sessions.find(function (s) {
      return s.id === sessionId;
    });
    if (!session || !session.participants[slug]) return;
    var isSelf = state.user && state.user.slug === slug;
    if (!isSelf && !state.admin) return;
    var sec = parseDurationInput(value);
    if (sec == null && value !== "") return;
    if (sec == null) delete session.participants[slug].times[roundId];
    else session.participants[slug].times[roundId] = sec;
    saveData(state.data);
    render();
  }

  function participantCount(session) {
    return Object.keys(session.participants || {}).length;
  }

  function renderLoginBar() {
    if (!els.loginBar) return;
    if (state.user) {
      els.loginBar.innerHTML =
        '<span class="cycl-login-bar__user">' +
        t("Eingeloggt als", "Signed in as") +
        " <strong>" +
        escapeHtml(state.user.name) +
        "</strong>" +
        (state.admin ? ' <span class="cycl-login-bar__badge">Admin</span>' : "") +
        '</span><button type="button" class="cycl-login-bar__btn" id="cycl-logout-btn">' +
        t("Abmelden", "Sign out") +
        "</button>";
      var btn = qs("#cycl-logout-btn");
      if (btn) btn.addEventListener("click", logout);
    } else {
      els.loginBar.innerHTML =
        '<button type="button" class="cycl-login-bar__btn cycl-login-bar__btn--primary" id="cycl-open-login">' +
        t("Einloggen", "Sign in") +
        "</button>";
      var openBtn = qs("#cycl-open-login");
      if (openBtn) openBtn.addEventListener("click", openModal);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso + "T12:00:00");
      return d.toLocaleDateString(getLang() === "en" ? "en-GB" : "de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return iso;
    }
  }

  function renderTable() {
    if (!els.tableBody) return;
    var sessions = sortedSessions();
    if (els.emptyState) els.emptyState.hidden = sessions.length > 0;
    els.tableBody.innerHTML = "";

    sessions.forEach(function (session) {
      var expanded = !!state.expandedSessions[session.id];
      var count = participantCount(session);
      var roundIds = session.rounds.map(function (r) {
        return r.id;
      });

      var tr = document.createElement("tr");
      tr.className = "cycl-table__row cycl-table__row--session" + (expanded ? " is-expanded" : "");
      tr.innerHTML =
        '<td class="cycl-table__cell cycl-table__cell--toggle">' +
        '<button type="button" class="cycl-table__expand" data-session="' +
        session.id +
        '" aria-expanded="' +
        expanded +
        '">' +
        (expanded ? "▾" : "▸") +
        "</button></td>" +
        '<td class="cycl-table__cell">' +
        escapeHtml(formatDate(session.date)) +
        "</td>" +
        '<td class="cycl-table__cell cycl-table__cell--num">' +
        count +
        "</td>" +
        '<td class="cycl-table__cell">' +
        escapeHtml(session.workoutName) +
        "</td>" +
        '<td class="cycl-table__cell cycl-table__cell--dur">—</td>";
      els.tableBody.appendChild(tr);

      var expandBtn = tr.querySelector(".cycl-table__expand");
      if (expandBtn) {
        expandBtn.addEventListener("click", function () {
          toggleSession(session.id);
        });
      }

      if (!expanded) return;

      var participants = Object.keys(session.participants || {}).map(function (slug) {
        return { slug: slug, p: session.participants[slug] };
      });
      participants.sort(function (a, b) {
        return a.p.name.localeCompare(b.p.name);
      });

      if (state.admin) {
        var adminTr = document.createElement("tr");
        adminTr.className = "cycl-table__row cycl-table__row--admin-add";
        adminTr.innerHTML =
          '<td colspan="5"><form class="cycl-add-participant" data-session="' +
          session.id +
          '">' +
          '<input type="text" placeholder="' +
          t("Teilnehmername", "Participant name") +
          '" required />' +
          '<button type="submit">' +
          t("Hinzufügen", "Add") +
          "</button></form></td>";
        els.tableBody.appendChild(adminTr);
        adminTr.querySelector("form").addEventListener("submit", function (ev) {
          ev.preventDefault();
          var inp = adminTr.querySelector("input");
          addParticipant(session.id, inp.value);
          inp.value = "";
        });
      }

      if (
        state.user &&
        !session.participants[state.user.slug] &&
        !state.admin
      ) {
        var joinTr = document.createElement("tr");
        joinTr.className = "cycl-table__row cycl-table__row--join";
        joinTr.innerHTML =
          '<td colspan="5"><button type="button" class="cycl-join-btn" data-session="' +
          session.id +
          '">' +
          t("Teilnahme bestätigen", "Confirm participation") +
          "</button></td>";
        els.tableBody.appendChild(joinTr);
        joinTr.querySelector(".cycl-join-btn").addEventListener("click", function () {
          confirmParticipation(session.id);
        });
      }

      participants.forEach(function (item) {
        var slug = item.slug;
        var p = item.p;
        var total = sumTimes(p.times, roundIds);
        var pKey = session.id + ":" + slug;
        var pExpanded = !!state.expandedParticipants[pKey];
        var isSelf = state.user && state.user.slug === slug;

        var ptr = document.createElement("tr");
        ptr.className =
          "cycl-table__row cycl-table__row--participant" + (pExpanded ? " is-expanded" : "");
        ptr.innerHTML =
          '<td class="cycl-table__cell"></td>' +
          '<td class="cycl-table__cell"></td>' +
          '<td class="cycl-table__cell cycl-table__cell--indent">' +
          (pExpanded ? "▾ " : "▸ ") +
          '<button type="button" class="cycl-table__name-btn" data-session="' +
          session.id +
          '" data-slug="' +
          slug +
          '">' +
          escapeHtml(p.name) +
          "</button></td>" +
          '<td class="cycl-table__cell cycl-table__cell--muted">' +
          escapeHtml(session.workoutName) +
          "</td>" +
          '<td class="cycl-table__cell cycl-table__cell--dur">' +
          formatDuration(total) +
          "</td>";
        els.tableBody.appendChild(ptr);

        ptr.querySelector(".cycl-table__name-btn").addEventListener("click", function () {
          toggleParticipant(session.id, slug);
        });

        if (!pExpanded) return;

        session.rounds.forEach(function (round) {
          var rtr = document.createElement("tr");
          rtr.className = "cycl-table__row cycl-table__row--round";
          var val = p.times[round.id] != null ? formatDuration(p.times[round.id]) : "";
          var canEdit = isSelf || state.admin;
          rtr.innerHTML =
            '<td class="cycl-table__cell"></td>' +
            '<td class="cycl-table__cell"></td>' +
            '<td class="cycl-table__cell"></td>' +
            '<td class="cycl-table__cell cycl-table__cell--round-label">' +
            escapeHtml(round.label) +
            "</td>" +
            '<td class="cycl-table__cell cycl-table__cell--dur">' +
            (canEdit
              ? '<input type="text" class="cycl-time-input" data-session="' +
                session.id +
                '" data-slug="' +
                slug +
                '" data-round="' +
                round.id +
                '" value="' +
                escapeHtml(val === "—" ? "" : val) +
                '" placeholder="m:ss" />'
              : escapeHtml(val || "—")) +
            "</td>";
          els.tableBody.appendChild(rtr);

          if (canEdit) {
            var input = rtr.querySelector(".cycl-time-input");
            input.addEventListener("change", function () {
              saveTime(session.id, slug, round.id, input.value);
            });
            input.addEventListener("blur", function () {
              saveTime(session.id, slug, round.id, input.value);
            });
          }
        });
      });
    });
  }

  function renderAdmin() {
    if (!els.adminPanel) return;
    els.adminPanel.hidden = !state.admin;
  }

  function render() {
    renderLoginBar();
    renderAdmin();
    renderTable();
  }

  function initOberteilSlideshow() {
    var card = qs(".pgl-prod-card--oberteil");
    if (!card) return;
    var images = [
      "assets/biigJ/sportshirt.png",
      "assets/biigJ/sportbra-curls.png",
    ];
    var idx = 0;
    card.style.backgroundImage = "url('" + images[0] + "')";
    setInterval(function () {
      idx = (idx + 1) % images.length;
      card.style.backgroundImage = "url('" + images[idx] + "')";
    }, 3000);
  }

  function bindStatic() {
    var loginForm = qs("#cycl-login-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    var closeBtn = qs("#cycl-login-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    var backdrop = qs(".cycl-login-modal__backdrop");
    if (backdrop) backdrop.addEventListener("click", closeModal);
    if (els.sessionForm) els.sessionForm.addEventListener("submit", createSession);
    var roundsInput = qs("#cycl-session-rounds");
    if (roundsInput) {
      roundsInput.addEventListener("input", function () {
        var n = parseInt(roundsInput.value, 10);
        if (n > 0 && n <= 20) buildRoundLabelFields(n);
      });
      buildRoundLabelFields(parseInt(roundsInput.value, 10) || 3);
    }
    var dateInput = qs("#cycl-session-date");
    if (dateInput && !dateInput.value) {
      var now = new Date();
      var fri = new Date(now);
      var day = fri.getDay();
      var diff = (5 - day + 7) % 7;
      if (diff === 0 && now.getHours() > 20) diff = 7;
      fri.setDate(fri.getDate() + diff);
      dateInput.value = fri.toISOString().slice(0, 10);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initEls();
    bindStatic();
    initOberteilSlideshow();
    render();
  });
})();
