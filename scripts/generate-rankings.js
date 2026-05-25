/**
 * 榜单生成脚本
 * 用于GitHub Actions定时生成各种榜单
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GROWTH_FILE = path.join(DATA_DIR, 'growth.json');
const PREDICTIONS_FILE = path.join(DATA_DIR, 'predictions.json');
const RANKINGS_FILE = path.join(DATA_DIR, 'rankings.json');

/**
 * 读取JSON文件
 */
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.warn(`读取文件失败: ${filePath}`, e.message);
    return {};
  }
}

/**
 * 写入JSON文件
 */
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ 写入成功: ${filePath}`);
  } catch (e) {
    console.error(`写入文件失败: ${filePath}`, e.message);
  }
}

/**
 * 生成榜单
 */
function generateRankings() {
  console.log('🏆 开始生成榜单...');
  
  // 读取数据
  const growthData = readJson(GROWTH_FILE);
  const predictionsData = readJson(PREDICTIONS_FILE);
  const logs = growthData.logs || [];
  
  if (logs.length === 0) {
    console.log('⚠️ 没有数据，跳过榜单生成');
    return;
  }
  
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;
  
  // 今日新爆榜（24小时内新增的高增长视频）
  const todayNewExploding = logs
    .filter(log => log.timestamp > oneDayAgo && log.isNew && log.growthRate > 0)
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 20)
    .map(log => ({
      videoId: log.videoId,
      title: log.title,
      growthRate: log.growthRate,
      category: log.category,
      playCount: log.playCount,
      timestamp: log.timestamp
    }));
  
  // 异常增长榜（增长率突然暴增的视频）
  const anomalyVideos = logs
    .filter(log => log.timestamp > oneHourAgo && log.growthRate > 1000)
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 20)
    .map(log => ({
      videoId: log.videoId,
      title: log.title,
      growthRate: log.growthRate,
      category: log.category,
      playCount: log.playCount,
      anomalyScore: Math.round(log.growthRate / 100)
    }));
  
  // 高潜力榜（基于预测数据）
  const highPotential = (predictionsData.local || [])
    .filter(p => p.explosionRate >= 60)
    .sort((a, b) => b.explosionRate - a.explosionRate)
    .slice(0, 20);
  
  // 热门题材趋势榜
  const categoryStats = {};
  logs.forEach(log => {
    if (log.timestamp < oneDayAgo) return;
    
    (log.category || []).forEach(cat => {
      if (!categoryStats[cat]) {
        categoryStats[cat] = {
          category: cat,
          count: 0,
          totalGrowth: 0,
          avgGrowth: 0,
          maxGrowth: 0
        };
      }
      categoryStats[cat].count++;
      categoryStats[cat].totalGrowth += log.growthRate || 0;
      categoryStats[cat].maxGrowth = Math.max(categoryStats[cat].maxGrowth, log.growthRate || 0);
    });
  });
  
  // 计算平均增长率
  Object.keys(categoryStats).forEach(cat => {
    const stats = categoryStats[cat];
    stats.avgGrowth = stats.count > 0 ? Math.round(stats.totalGrowth / stats.count) : 0;
  });
  
  const categoryTrend = Object.values(categoryStats)
    .sort((a, b) => b.avgGrowth - a.avgGrowth)
    .slice(0, 15);
  
  // 综合热度榜（所有视频按综合分数排序）
  const videoScores = {};
  logs.forEach(log => {
    if (log.timestamp < oneDayAgo) return;
    
    const videoId = log.videoId;
    if (!videoScores[videoId]) {
      videoScores[videoId] = {
        videoId,
        title: log.title,
        category: log.category,
        playCount: log.playCount,
        totalGrowth: 0,
        maxGrowth: 0,
        recordCount: 0,
        score: 0
      };
    }
    
    videoScores[videoId].totalGrowth += log.growthRate || 0;
    videoScores[videoId].maxGrowth = Math.max(videoScores[videoId].maxGrowth, log.growthRate || 0);
    videoScores[videoId].recordCount++;
  });
  
  // 计算综合分数
  Object.values(videoScores).forEach(video => {
    video.score = Math.round(
      video.totalGrowth * 0.4 +
      video.maxGrowth * 0.3 +
      video.recordCount * 100 * 0.3
    );
  });
  
  const hotRanking = Object.values(videoScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((video, index) => ({
      rank: index + 1,
      ...video
    }));
  
  // 生成榜单数据
  const rankings = {
    todayNewExploding: {
      title: '今日新爆榜',
      description: '24小时内新增的高增长视频',
      items: todayNewExploding,
      generatedAt: new Date().toISOString()
    },
    anomalyGrowth: {
      title: '异常增长榜',
      description: '增长率突然暴增的视频',
      items: anomalyVideos,
      generatedAt: new Date().toISOString()
    },
    highPotential: {
      title: '高潜力榜',
      description: '基于AI预测的高潜力视频',
      items: highPotential,
      generatedAt: new Date().toISOString()
    },
    categoryTrend: {
      title: '热门题材趋势榜',
      description: '24小时内题材增长率排行',
      items: categoryTrend,
      generatedAt: new Date().toISOString()
    },
    hotRanking: {
      title: '综合热度榜',
      description: '所有视频按综合分数排序',
      items: hotRanking,
      generatedAt: new Date().toISOString()
    },
    stats: {
      totalRecords: logs.length,
      uniqueVideos: Object.keys(videoScores).length,
      lastUpdate: new Date().toISOString()
    }
  };
  
  // 保存榜单
  writeJson(RANKINGS_FILE, rankings);
  
  console.log('✅ 榜单生成完成');
  console.log(`   - 今日新爆榜: ${todayNewExploding.length} 个`);
  console.log(`   - 异常增长榜: ${anomalyVideos.length} 个`);
  console.log(`   - 高潜力榜: ${highPotential.length} 个`);
  console.log(`   - 热门题材: ${categoryTrend.length} 个`);
  console.log(`   - 综合热度榜: ${hotRanking.length} 个`);
}

// 运行
generateRankings();
