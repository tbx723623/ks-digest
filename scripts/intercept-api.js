/**
 * 用 Playwright 拦截快手真实 API 请求
 * 先访问快手首页，捕获它发出的所有 GraphQL 请求
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function main() {
  console.log('🔍 拦截快手 API 请求...');
  
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
  
  // 拦截所有 GraphQL 请求
  const captured = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('graphql')) {
      try {
        const postData = request.postData();
        if (postData) {
          captured.push({
            url,
            method: request.method(),
            headers: request.headers(),
            body: postData
          });
        }
      } catch(e) {}
    }
  });
  
  // 拦截响应
  const responses = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('graphql') || url.includes('rest/')) {
      try {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('json')) {
          const data = await response.json();
          responses.push({ url: url.substring(0, 100), data });
        }
      } catch(e) {}
    }
  });
  
  // 访问快手首页
  console.log('访问 kuaishou.com...');
  await page.goto('https://www.kuaishou.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);
  
  // 截图
  await page.screenshot({ path: path.join(DATA_DIR, 'debug-home.png') });
  console.log('截图已保存');
  
  // 打印捕获的请求
  console.log(`\n捕获 ${captured.length} 个 GraphQL 请求:`);
  for (const req of captured) {
    try {
      const body = JSON.parse(req.body);
      console.log(`\n--- ${body.operationName || 'unknown'} ---`);
      console.log(`Query: ${(body.query || '').substring(0, 200)}`);
      console.log(`Variables: ${JSON.stringify(body.variables)}`);
    } catch(e) {
      console.log(`Raw: ${req.body.substring(0, 200)}`);
    }
  }
  
  // 打印响应
  console.log(`\n\n捕获 ${responses.length} 个响应:`);
  for (const resp of responses) {
    console.log(`\n--- ${resp.url} ---`);
    console.log(JSON.stringify(resp.data).substring(0, 300));
  }
  
  await browser.close();
}

main().catch(console.error);
