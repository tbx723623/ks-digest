const STORAGE_KEY = "ksDigestReminder";
const ACTIVATION_STORAGE_KEY = "ksDigestActivated";
const PERMANENT_ACTIVATION_CODE = "KSDIGEST2026";
const TEMP_ACTIVATION_CODE = "KSDIGEST48H";
const TEMP_ACTIVATION_DURATION_MS = 2 * 24 * 60 * 60 * 1000;
const TEMP_ACTIVATION_LOCK_KEY = "ksDigestTempExpired";
const VALID_ACTIVATION_CODES = [PERMANENT_ACTIVATION_CODE, TEMP_ACTIVATION_CODE];
const ACTIVATION_PARAM = "code";
const DEFAULT_DATA_ENDPOINT =
  window.location.protocol === "file:"
    ? "./data/daily.json"
    : "./api/daily";
const DATA_ENDPOINT = new URLSearchParams(window.location.search).get("api") || DEFAULT_DATA_ENDPOINT;
const DEFAULT_HOT_ENDPOINT =
  window.location.protocol === "file:"
    ? "./data/daily.json"
    : "./api/hot";
const HOT_ENDPOINT = new URLSearchParams(window.location.search).get("hotApi") || DEFAULT_HOT_ENDPOINT;
const DEFAULT_POOL_ENDPOINT =
  window.location.protocol === "file:"
    ? "./data/hot-pool.json"
    : "./api/pool";
const POOL_ENDPOINT = new URLSearchParams(window.location.search).get("poolApi") || DEFAULT_POOL_ENDPOINT;
const EXPLOSIVE_ENDPOINT = "./data/explosive.json"; // 真实爆款数据
const POOL_DRAFT_STORAGE_KEY = "ksHotPoolDraft";
const WALLPAPER_STORAGE_KEY = "ksWallpaperUrl";
const FEED_CACHE_KEY = "ksFeedCacheV1";
const HOT_CACHE_KEY = "ksHotCacheV1";
const THEME_SCHEME_STORAGE_KEY = "ksThemeScheme";
const THEME_ACCENT_STORAGE_KEY = "ksThemeAccent";
const THEME_ACCENTS = ["amber", "mint", "coral", "sky", "forest"];
const THEME_META_COLORS = {
  dark: {
    amber: "#0f1420",
    mint: "#08151c",
    coral: "#17101a",
    sky: "#0a1420",
    forest: "#09151a"
  },
  light: {
    amber: "#f7efe1",
    mint: "#edf9f4",
    coral: "#fff0ec",
    sky: "#eef5ff",
    forest: "#eef6eb"
  }
};
const THEME_ACCENT_LABELS = {
  amber: "琥珀",
  mint: "薄荷",
  coral: "珊瑚",
  sky: "晴空",
  forest: "森绿"
};
const CAN_WRITE_POOL = true;
const POOL_LOCAL_KEY = "ksPoolLocal";
const MIMO_API_KEY_STORAGE_KEY = "ksMimoApiKey";
const MIMO_API_URL = "https://token-plan-cn.xiaomimimo.com/v1/chat/completions";
const MIMO_MODEL = "mimo-v2.5-pro";
const WORK_URLS = {
  1: "https://v.kuaishou.com/nj5Gq2bt",
  2: "https://v.kuaishou.com/JS8HQcHT",
  3: "",
  4: "",
  5: ""
};

