const { loadHotPool, sendJson } = require("./_shared");

module.exports = function poolHandler(req, res) {
  if (req.method && req.method !== "GET") {
    sendJson(res, { error: "Method not allowed" }, 405);
    return;
  }

  const payload = loadHotPool();
  sendJson(res, payload);
};
