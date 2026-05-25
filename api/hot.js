const { isRealVideoShareUrl, loadHotPool, sendJson } = require("./_shared");

function sortHotItems(items) {
  return [...items].sort((a, b) => {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff) {
      return scoreDiff;
    }

    const playDiff = (Number(b.playCount) || 0) - (Number(a.playCount) || 0);
    if (playDiff) {
      return playDiff;
    }

    const updateDiff = Date.parse(b.updatedAt || b.submittedAt || 0) - Date.parse(a.updatedAt || a.submittedAt || 0);
    if (updateDiff) {
      return updateDiff;
    }

    return String(a.title || "").localeCompare(String(b.title || ""), "zh-CN");
  });
}

module.exports = function hotHandler(req, res) {
  if (req.method && req.method !== "GET") {
    sendJson(res, { error: "Method not allowed" }, 405);
    return;
  }

  const payload = loadHotPool();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const videoItems = sortHotItems(
    items.filter((item) => isRealVideoShareUrl(item.workUrl))
  );

  sendJson(res, {
    checkedAt: payload.updatedAt || new Date().toISOString(),
    topItems: videoItems
  });
};
