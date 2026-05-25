/**
 * 增长率监控系统
 * 记录每次抓取的数据变化，计算增长率
 * 核心价值：知道"谁正在爆"
 */

const GrowthMonitor = {
  STORAGE_KEY: 'ksGrowthLogs',
  MAX_LOGS: 10000, // 最多保留1万条记录
  
  /**
   * 记录一次数据快照
   * @param {Array} items - 当前数据列表
   */
  recordSnapshot(items) {
    const timestamp = Date.now();
    const logs = this.getLogs();
    
    items.forEach(item => {
      const videoId = item.workUrl || item.id || item.title;
      if (!videoId) return;
      
      // 查找该视频的历史记录
      const history = logs.filter(log => log.videoId === videoId);
      const lastRecord = history[history.length - 1];
      
      // 计算增长率
      let growthRate = 0;
      let likeGrowth = 0;
      let shareGrowth = 0;
      let playGrowth = 0;
      
      if (lastRecord) {
        const timeDiff = (timestamp - lastRecord.timestamp) / (1000 * 60); // 分钟
        
        if (timeDiff > 0) {
          playGrowth = ((item.playCount || 0) - (lastRecord.playCount || 0)) / timeDiff;
          likeGrowth = ((item.likeCount || 0) - (lastRecord.likeCount || 0)) / timeDiff;
          shareGrowth = ((item.shareCount || 0) - (lastRecord.shareCount || 0)) / timeDiff;
          
          // 综合增长率（加权）
          growthRate = (playGrowth * 0.5 + likeGrowth * 0.3 + shareGrowth * 0.2);
        }
      }
      
      // 添加记录
      logs.push({
        videoId,
        title: item.title,
        timestamp,
        playCount: item.playCount || 0,
        likeCount: item.likeCount || 0,
        shareCount: item.shareCount || 0,
        playGrowth: Math.round(playGrowth),
        likeGrowth: Math.round(likeGrowth),
        shareGrowth: Math.round(shareGrowth),
        growthRate: Math.round(growthRate),
        category: item.category || [],
        workUrl: item.workUrl || ''
      });
    });
    
    // 保留最新的记录
    const trimmedLogs = logs.slice(-this.MAX_LOGS);
    this.saveLogs(trimmedLogs);
    
    return trimmedLogs;
  },
  
  /**
   * 获取所有日志
   */
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },
  
  /**
   * 保存日志
   */
  saveLogs(logs) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('保存增长率日志失败:', e);
    }
  },
  
  /**
   * 获取指定视频的增长历史
   */
  getVideoHistory(videoId) {
    const logs = this.getLogs();
    return logs.filter(log => log.videoId === videoId);
  },
  
  /**
   * 获取正在爆发的视频（增长率最高的）
   * @param {number} limit - 返回数量
   * @param {number} minGrowthRate - 最小增长率阈值
   */
  getExplodingVideos(limit = 20, minGrowthRate = 100) {
    const logs = this.getLogs();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    // 只看最近1小时的数据
    const recentLogs = logs.filter(log => log.timestamp > oneHourAgo);
    
    // 按视频ID分组
    const videoMap = {};
    recentLogs.forEach(log => {
      if (!videoMap[log.videoId]) {
        videoMap[log.videoId] = {
          videoId: log.videoId,
          title: log.title,
          category: log.category,
          workUrl: log.workUrl,
          records: []
        };
      }
      videoMap[log.videoId].records.push(log);
    });
    
    // 计算每个视频的平均增长率
    const results = Object.values(videoMap).map(video => {
      const records = video.records;
      if (records.length < 2) {
        return { ...video, avgGrowthRate: 0, trend: 'stable' };
      }
      
      // 计算平均增长率
      const totalGrowth = records.reduce((sum, r) => sum + (r.growthRate || 0), 0);
      const avgGrowthRate = totalGrowth / records.length;
      
      // 计算趋势（最近3条 vs 之前）
      const recent3 = records.slice(-3);
      const earlier = records.slice(0, -3);
      
      let trend = 'stable';
      if (recent3.length > 0 && earlier.length > 0) {
        const recentAvg = recent3.reduce((sum, r) => sum + r.growthRate, 0) / recent3.length;
        const earlierAvg = earlier.reduce((sum, r) => sum + r.growthRate, 0) / earlier.length;
        
        if (recentAvg > earlierAvg * 1.5) trend = 'rising';
        else if (recentAvg < earlierAvg * 0.5) trend = 'falling';
      }
      
      return {
        ...video,
        avgGrowthRate: Math.round(avgGrowthRate),
        trend,
        latestPlayCount: records[records.length - 1].playCount,
        latestLikeCount: records[records.length - 1].likeCount,
        recordCount: records.length
      };
    });
    
    // 过滤并排序
    return results
      .filter(v => v.avgGrowthRate >= minGrowthRate)
      .sort((a, b) => b.avgGrowthRate - a.avgGrowthRate)
      .slice(0, limit);
  },
  
  /**
   * 获取异常增长的视频（突然暴增）
   */
  getAnomalyVideos(limit = 10) {
    const logs = this.getLogs();
    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    
    const recentLogs = logs.filter(log => log.timestamp > twoHoursAgo);
    
    // 按视频ID分组
    const videoMap = {};
    recentLogs.forEach(log => {
      if (!videoMap[log.videoId]) {
        videoMap[log.videoId] = {
          videoId: log.videoId,
          title: log.title,
          category: log.category,
          workUrl: log.workUrl,
          records: []
        };
      }
      videoMap[log.videoId].records.push(log);
    });
    
    // 检测异常增长
    const anomalies = [];
    
    Object.values(videoMap).forEach(video => {
      const records = video.records;
      if (records.length < 3) return;
      
      // 计算增长率的标准差
      const growthRates = records.map(r => r.growthRate);
      const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
      const variance = growthRates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / growthRates.length;
      const stdDev = Math.sqrt(variance);
      
      // 检查是否有异常高增长（超过2倍标准差）
      const latest = records[records.length - 1];
      const isAnomaly = latest.growthRate > mean + 2 * stdDev && latest.growthRate > 500;
      
      if (isAnomaly) {
        anomalies.push({
          ...video,
          latestGrowthRate: latest.growthRate,
          avgGrowthRate: Math.round(mean),
          stdDev: Math.round(stdDev),
          anomalyScore: Math.round((latest.growthRate - mean) / stdDev),
          latestPlayCount: latest.playCount,
          latestLikeCount: latest.likeCount
        });
      }
    });
    
    return anomalies
      .sort((a, b) => b.anomalyScore - a.anomalyScore)
      .slice(0, limit);
  },
  
  /**
   * 获取增长率统计
   */
  getStats() {
    const logs = this.getLogs();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    const todayLogs = logs.filter(log => log.timestamp > oneDayAgo);
    
    const uniqueVideos = new Set(todayLogs.map(log => log.videoId)).size;
    const totalRecords = todayLogs.length;
    const avgGrowthRate = todayLogs.length > 0 
      ? todayLogs.reduce((sum, log) => sum + (log.growthRate || 0), 0) / todayLogs.length 
      : 0;
    
    return {
      uniqueVideos,
      totalRecords,
      avgGrowthRate: Math.round(avgGrowthRate),
      lastUpdate: logs.length > 0 ? logs[logs.length - 1].timestamp : null
    };
  }
};

// 导出
window.GrowthMonitor = GrowthMonitor;
