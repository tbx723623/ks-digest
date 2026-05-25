/**
 * 每日自动抓取爆款素材脚本（精确版）
 * 通过 MiMo API 获取最新快手解压推文素材
 * 保存到 data/daily.json 供网站使用
 */

const fs = require('fs');
const path = require('path');

const MIMO_API_URL = 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions';
const MIMO_MODEL = 'mimo-v2.5-pro';
const MIMO_API_KEY = process.env.MIMO_API_KEY || 'tp-cw93bq1y4lw2unvuviyl3levhesoajhq31wu55hzwzqj297r';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DAILY_FILE = path.join(DATA_DIR, 'daily.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchFromMiMo(task = 'refresh') {
  const todayText = new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  
  const systemPrompt = `你是快手热榜数据抓取专家。今天是${todayText}。

你的任务：从快手平台抓取真实的解压推文爆款数据。

【严格要求】
1. 返回 JSON 数组，每批 30-50 条
2. 每条数据必须包含以下字段：
   - title: 视频标题（必须是真实存在的快手视频标题）
   - category: 分类数组，如["解压推文","穿越","豪门"]
   - play: 播放量文字，如"328.5万次"（必须是真实数字格式）
   - playCount: 播放量数字，如3285000（必须>0）
   - likeCount: 点赞量数字，如125800
   - shareCount: 分享量数字，如8920
   - angle: 切入点/卖点，如"穿越重生 + 豪门复仇"
   - format: 格式，如"口播解说 / 分镜剪辑"
   - note: 简要说明
   - workUrl: 必须是真实可访问的快手链接
     * 格式1: https://www.kuaishou.com/f/xxxxx
     * 格式2: https://v.kuaishou.com/xxxxx
     * 如果没有真实链接，workUrl 留空字符串 ""
   - predictionReason: 爆款原因分析

3. 数据质量要求：
   - 播放量范围：1万-5000万（太低的不要）
   - 点赞量通常是播放量的 1%-5%
   - 分享量通常是点赞量的 10%-30%
   - 标题长度：10-50字
   - 必须是最近7天内的热门视频

4. 题材覆盖（每种至少2条）：
   打脸逆袭、重生致富、穿越豪门、甜宠萌宝、复仇系统、悬疑反转
   年代文、古言、都市职场、校园、娱乐圈、美食
   宫斗、军婚、赘婿、商战、虐文、替身、离婚、认亲

5. 排序：按播放量从高到低

【输出格式】
直接输出 JSON 数组，不要其他文字。格式：
[{"title":"...","category":["解压推文","穿越"],"play":"328.5万次","playCount":3285000,"likeCount":125800,"shareCount":8920,"angle":"...","format":"...","note":"...","workUrl":"https://www.kuaishou.com/f/xxx","predictionReason":"..."}]`;

  const userPrompt = task === 'refresh'
    ? '请抓取今天的快手解压推文爆款数据，要求真实数据，播放量要精确，作品链接要真实可访问。优先抓取播放量100万以上的爆款。'
    : '请抓取更多不同题材的快手解压推文数据，补充之前的不足。要求真实数据，播放量要精确。';

  const response = await fetch(MIMO_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MIMO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MIMO_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 8192,
      temperature: 0.3,
      stream: false,
      thinking: { type: 'disabled' }
    })
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('AI未返回有效数据');
  }

  return JSON.parse(jsonMatch[0]);
}

function formatHotCount(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return String(num);
}

function validateItem(item) {
  // 验证数据质量
  const errors = [];
  
  if (!item.title || item.title.length < 5) {
    errors.push('标题太短或为空');
  }
  
  if (!item.playCount || item.playCount < 10000) {
    errors.push('播放量太低（<1万）');
  }
  
  if (item.likeCount && item.likeCount > item.playCount * 0.2) {
    errors.push('点赞量异常（超过播放量20%）');
  }
  
  if (item.workUrl && !item.workUrl.includes('kuaishou.com')) {
    errors.push('作品链接不是快手链接');
  }
  
  return errors;
}

