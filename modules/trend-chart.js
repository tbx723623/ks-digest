/**
 * 趋势曲线系统
 * 使用Chart.js创建趋势曲线图表
 * 核心价值：可视化展示增长趋势
 */

const TrendChart = {
  charts: {},
  colors: [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
    '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
  ],
  
  /**
   * 初始化Chart.js
   */
  init() {
    // 动态加载Chart.js
    if (window.Chart) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = () => {
        console.log('Chart.js 加载成功');
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  
  /**
   * 创建视频增长曲线
   * @param {string} containerId - 容器ID
   * @param {string} videoId - 视频ID
   * @param {string} title - 图表标题
   */
  async createVideoGrowthChart(containerId, videoId, title = '视频增长曲线') {
    await this.init();
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 获取历史数据
    const history = GrowthMonitor.getVideoHistory(videoId);
    if (history.length < 2) {
      container.innerHTML = '<div class="chart-empty">数据不足，需要至少2次记录</div>';
      return;
    }
    
    // 准备数据
    const labels = history.map(h => this.formatTime(h.timestamp));
    const playData = history.map(h => h.playCount || 0);
    const likeData = history.map(h => h.likeCount || 0);
    const growthData = history.map(h => h.growthRate || 0);
    
    // 创建canvas
    container.innerHTML = `<canvas id="chart-${containerId}"></canvas>`;
    const canvas = document.getElementById(`chart-${containerId}`);
    
    // 销毁旧图表
    if (this.charts[containerId]) {
      this.charts[containerId].destroy();
    }
    
    // 创建图表
    this.charts[containerId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '播放量',
            data: playData,
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '点赞量',
            data: likeData,
            borderColor: '#4ecdc4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '增长率',
            data: growthData,
            borderColor: '#45b7d1',
            backgroundColor: 'rgba(69, 183, 209, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: title,
            color: '#fff',
            font: { size: 14 }
          },
          legend: {
            labels: {
              color: '#fff'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#aaa' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: '#aaa',
              callback: (value) => this.formatNumber(value)
            },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
              color: '#aaa',
              callback: (value) => value + '%'
            },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  },
  
  /**
   * 创建题材趋势图
   * @param {string} containerId - 容器ID
   * @param {Array} categories - 题材列表
   */
  async createCategoryTrendChart(containerId, categories = []) {
    await this.init();
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 获取增长率数据
    const logs = GrowthMonitor.getLogs();
    const now = Date.now();
    
    // 按题材统计
    const categoryData = {};
    categories.forEach(cat => {
      categoryData[cat] = {
        totalGrowth: 0,
        count: 0,
        avgGrowth: 0
      };
    });
    
    logs.forEach(log => {
      if (now - log.timestamp > 24 * 60 * 60 * 1000) return; // 只看24小时内
      
      (log.category || []).forEach(cat => {
        if (categoryData[cat]) {
          categoryData[cat].totalGrowth += log.growthRate || 0;
          categoryData[cat].count++;
        }
      });
    });
    
    // 计算平均增长率
    Object.keys(categoryData).forEach(cat => {
      const data = categoryData[cat];
      data.avgGrowth = data.count > 0 ? Math.round(data.totalGrowth / data.count) : 0;
    });
    
    // 排序
    const sortedCategories = Object.entries(categoryData)
      .sort((a, b) => b[1].avgGrowth - a[1].avgGrowth)
      .slice(0, 10);
    
    // 准备数据
    const labels = sortedCategories.map(([cat]) => cat);
    const data = sortedCategories.map(([, data]) => data.avgGrowth);
    const colors = this.colors.slice(0, labels.length);
    
    // 创建canvas
    container.innerHTML = `<canvas id="chart-${containerId}"></canvas>`;
    const canvas = document.getElementById(`chart-${containerId}`);
    
    // 销毁旧图表
    if (this.charts[containerId]) {
      this.charts[containerId].destroy();
    }
    
    // 创建图表
    this.charts[containerId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '平均增长率',
          data,
          backgroundColor: colors.map(c => c + '80'),
          borderColor: colors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: '题材增长率排行（24小时）',
            color: '#fff',
            font: { size: 14 }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#aaa',
              callback: (value) => this.formatNumber(value) + '/分钟'
            },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            ticks: { color: '#fff' },
            grid: { display: false }
          }
        }
      }
    });
  },
  
  /**
   * 创建热度趋势图
   * @param {string} containerId - 容器ID
   * @param {string} timeRange - 时间范围 ('1h', '24h', '7d')
   */
  async createHeatTrendChart(containerId, timeRange = '24h') {
    await this.init();
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 获取数据
    const logs = GrowthMonitor.getLogs();
    const now = Date.now();
    
    // 时间范围
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    const rangeMs = timeRanges[timeRange] || timeRanges['24h'];
    const filteredLogs = logs.filter(log => now - log.timestamp < rangeMs);
    
    // 按时间分组
    const timeGroups = {};
    const interval = rangeMs / 20; // 分成20个点
    
    filteredLogs.forEach(log => {
      const groupIndex = Math.floor((now - log.timestamp) / interval);
      const groupKey = now - groupIndex * interval;
      
      if (!timeGroups[groupKey]) {
        timeGroups[groupKey] = {
          totalGrowth: 0,
          count: 0,
          avgGrowth: 0
        };
      }
      
      timeGroups[groupKey].totalGrowth += log.growthRate || 0;
      timeGroups[groupKey].count++;
    });
    
    // 计算平均值
    Object.keys(timeGroups).forEach(key => {
      const group = timeGroups[key];
      group.avgGrowth = group.count > 0 ? Math.round(group.totalGrowth / group.count) : 0;
    });
    
    // 排序并准备数据
    const sortedGroups = Object.entries(timeGroups)
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    
    const labels = sortedGroups.map(([timestamp]) => this.formatTime(Number(timestamp)));
    const data = sortedGroups.map(([, group]) => group.avgGrowth);
    
    // 创建canvas
    container.innerHTML = `<canvas id="chart-${containerId}"></canvas>`;
    const canvas = document.getElementById(`chart-${containerId}`);
    
    // 销毁旧图表
    if (this.charts[containerId]) {
      this.charts[containerId].destroy();
    }
    
    // 创建图表
    this.charts[containerId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '热度趋势',
          data,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#ff6b6b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `热度趋势（${timeRange === '1h' ? '1小时' : timeRange === '24h' ? '24小时' : '7天'}）`,
            color: '#fff',
            font: { size: 14 }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { color: '#aaa', maxRotation: 45 },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            ticks: {
              color: '#aaa',
              callback: (value) => this.formatNumber(value)
            },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    });
  },
  
  /**
   * 创建预测分布图
   * @param {string} containerId - 容器ID
   * @param {Array} predictions - 预测数据
   */
  async createPredictionChart(containerId, predictions = []) {
    await this.init();
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 按爆率分组
    const groups = {
      '90-100%': 0,
      '80-90%': 0,
      '70-80%': 0,
      '60-70%': 0,
      '50-60%': 0,
      '<50%': 0
    };
    
    predictions.forEach(p => {
      const rate = p.explosionRate || 0;
      if (rate >= 90) groups['90-100%']++;
      else if (rate >= 80) groups['80-90%']++;
      else if (rate >= 70) groups['70-80%']++;
      else if (rate >= 60) groups['60-70%']++;
      else if (rate >= 50) groups['50-60%']++;
      else groups['<50%']++;
    });
    
    const labels = Object.keys(groups);
    const data = Object.values(groups);
    const colors = ['#ff4444', '#ff8800', '#ffcc00', '#44ff44', '#4488ff', '#888888'];
    
    // 创建canvas
    container.innerHTML = `<canvas id="chart-${containerId}"></canvas>`;
    const canvas = document.getElementById(`chart-${containerId}`);
    
    // 销毁旧图表
    if (this.charts[containerId]) {
      this.charts[containerId].destroy();
    }
    
    // 创建图表
    this.charts[containerId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map(c => c + '80'),
          borderColor: colors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '爆款预测分布',
            color: '#fff',
            font: { size: 14 }
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#fff',
              padding: 15
            }
          }
        }
      }
    });
  },
  
  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
   * 销毁所有图表
   */
  destroyAll() {
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
  }
};

// 导出
window.TrendChart = TrendChart;
