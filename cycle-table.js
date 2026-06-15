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
      if (raw) {
        var data = JSON.parse(raw);
        (data.sessions || []).forEach(normalizeSession);
        return data;
      }
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

  function normalizeSession(session) {
    if (session.exercises && session.exercises.length) return session;
    if (session.rounds && session.rounds.length) {
      session.exercises = session.rounds.map(function (round) {
        return {
          id: round.id || uid(),
          name: round.label || "",
          positionPreset: "",
          positionFactor: "",
          valuePreset: "",
          unitPreset: "",
          userData: {},
        };
      });
    } else if (!session.exercises) {
      session.exercises = [];
    }
    return session;
  }

  function getISOWeek(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function formatFridayLabel(iso) {
    var d = new Date(iso + "T12:00:00");
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    return "KW" + getISOWeek(d) + " " + dd + "." + mm + "." + d.getFullYear();
  }

  function getNextFridayIso() {
    var now = new Date();
    var fri = new Date(now);
    var day = fri.getDay();
    var diff = (5 - day + 7) % 7;
    if (diff === 0 && now.getHours() > 20) diff = 7;
    fri.setDate(fri.getDate() + diff);
    return fri.toISOString().slice(0, 10);
  }

  function listFridays() {
    var out = [];
    var start = new Date();
    start.setDate(start.getDate() - 7 * 26);
    var end = new Date();
    end.setDate(end.getDate() + 7 * 8);
    var cur = new Date(start);
    while (cur <= end) {
      if (cur.getDay() === 5) out.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    state.data.sessions.forEach(function (session) {
      if (session.date && out.indexOf(session.date) === -1 && new Date(session.date + "T12:00:00").getDay() === 5) {
        out.push(session.date);
      }
    });
    out.sort(function (a, b) {
      return b.localeCompare(a);
    });
    return out;
  }

  var state = {
    data: loadData(),
    user: loadUser(),
    admin: false,
    selectedDate: "",
    wheelOpen: false,
    wheelDates: [],
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
    els.dateLabel = qs("#cycl-date-label");
    els.dateTrigger = qs("#cycl-date-trigger");
    els.dateWheel = qs("#cycl-date-wheel");
    els.dateScroller = qs("#cycl-date-wheel-scroller");
    els.dateWheelDone = qs("#cycl-date-wheel-done");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function sessionForDate(date) {
    return state.data.sessions.find(function (session) {
      return session.date === date;
    });
  }

  function getUserData(exercise, slug) {
    if (!exercise.userData) exercise.userData = {};
    if (!exercise.userData[slug]) {
      exercise.userData[slug] = {
        positionIndividual: "",
        handicapIndividual: "",
        result: "",
        points: "",
      };
    }
    return exercise.userData[slug];
  }

  function saveExerciseField(sessionId, exerciseId, field, value, scope) {
    var session = state.data.sessions.find(function (s) {
      return s.id === sessionId;
    });
    if (!session) return;
    var exercise = session.exercises.find(function (ex) {
      return ex.id === exerciseId;
    });
    if (!exercise) return;

    if (scope === "preset") {
      if (!state.admin) return;
      exercise[field] = value;
    } else {
      if (!state.user) return;
      var isSelf = true;
      if (!isSelf && !state.admin) return;
      var ud = getUserData(exercise, state.user.slug);
      ud[field] = value;
    }
    saveData(state.data);
    renderTable();
  }

  function createSession(e) {
    e.preventDefault();
    if (!state.admin) return;
    var dateEl = qs("#cycl-session-date");
    var workoutEl = qs("#cycl-session-workout");
    var countEl = qs("#cycl-session-exercises");
    var fieldsWrap = qs("#cycl-exercise-fields");
    var date = dateEl && dateEl.value;
    var workoutName = workoutEl && workoutEl.value.trim();
    var count = parseInt(countEl && countEl.value, 10) || 0;
    if (!date || !workoutName || count < 1) return;

    var existing = sessionForDate(date);
    if (existing) {
      existing.workoutName = workoutName;
      saveData(state.data);
      state.selectedDate = date;
      updateDateLabel();
      render();
      return;
    }

    var exercises = [];
    var blocks = fieldsWrap ? fieldsWrap.querySelectorAll("[data-exercise-block]") : [];
    for (var i = 0; i < count; i++) {
      var block = blocks[i];
      exercises.push({
        id: uid(),
        name: block && block.querySelector("[data-ex-name]") ? block.querySelector("[data-ex-name]").value.trim() : t("Übung", "Exercise") + " " + (i + 1),
        positionPreset: block && block.querySelector("[data-ex-pos-preset]") ? block.querySelector("[data-ex-pos-preset]").value.trim() : "",
        positionFactor: block && block.querySelector("[data-ex-pos-factor]") ? block.querySelector("[data-ex-pos-factor]").value.trim() : "",
        valuePreset: block && block.querySelector("[data-ex-value-preset]") ? block.querySelector("[data-ex-value-preset]").value.trim() : "",
        unitPreset: block && block.querySelector("[data-ex-unit]") ? block.querySelector("[data-ex-unit]").value.trim() : "",
        userData: {},
      });
    }

    state.data.sessions.push({
      id: uid(),
      date: date,
      workoutName: workoutName,
      exercises: exercises,
      participants: {},
    });
    saveData(state.data);
    if (els.sessionForm) els.sessionForm.reset();
    buildExerciseFields(countEl ? parseInt(countEl.value, 10) || 5 : 5);
    state.selectedDate = date;
    updateDateLabel();
    render();
  }

  function buildExerciseFields(count) {
    var wrap = qs("#cycl-exercise-fields");
    if (!wrap) return;
    wrap.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var block = document.createElement("div");
      block.className = "cycl-exercise-block";
      block.setAttribute("data-exercise-block", "");
      block.innerHTML =
        '<p class="cycl-exercise-block__title">' +
        t("Übung", "Exercise") +
        " " +
        (i + 1) +
        "</p>" +
        '<label class="cycl-admin-field"><span class="cycl-admin-field__lab">' +
        t("Name", "Name") +
        '</span><input type="text" data-ex-name placeholder="' +
        t("Übung", "Exercise") +
        " " +
        (i + 1) +
        '" /></label>' +
        '<label class="cycl-admin-field"><span class="cycl-admin-field__lab">' +
        t("Position-Vorgabe", "Position preset") +
        '</span><input type="text" data-ex-pos-preset /></label>' +
        '<label class="cycl-admin-field"><span class="cycl-admin-field__lab">' +
        t("Pos.-Faktor", "Pos. factor") +
        '</span><input type="text" data-ex-pos-factor /></label>' +
        '<label class="cycl-admin-field"><span class="cycl-admin-field__lab">' +
        t("Einheit", "Unit") +
        '</span><input type="text" data-ex-unit placeholder="kg / sec / m" /></label>' +
        '<label class="cycl-admin-field"><span class="cycl-admin-field__lab">' +
        t("Wert-Vorgabe", "Value preset") +
        '</span><input type="text" data-ex-value-preset /></label>';
      wrap.appendChild(block);
    }
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

  function cellInput(value, attrs) {
    return (
      '<input type="text" class="cycl-table-input" value="' +
      escapeHtml(value || "") +
      '" ' +
      attrs +
      " />"
    );
  }

  function renderTable() {
    if (!els.tableBody) return;
    var session = sessionForDate(state.selectedDate);
    var hasRows = session && session.exercises && session.exercises.length > 0;
    if (els.emptyState) els.emptyState.hidden = hasRows;
    els.tableBody.innerHTML = "";

    if (!hasRows) return;

    session.exercises.forEach(function (exercise) {
      var ud = { positionIndividual: "", handicapIndividual: "", result: "", points: "" };
      if (state.user && exercise.userData && exercise.userData[state.user.slug]) {
        ud = exercise.userData[state.user.slug];
      }

      var tr = document.createElement("tr");
      tr.className = "cycl-table__row cycl-table__row--exercise";

      var nameCell = state.admin
        ? cellInput(
            exercise.name,
            'data-field="name" data-scope="preset" data-session="' +
              session.id +
              '" data-exercise="' +
              exercise.id +
              '"'
          )
        : escapeHtml(exercise.name || "—");

      var preset = function (field, val) {
        return state.admin
          ? cellInput(
              val,
              'data-field="' +
                field +
                '" data-scope="preset" data-session="' +
                session.id +
                '" data-exercise="' +
                exercise.id +
                '"'
            )
          : escapeHtml(val || "—");
      };

      var userField = function (field, val) {
        if (state.user || state.admin) {
          return cellInput(
            val,
            'data-field="' +
              field +
              '" data-scope="user" data-session="' +
              session.id +
              '" data-exercise="' +
              exercise.id +
              '"'
          );
        }
        return escapeHtml(val || "—");
      };

      tr.innerHTML =
        '<td class="cycl-table__cell">' +
        nameCell +
        "</td>" +
        '<td class="cycl-table__cell">' +
        preset("positionPreset", exercise.positionPreset) +
        "</td>" +
        '<td class="cycl-table__cell">' +
        userField("positionIndividual", ud.positionIndividual) +
        "</td>" +
        '<td class="cycl-table__cell">' +
        preset("positionFactor", exercise.positionFactor) +
        "</td>" +
        '<td class="cycl-table__cell">' +
        preset("unitPreset", exercise.unitPreset) +
        "</td>" +
        '<td class="cycl-table__cell">' +
        preset("valuePreset", exercise.valuePreset) +
        "</td>" +
        '<td class="cycl-table__cell">' +
        userField("result", ud.result) +
        "</td>" +
        '<td class="cycl-table__cell">' +
        userField("handicapIndividual", ud.handicapIndividual) +
        "</td>" +
        '<td class="cycl-table__cell cycl-table__cell--num">' +
        userField("points", ud.points) +
        "</td>";

      els.tableBody.appendChild(tr);

      tr.querySelectorAll(".cycl-table-input").forEach(function (input) {
        input.addEventListener("change", function () {
          var field = input.getAttribute("data-field");
          var scope = input.getAttribute("data-scope");
          var sessionId = input.getAttribute("data-session");
          var exerciseId = input.getAttribute("data-exercise");
          saveExerciseField(sessionId, exerciseId, field, input.value.trim(), scope);
        });
      });
    });
  }

  function renderAdmin() {
    if (!els.adminPanel) return;
    els.adminPanel.hidden = !state.admin;
  }

  function updateDateLabel() {
    if (els.dateLabel && state.selectedDate) {
      els.dateLabel.textContent = formatFridayLabel(state.selectedDate);
    }
  }

  function setSelectedDate(iso) {
    state.selectedDate = iso;
    updateDateLabel();
    renderTable();
    var dateInput = qs("#cycl-session-date");
    if (dateInput) dateInput.value = iso;
  }

  function wheelItemHeight() {
    return 44;
  }

  function paintWheelSelection() {
    if (!els.dateScroller) return;
    var items = els.dateScroller.querySelectorAll(".cycl-date-wheel__item");
    var mid = els.dateScroller.scrollTop + els.dateScroller.clientHeight / 2;
    items.forEach(function (item) {
      var center = item.offsetTop + item.offsetHeight / 2;
      item.classList.toggle("is-selected", Math.abs(center - mid) < wheelItemHeight() / 2);
    });
  }

  function scrollWheelToDate(iso, smooth) {
    if (!els.dateScroller) return;
    var index = state.wheelDates.indexOf(iso);
    if (index < 0) return;
    var pad = (els.dateScroller.clientHeight - wheelItemHeight()) / 2;
    var top = pad + index * wheelItemHeight();
    els.dateScroller.scrollTo({ top: top, behavior: smooth ? "smooth" : "auto" });
    paintWheelSelection();
  }

  function nearestWheelDate() {
    if (!els.dateScroller || !state.wheelDates.length) return state.selectedDate;
    var mid = els.dateScroller.scrollTop + els.dateScroller.clientHeight / 2;
    var pad = (els.dateScroller.clientHeight - wheelItemHeight()) / 2;
    var index = Math.round((mid - pad) / wheelItemHeight());
    index = Math.max(0, Math.min(state.wheelDates.length - 1, index));
    return state.wheelDates[index];
  }

  function openDateWheel() {
    if (!els.dateWheel || !els.dateScroller) return;
    state.wheelDates = listFridays();
    if (!state.wheelDates.length) state.wheelDates = [getNextFridayIso()];
    var padPx = (220 - wheelItemHeight()) / 2;
    els.dateScroller.innerHTML =
      '<div class="cycl-date-wheel__pad" style="height:' +
      padPx +
      'px"></div>' +
      state.wheelDates
        .map(function (iso) {
          return (
            '<button type="button" class="cycl-date-wheel__item" data-date="' +
            iso +
            '">' +
            escapeHtml(formatFridayLabel(iso)) +
            "</button>"
          );
        })
        .join("") +
      '<div class="cycl-date-wheel__pad" style="height:' +
      padPx +
      'px"></div>';

    els.dateWheel.hidden = false;
    state.wheelOpen = true;
    document.body.classList.add("cycl-date-wheel-open");
    if (els.dateTrigger) els.dateTrigger.setAttribute("aria-expanded", "true");

    requestAnimationFrame(function () {
      scrollWheelToDate(state.selectedDate || state.wheelDates[0], false);
    });

    els.dateScroller.querySelectorAll(".cycl-date-wheel__item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        scrollWheelToDate(btn.getAttribute("data-date"), true);
      });
    });
  }

  function closeDateWheel(apply) {
    if (!els.dateWheel) return;
    if (apply) {
      var picked = nearestWheelDate();
      if (picked) setSelectedDate(picked);
    }
    els.dateWheel.hidden = true;
    state.wheelOpen = false;
    document.body.classList.remove("cycl-date-wheel-open");
    if (els.dateTrigger) els.dateTrigger.setAttribute("aria-expanded", "false");
  }

  function initDatePicker() {
    if (!state.selectedDate) state.selectedDate = getNextFridayIso();
    updateDateLabel();

    if (els.dateTrigger) {
      els.dateTrigger.addEventListener("click", openDateWheel);
    }
    if (els.dateWheelDone) {
      els.dateWheelDone.addEventListener("click", function () {
        closeDateWheel(true);
      });
    }
    var backdrop = qs(".cycl-date-wheel__backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        closeDateWheel(false);
      });
    }
    if (els.dateScroller) {
      var raf = 0;
      els.dateScroller.addEventListener(
        "scroll",
        function () {
          if (raf) return;
          raf = requestAnimationFrame(function () {
            raf = 0;
            paintWheelSelection();
          });
        },
        { passive: true }
      );
    }
  }

  function render() {
    renderLoginBar();
    renderAdmin();
    renderTable();
  }

  function bindStatic() {
    var loginForm = qs("#cycl-login-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    var closeBtn = qs("#cycl-login-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    var backdrop = qs(".cycl-login-modal__backdrop");
    if (backdrop) backdrop.addEventListener("click", closeModal);
    if (els.sessionForm) els.sessionForm.addEventListener("submit", createSession);
    var countInput = qs("#cycl-session-exercises");
    if (countInput) {
      countInput.addEventListener("input", function () {
        var n = parseInt(countInput.value, 10);
        if (n > 0 && n <= 24) buildExerciseFields(n);
      });
      buildExerciseFields(parseInt(countInput.value, 10) || 5);
    }
    var dateInput = qs("#cycl-session-date");
    if (dateInput && !dateInput.value) {
      dateInput.value = state.selectedDate || getNextFridayIso();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initEls();
    initDatePicker();
    bindStatic();
    render();
  });
})();