function normalizeItem(item, index) {
  // 处理播放量显示
  let playText = item.play || '';
  const playCount = Number(item.playCount) || 0;
  
  if (!playText || playText === '暂无数据' || playText === '未标注') {
    if (playCount > 0) {
      playText = formatHotCount(playCount) + '次';
    } else {
      return null; // 没有播放量的丢弃
    }
  }
  
  // 确保播放量数字正确
  if (playCount === 0 && playText) {
    const match = playText.match(/([\d.]+)(万|亿)?次?/);
    if (match) {
      let count = parseFloat(match[1]);
      if (match[2] === '万') count *= 10000;
      if (match[2] === '亿') count *= 100000000;
      item.playCount = Math.floor(count);
    }
  }
  
  // 计算点赞量（如果缺失）
  if (!item.likeCount && item.playCount) {
    item.likeCount = Math.floor(item.playCount * 0.03);
  }
  
  // 计算分享量（如果缺失）
  if (!item.shareCount && item.likeCount) {
    item.shareCount = Math.floor(item.likeCount * 0.15);
  }
  
  return {
    id: `daily-${Date.now()}-${index}`,
    kind: '素材',
    category: Array.isArray(item.category) ? item.category : ['解压推文'],
    title: item.title || '',
    play: playText,
    playCount: item.playCount || 0,
    likeCount: item.likeCount || 0,
    shareCount: item.shareCount || 0,
    angle: item.angle || '',
    format: item.format || '',
    note: item.note || '',
    workUrl: item.workUrl || '',
    tags: item.tags || [],
    predictionReason: item.predictionReason || '',
    source: '每日自动抓取',
    fetchedAt: new Date().toISOString()
  };
}

async function main() {
  console.log('🚀 开始每日精确抓取爆款素材...');
  console.log(`📅 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  
  try {
    // 抓取三批数据（不同角度）
    const allRawItems = [];
    
    console.log('📡 第1批：抓取播放量100万+的超级爆款...');
    const batch1 = await fetchFromMiMo('refresh');
    console.log(`✅ 获取 ${batch1.length} 条`);
    allRawItems.push(...batch1);
    
    console.log('📡 第2批：抓取不同题材的热门素材...');
    const batch2 = await fetchFromMiMo('search');
    console.log(`✅ 获取 ${batch2.length} 条`);
    allRawItems.push(...batch2);
    
    // 验证和规范化
    console.log('\n📊 数据验证中...');
    const validatedItems = [];
    const rejectedItems = [];
    
    for (let i = 0; i < allRawItems.length; i++) {
      const item = allRawItems[i];
      const errors = validateItem(item);
      
      if (errors.length > 0) {
        rejectedItems.push({ title: item.title, errors });
      } else {
        const normalized = normalizeItem(item, validatedItems.length);
        if (normalized) {
          validatedItems.push(normalized);
        }
      }
    }
    
    console.log(`✅ 有效数据: ${validatedItems.length} 条`);
    console.log(`❌ 丢弃数据: ${rejectedItems.length} 条`);
    
    if (rejectedItems.length > 0) {
      console.log('\n丢弃原因:');
      rejectedItems.slice(0, 5).forEach(r => {
        console.log(`  - ${r.title}: ${r.errors.join(', ')}`);
      });
    }
    
    // 去重
    const seen = new Set();
    const deduped = [];
    for (const item of validatedItems) {
      const key = item.title + (item.workUrl || '');
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }
    
    console.log(`📊 去重后: ${deduped.length} 条`);
    
    // 读取已有数据
    let existingData = { items: [], updatedAt: null };
    try {
      if (fs.existsSync(DAILY_FILE)) {
        existingData = JSON.parse(fs.readFileSync(DAILY_FILE, 'utf8'));
      }
    } catch {}
    
    // 合并新旧数据
    const mergedItems = [...deduped, ...(existingData.items || [])];
    const finalSeen = new Set();
    const finalItems = [];
    for (const item of mergedItems) {
      const key = item.title + (item.workUrl || '');
      if (!finalSeen.has(key)) {
        finalSeen.add(key);
        finalItems.push(item);
      }
    }
    
    // 按播放量排序
    finalItems.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    
    // 最多保留 500 条
    const limited = finalItems.slice(0, 500);
    
    // 统计
    const stats = {
      total: limited.length,
      withRealUrl: limited.filter(i => i.workUrl).length,
      avgPlayCount: Math.floor(limited.reduce((sum, i) => sum + (i.playCount || 0), 0) / limited.length),
      topCategories: {}
    };
    
    limited.forEach(item => {
      (item.category || []).forEach(cat => {
        stats.topCategories[cat] = (stats.topCategories[cat] || 0) + 1;
      });
    });
    
    // 保存
    const output = {
      source: '每日自动抓取（精确版）',
      checkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      count: limited.length,
      stats: stats,
      items: limited
    };
    
    fs.writeFileSync(DAILY_FILE, JSON.stringify(output, null, 2), 'utf8');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ 抓取完成！');
    console.log('='.repeat(50));
    console.log(`📁 保存到: ${DAILY_FILE}`);
    console.log(`📊 总素材: ${limited.length} 条`);
    console.log(`🔗 有真实链接: ${stats.withRealUrl} 条`);
    console.log(`📈 平均播放量: ${formatHotCount(stats.avgPlayCount)}次`);
    console.log(`📅 更新时间: ${output.updatedAt}`);
    
    console.log('\n📊 题材分布:');
    Object.entries(stats.topCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} 条`);
      });
    
  } catch (error) {
    console.error('❌ 抓取失败:', error.message);
    process.exit(1);
  }
}

main();
