/**
 * AI题材分析模块
 * 使用MiMo API分析热门题材、爽点结构、文案套路、评论情绪、标题风格
 * 核心价值：自动总结近期最容易爆的小说套路
 */

const AiAnalyzer = {
  STORAGE_KEY: 'ksAiAnalysis',
  API_URL: 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions',
  MODEL: 'mimo-v2.5-pro',
  
  /**
   * 分析热门题材
   * @param {Array} videos - 视频列表
   * @returns {Object} 分析结果
   */
  async analyzeTrends(videos) {
    const prompt = `你是小说推文题材分析专家。基于以下 ${videos.length} 条视频数据，分析当前最热门的题材趋势。

视频数据摘要：
${videos.slice(0, 30).map((v, i) => `${i+1}. ${v.title} | 播放: ${v.playCount || '未知'} | 分类: ${(v.category || []).join(',')}`).join('\n')}

请分析并返回JSON格式：
{
  "hotCategories": [
    {"name": "题材名", "heat": 热度分数0-100, "trend": "rising/stable/falling", "reason": "原因"}
  ],
  "topPatterns": [
    {"pattern": "套路模式", "example": "示例标题", "successRate": 预估成功率}
  ],
  "titleStyles": [
    {"style": "标题风格", "example": "示例", "effectiveness": 效果评分}
  ],
  "hookTypes": [
    {"type": "钩子类型", "description": "描述", "usage": "使用场景"}
  ],
  "recommendations": [
    {"category": "推荐题材", "reason": "推荐理由", "expectedHeat": 预期热度}
  ]
}

要求：
1. 基于真实数据分析
2. 识别爆款规律
3. 给出可执行建议
4. 返回纯JSON，不要其他内容`;

    try {
      const result = await this.callApi(prompt);
      const analysis = JSON.parse(result);
      
      // 保存分析结果
      this.saveAnalysis('trends', analysis);
      
      return analysis;
    } catch (e) {
      console.error('题材分析失败:', e);
      return this.getDefaultTrendAnalysis();
    }
  },
  
  /**
   * 分析爽点结构
   * @param {Array} titles - 标题列表
   * @returns {Object} 爽点分析
   */
  async analyzePleasurePoints(titles) {
    const prompt = `你是小说推文爽点分析专家。分析以下标题中的爽点结构。

标题列表：
${titles.slice(0, 20).map((t, i) => `${i+1}. ${t}`).join('\n')}

请分析并返回JSON格式：
{
  "pleasurePoints": [
    {
      "type": "爽点类型",
      "description": "描述",
      "frequency": 出现频率,
      "examples": ["示例1", "示例2"],
      "effectiveness": 效果评分0-100
    }
  ],
  "emotionalTriggers": [
    {"trigger": "情绪触发器", "usage": "使用方式", "impact": "影响"}
  ],
  "recommendedCombinations": [
    {"combination": "爽点组合", "expectedEffect": "预期效果"}
  ]
}

要求：
1. 识别常见爽点模式
2. 分析情绪触发机制
3. 给出组合建议
4. 返回纯JSON`;

    try {
      const result = await this.callApi(prompt);
      const analysis = JSON.parse(result);
      
      this.saveAnalysis('pleasure', analysis);
      
      return analysis;
    } catch (e) {
      console.error('爽点分析失败:', e);
      return { pleasurePoints: [], emotionalTriggers: [], recommendedCombinations: [] };
    }
  },
  
  /**
   * 分析标题风格
   * @param {Array} titles - 标题列表
   * @returns {Object} 标题分析
   */
  async analyzeTitleStyles(titles) {
    const prompt = `你是标题优化专家。分析以下标题的风格特点。

标题列表：
${titles.slice(0, 20).map((t, i) => `${i+1}. ${t}`).join('\n')}

请分析并返回JSON格式：
{
  "styles": [
    {
      "name": "风格名称",
      "pattern": "模式描述",
      "examples": ["示例1", "示例2"],
      "effectiveness": 效果评分0-100,
      "bestFor": ["适用题材"]
    }
  ],
  "keywords": [
    {"word": "关键词", "frequency": 出现频率, "impact": "影响"}
  ],
  "structures": [
    {"structure": "结构模式", "template": "模板", "successRate": 成功率}
  ],
  "improvementTips": [
    {"tip": "优化建议", "example": "示例"}
  ]
}

要求：
1. 识别爆款标题特征
2. 分析关键词效果
3. 给出优化模板
4. 返回纯JSON`;

    try {
      const result = await this.callApi(prompt);
      const analysis = JSON.parse(result);
      
      this.saveAnalysis('titles', analysis);
      
      return analysis;
    } catch (e) {
      console.error('标题分析失败:', e);
      return { styles: [], keywords: [], structures: [], improvementTips: [] };
    }
  },
  
  /**
   * 生成爆款预测
   * @param {Object} context - 上下文数据
   * @returns {Object} 预测结果
   */
  async generatePredictions(context) {
    const { categories, recentHot, growthData } = context;
    
    const prompt = `你是小说推文爆款预测专家。基于以下数据，预测未来可能爆款的题材。

当前热门题材：
${JSON.stringify(categories, null, 2)}

近期爆款：
${recentHot.slice(0, 10).map(v => `- ${v.title} (${v.category?.join(',')})`).join('\n')}

增长率数据：
${growthData.slice(0, 5).map(g => `- ${g.title}: 增长率 ${g.growthRate}`).join('\n')}

请预测并返回JSON格式：
{
  "predictions": [
    {
      "category": "题材",
      "probability": 爆发概率0-100,
      "reason": "预测理由",
      "bestTime": "最佳发布时段",
      "targetAudience": "目标受众",
      "suggestedTitles": ["建议标题1", "建议标题2"],
      "hookSuggestion": "开头钩子建议"
    }
  ],
  "emergingTrends": [
    {"trend": "新兴趋势", "indicators": ["指标"], "timeframe": "时间窗口"}
  ],
  "riskFactors": [
    {"factor": "风险因素", "impact": "影响", "mitigation": "应对策略"}
  ]
}

要求：
1. 基于数据分析
2. 识别新兴趋势
3. 给出可执行建议
4. 返回纯JSON`;

    try {
      const result = await this.callApi(prompt);
      const predictions = JSON.parse(result);
      
      this.saveAnalysis('predictions', predictions);
      
      return predictions;
    } catch (e) {
      console.error('爆款预测失败:', e);
      return { predictions: [], emergingTrends: [], riskFactors: [] };
    }
  },
  
  /**
   * 调用MiMo API
   */
  async callApi(prompt) {
    const apiKey = window.getStoredMimoApiKey?.() || localStorage.getItem('ksMimoApiKey') || '';
    
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
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
    
    return jsonMatch[0];
  },
  
  /**
   * 保存分析结果
   */
  saveAnalysis(type, data) {
    try {
      const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      stored[type] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.warn('保存分析结果失败:', e);
    }
  },
  
  /**
   * 获取分析结果
   */
  getAnalysis(type) {
    try {
      const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      return stored[type]?.data || null;
    } catch {
      return null;
    }
  },
  
  /**
   * 获取所有分析结果
   */
  getAllAnalysis() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  },
  
  /**
   * 检查分析是否过期（超过1小时）
   */
  isAnalysisExpired(type) {
    try {
      const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      const timestamp = stored[type]?.timestamp || 0;
      return Date.now() - timestamp > 60 * 60 * 1000;
    } catch {
      return true;
    }
  },
  
  /**
   * 获取默认题材分析
   */
  getDefaultTrendAnalysis() {
    return {
      hotCategories: [
        { name: '穿越重生', heat: 95, trend: 'rising', reason: '持续热门' },
        { name: '逆袭打脸', heat: 90, trend: 'stable', reason: '经典题材' },
        { name: '豪门甜宠', heat: 85, trend: 'stable', reason: '女频热门' },
        { name: '系统金手指', heat: 80, trend: 'rising', reason: '男频热门' },
        { name: '虐恋情深', heat: 75, trend: 'stable', reason: '情感类热门' }
      ],
      topPatterns: [
        { pattern: '穿越+空间+物资', example: '穿越回80年代，我靠空间物资成了全村首富', successRate: 85 },
        { pattern: '重生+复仇+逆袭', example: '重生后我手撕渣男，他跪着求我别走', successRate: 80 },
        { pattern: '替身+离婚+逆袭', example: '替身妻子离婚后，总裁他疯了', successRate: 78 }
      ],
      titleStyles: [
        { style: '悬念式', example: '所有人都以为我死了，直到...', effectiveness: 90 },
        { style: '反转式', example: '被赶出家门后，我成了全球首富', effectiveness: 85 },
        { style: '冲突式', example: '前夫跪求复合，我冷笑转身', effectiveness: 80 }
      ],
      hookTypes: [
        { type: '危机开场', description: '一开始就制造紧张感', usage: '逆袭、复仇类' },
        { type: '悬念钩子', description: '留下悬念吸引阅读', usage: '悬疑、反转类' },
        { type: '情感共鸣', description: '引发情感共鸣', usage: '虐文、甜宠类' }
      ],
      recommendations: [
        { category: '穿越80年代', reason: '近期爆款频出', expectedHeat: 95 },
        { category: '离婚逆袭', reason: '女频热门', expectedHeat: 88 },
        { category: '系统流', reason: '男频稳定', expectedHeat: 82 }
      ]
    };
  }
};

// 导出
window.AiAnalyzer = AiAnalyzer;