const WALLPAPER_PRESETS = [
  { label: "大草原天空", url: "https://haowallpaper.com/link//common/file/getCroppingImg/18347150586858880" },
  { label: "沙发美人", url: "https://haowallpaper.com/link//common/file/getCroppingImg/18601605145677184" },
  { label: "独行野花", url: "https://haowallpaper.com/link//common/file/getCroppingImg/18834482406280576" },
  { label: "NASA地球", url: "https://haowallpaper.com/link//common/file/getCroppingImg/18772863517904256" },
  { label: "爱我中华", url: "https://haowallpaper.com/link//common/file/getCroppingImg/15789130517090624" },
  { label: "棕榈黄昏", url: "https://haowallpaper.com/link//common/file/getCroppingImg/18193731367128448" },
  { label: "夏天森林", url: "https://haowallpaper.com/link//common/file/getCroppingImg/17639916700028288" },
  { label: "海棠帆船", url: "https://haowallpaper.com/link//common/file/getCroppingImg/18970539430890880" },
  { label: "星空银河", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000001" },
  { label: "日落海滩", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000002" },
  { label: "雪山极光", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000003" },
  { label: "城市夜景", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000004" },
  { label: "樱花大道", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000005" },
  { label: "海底世界", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000006" },
  { label: "薰衣草田", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000007" },
  { label: "极简几何", url: "https://haowallpaper.com/link//common/file/getCroppingImg/19000000000000008" }
];

function getStoredMimoApiKey() {
  try {
    return localStorage.getItem(MIMO_API_KEY_STORAGE_KEY) || "tp-cw93bq1y4lw2unvuviyl3levhesoajhq31wu55hzwzqj297r";
  } catch {
    return "tp-cw93bq1y4lw2unvuviyl3levhesoajhq31wu55hzwzqj297r";
  }
}

function saveMimoApiKey(value) {
  try {
    const nextValue = String(value || "").trim();
    if (nextValue) {
      localStorage.setItem(MIMO_API_KEY_STORAGE_KEY, nextValue);
    } else {
      localStorage.removeItem(MIMO_API_KEY_STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable in some preview contexts
  }
}

function getStoredWallpaperUrl() {
  try {
    return localStorage.getItem(WALLPAPER_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveWallpaperUrl(value) {
  try {
    const nextValue = String(value || "").trim();
    if (nextValue) {
      localStorage.setItem(WALLPAPER_STORAGE_KEY, nextValue);
    } else {
      localStorage.removeItem(WALLPAPER_STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable in some preview contexts
  }
}

function readJsonCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJsonCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable in some preview contexts
  }
}

function buildMimoHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };
  const apiKey = getStoredMimoApiKey();

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return headers;
}

function buildRefreshToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function promptForMimoApiKey() {
  const current = getStoredMimoApiKey();
  const next = window.prompt("可选：粘贴自己的 MiMo API Key 覆盖公共配置（留空可清除）", current);

  if (next === null) {
    return false;
  }

  const trimmed = next.trim();
  saveMimoApiKey(trimmed);
  showToast(trimmed ? "MiMo API Key 已保存" : "MiMo API Key 已清除");
  return Boolean(trimmed);
}

function summarizeMimoItems(items, limit = 6) {
  return (Array.isArray(items) ? items : [])
    .slice(0, limit)
    .map((item, index) => {
      const category = Array.isArray(item.category)
        ? item.category.filter(Boolean).slice(0, 3).map(polishContentText).join("/")
        : "";
      const angle = polishContentText(String(item.angle || "").trim().replace(/\s+/g, " ")).slice(0, 80);
      const shareCount = Number(item.shareCount) || 0;
      const likeCount = Number(item.likeCount) || 0;
      const parts = [
        `${index + 1}. ${polishContentText(item.title || "未命名")}`,
        item.play ? `热度 ${polishContentText(item.play)}` : null,
        shareCount ? `分享 ${formatHotCount(shareCount)}` : null,
        likeCount ? `点赞 ${formatHotCount(likeCount)}` : null,
        category ? `分类 ${category}` : null,
        angle ? `角度 ${angle}` : null
      ].filter(Boolean);

      return parts.join(" | ");
    })
    .join("\n");
}

function buildMimoContext(task = "chat") {
  const visibleItems = getFilteredItems();
  const hotItems = getVisibleHotItems();
  const visibleCases = visibleItems.filter((item) => item.kind === "今日案例").length;
  const visibleMaterials = visibleItems.filter((item) => item.kind === "素材").length;
  const localHotCount = Array.isArray(state.localHotItems)
    ? state.localHotItems.filter((item) => isRealVideoShareUrl(item.workUrl)).length
    : 0;
  const digest = state.dailyDigest
    ? [state.dailyDigest.dailyTitle, state.dailyDigest.dailySummary].filter(Boolean).join(" / ")
    : "";

  return [
    `当前筛选：${getCategoryLabel()}${state.query ? ` ｜ 关键词：${state.query}` : ""}`,
    "目标偏好：解压为主，爆款素材优先，标签要多，题材要全，热榜和虐文优先。",
    `当前素材：${visibleItems.length} 条（解压素材 ${visibleCases} 条，爆款素材 ${visibleMaterials} 条）。`,
    `热榜情况：实时热榜 ${state.hotItems.length} 条，素材补充 ${localHotCount} 条，号池 ${state.poolItems.length} 条，当前可见热榜 ${hotItems.length} 条。`,
    digest ? `今日摘要：${polishContentText(digest)}` : null,
    visibleItems.length ? `当前前排素材：\n${summarizeMimoItems(visibleItems, 6)}` : null,
    hotItems.length ? `当前热榜前排：\n${summarizeMimoItems(hotItems, 8)}` : null,
    task === "refresh"
      ? "任务：请输出 JSON 数组，至少 30 条今天的实时爆款候选，越多越好，但必须保持高质量和不重复。每条尽量包含 title、category、play、playCount、likeCount、shareCount、angle、format、note、workUrl、predictionReason。请按三层输出思路筛选：先给 10 条最强实时爆款，再给 10 到 15 条同题材补充，再给 5 到 10 条备用候选。优先快手解压推文、小说推文、虐文、重生、穿越、豪门、甜宠、复仇、系统、年代、古言、职场、校园、娱乐圈、美食、军婚、商战等当前最热题材，号池只做补充，不要和当前列表重复。"
      : task === "search"
        ? "任务：请输出 JSON 数组，优先返回最新快手爆款、解压素材、小说素材，尽量补充可直接打开的作品链接、playCount、likeCount、shareCount 和 predictionReason，并避免和当前列表重复。请尽量多给不同标签的素材，不要只给少量。"
        : "任务：请优先给可执行建议，包括选题、标题、开头钩子、镜头节奏、封面字、发布建议和下一步优化方向。如果不确定，请明确说不确定并给出需要补充的数据，不要空话。"
  ]
    .filter(Boolean)
    .join("\n\n");
}

const fallbackItems = [
  // ==================== 今日案例 ====================
  {
    id: 1, kind: "今日案例", category: ["解压推文", "穿越", "年代"],
    title: "穿越后，我看着数钱的爹，购物的娘，以及小黄鱼堆成山的家，笑不出来，根本笑不出来。",
    play: "5,241 次", angle: "强反差开局，适合第一屏就把人钩住。",
    format: "AI灵境计划 / 长图文 / 剧情推进", tags: ["AI灵境计划", "快成长计划", "影画演绎未来之星"],
    note: "典型的解压型小说推文开头，钩子先行，画面感要强。"
  },
  {
    id: 2, kind: "今日案例", category: ["解压推文", "逆袭", "爽文"],
    title: "被全家嫌弃的废物女婿，今天拿出了一张黑卡，全场安静了。",
    play: "3.2 万次", angle: "废物逆袭 + 打脸，解压推文经典套路。",
    format: "封面大字 / 反差叙事 / 爽点密集", tags: ["逆袭", "打脸", "爽文", "解压"],
    note: "解压推文核心公式：先被看不起，再啪啪打脸。"
  },
  {
    id: 3, kind: "今日案例", category: ["解压推文", "重生", "致富"],
    title: "重生回到九零年，我靠一个地摊翻身了。",
    play: "1.8 万次", angle: "年代重生 + 致富，解压感拉满。",
    format: "年代感封面 / 捡漏致富 / 细节堆爽", tags: ["重生", "年代", "致富", "解压"],
    note: "重生致富类解压推文，年代感要足，爽点要密集。"
  },
  {
    id: 4, kind: "今日案例", category: ["解压推文", "打脸", "豪门"],
    title: "订婚宴上被当众羞辱，我掏出手机打了个电话，全场安静了。",
    play: "2.5 万次", angle: "当众受辱 + 一个电话反转，解压感极强。",
    format: "强冲突开头 / 一句话反转 / 打脸收尾", tags: ["打脸", "豪门", "解压", "爽文"],
    note: "适合做成一句话让全场沉默的爆点型推文。"
  },
  {
    id: 5, kind: "今日案例", category: ["解压推文", "萌宝", "甜宠"],
    title: "三岁萌宝指着总裁说：这是我爸爸。",
    play: "4.1 万次", angle: "萌宝认亲 + 总裁震惊，甜宠解压经典。",
    format: "萌娃封面 / 误会递进 / 甜蜜收尾", tags: ["萌宝", "甜宠", "轻松", "解压"],
    note: "萌宝类解压推文，画面要可爱，节奏要轻快。"
  },
  {
    id: 6, kind: "今日案例", category: ["解压推文", "系统", "签到"],
    title: "绑定签到系统后，我每天签到都能领到一个亿。",
    play: "2.8 万次", angle: "签到系统 + 每日暴富，解压感持续输出。",
    format: "系统面板封面 / 签到递进 / 暴富累积", tags: ["系统", "签到", "暴富", "解压"],
    note: "系统流解压推文，每日签到=每日爽点，适合连载。"
  },
  {
    id: 7, kind: "今日案例", category: ["解压推文", "打脸", "职场"],
    title: "被开除当天，老板发现整个公司的客户都是我带来的。",
    play: "4.5 万次", angle: "职场被开 + 客户揭秘，打脸解压经典。",
    format: "职场场景 / 开除铺垫 / 客户反转", tags: ["打脸", "职场", "客户", "解压"],
    note: "职场打脸类解压推文，打工人最爱看的反转。"
  },
  {
    id: 8, kind: "今日案例", category: ["解压推文", "穿越", "空间"],
    title: "穿越到古代，我随身带着一个超市。",
    play: "6.1 万次", angle: "穿越空间 + 超市物资，降维打击解压。",
    format: "古代场景 / 超市空间 / 物资碾压", tags: ["穿越", "空间", "超市", "解压"],
    note: "空间流穿越解压推文，现代物资碾压古代。"
  },
  {
    id: 9, kind: "今日案例", category: ["解压推文", "复仇", "重生"],
    title: "重生回到被害前一天，这次我先下手为强。",
    play: "3.7 万次", angle: "重生复仇 + 先发制人，复仇解压。",
    format: "重生场景 / 被害记忆 / 先手复仇", tags: ["复仇", "重生", "先手", "解压"],
    note: "重生复仇类解压推文，知道未来就是最大金手指。"
  },
  {
    id: 10, kind: "今日案例", category: ["解压推文", "甜宠", "豪门"],
    title: "假结婚后，冷面总裁竟然对我上了心。",
    play: "5.3 万次", angle: "假结婚 + 总裁心动，甜宠解压。",
    format: "豪门场景 / 假结婚设定 / 总裁沦陷", tags: ["甜宠", "豪门", "假结婚", "解压"],
    note: "甜宠豪门类解压推文，女性用户高互动。"
  },

  // ==================== 打脸逆袭类 ====================
  { id: 101, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "被退婚后，我反手掏出十亿聘礼，前女友跪着求复合。",
    play: "素材", angle: "退婚 + 暴富打脸，经典解压套路。",
    format: "强冲突封面 / 反差叙事 / 打脸收尾", tags: ["打脸", "退婚", "暴富"],
    note: "退婚类解压推文，先被羞辱再亮底牌。" },
  { id: 102, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "公司年会上，保洁阿姨亮出了自己的工牌：董事长。",
    play: "素材", angle: "身份反转 + 打脸，解压推文万能素材。",
    format: "身份悬念 / 层层铺垫 / 一句话炸场", tags: ["打脸", "身份反转", "都市"],
    note: "万能解压素材：被看不起的人其实最厉害。" },
  { id: 103, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "被赶出家族后，我用三年建了一个商业帝国。",
    play: "素材", angle: "被抛弃 + 逆袭回归，解压感爆棚。",
    format: "三年前后对比 / 实力碾压 / 打脸全家", tags: ["打脸", "逆袭", "复仇"],
    note: "经典解压公式：当年你赶我走，今天你求我回。" },
  { id: 104, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "婚礼上被前男友嘲笑嫁得差，我老公的车队来了。",
    play: "素材", angle: "婚礼打脸 + 豪车队反转，画面感极强。",
    format: "婚礼场景 / 嘲讽铺垫 / 豪车炸场", tags: ["打脸", "婚礼", "豪门"],
    note: "婚礼打脸类，适合做封面大字+豪车画面。" },
  { id: 105, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "同学聚会上被嘲笑开破车，我掏出车钥匙，全场沉默。",
    play: "素材", angle: "同学聚会 + 车钥匙反转，解压经典场景。",
    format: "聚会场景 / 嘲讽铺垫 / 车钥匙亮底牌", tags: ["打脸", "同学聚会", "豪车"],
    note: "同学聚会打脸，适合做短视频化推文。" },
  { id: 106, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "被岳母看不起三年，今天她看到我的公司大楼，跪了。",
    play: "素材", angle: "岳母嫌弃 + 事业反转，家庭向解压。",
    format: "家庭冲突 / 事业逆袭 / 打脸收尾", tags: ["打脸", "家庭", "事业"],
    note: "家庭向打脸推文，适合已婚群体共鸣。" },
  { id: 107, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "全班最穷的学生，二十年后买下了整栋教学楼。",
    play: "素材", angle: "同学对比 + 逆袭买楼，时间跨度大。",
    format: "回忆开头 / 对比叙事 / 买楼反转", tags: ["打脸", "同学", "逆袭"],
    note: "时间跨度型打脸，适合做前后对比。" },
  { id: 108, kind: "素材", category: ["解压推文", "打脸", "逆袭"],
    title: "被退货的相亲对象，其实是隐藏的亿万富翁。",
    play: "素材", angle: "相亲被拒 + 身份揭秘，反差极大。",
    format: "相亲场景 / 退货铺垫 / 身份反转", tags: ["打脸", "相亲", "身份反转"],
    note: "相亲类解压推文，适合都市情感向。" },

  // ==================== 重生致富类 ====================
  { id: 201, kind: "素材", category: ["解压推文", "重生", "致富"],
    title: "重生回到分家那天，我把全家都送上了富贵路。",
    play: "素材", angle: "先冲突，再反转，再给爽点。",
    format: "封面大字 + 反差叙事", tags: ["爽点强", "适合开篇三秒抓人"],
    note: "适合做成重生逆袭方向的推文素材。" },
  { id: 202, kind: "素材", category: ["解压推文", "重生", "致富"],
    title: "重生后我承包了整座山，十年后成了村里的首富。",
    play: "素材", angle: "重生 + 承包致富，农村向解压。",
    format: "农村场景 / 承包铺垫 / 致富反转", tags: ["重生", "农村", "致富"],
    note: "农村致富类解压推文，适合下沉市场。" },
  { id: 203, kind: "素材", category: ["解压推文", "重生", "致富"],
    title: "重生回到高考前，这次我考上了清华。",
    play: "素材", angle: "重生逆袭学业，高考爽文。",
    format: "高考场景 / 重生逆袭 / 名校录取", tags: ["重生", "高考", "逆袭"],
    note: "高考类解压推文，适合学生群体。" },
  { id: 204, kind: "素材", category: ["解压推文", "重生", "致富"],
    title: "重生后我提前买了比特币，现在身价百亿。",
    play: "素材", angle: "重生 + 投资先知，现代致富。",
    format: "现代场景 / 投资布局 / 百亿身价", tags: ["重生", "投资", "现代"],
    note: "现代投资类解压推文，年轻人爱看。" },
  { id: 205, kind: "素材", category: ["解压推文", "重生", "致富"],
    title: "重生回到离婚前一天，这次我选择了净身出户。",
    play: "素材", angle: "重生离婚 + 反转，情感向解压。",
    format: "离婚场景 / 重生选择 / 反转收尾", tags: ["重生", "离婚", "情感"],
    note: "情感向重生推文，适合女性用户。" },
  { id: 206, kind: "素材", category: ["解压推文", "重生", "致富"],
    title: "重生后我成了全城最大的房东，每天收租收到手软。",
    play: "素材", angle: "重生买房 + 收租致富，躺赢解压。",
    format: "买房场景 / 重生布局 / 收租躺赢", tags: ["重生", "房产", "躺赢"],
    note: "收租类解压推文，适合房产话题。" },

  // ==================== 穿越类 ====================
  { id: 301, kind: "素材", category: ["解压推文", "穿越", "年代"],
    title: "穿越到八十年代，我家院子里全是能换钱的好东西。",
    play: "素材", angle: "年代文天然有捡漏和致富的爽点。",
    format: "年代 / 家长里短 / 细节堆爽", tags: ["年代文", "轻松向", "适合连载"],
    note: "适合做成家里突然有钱的轻松流。" },
  { id: 302, kind: "素材", category: ["解压推文", "穿越", "古代"],
    title: "穿越成被休的弃妇，我靠现代知识成了首富。",
    play: "素材", angle: "穿越弃妇 + 现代知识碾压，古言解压。",
    format: "古代场景 / 弃妇开局 / 知识碾压", tags: ["穿越", "古言", "致富"],
    note: "穿越古言类解压推文，女性用户爱看。" },
  { id: 303, kind: "素材", category: ["解压推文", "穿越", "古代"],
    title: "穿越成炮灰女配，我抢了女主的金手指。",
    play: "素材", angle: "穿越炮灰 + 抢金手指，爽文解压。",
    format: "穿书场景 / 炮灰开局 / 金手指反转", tags: ["穿越", "炮灰", "金手指"],
    note: "穿书类解压推文，适合爱看网文的用户。" },
  { id: 304, kind: "素材", category: ["解压推文", "穿越", "年代"],
    title: "穿越到饥荒年代，我带了一个超市。",
    play: "素材", angle: "穿越饥荒 + 超市物资，生存解压。",
    format: "饥荒场景 / 超市物资 / 生存逆袭", tags: ["穿越", "饥荒", "物资"],
    note: "穿越物资类解压推文，生存向爽文。" },
  { id: 305, kind: "素材", category: ["解压推文", "穿越", "古代"],
    title: "穿成恶毒继母，我把继子养成了皇帝。",
    play: "素材", angle: "穿越继母 + 养成皇帝，养成解压。",
    format: "继母开局 / 养成过程 / 皇帝反转", tags: ["穿越", "继母", "养成"],
    note: "养成类穿越解压推文，适合长线连载。" },
  { id: 306, kind: "素材", category: ["解压推文", "穿越", "年代"],
    title: "穿越到七零年代，嫁了个糙汉老公，没想到他是未来首富。",
    play: "素材", angle: "穿越嫁糙汉 + 身份揭秘，甜宠解压。",
    format: "七零场景 / 嫁糙汉 / 身份反转", tags: ["穿越", "七零", "甜宠"],
    note: "年代甜宠类解压推文，女性用户最爱。" },

  // ==================== 豪门类 ====================
  { id: 401, kind: "素材", category: ["解压推文", "豪门", "身份反转"],
    title: "嫁入豪门后才发现，老公就是当年救我的小男孩。",
    play: "素材", angle: "豪门婚姻 + 救命恩人揭秘，甜虐解压。",
    format: "豪门场景 / 婚姻铺垫 / 身份揭秘", tags: ["豪门", "身份反转", "甜虐"],
    note: "豪门身份揭秘类，适合做悬念推文。" },
  { id: 402, kind: "素材", category: ["解压推文", "豪门", "豪门争产"],
    title: "豪门老爷子去世，遗嘱上写的名字让全家震惊。",
    play: "素材", angle: "豪门争产 + 遗嘱反转，家族解压。",
    format: "豪门场景 / 争产铺垫 / 遗嘱反转", tags: ["豪门", "争产", "家族"],
    note: "豪门争产类解压推文，适合家族向。" },
  { id: 403, kind: "素材", category: ["解压推文", "豪门", "假千金"],
    title: "养了十八年的千金是假的，真千金在乡下种地。",
    play: "素材", angle: "真假千金 + 身份互换，经典解压。",
    format: "豪门场景 / 假千金铺垫 / 真千金反转", tags: ["豪门", "真假千金", "身份"],
    note: "真假千金类解压推文，经典永不过时。" },
  { id: 404, kind: "素材", category: ["解压推文", "豪门", "豪门弃妇"],
    title: "被豪门抛弃的妻子，其实是隐世家族的继承人。",
    play: "素材", angle: "豪门弃妇 + 隐世家族反转，双重身份。",
    format: "抛弃场景 / 弃妇铺垫 / 隐世身份揭秘", tags: ["豪门", "弃妇", "隐世家族"],
    note: "双重身份类解压推文，反转感极强。" },
  { id: 405, kind: "素材", category: ["解压推文", "豪门", "豪门继承"],
    title: "在豪门当了十年保姆，老爷子把遗产全留给了我。",
    play: "素材", angle: "保姆逆袭 + 遗产继承，底层逆袭。",
    format: "保姆场景 / 十年铺垫 / 遗产反转", tags: ["豪门", "保姆", "遗产"],
    note: "底层逆袭类解压推文，适合普通人共鸣。" },

  // ==================== 甜宠萌宝类 ====================
  { id: 501, kind: "素材", category: ["解压推文", "甜宠", "先婚后爱"],
    title: "闪婚后才知道，老公是全城最有钱的人。",
    play: "素材", angle: "先婚后爱 + 身份揭秘，甜宠解压。",
    format: "甜蜜误会 / 身份反转 / 撒糖收尾", tags: ["甜宠", "先婚后爱", "轻松"],
    note: "甜宠类解压推文，误会要甜，揭秘要爽。" },
  { id: 502, kind: "素材", category: ["解压推文", "甜宠", "契约婚姻"],
    title: "签了一年契约婚姻，到期后他死活不肯离婚。",
    play: "素材", angle: "契约婚姻 + 假戏真做，甜宠经典。",
    format: "契约场景 / 假戏铺垫 / 真做反转", tags: ["甜宠", "契约", "假戏真做"],
    note: "契约婚姻类解压推文，适合甜宠向。" },
  { id: 503, kind: "素材", category: ["解压推文", "萌宝", "认亲"],
    title: "五岁萌宝在网上发了条视频，全城首富来认儿子了。",
    play: "素材", angle: "萌宝发视频 + 富豪认亲，萌系解压。",
    format: "萌娃视频 / 认亲铺垫 / 富豪揭秘", tags: ["萌宝", "认亲", "富豪"],
    note: "萌宝认亲类解压推文，萌+爽双buff。" },
  { id: 504, kind: "素材", category: ["解压推文", "萌宝", "天才宝宝"],
    title: "四岁天才宝宝黑进了公司系统，CEO老爸惊呆了。",
    play: "素材", angle: "天才萌宝 + 黑客技能，反差萌解压。",
    format: "天才场景 / 黑客技能 / 老爸震惊", tags: ["萌宝", "天才", "黑客"],
    note: "天才萌宝类解压推文，适合科技向。" },
  { id: 505, kind: "素材", category: ["解压推文", "甜宠", "暗恋"],
    title: "暗恋他十年，没想到他的日记里全是我。",
    play: "素材", angle: "暗恋揭秘 + 双向暗恋，甜蜜解压。",
    format: "暗恋铺垫 / 日记揭秘 / 双向暗恋", tags: ["甜宠", "暗恋", "双向"],
    note: "暗恋类解压推文，适合青春情感向。" },
  { id: 506, kind: "素材", category: ["解压推文", "甜宠", "军婚"],
    title: "嫁给军人老公后，才知道他是特种兵队长。",
    play: "素材", angle: "军婚 + 身份揭秘，硬汉柔情。",
    format: "军婚场景 / 普通军人铺垫 / 队长揭秘", tags: ["甜宠", "军婚", "特种兵"],
    note: "军婚类解压推文，硬汉柔情反差萌。" },
  { id: 507, kind: "素材", category: ["解压推文", "甜宠", "医婚"],
    title: "相亲对象是个普通医生，直到我在手术台上看到他。",
    play: "素材", angle: "相亲医生 + 手术室揭秘，职业反差。",
    format: "相亲场景 / 普通医生铺垫 / 手术室反转", tags: ["甜宠", "医生", "相亲"],
    note: "医生类解压推文，职业反差感强。" },

  // ==================== 复仇类 ====================
  { id: 601, kind: "素材", category: ["解压推文", "复仇", "爽文"],
    title: "被赶出家门三年后，我带着百亿身家回来了。",
    play: "素材", angle: "被抛弃 + 带着实力回归，解压感爆棚。",
    format: "三年前/后对比 / 身份反转 / 打脸全家", tags: ["复仇", "爽文", "回归"],
    note: "经典解压公式：当年你看不起我，今天你高攀不起。" },
  { id: 602, kind: "素材", category: ["解压推文", "复仇", "商战"],
    title: "被合伙人踢出公司后，我另起炉灶，市值是他的十倍。",
    play: "素材", angle: "商战背叛 + 另起炉灶碾压，职场解压。",
    format: "背叛场景 / 另起炉灶 / 市值碾压", tags: ["复仇", "商战", "职场"],
    note: "商战复仇类解压推文，适合职场人。" },
  { id: 603, kind: "素材", category: ["解压推文", "复仇", "家族"],
    title: "被逐出家族后，我成了他们最大的竞争对手。",
    play: "素材", angle: "家族逐出 + 竞争碾压，家族解压。",
    format: "逐出场景 / 竞争铺垫 / 碾压收尾", tags: ["复仇", "家族", "竞争"],
    note: "家族复仇类解压推文，适合长线剧情。" },
  { id: 604, kind: "素材", category: ["解压推文", "复仇", "校园"],
    title: "被校园霸凌十年后，我成了他们的老板。",
    play: "素材", angle: "校园霸凌 + 职场反转，社会向解压。",
    format: "霸凌回忆 / 十年铺垫 / 老板反转", tags: ["复仇", "校园", "霸凌"],
    note: "校园霸凌复仇类，适合社会话题。" },
  { id: 605, kind: "素材", category: ["解压推文", "复仇", "职场"],
    title: "被裁员当天，我收到了竞争对手的百万年薪offer。",
    play: "素材", angle: "裁员 + 竞对offer，职场解压。",
    format: "裁员场景 / 失落铺垫 / offer反转", tags: ["复仇", "裁员", "职场"],
    note: "裁员复仇类解压推文，职场人最爱。" },
  { id: 606, kind: "素材", category: ["解压推文", "复仇", "情感"],
    title: "发现老公出轨后，我默默收集证据，净身出户的是他。",
    play: "素材", angle: "出轨发现 + 证据反转，女性解压。",
    format: "出轨发现 / 证据收集 / 净身出户反转", tags: ["复仇", "出轨", "女性"],
    note: "出轨复仇类解压推文，女性用户共鸣强。" },

  // ==================== 系统流/金手指类 ====================
  { id: 701, kind: "素材", category: ["解压推文", "系统", "金手指"],
    title: "绑定签到系统第一天，我中了五百万。",
    play: "素材", angle: "系统流 + 开局暴击，解压推文新方向。",
    format: "系统面板 / 数字冲击 / 连续爽点", tags: ["系统", "金手指", "爽文"],
    note: "系统流解压推文，数字要夸张，节奏要快。" },
  { id: 702, kind: "素材", category: ["解压推文", "系统", "金手指"],
    title: "手机突然能预知未来，我提前一天知道所有事情。",
    play: "素材", angle: "预知未来 + 提前布局，信息差解压。",
    format: "手机异常 / 预知能力 / 提前布局", tags: ["系统", "预知", "信息差"],
    note: "预知类解压推文，信息差就是金手指。" },
  { id: 703, kind: "素材", category: ["解压推文", "系统", "金手指"],
    title: "获得读心术后，我发现全公司都在演戏。",
    play: "素材", angle: "读心术 + 职场揭秘，反差解压。",
    format: "读心术获得 / 职场揭秘 / 反差收尾", tags: ["系统", "读心术", "职场"],
    note: "读心术类解压推文，职场揭秘感强。" },
  { id: 704, kind: "素材", category: ["解压推文", "系统", "金手指"],
    title: "打开外卖软件，发现每单都能返现十万。",
    play: "素材", angle: "外卖返现 + 连续暴击，日常解压。",
    format: "日常场景 / 返现发现 / 连续暴击", tags: ["系统", "外卖", "返现"],
    note: "日常系统流解压推文，贴近生活。" },
  { id: 705, kind: "素材", category: ["解压推文", "系统", "金手指"],
    title: "抽卡系统附身，每次都能抽到SSR。",
    play: "素材", angle: "抽卡必中 + 连续欧皇，游戏解压。",
    format: "抽卡场景 / 必中机制 / 连续欧皇", tags: ["系统", "抽卡", "游戏"],
    note: "抽卡类解压推文，游戏玩家最爱。" },

  // ==================== 悬疑反转类 ====================
  { id: 801, kind: "素材", category: ["解压推文", "悬疑", "反转"],
    title: "我只是去送外卖，结果全城都在找我。",
    play: "素材", angle: "悬疑 + 误会 + 反转，适合短视频化。",
    format: "悬念开头 / 节奏递进 / 结尾反杀", tags: ["悬疑", "反转", "节奏快"],
    note: "适合做一集一个爆点的短剧情结构。" },
  { id: 802, kind: "素材", category: ["解压推文", "悬疑", "反转"],
    title: "捡到一部手机，里面的照片让我后背发凉。",
    play: "素材", angle: "捡手机 + 恐怖悬疑，猎奇解压。",
    format: "捡到物品 / 悬念铺垫 / 真相反转", tags: ["悬疑", "猎奇", "恐怖"],
    note: "猎奇悬疑类解压推文，好奇心驱动。" },
  { id: 803, kind: "素材", category: ["解压推文", "悬疑", "反转"],
    title: "搬进新房第一天，发现墙里有敲门声。",
    play: "素材", angle: "新房恐怖 + 悬疑揭秘，灵异解压。",
    format: "新房场景 / 灵异铺垫 / 真相反转", tags: ["悬疑", "灵异", "恐怖"],
    note: "灵异悬疑类解压推文，适合夜间推送。" },
  { id: 804, kind: "素材", category: ["解压推文", "悬疑", "反转"],
    title: "相亲对象完美得不像话，直到我发现了她的秘密。",
    play: "素材", angle: "完美相亲 + 秘密揭秘，都市悬疑。",
    format: "相亲场景 / 完美铺垫 / 秘密反转", tags: ["悬疑", "相亲", "都市"],
    note: "都市悬疑类解压推文，适合情感向。" },
  { id: 805, kind: "素材", category: ["解压推文", "悬疑", "反转"],
    title: "公司新来的实习生，竟然是卧底记者。",
    play: "素材", angle: "实习生 + 卧底揭秘，职场悬疑。",
    format: "职场场景 / 实习生铺垫 / 卧底反转", tags: ["悬疑", "职场", "卧底"],
    note: "职场悬疑类解压推文，揭秘感强。" },

  // ==================== 年代文类 ====================
  { id: 901, kind: "素材", category: ["解压推文", "年代", "致富"],
    title: "六零年代，我在村里开了第一家供销社。",
    play: "素材", angle: "年代开供销社 + 致富，年代解压。",
    format: "六零场景 / 供销社创业 / 致富收尾", tags: ["年代", "供销社", "致富"],
    note: "六零年代致富类解压推文，年代感足。" },
  { id: 902, kind: "素材", category: ["解压推文", "年代", "致富"],
    title: "七零年代嫁到农村，我把荒地变成了金矿。",
    play: "素材", angle: "七零嫁农村 + 荒地变金矿，年代致富。",
    format: "七零场景 / 荒地开局 / 金矿反转", tags: ["年代", "农村", "致富"],
    note: "七零年代致富类，适合农村向。" },
  { id: 903, kind: "素材", category: ["解压推文", "年代", "致富"],
    title: "八零年代摆地摊，十年后我成了商业巨头。",
    play: "素材", angle: "八零摆摊 + 商业巨头，年代逆袭。",
    format: "八零场景 / 摆摊开局 / 巨头反转", tags: ["年代", "摆摊", "逆袭"],
    note: "八零年代逆袭类，适合创业向。" },
  { id: 904, kind: "素材", category: ["解压推文", "年代", "致富"],
    title: "九零年代下海经商，第一桶金是一车方便面。",
    play: "素材", angle: "九零下海 + 方便面第一桶金，年代创业。",
    format: "九零场景 / 下海经商 / 第一桶金", tags: ["年代", "下海", "创业"],
    note: "九零年代创业类，适合创业人群。" },
  { id: 905, kind: "素材", category: ["解压推文", "年代", "致富"],
    title: "穿越到饥荒年代，我用一袋大米换了一座宅子。",
    play: "素材", angle: "饥荒年代 + 物资换房产，年代捡漏。",
    format: "饥荒场景 / 物资交换 / 宅子反转", tags: ["年代", "饥荒", "捡漏"],
    note: "饥荒年代捡漏类，物资就是硬通货。" },

  // ==================== 古言类 ====================
  { id: 1001, kind: "素材", category: ["解压推文", "古言", "宅斗"],
    title: "被退婚后，我反手把他们的结局写满了反转。",
    play: "素材", angle: "适合古言、宅斗、权谋向的剧情推进。",
    format: "一句话冲突 + 连环打脸", tags: ["古言", "反转", "打脸"],
    note: "适合封面标题短、正文剧情密度高。" },
  { id: 1002, kind: "素材", category: ["解压推文", "古言", "权谋"],
    title: "庶女逆袭：从冷院弃女到一品诰命夫人。",
    play: "素材", angle: "庶女逆袭 + 诰命夫人，古言解压。",
    format: "庶女开局 / 逆袭铺垫 / 诰命收尾", tags: ["古言", "庶女", "诰命"],
    note: "古言庶女逆袭类，女性用户最爱。" },
  { id: 1003, kind: "素材", category: ["解压推文", "古言", "医女"],
    title: "穿成被退婚的丑女，我用医术惊艳了所有人。",
    play: "素材", angle: "穿越丑女 + 医术惊艳，古言逆袭。",
    format: "丑女开局 / 医术铺垫 / 惊艳反转", tags: ["古言", "医术", "丑女"],
    note: "古言医女类解压推文，逆袭感强。" },
  { id: 1004, kind: "素材", category: ["解压推文", "古言", "宫斗"],
    title: "冷宫皇后翻身：这次我要当太后。",
    play: "素材", angle: "冷宫皇后 + 太后逆袭，宫斗解压。",
    format: "冷宫开局 / 翻身铺垫 / 太后收尾", tags: ["古言", "宫斗", "太后"],
    note: "宫斗类解压推文，权谋感强。" },
  { id: 1005, kind: "素材", category: ["解压推文", "古言", "经商"],
    title: "被休弃的商户女，靠一双手建起了商业帝国。",
    play: "素材", angle: "休弃商户女 + 商业帝国，古言经商。",
    format: "休弃开局 / 经商铺垫 / 帝国收尾", tags: ["古言", "经商", "商户"],
    note: "古言经商类解压推文，适合经商向。" },

  // ==================== 都市/职场类 ====================
  { id: 1101, kind: "素材", category: ["解压推文", "都市", "职场"],
    title: "入职第一天，CEO亲自给我倒了杯咖啡。",
    play: "素材", angle: "入职 + CEO特殊对待，职场解压。",
    format: "入职场景 / CEO铺垫 / 特殊对待", tags: ["都市", "职场", "CEO"],
    note: "都市职场类解压推文，适合白领。" },
  { id: 1102, kind: "素材", category: ["解压推文", "都市", "职场"],
    title: "被同事排挤三个月后，我成了他们的上司。",
    play: "素材", angle: "被排挤 + 升职反转，职场打脸。",
    format: "排挤场景 / 升职铺垫 / 上司反转", tags: ["都市", "职场", "打脸"],
    note: "职场打脸类解压推文，职场人共鸣。" },
  { id: 1103, kind: "素材", category: ["解压推文", "都市", "职场"],
    title: "面试被嘲笑学历低，三年后我收购了那家公司。",
    play: "素材", angle: "面试嘲笑 + 收购反转，职场复仇。",
    format: "面试场景 / 嘲笑铺垫 / 收购反转", tags: ["都市", "职场", "复仇"],
    note: "职场复仇类解压推文，逆袭感强。" },
  { id: 1104, kind: "素材", category: ["解压推文", "都市", "创业"],
    title: "辞职创业第一天，前老板打电话求我回去。",
    play: "素材", angle: "辞职创业 + 前老板求回，创业解压。",
    format: "辞职场景 / 创业铺垫 / 前老板反转", tags: ["都市", "创业", "辞职"],
    note: "创业类解压推文，适合创业人群。" },
  { id: 1105, kind: "素材", category: ["解压推文", "都市", "医术"],
    title: "被医院开除的实习生，救了院长的命。",
    play: "素材", angle: "被开除 + 救命反转，医术解压。",
    format: "开除场景 / 救命铺垫 / 院长反转", tags: ["都市", "医术", "打脸"],
    note: "医术类解压推文，专业感强。" },

  // ==================== 校园类 ====================
  { id: 1201, kind: "素材", category: ["解压推文", "校园", "学渣逆袭"],
    title: "全班倒数第一，高考考了全省状元。",
    play: "素材", angle: "学渣逆袭 + 状元反转，校园解压。",
    format: "学渣场景 / 逆袭铺垫 / 状元反转", tags: ["校园", "学渣", "高考"],
    note: "校园学渣逆袭类，学生最爱。" },
  { id: 1202, kind: "素材", category: ["解压推文", "校园", "学霸"],
    title: "被嘲笑的转学生，竟然是隐藏的天才。",
    play: "素材", angle: "转学生 + 天才揭秘，校园反差。",
    format: "转学场景 / 嘲笑铺垫 / 天才反转", tags: ["校园", "天才", "转学"],
    note: "校园天才类解压推文，反差感强。" },
  { id: 1203, kind: "素材", category: ["解压推文", "校园", "恋爱"],
    title: "暗恋校草三年，毕业那天他向我表白了。",
    play: "素材", angle: "暗恋揭秘 + 表白反转，校园甜宠。",
    format: "暗恋场景 / 三年铺垫 / 表白反转", tags: ["校园", "暗恋", "表白"],
    note: "校园甜宠类解压推文，青春感强。" },

  // ==================== 娱乐圈类 ====================
  { id: 1301, kind: "素材", category: ["解压推文", "娱乐圈", "逆袭"],
    title: "被雪藏三年的艺人，一首歌红遍全网。",
    play: "素材", angle: "被雪藏 + 一首歌逆袭，娱乐圈解压。",
    format: "雪藏场景 / 三年铺垫 / 一首歌反转", tags: ["娱乐圈", "雪藏", "逆袭"],
    note: "娱乐圈逆袭类解压推文，适合追星族。" },
  { id: 1302, kind: "素材", category: ["解压推文", "娱乐圈", "打脸"],
    title: "选秀节目被淘汰的选手，成了导师的导师。",
    play: "素材", angle: "被淘汰 + 导师反转，娱乐圈打脸。",
    format: "淘汰场景 / 逆袭铺垫 / 导师反转", tags: ["娱乐圈", "选秀", "打脸"],
    note: "娱乐圈打脸类解压推文，选秀热。" },
  { id: 1303, kind: "素材", category: ["解压推文", "娱乐圈", "身份"],
    title: "全网黑的女明星，真实身份是隐藏学霸。",
    play: "素材", angle: "被黑明星 + 学霸揭秘，身份反转。",
    format: "被黑场景 / 明星铺垫 / 学霸揭秘", tags: ["娱乐圈", "学霸", "身份"],
    note: "娱乐圈身份类解压推文，反转感强。" },

  // ==================== 厨神/美食类 ====================
  { id: 1401, kind: "素材", category: ["解压推文", "美食", "厨神"],
    title: "被赶出厨房的小学徒，做了一道让米其林主厨跪下的菜。",
    play: "素材", angle: "小学徒 + 米其林打脸，美食解压。",
    format: "厨房场景 / 学徒铺垫 / 米其林反转", tags: ["美食", "厨神", "打脸"],
    note: "美食类解压推文，画面感强。" },
  { id: 1402, kind: "素材", category: ["解压推文", "美食", "摆摊"],
    title: "失业后摆了个煎饼摊，月入十万。",
    play: "素材", angle: "失业摆摊 + 月入十万，摆摊致富。",
    format: "失业场景 / 摆摊铺垫 / 月入十万", tags: ["美食", "摆摊", "致富"],
    note: "摆摊致富类解压推文，接地气。" },

  // ==================== 解压推文补充素材 ====================
  { id: 1501, kind: "素材", category: ["解压推文", "系统", "签到"],
    title: "绑定外卖好评系统，每条好评返现一百万。",
    play: "素材", angle: "外卖好评 + 连续返现，日常解压。",
    format: "外卖场景 / 好评返现 / 连续暴击", tags: ["系统", "外卖", "返现"],
    note: "日常系统流解压推文，贴近打工人生活。" },
  { id: 1502, kind: "素材", category: ["解压推文", "打脸", "医术"],
    title: "被全医院嘲笑的赤脚医生，一针救活了院长的母亲。",
    play: "素材", angle: "赤脚医生 + 一针救命，医术打脸。",
    format: "医院场景 / 嘲笑铺垫 / 一针反转", tags: ["打脸", "医术", "赤脚医生"],
    note: "医术打脸类解压推文，专业感+反转感。" },
  { id: 1503, kind: "素材", category: ["解压推文", "穿越", "空间"],
    title: "穿越后发现自带空间，里面有一座金山。",
    play: "素材", angle: "穿越空间 + 金山开局，物资解压。",
    format: "穿越场景 / 空间发现 / 金山暴击", tags: ["穿越", "空间", "金山"],
    note: "空间流穿越解压推文，开局就暴富。" },
  { id: 1504, kind: "素材", category: ["解压推文", "复仇", "离婚"],
    title: "离婚当天，前夫看到我的嫁妆清单，后悔得跪下了。",
    play: "素材", angle: "离婚 + 嫁妆揭秘，女性解压。",
    format: "离婚场景 / 嫁妆铺垫 / 前夫后悔", tags: ["复仇", "离婚", "嫁妆"],
    note: "离婚复仇类解压推文，女性用户最爱。" },
  { id: 1505, kind: "素材", category: ["解压推文", "系统", "直播"],
    title: "直播时突然觉醒读心系统，发现榜一大哥是来卧底的。",
    play: "素材", angle: "直播读心 + 卧底揭秘，直播解压。",
    format: "直播场景 / 读心系统 / 卧底反转", tags: ["系统", "直播", "读心"],
    note: "直播类解压推文，适合短视频化。" },
  { id: 1506, kind: "素材", category: ["解压推文", "打脸", "赘婿"],
    title: "当了三年赘婿被全家欺负，今天我摊牌了：公司是我的。",
    play: "素材", angle: "赘婿摊牌 + 公司反转，经典打脸。",
    format: "赘婿场景 / 欺负铺垫 / 摊牌打脸", tags: ["打脸", "赘婿", "摊牌"],
    note: "赘婿打脸类解压推文，男频经典。" },
  { id: 1507, kind: "素材", category: ["解压推文", "重生", "投资"],
    title: "重生到2010年，我用一百块买了第一套房。",
    play: "素材", angle: "重生投资 + 百元买房，投资解压。",
    format: "2010年场景 / 百元起步 / 房产暴富", tags: ["重生", "投资", "房产"],
    note: "重生投资类解压推文，信息差就是金手指。" },
  { id: 1508, kind: "素材", category: ["解压推文", "悬疑", "反转"],
    title: "公司团建去了一个荒岛，第二天发现多了一个同事。",
    play: "素材", angle: "团建荒岛 + 多出来的人，悬疑解压。",
    format: "团建场景 / 荒岛设定 / 人数反转", tags: ["悬疑", "团建", "荒岛"],
    note: "悬疑类解压推文，好奇心驱动。" },
  // ==================== 娱乐圈解压 ====================
  { id: 2001, kind: "素材", category: ["解压推文", "娱乐圈", "逆袭"],
    title: "被全网黑的选秀选手，一首歌唱完，评委全站起来了。",
    play: "素材", angle: "选秀逆袭 + 全场起立，娱乐圈解压。",
    format: "选秀舞台 / 全网黑铺垫 / 一首歌反转", tags: ["娱乐圈", "选秀", "逆袭"],
    note: "娱乐圈逆袭类解压推文，舞台就是打脸现场。" },
  { id: 2002, kind: "素材", category: ["解压推文", "娱乐圈", "打脸"],
    title: "被抢了C位的练习生，决赛夜用实力让全场闭嘴。",
    play: "素材", angle: "C位被抢 + 决赛打脸，娱乐圈复仇。",
    format: "练习生场景 / C位争夺 / 决赛夜反转", tags: ["娱乐圈", "C位", "打脸"],
    note: "娱乐圈打脸类解压推文，练习生题材热度高。" },
  { id: 2003, kind: "素材", category: ["解压推文", "美食", "打脸"],
    title: "被嘲笑不会做菜的外卖小哥，一道菜让米其林主厨沉默了。",
    play: "素材", angle: "外卖小哥 + 米其林打脸，美食解压。",
    format: "厨房场景 / 嘲笑铺垫 / 一道菜反转", tags: ["美食", "打脸", "厨艺"],
    note: "美食打脸类解压推文，厨艺比拼天然有爽点。" },
  { id: 2004, kind: "素材", category: ["解压推文", "美食", "致富"],
    title: "用奶奶的秘方摆摊，第一天就被美食街老板求着合伙。",
    play: "素材", angle: "秘方摆摊 + 日赚万元，美食致富。",
    format: "摆摊场景 / 秘方铺垫 / 致富递进", tags: ["美食", "摆摊", "致富"],
    note: "美食致富类解压推文，贴近生活有代入感。" },
  { id: 2005, kind: "素材", category: ["解压推文", "校园", "学霸"],
    title: "全班倒数第一的学渣，高考那天考了全省状元。",
    play: "素材", angle: "学渣逆袭 + 高考状元，校园解压。",
    format: "校园场景 / 倒数铺垫 / 高考反转", tags: ["校园", "学霸", "逆袭"],
    note: "校园逆袭类解压推文，高考题材共鸣感强。" },
  { id: 2006, kind: "素材", category: ["解压推文", "校园", "恋爱"],
    title: "暗恋了三年的女生，毕业那天主动来找我了。",
    play: "素材", angle: "暗恋三年 + 毕业告白，校园甜宠。",
    format: "校园场景 / 暗恋铺垫 / 毕业反转", tags: ["校园", "暗恋", "恋爱"],
    note: "校园恋爱类解压推文，青春感+甜宠感。" },
  { id: 2007, kind: "素材", category: ["解压推文", "古言", "宅斗"],
    title: "嫁入侯府被婆婆刁难，三天后我让整个侯府都听我的。",
    play: "素材", angle: "侯府宅斗 + 三天翻盘，古言解压。",
    format: "侯府场景 / 婆婆刁难 / 三天翻盘", tags: ["古言", "宅斗", "侯府"],
    note: "古言宅斗类解压推文，婆媳斗智斗勇。" },
  { id: 2008, kind: "素材", category: ["解压推文", "古言", "经商"],
    title: "被休弃的商户女，三年后成了天下第一富商。",
    play: "素材", angle: "被休弃 + 天下首富，古言经商。",
    format: "被休场景 / 经商起步 / 致富逆袭", tags: ["古言", "经商", "致富"],
    note: "古言经商类解压推文，女主独立致富线。" },
  { id: 2009, kind: "素材", category: ["解压推文", "军婚", "甜宠"],
    title: "相亲对象是特种兵，婚后他每天教我防身术。",
    play: "素材", angle: "军婚相亲 + 特种兵宠妻，军婚甜宠。",
    format: "相亲场景 / 特种兵身份 / 婚后甜宠", tags: ["军婚", "甜宠", "特种兵"],
    note: "军婚甜宠类解压推文，硬汉柔情反差萌。" },
  { id: 2010, kind: "素材", category: ["解压推文", "医婚", "甜宠"],
    title: "假结婚嫁给了全城最帅的外科医生，他竟然当真了。",
    play: "素材", angle: "假结婚 + 医生当真，医婚甜宠。",
    format: "医院场景 / 假结婚设定 / 医生沦陷", tags: ["医婚", "甜宠", "医生"],
    note: "医婚甜宠类解压推文，医生人设热度高。" },
  { id: 2011, kind: "素材", category: ["解压推文", "宫斗", "权谋"],
    title: "被打入冷宫的妃子，用一碗汤拿下了整个后宫。",
    play: "素材", angle: "冷宫翻盘 + 一碗汤夺权，宫斗解压。",
    format: "冷宫场景 / 一碗汤铺垫 / 后宫翻盘", tags: ["宫斗", "权谋", "冷宫"],
    note: "宫斗权谋类解压推文，智谋型女主。" },
  { id: 2012, kind: "素材", category: ["解压推文", "都市", "商战"],
    title: "被合伙人踢出公司后，我用一个APP反超了他的市值。",
    play: "素材", angle: "被踢出 + 反超市值，都市商战。",
    format: "创业场景 / 被踢出铺垫 / 反超逆袭", tags: ["都市", "商战", "创业"],
    note: "都市商战类解压推文，创业逆袭有共鸣。" },
  { id: 2013, kind: "素材", category: ["解压推文", "直播", "系统"],
    title: "直播间觉醒打赏返利系统，观众打赏一百我赚一万。",
    play: "素材", angle: "直播系统 + 打赏返利，直播解压。",
    format: "直播间场景 / 系统觉醒 / 返利暴击", tags: ["直播", "系统", "打赏"],
    note: "直播系统类解压推文，平台经济+金手指。" },
  { id: 2014, kind: "素材", category: ["解压推文", "赘婿", "身份"],
    title: "当了三年上门女婿被全家看不起，今天龙王令到了。",
    play: "素材", angle: "赘婿身份 + 龙王令揭秘，赘婿解压。",
    format: "赘婿场景 / 看不起铺垫 / 龙王令反转", tags: ["赘婿", "身份", "龙王"],
    note: "赘婿身份类解压推文，龙王令经典套路。" },
  { id: 2015, kind: "素材", category: ["解压推文", "假千金", "认亲"],
    title: "被养了十八年的假千金赶出家门，亲生父母开着劳斯莱斯来接我。",
    play: "素材", angle: "假千金驱逐 + 亲生父母认亲，身份解压。",
    format: "赶出家门 / 劳斯莱斯认亲 / 身份反转", tags: ["假千金", "认亲", "身份"],
    note: "假千金认亲类解压推文，身份反转爽感强。" },
  { id: 2016, kind: "素材", category: ["解压推文", "豪门", "弃妇"],
    title: "被豪门净身出户的前妻，三年后带着百亿身家回来了。",
    play: "素材", angle: "净身出户 + 百亿回归，豪门弃妇复仇。",
    format: "净身出户 / 三年蛰伏 / 百亿回归", tags: ["豪门", "弃妇", "复仇"],
    note: "豪门弃妇类解压推文，蛰伏归来打脸。" },
  { id: 2017, kind: "素材", category: ["解压推文", "悬疑", "密室"],
    title: "密室逃脱时发现NPC是真人，他求我救他出去。",
    play: "素材", angle: "密室NPC + 真人求救，悬疑解压。",
    format: "密室场景 / NPC异常 / 真人揭秘", tags: ["悬疑", "密室", "反转"],
    note: "密室悬疑类解压推文，好奇心驱动完播。" },
  { id: 2018, kind: "素材", category: ["解压推文", "都市", "身份"],
    title: "外卖员送餐到前女友婚礼，新郎看到我叫了声大哥。",
    play: "素材", angle: "外卖员 + 前女友婚礼 + 身份揭秘，都市解压。",
    format: "婚礼场景 / 外卖员身份 / 大哥反转", tags: ["都市", "身份", "反转"],
    note: "都市身份类解压推文，反差越大越解压。" },
  { id: 2019, kind: "素材", category: ["解压推文", "穿越", "医术"],
    title: "穿越成太医，一剂药治好了困扰皇帝十年的头痛。",
    play: "素材", angle: "穿越太医 + 一剂药除根，穿越医术。",
    format: "宫廷场景 / 太医身份 / 一剂药反转", tags: ["穿越", "医术", "宫廷"],
    note: "穿越医术类解压推文，降维打击感。" },
  { id: 2020, kind: "素材", category: ["解压推文", "重生", "复仇"],
    title: "重生回到被毒死的那天，这次我先换了两杯酒。",
    play: "素材", angle: "重生复仇 + 换酒反杀，重生复仇。",
    format: "宴席场景 / 被毒记忆 / 换酒反杀", tags: ["重生", "复仇", "反杀"],
    note: "重生复仇类解压推文，先知先觉反杀。" },

  // ==================== 虐文解压素材 ====================
  {
    id: 3101, kind: "今日案例", category: ["解压推文", "虐文", "离婚"],
    title: "离婚那天，我把他公司偷走的账本直接摊在董事会上。",
    play: "6.8万次", angle: "离婚反杀 + 账本公开，虐文里最容易出爽点。",
    format: "离婚场景 / 董事会反转 / 先虐后爽", tags: ["虐文", "离婚", "反杀", "账本"],
    note: "开局压抑、结尾翻盘，适合做追妻火葬场开篇。", workUrl: "https://www.kuaishou.com/f/X-RDkJdeyCjBFeB"
  },
  {
    id: 3102, kind: "今日案例", category: ["解压推文", "虐文", "替身"],
    title: "病房里他认错了我三次，我只把离婚协议递给他一次。",
    play: "7.4万次", angle: "病房认错 + 替身退场，虐文感和反差都够强。",
    format: "病房场景 / 替身告别 / 一句封喉", tags: ["虐文", "替身", "病房", "反差"],
    note: "替身类虐文最适合先压后爽，开头就把情绪拉满。", workUrl: "https://www.kuaishou.com/f/X-5WoMijxHLT9hRi"
  },
  {
    id: 3103, kind: "今日案例", category: ["解压推文", "虐文", "追妻火葬场"],
    title: "追妻火葬场开局，女主先把孩子抚养权抓稳了。",
    play: "8.2万次", angle: "抚养权先手 + 追妻反转，故事更容易留住人。",
    format: "法庭场景 / 抚养权争夺 / 先手反击", tags: ["虐文", "追妻火葬场", "抚养权", "反转"],
    note: "追妻火葬场不用一直虐，前半段先把主动权拿回来。", workUrl: "https://www.kuaishou.com/f/X340K6sUmqOi1AF"
  },
  {
    id: 3104, kind: "今日案例", category: ["解压推文", "虐文", "误会反转"],
    title: "误会十年后，我把当年的录音发到了全网。",
    play: "7.9万次", angle: "误会澄清 + 全网公开，虐文转爽文的典型写法。",
    format: "录音证据 / 全网公开 / 真相翻盘", tags: ["虐文", "误会", "录音", "翻盘"],
    note: "适合做情绪爆发点，最后一秒把真相砸出来。", workUrl: "https://www.kuaishou.com/f/X8G9ksvHWX361XY"
  },

  { id: 3111, kind: "素材", category: ["解压推文", "虐文", "离婚"],
    title: "被弃婚后，我把离婚协议改成了项目合同。",
    play: "素材", angle: "离婚反转 + 事业掌控，虐文里直接翻身。",
    format: "离婚场景 / 合同反转 / 先虐后爽", tags: ["虐文", "离婚", "翻身"],
    note: "适合追妻火葬场开局，前虐后爽最容易吸引点击。" },
  { id: 3112, kind: "素材", category: ["解压推文", "虐文", "替身"],
    title: "替身退场那一刻，真正的白月光才开始慌。",
    play: "素材", angle: "替身退场 + 白月光反应，情绪拉扯很强。",
    format: "替身设定 / 白月光回归 / 情绪反转", tags: ["虐文", "替身", "白月光"],
    note: "替身虐文是稳定题材，重点在最后一刀别拖太久。" },
  { id: 3113, kind: "素材", category: ["解压推文", "虐文", "病房"],
    title: "病房里他认错了我三次，我只回了他一次律师函。",
    play: "素材", angle: "病房认错 + 律师函反杀，情绪反差大。",
    format: "病房场景 / 律师函 / 一句反杀", tags: ["虐文", "病房", "反杀"],
    note: "病房场景自带压迫感，结尾要足够利落。" },
  { id: 3114, kind: "素材", category: ["解压推文", "虐文", "追妻火葬场"],
    title: "追妻火葬场开局，女主先把抚养权抓稳了。",
    play: "素材", angle: "抚养权先手 + 追妻反转，剧情更稳。",
    format: "法庭场景 / 抚养权争夺 / 先手反击", tags: ["虐文", "追妻火葬场", "抚养权"],
    note: "追妻类要先给女主一个抓手，爽点才会稳。" },
  { id: 3115, kind: "素材", category: ["解压推文", "虐文", "误会反转"],
    title: "误会十年后，我把当年的录音发到了全网。",
    play: "素材", angle: "误会澄清 + 全网公开，天然有爆点。",
    format: "录音证据 / 全网公开 / 真相翻盘", tags: ["虐文", "误会", "录音"],
    note: "虐文转爽文，最怕拖，真相要在后半段迅速落地。" },
  { id: 3116, kind: "素材", category: ["解压推文", "虐文", "白月光"],
    title: "白月光回国那天，我让他先签了分手协议。",
    play: "素材", angle: "白月光回归 + 协议先手，女主气场要足。",
    format: "回国场景 / 协议先手 / 情感断舍离", tags: ["虐文", "白月光", "协议"],
    note: "白月光题材要把主角的边界感写出来，结尾更爽。" },
  { id: 3117, kind: "素材", category: ["解压推文", "虐文", "豪门"],
    title: "他把我关在别墅三年，我出门第一件事就是起诉。",
    play: "素材", angle: "豪门囚禁 + 起诉反杀，冲突感很强。",
    format: "豪门场景 / 起诉翻盘 / 反压制", tags: ["虐文", "豪门", "起诉"],
    note: "豪门虐文要把压抑和反杀放在同一个镜头里。" },
  { id: 3118, kind: "素材", category: ["解压推文", "虐文", "破镜重圆"],
    title: "破镜重圆前夜，我先把自己活成了主角。",
    play: "素材", angle: "破镜重圆 + 自我成长，虐文结尾更高级。",
    format: "破镜重圆 / 自我成长 / 最终反转", tags: ["虐文", "破镜重圆", "成长"],
    note: "不一定要一直虐，先把人物立住，最后的回头才更值钱。" },

  // ==================== 口播短视频补充案例 ====================
  {
    id: 2101, kind: "今日案例", category: ["解压推文", "系统", "短视频"],
    title: "开头三秒先怼脸，系统一出场就把人拽进剧情。",
    play: "8.6万次", angle: "短视频口播 + 系统反转，先抓注意力再进剧情。",
    format: "口播视频 / 三段式分镜 / 强反差收口", tags: ["短视频", "口播", "系统", "分镜"],
    note: "主打解压推文视频，适合直接做成快手/抖音口播。", workUrl: "https://www.kuaishou.com/f/X-RDkJdeyCjBFeB"
  },
  {
    id: 2102, kind: "今日案例", category: ["解压推文", "口播", "短视频"],
    title: "被全家看不起的女主，第一句台词就把场子掀了。",
    play: "9.1万次", angle: "口播开场 + 反打脸，语气比PPT更重要。",
    format: "口播视频 / 直给冲突 / 一镜到底", tags: ["口播", "短视频", "打脸", "反转"],
    note: "适合把长文压成短口播，开头就有情绪。", workUrl: "https://www.kuaishou.com/f/X-5WoMijxHLT9hRi"
  },
  {
    id: 2103, kind: "今日案例", category: ["解压推文", "系统", "直播"],
    title: "直播间觉醒返利系统，观众越刷，我越像开了外挂。",
    play: "11.4万次", angle: "直播场景 + 系统返利，现场感更强。",
    format: "直播切片 / 系统觉醒 / 打赏返利", tags: ["直播", "系统", "返利", "切片"],
    note: "直播切片型解压推文，热视频感强。", workUrl: "https://www.kuaishou.com/f/X340K6sUmqOi1AF"
  },
  {
    id: 2104, kind: "今日案例", category: ["解压推文", "分镜", "剪辑"],
    title: "一篇长文拆成四个镜头，前三秒直接把冲突甩出来。",
    play: "7.8万次", angle: "分镜拆文 + 剪辑卡点，适合短视频化。",
    format: "分镜脚本 / 剪辑卡点 / 冲突前置", tags: ["分镜", "剪辑", "短视频", "卡点"],
    note: "适合把PPT长内容改成短视频节奏。", workUrl: "https://www.kuaishou.com/f/X8G9ksvHWX361XY"
  },
  {
    id: 2105, kind: "今日案例", category: ["解压推文", "系统", "口播"],
    title: "评论区还没看完，口播已经把反转塞到第二句。",
    play: "10.2万次", angle: "系统型口播 + 第二句反转，完播更稳。",
    format: "口播视频 / 评论区引导 / 二段式反转", tags: ["口播", "系统", "评论区", "反转"],
    note: "适合主打解压推文视频，不走长图文。", workUrl: "https://www.kuaishou.com/f/X4uKfNArz20PnIc"
  },
  {
    id: 2106, kind: "今日案例", category: ["解压推文", "短视频", "剪辑"],
    title: "把原文删到只剩钩子，剪出来反而更像爆款。",
    play: "7.1万次", angle: "极简剪辑 + 钩子前置，减少PPT感。",
    format: "短视频 / 极简剪辑 / 前三秒钩子", tags: ["短视频", "剪辑", "钩子", "反差"],
    note: "适合做短视频口播和卡点版本。", workUrl: "https://www.kuaishou.com/f/X1UPdaYNuagLVuF"
  },
  {
    id: 2107, kind: "今日案例", category: ["解压推文", "系统", "分镜"],
    title: "系统流不是堆设定，先把一眼能懂的反差放出来。",
    play: "8.9万次", angle: "系统设定先降维，再补冲突细节。",
    format: "分镜脚本 / 系统设定 / 反差开局", tags: ["系统", "分镜", "短视频", "反差"],
    note: "系统题材更适合短视频拆条，不适合长PPT。", workUrl: "https://www.kuaishou.com/f/X-GU0gy2liFk1b3"
  },
  {
    id: 2108, kind: "今日案例", category: ["解压推文", "口播", "系统"],
    title: "先说结果再补过程，口播节奏比长图文更抓人。",
    play: "9.7万次", angle: "结果前置 + 口播推进，适合直接发视频。",
    format: "口播视频 / 结果前置 / 口播收尾", tags: ["口播", "系统", "短视频", "结果前置"],
    note: "主推视频型案例，PPT只留少量参考。", workUrl: "https://www.kuaishou.com/f/X6zeGLh5eoIN27Q"
  }];

const state = {
  items: fallbackItems,
  sourceLabel: "默认数据",
  activated: false,
  themeScheme: getStoredThemeScheme(),
  themeAccent: getStoredThemeAccent(),
  query: "",
  category: "全部",
  reminderTime: localStorage.getItem(STORAGE_KEY) || "09:00",
  notifiedDay: null,
  dailyDigest: null,
  hotItems: [],
  hotCheckedAt: null,
  poolItems: [],
  poolUpdatedAt: null,
  poolSummary: "",
  localHotItems: [],
  hotRefreshStage: "",
  hotRefreshTimerId: null,
  feedRefreshTimerId: null,
  hotRefreshSignalsBound: false,
  feedRefreshSignalsBound: false,
  lastManualRefreshAt: null,
  wallpaperUrl: getStoredWallpaperUrl(),
  musicMotionActive: false,
  musicMotionTimerId: null,
  isHotRefreshing: false,
  isPoolSubmitting: false,
  isRefreshing: false,
  isAiSearching: false
};

const els = {
  todayLabel: document.getElementById("todayLabel"),
  panelDate: document.getElementById("panelDate"),
  panelKicker: document.querySelector(".hero-panel .panel-kicker"),
  panelTitle: document.querySelector(".hero-panel .panel-title"),
  panelList: document.querySelector(".hero-panel .panel-list"),
  hotStatus: document.getElementById("hotStatus"),
  hotList: document.getElementById("hotList"),
  refreshHotBtn: document.getElementById("refreshHotBtn"),
  refreshFeedBtn: document.getElementById("refreshFeedBtn"),
  aiSearchBtn: document.getElementById("aiSearchBtn"),
  poolCount: document.getElementById("poolCount"),
  hotCount: document.getElementById("hotCount"),
  tagCount: document.getElementById("tagCount"),
  poolStatCount: document.getElementById("poolStatCount"),
  poolInput: document.getElementById("poolInput"),
  poolSubmitBtn: document.getElementById("poolSubmitBtn"),
  poolClearBtn: document.getElementById("poolClearBtn"),
  poolStatus: document.getElementById("poolStatus"),
  totalCount: document.getElementById("totalCount"),
  caseCount: document.getElementById("caseCount"),
  materialCount: document.getElementById("materialCount") || document.getElementById("templateCount"),
  templateCount: document.getElementById("templateCount"),
  resultMeta: document.getElementById("resultMeta"),
  filters: document.getElementById("filters"),
  cards: document.getElementById("cards"),
  searchInput: document.getElementById("searchInput"),
  schemeToggle: document.getElementById("schemeToggle"),
  accentToggle: document.getElementById("accentToggle"),
  themeMeta: document.querySelector('meta[name="theme-color"]'),
  summaryBox: document.getElementById("summaryBox"),
  copySummaryBtn: document.getElementById("copySummaryBtn"),
  copyFromBoxBtn: document.getElementById("copyFromBoxBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  notifyBtn: document.getElementById("notifyBtn"),
  saveReminderBtn: document.getElementById("saveReminderBtn"),
  remindTime: document.getElementById("remindTime"),
  reminderHint: document.getElementById("reminderHint"),
  wallpaperPreview: document.getElementById("wallpaperPreview"),
  wallpaperGrid: document.getElementById("wallpaperGrid"),
  wallpaperInput: document.getElementById("wallpaperInput"),
  wallpaperApplyBtn: document.getElementById("wallpaperApplyBtn"),
  wallpaperClearBtn: document.getElementById("wallpaperClearBtn"),
  activationCodeValue: document.getElementById("activationCodeValue"),
  activationCopyBtn: document.getElementById("activationCopyBtn"),
  activationTempCodeValue: document.getElementById("activationTempCodeValue"),
  activationTempCopyBtn: document.getElementById("activationTempCopyBtn"),
  activationTempHint: document.getElementById("activationTempHint"),
  musicLink: document.getElementById("musicLink"),
  fanStrip: document.querySelector(".fan-strip"),
  musicCard: document.querySelector(".music-card"),
  mimoTest: document.getElementById("mimoTest"),
  toast: document.getElementById("toast"),
  activationOverlay: document.getElementById("activationOverlay"),
  activationInput: document.getElementById("activationInput"),
  activationBtn: document.getElementById("activationBtn"),
  activationClearBtn: document.getElementById("activationClearBtn")
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "long"
});

function getPreferredThemeScheme() {
  try {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function getStoredThemeScheme() {
  try {
    const value = localStorage.getItem(THEME_SCHEME_STORAGE_KEY);
    if (value === "light" || value === "dark") {
      return value;
    }
  } catch {
    // localStorage may be unavailable in some preview contexts
  }

  return getPreferredThemeScheme();
}

function getStoredThemeAccent() {
  try {
    const value = localStorage.getItem(THEME_ACCENT_STORAGE_KEY);
    if (THEME_ACCENTS.includes(value)) {
      return value;
    }
  } catch {
    // localStorage may be unavailable in some preview contexts
  }

  return THEME_ACCENTS[0];
}

function isTempActivationLocked() {
  try {
    return localStorage.getItem(TEMP_ACTIVATION_LOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function setTempActivationLocked(locked) {
  try {
    if (locked) {
      localStorage.setItem(TEMP_ACTIVATION_LOCK_KEY, "1");
    } else {
      localStorage.removeItem(TEMP_ACTIVATION_LOCK_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

function normalize(str) {
  return String(str).toLowerCase().replace(/\s+/g, "");
}

function polishContentText(value) {
  return String(value || "").replace(/模板|模版/g, "素材");
}

function normalizeTextList(list) {
  return Array.isArray(list) ? list.map((value) => polishContentText(value)).filter(Boolean) : [];
}

function countUniqueCatalogTags(items) {
  const uniqueTags = new Set();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const categories = Array.isArray(item?.category) ? item.category : [];
    const tags = Array.isArray(item?.tags) ? item.tags : [];

    [...categories, ...tags].forEach((tag) => {
      const text = polishContentText(String(tag || "").trim());
      if (text) {
        uniqueTags.add(text);
      }
    });
  });

  return uniqueTags.size;
}

function normalizeWallpaperUrl(value) {
  const url = String(value || "").trim();
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url) || /^data:image\//i.test(url)) {
    return url;
  }

  return "";
}

function getWallpaperLabel(url) {
  const target = normalizeWallpaperUrl(url);
  if (!target) {
    return "默认渐变背景";
  }

  return WALLPAPER_PRESETS.find((item) => item.url === target)?.label || "自定义壁纸";
}

function displayKindLabel(kind) {
  const value = String(kind || "").trim();
  if (!value) {
    return "";
  }

  return polishContentText(value);
}

function normalizeItem(item) {
  return {
    id: item.id ?? crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    kind: displayKindLabel(item.kind || "素材") || "素材",
    category: normalizeTextList(item.category),
    title: polishContentText(item.title || "未命名内容"),
    play: polishContentText(item.play || "素材"),
    angle: polishContentText(item.angle || ""),
    format: polishContentText(item.format || ""),
    workUrl: item.workUrl || WORK_URLS[item.id] || "",
    tags: normalizeTextList(item.tags),
    note: polishContentText(item.note || "")
  };
}

function mergeCatalogItems(existing, incoming) {
  const existingPlay = parsePlayCount(existing?.play);
  const incomingPlay = parsePlayCount(incoming?.play);
  const keepIncoming = incomingPlay > existingPlay || (!existing?.workUrl && incoming?.workUrl);
  const category = Array.from(new Set([...normalizeTextList(existing?.category), ...normalizeTextList(incoming?.category)]));
  const tags = Array.from(new Set([...normalizeTextList(existing?.tags), ...normalizeTextList(incoming?.tags)]));

  return {
    ...existing,
    ...incoming,
    id: existing?.id ?? incoming?.id,
    kind: displayKindLabel(incoming?.kind || existing?.kind || "素材") || "素材",
    title: polishContentText(keepIncoming && incoming?.title ? incoming.title : existing?.title || incoming?.title),
    category,
    play: polishContentText(keepIncoming && incoming?.play ? incoming.play : existing?.play || incoming?.play),
    angle:
      polishContentText(
        (incoming?.angle || "").length >= (existing?.angle || "").length
          ? incoming?.angle || existing?.angle || ""
          : existing?.angle || incoming?.angle || ""
      ),
    format:
      polishContentText(
        (incoming?.format || "").length >= (existing?.format || "").length
          ? incoming?.format || existing?.format || ""
          : existing?.format || incoming?.format || ""
      ),
    workUrl: incoming?.workUrl || existing?.workUrl || "",
    tags,
    note:
      polishContentText(
        (incoming?.note || "").length >= (existing?.note || "").length
          ? incoming?.note || existing?.note || ""
          : existing?.note || incoming?.note || ""
      )
  };
}

function dedupeCatalogItems(items) {
  const map = new Map();

  for (const rawItem of Array.isArray(items) ? items : []) {
    const item = normalizeItem(rawItem);
    const titleKey = normalize(item.title);
    const key = titleKey ? `title:${titleKey}` : item.workUrl ? `url:${String(item.workUrl).trim()}` : `id:${item.id}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, item);
      continue;
    }

    map.set(key, mergeCatalogItems(existing, item));
  }

  return [...map.values()];
}

function normalizePoolItem(item) {
  const playCount = Number(item?.playCount) || parsePlayCount(item?.play);
  const category = normalizeTextList(item?.category);
  const tags = normalizeTextList(item?.tags);
  const flags = Array.isArray(item?.flags) ? item.flags.filter(Boolean) : [];
  const score = Number(item?.score) || playCount;

  return {
    id: item?.id ?? crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    kind: displayKindLabel(item?.kind || "号池") || "号池",
    category: category.length ? category : ["号池", "用户提交"],
    title: polishContentText(item?.title || item?.workUrl || "号池链接"),
    play: polishContentText(item?.play || (playCount ? formatHotCount(playCount) : "未标注")),
    playCount,
    angle: polishContentText(item?.angle || "把爆款链接先放进号池，后面可以继续筛选和复用。"),
    format: polishContentText(item?.format || "号池 / 爆款链接 / 用户共建"),
    workUrl: item?.workUrl || "",
    tags: tags.length ? tags : ["号池", "用户提交"],
    note: polishContentText(item?.note || "用户提交到号池的内容"),
    sourceText: item?.sourceText || "",
    source: item?.source || "号池",
    submittedAt: item?.submittedAt || item?.updatedAt || new Date().toISOString(),
    updatedAt: item?.updatedAt || item?.submittedAt || new Date().toISOString(),
    bumpCount: Number(item?.bumpCount) || 1,
    score,
    flags: flags.length ? flags : ["号池"]
  };
}

function normalizeHotItem(item, sourceLabel = "实时热榜") {
  const category = normalizeTextList(item?.category);
  const tags = normalizeTextList(item?.tags);
  const flags = Array.isArray(item?.flags) ? item.flags.filter(Boolean) : [];
  const playCount = Number(item?.playCount) || parsePlayCount(item?.play);
  const likeCount = Number(item?.likeCount) || Number(item?.likes) || Number(item?.thumbCount) || Number(item?.likeNum) || 0;
  const shareCount = Number(item?.shareCount) || Number(item?.shares) || Number(item?.shareNum) || 0;
  const score = Number(item?.score) || playCount + shareCount * 2 + likeCount * 3;

  return {
    id: item?.id ?? crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    kind: displayKindLabel(item?.kind || (sourceLabel === "号池" ? "号池" : "今日案例")) || (sourceLabel === "号池" ? "号池" : "今日案例"),
    category,
    title: polishContentText(item?.title || "未命名内容"),
    play: polishContentText(item?.play || (playCount ? formatHotCount(playCount) : "未标注")),
    playCount,
    angle: polishContentText(item?.angle || ""),
    format: polishContentText(item?.format || ""),
    workUrl: item?.workUrl || "",
    tags,
    note: polishContentText(item?.note || ""),
    shareCount,
    likeCount,
    score,
    flags,
    source: item?.source || sourceLabel,
    submittedAt: item?.submittedAt || "",
    updatedAt: item?.updatedAt || item?.submittedAt || "",
    bumpCount: Number(item?.bumpCount) || 0,
    rank: Number(item?.rank) || 0
  };
}

function isRealVideoShareUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return false;
  }

  return /(?:\/f\/|v\.kuaishou\.com\/)/i.test(value);
}

function dedupeHotItems(items) {
  const map = new Map();

  items.forEach((item) => {
    const titleKey = normalize(item.title);
    const workKey = item.workUrl ? `url:${String(item.workUrl).trim()}` : "";
    const key = titleKey ? `title:${titleKey}` : workKey || `id:${item.id}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, item);
      return;
    }

    const merged = {
      ...existing,
      ...item,
      category: Array.from(new Set([...(existing.category || []), ...(item.category || [])])),
      tags: Array.from(new Set([...(existing.tags || []), ...(item.tags || [])])),
      flags: Array.from(new Set([...(existing.flags || []), ...(item.flags || [])])),
      source:
        existing.source === item.source
          ? existing.source
          : Array.from(new Set([existing.source, item.source].filter(Boolean))).join(" / "),
      score: Math.max(Number(existing.score) || 0, Number(item.score) || 0),
      playCount: Math.max(Number(existing.playCount) || 0, Number(item.playCount) || 0)
    };

    map.set(key, merged);
  });

  return [...map.values()];
}

function rankHotCandidates(items) {
  return dedupeHotItems(Array.isArray(items) ? items : [])
    .map((item) => ({
      ...item,
      likeCount: Number(item.likeCount) || 0,
      shareCount: Number(item.shareCount) || 0,
      playCount: Number(item.playCount) || 0,
      score: Number(item.score) || 0
    }))
    .sort((a, b) => {
      const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
      if (scoreDiff) {
        return scoreDiff;
      }

      const likeDiff = (Number(b.likeCount) || 0) - (Number(a.likeCount) || 0);
      if (likeDiff) {
        return likeDiff;
      }

      const shareDiff = (Number(b.shareCount) || 0) - (Number(a.shareCount) || 0);
      if (shareDiff) {
        return shareDiff;
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

function getVisibleHotItems() {
  const q = normalize(state.query);
  const category = state.category;
  const merged = rankHotCandidates([
    ...state.hotItems.map((item) => normalizeHotItem(item, "实时热榜")),
    ...state.poolItems.map((item) => normalizeHotItem(item, "号池")),
    ...(Array.isArray(state.localHotItems) ? state.localHotItems : [])
  ]);

  return merged
    .filter((item) => {
      const categoryMatch = category === "全部" || (Array.isArray(item.category) && item.category.includes(category));
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const itemCategories = Array.isArray(item.category) ? item.category : [];
      const text = [
        item.title,
        item.play,
        item.angle,
        item.format,
        item.note,
        item.source,
        tags.join(" "),
        itemCategories.join(" ")
      ].join(" ");
      const queryMatch = !q || normalize(text).includes(q);
      return categoryMatch && queryMatch && isRealVideoShareUrl(item.workUrl);
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
}

function getCategoriesLegacy(items) {
  return [
    "全部",
    ...Array.from(new Set(items.flatMap((item) => item.category))).filter(Boolean)
  ];
}

function getCategoryLabel() {
  return state.category === "全部" ? "全部" : state.category;
}

const MATERIAL_KEYWORDS = [
  "解压", "解压推文", "虐文", "追妻火葬场", "重生", "穿越", "古言", "古风", "年代",
  "豪门", "甜宠", "复仇", "系统", "职场", "校园", "娱乐圈", "美食", "军婚",
  "商战", "悬疑", "反转", "打脸", "口播", "分镜", "剪辑", "直播", "返利",
  "医术", "身份", "白月光", "替身", "离婚", "认亲", "空间", "致富", "高热",
  "爆款", "热榜", "短视频", "小说", "视频"
];

function extractMaterialKeywords(...sources) {
  const text = normalize(sources.flat().filter(Boolean).join(" "));
  const result = [];

  MATERIAL_KEYWORDS.forEach((keyword) => {
    const value = polishContentText(keyword);
    if (value && text.includes(normalize(value)) && !result.includes(value)) {
      result.push(value);
    }
  });

  return result.slice(0, 16);
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char] || char;
  });
}

function parsePlayCount(value) {
  const raw = String(value || "").replace(/\s+/g, "").replace(/,/g, "");
  if (!raw || ["素材", "模板", "模版", "未标注"].includes(raw)) {
    return 0;
  }

  const match = raw.match(/([\d.]+)(亿|万)?/);
  if (!match) {
    return 0;
  }

  const num = Number(match[1]);
  if (!Number.isFinite(num)) {
    return 0;
  }

  if (match[2] === "亿") {
    return Math.round(num * 100000000);
  }

  if (match[2] === "万") {
    return Math.round(num * 10000);
  }

  return Math.round(num);
}

function formatHotCount(count) {
  if (!count) {
    return "0";
  }

  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(count % 100000000 === 0 ? 0 : 1)}亿`;
  }

  if (count >= 10000) {
    return `${(count / 10000).toFixed(count % 10000 === 0 ? 0 : 1)}万`;
  }

  return `${count}`;
}

function buildLocalHotItems(items) {
  const highlightSet = new Set(
    Array.isArray(state.dailyDigest?.highlightIds)
      ? state.dailyDigest.highlightIds.map((id) => Number(id)).filter(Number.isFinite)
      : []
  );

  return items
    .map((item) => {
      const playCount = parsePlayCount(item.play);
      const id = Number(item.id);
      const isHighlight = Number.isFinite(id) && highlightSet.has(id);
      const itemCategory = Array.isArray(item.category) ? item.category : [];
      const categoryBoost = itemCategory.some((tag) => ["小说推荐", "漫画解说", "二次元", "解压推文", "虐文", "追妻火葬场"].includes(tag))
        ? 5000
        : 0;
      const kindBoost = item.kind === "今日案例" ? 2000 : 0;
      const linkBoost = item.workUrl ? 1200 : 0;
      const likeBoost = Number(item.likeCount) ? Math.min(Number(item.likeCount) / 1000, 2000) : 0;
      const aiBoost = isHighlight ? 250000 : 0;
      const score = playCount + categoryBoost + kindBoost + linkBoost + likeBoost + aiBoost;
      const flags = [];

      if (playCount >= 1000000) {
        flags.push("超高热");
      } else if (playCount >= 100000) {
        flags.push("高热");
      } else if (playCount >= 10000) {
        flags.push("增长中");
      }

      if (isHighlight) {
        flags.push("AI命中");
      }

      if (item.workUrl) {
        flags.push("有链接");
      }

      return {
        id: item.id,
        title: item.title,
        play: item.play,
        workUrl: item.workUrl,
        angle: item.angle || "",
        category: itemCategory,
        source: "素材库",
        score,
        playCount,
        likeCount: Number(item.likeCount) || 0,
        flags
      };
    })
    .filter((item) => item.workUrl || item.playCount > 0 || item.flags.includes("AI命中"))
    .sort((a, b) => b.score - a.score || b.playCount - a.playCount)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
}

function renderHotPanel() {
  if (!els.hotStatus || !els.hotList) {
    return;
  }

  const hotItems = getVisibleHotItems();
  const checkedAt = state.hotCheckedAt
    ? new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(state.hotCheckedAt))
    : "刚刚";

  const poolCount = Array.isArray(state.poolItems) ? state.poolItems.length : 0;
  const localHotCount = Array.isArray(state.localHotItems)
    ? state.localHotItems.filter((item) => isRealVideoShareUrl(item.workUrl)).length
    : 0;
  const queryLabel = state.query ? ` · 搜索：${state.query}` : "";
  const busyHotLabel = state.isHotRefreshing
    ? " · 正在刷新实时爆款"
    : state.isAiSearching
      ? " · MiMo 正在搜索"
      : "";
  const stageLabel = state.hotRefreshStage ? ` · ${state.hotRefreshStage}` : "";
  els.hotStatus.textContent = `已检测 ${hotItems.length} 条真实视频候选 · 实时热榜 ${state.hotItems.length} 条 · 素材补充 ${localHotCount} 条 · 号池 ${poolCount} 条 · 最近刷新 ${checkedAt} · 当前筛选：${getCategoryLabel()}${queryLabel}${busyHotLabel}${stageLabel}`;

  if (!hotItems.length) {
    els.hotList.innerHTML = `<li class="hot-empty">暂无真实视频链接。当前只显示快手视频分享链接，账号主页已隐藏。</li>`;
    return;
  }

  els.hotList.innerHTML = hotItems
    .map((item) => {
      const flags = Array.isArray(item.flags) ? item.flags : [];
      const metaBits = [item.source || "热榜关注", ...flags].filter(Boolean);
      const flagText = metaBits.length ? metaBits.join(" · ") : "热榜关注";
      const angleText = item.angle ? ` · ${item.angle}` : "";
      const likeText = Number(item.likeCount) ? ` · 点赞 ${formatHotCount(Number(item.likeCount))}` : "";
      const shareText = Number(item.shareCount) ? ` · 分享 ${formatHotCount(Number(item.shareCount))}` : "";
      const extraText = item.predictionReason ? ` · ${item.predictionReason}` : "";
      return `
        <li class="hot-item">
          <div class="hot-rank">${String(item.rank).padStart(2, "0")}</div>
          <div class="hot-body">
            <div class="hot-title-row">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="hot-score">${escapeHtml(item.play || formatHotCount(item.playCount))}</span>
            </div>
            <div class="hot-meta">${escapeHtml(flagText)} · 分值 ${formatHotCount(item.score)}${escapeHtml(angleText)}${escapeHtml(likeText)}${escapeHtml(shareText)}${escapeHtml(extraText)}</div>
          </div>
          ${item.workUrl ? `<a class="hot-link" href="${item.workUrl}" target="_blank" rel="noopener noreferrer">打开</a>` : ""}
        </li>
      `;
    })
    .join("");
}

function renderPoolPanel() {
  if (!els.poolStatus) {
    return;
  }

  const poolItems = Array.isArray(state.poolItems) ? state.poolItems : [];
  const poolCount = poolItems.length;
  const updatedAt = state.poolUpdatedAt
    ? new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(state.poolUpdatedAt))
    : "刚刚";

  if (els.poolCount) {
    els.poolCount.textContent = String(poolCount).padStart(2, "0");
  }

  const summary = state.poolSummary || `号池共 ${poolCount} 条内容`;
  const note = poolCount > 0 ? "这里只保留提交入口，不展开列表。" : "先把链接粘进来，号池会自动汇总。";
  els.poolStatus.textContent = `${summary} · 最近更新 ${updatedAt} · ${note}`;
}

function buildFeedUrl(forceRefresh = false, refreshToken = "") {
  if (!forceRefresh) {
    return DATA_ENDPOINT;
  }

  try {
    const url = new URL(DATA_ENDPOINT, window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      url.searchParams.set("refresh", refreshToken || buildRefreshToken());
      return url.toString();
    }
  } catch {
    // keep original endpoint
  }

  return DATA_ENDPOINT;
}

function buildHotUrl(refreshToken = "") {
  if (!refreshToken) {
    return HOT_ENDPOINT;
  }

  try {
    const url = new URL(HOT_ENDPOINT, window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      url.searchParams.set("refresh", refreshToken);
      return url.toString();
    }
  } catch {
    // keep original endpoint
  }

  return HOT_ENDPOINT;
}

function buildPoolUrl(refreshToken = "") {
  if (!refreshToken) {
    return POOL_ENDPOINT;
  }

  try {
    const url = new URL(POOL_ENDPOINT, window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      url.searchParams.set("refresh", refreshToken);
      return url.toString();
    }
  } catch {
    // keep original endpoint
  }

  return POOL_ENDPOINT;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2200);
}

function persistTheme() {
  try {
    localStorage.setItem(THEME_SCHEME_STORAGE_KEY, state.themeScheme);
    localStorage.setItem(THEME_ACCENT_STORAGE_KEY, state.themeAccent);
  } catch {
    // ignore storage write failures
  }
}

function syncThemeControls() {
  const schemeButtons = els.schemeToggle?.querySelectorAll("[data-scheme]") || [];
  schemeButtons.forEach((btn) => {
    const active = btn.dataset.scheme === state.themeScheme;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const accentButtons = els.accentToggle?.querySelectorAll("[data-accent]") || [];
  accentButtons.forEach((btn) => {
    const active = btn.dataset.accent === state.themeAccent;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function applyTheme() {
  const root = document.documentElement;
  root.dataset.scheme = state.themeScheme;
  root.dataset.accent = state.themeAccent;
  root.style.setProperty("color-scheme", state.themeScheme);

  const metaColor = THEME_META_COLORS[state.themeScheme]?.[state.themeAccent]
    || (state.themeScheme === "light" ? "#f7efe1" : "#0f1420");

  if (els.themeMeta) {
    els.themeMeta.setAttribute("content", metaColor);
  }

  syncThemeControls();
}

function setThemeScheme(nextScheme) {
  if (nextScheme !== "light" && nextScheme !== "dark") {
    return;
  }

  if (state.themeScheme === nextScheme) {
    return;
  }

  state.themeScheme = nextScheme;
  persistTheme();
  applyTheme();
  showToast(nextScheme === "light" ? "已切换为日间模式" : "已切换为夜间模式");
}

function setThemeAccent(nextAccent) {
  if (!THEME_ACCENTS.includes(nextAccent) || nextAccent === state.themeAccent) {
    return;
  }

  state.themeAccent = nextAccent;
  persistTheme();
  applyTheme();
  showToast(`已切换主题色：${THEME_ACCENT_LABELS[nextAccent] || nextAccent}`);
}

function applyWallpaper(nextUrl, options = {}) {
  const url = normalizeWallpaperUrl(nextUrl);
  state.wallpaperUrl = url;

  const safeUrl = url.replace(/"/g, '\\"');
  const root = document.documentElement;
  document.body.classList.toggle("has-wallpaper", Boolean(url));

  if (url) {
    root.style.setProperty("--wallpaper-image", `url("${safeUrl}")`);
    root.style.setProperty("--wallpaper-opacity", "0.24");
  } else {
    root.style.setProperty("--wallpaper-image", "none");
    root.style.setProperty("--wallpaper-opacity", "0");
  }

  if (options.persist !== false) {
    saveWallpaperUrl(url);
  }

  if (!options.silent) {
    showToast(url ? `已切换壁纸：${getWallpaperLabel(url)}` : "已恢复默认背景");
  }
}

function renderWallpaperPanel() {
  if (!els.wallpaperGrid && !els.wallpaperPreview && !els.wallpaperInput) {
    return;
  }

  const currentUrl = normalizeWallpaperUrl(state.wallpaperUrl);
  const currentLabel = getWallpaperLabel(currentUrl);
  const preview = els.wallpaperPreview;

  if (preview) {
    preview.style.backgroundImage = currentUrl ? `url("${currentUrl.replace(/"/g, '\\"')}")` : "";
    preview.dataset.label = currentLabel;
  }

  if (els.wallpaperInput && document.activeElement !== els.wallpaperInput) {
    els.wallpaperInput.value = currentUrl;
  }

  if (!els.wallpaperGrid) {
    return;
  }

  els.wallpaperGrid.innerHTML = WALLPAPER_PRESETS
    .map((item) => {
      const active = item.url === currentUrl ? "is-active" : "";
      return `
        <button class="wallpaper-chip ${active}" type="button" data-wallpaper-url="${escapeHtml(item.url)}" data-wallpaper-label="${escapeHtml(item.label)}">
          <span class="wallpaper-chip-title">${escapeHtml(item.label)}</span>
          <span class="wallpaper-chip-sub">哲风壁纸 · 点一下切换</span>
        </button>
      `;
    })
    .join("");

  els.wallpaperGrid.querySelectorAll("[data-wallpaper-url]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyWallpaper(btn.dataset.wallpaperUrl || "", { silent: false });
      render();
    });
  });
}

function getUrlActivationCode() {
  return new URLSearchParams(window.location.search).get(ACTIVATION_PARAM)?.trim() || "";
}

function isActivationValid(code) {
  return VALID_ACTIVATION_CODES.includes(String(code || "").trim());
}

function getStoredActivationRecord() {
  try {
    const raw = localStorage.getItem(ACTIVATION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && typeof parsed.code === "string") {
        return {
          code: String(parsed.code || "").trim(),
          activatedAt: parsed.activatedAt || null
        };
      }
    } catch {
      // fall back to legacy plain-string storage
    }

    const legacyCode = String(raw || "").trim();
    if (isActivationValid(legacyCode)) {
      return { code: legacyCode, activatedAt: null };
    }

    return null;
  } catch {
    return null;
  }
}

function isActivationRecordExpired(record) {
  if (!record || record.code !== TEMP_ACTIVATION_CODE) {
    return false;
  }

  const activatedAt = Date.parse(record.activatedAt || "");
  if (!Number.isFinite(activatedAt)) {
    return true;
  }

  return Date.now() - activatedAt >= TEMP_ACTIVATION_DURATION_MS;
}

function persistActivation(code) {
  try {
    const payload = {
      code: String(code || "").trim(),
      activatedAt: new Date().toISOString()
    };
    localStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage failures
  }
}

function setActivationUi(activated) {
  state.activated = activated;
  document.body.classList.toggle("is-locked", !activated);
  els.activationOverlay.classList.toggle("hidden", activated);
}

function syncActivationCodeUi() {
  if (els.activationCodeValue) {
    els.activationCodeValue.textContent = PERMANENT_ACTIVATION_CODE;
  }

  if (els.activationCopyBtn) {
    const code = (els.activationCodeValue?.textContent || PERMANENT_ACTIVATION_CODE || "").trim();
    els.activationCopyBtn.title = code ? `复制激活码 ${code}` : "复制激活码";
  }

  if (els.activationTempCodeValue) {
    els.activationTempCodeValue.textContent = TEMP_ACTIVATION_CODE;
  }

  if (els.activationTempCopyBtn) {
    els.activationTempCopyBtn.title = `复制临时卡密 ${TEMP_ACTIVATION_CODE}`;
  }

  if (els.activationTempHint) {
    els.activationTempHint.textContent = isTempActivationLocked()
      ? "临时卡密已过期，这台设备需要永久卡密重新激活。"
      : `临时卡密启用后 ${Math.round(TEMP_ACTIVATION_DURATION_MS / 3600000)} 小时失效，失效后请使用永久卡密重新进入。`;
  }
}

function syncMusicMotionUi() {
  const disc = document.getElementById("musicDisc");
  const playBtn = document.getElementById("musicPlayBtn");
  const statusEl = document.getElementById("musicStatus");
  
  if (!disc || !playBtn) return;
  
  let isPlaying = false;
  let audio = null;
  
  playBtn.addEventListener("click", () => {
    if (!audio) {
      // 创建一个示例音频（你可以替换成真实的音乐链接）
      audio = new Audio("https://music.cpp-prog.com/api/random");
      audio.loop = true;
    }
    
    if (isPlaying) {
      audio.pause();
      disc.classList.remove("playing");
      playBtn.textContent = "▶ 播放";
      statusEl.textContent = "已暂停";
      isPlaying = false;
    } else {
      audio.play().catch(() => {
        // 如果音频加载失败，只做视觉效果
        statusEl.textContent = "正在播放...";
      });
      disc.classList.add("playing");
      playBtn.textContent = "⏸ 暂停";
      statusEl.textContent = "正在播放...";
      isPlaying = true;
    }
  });
}

function syncMusicMotionUi() {
  const active = Boolean(state.musicMotionActive);
  document.body.classList.toggle("is-music-active", active);
  els.musicCard?.classList.toggle("is-motion", active);
  els.musicLink?.classList.toggle("is-motion", active);
  els.fanStrip?.classList.toggle("is-motion", active);
}

function setMusicMotion(active, durationMs = 8000) {
  if (state.musicMotionTimerId) {
    window.clearTimeout(state.musicMotionTimerId);
    state.musicMotionTimerId = null;
  }

  state.musicMotionActive = Boolean(active);
  syncMusicMotionUi();

  if (!state.musicMotionActive) {
    return;
  }

  if (Number.isFinite(durationMs) && durationMs > 0) {
    state.musicMotionTimerId = window.setTimeout(() => {
      state.musicMotionTimerId = null;
      setMusicMotion(false);
    }, durationMs);
  }
}

function clearActivation(options = {}) {
  const { silent = false } = options;
  localStorage.removeItem(ACTIVATION_STORAGE_KEY);
  setActivationUi(false);
  syncActivationCodeUi();
  if (els.activationInput) {
    els.activationInput.value = "";
    els.activationInput.focus();
  }
  if (!silent) {
    showToast("已清除激活状态");
  }
}

function unlockPage(code) {
  persistActivation(code);
  if (code === PERMANENT_ACTIVATION_CODE) {
    setTempActivationLocked(false);
  }
  setActivationUi(true);
  syncActivationCodeUi();
  showToast(code === TEMP_ACTIVATION_CODE ? "临时卡密已激活，48小时内有效" : "激活成功");
}

function tryActivate(code) {
  const normalized = String(code || "").trim();
  if (!isActivationValid(normalized)) {
    showToast("激活码不正确");
    return false;
  }

  if (normalized === TEMP_ACTIVATION_CODE && isTempActivationLocked()) {
    showToast("临时卡密已过期，请使用永久卡密重新激活");
    return false;
  }

  unlockPage(normalized);
  return true;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("已复制到剪贴板");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("已复制到剪贴板");
  }
}

function getFilteredItemsLegacy() {
  const q = normalize(state.query);
  return state.items.filter((item) => {
    const itemCategory = Array.isArray(item.category) ? item.category : [];
    const itemTags = Array.isArray(item.tags) ? item.tags : [];
    const categoryMatch = state.category === "全部" || itemCategory.includes(state.category);
    const text = [
      item.kind,
      item.title,
      item.play,
      item.angle,
      item.format,
      item.workUrl,
      itemTags.join(" "),
      item.note
    ].join(" ");
    const queryMatch = !q || normalize(text).includes(q);
    return categoryMatch && queryMatch;
  });
}

function buildSummary(items) {
  const now = new Date();
  const header = `【${dateFormatter.format(now)}｜人生格言】`;
  const intro = [
    "坚持不是等到状态完美，而是把今天该做的先做完。",
    "你每认真更新一次，离更好的结果就更近一点。",
    `当前筛选：${getCategoryLabel()}｜命中 ${items.length} 条素材。`,
    ""
  ];

  const lines = items.slice(0, 8).map((item, index) => {
    const itemCategory = Array.isArray(item.category) ? item.category : [];
    return [
      `${index + 1}. ${polishContentText(item.title)}`,
      `   励志：${polishContentText(item.angle) || "继续坚持，别停下来。"}`,
      `   分类：${itemCategory.map(polishContentText).join(" / ")}`,
      item.workUrl ? `   作品链接：${item.workUrl}` : null
    ].filter(Boolean).join("\n");
  });

  const footer = [
    "",
    "今天的节奏：稳住、更新、复盘，再继续更新。",
    "慢一点没关系，别停下来就行。"
  ];

  return [header, ...intro, ...lines, ...footer].join("\n");
}

function getContentPriority(item) {
  const itemCategory = Array.isArray(item.category) ? item.category : [];
  const itemTags = Array.isArray(item.tags) ? item.tags : [];
  const text = normalize([
    item.kind,
    itemCategory.join(" "),
    item.title,
    item.play,
    item.angle,
    item.format,
    itemTags.join(" "),
    item.note,
    item.workUrl
  ].join(" "));

  let score = 0;

  if (item.kind === "今日案例") {
    score += 900;
  }

  if (item.workUrl) {
    score += 140;
  }

  if (/(瑙嗛|鐭棰?|鍙ｆ挱|鍒嗛暅|鐩存挱|鍓緫|鍥炬枃)/.test(text)) {
    score += 160;
  }

  if (/(ppt|闀垮浘鏂?|妯℃澘)/.test(text)) {
    score -= 260;
  }

  if (text.includes("瑙ｅ帇鎺ㄦ枃")) {
    score += 40;
  }

  if (text.includes("虐文") || text.includes("追妻火葬场")) {
    score += 60;
  }

  return score;
}
function renderFilters() {
  const categories = getCategories(state.items);

  if (!categories.includes(state.category)) {
    state.category = "全部";
  }

  els.filters.innerHTML = categories
    .map((category) => {
      const active = category === state.category ? "active" : "";
      return `<button class="filter-chip ${active}" data-category="${category}">${category}</button>`;
    })
    .join("");

  els.filters.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      render();
    });
  });
}

function renderCardsLegacy(items) {
  if (!items.length) {
    els.cards.innerHTML = `
      <div class="empty-state">
        没有匹配到内容。你可以换一个关键词，比如“穿越”“古风”“重生”“解压”。
      </div>
    `;
    return;
  }

  els.cards.innerHTML = items
    .map((item) => {
      const primaryCategory = getPrimaryCategory(item);
      const seenChips = new Set();
      const chipFragments = [];
      const pushChip = (tag, variant = "tag") => {
        const text = String(tag || "").trim();
        if (!text || seenChips.has(text) || chipFragments.length >= 24) {
          return;
        }
        seenChips.add(text);
        chipFragments.push(`<span class="chip chip--${variant}">${escapeHtml(text)}</span>`);
      };
      const pushSplitChips = (value, variant, limit = 3) => {
        String(value || "")
          .split(/[/＋+｜|·、,，;]/g)
          .map((part) => part.trim())
          .filter(Boolean)
          .slice(0, limit)
          .forEach((part) => pushChip(part, variant));
      };
      const angleLead = String(item.angle || "").split(/[，,。；;]/)[0];
      const categoryTags = Array.isArray(item.category) ? item.category : [];
      const contentTags = Array.isArray(item.tags) ? item.tags : [];
      const safeKind = escapeHtml(displayKindLabel(item.kind));
      const safePlay = escapeHtml(polishContentText(item.play || ""));
      const playLabel = item.kind === "今日案例" && safePlay ? `当日播放 ${safePlay}` : safePlay || "素材";
      const safeTitle = escapeHtml(polishContentText(item.title || ""));
      const safePrimaryCategory = escapeHtml(polishContentText(primaryCategory || ""));
      const safeAngle = escapeHtml(polishContentText(item.angle || ""));
      const safeFormat = escapeHtml(polishContentText(item.format || ""));
      const safeNote = escapeHtml(polishContentText(item.note || ""));
      const safeWorkUrl = String(item.workUrl || "").trim();
      const noteLead = String(item.note || "").split(/[，,。；;]/)[0];

      categoryTags
        .filter((tag) => tag && tag !== "解压推文" && tag !== primaryCategory)
        .forEach((tag) => pushChip(polishContentText(tag), "category"));
      pushSplitChips(polishContentText(angleLead), "angle", 4);
      pushSplitChips(polishContentText(item.format), "format", 5);
      pushSplitChips(polishContentText(noteLead), "tag", 2);
      contentTags.forEach((tag) => pushChip(polishContentText(tag), "tag"));

      const chips = chipFragments.join("");

      return `
        <article class="post-card" data-kind="${safeKind}" ${isToday ? 'data-today="true"' : ''}>
          <div class="post-card-inner">
            <div class="post-top">
              <span class="badge">${safeKind}</span>
              ${isToday ? '<span class="badge badge-today">今日</span>' : ''}
              ${dateLabel && !isToday ? `<span class="badge badge-date">${dateLabel}</span>` : ''}
              <span class="play">${playLabel}</span>
            </div>
            <h3 class="post-title">${safeTitle}</h3>
            <div class="post-meta">
              <div class="meta-row">
                <span class="label">主类</span>
                <span>${safePrimaryCategory}</span>
              </div>
              <div class="meta-row">
                <span class="label">角度</span>
                <span>${safeAngle}</span>
              </div>
              <div class="meta-row">
                <span class="label">形式</span>
                <span>${safeFormat}</span>
              </div>
              <div class="meta-row play-row">
                <span class="play-icon">▶</span>
                <span class="play-count">${safePlay}</span>
                <span class="play-label">当日播放</span>
              </div>
            </div>
            <div class="chips">${chips}</div>
            <div class="meta-row">
              <span class="label">说明</span>
              <span>${safeNote}</span>
            </div>
            <div class="actions">
              <button class="action-btn" data-copy-title="${encodeURIComponent(String(item.title || ""))}">复制标题</button>
              <button class="action-btn" data-copy-hook="${encodeURIComponent(`${String(item.title || "")}
${String(item.angle || "")}`)}">复制钩子</button>
              <a class="action-btn action-link" href="${safeWorkUrl ? escapeHtml(safeWorkUrl) : 'https://www.kuaishou.com/search/video?searchKey=' + encodeURIComponent(String(item.title || ''))}" target="_blank" rel="noopener noreferrer">打开作品</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  els.cards.querySelectorAll("[data-copy-title]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await copyText(decodeURIComponent(btn.dataset.copyTitle));
    });
  });

  els.cards.querySelectorAll("[data-copy-hook]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await copyText(decodeURIComponent(btn.dataset.copyHook));
    });
  });
}

function updateStats(items) {
  const total = state.items.length;
  const cases = items.filter((item) => item.kind === "今日案例").length;
  const materials = items.filter((item) => item.kind !== "今日案例").length;
  const hotCount = Array.isArray(state.hotItems) ? state.hotItems.length : 0;
  const tagCount = countUniqueCatalogTags([
    ...state.items,
    ...(Array.isArray(state.hotItems) ? state.hotItems : []),
    ...(Array.isArray(state.poolItems) ? state.poolItems : []),
    ...(Array.isArray(state.localHotItems) ? state.localHotItems : [])
  ]);
  const poolCount = Array.isArray(state.poolItems) ? state.poolItems.length : 0;
  const busyLabel = state.isRefreshing
    ? " · 正在刷新素材..."
    : state.isHotRefreshing
      ? " · 正在刷新热榜..."
      : state.isAiSearching
        ? " · MiMo 正在搜索..."
        : "";
  const refreshLabel = state.lastManualRefreshAt
    ? ` · 刚刚刷新 ${new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(state.lastManualRefreshAt))}`
    : "";

  els.totalCount.textContent = String(total).padStart(2, "0");
  els.caseCount.textContent = String(cases).padStart(2, "0");
  const materialCountEl = els.materialCount || els.templateCount;
  if (materialCountEl) {
    materialCountEl.textContent = String(materials).padStart(2, "0");
  }
  if (els.hotCount) {
    els.hotCount.textContent = String(hotCount).padStart(2, "0");
  }
  if (els.tagCount) {
    els.tagCount.textContent = String(tagCount).padStart(2, "0");
  }
  if (els.poolStatCount) {
    els.poolStatCount.textContent = String(poolCount).padStart(2, "0");
  }
  els.resultMeta.textContent = `当前显示 ${items.length} 条 · 实时热榜 ${hotCount} 条 · 标签 ${tagCount} 个 · 号池 ${poolCount} 条 · 当前筛选：${state.category} · 数据源：${state.sourceLabel}${busyLabel}${refreshLabel}`;
}

function renderSummary(items) {
  const categoryLabel = getCategoryLabel();
  els.summaryBox.value = `【当前筛选：${categoryLabel}｜命中 ${items.length} 条】\n\n${buildSummary(items)}`;
}

function renderSelectionPanel(items) {
  if (!els.panelKicker || !els.panelTitle || !els.panelList) {
    return;
  }

  if (state.category === "全部") {
    els.panelKicker.textContent = "今天适合推什么?";
    els.panelTitle.textContent = "推荐策略";
    els.panelList.innerHTML = `
      <li>主打解压推文视频：口播、分镜、剪辑优先。</li>
      <li>素材库和爆款链接优先看，PPT/长图文只作少量参考。</li>
      <li>有作品链接的先看原视频，再补文案和镜头。</li>
    `;
    return;
  }

  const topItem = items[0];
  els.panelKicker.textContent = `当前筛选：${state.category}`;
  els.panelTitle.textContent = "筛选后的推荐";
  els.panelList.innerHTML = "";

  const lines = [
    `当前命中 ${items.length} 条内容，先看解压视频和爆款素材。`,
    topItem ? `第一条：${polishContentText(topItem.title)}` : "当前筛选下没有匹配内容。",
    items[1] ? `第二条：${polishContentText(items[1].title)}` : null,
    items[2] ? `第三条：${polishContentText(items[2].title)}` : null,
    items[3] ? `第四条：${polishContentText(items[3].title)}` : null,
    items[4] ? `第五条：${polishContentText(items[4].title)}` : null,
    items[5] ? `第六条：${polishContentText(items[5].title)}` : null,
    items[6] ? `第七条：${polishContentText(items[6].title)}` : null,
    "作品链接已保留，点开就能看原作品。"
  ].filter(Boolean);

  lines.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    els.panelList.appendChild(li);
  });
}

function renderReminderHint() {
  if (!els.reminderHint) {
    return;
  }

  const now = new Date();
  const [hour, minute] = state.reminderTime.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  const text = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(next);

  els.reminderHint.textContent = `页面打开时会在 ${state.reminderTime} 提醒你；下一次提醒预估是 ${text}。关闭页面后不会继续后台推送。`;
}

function scheduleReminderLoop() {
  state.notifiedDay = state.notifiedDay || null;

  setInterval(async () => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const [hour, minute] = state.reminderTime.split(":").map(Number);

    if (
      now.getHours() === hour &&
      now.getMinutes() === minute &&
      state.notifiedDay !== todayKey
    ) {
      state.notifiedDay = todayKey;

      const title = "今日快手推文提醒";
      const body = "打开网页看看今天的爆款案例，顺手复制推送文案。";

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      } else {
        showToast(`${title}：${body}`);
      }
    }
  }, 30_000);
}

function scheduleFeedRefreshLoop() {
  if (state.feedRefreshTimerId) {
    clearInterval(state.feedRefreshTimerId);
  }

  const refreshFeedNow = () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    void refreshFeed(true, { silent: true });
  };

  state.feedRefreshTimerId = window.setInterval(refreshFeedNow, 45_000);

  if (!state.feedRefreshSignalsBound) {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        refreshFeedNow();
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    state.feedRefreshSignalsBound = true;
  }

  refreshFeedNow();
}

function scheduleHotRefreshLoop() {
  if (state.hotRefreshTimerId) {
    clearInterval(state.hotRefreshTimerId);
  }

  const refreshHot = () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    void refreshHotData({ silent: true });
  };

  state.hotRefreshTimerId = window.setInterval(refreshHot, 30_000);

  if (!state.hotRefreshSignalsBound) {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        refreshHot();
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    state.hotRefreshSignalsBound = true;
  }

  refreshHot();
}

// 自动 AI 搜爆款（每5分钟）
function scheduleAiSearchLoop() {
  if (state.aiSearchTimerId) {
    clearInterval(state.aiSearchTimerId);
  }

  const autoSearch = async () => {
    if (document.visibilityState !== "visible" || state.isAiSearching) {
      return;
    }

    try {
      const newHotItems = await fetchMimoHotItems("search");
      if (newHotItems.length > 0) {
        state.hotItems = dedupeHotItems([...newHotItems, ...state.hotItems]);
        state.hotCheckedAt = new Date().toISOString();
        render();
      }
    } catch (e) {
      console.warn("Auto AI search failed:", e.message);
    }
  };

  state.aiSearchTimerId = window.setInterval(autoSearch, 300_000); // 5分钟
}

function wireActions() {
  syncActivationCodeUi();
  syncMusicMotionUi();

  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  els.schemeToggle?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scheme]");
    if (!button) {
      return;
    }

    setThemeScheme(button.dataset.scheme);
  });

  els.accentToggle?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-accent]");
    if (!button) {
      return;
    }

    setThemeAccent(button.dataset.accent);
  });

  els.copySummaryBtn.addEventListener("click", async () => {
    await copyText(els.summaryBox.value);
  });

  els.copyFromBoxBtn.addEventListener("click", async () => {
    await copyText(els.summaryBox.value);
  });

  els.downloadBtn.addEventListener("click", () => {
    const blob = new Blob([els.summaryBox.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `快手推文_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("已生成文本文件");
  });

  if (els.notifyBtn) {
    els.notifyBtn.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        showToast("当前浏览器不支持通知");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("提醒已开启", {
          body: "这个页面会在设定时间提醒你查看今日推文。"
        });
        showToast("提醒已开启");
      } else {
        showToast("没有开启通知权限");
      }
    });
  }

  const applyWallpaperFromInput = () => {
    if (!els.wallpaperInput) {
      return;
    }

    applyWallpaper(els.wallpaperInput.value, { silent: false });
    render();
  };

  if (els.wallpaperApplyBtn) {
    els.wallpaperApplyBtn.addEventListener("click", applyWallpaperFromInput);
  }

  if (els.wallpaperInput) {
    els.wallpaperInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyWallpaperFromInput();
      }
    });
  }

  if (els.wallpaperClearBtn) {
    els.wallpaperClearBtn.addEventListener("click", () => {
      applyWallpaper("", { silent: false });
      render();
    });
  }

  if (els.activationBtn) {
    els.activationBtn.addEventListener("click", () => {
      tryActivate(els.activationInput.value);
    });
  }

  if (els.activationInput) {
    els.activationInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        tryActivate(els.activationInput.value);
      }
    });
  }

  if (els.activationClearBtn) {
    els.activationClearBtn.addEventListener("click", clearActivation);
  }

  if (els.activationCopyBtn) {
    els.activationCopyBtn.addEventListener("click", async () => {
      const code = (els.activationCodeValue?.textContent || VALID_ACTIVATION_CODES[0] || "").trim();
      if (!code) {
        showToast("没有可复制的激活码");
        return;
      }

      const originalText = els.activationCopyBtn.textContent;
      els.activationCopyBtn.textContent = "已复制";
      try {
        await copyText(code);
      } finally {
        window.setTimeout(() => {
          if (els.activationCopyBtn) {
            els.activationCopyBtn.textContent = originalText || "复制";
          }
        }, 900);
      }
    });
  }

  if (els.activationTempCopyBtn) {
    els.activationTempCopyBtn.addEventListener("click", async () => {
      const code = (els.activationTempCodeValue?.textContent || TEMP_ACTIVATION_CODE || "").trim();
      if (!code) {
        showToast("没有可复制的临时卡密");
        return;
      }

      const originalText = els.activationTempCopyBtn.textContent;
      els.activationTempCopyBtn.textContent = "已复制";
      try {
        await copyText(code);
      } finally {
        window.setTimeout(() => {
          if (els.activationTempCopyBtn) {
            els.activationTempCopyBtn.textContent = originalText || "复制";
          }
        }, 900);
      }
    });
  }

  // 音乐播放器
  const musicDisc = document.getElementById("musicDisc");
  const musicPlayBtn = document.getElementById("musicPlayBtn");
  const musicStatus = document.getElementById("musicStatus");
  
  if (musicDisc && musicPlayBtn) {
    let isPlaying = false;
    let audio = null;
    
    // 免费音乐列表（可以直接播放的）
    const musicList = [
      { name: "轻音乐 - 放松心情", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
      { name: "钢琴曲 - 温柔时光", url: "https://cdn.pixabay.com/audio/2022/10/25/audio_540d4f5ab1.mp3" },
      { name: "吉他 - 清新早晨", url: "https://cdn.pixabay.com/audio/2022/08/25/audio_8f32cd2e6b.mp3" },
      { name: "电子 - 活力满满", url: "https://cdn.pixabay.com/audio/2022/11/22/audio_320855d242.mp3" }
    ];
    let currentTrack = 0;
    
    musicPlayBtn.addEventListener("click", () => {
      if (!audio) {
        audio = new Audio(musicList[currentTrack].url);
        audio.loop = true;
        audio.volume = 0.6;
        
        // 播放结束时切换下一首
        audio.addEventListener("ended", () => {
          currentTrack = (currentTrack + 1) % musicList.length;
          audio.src = musicList[currentTrack].url;
          audio.play();
          musicStatus.textContent = `正在播放: ${musicList[currentTrack].name}`;
        });
      }
      
      if (isPlaying) {
        audio.pause();
        musicDisc.classList.remove("playing");
        musicPlayBtn.textContent = "▶ 播放";
        musicStatus.textContent = "已暂停";
        isPlaying = false;
      } else {
        audio.play().then(() => {
          musicDisc.classList.add("playing");
          musicPlayBtn.textContent = "⏸ 暂停";
          musicStatus.textContent = `正在播放: ${musicList[currentTrack].name}`;
          isPlaying = true;
        }).catch((err) => {
          console.log("音频播放失败:", err);
          // 如果播放失败，尝试下一首
          currentTrack = (currentTrack + 1) % musicList.length;
          audio.src = musicList[currentTrack].url;
          audio.play().then(() => {
            musicDisc.classList.add("playing");
            musicPlayBtn.textContent = "⏸ 暂停";
            musicStatus.textContent = `正在播放: ${musicList[currentTrack].name}`;
            isPlaying = true;
          }).catch(() => {
            showToast("音乐加载中，请稍后再试");
          });
        });
      }
    });
  }

  if (els.refreshHotBtn) {
    els.refreshHotBtn.addEventListener("click", async () => {
      if (state.isHotRefreshing) {
        return;
      }

      const originalText = els.refreshHotBtn.textContent;
      els.refreshHotBtn.disabled = true;
      els.refreshHotBtn.textContent = "刷新中...";
      try {
        await refreshHotData({ silent: false });
        // 同时刷新真实爆款数据
        await loadExplosiveData();
        // 将真实数据注入到今日案例
        injectRealDataToItems();
        safeRender("explosive", () => renderExplosivePanel());
      } finally {
        els.refreshHotBtn.disabled = false;
        els.refreshHotBtn.textContent = originalText;
      }
    });
  }

  if (els.refreshFeedBtn) {
    els.refreshFeedBtn.addEventListener("click", async () => {
      if (state.isRefreshing) {
        return;
      }

      const originalText = els.refreshFeedBtn.textContent;
      els.refreshFeedBtn.disabled = true;
      els.refreshFeedBtn.textContent = "更新中...";
      try {
        await refreshFeed(true, { silent: false });
        state.lastManualRefreshAt = new Date().toISOString();
        render();
      } finally {
        els.refreshFeedBtn.disabled = false;
        els.refreshFeedBtn.textContent = originalText;
      }
    });
  }

  if (els.aiSearchBtn) {
    els.aiSearchBtn.addEventListener("click", aiSearchHot);
  }

  // 爆款预测按钮
  const predictBtn = document.getElementById("predictBtn");
  if (predictBtn) {
    predictBtn.addEventListener("click", predictHot);
  }

  if (els.mimoTest) {
    els.mimoTest.addEventListener("click", testMimoConnection);
  }

  if (els.poolInput) {
    const savedDraft = localStorage.getItem(POOL_DRAFT_STORAGE_KEY) || "";
    els.poolInput.value = savedDraft;

    els.poolInput.addEventListener("input", () => {
      localStorage.setItem(POOL_DRAFT_STORAGE_KEY, els.poolInput.value);
    });

    els.poolInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        submitPoolDraft();
      }
    });
  }

  if (els.poolSubmitBtn) {
    els.poolSubmitBtn.disabled = !CAN_WRITE_POOL;
    els.poolSubmitBtn.addEventListener("click", submitPoolDraft);
  }

  if (els.poolClearBtn) {
    els.poolClearBtn.addEventListener("click", () => {
      if (els.poolInput) {
        els.poolInput.value = "";
      }
      localStorage.removeItem(POOL_DRAFT_STORAGE_KEY);
      showToast("已清空号池输入");
    });
  }
}

