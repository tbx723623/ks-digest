/**
 * 多画像号池系统
 * 自动分配账号、控制频率、自动轮换、自动休眠
 * 核心价值：智能管理推文账号
 */

const PoolManager = {
  STORAGE_KEY: 'ksPoolProfiles',
  ACCOUNTS_KEY: 'ksPoolAccounts',
  
  // 账号画像类型
  PROFILE_TYPES: {
    MALE: {
      id: 'male',
      label: '男频号',
      categories: ['逆袭', '系统', '神豪', '赘婿', '打脸', '重生', '穿越'],
      color: '#4a90d9',
      icon: '💪'
    },
    FEMALE: {
      id: 'female',
      label: '女频号',
      categories: ['豪门', '虐文', '甜宠', '宠文', '替身', '离婚', '认亲'],
      color: '#e91e8c',
      icon: '💖'
    },
    GENERAL: {
      id: 'general',
      label: '综合号',
      categories: ['解压', '推文', '短剧', '古言', '都市', '校园', '娱乐圈'],
      color: '#4caf50',
      icon: '📚'
    },
    HOT: {
      id: 'hot',
      label: '爆款号',
      categories: ['爆款', '热门', '热榜', 'top'],
      color: '#ff5722',
      icon: '🔥'
    }
  },
  
  /**
   * 初始化号池
   */
  init() {
    this.loadAccounts();
    this.loadProfiles();
  },
  
  /**
   * 加载账号列表
   */
  loadAccounts() {
    try {
      const stored = localStorage.getItem(this.ACCOUNTS_KEY);
      if (stored) {
        this.accounts = JSON.parse(stored);
      } else {
        this.accounts = this.getDefaultAccounts();
        this.saveAccounts();
      }
    } catch {
      this.accounts = this.getDefaultAccounts();
    }
  },
  
  /**
   * 获取默认账号列表
   */
  getDefaultAccounts() {
    return [
      {
        id: 'acc-001',
        name: '男频爆款号',
        profile: 'male',
        status: 'active',
        lastUsed: null,
        useCount: 0,
        successRate: 0.85,
        categories: ['逆袭', '系统', '神豪'],
        cooldown: 0,
        maxUsePerDay: 50,
        todayUse: 0
      },
      {
        id: 'acc-002',
        name: '女频甜宠号',
        profile: 'female',
        status: 'active',
        lastUsed: null,
        useCount: 0,
        successRate: 0.92,
        categories: ['甜宠', '豪门', '宠文'],
        cooldown: 0,
        maxUsePerDay: 50,
        todayUse: 0
      },
      {
        id: 'acc-003',
        name: '综合推文号',
        profile: 'general',
        status: 'active',
        lastUsed: null,
        useCount: 0,
        successRate: 0.78,
        categories: ['解压', '推文', '短剧'],
        cooldown: 0,
        maxUsePerDay: 50,
        todayUse: 0
      },
      {
        id: 'acc-004',
        name: '虐文专号',
        profile: 'female',
        status: 'active',
        lastUsed: null,
        useCount: 0,
        successRate: 0.88,
        categories: ['虐文', '替身', '离婚'],
        cooldown: 0,
        maxUsePerDay: 50,
        todayUse: 0
      },
      {
        id: 'acc-005',
        name: '逆袭打脸号',
        profile: 'male',
        status: 'active',
        lastUsed: null,
        useCount: 0,
        successRate: 0.82,
        categories: ['逆袭', '打脸', '重生'],
        cooldown: 0,
        maxUsePerDay: 50,
        todayUse: 0
      }
    ];
  },
  
  /**
   * 加载画像配置
   */
  loadProfiles() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.profiles = JSON.parse(stored);
      } else {
        this.profiles = { ...this.PROFILE_TYPES };
        this.saveProfiles();
      }
    } catch {
      this.profiles = { ...this.PROFILE_TYPES };
    }
  },
  
  /**
   * 保存账号列表
   */
  saveAccounts() {
    try {
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(this.accounts));
    } catch (e) {
      console.warn('保存账号列表失败:', e);
    }
  },
  
  /**
   * 保存画像配置
   */
  saveProfiles() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profiles));
    } catch (e) {
      console.warn('保存画像配置失败:', e);
    }
  },
  
  /**
   * 获取可用账号
   * @param {string} category - 题材类型
   * @returns {Object|null} 可用账号
   */
  getAvailableAccount(category = '') {
    const now = Date.now();
    
    // 找到匹配题材的活跃账号
    const available = this.accounts.filter(acc => {
      // 检查状态
      if (acc.status !== 'active') return false;
      
      // 检查冷却时间
      if (acc.cooldown > now) return false;
      
      // 检查每日使用限制
      if (acc.todayUse >= acc.maxUsePerDay) return false;
      
      // 检查题材匹配
      if (category && acc.categories.length > 0) {
        return acc.categories.some(cat => category.includes(cat));
      }
      
      return true;
    });
    
    if (available.length === 0) {
      // 没有匹配的，尝试找任何可用账号
      const anyAvailable = this.accounts.filter(acc => 
        acc.status === 'active' && 
        acc.cooldown <= now && 
        acc.todayUse < acc.maxUsePerDay
      );
      
      if (anyAvailable.length === 0) return null;
      
      // 使用最近最少使用的
      anyAvailable.sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0));
      return anyAvailable[0];
    }
    
    // 优先使用成功率高的
    available.sort((a, b) => b.successRate - a.successRate);
    return available[0];
  },
  
  /**
   * 使用账号
   * @param {string} accountId - 账号ID
   * @param {boolean} success - 是否成功
   */
  useAccount(accountId, success = true) {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    const now = Date.now();
    
    // 更新使用记录
    account.lastUsed = now;
    account.useCount++;
    account.todayUse++;
    
    // 更新成功率（滑动平均）
    const alpha = 0.1;
    account.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * account.successRate;
    
    // 如果失败，设置冷却时间
    if (!success) {
      account.cooldown = now + 5 * 60 * 1000; // 5分钟冷却
    }
    
    this.saveAccounts();
  },
  
  /**
   * 重置每日使用计数
   */
  resetDailyUsage() {
    this.accounts.forEach(acc => {
      acc.todayUse = 0;
    });
    this.saveAccounts();
  },
  
  /**
   * 获取账号状态
   */
  getAccountStatus() {
    const now = Date.now();
    
    return this.accounts.map(acc => ({
      ...acc,
      isCooling: acc.cooldown > now,
      remainingCooldown: Math.max(0, acc.cooldown - now),
      isDailyLimit: acc.todayUse >= acc.maxUsePerDay,
      profileLabel: this.profiles[acc.profile]?.label || '未知',
      profileIcon: this.profiles[acc.profile]?.icon || '❓'
    }));
  },
  
  /**
   * 添加账号
   */
  addAccount(account) {
    const newAccount = {
      id: 'acc-' + Date.now(),
      name: account.name || '新账号',
      profile: account.profile || 'general',
      status: 'active',
      lastUsed: null,
      useCount: 0,
      successRate: 0.8,
      categories: account.categories || [],
      cooldown: 0,
      maxUsePerDay: account.maxUsePerDay || 50,
      todayUse: 0
    };
    
    this.accounts.push(newAccount);
    this.saveAccounts();
    
    return newAccount;
  },
  
  /**
   * 删除账号
   */
  removeAccount(accountId) {
    this.accounts = this.accounts.filter(acc => acc.id !== accountId);
    this.saveAccounts();
  },
  
  /**
   * 更新账号
   */
  updateAccount(accountId, updates) {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    Object.assign(account, updates);
    this.saveAccounts();
  },
  
  /**
   * 获取账号统计
   */
  getStats() {
    const total = this.accounts.length;
    const active = this.accounts.filter(acc => acc.status === 'active').length;
    const cooling = this.accounts.filter(acc => acc.cooldown > Date.now()).length;
    const dailyLimited = this.accounts.filter(acc => acc.todayUse >= acc.maxUsePerDay).length;
    
    const totalUse = this.accounts.reduce((sum, acc) => sum + acc.useCount, 0);
    const avgSuccessRate = this.accounts.length > 0 
      ? this.accounts.reduce((sum, acc) => sum + acc.successRate, 0) / this.accounts.length 
      : 0;
    
    return {
      total,
      active,
      cooling,
      dailyLimited,
      totalUse,
      avgSuccessRate: Math.round(avgSuccessRate * 100)
    };
  },
  
  /**
   * 获取画像列表
   */
  getProfiles() {
    return Object.values(this.profiles);
  },
  
  /**
   * 获取指定画像的账号
   */
  getAccountsByProfile(profileId) {
    return this.accounts.filter(acc => acc.profile === profileId);
  }
};

// 导出
window.PoolManager = PoolManager;
