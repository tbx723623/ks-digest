/**
 * 数据健康评分系统
 * 核心能力：判断数据真实性，过滤刷量、搬运、假爆
 * 
 * 综合判断：
 * - 发布时间 vs 增长曲线
 * - 互动率合理性
 * - 增长连续性
 * - 评论质量（如有）
 * - 视频重复率
 */

const DataHealth = {
  
  /**
   * 计算数据健康评分
   * @param {Object} video - 视频数据
   * @param {Array} history - 增长历史
   * @returns {Object} 健康评分
   */
  assess(video, history = []) {
    const factors = {};
    
    // 1. 互动率合理性检查
    factors.interactionRate = this.checkInteractionRate(video);
    
    // 2. 增长曲线合理性
    factors.growthCurve = this.checkGrowthCurve(history);
    
    // 3. 发布时间 vs 播放量合理性
    factors.timePlayRatio = this.checkTimePlayRatio(video);
    
    // 4. 增长连续性（是否存在异常突变）
    factors.growthContinuity = this.checkGrowthContinuity(history);
    
    // 5. 数据一致性
    factors.dataConsistency = this.checkDataConsistency(video);
    
    // 综合健康评分
    const totalScore = Math.round(
      factors.interactionRate.score * 0.25 +
      factors.growthCurve.score * 0.25 +
      factors.timePlayRatio.score * 0.2 +
      factors.growthContinuity.score * 0.2 +
      factors.dataConsistency.score * 0.1
    );
    
    let level, label, isHealthy;
    if (totalScore >= 80) {
      level = 'excellent';
      label = '数据健康';
      isHealthy = true;
    } else if (totalScore >= 60) {
      level = 'good';
      label = '基本健康';
      isHealthy = true;
    } else if (totalScore >= 40) {
      level = 'suspicious';
      label = '可疑数据';
      isHealthy = false;
    } else {
      level = 'unhealthy';
      label = '异常数据';
      isHealthy = false;
    }
    
    return {
      score: totalScore,
      level,
      label,
      isHealthy,
      factors,
      warnings: this.generateWarnings(factors)
    };
  },
  
  /**
   * 检查互动率合理性
   * 正常互动率：点赞/播放 = 1%~5%
   * 过高可能是刷量，过低可能是无效内容
   */
  checkInteractionRate(video) {
    const playCount = video.playCount || 0;
    const likeCount = video.likeCount || 0;
    const shareCount = video.shareCount || 0;
    
    if (playCount === 0) {
      return { score: 50, reason: '无播放数据', rate: 0 };
    }
    
    const likeRate = (likeCount / playCount) * 100;
    const shareRate = (shareCount / playCount) * 100;
    
    let score = 100;
    let reason = '互动率正常';
    
    // 点赞率检查
    if (likeRate > 10) {
      score -= 40;
      reason = '点赞率异常偏高（可能刷量）';
    } else if (likeRate > 5) {
      score -= 10;
      reason = '点赞率偏高';
    } else if (likeRate < 0.1) {
      score -= 30;
      reason = '点赞率异常偏低';
    }
    
    // 分享率检查
    if (shareRate > 5) {
      score -= 20;
      reason = '分享率异常偏高';
    }
    
    return {
      score: Math.max(0, score),
      reason,
      likeRate: Math.round(likeRate * 100) / 100,
      shareRate: Math.round(shareRate * 100) / 100
    };
  },
  
  /**
   * 检查增长曲线合理性
   * 正常增长应该是平滑的，不应该有异常突变
   */
  checkGrowthCurve(history) {
    if (!history || history.length < 3) {
      return { score: 50, reason: '数据点不足' };
    }
    
    const rates = history.map(h => h.growthRate || 0);
    
    // 计算增长率的标准差
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
    const stdDev = Math.sqrt(variance);
    
    // 检查是否有异常突变（超过3倍标准差）
    const anomalies = rates.filter(r => Math.abs(r - mean) > 3 * stdDev);
    
    let score = 100;
    let reason = '增长曲线平滑';
    
    if (anomalies.length > rates.length * 0.3) {
      score -= 40;
      reason = '存在大量异常突变';
    } else if (anomalies.length > 0) {
      score -= 20;
      reason = '存在少量异常突变';
    }
    
    // 检查是否所有值都相同（可能是假数据）
    const uniqueValues = new Set(rates).size;
    if (uniqueValues === 1 && rates.length > 5) {
      score -= 30;
      reason = '增长数据完全一致（可能造假）';
    }
    
    return {
      score: Math.max(0, score),
      reason,
      anomalyCount: anomalies.length,
      stdDev: Math.round(stdDev)
    };
  },
  
  /**
   * 检查发布时间 vs 播放量合理性
   * 新发布但播放量极高，可能是搬运或刷量
   */
  checkTimePlayRatio(video) {
    const playCount = video.playCount || 0;
    const publishTime = video.publishTime || video.fetchedAt;
    
    if (!publishTime || playCount === 0) {
      return { score: 60, reason: '缺少发布时间数据' };
    }
    
    const ageHours = (Date.now() - new Date(publishTime).getTime()) / (1000 * 60 * 60);
    
    // 播放量/小时
    const playPerHour = ageHours > 0 ? playCount / ageHours : 0;
    
    let score = 100;
    let reason = '时间-播放量比例正常';
    
    // 新视频播放量过高
    if (ageHours < 1 && playCount > 1000000) {
      score -= 40;
      reason = '1小时内播放量超100万（可疑）';
    } else if (ageHours < 6 && playCount > 10000000) {
      score -= 30;
      reason = '6小时内播放量超1000万（可疑）';
    }
    
    // 播放量/小时过高
    if (playPerHour > 500000) {
      score -= 20;
      reason = '每小时播放量超50万（异常）';
    }
    
    return {
      score: Math.max(0, score),
      reason,
      ageHours: Math.round(ageHours * 10) / 10,
      playPerHour: Math.round(playPerHour)
    };
  },
  
  /**
   * 检查增长连续性
   * 突然暴增然后停滞，可能是刷量
   */
  checkGrowthContinuity(history) {
    if (!history || history.length < 3) {
      return { score: 50, reason: '数据点不足' };
    }
    
    const rates = history.map(h => h.growthRate || 0);
    
    // 检查是否有"暴增-停滞"模式
    let suddenSpikes = 0;
    for (let i = 1; i < rates.length; i++) {
      if (rates[i] > rates[i-1] * 5 && rates[i] > 1000) {
        // 检查之后是否停滞
        if (i + 1 < rates.length && rates[i+1] < rates[i] * 0.3) {
          suddenSpikes++;
        }
      }
    }
    
    let score = 100;
    let reason = '增长连续性正常';
    
    if (suddenSpikes > 2) {
      score -= 40;
      reason = '存在多次暴增-停滞模式（可能刷量）';
    } else if (suddenSpikes > 0) {
      score -= 20;
      reason = '存在暴增-停滞模式';
    }
    
    return {
      score: Math.max(0, score),
      reason,
      suddenSpikes
    };
  },
  
  /**
   * 检查数据一致性
   * 各项数据是否合理
   */
  checkDataConsistency(video) {
    let score = 100;
    let reason = '数据一致';
    const issues = [];
    
    // 播放量为0但有点赞
    if ((video.playCount || 0) === 0 && (video.likeCount || 0) > 0) {
      score -= 30;
      issues.push('无播放量但有点赞');
    }
    
    // 标题为空
    if (!video.title || video.title.length < 2) {
      score -= 20;
      issues.push('标题缺失或过短');
    }
    
    // 分享量大于点赞量（不合理）
    if ((video.shareCount || 0) > (video.likeCount || 0) && (video.likeCount || 0) > 0) {
      score -= 15;
      issues.push('分享量大于点赞量');
    }
    
    return {
      score: Math.max(0, score),
      reason: issues.length > 0 ? issues.join('；') : '数据一致',
      issues
    };
  },
  
  /**
   * 生成警告信息
   */
  generateWarnings(factors) {
    const warnings = [];
    
    if (factors.interactionRate.score < 60) {
      warnings.push({
        level: 'high',
        message: factors.interactionRate.reason
      });
    }
    
    if (factors.growthCurve.score < 60) {
      warnings.push({
        level: 'medium',
        message: factors.growthCurve.reason
      });
    }
    
    if (factors.timePlayRatio.score < 60) {
      warnings.push({
        level: 'high',
        message: factors.timePlayRatio.reason
      });
    }
    
    if (factors.growthContinuity.score < 60) {
      warnings.push({
        level: 'medium',
        message: factors.growthContinuity.reason
      });
    }
    
    return warnings;
  },
  
  /**
   * 批量评估
   */
  batchAssess(videos) {
    const logs = GrowthMonitor.getLogs();
    
    return videos.map(video => {
      const videoId = video.workUrl || video.id || video.title;
      const history = logs.filter(log => log.videoId === videoId);
      return {
        ...video,
        health: this.assess(video, history)
      };
    });
  },
  
  /**
   * 过滤健康数据
   */
  filterHealthy(videos, minScore = 60) {
    return this.batchAssess(videos).filter(v => v.health.score >= minScore);
  }
};

// 导出
window.DataHealth = DataHealth;