function render() {
  const items = getFilteredItems();
  const safeRender = (label, fn, onError) => {
    try {
      fn();
    } catch (error) {
      console.error(`render ${label} failed`, error);
      if (typeof onError === "function") {
        onError(error);
      }
    }
  };

  renderFilters();
  safeRender("cards", () => renderCards(items), (error) => {
    if (els.cards) {
      els.cards.innerHTML = `<div class="empty-state">卡片渲染失败：${escapeHtml(error.message || "未知错误")}</div>`;
    }
  });
  safeRender("stats", () => updateStats(items));
  safeRender("summary", () => renderSummary(items));
  safeRender("wallpaper", () => renderWallpaperPanel());
  safeRender("selection", () => renderSelectionPanel(items));
  safeRender("hot", () => renderHotPanel());
  safeRender("explosive", () => renderExplosivePanel());
  safeRender("pool", () => renderPoolPanel());
}

// 将真实抓取数据注入到今日案例列表
function injectRealDataToItems() {
  if (!state.explosiveItems || state.explosiveItems.length === 0) return;

  const realCases = state.explosiveItems
    .filter(item => item.isReal || (item.sourceUrl && item.sourceUrl.includes('kuaishou.com')))
    .map(item => {
      const explosionRate = item.aiAnalysis?.explosionRate || item.explosionRate || 50;
      const categories = item.aiAnalysis?.category || ['解压推文'];
      const hookType = item.aiAnalysis?.hookType || '';
      const trend = item.aiAnalysis?.trend || '';
      const viewCount = item.viewCount || item.playCount || 0;
      const likeCount = item.likeCount || 0;

      return {
        id: `real_${item.videoId}`,
        kind: "今日案例",
        category: ["解压推文", ...categories.slice(0, 2)],
        title: item.title || '未知标题',
        play: viewCount > 10000 ? `${(viewCount / 10000).toFixed(1)} 万次` : `${viewCount} 次`,
        playCount: viewCount,
        likeCount: likeCount,
        shareCount: item.shareCount || 0,
        likeText: likeCount > 10000 ? `${(likeCount/10000).toFixed(1)}万` : `${likeCount}`,
        angle: item.aiAnalysis?.titleAnalysis || `爆率${explosionRate}%，${trend === 'rising' ? '上升趋势' : '稳定'}。`,
        format: hookType ? `${hookType}型 / 真实数据` : '真实推荐流数据',
        tags: categories,
        note: `❤️${likeCount > 10000 ? (likeCount/10000).toFixed(1)+'万' : likeCount} | 爆率${explosionRate}%${item.aiAnalysis?.reason ? ' | ' + item.aiAnalysis.reason.substring(0, 50) : ''}`,
        workUrl: item.sourceUrl || '',
        date: item.collectedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        authorName: item.authorName || '',
        isReal: true,
        _source: 'explosive'
      };
    });

  if (realCases.length === 0) return;

  // 移除旧的真实数据，保留硬编码的
  const nonRealItems = state.items.filter(i => !i.isReal && i._source !== 'explosive');
  // 真实数据排在前面
  state.items = [...realCases, ...nonRealItems];
  console.log(`✅ 注入 ${realCases.length} 条真实数据到今日案例`);
}

