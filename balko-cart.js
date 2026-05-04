/**
 * BALKO Warenkorb: temporär im Browser (sessionStorage).
 * Für geräteübergreifendes Merken: später z. B. Supabase REST; für Zahlung/Lager: Shopify.
 */
(function () {
  var KEY_PLANTS = "balko_plant_cart";
  var KEY_PLANTS_LEGACY = "balko_extra_products";
  var KEY_CODE = "balko_project_code";

  function migrateLegacyPlants() {
    if (sessionStorage.getItem(KEY_PLANTS)) return;
    var old = sessionStorage.getItem(KEY_PLANTS_LEGACY);
    if (!old) return;
    try {
      var arr = JSON.parse(old);
      if (!Array.isArray(arr)) return;
      var out = [];
      arr.forEach(function (entry) {
        if (typeof entry === "string" && entry.indexOf("Pflanzenpaket:") === 0) {
          out.push({
            title: entry.replace(/^Pflanzenpaket:\s*/, "").trim(),
            size: "",
            price: 129,
          });
        }
      });
      sessionStorage.setItem(KEY_PLANTS, JSON.stringify(out));
      sessionStorage.removeItem(KEY_PLANTS_LEGACY);
    } catch (e) {
      sessionStorage.removeItem(KEY_PLANTS_LEGACY);
    }
  }

  function getPlantItems() {
    migrateLegacyPlants();
    try {
      var raw = sessionStorage.getItem(KEY_PLANTS);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e2) {
      return [];
    }
  }

  function setPlantItems(items) {
    sessionStorage.setItem(KEY_PLANTS, JSON.stringify(items || []));
  }

  function appendPlant(title, size, priceEuro) {
    var items = getPlantItems();
    var p =
      typeof priceEuro === "number" && !isNaN(priceEuro)
        ? priceEuro
        : 129;
    items.push({
      title: (title || "").trim() || "Pflanzenpaket",
      size: (size || "").trim(),
      price: p,
    });
    setPlantItems(items);
    return items.length;
  }

  /** 1 «Projekt-Slot» wenn ein Code existiert, plus jede Pflanzen-Zeile. */
  function navBadgeCount() {
    migrateLegacyPlants();
    var code = sessionStorage.getItem(KEY_CODE);
    var plants = getPlantItems().length;
    return (code ? 1 : 0) + plants;
  }

  function aggregatePlantsForDisplay(items) {
    var m = {};
    (items || []).forEach(function (it) {
      var size = it.size || "—";
      var unit =
        typeof it.price === "number" && !isNaN(it.price) ? it.price : 129;
      var key = (it.title || "") + "\t" + size + "\t" + unit;
      if (!m[key]) {
        m[key] = { title: it.title, size: size, unitPrice: unit, qty: 0 };
      }
      m[key].qty += 1;
    });
    return Object.keys(m).map(function (k) {
      var o = m[k];
      return {
        title: o.title,
        size: o.size,
        qty: o.qty,
        unitPrice: o.unitPrice,
        lineTotal: o.unitPrice * o.qty,
      };
    });
  }

  function refreshNavBadges() {
    migrateLegacyPlants();
    var n = navBadgeCount();
    document.querySelectorAll("a.bk-nav-cart").forEach(function (a) {
      var sp = a.querySelector(".bk-cart-badge");
      if (!sp) {
        sp = document.createElement("span");
        sp.className = "bk-cart-badge";
        a.appendChild(sp);
      }
      if (n > 0) {
        sp.textContent = String(n);
        sp.hidden = false;
        sp.setAttribute("aria-label", n + " Positionen im Warenkorb");
      } else {
        sp.textContent = "";
        sp.hidden = true;
        sp.removeAttribute("aria-label");
      }
    });
  }

  window.BalkoCart = {
    migrateLegacyPlants: migrateLegacyPlants,
    getPlantItems: getPlantItems,
    setPlantItems: setPlantItems,
    appendPlant: appendPlant,
    navBadgeCount: navBadgeCount,
    aggregatePlantsForDisplay: aggregatePlantsForDisplay,
    refreshNavBadges: refreshNavBadges,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshNavBadges);
  } else {
    refreshNavBadges();
  }
})();
