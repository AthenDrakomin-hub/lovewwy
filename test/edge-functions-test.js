/**
 * Supabase Edge Functions 测试脚本
 * 验证新的函数URL和API路由是否正常工作
 */

import fs from 'fs';
import path from 'path';

// 加载环境变量
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

async function testEdgeFunctions() {
  console.log('🔍 开始测试 Supabase Edge Functions 配置...');
  
  const functionUrl = process.env.VITE_SUPABASE_AUTH_URL;
  const password = process.env.VITE_PASSWORD || 'test_password'; // 使用测试密码
  
  if (!functionUrl) {
    console.log('❌ 未找到 VITE_SUPABASE_AUTH_URL，请检查环境变量配置');
    return;
  }
  
  console.log(`🔗 测试函数URL: ${functionUrl}`);
  
  try {
    // 1. 测试根路径
    console.log('\n🧪 测试1: 根路径访问...');
    try {
      const rootResponse = await fetch(functionUrl);
      console.log(`   根路径状态: ${rootResponse.status}`);
      if (rootResponse.ok) {
        const rootData = await rootResponse.json();
        console.log('   根路径响应:', JSON.stringify(rootData, null, 2));
      }
    } catch (error) {
      console.log('   根路径访问失败:', error.message);
    }
    
    // 2. 测试解锁路径（需要密码）
    console.log('\n🧪 测试2: 解锁路径测试 (需要密码)...');
    try {
      const unlockResponse = await fetch(`${functionUrl}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });
      
      console.log(`   解锁路径状态: ${unlockResponse.status}`);
      if (unlockResponse.status === 401) {
        console.log('   ❌ 密码错误或未提供密码');
      } else if (unlockResponse.ok) {
        const unlockData = await unlockResponse.json();
        console.log('   解锁成功，获得令牌:', unlockData.token ? 'Yes' : 'No');
        console.log('   完整响应:', JSON.stringify(unlockData, null, 2));
      } else {
        console.log('   解锁失败，错误详情:', unlockResponse.statusText);
      }
    } catch (error) {
      console.log('   解锁路径测试失败:', error.message);
    }
    
    console.log('\n✅ Edge Functions 测试完成!');
    console.log('\n💡 提示: 如果解锁测试失败，可能是因为:');
    console.log('   1. 密码不正确 - 使用您配置 PASSWORD_HASH 的原始密码');
    console.log('   2. 函数尚未正确部署');
    console.log('   3. 网络连接问题');
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }
}

// 运行测试
testEdgeFunctions().then(() => {
  console.log('\n🏁 测试完成');
}).catch(error => {
  console.error('💥 测试失败:', error);
});