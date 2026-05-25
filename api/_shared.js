let fallbackItemsCache = null;
let hotPoolCache = null;

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin"
};

function isRealVideoShareUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return false;
  }

  return /(?:\/f\/|v\.kuaishou\.com\/)/i.test(value);
}

function normalizeLegacyText(value) {
  return String(value || "").replace(/模板|模版/g, "素材");
}

function normalizeFallbackValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeFallbackValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeFallbackValue(entry)])
    );
  }

  if (typeof value === "string") {
    return normalizeLegacyText(value);
  }

  return value;
}

function loadFallbackItems() {
  if (fallbackItemsCache) {
    return fallbackItemsCache;
  }

  fallbackItemsCache = normalizeFallbackValue(require("./fallback-items.json"));
  return fallbackItemsCache;
}

function loadHotPool() {
  if (hotPoolCache) {
    return hotPoolCache;
  }

  hotPoolCache = require("../data/hot-pool.json");
  return hotPoolCache;
}

function applySecurityHeaders(res, extraHeaders = {}) {
  Object.entries({ ...SECURITY_HEADERS, ...extraHeaders }).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      res.setHeader(key, value);
    }
  });
}

function sendJson(res, payload, statusCode = 200, extraHeaders = {}) {
  res.statusCode = statusCode;
  applySecurityHeaders(res, extraHeaders);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload, null, 2));
}

module.exports = {
  applySecurityHeaders,
  isRealVideoShareUrl,
  loadFallbackItems,
  loadHotPool,
  sendJson
};
