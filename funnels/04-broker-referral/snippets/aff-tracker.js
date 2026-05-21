/*
 * Dream Gate Financial — Affiliate attribution tracker
 * -----------------------------------------------------
 * What this does:
 *   1. Reads ?aff=<affiliate_id> from the current page URL on every page load.
 *   2. Stores it in a first-party cookie (dgf_aff) for the attribution window
 *      defined below. First-touch wins — once set, the cookie is NOT overwritten
 *      by a later visit with a different ?aff= (matches the policy in
 *      funnels/04-broker-referral/config.md "Attribution").
 *   3. Prefills every embedded GHL form on the page with the affiliate ID and
 *      attribution date by appending query params to the iframe src.
 *
 * Where this runs:
 *   - Paste this verbatim into Sub-Account Settings → Business Profile →
 *     Tracking Code → Footer Tracking Code (or the equivalent global slot)
 *     so it executes on every page across all funnels — the funding-side
 *     funnels (01–03) and any future ones — without per-page setup.
 *
 * How affiliates use this:
 *   - They share a link like https://dreamgatefinancial.com/?aff=GM-001
 *     or any deeper page with ?aff= appended. The query string survives
 *     internal navigation because the cookie is set on first visit.
 *
 * Field names being prefilled (must exactly match the GHL custom field names):
 *   - "Referring Affiliate ID"
 *   - "Affiliate Attribution Date"
 *   See funnels/04-broker-referral/ghl-resources.md §2 for field definitions.
 */
(function () {
  var COOKIE_NAME       = 'dgf_aff';
  var COOKIE_TS_NAME    = 'dgf_aff_first_touch';
  var ATTRIBUTION_DAYS  = 90; // mirrors config.md "Attribution window"
  var URL_PARAM         = 'aff';
  var FIELD_AFFILIATE   = 'Referring Affiliate ID';
  var FIELD_DATE        = 'Affiliate Attribution Date';

  function readCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function writeCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    // Set on the eTLD+1 so it's shared across www, app, link, etc.
    var host = location.hostname;
    var parts = host.split('.');
    var domain = parts.length >= 2 ? '.' + parts.slice(-2).join('.') : host;
    document.cookie =
      name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() +
      '; path=/' +
      '; domain=' + domain +
      '; SameSite=Lax';
  }

  function getUrlParam(name) {
    try {
      return new URLSearchParams(location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  // ----- Step 1+2: Capture aff from URL, persist to cookie (first-touch wins) -----
  var fromUrl = getUrlParam(URL_PARAM);
  var existing = readCookie(COOKIE_NAME);
  if (fromUrl && !existing) {
    writeCookie(COOKIE_NAME, fromUrl, ATTRIBUTION_DAYS);
    writeCookie(COOKIE_TS_NAME, new Date().toISOString(), ATTRIBUTION_DAYS);
  }
  var affId = readCookie(COOKIE_NAME);
  var firstTouchIso = readCookie(COOKIE_TS_NAME);
  if (!affId) return; // no attribution — nothing to prefill

  // YYYY-MM-DD slice of the first-touch ISO timestamp (GHL DATE fields)
  var firstTouchDate = (firstTouchIso || new Date().toISOString()).slice(0, 10);

  // ----- Step 3: Prefill GHL forms on the page -----
  // GHL embeds forms either as <iframe src="…/widget/form/…"> OR as inline
  // <div data-form-id="…">. Both honor field-prefill via query params whose
  // key is the field's display name (URL-encoded).
  function appendParam(srcUrl, key, value) {
    try {
      var u = new URL(srcUrl, location.origin);
      if (!u.searchParams.has(key)) u.searchParams.set(key, value);
      return u.toString();
    } catch (e) {
      var sep = srcUrl.indexOf('?') === -1 ? '?' : '&';
      return srcUrl + sep + encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }
  }

  function patchIframes() {
    var iframes = document.querySelectorAll(
      'iframe[src*="leadconnectorhq"], iframe[src*="msgsndr"], iframe[src*="/widget/form/"]'
    );
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      if (iframe.getAttribute('data-dgf-aff-patched') === '1') continue;
      var src = iframe.getAttribute('src') || '';
      if (!src) continue;
      src = appendParam(src, FIELD_AFFILIATE, affId);
      src = appendParam(src, FIELD_DATE,      firstTouchDate);
      iframe.setAttribute('src', src);
      iframe.setAttribute('data-dgf-aff-patched', '1');
    }
  }

  // Patch on initial load AND when forms get injected after the fact
  // (GHL surveys/forms are sometimes lazy-mounted).
  patchIframes();
  if (window.MutationObserver) {
    var obs = new MutationObserver(patchIframes);
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } else {
    setInterval(patchIframes, 1500);
  }
})();
