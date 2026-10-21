(function () {
  "use strict";

  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const toggle = document.querySelector(".nav-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;
      if (header && !header.contains(event.target)) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  document.querySelectorAll(".cards-grid, .campus-grid").forEach((grid) => {
    Array.from(grid.children).forEach((child, index) => {
      child.style.setProperty("--reveal-delay", index * 70 + "ms");
    });
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealItems.length && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }

  const counters = document.querySelectorAll(".count");
  if (counters.length) {
    const formatter = new Intl.NumberFormat("es-GT");

    const animateCounter = (element) => {
      const target = parseInt(element.dataset.target, 10) || 0;
      if (reduceMotion) {
        element.textContent = formatter.format(target);
        return;
      }
      const duration = 1500;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatter.format(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((counter) => counterObserver.observe(counter));
    } else {
      counters.forEach(animateCounter);
    }
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll(".media-frame img, .why-media img").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.visibility = "hidden";
    });
  });

  const form = document.getElementById("contactForm");
  if (form) {
    const success = document.getElementById("formSuccess");
    const submitButton = form.querySelector('button[type="submit"]');

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    const isFilled = (value) => value.trim().length > 1;
    const isPhone = (value) => value.replace(/\D/g, "").length >= 8;

    const validators = {
      nombre: isFilled,
      correo: isValidEmail,
      telefono: isPhone,
      interes: (value) => value.trim() !== ""
    };

    const fields = Object.keys(validators)
      .map((name) => form.elements[name])
      .filter(Boolean);

    fields.forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("invalid"));
      field.addEventListener("change", () => field.classList.remove("invalid"));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let firstInvalid = null;

      fields.forEach((field) => {
        const valid = validators[field.name](field.value);
        field.classList.toggle("invalid", !valid);
        field.setAttribute("aria-invalid", String(!valid));
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (success) success.hidden = true;
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
      }

      window.setTimeout(() => {
        form.reset();
        fields.forEach((field) => field.removeAttribute("aria-invalid"));
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Solicitar información";
        }
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
        }
      }, 600);
    });
  }
})();
