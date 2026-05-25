export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin"
};

const jsonCache = new Map();

export function isRealVideoShareUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return false;
  }

  return /(?:\/f\/|v\.kuaishou\.com\/)/i.test(value);
}

function normalizeLegacyText(value) {
  return String(value || "").replace(/妯℃澘|妯＄増/g, "素材");
}

export function normalizeFallbackValue(value) {
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

export function withSecurityHeaders(headers = {}) {
  const next = new Headers(headers);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    next.set(key, value);
  });
  return next;
}

export function json(payload, status = 200, headers = {}) {
  const responseHeaders = withSecurityHeaders(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: responseHeaders
  });
}

export function methodNotAllowed() {
  return json({ error: "Method not allowed" }, 405);
}

export async function loadJsonAsset(context, pathname, { normalize = false } = {}) {
  const cacheKey = `${pathname}:${normalize ? "normalized" : "raw"}`;
  if (jsonCache.has(cacheKey)) {
    return jsonCache.get(cacheKey);
  }

  const assetUrl = new URL(pathname, context.request.url);
  const response = await context.env.ASSETS.fetch(assetUrl);

  if (!response.ok) {
    throw new Error(`Failed to load ${pathname}: ${response.status}`);
  }

  const payload = await response.json();
  const value = normalize ? normalizeFallbackValue(payload) : payload;
  jsonCache.set(cacheKey, value);
  return value;
}

export function sortByHotScore(items) {
  return [...items].sort((a, b) => {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff) {
      return scoreDiff;
    }

    const playDiff = (Number(b.playCount) || 0) - (Number(a.playCount) || 0);
    if (playDiff) {
      return playDiff;
    }

    const updateDiff =
      Date.parse(b.updatedAt || b.submittedAt || 0) -
      Date.parse(a.updatedAt || a.submittedAt || 0);
    if (updateDiff) {
      return updateDiff;
    }

    return String(a.title || "").localeCompare(String(b.title || ""), "zh-CN");
  });
}

