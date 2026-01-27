/**
 * NewsAPI连接测试脚本
 * 验证API密钥是否有效以及能否获取新闻数据
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

async function testNewsApiConnection() {
  console.log('🔍 开始测试NewsAPI连接...');
  
  const apiKey = process.env.VITE_NEWS_API_KEY;
  const baseUrl = process.env.VITE_NEWS_API_BASE_URL || 'https://newsapi.org/v2';
  
  if (!apiKey) {
    console.log('❌ 未找到API密钥，请检查环境变量配置');
    return;
  }
  
  console.log(`🔑 API密钥已找到，开始测试...`);
  
  try {
    // 测试获取特朗普相关的头条新闻
    console.log('📰 正在获取关于特朗普的头条新闻...');
    const trumpResponse = await fetch(`${baseUrl}/everything?q=trump&apiKey=${apiKey}&pageSize=5`);
    const trumpNews = await trumpResponse.json();
    
    if (trumpNews.status === 'ok') {
      console.log(`✅ 成功获取新闻，共 ${trumpNews.totalResults} 条结果`);
      console.log(`📰 获取到 ${trumpNews.articles.length} 条新闻`);
      
      // 显示前几条新闻标题
      trumpNews.articles.slice(0, 3).forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title.substring(0, 60)}...`);
      });
    } else {
      console.log('❌ 获取新闻失败:', trumpNews.message || '未知错误');
      console.log('🔧 可能的原因:');
      console.log('   - API密钥无效');
      console.log('   - 请求频率超限');
      console.log('   - 网络连接问题');
    }
    
    console.log('\n🔍 测试通用新闻获取...');
    const generalResponse = await fetch(`${baseUrl}/top-headlines?category=general&country=us&apiKey=${apiKey}&pageSize=3`);
    const generalNews = await generalResponse.json();
    
    if (generalNews.status === 'ok') {
      console.log(`✅ 成功获取通用新闻，共 ${generalNews.articles.length} 条`);
    } else {
      console.log('❌ 获取通用新闻失败:', generalNews.message || '未知错误');
    }
    
    console.log('\n🎯 测试新闻搜索功能...');
    const searchResponse = await fetch(`${baseUrl}/everything?q=technology&language=en&sortBy=relevancy&apiKey=${apiKey}&pageSize=3`);
    const searchResult = await searchResponse.json();
    
    if (searchResult.status === 'ok') {
      console.log(`✅ 成功搜索新闻，共 ${searchResult.articles.length} 条结果`);
    } else {
      console.log('❌ 搜索新闻失败:', searchResult.message || '未知错误');
    }
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }
}

// 运行测试
testNewsApiConnection().then(() => {
  console.log('\n🏁 测试完成');
}).catch(error => {
  console.error('💥 测试失败:', error);
});