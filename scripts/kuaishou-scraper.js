/**
 * 快手推荐流真实抓取系统 V2
 * 使用 Playwright 浏览器自动化，真正访问快手页面
 * 
 * 核心策略：
 * 1. 拦截快手 API 请求，获取结构化数据（最可靠）
 * 2. DOM 解析作为备用方案
 * 3. 反检测 + 真人行为模拟
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============ 配置 ============
const CONFIG = {
  DATA_DIR: path.join(__dirname, '..', 'data'),
  
  // 快手页面
  KUAISHOU_EXPLORE: 'https://www.kuaishou.com/explore',
  KUAISHOU_SEARCH: 'https://www.kuaishou.com/search/video',
  
  // 抓取配置
  MAX_VIDEOS: 50,
  SCROLL_DELAY_MIN: 2000,
  SCROLL_DELAY_MAX: 5000,
  VIDEO_WATCH_MIN: 3000,
  VIDEO_WATCH_MAX: 8000,
  PAGE_TIMEOUT: 30000,
  
  // 号池配置
  POOLS: {
    male: {
      name: '男频号',
      interests: ['系统', '神豪', '逆袭', '打脸', '重生', '赘婿'],
      searchTerms: ['逆袭打脸', '系统流', '神豪重生', '赘婿逆袭']
    },
    female: {
      name: '女频号',
      interests: ['豪门', '虐文', '甜宠', '追妻火葬场', '总裁'],
      searchTerms: ['豪门甜宠', '虐文推荐', '追妻火葬场', '总裁文']
    },
    new_book: {
      name: '新书号',
      interests: ['新发布', '新书推荐'],
      searchTerms: ['新书推荐', '小说推文新书', '解压推文新']
    },
    hot: {
      name: '高热号',
      interests: ['高增长', '爆款'],
      searchTerms: ['小说推文爆款', '解压推文热门', '推文排行榜']
    }
  }
};

// ============ 工具函数 ============
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDelay(min, max) {
  const ms = randomInt(min || CONFIG.SCROLL_DELAY_MIN, max || CONFIG.SCROLL_DELAY_MAX);
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCount(text) {
  if (!text) return 0;
  if (typeof text === 'number') return text;
  text = String(text).replace(/,/g, '').replace(/\s/g, '');
  
  const match = text.match(/([\d.]+)\s*(万|亿|w)?/i);
  if (!match) return 0;
  
  let count = parseFloat(match[1]);
  if (match[2] === '万' || match[2] === 'w') count *= 10000;
  if (match[2] === '亿') count *= 100000000;
  
  return Math.floor(count);
}

function formatCount(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return String(num);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ 快手爬虫类 ============
class KuaishouScraper {
  constructor(poolType = 'hot') {
    this.poolType = poolType;
    this.poolConfig = CONFIG.POOLS[poolType] || CONFIG.POOLS.hot;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = [];
    this.seenIds = new Set();
    this.interceptedData = []; // 拦截到的 API 数据
  }

  // 初始化浏览器
  async init() {
    console.log('🚀 初始化浏览器...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ]
    });

    // 创建上下文，模拟真实浏览器
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
      extraHTTPHeaders: {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    });

    // 注入反检测脚本
    await this.context.addInitScript(() => {
      // 隐藏 webdriver 属性
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      
      // 模拟插件
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          const plugins = [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
            { name: 'Native Client', filename: 'internal-nacl-plugin' }
          ];
          plugins.length = 3;
          return plugins;
        }
      });

      // 模拟语言
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en-US', 'en']
      });

      // 隐藏自动化痕迹
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
      
      // 模拟 chrome 对象
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };

      // 修改 permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(CONFIG.PAGE_TIMEOUT);

    // 设置 API 拦截
    this.setupApiInterception();

    console.log('✅ 浏览器初始化完成');
  }

  // 设置 API 拦截 - 捕获快手的真实 API 响应
  setupApiInterception() {
    this.page.on('response', async (response) => {
      const url = response.url();
      
      // 拦截快手的推荐流 API
      if (url.includes('/graphql') || 
          url.includes('/rest/wd/feed/explore') ||
          url.includes('/rest/wd/feed/hot') ||
          url.includes('/vision/feed/explore') ||
          url.includes('/pc/feed/explore') ||
          url.includes('/api/feed/hot') ||
          url.includes('/n/wd/feed/explore')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json') || contentType.includes('graphql')) {
            const data = await response.json();
            if (data) {
              this.interceptedData.push({
                url,
                data,
                timestamp: Date.now()
              });
              console.log(`  📡 拦截到 API 响应: ${url.substring(0, 80)}...`);
            }
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    });
  }

  // 从拦截的 API 数据中提取视频信息
  extractFromInterceptedData() {
    const videos = [];
    
    for (const item of this.interceptedData) {
      try {
        const data = item.data;
        
        // 尝试多种数据结构
        const feedItems = 
          data?.data?.visionFeed?.feedList ||
          data?.data?.exploreFeed?.feedList ||
          data?.data?.feed?.list ||
          data?.data?.pcFeed?.list ||
          data?.feeds ||
          data?.data?.list ||
          [];
        
        if (Array.isArray(feedItems)) {
          for (const feed of feedItems) {
            const photo = feed.photo || feed;
            const author = feed.author || photo?.author || {};
            
            if (!photo?.id && !photo?.photoId) continue;
            
            const videoId = photo.id || photo.photoId || '';
            if (this.seenIds.has(videoId)) continue;
            this.seenIds.add(videoId);

            videos.push({
              videoId,
              title: photo.caption || photo.title || '',
              sourceUrl: `https://www.kuaishou.com/short-video/${videoId}`,
              authorName: author.name || author.nickname || '',
              authorUrl: author.homeUrl || (author.id ? `https://www.kuaishou.com/profile/${author.id}` : ''),
              authorId: author.id || '',
              publishTime: photo.timestamp ? new Date(photo.timestamp).toISOString() : '',
              likeCount: photo.likeCount || photo.likingCount || 0,
              commentCount: photo.commentCount || photo.realCommentCount || 0,
              shareCount: photo.shareCount || photo.forwardCount || 0,
              viewCount: photo.viewCount || photo.playCount || 0,
              poolType: this.poolType,
              collectedAt: new Date().toISOString(),
              source: 'api_intercept'
            });
          }
        }
      } catch (e) {
        // 忽略单条解析错误
      }
    }
    
    return videos;
  }

  // DOM 解析备用方案
  async extractFromDOM() {
    return await this.page.evaluate(() => {
      const videos = [];
      
      // 快手推荐流的视频卡片选择器（2025年版本）
      const selectors = [
        'a[href*="/short-video/"]',
        'a[href*="/video/"]',
        '[class*="video-card"]',
        '[class*="feed-item"]',
        '[class*="recommend"]',
        '.explore-feed .item',
        '[data-type="video"]'
      ];
      
      let links = [];
      for (const selector of selectors) {
        links = document.querySelectorAll(selector);
        if (links.length > 0) break;
      }
      
      links.forEach(el => {
        try {
          const href = el.href || el.querySelector('a')?.href || '';
          const videoIdMatch = href.match(/\/short-video\/([a-zA-Z0-9_-]+)/) || 
                               href.match(/\/video\/([a-zA-Z0-9_-]+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : '';
          
          if (!videoId) return;
          
          // 找到包含此链接的卡片容器
          const card = el.closest('[class*="card"]') || el.closest('[class*="item"]') || el.parentElement?.parentElement || el;
          const cardText = card?.textContent || '';
          
          // 提取标题
          const titleEl = card.querySelector('[class*="title"], [class*="desc"], [class*="caption"], h3, h4, p');
          const title = titleEl?.textContent?.trim() || '';
          
          // 提取作者
          const authorEl = card.querySelector('[class*="author"], [class*="name"], [class*="user"]');
          const authorName = authorEl?.textContent?.trim() || '';
          const authorLink = card.querySelector('a[href*="/profile/"]');
          const authorUrl = authorLink?.href || '';
          
          // 提取互动数据
          const likeMatch = cardText.match(/([\d.]+万?)\s*(赞|❤)/);
          const commentMatch = cardText.match(/([\d.]+万?)\s*评/);
          
          videos.push({
            videoId,
            title: title.substring(0, 100),
            sourceUrl: href,
            authorName,
            authorUrl,
            likeCount: likeMatch ? likeMatch[1] : '',
            commentCount: commentMatch ? commentMatch[1] : '',
            source: 'dom_parse'
          });
        } catch (e) {
          // 忽略
        }
      });
      
      return videos;
    });
  }

  // 模拟真人滑动
  async simulateScroll() {
    const distance = randomInt(300, 800);
    await this.page.mouse.wheel(0, distance);
    await randomDelay(1000, 2000);
    
    // 偶尔鼠标移动
    if (Math.random() > 0.7) {
      await this.page.mouse.move(
        randomInt(200, 1600),
        randomInt(200, 800)
      );
    }
  }

  // 搜索模式抓取
  async scrapeBySearch(searchTerm) {
    const searchUrl = `${CONFIG.KUAISHOU_SEARCH}?searchKey=${encodeURIComponent(searchTerm)}`;
    console.log(`  🔍 搜索: ${searchTerm}`);
    
    try {
      await this.page.goto(searchUrl, {
        waitUntil: 'networkidle',
        timeout: CONFIG.PAGE_TIMEOUT
      });
      await randomDelay(3000, 5000);
      
      // 抓取搜索结果
      let scrollCount = 0;
      const maxScrolls = 5;
      
      while (this.results.length < CONFIG.MAX_VIDEOS && scrollCount < maxScrolls) {
        scrollCount++;
        
        // 从 API 拦截中提取
        const apiVideos = this.extractFromInterceptedData();
        for (const v of apiVideos) {
          if (!this.seenIds.has(v.videoId) && v.title) {
            this.seenIds.add(v.videoId);
            this.results.push(v);
          }
        }
        
        // DOM 解析备用
        const domVideos = await this.extractFromDOM();
        for (const v of domVideos) {
          if (!this.seenIds.has(v.videoId) && v.title) {
            this.seenIds.add(v.videoId);
            this.results.push(v);
          }
        }
        
        await this.simulateScroll();
        await randomDelay(2000, 3000);
      }
    } catch (e) {
      console.warn(`  ⚠️ 搜索 "${searchTerm}" 失败:`, e.message);
    }
  }

  // 推荐流模式抓取
  async scrapeExplore() {
    console.log('📱 访问快手推荐流...');
    
    await this.page.goto(CONFIG.KUAISHOU_EXPLORE, {
      waitUntil: 'networkidle',
      timeout: CONFIG.PAGE_TIMEOUT
    });
    await randomDelay(3000, 5000);

    let scrollCount = 0;
    const maxScrolls = 15;
    
    while (this.results.length < CONFIG.MAX_VIDEOS && scrollCount < maxScrolls) {
      scrollCount++;
      console.log(`  📜 第 ${scrollCount} 次滑动...`);
      
      // 从 API 拦截中提取
      const apiVideos = this.extractFromInterceptedData();
      for (const v of apiVideos) {
        if (!this.seenIds.has(v.videoId) && v.title) {
          this.seenIds.add(v.videoId);
          this.results.push(v);
        }
      }
      
      // DOM 解析备用
      const domVideos = await this.extractFromDOM();
      for (const v of domVideos) {
        if (!this.seenIds.has(v.videoId) && v.title) {
          this.seenIds.add(v.videoId);
          this.results.push(v);
        }
      }
      
      console.log(`  ✅ 已收集 ${this.results.length} 条`);
      
      await this.simulateScroll();
    }
  }

  // 主抓取流程
  async scrape() {
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 开始抓取 [${this.poolConfig.name}]`);
    console.log(`📋 搜索词: ${this.poolConfig.searchTerms.join(', ')}`);
    console.log('='.repeat(60));
    
    try {
      await this.init();
      
      // 先抓推荐流
      await this.scrapeExplore();
      
      // 再按搜索词补充
      for (const term of this.poolConfig.searchTerms) {
        if (this.results.length >= CONFIG.MAX_VIDEOS) break;
        await this.scrapeBySearch(term);
        await randomDelay(2000, 4000);
      }
      
      console.log(`\n✅ 抓取完成！共 ${this.results.length} 条`);
      
    } catch (error) {
      console.error('❌ 抓取失败:', error.message);
    } finally {
      await this.cleanup();
    }
    
    return this.results;
  }

  // 清理资源
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 浏览器已关闭');
    }
  }

  // 保存结果
  saveResults() {
    if (!fs.existsSync(CONFIG.DATA_DIR)) {
      fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
    }
    
    const today = new Date().toISOString().slice(0, 10);
    const outputFile = path.join(CONFIG.DATA_DIR, `scraper-${this.poolType}.json`);
    
    // 规范化数据
    const normalized = this.results.map(v => ({
      videoId: v.videoId,
      title: v.title || '',
      sourceUrl: v.sourceUrl || `https://www.kuaishou.com/short-video/${v.videoId}`,
      authorName: v.authorName || '',
      authorUrl: v.authorUrl || '',
      publishTime: v.publishTime || '',
      likeCount: parseCount(v.likeCount),
      commentCount: parseCount(v.commentCount),
      shareCount: parseCount(v.shareCount),
      viewCount: parseCount(v.viewCount),
      poolType: this.poolType,
      collectedAt: new Date().toISOString(),
      isReal: true
    }));
    
    // 读取现有数据用于合并
    let existing = { items: [] };
    try {
      if (fs.existsSync(outputFile)) {
        existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      }
    } catch {}
    
    // 合并去重（保留最近3天的数据）
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const existingFresh = (existing.items || []).filter(item => {
      const t = new Date(item.collectedAt || 0).getTime();
      return t > threeDaysAgo;
    });
    
    const seen = new Set(existingFresh.map(i => i.videoId));
    const newItems = normalized.filter(r => !seen.has(r.videoId));
    const merged = [...existingFresh, ...newItems];
    
    const output = {
      poolType: this.poolType,
      poolName: this.poolConfig.name,
      fetchedAt: new Date().toISOString(),
      date: today,
      count: merged.length,
      newCount: newItems.length,
      items: merged
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`\n💾 数据已保存: ${outputFile}`);
    console.log(`📊 总计: ${merged.length} 条 (新增: ${newItems.length} 条)`);
    
    return outputFile;
  }
}

// ============ 主程序 ============
async function main() {
  const poolType = process.argv[2] || 'hot';
  
  console.log('🚀 快手推荐流真实抓取系统 V2');
  console.log(`📅 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🎯 号池: ${poolType}`);
  
  const scraper = new KuaishouScraper(poolType);
  await scraper.scrape();
  scraper.saveResults();
  
  console.log('\n✅ 全部完成！');
}

main().catch(err => {
  console.error('❌ 程序异常:', err);
  process.exit(1);
});
