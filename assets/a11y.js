// accessibility menu: text size, high contrast, highlighted links, readable font, stop animations.
// the choices are saved in the visitor's browser and applied on every page.
(function () {
  var script = document.currentScript;
  var base = script ? script.src.replace(/assets\/a11y\.js.*$/, "") : "/";
  var he = (document.documentElement.lang || "he").indexOf("he") === 0;
  var root = document.documentElement;
  var KEY = "gonet-a11y";

  var t = he
    ? {
        open: "תפריט נגישות",
        title: "נגישות",
        close: "סגירה",
        bigger: "הגדלת טקסט",
        smaller: "הקטנת טקסט",
        contrast: "ניגודיות גבוהה",
        links: "הדגשת קישורים",
        font: "גופן קריא",
        noanim: "עצירת אנימציות",
        reset: "איפוס הגדרות",
        statement: "הצהרת נגישות",
        size: "גודל טקסט",
        statementUrl: base + "accessibility/",
      }
    : {
        open: "Accessibility menu",
        title: "Accessibility",
        close: "Close",
        bigger: "Larger text",
        smaller: "Smaller text",
        contrast: "High contrast",
        links: "Highlight links",
        font: "Readable font",
        noanim: "Stop animations",
        reset: "Reset settings",
        statement: "Accessibility statement",
        size: "Text size",
        statementUrl: base + "en/accessibility/",
      };

  var toggles = ["contrast", "links", "font", "noanim"];
  var state = { zoom: 1, contrast: false, links: false, font: false, noanim: false };

  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    for (var k in state) if (k in saved) state[k] = saved[k];
  } catch (e) {}

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function apply() {
    root.style.setProperty("--a11y-zoom", state.zoom);
    root.classList.toggle("a11y-zoomed", state.zoom !== 1);
    toggles.forEach(function (name) {
      root.classList.toggle("a11y-" + name, !!state[name]);
      var b = panel && panel.querySelector('[data-toggle="' + name + '"]');
      if (b) b.setAttribute("aria-pressed", state[name] ? "true" : "false");
    });
    if (sizeOut) sizeOut.textContent = Math.round(state.zoom * 100) + "%";
  }

  var panel, sizeOut;
  apply();

  var icon =
    '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false"><circle cx="12" cy="4" r="2" fill="currentColor"/><path fill="currentColor" d="M20.5 7.5c-2.6.7-5.5 1-8.5 1s-5.9-.3-8.5-1l-.5 2c1.9.5 4 .9 6 1V22h2v-6h2v6h2V10.5c2-.1 4.1-.5 6-1l-.5-2z"/></svg>';

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "a11y-root";
    wrap.innerHTML =
      '<button type="button" class="a11y-btn" aria-expanded="false" aria-controls="a11y-panel" aria-label="' + t.open + '" title="' + t.open + '">' + icon + "</button>" +
      '<div class="a11y-panel" id="a11y-panel" role="dialog" aria-label="' + t.title + '" hidden>' +
      '<div class="a11y-head"><strong>' + t.title + '</strong><button type="button" class="a11y-close" aria-label="' + t.close + '">✕</button></div>' +
      '<div class="a11y-size" role="group" aria-label="' + t.size + '">' +
      '<button type="button" data-act="smaller" aria-label="' + t.smaller + '">A−</button>' +
      '<output aria-live="polite"></output>' +
      '<button type="button" data-act="bigger" aria-label="' + t.bigger + '">A+</button></div>' +
      toggles.map(function (name) {
        return '<button type="button" class="a11y-opt" data-toggle="' + name + '" aria-pressed="false">' + t[name] + "</button>";
      }).join("") +
      '<button type="button" class="a11y-opt a11y-reset" data-act="reset">' + t.reset + "</button>" +
      '<a class="a11y-link" href="' + t.statementUrl + '">' + t.statement + "</a>" +
      "</div>";
    document.body.appendChild(wrap);

    var btn = wrap.querySelector(".a11y-btn");
    panel = wrap.querySelector(".a11y-panel");
    sizeOut = panel.querySelector("output");

    function setOpen(open) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) panel.querySelector("button").focus();
    }

    btn.addEventListener("click", function () { setOpen(panel.hidden); });
    panel.querySelector(".a11y-close").addEventListener("click", function () { setOpen(false); btn.focus(); });
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { setOpen(false); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !wrap.contains(e.target)) setOpen(false);
    });

    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var name = b.getAttribute("data-toggle");
      var act = b.getAttribute("data-act");
      if (name) state[name] = !state[name];
      if (act === "bigger") state.zoom = Math.min(1.6, Math.round((state.zoom + 0.1) * 10) / 10);
      if (act === "smaller") state.zoom = Math.max(0.9, Math.round((state.zoom - 0.1) * 10) / 10);
      if (act === "reset") state = { zoom: 1, contrast: false, links: false, font: false, noanim: false };
      apply();
      save();
    });

    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