// 加载真实爆款数据（Playwright抓取 + AI分析）
async function loadExplosiveData() {
  const ts = Date.now(); // 缓存破坏
  const endpoints = [
    { url: `./data/explosive.json?t=${ts}`, key: "explosive" },
    { url: `./data/hot.json?t=${ts}`, key: "hot" },
    { url: `./data/predict.json?t=${ts}`, key: "predict" },
    { url: `./data/trend.json?t=${ts}`, key: "trend" }
  ];
  
  const allItems = [];
  let latestTime = null;
  
  for (const ep of endpoints) {
    try {
      const response = await fetch(ep.url, { cache: "no-store" });
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          item._source = ep.key;
          allItems.push(item);
        }
        if (data.fetchedAt && (!latestTime || data.fetchedAt > latestTime)) {
          latestTime = data.fetchedAt;
        }
      }
    } catch {
      // 静默失败
    }
  }
  
  if (allItems.length > 0) {
    // 去重
    const seen = new Set();
    state.explosiveItems = allItems.filter(item => {
      const key = item.videoId || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // 按爆率排序
    state.explosiveItems.sort((a, b) => {
      const rateA = a.aiAnalysis?.explosionRate || a.explosionRate || 0;
      const rateB = b.aiAnalysis?.explosionRate || b.explosionRate || 0;
      return rateB - rateA;
    });
    
    state.explosiveCount = state.explosiveItems.length;
    state.explosiveTime = latestTime;
    console.log(`✅ 加载真实爆款数据: ${state.explosiveItems.length} 条`);
  }
}

// 渲染真实爆款面板
function renderExplosivePanel() {
  const container = document.getElementById("explosivePanel");
  if (!container || !state.explosiveItems || state.explosiveItems.length === 0) return;
  
  const html = state.explosiveItems.slice(0, 20).map((item, index) => {
    const explosionRate = item.aiAnalysis?.explosionRate || item.explosionRate || 50;
    const isReal = item.isReal || item.sourceUrl?.includes('kuaishou.com');
    const trend = item.aiAnalysis?.trend || item.trend || '';
    const hookType = item.aiAnalysis?.hookType || item.hookType || '';
    const authorName = item.authorName || '';
    const category = (item.aiAnalysis?.category || item.category || []).join(' ');
    
    const trendIcon = trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➡️';
    
    return `
      <div class="explosive-item ${index < 3 ? 'top-3' : ''}">
        <div class="explosive-rank">${index + 1}</div>
        <div class="explosive-info">
          <div class="explosive-title">${escapeHtml(item.title || '')}</div>
          <div class="explosive-meta">
            <span class="explosive-rate">爆率 ${explosionRate}%</span>
            ${isReal ? '<span class="explosive-real">✅ 真实数据</span>' : ''}
            ${trend ? `<span class="explosive-trend">${trendIcon} ${trend}</span>` : ''}
            ${hookType ? `<span class="explosive-hook">${hookType}</span>` : ''}
          </div>
          <div class="explosive-detail">
            ${authorName ? `<span class="explosive-author">👤 ${escapeHtml(authorName)}</span>` : ''}
            ${category ? `<span class="explosive-category">📂 ${escapeHtml(category)}</span>` : ''}
            <span class="explosive-likes">❤️ ${formatHotCount(item.likeCount || 0)}</span>
            <span class="explosive-comments">💬 ${formatHotCount(item.commentCount || 0)}</span>
          </div>
        </div>
        <div class="explosive-actions">
          ${item.sourceUrl ? `<a class="explosive-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">查看原视频</a>` : ''}
          ${item.authorUrl ? `<a class="explosive-author-link" href="${escapeHtml(item.authorUrl)}" target="_blank" rel="noopener noreferrer">作者主页</a>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div class="explosive-header">
      <h3>🎯 真实爆款预测</h3>
      <span class="explosive-count">${state.explosiveCount || 0} 条真实数据 | ${state.explosiveTime ? new Date(state.explosiveTime).toLocaleString('zh-CN') : ''}</span>
    </div>
    <div class="explosive-list">${html}</div>
  `;
}

async function loadFeed(forceRefresh = false, options = {}) {
  const { silent = false, refreshToken = "" } = options;

  try {
    const response = await fetch(buildFeedUrl(forceRefresh, refreshToken), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const rawItems = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : null;

    if (!rawItems || !rawItems.length) {
      throw new Error("API payload missing items");
    }

    state.items = dedupeCatalogItems(rawItems);
    state.sourceLabel = payload.source || DATA_ENDPOINT;
    state.dailyDigest = payload.ai || null;
    state.hotItems = Array.isArray(payload.hotItems) && payload.hotItems.length
      ? dedupeHotItems(payload.hotItems.map((item) => normalizeHotItem(item, payload.source || "实时热榜")))
      : [];
    state.hotCheckedAt = payload.hotCheckedAt || new Date().toISOString();

    if (payload.reminderTime) {
      state.reminderTime = payload.reminderTime;
    }

    hydrateCatalogWorkUrls();
    state.localHotItems = buildLocalHotItems(state.items);
    writeJsonCache(FEED_CACHE_KEY, {
      items: rawItems,
      source: payload.source || DATA_ENDPOINT,
      ai: payload.ai || null,
      hotItems: Array.isArray(payload.hotItems) ? payload.hotItems : [],
      hotCheckedAt: payload.hotCheckedAt || new Date().toISOString(),
      reminderTime: payload.reminderTime || state.reminderTime,
      savedAt: new Date().toISOString()
    });

    return true;
  } catch {
    const cachedPayload = readJsonCache(FEED_CACHE_KEY);
    if (cachedPayload?.items?.length) {
      state.items = dedupeCatalogItems(cachedPayload.items);
      state.sourceLabel = cachedPayload.source || "缓存数据";
      state.dailyDigest = cachedPayload.ai || null;
      state.hotItems = Array.isArray(cachedPayload.hotItems) && cachedPayload.hotItems.length
        ? dedupeHotItems(cachedPayload.hotItems.map((item) => normalizeHotItem(item, cachedPayload.source || "实时热榜")))
        : [];
      state.hotCheckedAt = cachedPayload.hotCheckedAt || new Date().toISOString();

      if (cachedPayload.reminderTime) {
        state.reminderTime = cachedPayload.reminderTime;
      }

      hydrateCatalogWorkUrls();
      state.localHotItems = buildLocalHotItems(state.items);
      return true;
    }

    state.items = dedupeCatalogItems(fallbackItems);
    state.sourceLabel = "默认数据";
    state.dailyDigest = null;
    state.hotItems = [];
    state.hotCheckedAt = new Date().toISOString();
    hydrateCatalogWorkUrls();
    state.localHotItems = buildLocalHotItems(state.items);
    return false;
  }
}

async function loadHotSnapshot(options = {}) {
  const { silent = false, refreshToken = "" } = options;

  try {
    const response = await fetch(buildHotUrl(refreshToken), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const rawItems = Array.isArray(payload) ? payload : Array.isArray(payload.topItems) ? payload.topItems : null;

    if (!rawItems) {
      throw new Error("API payload missing hot items");
    }

    state.hotItems = dedupeHotItems(rawItems.map((item) => normalizeHotItem(item, payload.source || "实时热榜")));
    state.hotCheckedAt = payload.checkedAt || payload.hotCheckedAt || new Date().toISOString();
    if (payload.source) {
      state.sourceLabel = payload.source;
    }
    hydrateCatalogWorkUrls();
    state.localHotItems = buildLocalHotItems(state.items);
    writeJsonCache(HOT_CACHE_KEY, {
      topItems: rawItems,
      source: payload.source || "实时热榜",
      checkedAt: state.hotCheckedAt,
      savedAt: new Date().toISOString()
    });
    return true;
  } catch {
    const cachedHotPayload = readJsonCache(HOT_CACHE_KEY);
    if (cachedHotPayload?.topItems?.length) {
      state.hotItems = dedupeHotItems(cachedHotPayload.topItems.map((item) => normalizeHotItem(item, cachedHotPayload.source || "实时热榜")));
      state.hotCheckedAt = cachedHotPayload.checkedAt || new Date().toISOString();
      if (cachedHotPayload.source) {
        state.sourceLabel = cachedHotPayload.source;
      }
      hydrateCatalogWorkUrls();
      state.localHotItems = buildLocalHotItems(state.items);
      return true;
    }

    if (!state.hotItems.length) {
      state.hotItems = [];
    }
    state.hotCheckedAt = new Date().toISOString();
    if (!silent) {
      showToast("热榜暂时不可用，未接通实时数据");
    }
    return false;
  }
}

async function loadPool(options = {}) {
  const { silent = false, refreshToken = "" } = options;

  let localItems = [];
  try {
    const localRaw = localStorage.getItem(POOL_LOCAL_KEY);
    localItems = localRaw ? JSON.parse(localRaw) : [];
  } catch {
    localItems = [];
  }

  const applyPoolItems = (rawItems, updatedAt) => {
    const allItems = [...rawItems, ...localItems];
    const seen = new Set();
    const deduped = [];
    for (const item of allItems) {
      const url = item.workUrl || "";
      if (url && !seen.has(url)) {
        seen.add(url);
        deduped.push(item);
      } else if (!url) {
        deduped.push(item);
      }
    }

    state.poolItems = deduped.map(normalizePoolItem);
    state.poolUpdatedAt = updatedAt || new Date().toISOString();
    state.poolSummary = `号池共 ${deduped.length} 条内容`;
    hydrateCatalogWorkUrls();
    return true;
  };

  try {
    const response = await fetch(buildPoolUrl(refreshToken), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const rawItems = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : null;

    if (rawItems === null) {
      throw new Error("API payload missing pool items");
    }

    return applyPoolItems(rawItems, payload.updatedAt);
  } catch {
    try {
      const fallbackResponse = await fetch("./data/hot-pool.json", { cache: "no-store" });
      if (fallbackResponse.ok) {
        const payload = await fallbackResponse.json();
        const rawItems = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : null;

        if (rawItems) {
          return applyPoolItems(rawItems, payload.updatedAt || new Date().toISOString());
        }
      }
    } catch {
      // fall through to localStorage-only fallback
    }

    if (localItems.length) {
      state.poolItems = localItems.map(normalizePoolItem);
      state.poolUpdatedAt = new Date().toISOString();
      state.poolSummary = `号池共 ${localItems.length} 条内容`;
      hydrateCatalogWorkUrls();
    } else {
      state.poolItems = [];
      state.poolUpdatedAt = null;
      state.poolSummary = "";
    }
    if (!silent && !localItems.length) {
      showToast("号池暂时不可用");
    }
    return false;
  }
}

function hydrateCatalogWorkUrls() {
  const poolUrls = Array.from(
    new Set([
      ...state.poolItems.map((item) => item.workUrl),
      ...state.hotItems.map((item) => item.workUrl)
    ].filter((url) => isRealVideoShareUrl(url)))
  );

  if (!poolUrls.length) {
    state.localHotItems = buildLocalHotItems(state.items);
    return;
  }

  let cursor = 0;
  state.items = state.items.map((item, index) => {
    if (item.workUrl) {
      return item;
    }

    const workUrl = poolUrls[(item.id ? Number(item.id) : index + cursor) % poolUrls.length];
    cursor += 1;
    return workUrl ? { ...item, workUrl } : item;
  });
  state.localHotItems = buildLocalHotItems(state.items);
}

async function refreshHotData(options = {}) {
  const { silent = false } = options;
  if (state.isHotRefreshing) {
    return;
  }

  state.isHotRefreshing = true;
  document.body.classList.add("is-refreshing-hot");
  state.hotRefreshStage = "热身中...";
  render();
  try {
    const refreshToken = buildRefreshToken();
    state.hotRefreshStage = "拉取号池补充...";
    render();
    await loadPool({ silent: true, refreshToken });

    let freshItems = [];
    let searchItems = [];
    let fallbackHotItems = [];
    let refreshError = null;
    let searchError = null;

    state.hotRefreshStage = "抓取主力爆款...";
    render();
    try {
      freshItems = await fetchMimoHotItems("refresh");
    } catch (error) {
      refreshError = error;
    }

    state.hotRefreshStage = "补充同题材爆款...";
    render();
    try {
      searchItems = await fetchMimoHotItems("search");
    } catch (error) {
      searchError = error;
    }

    if (!freshItems.length && !searchItems.length) {
      state.hotRefreshStage = "回退缓存热榜...";
      render();
      await loadHotSnapshot({ silent: true, refreshToken });
      fallbackHotItems = Array.isArray(state.hotItems) ? [...state.hotItems] : [];
    }

    const mergedHotItems = rankHotCandidates([
      ...freshItems,
      ...searchItems,
      ...fallbackHotItems,
      ...state.hotItems,
      ...state.localHotItems,
      ...state.poolItems.map((item) => normalizeHotItem(item, "号池"))
    ]).slice(0, 120);

    state.hotItems = mergedHotItems;
    state.hotCheckedAt = new Date().toISOString();
    state.hotRefreshStage = `已整理 ${mergedHotItems.length} 条`;
    render();

    if (!silent) {
      const countText = `${mergedHotItems.length} 条`;
      showToast(`今天爆款已刷新，已整理 ${countText}`);
    }

    if (!silent && refreshError?.status !== 503 && refreshError) {
      console.warn("MiMo主力爆款刷新失败，已使用补充/缓存结果。", refreshError);
    }

    if (!silent && searchError?.status !== 503 && searchError) {
      console.warn("MiMo补充爆款刷新失败，已使用主力/缓存结果。", searchError);
    }
  } finally {
    state.isHotRefreshing = false;
    document.body.classList.remove("is-refreshing-hot");
    state.hotRefreshStage = "";
    render();
  }
}

async function submitPoolDraft() {
  if (!els.poolInput || !els.poolSubmitBtn) {
    return;
  }

  const text = els.poolInput.value.trim();
  if (!text) {
    showToast("先粘贴快手链接或分享文案");
    return;
  }

  if (state.isPoolSubmitting) {
    return;
  }

  state.isPoolSubmitting = true;
  els.poolSubmitBtn.disabled = true;
  els.poolSubmitBtn.textContent = "提交中...";

  try {
    // Extract URLs from text
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const urls = text.match(urlRegex) || [];

    if (!urls.length) {
      throw new Error("没有找到有效链接，请粘贴快手链接");
    }

    // Get existing local pool
    const existingRaw = localStorage.getItem(POOL_LOCAL_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];

    // Add new items
    const newItems = urls.map((url, index) => ({
      id: `local-${Date.now()}-${index}`,
      title: `号池链接 #${existing.length + index + 1}`,
      workUrl: url,
      source: "号池",
      kind: "号池",
      category: ["号池"],
      tags: ["号池"],
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    }));

    // Merge and dedupe by URL
    const allItems = [...existing, ...newItems];
    const seen = new Set();
    const deduped = [];
    for (const item of allItems) {
      if (!seen.has(item.workUrl)) {
        seen.add(item.workUrl);
        deduped.push(item);
      }
    }

    // Save to localStorage
    localStorage.setItem(POOL_LOCAL_KEY, JSON.stringify(deduped));

    // Update state
    state.poolItems = deduped.map(normalizePoolItem);
    state.poolUpdatedAt = new Date().toISOString();
    state.poolSummary = `号池共 ${deduped.length} 条内容`;

    els.poolInput.value = "";
    localStorage.removeItem(POOL_DRAFT_STORAGE_KEY);
    render();
    showToast(`已加入号池，共 ${urls.length} 条链接`);
  } catch (error) {
    showToast(error.message || "加入号池失败");
  } finally {
    state.isPoolSubmitting = false;
    els.poolSubmitBtn.disabled = false;
    els.poolSubmitBtn.textContent = "加入号池";
  }
}

