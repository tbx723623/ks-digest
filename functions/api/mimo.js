import { json, methodNotAllowed, withSecurityHeaders } from "../_shared.js";

const DEFAULT_MIMO_BASE_URL = "https://api.xiaomimimo.com/v1";
const TOKEN_PLAN_MIMO_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1";
const DEFAULT_SHARED_MIMO_API_KEY = "tp-cw93bq1y4lw2unvuviyl3levhesoajhq31wu55hzwzqj297r";
const MAX_REQUEST_BYTES = 128 * 1024;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 6000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 18;
const RATE_LIMIT_STATE = globalThis.__ksDigestMimoRateLimit || (globalThis.__ksDigestMimoRateLimit = new Map());

function resolveMimoBaseUrl(apiKey, env = {}) {
  const explicitBaseUrl = String(env.MIMO_BASE_URL || "").trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  const normalizedKey = String(apiKey || "").trim().toLowerCase();
  if (normalizedKey.startsWith("tp-")) {
    return TOKEN_PLAN_MIMO_BASE_URL;
  }

  return DEFAULT_MIMO_BASE_URL;
}

function getRequestApiKey(request) {
  const headerApiKey = String(
    request.headers.get("api-key") ||
      request.headers.get("x-mimo-api-key") ||
      request.headers.get("authorization") ||
      ""
  ).trim();

  if (headerApiKey.toLowerCase().startsWith("bearer ")) {
    return headerApiKey.slice(7).trim();
  }

  return headerApiKey;
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
  if (!limit || text.length <= limit) {
    return text;
  }

  return text.slice(0, limit);
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

  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const { request, env } = context;

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
