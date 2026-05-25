/**
 * 快手数据抓取：Playwright 获取 Cookie + REST API 抓取
 * 
 * 流程：
 * 1. Playwright 访问快手首页，获取 Cookie
 * 2. 用 Cookie 调用 /rest/v/feed/hot 获取真实数据
 * 3. 解析并保存
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BASE_URL = 'https://www.kuaishou.com';

// 号池搜索词
const POOL_KEYWORDS = {
  hot: ['小说推文', '解压推文', '爆款推文'],
  male: ['逆袭打脸', '系统流小说', '赘婿逆袭'],
  female: ['豪门甜宠', '虐文推荐', '追妻火葬场'],
  new_book: ['新书推荐', '小说推文新']
};

function parseCount(text) {
  if (!text) return 0;
  if (typeof text === 'number') return text;
  text = String(text).replace(/,/g, '');
  const match = text.match(/([\d.]+)\s*(万|亿|w)?/i);
  if (!match) return 0;
  let count = parseFloat(match[1]);
  if (match[2] === '万' || match[2] === 'w') count *= 10000;
  if (match[2] === '亿') count *= 100000000;
  return Math.floor(count);
}

function extractVideo(feed, source = 'hot') {
  const photo = feed.photo || feed;
  const user = feed.author || photo.user || {};
  
  const videoId = photo.id || photo.photoId || '';
  if (!videoId) return null;
  
  return {
    videoId,
    title: photo.caption || photo.title || '',
    sourceUrl: `https://www.kuaishou.com/short-video/${videoId}`,
    authorName: user.name || user.nickname || '',
    authorUrl: user.id ? `https://www.kuaishou.com/profile/${user.id}` : '',
    authorId: user.id || '',
    publishTime: photo.timestamp ? new Date(photo.timestamp).toISOString() : '',
    likeCount: parseCount(photo.likeCount || photo.likingCount),
    commentCount: parseCount(photo.commentCount || photo.realCommentCount),
    shareCount: parseCount(photo.shareCount || photo.forwardCount),
    viewCount: parseCount(photo.viewCount || photo.playCount),
    collectedAt: new Date().toISOString(),
    isReal: true,
    source
  };
}

async function main() {
  const poolType = process.argv[2] || 'hot';
  
  console.log('🚀 快手 Cookie + API 抓取');
  console.log(`📅 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🎯 号池: ${poolType}`);
  console.log('='.repeat(50));
  
  // 1. 用 Playwright 获取 Cookie
  console.log('\n🌐 Step 1: 获取 Cookie...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'zh-CN'
  });
  
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
  });
  
  const page = await context.newPage();
  
  // 拦截 API 响应
  let hotFeedData = null;
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/rest/v/feed/hot')) {
      try {
        const data = await response.json();
        if (data.result === 1 && data.feeds) {
          hotFeedData = data;
        }
      } catch(e) {}
    }
  });
  
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);
  
  // 获取 Cookie
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  console.log(`  ✅ 获取 ${cookies.length} 个 Cookie`);
  
  // 2. 用 Cookie 调用 API
  console.log('\n📡 Step 2: 调用 REST API...');
  
  let allVideos = [];
  
  // 如果拦截到了数据，直接用
  if (hotFeedData && hotFeedData.feeds) {
    console.log(`  ✅ 拦截到 ${hotFeedData.feeds.length} 条热门数据`);
    for (const feed of hotFeedData.feeds) {
      const v = extractVideo(feed, 'hot_intercept');
      if (v && v.videoId) allVideos.push(v);
    }
  }
  
  // 用 Cookie 主动请求更多数据
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://www.kuaishou.com/',
    'Origin': 'https://www.kuaishou.com',
    'Accept': 'application/json',
    'Cookie': cookieStr
  };
  
  // 获取热门（多页）
  let pcursor = '';
  for (let page_num = 0; page_num < 3; page_num++) {
    try {
      const url = `${BASE_URL}/rest/v/feed/hot${pcursor ? '?pcursor=' + pcursor : ''}`;
      const resp = await fetch(url, { headers });
      const data = await resp.json();
      
      if (data.result === 1 && data.feeds) {
        console.log(`  📄 热门第${page_num + 1}页: ${data.feeds.length} 条`);
        for (const feed of data.feeds) {
          const v = extractVideo(feed, 'hot');
          if (v && v.videoId) allVideos.push(v);
        }
        
        if (data.pcursor && data.pcursor !== pcursor) {
          pcursor = data.pcursor;
        } else {
          break;
        }
      } else {
        console.log(`  ⚠️ 热门第${page_num + 1}页: result=${data.result}`);
        break;
      }
    } catch(e) {
      console.log(`  ❌ 热门: ${e.message}`);
      break;
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // 搜索
  const keywords = POOL_KEYWORDS[poolType] || POOL_KEYWORDS.hot;
  for (const kw of keywords) {
    try {
      console.log(`\n🔍 搜索: ${kw}...`);
      const resp = await fetch(`${BASE_URL}/rest/o/wenda/search`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw, count: 20, pcursor: '1', from: 'web_search' })
      });
      
      const text = await resp.text();
      if (text.startsWith('{')) {
        const data = JSON.parse(text);
        const feeds = data.feeds || data.list || [];
        console.log(`  ✅ ${feeds.length} 条`);
        for (const feed of feeds) {
          const v = extractVideo(feed, 'search');
          if (v && v.videoId) allVideos.push(v);
        }
      } else {
        console.log(`  ⚠️ 搜索返回 HTML（需要登录）`);
      }
    } catch(e) {
      console.log(`  ❌ 搜索: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
  
  await browser.close();
  
  // 去重
  const seen = new Set();
  allVideos = allVideos.filter(v => {
    if (!v.videoId || seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    return true;
  });
  
  // 保存
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const outputFile = path.join(DATA_DIR, `scraper-${poolType}.json`);
  const output = {
    poolType,
    poolName: 'Cookie + API 抓取',
    fetchedAt: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    count: allVideos.length,
    items: allVideos
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 总计: ${allVideos.length} 条真实视频`);
  console.log(`💾 已保存: ${outputFile}`);
  
  if (allVideos.length > 0) {
    console.log('\n🏆 Top 5:');
    allVideos.slice(0, 5).forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.title?.substring(0, 40)} | 👍${v.likeCount} | 👁${v.viewCount}`);
      console.log(`     🔗 ${v.sourceUrl}`);
    });
  }
  
  console.log('\n✅ 完成！');
}

main().catch(console.error);
