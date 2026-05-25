const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin"
};

const CONTENT_SECURITY_POLICY =
  "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' https: data: blob:; connect-src 'self' https://api.xiaomimimo.com https://token-plan-cn.xiaomimimo.com; script-src 'self'; style-src 'self' 'unsafe-inline';";

const DEFAULT_MIMO_BASE_URL = "https://api.xiaomimimo.com/v1";
const TOKEN_PLAN_MIMO_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1";
const DEFAULT_SHARED_MIMO_API_KEY = "tp-cw93bq1y4lw2unvuviyl3levhesoajhq31wu55hzwzqj297r";
const MAX_REQUEST_BYTES = 128 * 1024;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 6000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 18;
const RATE_LIMIT_STATE = globalThis.__ksDigestMimoRateLimit || (globalThis.__ksDigestMimoRateLimit = new Map());
const JSON_CACHE = globalThis.__ksDigestJsonCache || (globalThis.__ksDigestJsonCache = new Map());

function withSecurityHeaders(headers = {}) {
  const next = new Headers(headers);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => next.set(key, value));
  next.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  return next;
}

function secureResponse(response) {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: withSecurityHeaders(response.headers)
  });
}

function json(payload, status = 200, headers = {}) {
  const responseHeaders = withSecurityHeaders(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: responseHeaders
  });
}

function methodNotAllowed() {
  return json({ error: "Method not allowed" }, 405);
}

function isRealVideoShareUrl(url) {
  const value = String(url || "").trim();
  return Boolean(value && /(?:\/f\/|v\.kuaishou\.com\/)/i.test(value));
}

