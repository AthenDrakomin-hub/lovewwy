// 测试API端点是否正常工作
async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('测试API端点连接...\n');
  
  // 测试1: 测试list-files API
  console.log('测试1: /api/list-files');
  try {
    const response = await fetch(`${baseUrl}/api/list-files`);
    const data = await response.json();
    console.log(`状态: ${response.status}`);
    console.log(`响应: ${JSON.stringify(data, null, 2)}`);
    
    if (response.ok) {
      console.log('✅ /api/list-files API 正常工作\n');
    } else {
      console.log(`❌ /api/list-files API 返回错误: ${data.error || '未知错误'}\n`);
    }
  } catch (error) {
    console.log(`❌ 无法连接到 /api/list-files: ${error.message}\n`);
  }
  
  // 测试2: 测试上传初始化API
  console.log('测试2: /api/upload/init (POST)');
  try {
    const response = await fetch(`${baseUrl}/api/upload/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'test.txt',
        contentType: 'text/plain'
      })
    });
    
    const data = await response.json().catch(() => ({ error: '无法解析JSON响应' }));
    console.log(`状态: ${response.status}`);
    console.log(`响应: ${JSON.stringify(data, null, 2)}`);
    
    if (response.ok) {
      console.log('✅ /api/upload/init API 正常工作\n');
    } else {
      console.log(`❌ /api/upload/init API 返回错误: ${data.error || '未知错误'}\n`);
      
      // 如果是S3连接错误，提供更多信息
      if (data.error && data.error.includes('S3') || data.error && data.error.includes('storage')) {
        console.log('💡 可能的问题:');
        console.log('1. S3配置不正确');
        console.log('2. S3凭据无效');
        console.log('3. 存储桶不存在');
        console.log('4. 网络连接问题\n');
      }
    }
  } catch (error) {
    console.log(`❌ 无法连接到 /api/upload/init: ${error.message}\n`);
  }
  
  // 测试3: 测试应用根路径
  console.log('测试3: 应用根路径');
  try {
    const response = await fetch(baseUrl);
    console.log(`状态: ${response.status}`);
    console.log(`响应类型: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      console.log('✅ 应用根路径可访问\n');
    } else {
      console.log(`❌ 应用根路径返回错误状态: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ 无法连接到应用: ${error.message}\n`);
    console.log('💡 建议: 确保开发服务器正在运行 (npm run dev)\n');
  }
}

// 检查开发服务器是否运行
async function checkDevServer() {
  console.log('检查开发服务器状态...');
  try {
    const response = await fetch('http://localhost:3000', { 
      method: 'HEAD',
      timeout: 3000 
    }).catch(() => null);
    
    if (response && response.ok) {
      console.log('✅ 开发服务器正在运行\n');
      return true;
    } else {
      console.log('❌ 开发服务器未运行或无法访问\n');
      console.log('💡 请运行: npm run dev\n');
      return false;
    }
  } catch (error) {
    console.log('❌ 无法连接到开发服务器\n');
    console.log('💡 请运行: npm run dev\n');
    return false;
  }
}

// 主函数
async function main() {
  console.log('=== Supabase S3连接测试 ===\n');
  
  const isServerRunning = await checkDevServer();
  
  if (isServerRunning) {
    await testAPIEndpoints();
  } else {
    console.log('跳过API测试，因为开发服务器未运行。');
    console.log('\n💡 要测试S3连接，请先启动开发服务器:');
    console.log('1. 打开终端');
    console.log('2. 运行: npm run dev');
    console.log('3. 等待服务器启动');
    console.log('4. 然后重新运行此测试\n');
    
    console.log('或者，您可以手动测试:');
    console.log('1. 启动开发服务器: npm run dev');
    console.log('2. 在浏览器中访问: http://localhost:3000/api/list-files');
    console.log('3. 检查响应是否包含S3错误信息\n');
  }
  
  console.log('=== 测试完成 ===');
}

// 运行测试
main().catch(console.error);