/**
 * 快手 REST API 真实数据抓取
 * 使用 /rest/v/feed/hot 获取真实推荐流数据
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BASE_URL = 'https://www.kuaishou.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Referer': 'https://www.kuaishou.com/',
  'Origin': 'https://www.kuaishou.com',
  'Accept': 'application/json',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Content-Type': 'application/json'
};

// 号池搜索词
const POOL_KEYWORDS = {
  hot: ['小说推文', '解压推文', '爆款推文'],
  male: ['逆袭', '系统流', '打脸', '赘婿'],
  female: ['豪门甜宠', '虐文', '追妻火葬场', '总裁文'],
  new_book: ['新书推荐', '新上架']
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

// 获取热门视频
async function fetchHotFeed(pcursor = '') {
  const url = `${BASE_URL}/rest/v/feed/hot${pcursor ? '?pcursor=' + pcursor : ''}`;
  
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: HEADERS
    });
    
    if (!resp.ok) {
      console.log(`  ⚠️ 热门: HTTP ${resp.status}`);
      return { feeds: [], pcursor: '' };
    }
    
    const data = await resp.json();
    
    if (data.result !== 1) {
      console.log(`  ⚠️ 热门: result=${data.result}`);
      return { feeds: [], pcursor: '' };
    }
    
    return {
      feeds: data.feeds || [],
      pcursor: data.pcursor || ''
    };
  } catch (e) {
    console.log(`  ❌ 热门: ${e.message}`);
    return { feeds: [], pcursor: '' };
  }
}

// 搜索视频
async function fetchSearch(keyword, pcursor = '') {
  const url = `${BASE_URL}/rest/o/wenda/search`;
  
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        keyword,
        count: 20,
        pcursor: pcursor || '1',
        from: 'web_search'
      })
    });
    
    if (!resp.ok) {
      console.log(`  ⚠️ 搜索 "${keyword}": HTTP ${resp.status}`);
      return { feeds: [], pcursor: '' };
    }
    
    const data = await resp.json();
    return {
      feeds: data.feeds || data.list || [],
      pcursor: data.pcursor || ''
    };
  } catch (e) {
    console.log(`  ❌ 搜索 "${keyword}": ${e.message}`);
    return { feeds: [], pcursor: '' };
  }
}

// 从 feed 中提取视频信息
function extractVideo(feed, source = 'hot') {
  const photo = feed.photo || feed;
  const user = feed.author || photo.user || {};
  
  if (!photo.id && !photo.photoId) return null;
  
  return {
    videoId: photo.id || photo.photoId || '',
    title: photo.caption || photo.title || '',
    sourceUrl: `https://www.kuaishou.com/short-video/${photo.id || photo.photoId}`,
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
  
  console.log('🚀 快手 REST API 真实数据抓取');
  console.log(`📅 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🎯 号池: ${poolType}`);
  console.log('='.repeat(50));
  
  let allVideos = [];
  
  // 1. 获取热门视频（多页）
  console.log('\n🔥 获取热门视频...');
  let pcursor = '';
  for (let page = 0; page < 3; page++) {
    const { feeds, pcursor: nextCursor } = await fetchHotFeed(pcursor);
    
    if (feeds.length === 0) break;
    
    for (const feed of feeds) {
      const v = extractVideo(feed, 'hot');
      if (v && v.videoId) allVideos.push(v);
    }
    
    console.log(`  📄 第${page + 1}页: ${feeds.length} 条`);
    
    if (!nextCursor || nextCursor === pcursor) break;
    pcursor = nextCursor;
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // 2. 搜索关键词补充
  const keywords = POOL_KEYWORDS[poolType] || POOL_KEYWORDS.hot;
  for (const kw of keywords) {
    console.log(`\n🔍 搜索: ${kw}...`);
    const { feeds } = await fetchSearch(kw);
    
    for (const feed of feeds) {
      const v = extractVideo(feed, 'search');
      if (v && v.videoId) allVideos.push(v);
    }
    
    console.log(`  ✅ ${feeds.length} 条`);
    await new Promise(r => setTimeout(r, 2000));
  }
  
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
    poolName: 'REST API 抓取',
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