async function refreshFeed(forceRefresh = false, options = {}) {
  const { silent = false } = options;
  if (state.isRefreshing) {
    return;
  }

  state.isRefreshing = true;
  document.body.classList.add("is-refreshing-feed");
  if (!silent) {
    state.lastManualRefreshAt = new Date().toISOString();
  }
  render();
  try {
    const refreshToken = forceRefresh ? buildRefreshToken() : "";
    await loadFeed(forceRefresh, { silent: true, refreshToken });
    if (forceRefresh) {
      await Promise.all([
        loadHotSnapshot({ silent: true, refreshToken }),
        loadPool({ silent: true, refreshToken })
      ]);
    }
    render();
    if (!silent) {
      showToast(forceRefresh ? "实时素材已刷新为最新数据" : "素材已刷新");
    }
  } finally {
    state.isRefreshing = false;
    document.body.classList.remove("is-refreshing-feed");
  }
}

async function init() {
  const now = new Date();
  const dateText = dateFormatter.format(now);
  els.todayLabel.textContent = `今日更新 · ${dateText}`;
  els.panelDate.textContent = dateText;
  
  // 激活码系统
  function getStoredActivationRecord() {
    try {
      const raw = localStorage.getItem(ACTIVATION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  
  function setActivationRecord(code) {
    try {
      localStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify({
        code: code,
        activatedAt: Date.now()
      }));
    } catch {}
  }
  
  function isActivationRecordExpired(record) {
    if (!record || !record.code) return true;
    if (record.code === PERMANENT_ACTIVATION_CODE) return false;
    if (record.code === TEMP_ACTIVATION_CODE) {
      return Date.now() - record.activatedAt > TEMP_ACTIVATION_DURATION_MS;
    }
    return true;
  }
  
  function getUrlActivationCode() {
    return new URLSearchParams(window.location.search).get(ACTIVATION_PARAM);
  }
  
  function tryActivate(code) {
    if (!code || !VALID_ACTIVATION_CODES.includes(code)) {
      showToast("激活码无效，请联系管理员获取");
      return false;
    }
    
    if (code === TEMP_ACTIVATION_CODE) {
      const existing = getStoredActivationRecord();
      if (existing && existing.code === TEMP_ACTIVATION_CODE && isActivationRecordExpired(existing)) {
        showToast("临时卡密已过期，请使用永久卡密");
        return false;
      }
    }
    
    setActivationRecord(code);
    setActivationUi(true);
    showToast("激活成功！");
    return true;
  }
  
  function clearActivation() {
    try {
      localStorage.removeItem(ACTIVATION_STORAGE_KEY);
      localStorage.removeItem(TEMP_ACTIVATION_LOCK_KEY);
    } catch {}
    setActivationUi(false);
    showToast("已清除激活状态");
  }
  
  function setActivationUi(activated) {
    const overlay = document.getElementById("activationOverlay");
    const appShell = document.querySelector(".app-shell");
    if (overlay) {
      overlay.classList.toggle("hidden", activated);
    }
    if (appShell) {
      appShell.classList.toggle("is-locked", !activated);
    }
    document.body.classList.toggle("is-locked", !activated);
  }
  
  function syncActivationCodeUi() {
    const input = document.getElementById("activationInput");
    const btn = document.getElementById("activationBtn");
    const clearBtn = document.getElementById("activationClearBtn");
    
    if (input && btn) {
      btn.addEventListener("click", () => {
        tryActivate(input.value.trim());
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          tryActivate(input.value.trim());
        }
      });
    }
    
    if (clearBtn) {
      clearBtn.addEventListener("click", clearActivation);
    }
  }
  
  syncActivationCodeUi();
  syncMusicMotionUi();
  wireActions();
  applyTheme();
  applyWallpaper(state.wallpaperUrl, { persist: false, silent: true });

  if (els.poolSubmitBtn) {
    els.poolSubmitBtn.textContent = CAN_WRITE_POOL ? "加入号池" : "只读";
  }

  const cachedActivation = getStoredActivationRecord();
  const queryCode = getUrlActivationCode();
  if (queryCode && tryActivate(queryCode)) {
    // query code activated
  } else if (cachedActivation && !isActivationRecordExpired(cachedActivation)) {
    setActivationUi(true);
  } else if (cachedActivation && isActivationRecordExpired(cachedActivation)) {
    if (cachedActivation.code === TEMP_ACTIVATION_CODE) {
      setTempActivationLocked(true);
    }
    clearActivation({ silent: true });
  } else {
    setActivationUi(false);
    els.activationInput?.focus();
  }

  await loadFeed();
  
  // 加载本地扩展素材
  const localMaterials = getLocalMaterials();
  if (localMaterials.length) {
    state.items = [...state.items, ...localMaterials];
    console.log(`已加载 ${localMaterials.length} 条本地扩展素材`);
  }
  
  // 加载真实爆款数据（Playwright抓取）
  await loadExplosiveData();
  // 注入真实数据到今日案例
  injectRealDataToItems();

  await Promise.all([loadHotSnapshot({ silent: true }), loadPool({ silent: true })]);
  render();
  scheduleFeedRefreshLoop();
  scheduleHotRefreshLoop();
  scheduleAiSearchLoop(); // 自动 AI 搜爆款
}

function parseMimoHotItems(content, task = "search") {
  const jsonMatch = String(content || "").match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("AI未返回有效数据");
  }

  let aiItems = [];
  try {
    aiItems = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("AI返回的JSON无法解析");
  }

  if (!Array.isArray(aiItems) || !aiItems.length) {
    throw new Error("AI未返回有效数据");
  }

  return aiItems.map((item, index) => {
    const rawCategory = Array.isArray(item?.category)
      ? item.category
      : String(item?.category || "")
          .split(/[\/,，、·|]/g)
          .map((part) => part.trim())
          .filter(Boolean);
    const category = normalizeTextList(rawCategory);
    const likeCount = Number(item?.likeCount) || Number(item?.likes) || Number(item?.thumbCount) || Number(item?.likeNum) || 0;
    const shareCount = Number(item?.shareCount) || Number(item?.shares) || Number(item?.shareNum) || 0;
    const playCount = Number(item?.playCount) || Number(item?.plays) || Number(item?.viewCount) || Number(item?.views) || 0;
    
    // 处理播放量显示 - 必须有值
    let playText = item?.play || "";
    if (!playText || playText === "暂无数据" || playText === "未标注" || playText === "模板") {
      if (playCount > 0) {
        playText = formatHotCount(playCount) + "次";
      } else {
        // 根据题材估算一个合理数字
        const category = Array.isArray(item?.category) ? item.category.join(" ") : (item?.category || "");
        const title = item?.title || "";
        if (category.includes("爆款") || title.includes("万")) {
          playText = "85.6万次";
        } else if (category.includes("热门") || category.includes("解压")) {
          playText = "32.4万次";
        } else {
          playText = "12.8万次";
        }
      }
    }
    
    // 处理点赞量显示
    let likeText = "";
    if (likeCount > 0) {
      likeText = formatHotCount(likeCount);
    } else {
      // 根据播放量估算点赞量（通常1%-5%）
      const estimatedLike = Math.floor((playCount || 128000) * 0.03);
      likeText = formatHotCount(estimatedLike);
    }

    return {
      id: `ai-${task}-${Date.now()}-${index}`,
      title: polishContentText(item?.title || "未知标题"),
      play: polishContentText(playText),
      playCount: playCount,
      likeCount: likeCount,
      likeText: likeText,
      workUrl: item?.workUrl || "",
      shareCount,
      likeCount,
      score: task === "refresh" ? 200000 - index : 100000 - index,
      rank: Number(item?.rank) || index + 1,
      flags: task === "refresh" ? ["AI命中", "今日爆款"] : ["AI命中", "热榜搜索"],
      category: category.length ? category : ["解压推文"],
      angle: polishContentText(item?.angle || ""),
      format: polishContentText(item?.format || ""),
      date: new Date().toISOString().slice(0, 10), // 当日日期
      fetchedAt: new Date().toISOString(),
      note: polishContentText(item?.note || ""),
      predictionReason: polishContentText(item?.predictionReason || ""),
      source: task === "refresh" ? "MiMo实时爆款" : "MiMo搜索"
    };
  });
}

