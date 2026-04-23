(function () {
  var form = document.getElementById("gogogo-intake");
  if (!form) return;

  var steps = form.querySelectorAll(".gogogo-step");

  function showStep(index) {
    steps.forEach(function (step, j) {
      step.hidden = j !== index;
    });
  }

  form.querySelector('[data-action="next-from-1"]').addEventListener("click", function () {
    var ok = form.querySelector('input[name="q_assistent"]:checked');
    if (!ok) {
      window.alert("Bitte wähle Ja oder Nein.");
      return;
    }
    showStep(1);
  });

  form.querySelector('[data-action="next-from-2"]').addEventListener("click", function () {
    var groups = ["q_weekly", "q_focus", "q_slot", "q_duration"];
    for (var i = 0; i < groups.length; i++) {
      if (!form.querySelector('input[name="' + groups[i] + '"]:checked')) {
        window.alert("Bitte beantworte alle vier Fragen.");
        return;
      }
    }
    showStep(2);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var em = document.getElementById("gogogo-email").value.trim();
    var em2 = document.getElementById("gogogo-email-confirm").value.trim();
    if (em !== em2) {
      window.alert("Die E-Mail-Adressen stimmen nicht überein.");
      return;
    }
    if (!document.getElementById("gogogo-consent").checked) {
      window.alert("Bitte bestätige die Zustimmung zur Datenverarbeitung.");
      return;
    }
    window.alert("Vielen Dank – deine Angaben wurden übermittelt (Demo, kein Backend).");
  });

  showStep(0);
})();
