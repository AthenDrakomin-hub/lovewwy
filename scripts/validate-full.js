#!/usr/bin/env node
/**
 * 加载环境变量并验证Supabase S3配置
 */

// 手动加载环境变量
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

// 验证环境变量
function validateEnvironmentVariables() {
  console.log('\n🔍 验证环境变量配置...');
  
  const requiredEnvVars = [
    'VITE_AWS_S3_ENDPOINT',
    'VITE_AWS_S3_REGION',
    'VITE_AWS_S3_ACCESS_KEY_ID',
    'VITE_AWS_S3_SECRET_ACCESS_KEY',
    'VITE_AWS_S3_BUCKET',
    'VITE_SUPABASE_AUTH_URL'
  ];
  
  let allPresent = true;
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.log(`❌ 环境变量未设置: ${varName}`);
      allPresent = false;
    } else {
      if (varName.includes('KEY') || varName.includes('SECRET')) {
        console.log(`✅ ${varName}: ${process.env[varName].substring(0, 10)}...`);
      } else {
        console.log(`✅ ${varName}: ${process.env[varName]}`);
      }
    }
  }
  
  return allPresent;
}

// 测试认证服务连接
async function testAuthConnection() {
  console.log('\n🔍 测试Supabase认证服务连接...');
  
  try {
    const authUrl = process.env.VITE_SUPABASE_AUTH_URL;
    const response = await fetch(`${authUrl}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'invalid_password_for_testing' })
    });
    
    if (response.status === 401) {
      console.log('✅ 认证服务连接正常（拒绝无效密码）');
      return true;
    } else {
      console.log(`⚠️  认证服务响应异常: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 认证服务连接失败: ${error.message}`);
    return false;
  }
}

// 测试S3存储桶连接
async function testS3Connection() {
  console.log('\n🔍 测试S3存储桶连接...');
  
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
      return true;
    } else {
      throw new Error(`列表请求失败: ${listResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ S3存储桶连接测试失败: ${error.message}`);
    return false;
  }
}

// 测试安全上传
async function testSecureUpload() {
  console.log('\n🔍 测试安全文件上传...');
  
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
      return true;
    } else {
      throw new Error(`上传失败: ${uploadResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ 安全文件上传测试失败: ${error.message}`);
    return false;
  }
}

// 测试安全删除
async function testSecureDelete() {
  console.log('\n🔍 测试安全文件删除...');
  
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
      return true;
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
        return true;
      } else {
        throw new Error(`删除失败: ${deleteResponse.status}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ 安全文件删除测试失败: ${error.message}`);
    return false;
  }
}

// 主验证函数
async function runValidation() {
  console.log('🚀 开始Supabase S3环境配置验证...\n');
  
  const results = [];
  
  // 1. 环境变量验证
  const envOk = validateEnvironmentVariables();
  results.push({ test: '环境变量验证', passed: envOk });
  
  if (!envOk) {
    console.log('❌ 环境变量验证失败，停止后续测试');
    return;
  }
  
  // 2. 认证服务连接测试
  const authOk = await testAuthConnection();
  results.push({ test: '认证服务连接', passed: authOk });
  
  // 3. S3存储桶连接测试
  const s3Ok = await testS3Connection();
  results.push({ test: 'S3存储桶连接', passed: s3Ok });
  
  // 4. 安全上传测试
  const uploadOk = await testSecureUpload();
  results.push({ test: '安全文件上传', passed: uploadOk });
  
  // 5. 安全删除测试
  const deleteOk = await testSecureDelete();
  results.push({ test: '安全文件删除', passed: deleteOk });
  
  // 生成最终报告
  console.log('\n📋 验证报告:');
  console.log('='.repeat(50));
  
  let passedCount = 0;
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.test}`);
    if (result.passed) passedCount++;
  });
  
  console.log('='.repeat(50));
  console.log(`总计: ${passedCount}/${results.length} 个测试通过`);
  
  if (passedCount === results.length) {
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