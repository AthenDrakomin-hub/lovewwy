/**
 * NewsAPI连接测试脚本
 * 验证API密钥是否有效以及能否获取新闻数据
 */

// 由于是直接运行测试，我们需要使用相对路径导入
import { newsService } from '../services/newsService.js';

async function testNewsApiConnection() {
  console.log('🔍 开始测试NewsAPI连接...');
  
  try {
    // 测试获取特朗普相关的头条新闻
    console.log('📰 正在获取关于特朗普的头条新闻...');
    const trumpNews = await newsService.getTopHeadlines({
      q: 'trump',
      pageSize: 5
    });
    
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
    const generalNews = await newsService.getTopHeadlines({
      category: 'general',
      country: 'us',
      pageSize: 3
    });
    
    if (generalNews.status === 'ok') {
      console.log(`✅ 成功获取通用新闻，共 ${generalNews.articles.length} 条`);
    } else {
      console.log('❌ 获取通用新闻失败:', generalNews.message || '未知错误');
    }
    
    console.log('\n🎯 测试新闻搜索功能...');
    const searchResult = await newsService.searchNews({
      q: 'technology',
      language: 'en',
      sortBy: 'relevancy',
      pageSize: 3
    });
    
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