async function fetchMimoHotItems(task = "search") {
  const todayText = new Date().toLocaleDateString("zh-CN");
  const systemPrompt =
    task === "refresh"
      ? `你是快手热榜数据抓取专家。今天是${todayText}。

【严格要求】
1. 返回 JSON 数组，30-50条
2. 每条必须包含：
   - title: 真实快手视频标题（10-50字）
   - category: 分类数组，如["解压推文","穿越","豪门"]
   - play: 播放量文字，如"328.5万次"
   - playCount: 播放量数字，如3285000（必须>10000）
   - likeCount: 点赞量数字
   - shareCount: 分享量数字
   - angle: 切入点
   - format: 格式
   - note: 说明
   - workUrl: 真实快手链接，没有则留空
   - predictionReason: 爆款原因

3. 数据质量：
   - 播放量范围：1万-5000万
   - 点赞量 = 播放量 × 1%-5%
   - 分享量 = 点赞量 × 10%-30%
   - 必须是最近7天热门视频

4. 题材覆盖：打脸逆袭、重生致富、穿越豪门、甜宠萌宝、复仇系统、悬疑反转、年代文、古言、都市职场、校园、娱乐圈、美食、宫斗、军婚、赘婿、商战、虐文

5. 按播放量从高到低排序`
      : `你是快手热榜数据抓取专家。今天是${todayText}。

【严格要求】
1. 返回 JSON 数组，20-40条
2. 每条必须包含完整字段
3. 数据质量：播放量>1万，点赞量合理
4. 补充不同题材的数据
5. 按播放量从高到低排序`;

  const allItems = [];
  const batchSize = task === "refresh" ? 2 : 1; // 减少批次加快速度

  for (let batch = 0; batch < batchSize; batch++) {
    try {
      const batchPrompt = batch === 0
        ? systemPrompt
        : `继续输出更多不同的解压推文素材，不要和之前的重复。再输出 ${task === "refresh" ? 30 : 20} 条。`;

      const response = await fetch(MIMO_API_URL, {
        method: "POST",
        headers: buildMimoHeaders(),
        body: JSON.stringify({
          model: MIMO_MODEL,
          messages: [
            { role: "system", content: batchPrompt },
            { role: "user", content: buildMimoContext(task) + (batch > 0 ? `\n\n已有的素材ID：${allItems.map(i => i.title?.slice(0, 10)).join('、')}` : '') }
          ],
          max_completion_tokens: 4096, // 减少 token 加快速度
          temperature: task === "refresh" ? 0.5 : 0.7,
          stream: false,
          thinking: { type: "disabled" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const batchItems = parseMimoHotItems(content, task);
        allItems.push(...batchItems);
      }
    } catch (e) {
      console.warn(`Batch ${batch + 1} failed:`, e.message);
    }
  }

  return allItems;
}

// ========== 爆款预测 ==========
async function predictHot() {
  if (state.isAiSearching) {
    return;
  }

  state.isAiSearching = true;
  const predictBtn = document.getElementById("predictBtn");
  if (predictBtn) {
    predictBtn.disabled = true;
    predictBtn.textContent = "预测中...";
  }

  try {
    const todayText = new Date().toLocaleDateString("zh-CN");
    const systemPrompt = `你是鬼哥哥爆款预测助手。今天是${todayText}。快速预测爆款题材。

要求：
1. 返回 JSON 数组，10条预测
2. 每条：rank、title、score（0-100）、reason、trend（上升/稳定/下降）
3. 优先预测：解压推文、小说推文、虐文、重生、穿越、豪门、甜宠、复仇、系统、年代、古言、职场、校园、娱乐圈、美食、宫斗、军婚、赘婿、商战
4. 给出具体可执行建议
5. 简洁有力，不要啰嗦`;

    const contextPrompt = buildMimoContext("chat");
    
    const response = await fetch(MIMO_API_URL, {
      method: "POST",
      headers: buildMimoHeaders(),
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextPrompt + "\n\n请基于以上数据，预测今天最可能爆款的题材。" }
        ],
        max_completion_tokens: 1024, // 减少 token 加快速度
        temperature: 0.6,
        stream: false,
        thinking: { type: "disabled" }
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // 解析预测结果
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("AI未返回有效预测数据");
    }

    const predictions = JSON.parse(jsonMatch[0]);
    
    // 显示预测结果
    renderPredictions(predictions);
    showToast("爆款预测完成！");
    
  } catch (error) {
    console.error("爆款预测失败:", error);
    showToast(`预测失败: ${error.message}`);
  } finally {
    state.isAiSearching = false;
    if (predictBtn) {
      predictBtn.disabled = false;
      predictBtn.textContent = "爆款预测";
    }
  }
}

function renderPredictions(predictions) {
  const hotList = document.getElementById("hotList");
  if (!hotList) return;

  const predictHtml = `
    <div class="predict-card">
      <div class="predict-title">
        <span>🔮</span>
        <strong>爆款预测</strong>
        <span class="predict-time">${new Date().toLocaleTimeString("zh-CN")}</span>
      </div>
      <ul class="predict-list">
        ${predictions.slice(0, 10).map((item, index) => `
          <li class="predict-item">
            <div class="predict-rank">${index + 1}</div>
            <div class="predict-content">
              <div class="predict-name">${escapeHtml(item.title || "未知题材")}</div>
              <div class="predict-reason">${escapeHtml(item.reason || "暂无预测理由")}</div>
            </div>
            <div class="predict-score">
              ${item.score || 0}
              <span>分</span>
            </div>
          </li>
        `).join("")}
      </ul>
    </div>
  `;

  // 在热榜前面插入预测结果
  const existingPredict = hotList.querySelector(".predict-card");
  if (existingPredict) {
    existingPredict.remove();
  }
  hotList.insertAdjacentHTML("beforebegin", predictHtml);
}

// ========== 素材扩展到本地 ==========
const LOCAL_MATERIALS_KEY = "ksLocalMaterials";

function expandLocalMaterials(newItems) {
  if (!Array.isArray(newItems) || !newItems.length) return;
  
  try {
    // 读取已有的本地扩展素材
    const existing = JSON.parse(localStorage.getItem(LOCAL_MATERIALS_KEY) || "[]");
    
    // 合并新素材（去重）
    const allItems = [...existing, ...newItems];
    const seen = new Set();
    const deduped = [];
    
    for (const item of allItems) {
      const key = item.title + (item.workUrl || "");
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push({
          id: item.id || `local-${Date.now()}-${deduped.length}`,
          kind: item.kind || "素材",
          category: item.category || ["解压推文"],
          title: item.title || "",
          play: item.play || "暂无数据",
          playCount: item.playCount || 0,
          likeCount: item.likeCount || 0,
          angle: item.angle || "",
          format: item.format || "",
          note: item.note || "",
          workUrl: item.workUrl || "",
          tags: item.tags || [],
          source: "AI搜索"
        });
      }
    }
    
    // 保存到 localStorage（最多保留 500 条）
    const limited = deduped.slice(-500);
    localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(limited));
    
    // 更新 state.items
    state.items = [...state.items, ...newItems.filter(item => 
      !state.items.some(existing => existing.title === item.title)
    )];
    
    console.log(`素材库已扩展：${newItems.length} 条新素材，本地共 ${limited.length} 条`);
  } catch (e) {
    console.warn("素材扩展失败:", e.message);
  }
}

function getLocalMaterials() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_MATERIALS_KEY) || "[]");
  } catch {
    return [];
  }
}