function normalizeLegacyText(value) {
  return String(value || "").replace(/妯℃澘|妯＄増/g, "素材");
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

async function loadJsonAsset(request, env, pathname, { normalize = false } = {}) {
  const cacheKey = `${pathname}:${normalize ? "normalized" : "raw"}`;
  if (JSON_CACHE.has(cacheKey)) {
    return JSON_CACHE.get(cacheKey);
  }

  const response = await env.ASSETS.fetch(new Request(new URL(pathname, request.url), request));
  if (!response.ok) {
    throw new Error(`Failed to load ${pathname}: ${response.status}`);
  }

  const payload = await response.json();
  const value = normalize ? normalizeFallbackValue(payload) : payload;
  JSON_CACHE.set(cacheKey, value);
  return value;
}

function sortByHotScore(items) {
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

async function handleDaily(request, env) {
  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  const items = await loadJsonAsset(request, env, "/api/fallback-items.json", { normalize: true });
  const pool = await loadJsonAsset(request, env, "/data/hot-pool.json");
  const poolItems = Array.isArray(pool.items) ? pool.items : [];
  const videoItems = sortByHotScore(
    poolItems
      .filter((item) => isRealVideoShareUrl(item.workUrl))
      .map((item) => ({
        ...item,
        kind: item.kind || "今日案例"
      }))
  );

  return json({
    source: "Cloudflare Pages",
    updatedAt: new Date().toISOString(),
    reminderTime: "09:00",
    ai: null,
    items,
    hotItems: videoItems,
    hotCheckedAt: pool.updatedAt || new Date().toISOString()
  });
}

async function handleHot(request, env) {
  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  const payload = await loadJsonAsset(request, env, "/data/hot-pool.json");
  const items = Array.isArray(payload.items) ? payload.items : [];
  const videoItems = sortByHotScore(items.filter((item) => isRealVideoShareUrl(item.workUrl)));

  return json({
    checkedAt: payload.updatedAt || new Date().toISOString(),
    topItems: videoItems
  });
}

async function handlePool(request, env) {
  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  return json(await loadJsonAsset(request, env, "/data/hot-pool.json"));
}

function resolveMimoBaseUrl(apiKey, env = {}) {
  const explicitBaseUrl = String(env.MIMO_BASE_URL || "").trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  return String(apiKey || "").trim().toLowerCase().startsWith("tp-")
    ? TOKEN_PLAN_MIMO_BASE_URL
    : DEFAULT_MIMO_BASE_URL;
}

function getRequestApiKey(request) {
  const headerApiKey = String(
    request.headers.get("api-key") ||
      request.headers.get("x-mimo-api-key") ||
      request.headers.get("authorization") ||
      ""
  ).trim();

  return headerApiKey.toLowerCase().startsWith("bearer ")
    ? headerApiKey.slice(7).trim()
    : headerApiKey;
}

function getClientIp(request) {
  return String(
    request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown"
  ).trim() || "unknown";
}

function isAllowedOrigin(request) {
  const origin = String(request.headers.get("origin") || "").trim();
  if (!origin || origin === "null") {
    return true;
  }

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function checkRateLimit(request) {
  const now = Date.now();
  const ip = getClientIp(request);
  const bucket = RATE_LIMIT_STATE.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  RATE_LIMIT_STATE.set(ip, bucket);

  if (RATE_LIMIT_STATE.size > 1024) {
    for (const [key, value] of RATE_LIMIT_STATE.entries()) {
      if (value.resetAt <= now) {
        RATE_LIMIT_STATE.delete(key);
      }
    }
  }

  return {
    allowed: bucket.count <= RATE_LIMIT_MAX,
    retryAfter: bucket.count <= RATE_LIMIT_MAX ? 0 : Math.ceil((bucket.resetAt - now) / 1000)
  };
}

function sanitizeText(value, limit) {
  const text = String(value == null ? "" : value).trim();
  return !limit || text.length <= limit ? text : text.slice(0, limit);
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || !messages.length) {
    throw new Error("messages must be a non-empty array");
  }

  if (messages.length > MAX_MESSAGES) {
    throw new Error(`messages cannot exceed ${MAX_MESSAGES} entries`);
  }

  const allowedRoles = new Set(["system", "user", "assistant", "tool"]);

  return messages.map((message, index) => {
    if (!message || typeof message !== "object") {
      throw new Error(`messages[${index}] must be an object`);
    }

    const role = sanitizeText(message.role, 16).toLowerCase();
    if (!allowedRoles.has(role)) {
      throw new Error(`messages[${index}].role is invalid`);
    }

    let content = message.content;
    if (Array.isArray(content) || (content && typeof content === "object")) {
      content = JSON.stringify(content);
    }

    const text = sanitizeText(content, MAX_MESSAGE_CHARS);
    if (!text) {
      throw new Error(`messages[${index}].content is empty`);
    }

    return { role, content: text };
  });
}

function sanitizePayload(payload) {
  const body = payload && typeof payload === "object" ? payload : {};
  const model = sanitizeText(body.model || "mimo-v2.5-pro", 128);
  const clean = {
    model: model || "mimo-v2.5-pro",
    messages: normalizeMessages(body.messages),
    stream: Boolean(body.stream)
  };

  if (body.temperature !== undefined) {
    const temperature = Number(body.temperature);
    if (Number.isFinite(temperature)) {
      clean.temperature = Math.max(0, Math.min(2, temperature));
    }
  }

  const maxTokens = Number(body.max_completion_tokens ?? body.max_tokens);
  if (Number.isFinite(maxTokens)) {
    clean.max_completion_tokens = Math.max(1, Math.min(8192, Math.trunc(maxTokens)));
  }

  return clean;
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new Error("Request body too large");
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_REQUEST_BYTES) {
    throw new Error("Request body too large");
  }

  return raw.trim() ? JSON.parse(raw) : {};
}

async function handleMimo(request, env) {
  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  if (!isAllowedOrigin(request)) {
    return json({ error: "Forbidden origin" }, 403);
  }

  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return json(
      { error: "Too many requests. Please slow down and try again." },
      429,
      { "Retry-After": String(rateLimit.retryAfter || 60) }
    );
  }

  const apiKey = getRequestApiKey(request) || env.MIMO_API_KEY || DEFAULT_SHARED_MIMO_API_KEY;
  if (!apiKey) {
    return json(
      {
        error: "AI not configured. Set MIMO_API_KEY in Cloudflare Pages variables or paste a MiMo API key in the panel."
      },
      503
    );
  }

  let payload;
  try {
    payload = sanitizePayload(await readJsonBody(request));
  } catch (error) {
    return json(
      {
        error: `Invalid JSON body: ${error.message || "unknown error"}`
      },
      400
    );
  }

  try {
    const upstream = await fetch(`${resolveMimoBaseUrl(apiKey, env)}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseHeaders = withSecurityHeaders();
    responseHeaders.set("Cache-Control", "no-store");
    responseHeaders.set(
      "Content-Type",
      upstream.headers.get("content-type") ||
        (payload.stream ? "text/event-stream; charset=utf-8" : "application/json; charset=utf-8")
    );

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch (error) {
    return json(
      {
        error: error.message || "Failed to proxy AI request"
      },
      502
    );
  }
}

async function serveAsset(request, env) {
  const response = await env.ASSETS.fetch(request);
  if (response.status !== 404) {
    return secureResponse(response);
  }

  if (request.method === "GET" && String(request.headers.get("accept") || "").includes("text/html")) {
    const indexResponse = await env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    return secureResponse(indexResponse);
  }

  return secureResponse(response);
}

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname.replace(/\/+$/, "") || "/";

    try {
      if (pathname === "/api/daily") {
        return handleDaily(request, env);
      }

      if (pathname === "/api/hot") {
        return handleHot(request, env);
      }

      if (pathname === "/api/pool") {
        return handlePool(request, env);
      }

      if (pathname === "/api/mimo") {
        return handleMimo(request, env);
      }

      return serveAsset(request, env);
    } catch (error) {
      return json(
        {
          error: error.message || "Internal server error"
        },
        500
      );
    }
  }
};

