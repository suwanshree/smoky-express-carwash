(function () {
  const STORAGE_KEY = "smokyExpressOriginalAttribution";
  const QUERY_KEYS = [
    "src",
    "sub",
    "ref",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];
  const UTM_QUERY_KEYS = QUERY_KEYS.filter((key) => key.startsWith("utm_"));
  const INTERNAL_SUB_VALUES = new Set([
    "nav",
    "site_banner",
    "homepage_banner",
    "location_page",
  ]);
  const INTERNAL_REF_VALUES = new Set([
    "site_nav",
    "homepage_banner",
    "sevierville",
    "ooltewah",
    "chattanooga",
  ]);

  let cachedRecord = null;

  function getNormalizedParam(params, key) {
    return String(params.get(key) || "")
      .trim()
      .toLowerCase();
  }

  function getAttributionParamsFromSearch(search) {
    const sourceParams = new URLSearchParams(search || "");
    const attributionParams = new URLSearchParams();

    QUERY_KEYS.forEach((key) => {
      const value = String(sourceParams.get(key) || "").trim();

      if (value) {
        attributionParams.set(key, value);
      }
    });

    return attributionParams;
  }

  function paramsFromObject(values) {
    const params = new URLSearchParams();

    if (!values || typeof values !== "object") {
      return params;
    }

    QUERY_KEYS.forEach((key) => {
      const value = String(values[key] || "").trim();

      if (value) {
        params.set(key, value);
      }
    });

    return params;
  }

  function objectFromParams(params) {
    const values = {};

    QUERY_KEYS.forEach((key) => {
      const value = String(params.get(key) || "").trim();

      if (value) {
        values[key] = value;
      }
    });

    return values;
  }

  function hasAttributionParams(params) {
    return QUERY_KEYS.some((key) => params.has(key));
  }

  function hasUtmParams(params) {
    return UTM_QUERY_KEYS.some((key) => params.has(key));
  }

  function isInternalOnlyAttribution(params) {
    if (!hasAttributionParams(params) || hasUtmParams(params)) {
      return false;
    }

    return hasInternalPlacementParams(params);
  }

  function hasInternalPlacementParams(params) {
    const src = getNormalizedParam(params, "src");
    const sub = getNormalizedParam(params, "sub");
    const ref = getNormalizedParam(params, "ref");

    if (!src && !sub && ref && INTERNAL_REF_VALUES.has(ref)) {
      return true;
    }

    if (src !== "website") {
      return false;
    }

    if (!sub && !ref) {
      return true;
    }

    return (
      (!sub || INTERNAL_SUB_VALUES.has(sub)) &&
      (!ref || INTERNAL_REF_VALUES.has(ref))
    );
  }

  function getMarketingAttributionParams(params) {
    const marketingParams = new URLSearchParams(params.toString());

    if (
      hasUtmParams(marketingParams) &&
      hasInternalPlacementParams(marketingParams)
    ) {
      marketingParams.delete("src");
      marketingParams.delete("sub");
      marketingParams.delete("ref");
    }

    return marketingParams;
  }

  function getExternalReferrer() {
    const referrer = String(document.referrer || "").trim();

    if (!referrer) {
      return "";
    }

    try {
      const referrerUrl = new URL(referrer);

      if (referrerUrl.origin === window.location.origin) {
        return "";
      }
    } catch (error) {
      return referrer;
    }

    return referrer;
  }

  function sanitizeRecord(record) {
    if (!record || typeof record !== "object") {
      return null;
    }

    const params = getMarketingAttributionParams(paramsFromObject(record.params));
    const referrer = String(record.referrer || "").trim();

    if (
      (hasAttributionParams(params) && isInternalOnlyAttribution(params)) ||
      (!hasAttributionParams(params) && !referrer)
    ) {
      return null;
    }

    return {
      params: objectFromParams(params),
      landingPage:
        String(record.landingPage || "").trim() || window.location.pathname,
      referrer,
      capturedAt: String(record.capturedAt || "").trim(),
    };
  }

  function readStoredRecord() {
    if (cachedRecord) {
      return cachedRecord;
    }

    try {
      cachedRecord = sanitizeRecord(
        JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null"),
      );
    } catch (error) {
      cachedRecord = null;
    }

    return cachedRecord;
  }

  function writeStoredRecord(record) {
    cachedRecord = sanitizeRecord(record);

    if (!cachedRecord) {
      return null;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cachedRecord));
    } catch (error) {
      // Keep the in-memory record for the current page when storage is blocked.
    }

    return cachedRecord;
  }

  function buildRecord(params) {
    return {
      params: objectFromParams(getMarketingAttributionParams(params)),
      landingPage: window.location.pathname,
      referrer: getExternalReferrer(),
      capturedAt: new Date().toISOString(),
    };
  }

  function captureOriginalAttribution() {
    const storedRecord = readStoredRecord();

    if (storedRecord) {
      return storedRecord;
    }

    const currentParams = getAttributionParamsFromSearch(window.location.search);

    if (
      hasAttributionParams(currentParams) &&
      !isInternalOnlyAttribution(currentParams)
    ) {
      return writeStoredRecord(buildRecord(currentParams));
    }

    const externalReferrer = getExternalReferrer();

    if (externalReferrer) {
      return writeStoredRecord({
        params: {},
        landingPage: window.location.pathname,
        referrer: externalReferrer,
        capturedAt: new Date().toISOString(),
      });
    }

    return null;
  }

  function getOriginalAttribution() {
    return captureOriginalAttribution();
  }

  function getOriginalParams() {
    const record = getOriginalAttribution();

    return record ? paramsFromObject(record.params) : new URLSearchParams();
  }

  function getFormFields() {
    const record = getOriginalAttribution();
    const params = record ? paramsFromObject(record.params) : new URLSearchParams();

    return {
      src: params.get("src") || "",
      sub: params.get("sub") || "",
      ref: params.get("ref") || "",
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
      utmContent: params.get("utm_content") || "",
      utmTerm: params.get("utm_term") || "",
      landingPage: record?.landingPage || window.location.pathname,
      referrer: record?.referrer || getExternalReferrer(),
    };
  }

  function clearAttributionParams(url) {
    QUERY_KEYS.forEach((key) => {
      url.searchParams.delete(key);
    });

    return url;
  }

  function applyOriginalToUrl(url) {
    const originalParams = getOriginalParams();

    if (hasAttributionParams(originalParams)) {
      QUERY_KEYS.forEach((key) => {
        if (originalParams.has(key)) {
          url.searchParams.set(key, originalParams.get(key));
        } else {
          url.searchParams.delete(key);
        }
      });

      return url;
    }

    if (isInternalOnlyAttribution(getAttributionParamsFromSearch(url.search))) {
      clearAttributionParams(url);
    }

    return url;
  }

  captureOriginalAttribution();

  window.SmokyAttribution = {
    QUERY_KEYS,
    applyOriginalToUrl,
    getAttributionParamsFromSearch,
    getFormFields,
    getOriginalAttribution,
    getOriginalParams,
    hasAttributionParams,
    isInternalOnlyAttribution,
  };
})();
