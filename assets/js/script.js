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

  function setHeaderHeight() {
    const header = document.querySelector("header");
    const height = header.offsetHeight;
    document.documentElement.style.setProperty(
      "--header-height",
      height + "px",
    );
  }

  window.addEventListener("load", setHeaderHeight);
  window.addEventListener("resize", setHeaderHeight);
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

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("nav--open");
    menuToggle.classList.toggle("active");

    document.body.style.overflow = nav.classList.contains("nav--open")
      ? "hidden"
      : "";
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav--open");
      menuToggle.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      faqItems.forEach((i) => {
        i.classList.remove("active");
        i.querySelector(".faq-answer").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* CONSTRUCTION OVERLAY FOR ALL CARDS */

  function applyConstructionOverlay() {
    const articles = document.querySelectorAll(
      "#services article, #membership article",
    );

    articles.forEach((article) => {
      article.classList.add("card-under-construction");
    });
  }

  window.addEventListener("load", applyConstructionOverlay);
  // Disable all buttons site-wide (construction mode)
  // CONSTRUCTION MODE — disable all buttons
  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(
      "button:not([data-construction-exempt='true']):not(.menu-toggle):not(.faq-question)",
    );

    buttons.forEach((button) => {
      // true disable
      button.disabled = true;

      // block pointer interaction completely
      button.style.pointerEvents = "none";

      // show blocked cursor
      button.style.cursor = "not-allowed";

      // optional styling class
      button.classList.add("disabled-construction");
    });
  });
});
