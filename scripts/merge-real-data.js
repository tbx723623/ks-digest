/**
 * 真实数据合并脚本 V2
 * 
 * 数据流：
 * 1. Playwright 抓取真实视频数据（标题、链接、点赞、评论）
 * 2. MiMo API 仅做 AI 分析（爆率预测、趋势、爽点、文案结构）
 * 3. 合并生成最终榜单
 * 
 * ⚠️ MiMo 不再生成假链接！只负责分析！
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MIMO_API_URL = 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions';
const MIMO_API_KEY = process.env.MIMO_API_KEY || 'tp-cw93bq1y4lw2unvuviyl3levhesoajhq31wu55hzwzqj297r';

// ============ 工具函数 ============
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 已保存: ${path.basename(filePath)}`);
}

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

function formatCount(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return String(num);
}

// ============ MiMo AI 分析（仅分析，不生成数据） ============

async function callMimoApi(prompt, maxTokens = 1500) {
  try {
    const response = await fetch(MIMO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MIMO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3,
        stream: false,
        thinking: { type: 'disabled' }
      })
    });

    if (!response.ok) throw new Error(`API失败: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.warn('  ⚠️ MiMo API 调用失败:', e.message);
    return null;
  }
}

// AI 分析单个视频（只分析，不生成链接）
async function analyzeVideo(video) {
  const prompt = `分析以下快手视频的爆款潜力。这是一个真实存在的视频，请基于标题和数据给出专业分析。

标题：${video.title}
点赞量：${formatCount(video.likeCount || 0)}
评论量：${formatCount(video.commentCount || 0)}
分享量：${formatCount(video.shareCount || 0)}
发布者：${video.authorName || '未知'}

请返回JSON：
{
  "explosionRate": 0-100的爆率预测,
  "trend": "rising/stable/falling",
  "hookType": "钩子类型（悬念/反转/冲突/爽点/共情）",
  "titleAnalysis": "标题结构分析",
  "hotFactors": ["爆款因素1", "爆款因素2"],
  "category": ["题材分类"],
  "reason": "预测理由（简短）"
}

直接输出JSON，不要其他文字。`;

  return await callMimoApi(prompt);
}

// 批量 AI 分析
async function batchAnalyze(videos, limit = 20) {
  const toAnalyze = videos.slice(0, limit);
  const results = [];

  for (let i = 0; i < toAnalyze.length; i++) {
    const video = toAnalyze[i];
    console.log(`  🔮 [${i + 1}/${toAnalyze.length}] ${video.title?.substring(0, 30)}...`);

    const analysis = await analyzeVideo(video);

    results.push({
      ...video,
      aiAnalysis: analysis || {
        explosionRate: 50,
        trend: 'stable',
        category: video.poolType === 'male' ? ['男频'] : ['女频'],
        hookType: '未知',
        reason: 'AI分析跳过'
      }
    });

    // 间隔避免频率限制
    if (i < toAnalyze.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // 未分析的视频给默认值
  const analyzedIds = new Set(results.map(r => r.videoId));
  for (const video of videos) {
    if (!analyzedIds.has(video.videoId)) {
      results.push({
        ...video,
        aiAnalysis: {
          explosionRate: 40,
          trend: 'stable',
          category: ['未分析'],
          hookType: '未知',
          reason: '未进行AI分析'
        }
      });
    }
  }

  return results;
}

// ============ 数据健康评分 ============
function assessHealth(video) {
  let score = 100;
  const warnings = [];

  const likeCount = video.likeCount || 0;
  const commentCount = video.commentCount || 0;
  const shareCount = video.shareCount || 0;
  const viewCount = video.viewCount || likeCount * 20; // 估算播放量

  // 互动率检查
  if (viewCount > 0) {
    const likeRate = likeCount / viewCount;
    if (likeRate > 0.1) {
      score -= 30;
      warnings.push('点赞率异常偏高');
    } else if (likeRate < 0.001) {
      score -= 20;
      warnings.push('点赞率异常偏低');
    }
  }

  // 分享 > 点赞（不合理）
  if (shareCount > likeCount && likeCount > 0) {
    score -= 20;
    warnings.push('分享量大于点赞量');
  }

  // 标题检查
  if (!video.title || video.title.length < 3) {
    score -= 15;
    warnings.push('标题过短');
  }

  // 有真实链接加分
  if (video.sourceUrl && video.isReal) {
    score += 10;
  }

  let level;
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'good';
  else if (score >= 40) level = 'suspicious';
  else level = 'unhealthy';

  return {
    score: Math.min(100, Math.max(0, score)),
    level,
    isHealthy: score >= 60,
    warnings
  };
}

// ============ 主流程 ============
async function main() {
  console.log('='.repeat(60));
  console.log('🔄 真实数据合并系统 V2');
  console.log(`📅 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('='.repeat(60));

  // 1. 读取所有 Playwright 抓取的真实数据
  console.log('\n📂 读取真实抓取数据...');

  const poolTypes = ['hot', 'male', 'female', 'new_book'];
  let allRealVideos = [];

  for (const pool of poolTypes) {
    const filePath = path.join(DATA_DIR, `scraper-${pool}.json`);
    const data = readJson(filePath);
    if (data.items) {
      console.log(`  📄 scraper-${pool}.json: ${data.items.length} 条`);
      allRealVideos.push(...data.items);
    }
  }

  // 去重
  const seen = new Set();
  allRealVideos = allRealVideos.filter(v => {
    if (!v.videoId) return false;
    if (seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    return true;
  });

  console.log(`\n📊 真实视频总计: ${allRealVideos.length} 条`);

  if (allRealVideos.length === 0) {
    console.log('⚠️ 没有真实数据，请先运行 kuaishou-scraper.js');
    return;
  }

  // 2. 数据健康评分
  console.log('\n🏥 数据健康评分...');
  const withHealth = allRealVideos.map(v => ({
    ...v,
    health: assessHealth(v)
  }));

  const healthyCount = withHealth.filter(v => v.health.isHealthy).length;
  console.log(`  ✅ 健康数据: ${healthyCount} 条`);
  console.log(`  ⚠️ 可疑数据: ${withHealth.length - healthyCount} 条`);

  // 只保留健康数据
  const healthyVideos = withHealth.filter(v => v.health.isHealthy);

  // 3. AI 分析（MiMo 只做分析，不生成数据）
  console.log('\n🔮 AI 分析爆款潜力...');
  const analyzed = await batchAnalyze(healthyVideos, 20);

  // 4. 按爆率排序
  analyzed.sort((a, b) => {
    const rateA = a.aiAnalysis?.explosionRate || 0;
    const rateB = b.aiAnalysis?.explosionRate || 0;
    return rateB - rateA;
  });

  // 5. 生成数据文件
  console.log('\n📦 生成最终数据...');

  const today = new Date().toISOString().slice(0, 10);

  // explosive.json - 真实爆款数据
  const explosiveData = {
    source: '真实推荐流 + AI分析',
    fetchedAt: new Date().toISOString(),
    date: today,
    count: analyzed.length,
    items: analyzed
  };
  writeJson(path.join(DATA_DIR, 'explosive.json'), explosiveData);

  // hot.json - 高爆率视频
  const hotItems = analyzed.filter(v => (v.aiAnalysis?.explosionRate || 0) >= 60);
  writeJson(path.join(DATA_DIR, 'hot.json'), {
    source: '高爆率真实视频',
    fetchedAt: new Date().toISOString(),
    date: today,
    count: hotItems.length,
    items: hotItems
  });

  // trend.json - 上升趋势
  const trendItems = analyzed.filter(v => v.aiAnalysis?.trend === 'rising');
  writeJson(path.join(DATA_DIR, 'trend.json'), {
    source: '上升趋势真实视频',
    fetchedAt: new Date().toISOString(),
    date: today,
    count: trendItems.length,
    items: trendItems
  });

  // predict.json - 预测数据
  const predictItems = analyzed.filter(v => (v.aiAnalysis?.explosionRate || 0) >= 50).map(v => ({
    videoId: v.videoId,
    title: v.title,
    sourceUrl: v.sourceUrl,
    authorName: v.authorName,
    likeCount: v.likeCount,
    commentCount: v.commentCount,
    explosionRate: v.aiAnalysis?.explosionRate || 0,
    trend: v.aiAnalysis?.trend || 'stable',
    hookType: v.aiAnalysis?.hookType || '',
    category: v.aiAnalysis?.category || [],
    estimatedTime: v.aiAnalysis?.explosionRate >= 80 ? '正在爆发' :
                   v.aiAnalysis?.explosionRate >= 70 ? '1-2小时' :
                   v.aiAnalysis?.explosionRate >= 60 ? '2-4小时' : '不确定'
  }));
  writeJson(path.join(DATA_DIR, 'predict.json'), {
    source: 'AI预测 + 真实数据',
    generatedAt: new Date().toISOString(),
    date: today,
    count: predictItems.length,
    items: predictItems
  });

  // 6. 统计
  console.log('\n' + '='.repeat(60));
  console.log('📊 最终统计');
  console.log('='.repeat(60));
  console.log(`真实视频: ${analyzed.length} 条`);
  console.log(`有链接: ${analyzed.filter(v => v.sourceUrl).length} 条`);
  console.log(`AI分析: ${analyzed.filter(v => v.aiAnalysis?.reason !== '未进行AI分析').length} 条`);
  console.log(`高爆率(>=60): ${hotItems.length} 条`);
  console.log(`上升趋势: ${trendItems.length} 条`);

  console.log('\n🏆 Top 5 爆款预测:');
  analyzed.slice(0, 5).forEach((item, i) => {
    const rate = item.aiAnalysis?.explosionRate || '-';
    const link = item.sourceUrl ? '✅' : '❌';
    console.log(`  ${i + 1}. ${item.title?.substring(0, 40)} | 爆率: ${rate}% | 真实链接: ${link}`);
  });

  console.log('\n✅ 合并完成！');
}

main().catch(err => {
  console.error('❌ 合并失败:', err);
  process.exit(1);
});
