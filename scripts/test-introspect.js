// 内省快手GraphQL Schema
async function test() {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://www.kuaishou.com/',
    'Origin': 'https://www.kuaishou.com'
  };

  // 1. 获取 Query 类型的所有字段
  const queryFields = `{ __schema { queryType { fields { name args { name type { name kind } } } } } }`;
  
  const resp1 = await fetch('https://www.kuaishou.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ operationName: 'introspect', variables: {}, query: queryFields })
  });
  const data1 = await resp1.json();
  
  if (data1.data?.__schema?.queryType?.fields) {
    console.log('=== Query 字段列表 ===');
    const fields = data1.data.__schema.queryType.fields;
    // 只打印跟video/feed/hot/search相关的
    const relevant = fields.filter(f => 
      f.name.toLowerCase().includes('feed') || 
      f.name.toLowerCase().includes('hot') || 
      f.name.toLowerCase().includes('video') || 
      f.name.toLowerCase().includes('search') || 
      f.name.toLowerCase().includes('explore') || 
      f.name.toLowerCase().includes('photo') ||
      f.name.toLowerCase().includes('rank') ||
      f.name.toLowerCase().includes('tube')
    );
    
    for (const f of relevant) {
      const args = f.args.map(a => `${a.name}:${a.type.name || a.type.kind}`).join(', ');
      console.log(`  ${f.name}(${args})`);
    }
    
    // 也打印前30个字段
    console.log('\n=== 前30个字段 ===');
    fields.slice(0, 30).forEach(f => {
      const args = f.args.map(a => `${a.name}:${a.type.name || a.type.kind}`).join(', ');
      console.log(`  ${f.name}(${args})`);
    });
  } else {
    console.log('内省失败:', JSON.stringify(data1).substring(0, 500));
  }

  // 2. 尝试 visionTube 字段的类型
  const tubeType = `{ __type(name: "VisionTubeResult") { name fields { name type { name kind ofType { name } } } } }`;
  const resp2 = await fetch('https://www.kuaishou.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ operationName: 'introspect2', variables: {}, query: tubeType })
  });
  const data2 = await resp2.json();
  console.log('\n=== VisionTubeResult 字段 ===');
  console.log(JSON.stringify(data2, null, 2).substring(0, 800));
}

test().catch(console.error);
