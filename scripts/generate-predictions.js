/**
 * 预测报告生成脚本
 * 用于GitHub Actions定时生成预测报告
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GROWTH_FILE = path.join(DATA_DIR, 'growth.json');
const PREDICTIONS_FILE = path.join(DATA_DIR, 'predictions.json');
const MIMO_API_URL = 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions';

/**
 * 读取JSON文件
 */
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.warn(`读取文件失败: ${filePath}`, e.message);
    return {};
  }
}

/**
 * 写入JSON文件
 */
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ 写入成功: ${filePath}`);
  } catch (e) {
    console.error(`写入文件失败: ${filePath}`, e.message);
  }
}

/**
 * 调用MiMo API
 */
async function callMimoApi(prompt) {
  const apiKey = process.env.MIMO_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ MIMO_API_KEY 未设置，跳过AI预测');
    return null;
  }
  
  try {
    const response = await fetch(MIMO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        stream: false,
        thinking: { type: 'disabled' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // 提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI未返回有效JSON');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('AI预测失败:', e.message);
    return null;
  }
}

/**
 * 生成预测报告
 */
async function generatePredictions() {
  console.log('🔮 开始生成预测报告...');
  
  // 读取增长数据
  const growthData = readJson(GROWTH_FILE);
  const logs = growthData.logs || [];
  
  if (logs.length === 0) {
    console.log('⚠️ 没有增长数据，跳过预测');
    return;
  }
  
  // 统计题材数据
  const categoryStats = {};
  logs.forEach(log => {
    (log.category || []).forEach(cat => {
      if (!categoryStats[cat]) {
        categoryStats[cat] = {
          count: 0,
          totalGrowth: 0,
          avgGrowth: 0
        };
      }
      categoryStats[cat].count++;
      categoryStats[cat].totalGrowth += log.growthRate || 0;
    });
  });
  
  // 计算平均增长率
  Object.keys(categoryStats).forEach(cat => {
    const stats = categoryStats[cat];
    stats.avgGrowth = stats.count > 0 ? Math.round(stats.totalGrowth / stats.count) : 0;
  });
  
  // 排序题材
  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].avgGrowth - a[1].avgGrowth)
    .slice(0, 10);
  
  // 获取高增长视频
  const highGrowthVideos = logs
    .filter(log => log.growthRate > 500)
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 10);
  
  // 调用AI生成预测
  const prompt = `你是小说推文爆款预测专家。基于以下数据，预测未来可能爆款的题材。

当前热门题材（按增长率排序）：
${sortedCategories.map(([cat, stats]) => `- ${cat}: 平均增长率 ${stats.avgGrowth}/分钟，共 ${stats.count} 条数据`).join('\n')}

高增长视频：
${highGrowthVideos.map(v => `- ${v.title}: 增长率 ${v.growthRate}/分钟`).join('\n')}

请预测并返回JSON格式：
{
  "predictions": [
    {
      "category": "题材",
      "probability": 爆发概率0-100,
      "reason": "预测理由",
      "bestTime": "最佳发布时段",
      "suggestedTitles": ["建议标题1", "建议标题2"]
    }
  ],
  "emergingTrends": [
    {"trend": "新兴趋势", "indicators": ["指标"]}
  ]
}

要求：
1. 基于数据分析
2. 识别新兴趋势
3. 给出可执行建议
4. 返回纯JSON`;

  const aiPrediction = await callMimoApi(prompt);
  
  // 生成本地预测
  const localPredictions = highGrowthVideos.map(video => ({
    videoId: video.videoId,
    title: video.title,
    growthRate: video.growthRate,
    category: video.category,
    explosionRate: Math.min(100, Math.round(video.growthRate / 100)),
    velocity: video.growthRate > 1000 ? '火箭级' : video.growthRate > 500 ? '飞速' : '快速',
    trend: 'rising'
  }));
  
  // 合并结果
  const predictions = {
    ai: aiPrediction,
    local: localPredictions,
    categoryStats: sortedCategories.map(([cat, stats]) => ({
      category: cat,
      ...stats
    })),
    generatedAt: new Date().toISOString()
  };
  
  // 保存结果
  writeJson(PREDICTIONS_FILE, predictions);
  
  console.log('✅ 预测报告生成完成');
  console.log(`   - 热门题材: ${sortedCategories.length} 个`);
  console.log(`   - 高增长视频: ${highGrowthVideos.length} 个`);
  console.log(`   - AI预测: ${aiPrediction ? '成功' : '跳过'}`);
}

// 运行
generatePredictions().catch(console.error);
