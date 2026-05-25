/**
 * 时间序列预测引擎
 * 核心算法：从"规则型预测"升级到"时间序列趋势预测"
 * 
 * 能力：
 * 1. 连续增长分析
 * 2. 增长加速度分析
 * 3. 热度惯性分析
 * 4. 增长方向分析
 * 5. 爆款生命周期判断
 * 6. 预测可信度计算
 */

const TimeSeriesEngine = {
  // ============ 核心数据结构 ============
  
  /**
   * 构建时间序列
   * @param {Array} history - 历史记录 [{timestamp, playCount, likeCount, shareCount}]
   * @returns {Object} 时间序列对象
   */
  buildTimeSeries(history) {
    if (!history || history.length < 2) return null;
    
    // 按时间排序
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    
    // 计算时间间隔（分钟）
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((sorted[i].timestamp - sorted[i-1].timestamp) / (1000 * 60));
    }
    
    // 计算增长率序列
    const growthRates = [];
    for (let i = 1; i < sorted.length; i++) {
      const timeDiff = intervals[i-1] || 1;
      const playGrowth = (sorted[i].playCount - sorted[i-1].playCount) / timeDiff;
      const likeGrowth = (sorted[i].likeCount - sorted[i-1].likeCount) / timeDiff;
      const shareGrowth = (sorted[i].shareCount - sorted[i-1].shareCount) / timeDiff;
      
      growthRates.push({
        timestamp: sorted[i].timestamp,
        playGrowth: Math.round(playGrowth),
        likeGrowth: Math.round(likeGrowth),
        shareGrowth: Math.round(shareGrowth),
        compositeGrowth: Math.round(playGrowth * 0.5 + likeGrowth * 0.3 + shareGrowth * 0.2)
      });
    }
    
    return {
      points: sorted,
      intervals,
      growthRates,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
      duration: (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / (1000 * 60), // 分钟
      pointCount: sorted.length
    };
  },
  
  // ============ 增长加速度分析 ============
  
  /**
   * 计算增长加速度
   * 增长加速度 = 增长率的变化率
   * 例如：100 → 300 → 1200，加速度为正，说明正在加速爆发
   */
  calcAcceleration(ts) {
    if (!ts || ts.growthRates.length < 2) return { value: 0, level: 'unknown', trend: 'stable' };
    
    const rates = ts.growthRates.map(g => g.compositeGrowth);
    
    // 计算一阶差分（增长率的变化）
    const firstDiffs = [];
    for (let i = 1; i < rates.length; i++) {
      firstDiffs.push(rates[i] - rates[i-1]);
    }
    
    // 计算二阶差分（加速度）
    const secondDiffs = [];
    for (let i = 1; i < firstDiffs.length; i++) {
      secondDiffs.push(firstDiffs[i] - firstDiffs[i-1]);
    }
    
    // 平均加速度
    const avgAcceleration = secondDiffs.length > 0
      ? secondDiffs.reduce((a, b) => a + b, 0) / secondDiffs.length
      : 0;
    
    // 最近加速度（更有参考价值）
    const recentAcceleration = secondDiffs.length > 0
      ? secondDiffs.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, secondDiffs.length)
      : 0;
    
    // 判断加速度等级
    let level, trend;
    if (recentAcceleration > 500) {
      level = '火箭加速';
      trend = 'explosive';
    } else if (recentAcceleration > 200) {
      level = '快速加速';
      trend = 'accelerating';
    } else if (recentAcceleration > 50) {
      level = '温和加速';
      trend = 'mild_accelerating';
    } else if (recentAcceleration > -50) {
      level = '匀速';
      trend = 'constant';
    } else if (recentAcceleration > -200) {
      level = '减速';
      trend = 'decelerating';
    } else {
      level = '快速减速';
      trend = 'decelerating_fast';
    }
    
    return {
      value: Math.round(avgAcceleration),
      recentValue: Math.round(recentAcceleration),
      level,
      trend,
      firstDiffs,
      secondDiffs
    };
  },
  
  // ============ 连续增长分析 ============
  
  /**
   * 分析增长连续性
   * 连续增长说明热度在持续积累
   */
  analyzeContinuity(ts) {
    if (!ts || ts.growthRates.length < 2) {
      return { score: 0, consecutiveCount: 0, continuity: 'insufficient_data' };
    }
    
    const rates = ts.growthRates.map(g => g.compositeGrowth);
    
    // 计算连续正增长的次数
    let consecutivePositive = 0;
    let maxConsecutive = 0;
    let currentStreak = 0;
    
    for (let i = rates.length - 1; i >= 0; i--) {
      if (rates[i] > 0) {
        currentStreak++;
        consecutivePositive = currentStreak;
      } else {
        if (currentStreak > maxConsecutive) maxConsecutive = currentStreak;
        break;
      }
    }
    if (currentStreak > maxConsecutive) maxConsecutive = currentStreak;
    
    // 计算正增长比例
    const positiveCount = rates.filter(r => r > 0).length;
    const positiveRatio = positiveCount / rates.length;
    
    // 连续性评分（0-100）
    const score = Math.min(100, Math.round(
      (consecutivePositive * 15) + // 连续次数权重
      (positiveRatio * 50) + // 正增长比例权重
      (maxConsecutive * 5) // 最大连续次数权重
    ));
    
    let continuity;
    if (consecutivePositive >= 5) continuity = '高度连续';
    else if (consecutivePositive >= 3) continuity = '中度连续';
    else if (consecutivePositive >= 1) continuity = '低度连续';
    else continuity = '不连续';
    
    return {
      score,
      consecutivePositive,
      maxConsecutive,
      positiveRatio: Math.round(positiveRatio * 100),
      continuity
    };
  },
  
  // ============ 热度惯性分析 ============
  
  /**
   * 热度惯性分析
   * 惯性大 = 即使增长率下降，热度也会持续一段时间
   * 惯性小 = 增长率下降后热度很快消退
   */
  analyzeMomentum(ts) {
    if (!ts || ts.growthRates.length < 3) {
      return { score: 0, momentum: 'unknown', estimatedDuration: 0 };
    }
    
    const rates = ts.growthRates.map(g => g.compositeGrowth);
    
    // 计算增长率的移动平均
    const windowSize = Math.min(3, rates.length);
    const movingAverages = [];
    for (let i = windowSize - 1; i < rates.length; i++) {
      const window = rates.slice(i - windowSize + 1, i + 1);
      movingAverages.push(window.reduce((a, b) => a + b, 0) / windowSize);
    }
    
    // 计算惯性（移动平均的趋势）
    let inertia = 0;
    if (movingAverages.length >= 2) {
      const recent = movingAverages.slice(-3);
      const earlier = movingAverages.slice(0, -3);
      if (earlier.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        inertia = recentAvg - earlierAvg;
      }
    }
    
    // 计算当前动量（最近增长率的加权平均）
    const recentRates = rates.slice(-5);
    const weights = [1, 1.2, 1.5, 2, 2.5]; // 越近权重越高
    let weightedSum = 0;
    let weightTotal = 0;
    for (let i = 0; i < recentRates.length; i++) {
      const w = weights[i] || 1;
      weightedSum += recentRates[i] * w;
      weightTotal += w;
    }
    const currentMomentum = weightTotal > 0 ? weightedSum / weightTotal : 0;
    
    // 惯性评分
    const score = Math.min(100, Math.round(
      (currentMomentum > 0 ? Math.min(50, currentMomentum / 20) : 0) +
      (inertia > 0 ? Math.min(30, inertia / 10) : 0) +
      (rates.filter(r => r > 0).length / rates.length * 20)
    ));
    
    let momentum;
    if (currentMomentum > 1000 && inertia > 0) momentum = '强惯性';
    else if (currentMomentum > 500) momentum = '中等惯性';
    else if (currentMomentum > 100) momentum = '弱惯性';
    else momentum = '无惯性';
    
    // 预计持续时间（分钟）
    const estimatedDuration = currentMomentum > 0
      ? Math.round(currentMomentum / Math.max(1, Math.abs(inertia) * 0.1))
      : 0;
    
    return {
      score,
      currentMomentum: Math.round(currentMomentum),
      inertia: Math.round(inertia),
      momentum,
      estimatedDuration,
      movingAverages
    };
  },
  
  // ============ 增长方向分析 ============
  
  /**
   * 增长方向分析
   * 判断增长是向上、向下还是震荡
   */
  analyzeDirection(ts) {
    if (!ts || ts.growthRates.length < 3) {
      return { direction: 'unknown', confidence: 0, angle: 0 };
    }
    
    const rates = ts.growthRates.map(g => g.compositeGrowth);
    
    // 线性回归计算趋势方向
    const n = rates.length;
    const xValues = Array.from({length: n}, (_, i) => i);
    const yValues = rates;
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // 计算R²（拟合度）
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = yValues.reduce((sum, y, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;
    
    // 方向判断
    let direction;
    if (slope > 50) direction = 'strong_upward';
    else if (slope > 10) direction = 'upward';
    else if (slope > -10) direction = 'stable';
    else if (slope > -50) direction = 'downward';
    else direction = 'strong_downward';
    
    // 方向角度（度）
    const angle = Math.atan(slope) * (180 / Math.PI);
    
    return {
      direction,
      slope: Math.round(slope),
      angle: Math.round(angle * 10) / 10,
      rSquared: Math.round(rSquared * 100),
      confidence: Math.round(rSquared * 100),
      directionLabel: {
        'strong_upward': '急速上升',
        'upward': '上升',
        'stable': '平稳',
        'downward': '下降',
        'strong_downward': '急速下降'
      }[direction]
    };
  },
  
  // ============ 爆款生命周期判断 ============
  
  /**
   * 判断视频所处的生命周期阶段
   * 冷启动 → 起量期 → 爆发期 → 稳定期 → 衰退期
   */
  analyzeLifecycle(ts, currentPlayCount = 0) {
    if (!ts || ts.growthRates.length < 2) {
      return { stage: 'unknown', stageLabel: '数据不足', confidence: 0 };
    }
    
    const acceleration = this.calcAcceleration(ts);
    const continuity = this.analyzeContinuity(ts);
    const momentum = this.analyzeMomentum(ts);
    const direction = this.analyzeDirection(ts);
    
    const recentRates = ts.growthRates.slice(-5).map(g => g.compositeGrowth);
    const avgRecentGrowth = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;
    
    let stage, stageLabel, confidence, value;
    
    // 冷启动：播放量很低，增长缓慢
    if (currentPlayCount < 10000 && avgRecentGrowth < 100) {
      stage = 'cold_start';
      stageLabel = '冷启动';
      confidence = 70;
      value = 10;
    }
    // 起量期：增长率开始上升，加速度为正
    else if (acceleration.trend === 'accelerating' || acceleration.trend === 'mild_accelerating') {
      if (avgRecentGrowth < 500) {
        stage = 'rising_early';
        stageLabel = '早期起量';
        confidence = 75;
        value = 40;
      } else {
        stage = 'rising';
        stageLabel = '起量期';
        confidence = 80;
        value = 60;
      }
    }
    // 爆发期：增长率很高，加速度为正或稳定
    else if (avgRecentGrowth > 1000 && (acceleration.trend === 'constant' || acceleration.trend === 'accelerating')) {
      stage = 'exploding';
      stageLabel = '爆发期';
      confidence = 85;
      value = 90;
    }
    // 稳定期：增长率稳定，加速度接近0
    else if (acceleration.trend === 'constant' && avgRecentGrowth > 100) {
      stage = 'stable';
      stageLabel = '稳定期';
      confidence = 70;
      value = 50;
    }
    // 衰退期：增长率下降，加速度为负
    else if (acceleration.trend === 'decelerating' || acceleration.trend === 'decelerating_fast') {
      stage = 'declining';
      stageLabel = '衰退期';
      confidence = 75;
      value = 20;
    }
    // 默认
    else {
      stage = 'stable';
      stageLabel = '稳定期';
      confidence = 50;
      value = 30;
    }
    
    return {
      stage,
      stageLabel,
      confidence,
      value,
      metrics: {
        avgRecentGrowth: Math.round(avgRecentGrowth),
        acceleration: acceleration.level,
        continuity: continuity.continuity,
        momentum: momentum.momentum,
        direction: direction.directionLabel
      }
    };
  },
  
  // ============ 预测可信度计算 ============
  
  /**
   * 计算预测可信度
   * 综合考虑数据质量、增长连续性、时间因素等
   */
  calcConfidence(ts, videoData = {}) {
    if (!ts) return { score: 0, level: '不可信', factors: {} };
    
    const factors = {};
    
    // 1. 数据点数量（越多越可信）
    factors.dataPoints = Math.min(30, ts.pointCount * 3);
    
    // 2. 时间跨度（覆盖时间越长越可信）
    factors.timeSpan = Math.min(20, ts.duration / 10);
    
    // 3. 增长连续性
    const continuity = this.analyzeContinuity(ts);
    factors.continuity = continuity.score * 0.3;
    
    // 4. 增长方向一致性
    const direction = this.analyzeDirection(ts);
    factors.directionConsistency = direction.confidence * 0.2;
    
    // 5. 发布时间（近期发布更可信）
    const publishAge = videoData.publishTime 
      ? (Date.now() - videoData.publishTime) / (1000 * 60 * 60) // 小时
      : 24;
    factors.publishFreshness = Math.max(0, 20 - publishAge);
    
    // 6. 互动率（点赞/播放比）
    const interactionRate = videoData.playCount > 0 
      ? (videoData.likeCount / videoData.playCount) * 100 
      : 0;
    factors.interactionQuality = Math.min(15, interactionRate * 3);
    
    // 总分
    const totalScore = Math.min(100, Math.round(
      factors.dataPoints +
      factors.timeSpan +
      factors.continuity +
      factors.directionConsistency +
      factors.publishFreshness +
      factors.interactionQuality
    ));
    
    let level;
    if (totalScore >= 80) level = '高可信';
    else if (totalScore >= 60) level = '中等可信';
    else if (totalScore >= 40) level = '低可信';
    else level = '不可信';
    
    return {
      score: totalScore,
      level,
      factors
    };
  },
  
  // ============ 综合预测（核心） ============
  
  /**
   * 综合预测
   * 将所有分析结果综合成最终预测
   */
  predict(video, history = []) {
    const ts = this.buildTimeSeries(history);
    
    if (!ts) {
      return {
        videoId: video.workUrl || video.id || video.title,
        title: video.title,
        explosionRate: 10,
        confidence: { score: 10, level: '数据不足' },
        lifecycle: { stage: 'unknown', stageLabel: '数据不足' },
        acceleration: { level: '未知' },
        momentum: { momentum: '未知' },
        direction: { directionLabel: '未知' },
        predictedAt: Date.now()
      };
    }
    
    // 各维度分析
    const acceleration = this.calcAcceleration(ts);
    const continuity = this.analyzeContinuity(ts);
    const momentum = this.analyzeMomentum(ts);
    const direction = this.analyzeDirection(ts);
    const lifecycle = this.analyzeLifecycle(ts, video.playCount || 0);
    const confidence = this.calcConfidence(ts, video);
    
    // 综合爆率计算
    const explosionRate = Math.min(100, Math.round(
      (acceleration.trend === 'explosive' ? 30 : acceleration.trend === 'accelerating' ? 20 : 10) +
      (continuity.score * 0.25) +
      (momentum.score * 0.2) +
      (direction.confidence * 0.15) +
      (lifecycle.value * 0.15) +
      (confidence.score * 0.1)
    ));
    
    // 起量速度
    const velocity = momentum.currentMomentum;
    let velocityLevel;
    if (velocity > 5000) velocityLevel = '火箭级';
    else if (velocity > 2000) velocityLevel = '飞速';
    else if (velocity > 1000) velocityLevel = '快速';
    else if (velocity > 500) velocityLevel = '中速';
    else if (velocity > 100) velocityLevel = '慢速';
    else velocityLevel = '平稳';
    
    // 预计爆发时间
    let estimatedTime;
    if (lifecycle.stage === 'exploding') estimatedTime = '正在爆发';
    else if (lifecycle.stage === 'rising' && acceleration.trend === 'accelerating') estimatedTime = '1小时内';
    else if (lifecycle.stage === 'rising') estimatedTime = '2小时内';
    else if (lifecycle.stage === 'rising_early') estimatedTime = '4小时内';
    else if (lifecycle.stage === 'cold_start') estimatedTime = '6-12小时';
    else estimatedTime = '不确定';
    
    return {
      videoId: video.workUrl || video.id || video.title,
      title: video.title,
      category: video.category || [],
      playCount: video.playCount || 0,
      likeCount: video.likeCount || 0,
      
      // 核心预测指标
      explosionRate,        // 爆率 0-100
      confidence,           // 可信度 {score, level}
      lifecycle,            // 生命周期阶段
      acceleration,         // 增长加速度
      momentum,             // 热度惯性
      direction,            // 增长方向
      continuity,           // 增长连续性
      
      // 辅助指标
      velocity,
      velocityLevel,
      estimatedTime,
      
      // 时间戳
      predictedAt: Date.now()
    };
  },
  
  /**
   * 批量预测
   */
  batchPredict(videos) {
    const logs = GrowthMonitor.getLogs();
    
    return videos.map(video => {
      const videoId = video.workUrl || video.id || video.title;
      const history = logs.filter(log => log.videoId === videoId);
      return this.predict(video, history);
    }).sort((a, b) => b.explosionRate - a.explosionRate);
  }
};

// 导出
window.TimeSeriesEngine = TimeSeriesEngine;
