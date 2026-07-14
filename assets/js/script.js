document.addEventListener("DOMContentLoaded", () => {
  const SITE_LOCATIONS = {
    sevierville: {
      name: "Sevierville",
      status: "open",
      address: "994 Parkway",
      city: "Sevierville",
      state: "TN",
      zip: "37862",
      phone: "865-286-9051",
      phoneHref: "tel:+18652869051",
      mapTitle: "Map showing Smoky Express Car Wash in Sevierville, Tennessee",
      mapSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3233.884647839153!2d-83.57397301174258!3d35.8518319497732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x885bf93345313adb%3A0x48024f86b06e75f6!2sSmoky%20Express%20Car%20Wash!5e0!3m2!1sen!2sus!4v1774367775602!5m2!1sen!2sus",
    },
    chattanooga: {
      name: "Chattanooga",
      status: "coming-soon",
      address: "4907 TN-58",
      city: "Chattanooga",
      state: "TN",
      zip: "37416",
      phone: "",
      phoneHref: "",
      mapTitle: "Map showing 4907 TN-58 in Chattanooga, Tennessee",
      mapSrc:
        "https://www.google.com/maps?q=4907%20TN-58%2C%20Chattanooga%2C%20TN%2037416&output=embed",
    },
    ooltewah: {
      name: "Ooltewah",
      status: "coming-soon",
      address: "9025 Jac Cate Rd",
      city: "Ooltewah",
      state: "TN",
      zip: "37363",
      phone: "",
      phoneHref: "",
      mapTitle: "Map showing 9025 Jac Cate Rd in Ooltewah, Tennessee",
      mapSrc:
        "https://www.google.com/maps?q=9025%20Jac%20Cate%20Rd%2C%20Ooltewah%2C%20TN%2037363&output=embed",
    },
  };

  const DEFAULT_SITE_LOCATION = "sevierville";

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

  function getLocationByKey(locationKey) {
    return SITE_LOCATIONS[locationKey] || SITE_LOCATIONS[DEFAULT_SITE_LOCATION];
  }

  function getLocationAddress(location) {
    return `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  }

  function setTextContent(selector, value) {
    document.querySelectorAll(selector).forEach((item) => {
      item.textContent = value;
    });
  }

  function setLocationPanel(locationKey) {
    const selectedLocation = getLocationByKey(locationKey);
    const isComingSoon = selectedLocation.status !== "open";
    const selectedAddress = getLocationAddress(selectedLocation);

    document.documentElement.dataset.selectedLocation = locationKey;

    document.querySelectorAll("[data-location-selector]").forEach((group) => {
      group.querySelectorAll("[data-location-option]").forEach((button) => {
        const isActive = button.dataset.locationOption === locationKey;

        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    });

    document.querySelectorAll("[data-location-dependent]").forEach((panel) => {
      panel.classList.toggle("is-coming-soon", isComingSoon);
      panel.dataset.activeLocation = locationKey;
    });

    setTextContent("[data-selected-location-name]", selectedLocation.name);
    setTextContent("[data-selected-location-address]", selectedAddress);
    setTextContent(
      "[data-selected-location-status]",
      isComingSoon ? "Coming soon" : "OPEN DAILY - 8 AM TO 8 PM",
    );

    const locationTitle = isComingSoon
      ? `Coming Soon In ${selectedLocation.name}`
      : `Visit Us In ${selectedLocation.name}`;
    setTextContent("[data-location-title]", locationTitle);
    setTextContent(
      "[data-location-note]",
      isComingSoon
        ? "This location is not open yet. We will add hours, maps, pricing, and local launch details as opening gets closer."
        : "Chattanooga and Ooltewah are coming soon. Select either location above to see the planned address.",
    );

    document.querySelectorAll("[data-selected-location-phone]").forEach((link) => {
      if (selectedLocation.phone && selectedLocation.phoneHref) {
        link.hidden = false;
        link.textContent = selectedLocation.phone;
        link.setAttribute("href", selectedLocation.phoneHref);
      } else {
        link.hidden = true;
        link.textContent = "";
        link.removeAttribute("href");
      }
    });

    document.querySelectorAll("[data-location-map]").forEach((container) => {
      const frame = container.querySelector("iframe");

      container.hidden = !selectedLocation.mapSrc;

      if (frame && selectedLocation.mapSrc) {
        frame.src = selectedLocation.mapSrc;
        frame.title = selectedLocation.mapTitle || `Map showing ${selectedLocation.name}`;
      }
    });
  }

  function initializeLocationSelectors() {
    const selectors = document.querySelectorAll("[data-location-selector]");

    if (!selectors.length) {
      return;
    }

    selectors.forEach((group) => {
      group.querySelectorAll("[data-location-option]").forEach((button) => {
        button.addEventListener("click", () => {
          setLocationPanel(button.dataset.locationOption || DEFAULT_SITE_LOCATION);
        });
      });
    });

    setLocationPanel(DEFAULT_SITE_LOCATION);
  }

  preserveAttributionAcrossInternalLinks();
  initializeAttributionButtons();
  initializeLocationSelectors();

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
