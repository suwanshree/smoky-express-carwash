document.addEventListener("DOMContentLoaded", () => {
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
    { passive: true }
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
});
