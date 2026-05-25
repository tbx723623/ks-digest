/**
 * 主入口文件
 * 整合所有模块，初始化系统
 */

const App = {
  initialized: false,
  
  /**
   * 初始化应用
   */
  async init() {
    if (this.initialized) return;
    
    console.log('🚀 小说推文AI爆款预测平台 初始化中...');
    
    try {
      // 初始化各模块
      await this.initModules();
      
      // 绑定事件
      this.bindEvents();
      
      // 加载数据
      await this.loadData();
      
      // 渲染界面
      this.render();
      
      // 启动定时任务
      this.startSchedulers();
      
      this.initialized = true;
      console.log('✅ 系统初始化完成');
      
    } catch (error) {
      console.error('❌ 初始化失败:', error);
    }
  },
  
  /**
   * 初始化模块
   */
  async initModules() {
    // 初始化号池管理器
    PoolManager.init();
    
    // 初始化任务队列
    TaskQueue.init();
    
    // 初始化趋势图表
    await TrendChart.init();
    
    console.log('📦 模块初始化完成');
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 榜单切换
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });
    
    // 刷新按钮
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
      this.refreshData();
    });
    
    // AI分析按钮
    document.getElementById('analyzeBtn')?.addEventListener('click', () => {
      this.runAiAnalysis();
    });
    
    // 预测按钮
    document.getElementById('predictBtn')?.addEventListener('click', () => {
      this.runPrediction();
    });
    
    // 时间范围切换
    document.querySelectorAll('[data-range]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const range = e.target.dataset.range;
        this.switchTimeRange(range);
      });
    });
    
    console.log('🔗 事件绑定完成');
  },
  
  /**
   * 加载数据
   */
  async loadData() {
    try {
      // 加载所有数据文件
      const [
        realtimeData,
        dailyData,
        rankingsData,
        predictionsData,
        growthData,
        explosiveData,
        hotData,
        trendData,
        predictData
      ] = await Promise.all([
        this.fetchData('./data/realtime.json'),
        this.fetchData('./data/daily.json'),
        this.fetchData('./data/rankings.json'),
        this.fetchData('./data/predictions.json'),
        this.fetchData('./data/growth.json'),
        this.fetchData('./data/explosive.json'),
        this.fetchData('./data/hot.json'),
        this.fetchData('./data/trend.json'),
        this.fetchData('./data/predict.json')
      ]);
      
      // 合并所有数据（真实数据优先）
      const allRaw = [
        ...(explosiveData.items || []),
        ...(hotData.items || []),
        ...(trendData.items || []),
        ...(predictData.items || []),
        ...(realtimeData.items || []),
        ...(dailyData.items || [])
      ];
      
      // 去重（真实数据优先）
      const seen = new Set();
      this.allItems = [];
      for (const item of allRaw) {
        const key = item.videoId || (item.title + (item.sourceUrl || item.workUrl || ''));
        if (seen.has(key)) continue;
        seen.add(key);
        this.allItems.push(item);
      }
      
      // 保存服务端数据
      this.rankings = rankingsData;
      this.predictions = predictionsData;
      this.growthData = growthData;
      this.explosiveData = explosiveData;
      this.hotData = hotData;
      this.trendData = trendData;
      this.predictData = predictData;
      
      // 记录快照（用于增长率计算）
      GrowthMonitor.recordSnapshot(this.allItems);
      
      const realCount = this.allItems.filter(i => i.isReal || i.sourceUrl?.includes('kuaishou.com')).length;
      console.log(`📊 加载数据: ${this.allItems.length} 条 (真实: ${realCount})`);
      console.log(`📈 增长记录: ${(growthData.logs || []).length} 条`);
      
    } catch (error) {
      console.warn('加载数据失败:', error);
      this.allItems = [];
    }
  },
  
  /**
   * 获取数据
   */
  async fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) return {};
      return await response.json();
    } catch {
      return {};
    }
  },
  
  /**
   * 渲染界面
   */
  render() {
    this.renderStats();
    this.renderExplodingVideos();
    this.renderHighPotential();
    this.renderCategoryTrend();
    this.renderPoolStatus();
    this.renderTrendChart();
  },
  
  /**
   * 渲染统计数据
   */
  renderStats() {
    const growthStats = this.growthData?.stats || GrowthMonitor.getStats();
    const predictions = this.predictions?.local || PredictEngine.getPredictions();
    const poolStats = PoolManager.getStats();
    const rankings = this.rankings || {};
    
    const statsHtml = `
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">${this.formatNumber(growthStats.uniqueVideos || 0)}</div>
        <div class="stat-label">监控视频</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${this.formatNumber(growthStats.totalRecords || 0)}</div>
        <div class="stat-label">增长记录</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-value">${rankings.anomalyGrowth?.items?.length || 0}</div>
        <div class="stat-label">异常增长</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${rankings.highPotential?.items?.length || predictions.filter(p => (p.explosionRate || 0) >= 60).length}</div>
        <div class="stat-label">高潜力</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${rankings.todayNewExploding?.items?.length || 0}</div>
        <div class="stat-label">今日新爆</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">${poolStats.active}/${poolStats.total}</div>
        <div class="stat-label">活跃账号</div>
      </div>
    `;
    
    document.getElementById('statsContainer').innerHTML = statsHtml;
  },
  
  /**
   * 渲染正在爆发的视频
   */
  renderExplodingVideos() {
    // 使用时间序列引擎分析
    const logs = GrowthMonitor.getLogs();
    const videoMap = {};
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    logs.filter(l => l.timestamp > oneHourAgo).forEach(log => {
      if (!videoMap[log.videoId]) {
        videoMap[log.videoId] = {
          videoId: log.videoId,
          title: log.title,
          category: log.category || [],
          playCount: log.playCount || 0,
          history: []
        };
      }
      videoMap[log.videoId].history.push(log);
    });
    
    // 用时间序列引擎分析
    const analyzed = Object.values(videoMap)
      .filter(v => v.history.length >= 2)
      .map(v => {
        const prediction = TimeSeriesEngine.predict(v, v.history);
        return prediction;
      })
      .filter(p => p.lifecycle.stage === 'exploding' || p.lifecycle.stage === 'rising' || p.acceleration.trend === 'accelerating')
      .sort((a, b) => b.explosionRate - a.explosionRate)
      .slice(0, 10);
    
    const serverItems = analyzed.length > 0 ? analyzed : (this.rankings?.anomalyGrowth?.items || []);
    const container = document.getElementById('explodingList');
    
    if (!container) return;
    
    if (!serverItems || serverItems.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无爆发视频，等待数据积累中...</div>';
      return;
    }
    
    const html = serverItems.slice(0, 10).map((video, index) => {
      // 尝试从 allItems 中找到对应的 sourceUrl
      const matched = this.allItems.find(i => i.videoId === video.videoId || i.title === video.title);
      const sourceUrl = video.sourceUrl || matched?.sourceUrl || '';
      const authorName = video.authorName || matched?.authorName || '';
      
      return `
      <div class="exploding-item ${index < 3 ? 'top-3' : ''}">
        <div class="exploding-rank">${index + 1}</div>
        <div class="exploding-info">
          <div class="exploding-title">${this.escapeHtml(video.title || '')}</div>
          <div class="exploding-meta">
            <span class="exploding-growth">+${this.formatNumber(video.growthRate || video.momentum?.currentMomentum || 0)}/分</span>
            ${video.lifecycle ? `<span class="exploding-stage stage-${video.lifecycle.stage}">${video.lifecycle.stageLabel}</span>` : ''}
            ${video.acceleration ? `<span class="exploding-accel">${video.acceleration.level}</span>` : ''}
            <span class="exploding-plays">${this.formatNumber(video.playCount || 0)}次播放</span>
            ${authorName ? `<span class="exploding-author">👤 ${this.escapeHtml(authorName)}</span>` : ''}
            ${(video.category || []).slice(0, 2).map(c => `<span class="exploding-cat">${c}</span>`).join('')}
          </div>
        </div>
        ${sourceUrl ? `<a class="exploding-link" href="${this.escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">查看原视频</a>` : ''}
      </div>
    `}).join('');
    
    container.innerHTML = html;
  },
  
  /**
   * 渲染高潜力视频
   */
  renderHighPotential() {
    // 使用时间序列引擎预测
    const logs = GrowthMonitor.getLogs();
    const videoMap = {};
    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    
    logs.filter(l => l.timestamp > twoHoursAgo).forEach(log => {
      if (!videoMap[log.videoId]) {
        videoMap[log.videoId] = {
          videoId: log.videoId,
          title: log.title,
          category: log.category || [],
          playCount: log.playCount || 0,
          likeCount: log.likeCount || 0,
          history: []
        };
      }
      videoMap[log.videoId].history.push(log);
    });
    
    const analyzed = Object.values(videoMap)
      .filter(v => v.history.length >= 2)
      .map(v => {
        const prediction = TimeSeriesEngine.predict(v, v.history);
        const health = DataHealth.assess(v, v.history);
        return { ...prediction, health };
      })
      .filter(p => p.explosionRate >= 50 && p.health.isHealthy)
      .sort((a, b) => b.explosionRate - a.explosionRate)
      .slice(0, 10);
    
    const serverItems = analyzed.length > 0 ? analyzed : (this.rankings?.highPotential?.items || []);
    const container = document.getElementById('potentialList');
    
    if (!container) return;
    
    if (!serverItems || serverItems.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无高潜力视频，运行AI预测后显示</div>';
      return;
    }
    
    const html = serverItems.slice(0, 10).map((video, index) => {
      const matched = this.allItems.find(i => i.videoId === video.videoId || i.title === video.title);
      const sourceUrl = video.sourceUrl || matched?.sourceUrl || '';
      
      return `
      <div class="potential-item">
        <div class="potential-rate">
          <div class="rate-circle" style="--rate: ${video.explosionRate || 0}">
            <span>${video.explosionRate || 0}%</span>
          </div>
        </div>
        <div class="potential-info">
          <div class="potential-title">${this.escapeHtml(video.title || '')}</div>
          <div class="potential-meta">
            ${video.confidence ? `<span class="potential-confidence" title="可信度">${video.confidence.level}</span>` : ''}
            ${video.lifecycle ? `<span class="potential-stage stage-${video.lifecycle.stage}">${video.lifecycle.stageLabel}</span>` : ''}
            <span class="potential-velocity">${video.velocityLevel || '快速'}</span>
            <span class="potential-time">${video.estimatedTime || '2小时内'}</span>
          </div>
        </div>
        ${sourceUrl ? `<a class="potential-link" href="${this.escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">查看原视频</a>` : ''}
      </div>
    `}).join('');
    
    container.innerHTML = html;
  },
  
  /**
   * 渲染题材趋势
   */
  renderCategoryTrend() {
    const serverData = this.rankings?.categoryTrend?.items;
    
    if (serverData && serverData.length > 0) {
      const container = document.getElementById('categoryChart');
      if (!container) return;
      
      const html = serverData.slice(0, 10).map((item, index) => {
        const maxGrowth = serverData[0].avgGrowth || 1;
        const width = Math.max(10, (item.avgGrowth / maxGrowth) * 100);
        return `
          <div class="category-bar-item">
            <span class="category-name">${item.category}</span>
            <div class="category-bar-bg">
              <div class="category-bar-fill" style="width: ${width}%"></div>
            </div>
            <span class="category-value">${this.formatNumber(item.avgGrowth)}/分 · ${item.count}条</span>
          </div>
        `;
      }).join('');
      
      container.innerHTML = html;
    } else {
      const categories = ['穿越', '重生', '逆袭', '豪门', '甜宠', '虐文', '系统', '复仇', '打脸', '赘婿'];
      TrendChart.createCategoryTrendChart('categoryChart', categories);
    }
  },
  
  /**
   * 渲染号池状态
   */
  renderPoolStatus() {
    const accounts = PoolManager.getAccountStatus();
    const container = document.getElementById('poolList');
    
    if (!container) return;
    
    const html = accounts.map(acc => `
      <div class="pool-item ${acc.isCooling ? 'cooling' : ''} ${acc.isDailyLimit ? 'limited' : ''}">
        <div class="pool-icon">${acc.profileIcon}</div>
        <div class="pool-info">
          <div class="pool-name">${this.escapeHtml(acc.name)}</div>
          <div class="pool-meta">
            <span class="pool-profile">${acc.profileLabel}</span>
            <span class="pool-success">成功率 ${Math.round(acc.successRate * 100)}%</span>
            <span class="pool-usage">今日 ${acc.todayUse}/${acc.maxUsePerDay}</span>
          </div>
        </div>
        <div class="pool-status">
          ${acc.isCooling ? '<span class="status-cooling">冷却中</span>' : ''}
          ${acc.isDailyLimit ? '<span class="status-limited">已达上限</span>' : ''}
          ${!acc.isCooling && !acc.isDailyLimit ? '<span class="status-active">可用</span>' : ''}
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
  },
  
  /**
   * 渲染趋势图表
   */
  renderTrendChart() {
    TrendChart.createHeatTrendChart('trendChart', '24h');
    this.renderHotRanking();
  },
  
  /**
   * 渲染综合热度榜
   */
  renderHotRanking() {
    const hotItems = this.rankings?.hotRanking?.items || [];
    const container = document.getElementById('hotRankingList');
    
    if (!container) return;
    
    if (hotItems.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无热度数据，等待首次抓取...</div>';
      return;
    }
    
    const html = hotItems.slice(0, 20).map((item, index) => {
      const rankClass = index < 3 ? `rank-${index + 1}` : '';
      return `
        <div class="hot-rank-item ${rankClass}">
          <div class="hot-rank-num">${index + 1}</div>
          <div class="hot-rank-info">
            <div class="hot-rank-title">${this.escapeHtml(item.title || '')}</div>
            <div class="hot-rank-meta">
              <span class="hot-rank-score">综合分 ${this.formatNumber(item.score || 0)}</span>
              <span class="hot-rank-growth">增长 ${this.formatNumber(item.totalGrowth || 0)}</span>
              <span class="hot-rank-plays">${this.formatNumber(item.playCount || 0)}次播放</span>
              ${(item.category || []).slice(0, 2).map(c => `<span class="hot-rank-cat">${c}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  },
  
  /**
   * 切换标签
   */
  switchTab(tab) {
    // 更新标签状态
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `tab-${tab}`);
    });
  },
  
  /**
   * 切换时间范围
   */
  switchTimeRange(range) {
    document.querySelectorAll('[data-range]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.range === range);
    });
    
    TrendChart.createHeatTrendChart('trendChart', range);
  },
  
  /**
   * 刷新数据
   */
  async refreshData() {
    const btn = document.getElementById('refreshBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '刷新中...';
    }
    
    try {
      await this.loadData();
      this.render();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '刷新数据';
      }
    }
  },
  
  /**
   * 运行AI分析
   */
  async runAiAnalysis() {
    const btn = document.getElementById('analyzeBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '分析中...';
    }
    
    try {
      const videos = this.allItems.slice(0, 50);
      await AiAnalyzer.analyzeTrends(videos);
      this.render();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'AI分析';
      }
    }
  },
  
  /**
   * 运行预测
   */
  async runPrediction() {
    const btn = document.getElementById('predictBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '预测中...';
    }
    
    try {
      const videos = this.allItems.slice(0, 50);
      PredictEngine.batchPredict(videos);
      this.render();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '爆款预测';
      }
    }
  },
  
  /**
   * 查看视频详情
   */
  viewVideo(videoId) {
    // 打开视频详情弹窗
    console.log('查看视频:', videoId);
  },
  
  /**
   * 启动定时任务
   */
  startSchedulers() {
    // 每5分钟刷新数据
    setInterval(() => {
      this.loadData().then(() => this.render());
    }, 5 * 60 * 1000);
    
    // 每10分钟运行预测
    setInterval(() => {
      if (this.allItems.length > 0) {
        PredictEngine.batchPredict(this.allItems.slice(0, 50));
      }
    }, 10 * 60 * 1000);
    
    console.log('⏰ 定时任务已启动');
  },
  
  /**
   * 格式化数字
   */
  formatNumber(num) {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
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
   * 转义HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 导出
window.App = App;
