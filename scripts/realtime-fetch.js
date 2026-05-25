/**
 * 增长率计算脚本
 * 基于真实抓取数据计算增长率和趋势
 * 
 * ⚠️ 不再使用 MiMo 生成假数据！
 * MiMo 只用于 AI 分析（爆率、趋势、爽点）
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GROWTH_FILE = path.join(DATA_DIR, 'growth.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 解析数字
function parseCount(text) {
  if (!text) return 0;
  if (typeof text === 'number') return text;
  text = String(text).replace(/,/g, '');
  const match = text.match(/([\d.]+)\s*(万|亿|w)?/i);
  if (!match) return 0;
  let count = parseFloat(match[1]);
  if (match[2] === '万' || match[2] === 'w') count *= 10000;
  if (match[2] === '亿') count *= 100000000;
  return Math.floor(count);
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 已保存: ${path.basename(filePath)}`);
}

// 主流程
async function main() {
  console.log('📊 增长率计算系统');
  console.log(`📅 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('='.repeat(60));

  // 读取真实抓取数据
  const poolTypes = ['hot', 'male', 'female', 'new_book'];
  let allVideos = [];

  for (const pool of poolTypes) {
    const data = readJson(path.join(DATA_DIR, `scraper-${pool}.json`));
    if (data.items) {
      allVideos.push(...data.items);
    }
  }

  // 也读取 explosive.json
  const explosiveData = readJson(path.join(DATA_DIR, 'explosive.json'));
  if (explosiveData.items) {
    allVideos.push(...explosiveData.items);
  }

  // 去重
  const seen = new Set();
  allVideos = allVideos.filter(v => {
    if (!v.videoId) return false;
    if (seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    return true;
  });

  console.log(`📊 读取到 ${allVideos.length} 条真实数据`);

  if (allVideos.length === 0) {
    console.log('⚠️ 没有数据，请先运行 kuaishou-scraper.js');
    return;
  }

  // 读取现有增长日志
  const existingGrowth = readJson(GROWTH_FILE);
  const existingLogs = existingGrowth.logs || [];

  // 生成新的增长记录
  const now = Date.now();
  const newLogs = allVideos.map(video => ({
    videoId: video.videoId,
    title: video.title,
    timestamp: now,
    playCount: video.viewCount || 0,
    likeCount: video.likeCount || 0,
    commentCount: video.commentCount || 0,
    shareCount: video.shareCount || 0,
    poolType: video.poolType || 'unknown',
    sourceUrl: video.sourceUrl || ''
  }));

  // 合并增长日志
  const allLogs = [...existingLogs, ...newLogs];

  // 只保留最近7天的数据
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const filteredLogs = allLogs.filter(log => log.timestamp > sevenDaysAgo);

  // 计算每个视频的增长率
  const videoGrowth = {};
  for (const log of filteredLogs) {
    if (!videoGrowth[log.videoId]) {
      videoGrowth[log.videoId] = [];
    }
    videoGrowth[log.videoId].push(log);
  }

  // 计算增长率
  const growthSummary = [];
  for (const [videoId, logs] of Object.entries(videoGrowth)) {
    if (logs.length < 2) continue;

    const sorted = logs.sort((a, b) => a.timestamp - b.timestamp);
    const latest = sorted[sorted.length - 1];
    const earliest = sorted[0];

    const timeDiffHours = (latest.timestamp - earliest.timestamp) / (1000 * 60 * 60);
    if (timeDiffHours < 0.1) continue;

    const likeGrowth = latest.likeCount - earliest.likeCount;
    const commentGrowth = latest.commentCount - earliest.commentCount;
    const shareGrowth = latest.shareCount - earliest.shareCount;

    const likeRate = timeDiffHours > 0 ? likeGrowth / timeDiffHours : 0;
    const commentRate = timeDiffHours > 0 ? commentGrowth / timeDiffHours : 0;
    const shareRate = timeDiffHours > 0 ? shareGrowth / timeDiffHours : 0;

    // 综合增长率
    const compositeRate = likeRate * 0.5 + commentRate * 0.3 + shareRate * 0.2;

    growthSummary.push({
      videoId,
      title: latest.title,
      sourceUrl: latest.sourceUrl,
      poolType: latest.poolType,
      dataPoints: sorted.length,
      timeSpanHours: Math.round(timeDiffHours * 10) / 10,
      latest: {
        likeCount: latest.likeCount,
        commentCount: latest.commentCount,
        shareCount: latest.shareCount
      },
      growth: {
        likeGrowth: Math.round(likeGrowth),
        commentGrowth: Math.round(commentGrowth),
        shareGrowth: Math.round(shareGrowth),
        likeRatePerHour: Math.round(likeRate),
        commentRatePerHour: Math.round(commentRate),
        shareRatePerHour: Math.round(shareRate),
        compositeRate: Math.round(compositeRate)
      }
    });
  }

  // 按增长率排序
  growthSummary.sort((a, b) => b.growth.compositeRate - a.growth.compositeRate);

  // 保存
  const growthData = {
    stats: {
      totalRecords: filteredLogs.length,
      uniqueVideos: Object.keys(videoGrowth).size,
      videosWithGrowth: growthSummary.length,
      lastUpdate: new Date().toISOString()
    },
    growthSummary: growthSummary.slice(0, 200),
    logs: filteredLogs.slice(-10000),
    lastCalculation: new Date().toISOString()
  };

  writeJson(GROWTH_FILE, growthData);

  // 输出统计
  console.log('\n' + '='.repeat(60));
  console.log('📊 增长率统计');
  console.log('='.repeat(60));
  console.log(`总记录数: ${filteredLogs.length}`);
  console.log(`独立视频: ${Object.keys(videoGrowth).size}`);
  console.log(`有增长数据: ${growthSummary.length}`);

  if (growthSummary.length > 0) {
    console.log('\n🚀 Top 5 增长最快:');
    growthSummary.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.title?.substring(0, 40)} | 增长率: ${item.growth.compositeRate}/小时`);
    });
  }

  console.log('\n✅ 增长率计算完成！');
}

main().catch(err => {
  console.error('❌ 计算失败:', err.message);
  process.exit(1);
});
