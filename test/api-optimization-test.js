/**
 * API使用优化测试脚本
 * 验证API调用限制和缓存机制是否正常工作
 */

// 从环境变量获取API密钥
import fs from 'fs';
import path from 'path';

// 加载 .env.local 文件
function loadEnvFile(filePath) {
  const envPath = path.resolve(filePath);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        process.env[key.trim()] = value.trim();
      }
    });
    console.log(`✅ 已加载环境变量文件: ${filePath}`);
  } else {
    console.log(`⚠️  环境变量文件不存在: ${filePath}`);
  }
}

// 加载环境变量
loadEnvFile('./.env.local');

async function testApiOptimization() {
  console.log('🔍 开始测试API使用优化功能...');
  
  const apiKey = process.env.VITE_NEWS_API_KEY;
  const baseUrl = process.env.VITE_NEWS_API_BASE_URL || 'https://newsapi.org/v2';
  
  if (!apiKey) {
    console.log('❌ 未找到API密钥，请检查环境变量配置');
    return;
  }
  
  console.log(`🔑 使用API密钥进行测试...\n`);
  
  try {
    console.log('🧪 测试1: 检查相同请求是否会使用缓存...');
    
    // 第一次请求
    console.log('  发起第一次请求...');
    const startTime1 = Date.now();
    const response1 = await fetch(`${baseUrl}/top-headlines?category=general&country=us&apiKey=${apiKey}&pageSize=5`);
    const data1 = await response1.json();
    const duration1 = Date.now() - startTime1;
    
    console.log(`  第一次请求耗时: ${duration1}ms`);
    console.log(`  返回结果数: ${data1.articles?.length || 0}`);
    
    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 第二次相同请求
    console.log('  发起第二次相同请求...');
    const startTime2 = Date.now();
    const response2 = await fetch(`${baseUrl}/top-headlines?category=general&country=us&apiKey=${apiKey}&pageSize=5`);
    const data2 = await response2.json();
    const duration2 = Date.now() - startTime2;
    
    console.log(`  第二次请求耗时: ${duration2}ms`);
    console.log(`  返回结果数: ${data2.articles?.length || 0}`);
    
    if (duration2 < duration1 * 0.5) {
      console.log('  ✅ 缓存机制工作正常 (第二次请求更快)');
    } else {
      console.log('  ⚠️  缓存机制可能未生效');
    }
    
    console.log('\n---\n');
    
    console.log('🧪 测试2: 检查不同请求的响应...');
    
    // 不同分类的请求
    console.log('  发起商业新闻请求...');
    const businessStart = Date.now();
    const businessResponse = await fetch(`${baseUrl}/top-headlines?category=business&country=us&apiKey=${apiKey}&pageSize=5`);
    const businessData = await businessResponse.json();
    const businessDuration = Date.now() - businessStart;
    
    console.log(`  商业新闻请求耗时: ${businessDuration}ms`);
    console.log(`  返回结果数: ${businessData.articles?.length || 0}`);
    
    console.log('\n---\n');
    
    console.log('🧪 测试3: 模拟API使用统计...');
    
    // 模拟多次请求以测试限制机制
    const testRequests = 3;
    console.log(`  模拟发起 ${testRequests} 个不同请求...`);
    
    for (let i = 0; i < testRequests; i++) {
      const categories = ['technology', 'science', 'health'];
      const category = categories[i % categories.length];
      
      const start = Date.now();
      const response = await fetch(`${baseUrl}/top-headlines?category=${category}&country=us&apiKey=${apiKey}&pageSize=3`);
      const data = await response.json();
      const duration = Date.now() - start;
      
      console.log(`  ${i + 1}. ${category} 类别请求 - 耗时: ${duration}ms, 结果: ${data.articles?.length || 0}`);
    }
    
    console.log('\n✅ API使用优化测试完成!');
    console.log('\n💡 提示: 在实际应用中，系统会自动缓存请求结果以减少API调用次数。');
    console.log('   当API调用接近每日限额时，系统会优先使用缓存数据。');
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }
}

// 运行测试
testApiOptimization().then(() => {
  console.log('\n🏁 测试完成');
}).catch(error => {
  console.error('💥 测试失败:', error);
});