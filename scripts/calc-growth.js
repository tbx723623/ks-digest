/**
 * 增长率计算脚本
 * 用于GitHub Actions定时计算增长率
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GROWTH_FILE = path.join(DATA_DIR, 'growth.json');
const REALTIME_FILE = path.join(DATA_DIR, 'realtime.json');
const DAILY_FILE = path.join(DATA_DIR, 'daily.json');

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
 * 计算增长率
 */
function calculateGrowth(currentData, previousData) {
  const growthLogs = [];
  const now = Date.now();
  
  // 构建历史数据索引
  const previousMap = {};
  (previousData.items || []).forEach(item => {
    const key = item.workUrl || item.title;
    previousMap[key] = item;
  });
  
  // 计算每条数据的增长率
  (currentData.items || []).forEach(item => {
    const key = item.workUrl || item.title;
    const previous = previousMap[key];
    
    if (!previous) {
      // 新数据，标记为新增
      growthLogs.push({
        videoId: key,
        title: item.title,
        timestamp: now,
        playCount: item.playCount || 0,
        likeCount: item.likeCount || 0,
        shareCount: item.shareCount || 0,
        playGrowth: 0,
        likeGrowth: 0,
        shareGrowth: 0,
        growthRate: 0,
        isNew: true,
        category: item.category || [],
        workUrl: item.workUrl || ''
      });
      return;
    }
    
    // 计算增长量
    const playGrowth = (item.playCount || 0) - (previous.playCount || 0);
    const likeGrowth = (item.likeCount || 0) - (previous.likeCount || 0);
    const shareGrowth = (item.shareCount || 0) - (previous.shareCount || 0);
    
    // 计算综合增长率（加权）
    const growthRate = Math.round(
      playGrowth * 0.5 + likeGrowth * 0.3 + shareGrowth * 0.2
    );
    
    growthLogs.push({
      videoId: key,
      title: item.title,
      timestamp: now,
      playCount: item.playCount || 0,
      likeCount: item.likeCount || 0,
      shareCount: item.shareCount || 0,
      playGrowth,
      likeGrowth,
      shareGrowth,
      growthRate,
      isNew: false,
      category: item.category || [],
      workUrl: item.workUrl || ''
    });
  });
  
  return growthLogs;
}

/**
 * 主函数
 */
function main() {
  console.log('📊 开始计算增长率...');
  
  // 读取当前数据
  const realtimeData = readJson(REALTIME_FILE);
  const dailyData = readJson(DAILY_FILE);
  
  // 合并当前数据
  const currentData = {
    items: [...(realtimeData.items || []), ...(dailyData.items || [])]
  };
  
  // 读取历史增长数据
  const previousGrowth = readJson(GROWTH_FILE);
  const previousItems = previousGrowth.items || [];
  
  // 构建上一次数据的索引
  const previousData = {
    items: previousItems.map(log => ({
      workUrl: log.videoId,
      title: log.title,
      playCount: log.playCount,
      likeCount: log.likeCount,
      shareCount: log.shareCount
    }))
  };
  
  // 计算增长率
  const growthLogs = calculateGrowth(currentData, previousData);
  
  // 读取现有增长日志
  const existingLogs = readJson(GROWTH_FILE);
  const allLogs = [...(existingLogs.logs || []), ...growthLogs];
  
  // 只保留最近10000条记录
  const trimmedLogs = allLogs.slice(-10000);
  
  // 统计信息
  const stats = {
    totalRecords: trimmedLogs.length,
    uniqueVideos: new Set(trimmedLogs.map(log => log.videoId)).size,
    lastUpdate: new Date().toISOString(),
    newItems: growthLogs.filter(log => log.isNew).length,
    growingItems: growthLogs.filter(log => log.growthRate > 0).length,
    explodingItems: growthLogs.filter(log => log.growthRate > 1000).length
  };
  
  // 保存结果
  writeJson(GROWTH_FILE, {
    stats,
    logs: trimmedLogs,
    lastCalculation: new Date().toISOString()
  });
  
  // 输出统计
  console.log('📈 增长率计算完成:');
  console.log(`   - 总记录: ${stats.totalRecords}`);
  console.log(`   - 独立视频: ${stats.uniqueVideos}`);
  console.log(`   - 新增项目: ${stats.newItems}`);
  console.log(`   - 增长项目: ${stats.growingItems}`);
  console.log(`   - 爆发项目: ${stats.explodingItems}`);
}

// 运行
main();
