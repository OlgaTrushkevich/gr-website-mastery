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

const backLink = document.querySelector(".page-back");
if (backLink && document.referrer) {
  const previousPage = new URL(document.referrer);
  const siteRoot = new URL(".", backLink.href);
  if (previousPage.origin === siteRoot.origin && previousPage.pathname.startsWith(siteRoot.pathname) && history.length > 1) {
    backLink.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.back();
    });
  }
}


const briefToggle = document.querySelector("#download-brief-toggle");
const briefPanel = document.querySelector("#download-brief-panel");
const briefForm = document.querySelector("#executive-brief-form");
if (briefToggle && briefPanel && briefForm) {
  const responseFrame = document.querySelector('iframe[name="lead-response-frame"]');
  const status = document.querySelector("#download-brief-status");
  const submitButton = briefForm.querySelector('button[type="submit"]');
  const endpoint = "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE";
  let activeToken = "";
  let requestTimer;

  briefToggle.addEventListener("click", () => {
    const isOpening = briefPanel.hidden;
    briefPanel.hidden = !isOpening;
    briefToggle.setAttribute("aria-expanded", String(isOpening));
    if (isOpening) briefForm.querySelector('input[name="name"]').focus();
  });

  window.addEventListener("message", (event) => {
    if (event.source !== responseFrame.contentWindow) return;
    const result = event.data;
    if (!result || result.type !== "masteryExecutiveBriefResult" || result.token !== activeToken) return;
    window.clearTimeout(requestTimer);
    submitButton.disabled = false;
    status.dataset.state = result.ok ? "success" : "error";
    status.textContent = result.ok
      ? "Your request was sent successfully. The PDF is on its way to your email."
      : (result.message || "We could not send the PDF. Please try again or email grace@themasterycompany.com.");
    if (result.ok) {
      briefForm.querySelectorAll("label, button").forEach((element) => { element.hidden = true; });
    }
  });

  briefForm.addEventListener("submit", (event) => {
    if (!endpoint.startsWith("https://script.google.com/macros/s/")) {
      event.preventDefault();
      status.dataset.state = "error";
      status.textContent = "The PDF request form is not available yet. Please email grace@themasterycompany.com.";
      return;
    }
    briefForm.action = endpoint;
    briefForm.target = responseFrame.name;
    briefForm.elements.pageUrl.value = window.location.href;
    briefForm.elements.referrer.value = document.referrer;
    activeToken = window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
    briefForm.elements.responseToken.value = activeToken;
    submitButton.disabled = true;
    status.dataset.state = "";
    status.textContent = "Sending your request...";
    requestTimer = window.setTimeout(() => {
      submitButton.disabled = false;
      status.dataset.state = "error";
      status.textContent = "The request is taking longer than expected. Please try again or email grace@themasterycompany.com.";
    }, 45000);
  });
}
