/* ==========================================================================
   Profile card — small, dependency-free interactions
   theme toggle · avatar fallback · copy email · subtle 3D tilt
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (sel) { return document.querySelector(sel); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ------------------------------------------------------------ theme */
  var KEY = "ak-theme";
  try {
    var saved = localStorage.getItem(KEY);
    root.setAttribute("data-theme", saved === "light" || saved === "dark" ? saved : "dark");
  } catch (e) { /* storage unavailable — stay dark */ }

  var toggle = $("#themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  /* --------------------------------------------------- avatar fallback */
  var img = $("#avatarImg");
  var wrap = $("#avatarWrap");
  if (img && wrap) {
    var useMonogram = function () { wrap.classList.add("no-img"); };
    img.addEventListener("error", useMonogram);
    if (img.complete && img.naturalWidth === 0) useMonogram();
  }

  /* ------------------------------------------------------- copy email */
  var copyBtn = $("#copyMail");
  if (copyBtn) {
    var reset;
    copyBtn.addEventListener("click", function () {
      var mail = copyBtn.getAttribute("data-mail") || "";
      var done = function () {
        copyBtn.textContent = "Copied ✓";
        copyBtn.classList.add("done");
        clearTimeout(reset);
        reset = setTimeout(function () {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("done");
        }, 1800);
      };
      var legacy = function () {
        var input = document.createElement("textarea");
        input.value = mail;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(input);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail).then(done, legacy);
      } else {
        legacy();
      }
    });
  }

  /* ------------------------------------------------------- card tilt */
  var card = $("#card");
  if (card && canHover && !reduceMotion) {
    var raf = 0;
    card.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");
        card.style.transform =
          "perspective(1100px) rotateX(" + ((0.5 - py) * 3.4).toFixed(2) + "deg)" +
          " rotateY(" + ((px - 0.5) * 4.2).toFixed(2) + "deg)";
      });
    });
    card.addEventListener("pointerleave", function () {
      card.style.transform = "";
    });
  }

  /* ------------------------------------------------------------- year */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
