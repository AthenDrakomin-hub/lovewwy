import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

// 从环境变量获取S3配置
// 注意：在Next.js项目中，环境变量应该已经通过process.env可用
const s3Config = {
  endpoint: process.env.NEXT_PUBLIC_SUPABASE_S3_ENDPOINT,
  region: process.env.NEXT_PUBLIC_SUPABASE_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
};

console.log('S3配置检查:');
console.log('Endpoint:', s3Config.endpoint);
console.log('Region:', s3Config.region);
console.log('Access Key ID:', s3Config.credentials.accessKeyId ? '已设置' : '未设置');
console.log('Secret Access Key:', s3Config.credentials.secretAccessKey ? '已设置' : '未设置');
console.log('Bucket:', process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET);

// 检查配置是否完整
const missingConfigs = [];
if (!s3Config.endpoint) missingConfigs.push('NEXT_PUBLIC_SUPABASE_S3_ENDPOINT');
if (!s3Config.region) missingConfigs.push('NEXT_PUBLIC_SUPABASE_S3_REGION');
if (!s3Config.credentials.accessKeyId) missingConfigs.push('NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID');
if (!s3Config.credentials.secretAccessKey) missingConfigs.push('NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY');
if (!process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET) missingConfigs.push('NEXT_PUBLIC_SUPABASE_S3_BUCKET');

if (missingConfigs.length > 0) {
  console.error('\n❌ 缺少S3配置:', missingConfigs.join(', '));
  process.exit(1);
}

console.log('\n✅ S3配置完整，尝试连接...');

async function testS3Connection() {
  try {
    // 创建S3客户端
    const s3Client = new S3Client(s3Config);
    
    // 测试1: 尝试列出存储桶（如果权限允许）
    console.log('\n测试1: 尝试列出存储桶...');
    try {
      const listBucketsCommand = new ListBucketsCommand({});
      const bucketsResult = await s3Client.send(listBucketsCommand);
      console.log('✅ 成功连接到S3服务');
      console.log('可用的存储桶:', bucketsResult.Buckets?.map(b => b.Name).join(', ') || '无');
    } catch (listError) {
      console.log('⚠️ 无法列出存储桶（可能是权限限制），尝试其他测试...');
    }
    
    // 测试2: 尝试列出指定存储桶中的对象
    console.log('\n测试2: 尝试列出存储桶中的对象...');
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET;
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const listObjectsCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 5
      });
      const objectsResult = await s3Client.send(listObjectsCommand);
      console.log(`✅ 成功访问存储桶: ${bucketName}`);
      console.log(`对象数量: ${objectsResult.Contents?.length || 0}`);
      if (objectsResult.Contents && objectsResult.Contents.length > 0) {
        console.log('前5个对象:');
        objectsResult.Contents.slice(0, 5).forEach((obj, index) => {
          console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
        });
      }
    } catch (objectsError) {
      console.error(`❌ 无法访问存储桶 ${bucketName}:`, objectsError.message);
      console.log('错误详情:', objectsError.name);
      
      // 提供调试信息
      console.log('\n🔧 调试信息:');
      console.log('1. 检查Endpoint URL是否正确');
      console.log('2. 检查Access Key和Secret Key是否正确');
      console.log('3. 检查存储桶名称是否正确');
      console.log('4. 检查网络连接是否正常');
      console.log('5. 检查Supabase S3服务状态');
    }
    
    // 测试3: 简单的心跳检测
    console.log('\n测试3: 心跳检测...');
    try {
      // 尝试发送一个简单的请求
      const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
      const headBucketCommand = new HeadBucketCommand({
        Bucket: bucketName
      });
      await s3Client.send(headBucketCommand);
      console.log(`✅ 存储桶 ${bucketName} 可访问`);
    } catch (headError) {
      console.error(`❌ 存储桶 ${bucketName} 不可访问:`, headError.message);
    }
    
  } catch (error) {
    console.error('\n❌ S3连接测试失败:');
    console.error('错误名称:', error.name);
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.Code || 'N/A');
    
    // 常见错误处理
    if (error.name === 'CredentialsProviderError') {
      console.log('\n💡 建议: 检查Access Key和Secret Key是否正确');
    } else if (error.name === 'TimeoutError') {
      console.log('\n💡 建议: 检查网络连接和Endpoint URL');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.log('\n💡 建议: Access Key ID无效');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n💡 建议: Secret Access Key无效');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n💡 建议: 存储桶不存在');
    }
  }
}

// 运行测试
testS3Connection();