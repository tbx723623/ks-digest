/**
 * 爆款预测算法
 * 基于增长率、历史数据、AI分析预测爆款
 * 核心价值："谁即将爆"
 */

const PredictEngine = {
  STORAGE_KEY: 'ksPredictions',
  
  /**
   * 预测爆款概率
   * @param {Object} video - 视频数据
   * @param {Array} history - 增长历史
   * @returns {Object} 预测结果
   */
  predict(video, history = []) {
    // 计算各项指标
    const growthScore = this.calcGrowthScore(history);
    const velocityScore = this.calcVelocityScore(history);
    const momentumScore = this.calcMomentumScore(history);
    const categoryScore = this.calcCategoryScore(video.category);
    const timeScore = this.calcTimeScore();
    
    // 综合爆率（加权）
    const explosionRate = Math.min(100, Math.round(
      growthScore * 0.3 +
      velocityScore * 0.25 +
      momentumScore * 0.25 +
      categoryScore * 0.1 +
      timeScore * 0.1
    ));
    
    // 预测起量速度
    const velocity = this.calcVelocity(history);
    
    // 预计爆发时间
    const estimatedTime = this.estimateExplosionTime(explosionRate, velocity);
    
    // 热度趋势
    const trend = this.calcTrend(history);
    
    return {
      videoId: video.workUrl || video.id || video.title,
      title: video.title,
      explosionRate,
      velocity,
      velocityLevel: this.getVelocityLevel(velocity),
      estimatedTime,
      trend,
      trendLabel: this.getTrendLabel(trend),
      scores: {
        growth: growthScore,
        velocity: velocityScore,
        momentum: momentumScore,
        category: categoryScore,
        time: timeScore
      },
      category: video.category,
      playCount: video.playCount,
      likeCount: video.likeCount,
      predictedAt: Date.now()
    };
  },
  
  /**
   * 批量预测
   * @param {Array} videos - 视频列表
   * @returns {Array} 预测结果列表
   */
  batchPredict(videos) {
    const logs = GrowthMonitor.getLogs();
    
    const predictions = videos.map(video => {
      const videoId = video.workUrl || video.id || video.title;
      const history = logs.filter(log => log.videoId === videoId);
      return this.predict(video, history);
    });
    
    // 按爆率排序
    predictions.sort((a, b) => b.explosionRate - a.explosionRate);
    
    // 保存预测结果
    this.savePredictions(predictions);
    
    return predictions;
  },
  
  /**
   * 计算增长率分数
   */
  calcGrowthScore(history) {
    if (history.length < 2) return 30; // 默认分数
    
    const recent = history.slice(-5);
    const avgGrowth = recent.reduce((sum, h) => sum + (h.growthRate || 0), 0) / recent.length;
    
    // 增长率映射到0-100分
    if (avgGrowth >= 10000) return 100;
    if (avgGrowth >= 5000) return 90;
    if (avgGrowth >= 2000) return 80;
    if (avgGrowth >= 1000) return 70;
    if (avgGrowth >= 500) return 60;
    if (avgGrowth >= 200) return 50;
    if (avgGrowth >= 100) return 40;
    return 30;
  },
  
  /**
   * 计算速度分数（增长加速度）
   */
  calcVelocityScore(history) {
    if (history.length < 3) return 30;
    
    const recent = history.slice(-3);
    const earlier = history.slice(-6, -3);
    
    if (earlier.length === 0) return 40;
    
    const recentAvg = recent.reduce((sum, h) => sum + (h.growthRate || 0), 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, h) => sum + (h.growthRate || 0), 0) / earlier.length;
    
    if (earlierAvg === 0) return recentAvg > 0 ? 80 : 40;
    
    const acceleration = recentAvg / earlierAvg;
    
    if (acceleration >= 3) return 100;
    if (acceleration >= 2) return 85;
    if (acceleration >= 1.5) return 70;
    if (acceleration >= 1) return 55;
    if (acceleration >= 0.5) return 40;
    return 25;
  },
  
  /**
   * 计动量分数（持续性）
   */
  calcMomentumScore(history) {
    if (history.length < 2) return 30;
    
    const recent = history.slice(-5);
    
    // 检查是否持续增长
    let consecutiveGrowth = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].growthRate > recent[i - 1].growthRate) {
        consecutiveGrowth++;
      } else {
        break;
      }
    }
    
    if (consecutiveGrowth >= 4) return 100;
    if (consecutiveGrowth >= 3) return 85;
    if (consecutiveGrowth >= 2) return 70;
    if (consecutiveGrowth >= 1) return 55;
    return 40;
  },
  
  /**
   * 计算题材分数
   */
  calcCategoryScore(category = []) {
    const hotCategories = {
      '穿越': 90,
      '重生': 88,
      '逆袭': 85,
      '豪门': 82,
      '甜宠': 80,
      '虐文': 78,
      '系统': 75,
      '复仇': 73,
      '打脸': 70,
      '赘婿': 68,
      '古言': 65,
      '都市': 60,
      '校园': 55,
      '娱乐圈': 50
    };
    
    let maxScore = 40;
    category.forEach(cat => {
      const score = hotCategories[cat] || 40;
      if (score > maxScore) maxScore = score;
    });
    
    return maxScore;
  },
  
  /**
   * 计算时间分数（发布时间段）
   */
  calcTimeScore() {
    const hour = new Date().getHours();
    
    // 黄金时间段
    if (hour >= 19 && hour <= 23) return 90; // 晚上7-11点
    if (hour >= 12 && hour <= 14) return 80; // 中午12-2点
    if (hour >= 7 && hour <= 9) return 70;   // 早上7-9点
    if (hour >= 17 && hour <= 19) return 75; // 下午5-7点
    return 50;
  },
  
  /**
   * 计算起量速度
   */
  calcVelocity(history) {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-3);
    const totalGrowth = recent.reduce((sum, h) => sum + (h.growthRate || 0), 0);
    return Math.round(totalGrowth / recent.length);
  },
  
  /**
   * 获取速度等级
   */
  getVelocityLevel(velocity) {
    if (velocity >= 10000) return '火箭级';
    if (velocity >= 5000) return '飞速';
    if (velocity >= 2000) return '快速';
    if (velocity >= 1000) return '中速';
    if (velocity >= 500) return '慢速';
    return '平稳';
  },
  
  /**
   * 预计爆发时间
   */
  estimateExplosionTime(explosionRate, velocity) {
    if (explosionRate >= 90) return '即将爆发';
    if (explosionRate >= 80) return '1小时内';
    if (explosionRate >= 70) return '2小时内';
    if (explosionRate >= 60) return '4小时内';
    if (explosionRate >= 50) return '6小时内';
    if (explosionRate >= 40) return '12小时内';
    return '24小时内';
  },
  
  /**
   * 计算趋势
   */
  calcTrend(history) {
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(-3);
    const earlier = history.slice(-6, -3);
    
    if (earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, h) => sum + (h.growthRate || 0), 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, h) => sum + (h.growthRate || 0), 0) / earlier.length;
    
    if (recentAvg > earlierAvg * 1.5) return 'rising';
    if (recentAvg < earlierAvg * 0.5) return 'falling';
    return 'stable';
  },
  
  /**
   * 获取趋势标签
   */
  getTrendLabel(trend) {
    const labels = {
      'rising': '上升',
      'stable': '平稳',
      'falling': '下降'
    };
    return labels[trend] || '未知';
  },
  
  /**
   * 获取高潜力视频
   */
  getHighPotentialVideos(limit = 20) {
    const predictions = this.getPredictions();
    return predictions
      .filter(p => p.explosionRate >= 60)
      .slice(0, limit);
  },
  
  /**
   * 获取即将爆发的视频
   */
  getSoonExplodingVideos(limit = 10) {
    const predictions = this.getPredictions();
    return predictions
      .filter(p => p.explosionRate >= 80)
      .slice(0, limit);
  },
  
  /**
   * 保存预测结果
   */
  savePredictions(predictions) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(predictions));
    } catch (e) {
      console.warn('保存预测结果失败:', e);
    }
  },
  
  /**
   * 获取预测结果
   */
  getPredictions() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }
};

// 导出
window.PredictEngine = PredictEngine;
