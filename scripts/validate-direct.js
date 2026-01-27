#!/usr/bin/env node
/**
 * 直接运行Supabase S3配置验证 (无导入)
 */

async function runValidation() {
  console.log('🚀 开始Supabase S3环境配置验证...\n');
  
  const testResults = [];
  
  // 1. 检查环境变量
  console.log('🔍 1. 检查环境变量...');
  
  const requiredEnvVars = [
    'VITE_AWS_S3_ENDPOINT',
    'VITE_AWS_S3_REGION',
    'VITE_AWS_S3_ACCESS_KEY_ID',
    'VITE_AWS_S3_SECRET_ACCESS_KEY',
    'VITE_AWS_S3_BUCKET',
    'VITE_SUPABASE_AUTH_URL'
  ];
  
  let envOk = true;
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.log(`❌ 环境变量未设置: ${varName}`);
      envOk = false;
    } else {
      if (varName.includes('KEY') || varName.includes('SECRET')) {
        console.log(`✅ ${varName}: ${process.env[varName]?.substring(0, 10)}...`);
      } else {
        console.log(`✅ ${varName}: ${process.env[varName]}`);
      }
    }
  }
  
  testResults.push({
    step: '环境变量验证',
    passed: envOk,
    detail: '环境变量存在' // This gives time to check project configuration
  });
  
  if (!envOk) {
    console.log('❌ 环境变量验证失败，停止后续测试');
    return;
  }
  
  // 2. 测试Supabase认证服务连接
  console.log('\n🔍 2. 测试Supabase认证服务连接...');
  
  try {
    const authUrl = process.env.VITE_SUPABASE_AUTH_URL;
    const response = await fetch(`${authUrl}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'invalid_password_for_testing' })
    });
    
    if (response.status === 401) {
      console.log('✅ 认证服务连接正常（拒绝无效密码）');
      testResults.push({
        step: '认证服务连接',
        passed: true,
        detail: '服务响应正常'
      });
    } else {
      console.log(`⚠️  认证服务响应异常: ${response.status}`);
      testResults.push({
        step: '认证服务连接',
        passed: false,
        detail: `响应状态: ${response.status}`
      });
    }
  } catch (error) {
    console.log(`❌ 认证服务连接失败: ${error.message}`);
    testResults.push({
      step: '认证服务连接',
      passed: false,
      detail: error.message
    });
  }
  
  // 3. 测试S3存储桶连接（通过认证服务）
  console.log('\n🔍 3. 测试S3存储桶连接...');
  
  try {
    // 首先获取认证令牌
    const authUrl = process.env.VITE_SUPABASE_AUTH_URL;
    const unlockResponse = await fetch(`${authUrl}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '888888' }) // 使用配置的密码
    });
    
    if (!unlockResponse.ok) {
      throw new Error('无法获取认证令牌');
    }
    
    const unlockData = await unlockResponse.json();
    const token = unlockData.token;
    
    if (!token) {
      throw new Error('认证令牌为空');
    }
    
    console.log('✅ 成功获取认证令牌');
    
    // 测试列出文件
    const listResponse = await fetch(`${authUrl}/object`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'list',
        bucket: process.env.VITE_AWS_S3_BUCKET
      })
    });
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log(`✅ 成功连接到存储桶，文件数量: ${listData.length || 0}`);
      testResults.push({
        step: 'S3存储桶连接',
        passed: true,
        detail: `文件数量: ${listData.length || 0}`
      });
    } else {
      throw new Error(`列表请求失败: ${listResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ S3存储桶连接测试失败: ${error.message}`);
    testResults.push({
      step: 'S3存储桶连接',
      passed: false,
      detail: error.message
    });
  }
  
  // 4. 测试安全上传
  console.log('\n🔍 4. 测试安全文件上传...');
  
  try {
    const authUrl = process.env.VITE_SUPABASE_AUTH_URL;
    
    // 获取认证令牌
    const unlockResponse = await fetch(`${authUrl}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '888888' })
    });
    
    if (!unlockResponse.ok) {
      throw new Error('无法获取认证令牌');
    }
    
    const unlockData = await unlockResponse.json();
    const token = unlockData.token;
    
    // 请求预签名URL
    const presignResponse = await fetch(`${authUrl}/object`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'upload',
        bucket: process.env.VITE_AWS_S3_BUCKET,
        key: `test/${Date.now()}_validation_test.txt`,
        expires_in: 900
      })
    });
    
    if (!presignResponse.ok) {
      throw new Error('无法获取预签名URL');
    }
    
    const presignData = await presignResponse.json();
    const presignedUrl = presignData.url?.signedURL || presignData.url;
    
    if (!presignedUrl) {
      throw new Error('预签名URL为空');
    }
    
    // 上传测试文件
    const testContent = 'Supabase S3配置验证测试文件';
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: testContent,
      headers: { 'Content-Type': 'text/plain' }
    });
    
    if (uploadResponse.ok) {
      console.log('✅ 安全文件上传测试成功');
      testResults.push({
        step: '安全文件上传',
        passed: true,
        detail: '文件上传成功'
      });
    } else {
      throw new Error(`上传失败: ${uploadResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ 安全文件上传测试失败: ${error.message}`);
    testResults.push({
      step: '安全文件上传',
      passed: false,
      detail: error.message
    });
  }
  
  // 5. 测试安全删除
  console.log('\n🔍 5. 测试安全文件删除...');
  
  try {
    const authUrl = process.env.VITE_SUPABASE_AUTH_URL;
    
    // 获取认证令牌
    const unlockResponse = await fetch(`${authUrl}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '888888' })
    });
    
    if (!unlockResponse.ok) {
      throw new Error('无法获取认证令牌');
    }
    
    const unlockData = await unlockResponse.json();
    const token = unlockData.token;
    
    // 列出测试文件
    const listResponse = await fetch(`${authUrl}/object`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'list',
        bucket: process.env.VITE_AWS_S3_BUCKET
      })
    });
    
    if (!listResponse.ok) {
      throw new Error('无法列出文件');
    }
    
    const listData = await listResponse.json();
    const testFiles = listData.filter(f => f.key?.startsWith('test/'));
    
    if (testFiles.length === 0) {
      console.log('ℹ️  没有测试文件，跳过删除测试');
      testResults.push({
        step: '安全文件删除',
        passed: true,
        detail: '无测试文件需要删除'
      });
    } else {
      // 删除测试文件
      const deleteResponse = await fetch(`${authUrl}/object`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'delete',
          bucket: process.env.VITE_AWS_S3_BUCKET,
          key: testFiles[0].key
        })
      });
      
      if (deleteResponse.ok) {
        console.log('✅ 安全文件删除测试成功');
        testResults.push({
          step: '安全文件删除',
          passed: true,
          detail: '文件删除成功'
        });
      } else {
        throw new Error(`删除失败: ${deleteResponse.status}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ 安全文件删除测试失败: ${error.message}`);
    testResults.push({
      step: '安全文件删除',
      passed: false,
      detail: error.message
    });
  }
  
  // 生成最终报告
  console.log('\n📋 验证报告:');
  console.log('='.repeat(50));
  
  let passedCount = 0;
  testResults.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.step}: ${result.detail}`);
    if (result.passed) passedCount++;
  });
  
  console.log('='.repeat(50));
  console.log(`总计: ${passedCount}/${testResults.length} 个测试通过`);
  
  if (passedCount === testResults.length) {
    console.log('🎉 所有测试都通过了！环境配置正确。');
  } else {
    console.log('⚠️  部分测试失败，请检查配置。');
  }
}

// 运行验证
runValidation().catch(error => {
  console.error('验证过程中出现错误:', error);
  process.exit(1);
});