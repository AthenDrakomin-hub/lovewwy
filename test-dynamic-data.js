import { getMusicMediaItems, getVideoMediaItems } from './services/storageService.js';

async function testDynamicData() {
  console.log('测试动态数据加载...\n');
  
  try {
    // 测试音乐数据
    console.log('1. 测试音乐数据加载...');
    const musicItems = await getMusicMediaItems();
    console.log(`   找到 ${musicItems.length} 个音乐文件`);
    
    if (musicItems.length > 0) {
      console.log('   前3个音乐文件:');
      musicItems.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} - ${item.artist} (${item.category})`);
        console.log(`      标签: ${item.tags.join(', ')}`);
        console.log(`      路径: ${item.url}`);
      });
    } else {
      console.log('   ⚠️ 没有找到音乐文件，将使用示例数据');
    }
    
    console.log('\n2. 测试视频数据加载...');
    const videoItems = await getVideoMediaItems();
    console.log(`   找到 ${videoItems.length} 个视频文件`);
    
    if (videoItems.length > 0) {
      console.log('   前3个视频文件:');
      videoItems.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} - ${item.artist} (${item.category})`);
        console.log(`      标签: ${item.tags.join(', ')}`);
        console.log(`      路径: ${item.url}`);
      });
    } else {
      console.log('   ⚠️ 没有找到视频文件，将使用示例数据');
    }
    
    console.log('\n3. 测试分类系统...');
    const allCategories = [...new Set([...musicItems.map(m => m.category), ...videoItems.map(v => v.category)])];
    console.log(`   发现 ${allCategories.length} 个分类: ${allCategories.join(', ')}`);
    
    console.log('\n4. 测试标签系统...');
    const allTags = [...new Set([...musicItems.flatMap(m => m.tags), ...videoItems.flatMap(v => v.tags)])];
    console.log(`   发现 ${allTags.length} 个标签: ${allTags.slice(0, 10).join(', ')}${allTags.length > 10 ? '...' : ''}`);
    
    console.log('\n✅ 动态数据加载测试完成！');
    console.log(`   总计: ${musicItems.length} 个音乐文件, ${videoItems.length} 个视频文件`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testDynamicData();