(function () {
  "use strict";

  document.documentElement.classList.add("js");
  try {
    if (new URLSearchParams(window.location.search).get("preview") === "1") {
      document.documentElement.classList.add("no-reveal");
    }
  } catch (e) {}

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("siteHeader");
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 18) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("visible"); });
  }

  var copyButtons = document.querySelectorAll("[data-copy]");
  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy") || "";
      var done = function () {
        var previous = button.textContent;
        button.textContent = "已复制";
        button.classList.add("copied");
        window.setTimeout(function () {
          button.textContent = previous;
          button.classList.remove("copied");
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(function () { fallbackCopy(value, done); });
      } else {
        fallbackCopy(value, done);
      }
    });
  });

  function fallbackCopy(value, done) {
    var area = document.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(area);
  }

  var themeToggle = document.getElementById("themeToggle");
  var themeIcon = themeToggle && themeToggle.querySelector(".theme-icon");
  var themeLabel = themeToggle && themeToggle.querySelector(".theme-label");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function paintThemeButton() {
    if (!themeToggle) return;
    var dark = currentTheme() === "dark";
    themeToggle.setAttribute("aria-label", dark ? "切换到浅色主题" : "切换到深色主题");
    themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    if (themeIcon) themeIcon.textContent = dark ? "☀" : "☾";
    if (themeLabel) themeLabel.textContent = dark ? "浅色" : "深色";
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#070a0e" : "#f3f6fa");
  }

  if (themeToggle) {
    paintThemeButton();
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("dragonlauncher-theme", next); } catch (e) {}
      paintThemeButton();
    });
  }


  function scrollToHash() {
    var id = (window.location.hash || "").replace("#", "");
    if (!id) return;
    var target = document.getElementById(id);
    if (target) target.scrollIntoView({ block: "start" });
  }
  window.addEventListener("load", scrollToHash);
  window.addEventListener("hashchange", scrollToHash);

  var canvas = document.getElementById("embers");
  if (!canvas || reduceMotion) return;

  var context = canvas.getContext("2d");
  if (!context) return;
  var particles = [];
  var width = 0;
  var height = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var running = true;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.max(18, Math.min(44, Math.floor(width / 32)));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.7 + Math.random() * 1.7,
        vy: 0.18 + Math.random() * 0.5,
        vx: -0.08 + Math.random() * 0.16,
        alpha: 0.12 + Math.random() * 0.42,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(now) {
    if (!running) return;
    context.clearRect(0, 0, width, height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.vy;
      p.x += p.vx + Math.sin((now / 2400) + p.phase) * 0.08;
      if (p.y < -8) {
        p.y = height + 8;
        p.x = Math.random() * width;
      }
      if (p.x < -8) p.x = width + 8;
      if (p.x > width + 8) p.x = -8;
      context.beginPath();
      context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 122, 69, " + p.alpha + ")";
      context.fill();
    }
    window.requestAnimationFrame(draw);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();
  window.requestAnimationFrame(draw);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      window.requestAnimationFrame(draw);
    }
  });
})();
