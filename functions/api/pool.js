import { json, loadJsonAsset, methodNotAllowed } from "../_shared.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const payload = await loadJsonAsset(context, "/data/hot-pool.json");
  return json(payload);
}
