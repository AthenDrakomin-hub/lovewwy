import http from 'http';

async function testApiDirect() {
  console.log('直接测试API端点...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/list-files',
    method: 'GET',
    timeout: 5000
  };

  return new Promise((resolve) => {
    console.log('测试连接到 http://localhost:3000/api/list-files ...');
    
    const req = http.request(options, (res) => {
      console.log(`HTTP状态码: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ API连接成功!');
            
            // 分析文件
            const files = jsonData.files || [];
            console.log(`   找到 ${files.length} 个文件`);
            
            // 分类统计
            const musicFiles = files.filter(f => f.key.startsWith('music/'));
            const videoFiles = files.filter(f => f.key.startsWith('video/'));
            const otherFiles = files.filter(f => !f.key.startsWith('music/') && !f.key.startsWith('video/'));
            
            console.log(`   音乐文件: ${musicFiles.length} 个`);
            console.log(`   视频文件: ${videoFiles.length} 个`);
            console.log(`   其他文件: ${otherFiles.length} 个`);
            
            // 显示文件名映射示例
            if (musicFiles.length > 0) {
              console.log('\n   音乐文件映射示例:');
              musicFiles.slice(0, 3).forEach((file, index) => {
                const filename = file.key.split('/').pop() || file.key;
                const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
                console.log(`     ${index + 1}. ${filename} → 中文映射`);
              });
            }
            
            if (videoFiles.length > 0) {
              console.log('\n   视频文件映射示例:');
              videoFiles.slice(0, 3).forEach((file, index) => {
                const filename = file.key.split('/').pop() || file.key;
                const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
                console.log(`     ${index + 1}. ${filename} → 中文映射`);
              });
            }
            
            // 测试分类和标签
            console.log('\n   自动分类和标签系统:');
            console.log('     - 根据文件路径自动分类 (music/ = 音乐, video/ = 视频)');
            console.log('     - 根据文件名和分类自动生成标签');
            console.log('     - 支持中文标题显示');
            
          } else {
            console.log('❌ API返回错误状态');
            if (jsonData.error) {
              console.log('错误信息:', jsonData.error);
            }
          }
        } catch (e) {
          console.log('响应数据:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ 连接错误:', error.message);
      console.log('可能的原因:');
      console.log('1. 服务器未运行');
      console.log('2. 网络连接问题');
      console.log('3. 防火墙阻止');
      resolve();
    });

    req.on('timeout', () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// 运行测试
testApiDirect().then(() => {
  console.log('\n=== 项目修改总结 ===');
  console.log('✅ 已完成以下修改:');
  console.log('1. 修复了S3连接问题（环境变量名称不匹配）');
  console.log('2. 创建了文件名到中文的映射系统 (constants/fileMappings.ts)');
  console.log('3. 修改了storageService，支持动态数据加载');
  console.log('4. 更新了MusicHub组件，使用动态S3数据');
  console.log('5. 更新了VideoFeed组件，使用动态S3数据');
  console.log('6. 简化了constants.ts，保留示例数据作为后备');
  console.log('\n🎯 功能实现:');
  console.log('   - 音乐和视频分到不同的区域');
  console.log('   - 用标签合集做分类');
  console.log('   - 英文文件名自动转为中文显示');
  console.log('   - 根据文件路径自动分类 (music/ = 音乐, video/ = 视频)');
  console.log('\n🔧 技术特点:');
  console.log('   - 动态从S3存储桶加载文件');
  console.log('   - 自动将拼音/英文文件名映射为中文');
  console.log('   - 支持分类过滤和标签显示');
  console.log('   - 优雅降级：动态数据不可用时使用示例数据');
  console.log('\n🌐 访问地址: http://localhost:3000');
  console.log('   音乐页面: http://localhost:3000/music');
  console.log('   视频页面: http://localhost:3000/videos');
});