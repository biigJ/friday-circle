/**
 * BALKO Warenkorb: temporär im Browser (sessionStorage).
 * Für geräteübergreifendes Merken: später z. B. Supabase REST; für Zahlung/Lager: Shopify.
 */
(function () {
  var KEY_PLANTS = "balko_plant_cart";
  var KEY_PLANTS_LEGACY = "balko_extra_products";
  var KEY_CODE = "balko_project_code";
  var KEY_PLANUNG = "balko_wk_planung";

  function lineKey(it) {
    var title = (it.title || "").trim() || "Pflanzenpaket";
    var size = (it.size || "").trim();
    var price = typeof it.price === "number" && !isNaN(it.price) ? it.price : 129;
    return title + "\t" + size + "\t" + price;
  }

  /** Vereinheitlicht Einträge (inkl. Legacy ohne qty) zu eindeutigen Zeilen mit Summenmenge. */
  function mergePlantItems(arr) {
    var m = {};
    (arr || []).forEach(function (raw) {
      var title = (raw.title || "").trim() || "Pflanzenpaket";
      var size = (raw.size || "").trim();
      var price = typeof raw.price === "number" && !isNaN(raw.price) ? raw.price : 129;
      var q =
        typeof raw.qty === "number" && raw.qty > 0 ? Math.floor(raw.qty) : 1;
      var key = title + "\t" + size + "\t" + price;
      if (!m[key]) m[key] = { title: title, size: size, price: price, qty: 0 };
      m[key].qty += q;
    });
    return Object.keys(m)
      .map(function (k) {
        return m[k];
      })
      .filter(function (it) {
        return it.qty > 0;
      });
  }

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
      if (!Array.isArray(data)) return [];
      var merged = mergePlantItems(data);
      sessionStorage.setItem(KEY_PLANTS, JSON.stringify(merged));
      return merged;
    } catch (e2) {
      return [];
    }
  }

  function setPlantItems(items) {
    sessionStorage.setItem(KEY_PLANTS, JSON.stringify(mergePlantItems(items || [])));
  }

  function appendPlant(title, size, priceEuro) {
    var items = getPlantItems();
    var t = (title || "").trim() || "Pflanzenpaket";
    var s = (size || "").trim();
    var p = typeof priceEuro === "number" && !isNaN(priceEuro) ? priceEuro : 129;
    var key = t + "\t" + s + "\t" + p;
    var found = false;
    for (var i = 0; i < items.length; i++) {
      if (lineKey(items[i]) === key) {
        items[i].qty = (items[i].qty || 1) + 1;
        found = true;
        break;
      }
    }
    if (!found) items.push({ title: t, size: s, price: p, qty: 1 });
    setPlantItems(items);
    return items.reduce(function (a, b) {
      return a + (b.qty || 1);
    }, 0);
  }

  /** Index-basiert (nach getPlantItems-Reihenfolge). newQty <= 0 entfernt die Zeile. */
  function updatePlantQtyAt(index, newQty) {
    var items = getPlantItems();
    var n = parseInt(newQty, 10);
    if (isNaN(n) || index < 0 || index >= items.length) return items;
    if (n <= 0) items.splice(index, 1);
    else items[index].qty = n;
    setPlantItems(items);
    return getPlantItems();
  }

  function plantQtySum(items) {
    return (items || []).reduce(function (a, it) {
      return a + (typeof it.qty === "number" && it.qty > 0 ? it.qty : 1);
    }, 0);
  }

  /** Summe Pflanzenstückzahlen plus 1, wenn Planungsdokumente im Warenkorb (wie auf der Warenkorb-Seite). */
  function navBadgeCount() {
    migrateLegacyPlants();
    var plants = plantQtySum(getPlantItems());
    var code = sessionStorage.getItem(KEY_CODE);
    var hasCode = !!(code && String(code).trim());
    var planSlot = 0;
    if (hasCode && sessionStorage.getItem(KEY_PLANUNG) !== "0") {
      planSlot = 1;
    }
    return planSlot + plants;
  }

  function aggregatePlantsForDisplay(items) {
    return (items || []).map(function (it) {
      var unit = typeof it.price === "number" && !isNaN(it.price) ? it.price : 129;
      var q = typeof it.qty === "number" && it.qty > 0 ? it.qty : 1;
      return {
        title: it.title,
        size: it.size || "",
        qty: q,
        unitPrice: unit,
        lineTotal: unit * q,
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
    updatePlantQtyAt: updatePlantQtyAt,
    plantQtySum: plantQtySum,
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
