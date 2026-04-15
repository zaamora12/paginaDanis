(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 1024px)").matches) {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  if ("IntersectionObserver" in window) {
    var revealTargets = document.querySelectorAll(
      ".hero__content, .hero__figure, .section__header, .card, .home-tile"
    );
    revealTargets.forEach(function (el, i) {
      el.classList.add("reveal-on-scroll");
      el.style.setProperty("--reveal-order", String(i % 8));
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length && "IntersectionObserver" in window) {
    var animateCounter = function (el) {
      var target = Number(el.getAttribute("data-count-to")) || 0;
      var duration = 2600;
      var start = performance.now();

      var tick = function (now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 4);
        var value = Math.round(target * eased);
        el.textContent = String(value);
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    };

    var counterObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  // Transiciones suaves entre páginas (MPA): salida con fundido; entrada vía CSS en body
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    document.addEventListener(
      "click",
      function (e) {
        var a = e.target.closest("a");
        if (!a || !a.href) return;
        if (e.defaultPrevented) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target === "_blank") return;
        if (a.hasAttribute("download")) return;
        var hrefAttr = a.getAttribute("href");
        if (!hrefAttr || hrefAttr === "#" || hrefAttr.trim().charAt(0) === "#") return;
        if (/^mailto:/i.test(a.href) || /^tel:/i.test(a.href)) return;
        if (/^javascript:/i.test(hrefAttr)) return;

        var nextUrl;
        var curUrl;
        try {
          nextUrl = new URL(a.href, window.location.href);
          curUrl = new URL(window.location.href);
        } catch (err) {
          return;
        }

        if (nextUrl.href === curUrl.href) return;
        if (nextUrl.origin !== curUrl.origin) return;
        if (nextUrl.pathname === curUrl.pathname && nextUrl.search === curUrl.search) return;

        e.preventDefault();

        var done = false;
        function navigate() {
          if (done) return;
          done = true;
          window.location.assign(nextUrl.href);
        }

        document.body.classList.add("is-page-exit");
        var ms = 280;
        var fallback = window.setTimeout(navigate, ms);

        function onEnd(ev) {
          if (ev.target !== document.body) return;
          if (ev.propertyName !== "opacity" && ev.propertyName !== "transform") return;
          window.clearTimeout(fallback);
          document.body.removeEventListener("transitionend", onEnd);
          navigate();
        }
        document.body.addEventListener("transitionend", onEnd);
      },
      false
    );
  }

  var prefetchSeen = Object.create(null);
  document.addEventListener(
    "pointerenter",
    function (e) {
      var a = e.target.closest("a");
      if (!a || !a.href) return;
      if (a.target === "_blank") return;
      try {
        var nextUrl = new URL(a.href, window.location.href);
        var curUrl = new URL(window.location.href);
        if (nextUrl.origin !== curUrl.origin) return;
        if (nextUrl.pathname === curUrl.pathname && nextUrl.search === curUrl.search) return;
      } catch (err) {
        return;
      }
      var href = a.href;
      if (prefetchSeen[href]) return;
      prefetchSeen[href] = true;
      var link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    },
    true
  );

  // Carrusel continuo manejado por CSS (loop infinito)
})();
