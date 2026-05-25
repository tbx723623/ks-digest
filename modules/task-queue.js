/**
 * 任务队列系统
 * 浏览器端任务队列，避免重复抓取、高频请求、数据阻塞
 * 核心价值：800人级性能优化
 */

const TaskQueue = {
  STORAGE_KEY: 'ksTaskQueue',
  queues: {
    fetch: [],      // 更新队列
    analysis: [],   // AI分析队列
    prediction: []  // 预测队列
  },
  processing: {},
  maxConcurrent: 2,
  
  /**
   * 初始化
   */
  init() {
    this.loadQueues();
    this.startProcessing();
    
    // 每天重置账号使用计数
    this.scheduleDailyReset();
  },
  
  /**
   * 加载队列
   */
  loadQueues() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.keys(this.queues).forEach(key => {
          if (data[key]) {
            this.queues[key] = data[key];
          }
        });
      }
    } catch (e) {
      console.warn('加载队列失败:', e);
    }
  },
  
  /**
   * 保存队列
   */
  saveQueues() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queues));
    } catch (e) {
      console.warn('保存队列失败:', e);
    }
  },
  
  /**
   * 添加任务
   * @param {string} queueName - 队列名称
   * @param {Object} task - 任务对象
   * @returns {string} 任务ID
   */
  addTask(queueName, task) {
    if (!this.queues[queueName]) {
      console.warn(`队列 ${queueName} 不存在`);
      return null;
    }
    
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const taskWithId = {
      ...task,
      id: taskId,
      queueName,
      status: 'pending',
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      error: null,
      retries: 0,
      maxRetries: task.maxRetries || 3
    };
    
    this.queues[queueName].push(taskWithId);
    this.saveQueues();
    
    console.log(`任务已添加: ${taskId} (${queueName})`);
    
    return taskId;
  },
  
  /**
   * 获取任务
   * @param {string} taskId - 任务ID
   * @returns {Object|null} 任务对象
   */
  getTask(taskId) {
    for (const queue of Object.values(this.queues)) {
      const task = queue.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  },
  
  /**
   * 更新任务状态
   */
  updateTask(taskId, updates) {
    for (const queue of Object.values(this.queues)) {
      const taskIndex = queue.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        Object.assign(queue[taskIndex], updates);
        this.saveQueues();
        return true;
      }
    }
    return false;
  },
  
  /**
   * 获取下一个待处理任务
   */
  getNextTask(queueName) {
    const queue = this.queues[queueName];
    if (!queue || queue.length === 0) return null;
    
    // 找到第一个pending任务
    return queue.find(t => t.status === 'pending');
  },
  
  /**
   * 开始处理队列
   */
  startProcessing() {
    // 每秒检查一次队列
    setInterval(() => {
      this.processQueues();
    }, 1000);
  },
  
  /**
   * 处理队列
   */
  async processQueues() {
    // 检查并发数
    const processingCount = Object.keys(this.processing).length;
    if (processingCount >= this.maxConcurrent) return;
    
    // 处理每个队列
    for (const queueName of Object.keys(this.queues)) {
      const task = this.getNextTask(queueName);
      if (!task) continue;
      
      // 检查是否已在处理
      if (this.processing[task.id]) continue;
      
      // 开始处理
      await this.processTask(task);
    }
  },
  
  /**
   * 处理单个任务
   */
  async processTask(task) {
    const { id, queueName, handler, data } = task;
    
    // 标记为处理中
    this.processing[id] = true;
    this.updateTask(id, { 
      status: 'processing', 
      startedAt: Date.now() 
    });
    
    try {
      // 执行任务处理器
      let result;
      
      switch (queueName) {
        case 'fetch':
          result = await this.handleFetchTask(data);
          break;
        case 'analysis':
          result = await this.handleAnalysisTask(data);
          break;
        case 'prediction':
          result = await this.handlePredictionTask(data);
          break;
        default:
          throw new Error(`未知队列: ${queueName}`);
      }
      
      // 标记为完成
      this.updateTask(id, { 
        status: 'completed', 
        completedAt: Date.now(),
        result 
      });
      
      console.log(`任务完成: ${id}`);
      
    } catch (error) {
      console.error(`任务失败: ${id}`, error);
      
      // 检查重试次数
      const taskObj = this.getTask(id);
      if (taskObj && taskObj.retries < taskObj.maxRetries) {
        // 重试
        this.updateTask(id, { 
          status: 'pending', 
          retries: taskObj.retries + 1,
          error: error.message 
        });
      } else {
        // 标记为失败
        this.updateTask(id, { 
          status: 'failed', 
          completedAt: Date.now(),
          error: error.message 
        });
      }
    } finally {
      // 移除处理中标记
      delete this.processing[id];
    }
  },
  
  /**
   * 处理抓取任务
   */
  async handleFetchTask(data) {
    const { keywords, category } = data;
    
    // 调用MiMo API
    const prompt = `搜索快手热榜数据，关键词：${keywords.join('、')}，题材：${category || '全部'}。返回JSON数组，每条包含title、playCount、likeCount、category、workUrl。`;
    
    // 这里调用实际的API
    // 返回结果
    return { fetched: true, count: 0 };
  },
  
  /**
   * 处理分析任务
   */
  async handleAnalysisTask(data) {
    const { type, videos } = data;
    
    // 调用AI分析
    let result;
    
    switch (type) {
      case 'trends':
        result = await AiAnalyzer.analyzeTrends(videos);
        break;
      case 'pleasure':
        result = await AiAnalyzer.analyzePleasurePoints(videos.map(v => v.title));
        break;
      case 'titles':
        result = await AiAnalyzer.analyzeTitleStyles(videos.map(v => v.title));
        break;
      default:
        throw new Error(`未知分析类型: ${type}`);
    }
    
    return result;
  },
  
  /**
   * 处理预测任务
   */
  async handlePredictionTask(data) {
    const { videos } = data;
    
    // 执行预测
    const predictions = PredictEngine.batchPredict(videos);
    
    return { predictions, count: predictions.length };
  },
  
  /**
   * 获取队列状态
   */
  getQueueStatus() {
    const status = {};
    
    Object.keys(this.queues).forEach(queueName => {
      const queue = this.queues[queueName];
      status[queueName] = {
        total: queue.length,
        pending: queue.filter(t => t.status === 'pending').length,
        processing: queue.filter(t => t.status === 'processing').length,
        completed: queue.filter(t => t.status === 'completed').length,
        failed: queue.filter(t => t.status === 'failed').length
      };
    });
    
    return status;
  },
  
  /**
   * 清理已完成任务
   */
  cleanCompleted() {
    Object.keys(this.queues).forEach(queueName => {
      this.queues[queueName] = this.queues[queueName].filter(t => t.status !== 'completed');
    });
    this.saveQueues();
  },
  
  /**
   * 清理所有任务
   */
  cleanAll() {
    Object.keys(this.queues).forEach(queueName => {
      this.queues[queueName] = [];
    });
    this.saveQueues();
  },
  
  /**
   * 计划每日重置
   */
  scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
      // 重置账号使用计数
      if (window.PoolManager) {
        PoolManager.resetDailyUsage();
      }
      
      // 清理已完成任务
      this.cleanCompleted();
      
      // 计划下一天重置
      this.scheduleDailyReset();
    }, msUntilMidnight);
  },
  
  /**
   * 添加抓取任务
   */
  addFetchTask(keywords, category = '') {
    return this.addTask('fetch', {
      name: `抓取: ${keywords.join('、')}`,
      handler: 'fetch',
      data: { keywords, category },
      maxRetries: 2
    });
  },
  
  /**
   * 添加分析任务
   */
  addAnalysisTask(type, videos) {
    return this.addTask('analysis', {
      name: `分析: ${type}`,
      handler: 'analysis',
      data: { type, videos },
      maxRetries: 1
    });
  },
  
  /**
   * 添加预测任务
   */
  addPredictionTask(videos) {
    return this.addTask('prediction', {
      name: '爆款预测',
      handler: 'prediction',
      data: { videos },
      maxRetries: 1
    });
  }
};

// 导出
window.TaskQueue = TaskQueue;
