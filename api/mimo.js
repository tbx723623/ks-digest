const { Readable } = require("stream");
const { applySecurityHeaders, sendJson } = require("./_shared");

const DEFAULT_MIMO_BASE_URL = "https://api.xiaomimimo.com/v1";
const TOKEN_PLAN_MIMO_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1";
const MAX_REQUEST_BYTES = 128 * 1024;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 6000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_STATE = globalThis.__ksDigestMimoRateLimit || (globalThis.__ksDigestMimoRateLimit = new Map());

function resolveMimoBaseUrl(apiKey) {
  const explicitBaseUrl = String(process.env.MIMO_BASE_URL || "").trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  const normalizedKey = String(apiKey || "").trim().toLowerCase();
  if (normalizedKey.startsWith("tp-")) {
    return TOKEN_PLAN_MIMO_BASE_URL;
  }

  return DEFAULT_MIMO_BASE_URL;
}

function getRequestApiKey(req) {
  const headerApiKey = String(
    req.headers["api-key"] ||
      req.headers["x-mimo-api-key"] ||
      req.headers.authorization ||
      ""
  ).trim();

  if (headerApiKey.toLowerCase().startsWith("bearer ")) {
    return headerApiKey.slice(7).trim();
  }

  return headerApiKey;
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (forwarded) {
    return forwarded;
  }

  return String(req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown").trim() || "unknown";
}

function isAllowedOrigin(req) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin || origin === "null") {
    return true;
  }

  const host = String(req.headers.host || "").trim();
  if (!host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function checkRateLimit(req) {
  const now = Date.now();
  const ip = getClientIp(req);
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

  const remaining = RATE_LIMIT_MAX - bucket.count;
  return {
    allowed: bucket.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, remaining),
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

function readRequestBody(req, maxBytes = MAX_REQUEST_BYTES) {
  if (req && typeof req.body === "object" && req.body !== null) {
    return Promise.resolve(req.body);
  }

  if (typeof req?.body === "string" && req.body.trim()) {
    if (Buffer.byteLength(req.body, "utf8") > maxBytes) {
      return Promise.reject(new Error("Request body too large"));
    }

    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      if (Buffer.byteLength(raw, "utf8") + chunk.length > maxBytes) {
        const error = new Error("Request body too large");
        if (typeof req.destroy === "function") {
          req.destroy(error);
        }
        reject(error);
        return;
      }

      raw += chunk;
    });

    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

module.exports = async function mimoHandler(req, res) {
  if (req.method && req.method !== "POST") {
    sendJson(res, { error: "Method not allowed" }, 405);
    return;
  }

  if (!isAllowedOrigin(req)) {
    sendJson(res, { error: "Forbidden origin" }, 403);
    return;
  }

  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) {
    sendJson(
      res,
      { error: "Too many requests. Please slow down and try again." },
      429,
      { "Retry-After": String(rateLimit.retryAfter || 60) }
    );
    return;
  }

  const apiKey = process.env.MIMO_API_KEY || getRequestApiKey(req);
  if (!apiKey) {
    sendJson(
      res,
      {
        error: "AI not configured. Set MIMO_API_KEY in the server environment or paste a MiMo API key in the panel."
      },
      503
    );
    return;
  }

  const mimoApiUrl = `${resolveMimoBaseUrl(apiKey)}/chat/completions`;
  let payload;
  try {
    payload = sanitizePayload(await readRequestBody(req));
  } catch (error) {
    sendJson(
      res,
      {
        error: `Invalid JSON body: ${error.message || "unknown error"}`
      },
      400
    );
    return;
  }

  try {
    const upstream = await fetch(mimoApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    res.statusCode = upstream.status;
    applySecurityHeaders(res);
    res.setHeader("Cache-Control", "no-store");

    const contentType = upstream.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    } else if (payload && payload.stream) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    }

    if (!upstream.body) {
      const text = await upstream.text();
      res.end(text);
      return;
    }

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    sendJson(
      res,
      {
        error: error.message || "Failed to proxy AI request"
      },
      502
    );
  }
};
