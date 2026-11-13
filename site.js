const track = document.querySelector(".photo-track");
if (track) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  for (const button of document.querySelectorAll("[data-slide]")) {
    button.addEventListener("click", () => {
      const step = track.firstElementChild.getBoundingClientRect().width;
      track.scrollBy({ left: Number(button.dataset.slide) * (step + 12), behavior: motion.matches ? "instant" : "smooth" });
    });
  }
}

const tabs = document.querySelector(".tabs");
if (tabs) {
  const links = Array.from(tabs.querySelectorAll("a"));
  const showPanel = () => {
    const active = links.find((link) => link.hash === location.hash) || links[0];
    for (const link of links) {
      link.setAttribute("aria-current", String(link === active));
      document.getElementById(link.hash.slice(1)).hidden = link !== active;
    }
  };
  showPanel();
  window.addEventListener("hashchange", showPanel);
}

const form = document.querySelector("#request-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const subject = encodeURIComponent(fields.get("topic"));
    const body = encodeURIComponent(`Name: ${fields.get("name")}\nEmail: ${fields.get("email")}\n\n${fields.get("message")}`);
    location.href = `${form.action}?subject=${subject}&body=${body}`;
  });
}
