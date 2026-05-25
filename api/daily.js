const { isRealVideoShareUrl, loadFallbackItems, loadHotPool, sendJson } = require("./_shared");

function sortVideoItems(items) {
  return [...items].sort((a, b) => {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff) {
      return scoreDiff;
    }

    const updateDiff = Date.parse(b.updatedAt || b.submittedAt || 0) - Date.parse(a.updatedAt || a.submittedAt || 0);
    if (updateDiff) {
      return updateDiff;
    }

    return String(a.title || "").localeCompare(String(b.title || ""), "zh-CN");
  });
}

module.exports = function dailyHandler(req, res) {
  if (req.method && req.method !== "GET") {
    sendJson(res, { error: "Method not allowed" }, 405);
    return;
  }

  const items = loadFallbackItems();
  const pool = loadHotPool();
  const poolItems = Array.isArray(pool.items) ? pool.items : [];
  const videoItems = sortVideoItems(
    poolItems.filter((item) => isRealVideoShareUrl(item.workUrl)).map((item) => ({
      ...item,
      kind: item.kind || "今日案例"
    }))
  );

  sendJson(res, {
    source: "公开部署版",
    updatedAt: new Date().toISOString(),
    reminderTime: "09:00",
    ai: null,
    items,
    hotItems: videoItems,
    hotCheckedAt: pool.updatedAt || new Date().toISOString()
  });
};
