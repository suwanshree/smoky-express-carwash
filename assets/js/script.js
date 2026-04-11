document.addEventListener("DOMContentLoaded", () => {
  const ATTRIBUTION_QUERY_KEYS = [
    "src",
    "sub",
    "ref",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  function getCurrentAttributionParams() {
    const currentParams = new URLSearchParams(window.location.search);
    const attributionParams = new URLSearchParams();

    ATTRIBUTION_QUERY_KEYS.forEach((key) => {
      const value = currentParams.get(key);

      if (value) {
        attributionParams.set(key, value);
      }
    });

    return attributionParams;
  }

  function hasAttributionParams(attributionParams) {
    return ATTRIBUTION_QUERY_KEYS.some((key) => attributionParams.has(key));
  }

  function applyAttributionParams(url, attributionParams) {
    ATTRIBUTION_QUERY_KEYS.forEach((key) => {
      if (attributionParams.has(key)) {
        url.searchParams.set(key, attributionParams.get(key));
      } else {
        url.searchParams.delete(key);
      }
    });

    return url;
  }

  function getRelativeUrl(url) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function preserveAttributionAcrossInternalLinks() {
    const attributionParams = getCurrentAttributionParams();

    if (!hasAttributionParams(attributionParams)) {
      return;
    }

    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      let url;

      try {
        url = new URL(href, window.location.href);
      } catch (error) {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      link.setAttribute(
        "href",
        getRelativeUrl(applyAttributionParams(url, attributionParams)),
      );
    });
  }

  function initializeAttributionButtons() {
    document.querySelectorAll("[data-attribution-href]").forEach((button) => {
      const fallbackHref = button.getAttribute("data-attribution-href");

      if (!fallbackHref) {
        return;
      }

      button.addEventListener("click", () => {
        if (button.disabled) {
          return;
        }

        const destination = new URL(fallbackHref, window.location.href);
        const attributionParams = getCurrentAttributionParams();

        if (hasAttributionParams(attributionParams)) {
          applyAttributionParams(destination, attributionParams);
        }

        window.location.href = getRelativeUrl(destination);
      });
    });
  }

  preserveAttributionAcrossInternalLinks();
  initializeAttributionButtons();

  const header = document.querySelector("header");
  const nav = document.querySelector("nav");
  if (!header) {
    return;
  }

  let lastScrollY = window.scrollY;
  const hideOffset = 80;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > hideOffset) {
        header.classList.add("header--hidden");
      } else {
        header.classList.remove("header--hidden");
      }

      lastScrollY = currentScrollY;
    },
    { passive: true },
  );

  const menuToggle = document.querySelector(".menu-toggle");

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("nav--open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
    };

    const openMenu = () => {
      nav.classList.add("nav--open");
      menuToggle.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
    };

    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      if (nav.classList.contains("nav--open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("nav--open")) {
        closeMenu();
      }
    });
  }

  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item, index) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) {
      return;
    }

    const questionId = `faq-question-${index + 1}`;
    const answerId = `faq-answer-${index + 1}`;

    button.id = questionId;
    button.type = "button";
    button.setAttribute("aria-controls", answerId);
    button.setAttribute("aria-expanded", "false");

    answer.id = answerId;
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", questionId);
    answer.setAttribute("aria-hidden", "true");

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      faqItems.forEach((i) => {
        const currentButton = i.querySelector(".faq-question");
        const currentAnswer = i.querySelector(".faq-answer");

        i.classList.remove("active");
        if (currentButton) {
          currentButton.setAttribute("aria-expanded", "false");
        }
        if (currentAnswer) {
          currentAnswer.setAttribute("aria-hidden", "true");
          currentAnswer.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        item.classList.add("active");
        button.setAttribute("aria-expanded", "true");
        answer.setAttribute("aria-hidden", "false");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  const revealItems = document.querySelectorAll(".reveal-up");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  } else {
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -48px 0px",
      },
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);
      observer.observe(item);
    });
  }
});
