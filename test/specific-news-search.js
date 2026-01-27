/**
 * 特定新闻搜索测试脚本
 * 搜索关于特朗普、BBC新闻及中美金融投资市场相关新闻
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

async function searchSpecificNews() {
  console.log('🔍 开始搜索特定新闻...');
  
  const apiKey = process.env.VITE_NEWS_API_KEY;
  const baseUrl = process.env.VITE_NEWS_API_BASE_URL || 'https://newsapi.org/v2';
  
  if (!apiKey) {
    console.log('❌ 未找到API密钥，请检查环境变量配置');
    return;
  }
  
  console.log(`🔑 使用API密钥开始搜索...\n`);
  
  try {
    // 1. 搜索特朗普相关新闻
    console.log('DonaldTrump 📰 正在搜索特朗普相关新闻...');
    const trumpResponse = await fetch(`${baseUrl}/everything?q=Trump%20OR%20特朗普&sortBy=publishedAt&language=en&apiKey=${apiKey}&pageSize=5`);
    const trumpNews = await trumpResponse.json();
    
    if (trumpNews.status === 'ok' && trumpNews.articles.length > 0) {
      console.log(`✅ 找到 ${trumpNews.totalResults} 条特朗普相关新闻，显示前5条:`);
      trumpNews.articles.slice(0, 5).forEach((article, index) => {
        console.log(`  ${index + 1}. [${article.source.name}] ${article.title.substring(0, 80)}...`);
        console.log(`      发布时间: ${new Date(article.publishedAt).toLocaleString('zh-CN')}`);
      });
    } else {
      console.log('❌ 未找到特朗普相关新闻');
    }
    
    console.log('\n---\n');
    
    // 2. 搜索BBC新闻
    console.log('🇬🇧 📰 正在搜索BBC新闻...');
    const bbcResponse = await fetch(`${baseUrl}/everything?sources=bbc-news&apiKey=${apiKey}&pageSize=5`);
    const bbcNews = await bbcResponse.json();
    
    if (bbcNews.status === 'ok' && bbcNews.articles.length > 0) {
      console.log(`✅ 找到 ${bbcNews.totalResults} 条BBC新闻，显示前5条:`);
      bbcNews.articles.slice(0, 5).forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title.substring(0, 80)}...`);
        console.log(`      发布时间: ${new Date(article.publishedAt).toLocaleString('zh-CN')}`);
      });
    } else {
      console.log('❌ 未找到BBC新闻');
    }
    
    console.log('\n---\n');
    
    // 3. 搜索中美金融投资市场相关新闻
    console.log('💼 📈 正在搜索中美金融投资市场相关新闻...');
    const marketQuery = encodeURIComponent("(中国 OR 中国 OR China OR 中美 OR US-China OR 美国) AND (金融 OR finance OR 投资 OR investment OR 市场 OR market OR 股票 OR stock OR 经济 OR economy)");
    const marketResponse = await fetch(`${baseUrl}/everything?q=${marketQuery}&sortBy=publishedAt&language=zh&apiKey=${apiKey}&pageSize=5`);
    const marketNews = await marketResponse.json();
    
    if (marketNews.status === 'ok' && marketNews.articles.length > 0) {
      console.log(`✅ 找到 ${marketNews.totalResults} 条中美金融市场相关新闻，显示前5条:`);
      marketNews.articles.slice(0, 5).forEach((article, index) => {
        console.log(`  ${index + 1}. [${article.source.name}] ${article.title.substring(0, 80)}...`);
        console.log(`      发布时间: ${new Date(article.publishedAt).toLocaleString('zh-CN')}`);
      });
    } else {
      console.log('❌ 未找到中美金融市场相关新闻');
    }
    
    console.log('\n---\n');
    
    // 4. 搜索更广泛的国际财经新闻
    console.log('🌍 💰 正在搜索国际财经新闻...');
    const businessResponse = await fetch(`${baseUrl}/everything?q=economy%20OR%20finance%20OR%20investment&sortBy=publishedAt&category=business&apiKey=${apiKey}&pageSize=5`);
    const businessNews = await businessResponse.json();
    
    if (businessNews.status === 'ok' && businessNews.articles.length > 0) {
      console.log(`✅ 找到 ${businessNews.totalResults} 条国际财经新闻，显示前5条:`);
      businessNews.articles.slice(0, 5).forEach((article, index) => {
        console.log(`  ${index + 1}. [${article.source.name}] ${article.title.substring(0, 80)}...`);
        console.log(`      发布时间: ${new Date(article.publishedAt).toLocaleString('zh-CN')}`);
      });
    } else {
      console.log('❌ 未找到国际财经新闻');
    }
    
  } catch (error) {
    console.error('💥 搜索过程中发生错误:', error);
  }
}

// 运行搜索
searchSpecificNews().then(() => {
  console.log('\n🏁 搜索完成');
}).catch(error => {
  console.error('💥 搜索失败:', error);
});