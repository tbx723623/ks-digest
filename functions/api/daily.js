import { isRealVideoShareUrl, json, loadJsonAsset, methodNotAllowed, sortByHotScore } from "../_shared.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const items = await loadJsonAsset(context, "/api/fallback-items.json", { normalize: true });
  const pool = await loadJsonAsset(context, "/data/hot-pool.json");
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
