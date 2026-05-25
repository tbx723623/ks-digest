import { isRealVideoShareUrl, json, loadJsonAsset, methodNotAllowed, sortByHotScore } from "../_shared.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const payload = await loadJsonAsset(context, "/data/hot-pool.json");
  const items = Array.isArray(payload.items) ? payload.items : [];
  const videoItems = sortByHotScore(items.filter((item) => isRealVideoShareUrl(item.workUrl)));

  return json({
    checkedAt: payload.updatedAt || new Date().toISOString(),
    topItems: videoItems
  });
}
