/* ==========================================================================
   Aharon Kumar Kosetti — portfolio interactions
   Vanilla JS, no dependencies. Everything degrades gracefully.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- theme */
  var THEME_KEY = "ak-theme";
  var root = document.documentElement;

  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      root.setAttribute("data-theme", saved);
    } else {
      root.setAttribute("data-theme", "dark");
    }
  } catch (e) { /* storage blocked — keep default */ }

  var themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ------------------------------------------------- header + progress bar */
  var header = $("#siteHeader");
  var progress = $("#scrollProgress");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 12);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
    updateActiveNav();
  }

  /* --------------------------------------------------------- mobile nav */
  var nav = $("#nav");
  var navToggle = $("#navToggle");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach(function (link) { link.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ------------------------------------------------------- active nav link */
  var navLinks = $$("#nav a");
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute("href").slice(1)); })
    .filter(Boolean);

  function updateActiveNav() {
    if (!sections.length) return;
    var probe = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.32;
    var current = sections[0].id;
    sections.forEach(function (section) {
      if (section.offsetTop <= probe) current = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + current);
    });
  }

  /* ------------------------------------------------------------- reveal */
  var revealables = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------ counters */
  var counters = $$(".count");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var start = performance.now();
    var duration = 1200;
    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); counterObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ------------------------------------------------------- spotlight cards */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    $$(".spotlight").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - rect.left + "px");
        card.style.setProperty("--my", e.clientY - rect.top + "px");
      });
    });
  }

  /* -------------------------------------------------------------- marquee */
  var TECH = [
    { name: "React", icon: "react/react-original" },
    { name: "TypeScript", icon: "typescript/typescript-original" },
    { name: "JavaScript", icon: "javascript/javascript-original" },
    { name: "Node.js", icon: "nodejs/nodejs-original" },
    { name: "Next.js", icon: "nextjs/nextjs-original" },
    { name: "PostgreSQL", icon: "postgresql/postgresql-original" },
    { name: "Tailwind CSS", icon: "tailwindcss/tailwindcss-original" },
    { name: "NestJS", icon: "nestjs/nestjs-original" },
    { name: "Java", icon: "java/java-original" },
    { name: "Python", icon: "python/python-original" },
    { name: "Vite", icon: "vitejs/vitejs-original" },
    { name: "Git", icon: "git/git-original" }
  ];
  var CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/";

  var track = $("#marqueeTrack");
  if (track) {
    var frag = document.createDocumentFragment();
    // Rendered twice so the -50% translate loop is seamless.
    TECH.concat(TECH).forEach(function (tech) {
      var item = document.createElement("span");
      item.className = "marquee-item";
      var img = document.createElement("img");
      img.src = CDN + tech.icon + ".svg";
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.remove(); });
      item.appendChild(img);
      item.appendChild(document.createTextNode(tech.name));
      frag.appendChild(item);
    });
    track.appendChild(frag);
  }

  /* ----------------------------------------------------------- stack grid */
  var STACK = [
    {
      title: "Languages", index: "01",
      items: ["TypeScript", "JavaScript", "Java", "Python", "C", "SQL"]
    },
    {
      title: "Frontend", index: "02",
      items: ["React", "Next.js", "Tailwind CSS", "Vite", "HTML / CSS"]
    },
    {
      title: "Backend", index: "03",
      items: ["Node.js", "NestJS", "Express", "REST APIs", "Drizzle ORM"]
    },
    {
      title: "Data & Infra", index: "04",
      items: ["PostgreSQL", "MySQL", "Supabase", "Neon", "Appwrite", "Vercel"]
    },
    {
      title: "Practices", index: "05",
      items: ["Git & GitHub", "JWT Auth", "CI/CD", "Vitest", "Agentic AI / LLM APIs"]
    }
  ];

  var stackGrid = $("#stackGrid");
  if (stackGrid) {
    STACK.forEach(function (group) {
      var card = document.createElement("article");
      card.className = "stack-card reveal";

      var head = document.createElement("div");
      head.className = "stack-card-head";
      var idx = document.createElement("span");
      idx.className = "stack-index";
      idx.textContent = group.index;
      var h3 = document.createElement("h3");
      h3.textContent = group.title;
      head.appendChild(idx);
      head.appendChild(h3);

      var list = document.createElement("ul");
      list.className = "stack-items";
      group.items.forEach(function (name) {
        var li = document.createElement("li");
        li.textContent = name;
        list.appendChild(li);
      });

      card.appendChild(head);
      card.appendChild(list);
      stackGrid.appendChild(card);
    });

    if ("IntersectionObserver" in window && !reduceMotion) {
      var stackObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            stackObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      $$(".stack-card", stackGrid).forEach(function (el, i) {
        el.style.transitionDelay = (i % 3) * 0.07 + "s";
        stackObserver.observe(el);
      });
    } else {
      $$(".stack-card", stackGrid).forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ------------------------------------------------------- typed terminal */
  var typed = $("#typed");
  var LINES = [
    { text: "$ whoami\n", cls: "c-cmd" },
    { text: "aharon · full-stack dev · AP, India\n\n", cls: "" },
    { text: "$ stack --current\n", cls: "c-cmd" },
    { text: "React · Node · PostgreSQL · LLM APIs\n\n", cls: "c-key" },
    { text: "$ ship --medivault\n", cls: "c-cmd" },
    { text: "✔ built in 36h · 2nd / 50+ teams\n", cls: "c-ok" }
  ];

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /**
   * Paint lines[0..done-1] fully plus `partial` characters of the active line.
   */
  function paint(doneLines, activeIndex, partial) {
    var html = doneLines.map(function (line) {
      return '<span class="' + line.cls + '">' + escapeHtml(line.text) + "</span>";
    }).join("");
    if (activeIndex < LINES.length && partial > 0) {
      var active = LINES[activeIndex];
      html += '<span class="' + active.cls + '">' +
        escapeHtml(active.text.slice(0, partial)) + "</span>";
    }
    typed.innerHTML = html;
  }

  if (typed) {
    if (reduceMotion) {
      paint(LINES, LINES.length, 0);
    } else {
      var done = [];
      var lineIndex = 0;
      var charIndex = 0;

      var typeNext = function () {
        if (lineIndex >= LINES.length) { paint(LINES, LINES.length, 0); return; }
        var line = LINES[lineIndex];
        charIndex++;
        paint(done, lineIndex, charIndex);
        if (charIndex >= line.text.length) {
          done.push(line);
          lineIndex++;
          charIndex = 0;
          setTimeout(typeNext, 260);
        } else {
          var justTyped = line.text.charAt(charIndex - 1);
          setTimeout(typeNext, justTyped === "\n" ? 110 : 24);
        }
      };

      var start = function () {
        if (!("IntersectionObserver" in window)) { typeNext(); return; }
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { observer.disconnect(); typeNext(); }
          });
        }, { threshold: 0.3 });
        observer.observe(typed);
      };

      start();
    }
  }

  /* --------------------------------------------------------------- misc */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