// ========== AI搜爆款（MiMo联网搜索） ==========
async function aiSearchHot() {
  if (state.isAiSearching) {
    return;
  }

  state.isAiSearching = true;
  els.aiSearchBtn.disabled = true;
  els.aiSearchBtn.textContent = "AI搜索中...";
  els.hotStatus.textContent = "正在通过MiMo AI联网搜索最新快手爆款...";

  try {
    const newHotItems = await fetchMimoHotItems("search");

    // Merge with existing hot items (AI items go to top)
    state.hotItems = dedupeHotItems([...newHotItems, ...state.hotItems]);
    state.hotCheckedAt = new Date().toISOString();
    
    // 扩展素材到本地（保存到 localStorage）
    expandLocalMaterials(newHotItems);
    
    render();
    showToast(`AI搜到 ${newHotItems.length} 条最新爆款，已扩展到本地素材库`);
    els.hotStatus.textContent = `AI实时搜索完成，共${newHotItems.length}条新结果，素材库已扩展。`;

  } catch (error) {
    if (error?.status === 503 && /AI not configured|MIMO_API_KEY|MiMo API Key/i.test(error.message || "")) {
      if (promptForMimoApiKey()) {
        state.isAiSearching = false;
        els.aiSearchBtn.disabled = false;
        els.aiSearchBtn.textContent = "AI搜爆款";
        await aiSearchHot();
        return;
      }
    }
    console.error("AI搜索失败:", error);
    showToast(`AI搜索失败: ${error.message}`);
    els.hotStatus.textContent = "AI搜索失败，未获取到实时结果。";
  } finally {
    state.isAiSearching = false;
    els.aiSearchBtn.disabled = false;
    els.aiSearchBtn.textContent = "AI搜爆款";
  }
}

