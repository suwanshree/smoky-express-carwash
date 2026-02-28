document.addEventListener("DOMContentLoaded", () => {
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
    const buttons = document.querySelectorAll("button");

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
