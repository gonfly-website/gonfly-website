/* GoNfly GA4 conversion events. No form field values or personal data are sent. */
(function () {
  "use strict";
  function track(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, Object.assign({ event_category: "engagement" }, params || {}));
    }
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var label = (link.getAttribute("aria-label") || link.textContent || "").trim().slice(0, 80);

    if (/^https?:\/\/(www\.)?wa\.me\//i.test(href) || /api\.whatsapp\.com/i.test(href)) {
      track("whatsapp_click", { link_text: label, link_url: "whatsapp" });
      return;
    }
    if (/enquiry\.html/i.test(href)) {
      track("enquiry_cta_click", { link_text: label, link_url: "enquiry.html" });
      return;
    }
    if (/visa-details\.html/i.test(href)) {
      track("visa_details_click", { link_text: label, link_url: "visa-details.html" });
    }
  }, true);

  var assessment = document.getElementById("assessment");
  if (assessment) {
    assessment.addEventListener("submit", function () {
      if (assessment.reportValidity()) track("visa_assessment_submit");
    });
    var assessmentResult = document.getElementById("result");
    if (assessmentResult && window.MutationObserver) {
      var assessmentSent = false;
      new MutationObserver(function () {
        if (!assessmentSent && !assessmentResult.classList.contains("hidden") && assessmentResult.textContent.trim()) {
          assessmentSent = true;
          track("visa_checklist_generated");
        }
      }).observe(assessmentResult, { childList: true, subtree: true, attributes: true });
    }
  }

  var readiness = document.getElementById("gf-readiness-form");
  if (readiness) {
    readiness.addEventListener("submit", function () {
      if (readiness.reportValidity()) track("readiness_studio_submit");
    });
    var readinessResult = document.getElementById("gf-r-result");
    if (readinessResult && window.MutationObserver) {
      var readinessSent = false;
      new MutationObserver(function () {
        if (!readinessSent && !readinessResult.hidden && readinessResult.textContent.trim()) {
          readinessSent = true;
          track("readiness_checklist_generated");
        }
      }).observe(readinessResult, { childList: true, subtree: true, attributes: true });
    }
  }

  var enquiryResult = document.getElementById("gf-enquiry-result");
  if (enquiryResult && window.MutationObserver) {
    var enquirySent = false;
    new MutationObserver(function () {
      if (!enquirySent && !enquiryResult.hidden && /Enquiry received\./i.test(enquiryResult.textContent)) {
        enquirySent = true;
        track("generate_lead", { lead_type: "website_enquiry", method: "website_form" });
      }
    }).observe(enquiryResult, { childList: true, subtree: true, characterData: true, attributes: true });
  }

  var trackForm = document.getElementById("gf-track-form");
  if (trackForm) {
    trackForm.addEventListener("submit", function () {
      if (trackForm.reportValidity()) track("application_status_check");
    });
  }
})();