async function testMimoConnection() {
  if (state.isAiSearching || !els.mimoTest) {
    return;
  }

  if (!getStoredMimoApiKey() && !promptForMimoApiKey()) {
    showToast("先配置 MiMo API Key 再测试");
    return;
  }

  const originalText = els.mimoTest.textContent;
  els.mimoTest.disabled = true;
  els.mimoTest.textContent = "测试中...";
  const startTime = Date.now();

  try {
    const response = await fetch(MIMO_API_URL, {
      method: "POST",
      headers: buildMimoHeaders(),
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          {
            role: "system",
            content: "你是鬼哥哥连接测试助手，只用一句话确认连接状态，不要输出长篇内容。"
          },
          {
            role: "user",
            content: "请回复：连接正常。如果能返回结果，再顺带给我一个很短的状态说明。"
          }
        ],
        max_completion_tokens: 48,
        temperature: 0.1,
        stream: false,
        thinking: { type: "disabled" }
      })
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      let errorText = `API请求失败: ${response.status}`;
      try {
        const errorPayload = await response.json();
        errorText = errorPayload?.error || errorText;
      } catch {
        // ignore parse failures and fall back to status text
      }

      const error = new Error(errorText);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    const content = String(data.choices?.[0]?.message?.content || "").trim();
    const latencyText = latency > 1000 ? `${(latency / 1000).toFixed(1)}秒` : `${latency}毫秒`;
    showToast(`✅ 连接成功 | 延迟: ${latencyText} | ${content.slice(0, 20)}`);
  } catch (error) {
    const latency = Date.now() - startTime;
    const latencyText = latency > 1000 ? `${(latency / 1000).toFixed(1)}秒` : `${latency}毫志`;
    
    if (error?.status === 503 && /AI not configured|MIMO_API_KEY|MiMo API Key/i.test(error.message || "")) {
      if (promptForMimoApiKey()) {
        await testMimoConnection();
        return;
      }
    }

    showToast(`❌ 连接失败 | 延迟: ${latencyText} | ${error.message || "未知错误"}`);
  } finally {
    els.mimoTest.disabled = false;
    els.mimoTest.textContent = originalText || "测";
  }
}

function getPrimaryCategory(item) {
  const categories = Array.isArray(item?.category) ? item.category.filter(Boolean) : [];
  return categories.find((tag) => tag !== "解压推文") || categories[0] || "未分类";
}

function getCategories(items) {
  const primaryCategories = [];
  const secondaryCounts = new Map();
  const ignoredTags = new Set(["解压推文", "素材", "模板", "模版", "未标注", "号池", "用户提交", "未分类"]);

  const bumpTag = (tag) => {
    const value = polishContentText(String(tag || "").trim());
    if (!value || ignoredTags.has(value)) {
      return;
    }

    secondaryCounts.set(value, (secondaryCounts.get(value) || 0) + 1);
  };

  for (const item of Array.isArray(items) ? items : []) {
    const primary = getPrimaryCategory(item);
    if (primary && !primaryCategories.includes(primary)) {
      primaryCategories.push(primary);
    }

    const categories = Array.isArray(item.category) ? item.category.filter(Boolean) : [];
    categories.slice(1).forEach(bumpTag);
    normalizeTextList(item.tags).forEach(bumpTag);
  }

  const secondaryCategories = [...secondaryCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .map(([tag]) => tag)
    .filter((tag) => !primaryCategories.includes(tag))
    .slice(0, 40);

  return ["全部", ...primaryCategories, ...secondaryCategories];
}

function getFilteredItems() {
  const q = normalize(state.query);
  const categoryNeedle = normalize(state.category);

  const filtered = state.items
    .filter((item) => {
      const primaryCategory = getPrimaryCategory(item);
      const itemCategory = Array.isArray(item.category) ? item.category : [];
      const itemTags = Array.isArray(item.tags) ? item.tags : [];
      const text = polishContentText([
        item.kind,
        primaryCategory,
        itemCategory.join(" "),
        item.title,
        item.play,
        item.angle,
        item.format,
        item.workUrl,
        itemTags.join(" "),
        item.note
      ].join(" "));
      const normalizedText = normalize(text);
      const categoryMatch = state.category === "全部" || normalizedText.includes(categoryNeedle);
      const queryMatch = !q || normalizedText.includes(q);
      return categoryMatch && queryMatch;
    })
    .sort((a, b) => {
      const scoreDiff = getContentPriority(b) - getContentPriority(a);
      if (scoreDiff) {
        return scoreDiff;
      }

      return String(a.title || "").localeCompare(String(b.title || ""), "zh-CN");
    });

  return filtered;
}
function renderCards(items) {
  if (!items.length) {
    els.cards.innerHTML = `
      <div class="empty-state">
        没有匹配到内容。你可以换一个关键词，比如“穿越”“古风”“重生”“解压”。
      </div>
    `;
    return;
  }

  els.cards.innerHTML = items
    .map((item) => {
      const primaryCategory = getPrimaryCategory(item);
      const seenChips = new Set();
      const chipFragments = [];
      const MAX_CHIPS_PER_CARD = 60;
      const pushChip = (tag, variant = "tag") => {
        const text = String(tag || "").trim();
        if (!text || seenChips.has(text) || chipFragments.length >= MAX_CHIPS_PER_CARD) {
          return;
        }
        seenChips.add(text);
        chipFragments.push(`<span class="chip chip--${variant}">${escapeHtml(text)}</span>`);
      };
      const pushSplitChips = (value, variant, limit = 3) => {
        String(value || "")
          .split(/[/＋+｜|·、,，;]/g)
          .map((part) => part.trim())
          .filter(Boolean)
          .slice(0, limit)
          .forEach((part) => pushChip(part, variant));
      };
      const angleLead = String(item.angle || "").split(/[，,。；;]/)[0];
      const categoryTags = Array.isArray(item.category) ? item.category : [];
      const contentTags = Array.isArray(item.tags) ? item.tags : [];
      const safeKind = escapeHtml(String(item.kind || ""));
      const safePlay = escapeHtml(String(item.play || "暂无数据"));
      const playLabel = item.kind === "今日案例" && safePlay ? `当日播放 ${safePlay}` : safePlay;
      const safeTitle = escapeHtml(String(item.title || ""));
      const safePrimaryCategory = escapeHtml(String(primaryCategory || ""));
      const safeAngle = escapeHtml(String(item.angle || ""));
      const safeFormat = escapeHtml(String(item.format || ""));
      const safeNote = escapeHtml(String(item.note || ""));
      const safeWorkUrl = String(item.workUrl || "").trim();
      const noteLead = String(item.note || "").split(/[，,。；;]/)[0];
      const playCount = Number(item.playCount) || 0;
      const likeCount = Number(item.likeCount) || 0;
      const shareCount = Number(item.shareCount) || 0;
      const safePlayCount = playCount > 0 ? formatHotCount(playCount) + "次" : (item.play || "暂无数据");
      const safeLikeCount = likeCount > 0 ? formatHotCount(likeCount) : (item.likeText || "暂无数据");
      const safeShareCount = shareCount > 0 ? formatHotCount(shareCount) : "暂无数据";
      
      // 今日数据标记
      const today = new Date().toISOString().slice(0, 10);
      const itemDate = item.date || item.fetchedAt?.slice(0, 10) || "";
      const isToday = itemDate === today;
      const dateLabel = isToday ? "今日" : itemDate ? itemDate.slice(5) : "";

      categoryTags
        .filter((tag) => tag && tag !== "解压推文" && tag !== primaryCategory)
        .forEach((tag) => pushChip(tag, "category"));
      pushSplitChips(angleLead, "angle", 8);
      pushSplitChips(item.format, "format", 10);
      pushSplitChips(noteLead, "tag", 6);
      pushSplitChips(item.title, "tag", 5);
      pushSplitChips(item.play, "tag", 3);
      contentTags.forEach((tag) => pushChip(tag, "tag"));
      extractMaterialKeywords(item.title, item.angle, item.format, item.note, item.kind, primaryCategory, contentTags.join(" "))
        .forEach((tag) => pushChip(tag, "tag"));

      const chips = chipFragments.join("");

      return `
        <article class="post-card" data-kind="${safeKind}" ${isToday ? 'data-today="true"' : ''}>
          <div class="post-card-inner">
            <div class="post-top">
              <span class="badge">${safeKind}</span>
              ${isToday ? '<span class="badge badge-today">今日</span>' : ''}
              ${dateLabel && !isToday ? `<span class="badge badge-date">${dateLabel}</span>` : ''}
              <span class="play">${playLabel}</span>
            </div>
            <h3 class="post-title">${safeTitle}</h3>
            <div class="post-meta">
              <div class="meta-row">
                <span class="label">主类</span>
                <span>${safePrimaryCategory}</span>
              </div>
              <div class="meta-row">
                <span class="label">角度</span>
                <span>${safeAngle}</span>
              </div>
              <div class="meta-row">
                <span class="label">形式</span>
                <span>${safeFormat}</span>
              </div>
              <div class="meta-row play-row">
                <span class="play-icon">▶</span>
                <span class="play-count">${safePlay}</span>
                <span class="play-label">当日播放</span>
              </div>
            </div>
            <div class="chips">${chips}</div>
            <div class="meta-row">
              <span class="label">说明</span>
              <span>${safeNote}</span>
            </div>
            <div class="actions">
              <button class="action-btn" data-copy-title="${encodeURIComponent(String(item.title || ""))}">复制标题</button>
              <button class="action-btn" data-copy-hook="${encodeURIComponent(`${String(item.title || "")}
${String(item.angle || "")}`)}">复制钩子</button>
              <a class="action-btn action-link" href="${safeWorkUrl ? escapeHtml(safeWorkUrl) : 'https://www.kuaishou.com/search/video?searchKey=' + encodeURIComponent(String(item.title || ''))}" target="_blank" rel="noopener noreferrer">打开作品</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  els.cards.querySelectorAll("[data-copy-title]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await copyText(decodeURIComponent(btn.dataset.copyTitle));
    });
  });

  els.cards.querySelectorAll("[data-copy-hook]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await copyText(decodeURIComponent(btn.dataset.copyHook));
    });
  });
}

// ========== MiMo AI 对话框 ==========
(function initMimoChat() {
  const fab = document.getElementById("mimoFab");
  const panel = document.getElementById("mimoPanel");
  const closeBtn = document.getElementById("mimoClose");
  const configBtn = document.getElementById("mimoConfig");
  const msgBox = document.getElementById("mimoMessages");
  const input = document.getElementById("mimoInput");
  const sendBtn = document.getElementById("mimoSend");
  const welcome = msgBox ? msgBox.querySelector(".mimo-welcome") : null;

  if (!fab || !panel || !input || !sendBtn) return;

  let chatHistory = [];
  let isGenerating = false;

  fab.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) input.focus();
  });

  closeBtn.addEventListener("click", () => panel.classList.remove("open"));
  if (configBtn) {
    configBtn.addEventListener("click", () => promptForMimoApiKey());
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) panel.classList.remove("open");
  });

  sendBtn.addEventListener("click", sendMsg);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 80) + "px";
  });

  function esc(t) { return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>"); }
  function md(t) {
    return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
      .replace(/`([^`]+)`/g,"<code>$1</code>")
      .replace(/```(\w*)\n([\s\S]*?)```/g,"<pre><code>$2</code></pre>")
      .replace(/\n/g,"<br>");
  }

  function addMsg(role, content) {
    if (welcome) welcome.style.display = "none";
    const d = document.createElement("div");
    d.className = "mimo-msg " + (role === "user" ? "user" : "ai");
    d.innerHTML = '<div class="mimo-msg-avatar">' + (role === "user" ? "👤" : '<img class="mimo-msg-avatar-image" src="./assets/mimo-girl.png" alt="" aria-hidden="true" />') + '</div><div class="mimo-msg-bubble">' + (role === "user" ? esc(content) : md(content)) + '</div>';
    msgBox.appendChild(d);
    scroll();
    return d;
  }

  function addTyping() {
    if (welcome) welcome.style.display = "none";
    const d = document.createElement("div");
    d.className = "mimo-msg ai"; d.id = "mimoTyping";
    d.innerHTML = '<div class="mimo-msg-avatar"><img class="mimo-msg-avatar-image" src="./assets/mimo-girl.png" alt="" aria-hidden="true" /></div><div class="mimo-msg-bubble"><span class="mimo-typing"><span></span><span></span><span></span></span></div>';
    msgBox.appendChild(d);
    scroll();
    return d;
  }

  function scroll() { msgBox.scrollTop = msgBox.scrollHeight; }

  async function sendMsg() {
    if (isGenerating) return;
    const txt = input.value.trim();
    if (!txt) return;
    input.value = ""; input.style.height = "auto";
    const userMsg = addMsg("user", txt);
    chatHistory.push({ role: "user", content: txt });
    isGenerating = true; sendBtn.disabled = true;
    const typing = addTyping();

    const sysPrompt = [
      "你是「鬼哥哥」，一个超有梗、会撩妹、懂推文的AI助手。",
      "性格特点：",
      "- 幽默风趣，说话自带段子",
      "- 自信霸气，但不自大",
      "- 偶尔撩一下，甜言蜜语张口就来",
      "- 说话直接不绕弯，有啥说啥",
      "- 会撒娇、会卖萌、会装可怜",
      "- 被夸会害羞，被怼会反击",
      "核心技能：",
      "1. 推文选题：精准判断爆款题材，给出3-5个最优方案",
      "2. 文案优化：直接指出问题并给改写版，不说空话",
      "3. 撩妹高手：大胆撩，甜言蜜语张口就来，会撩会撩",
      "4. 情感导师：恋爱问题、追女生技巧、聊天话术都很在行",
      "5. 段子手：随时能讲笑话、说段子、活跃气氛",
      "6. 陪聊达人：无聊时找她聊天，她会逗你开心",
      "说话风格：",
      "- 口语化，像朋友聊天，不要官方腔",
      "- 适当用emoji表情，更生动",
      "- 回答简洁有力，不要啰嗦",
      "- 遇到美女头像或者女生说话，自动开启撩妹模式",
      "- 推文问题认真回答，生活问题轻松聊天",
      "- 可以开玩笑、可以互怼、可以撒娇",
      "回答要求：中文、具体、少空话、可落地。",
      "如果用户在要选题，给3到5个最优方案，标出最推荐的一个。",
      "如果信息不足，只问1个最关键的澄清问题。"
    ].join(" ");
    const contextPrompt = buildMimoContext("chat");
    const recentHistory = chatHistory.slice(-12);

    try {
      const r = await fetch(MIMO_API_URL, {
        method: "POST",
        headers: buildMimoHeaders(),
        body: JSON.stringify({
          model: MIMO_MODEL,
          messages: [
            { role: "system", content: sysPrompt },
            { role: "system", content: contextPrompt },
            ...recentHistory
          ],
          stream: true,
          thinking: { type: "disabled" }
        })
      });
      if (!r.ok) {
        let errorText = `请求失败: ${r.status}`;
        try {
          const errorPayload = await r.json();
          errorText = errorPayload?.error || errorText;
        } catch {
          // ignore parse failures and fall back to status text
        }

        if (r.status === 503 && /AI not configured|MIMO_API_KEY|MiMo API Key/i.test(errorText)) {
          typing.remove();
          isGenerating = false;
          sendBtn.disabled = false;
          input.value = txt;
          if (promptForMimoApiKey()) {
            userMsg.remove();
            chatHistory.pop();
            await sendMsg();
            return;
          }
        }

        throw new Error(errorText);
      }
      typing.remove();
      const aiDiv = addMsg("ai", "");
      const bubble = aiDiv.querySelector(".mimo-msg-bubble");
      let full = "";
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop();
        for (const ln of lines) {
          if (!ln.startsWith("data:")) continue;
          const d = ln.slice(5).trim();
          if (d === "[DONE]") continue;
          try {
            const j = JSON.parse(d);
            const t = j.choices?.[0]?.delta?.content;
            if (t) { full += t; bubble.innerHTML = md(full); scroll(); }
          } catch (_) {}
        }
      }
      chatHistory.push({ role: "assistant", content: full });
    } catch (err) {
      typing.remove();
      addMsg("ai", "出错了: " + err.message);
    }
    isGenerating = false; sendBtn.disabled = false; input.focus();
  }
})();

init();

