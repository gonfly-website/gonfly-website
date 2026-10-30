/* GoNfly privacy-first analytics consent manager.
   GA4 loads only after a visitor explicitly accepts analytics. */
(function () {
  "use strict";
  var MEASUREMENT_ID = "G-X261LYKRVP";
  var STORAGE_KEY = "gonfly_analytics_consent_v1";
  var loaded = false;

  function readChoice() {
    try { return window.localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }
  }

  function loadAnalytics() {
    if (loaded || window.gtag) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    document.head.appendChild(script);
  }

  function saveChoice(choice) {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch (e) {}
    closeBanner();
    if (choice === "accepted") loadAnalytics();
    showSettingsButton();
  }

  var style = document.createElement("style");
  style.textContent = [
    "#gonfly-cookie-banner{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:20px;background:#101114;color:#f7f7f7;border:1px solid #393b42;border-radius:16px;box-shadow:0 12px 44px rgba(0,0,0,.34);font:14px/1.55 Arial,sans-serif;display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap}",
    "#gonfly-cookie-banner[hidden],#gonfly-cookie-settings[hidden]{display:none}",
    "#gonfly-cookie-banner p{margin:5px 0 0;color:#c9cbd1;max-width:470px}",
    "#gonfly-cookie-banner strong{font-size:16px;letter-spacing:.01em}",
    ".gonfly-cookie-actions{display:flex;gap:8px;flex-wrap:wrap}",
    ".gonfly-cookie-actions button,#gonfly-cookie-settings{border:1px solid #666;background:transparent;color:#fff;border-radius:999px;padding:10px 15px;font-weight:600;cursor:pointer;font-size:13px}",
    ".gonfly-cookie-actions .primary{background:#fff;color:#111;border-color:#fff}",
    "#gonfly-cookie-settings{position:fixed;z-index:99998;right:14px;bottom:14px;background:#101114;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.22)}",
    "#gonfly-cookie-banner button:focus-visible,#gonfly-cookie-settings:focus-visible{outline:3px solid #e24a4a;outline-offset:3px}",
    "@media(max-width:560px){#gonfly-cookie-banner{left:10px;right:10px;bottom:10px;padding:16px}.gonfly-cookie-actions{width:100%}.gonfly-cookie-actions button{flex:1}}"
  ].join("");
  document.head.appendChild(style);

  function closeBanner() {
    var el = document.getElementById("gonfly-cookie-banner");
    if (el) el.hidden = true;
  }
  function showSettingsButton() {
    var el = document.getElementById("gonfly-cookie-settings");
    if (el) el.hidden = false;
  }
  function openBanner() {
    var el = document.getElementById("gonfly-cookie-banner");
    if (el) el.hidden = false;
  }

  function mount() {
    var choice = readChoice();
    if (choice === "accepted") loadAnalytics();

    var banner = document.createElement("section");
    banner.id = "gonfly-cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie and analytics preferences");
    banner.hidden = choice === "accepted" || choice === "rejected";
    banner.innerHTML = '<div><strong>Your privacy matters</strong><p>GoNfly uses optional Google Analytics to understand website visits and improve the experience. Analytics stays off unless you choose to allow it. You can change your choice anytime.</p><p><a href="/privacy.html" style="color:#fff;text-decoration:underline">Privacy Policy</a></p></div><div class="gonfly-cookie-actions"><button type="button" data-choice="rejected">Reject analytics</button><button type="button" class="primary" data-choice="accepted">Accept analytics</button></div>';
    banner.addEventListener("click", function (event) {
      var choiceButton = event.target.closest("[data-choice]");
      if (choiceButton) saveChoice(choiceButton.getAttribute("data-choice"));
    });
    document.body.appendChild(banner);

    var settings = document.createElement("button");
    settings.id = "gonfly-cookie-settings";
    settings.type = "button";
    settings.textContent = "Cookie settings";
    settings.setAttribute("aria-label", "Open cookie and analytics settings");
    settings.hidden = !choice;
    settings.addEventListener("click", openBanner);
    document.body.appendChild(settings);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();