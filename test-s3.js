import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const endpoint = 'https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3';
const region = 'ap-south-1';
const accessKeyId = 'f38ef481de3083a75df0a4641914962a';
const secretAccessKey = '7d3bbaf345256cb64e9e377457018f8cdc4013aa6ec0d9a6d87e4d2e1003c91c';
const bucketName = 'wangyiyun';

const s3Client = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

async function testS3Connection() {
  console.log('🔍 测试S3连接...');
  console.log('端点:', endpoint);
  console.log('区域:', region);
  console.log('存储桶:', bucketName);
  
  try {
    let continuationToken = undefined;
    let allFiles = [];
    let page = 1;
    
    do {
      console.log(`正在获取第 ${page} 页...`);
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });
      const response = await s3Client.send(command);
      
      if (response.Contents) {
        allFiles = allFiles.concat(response.Contents);
      }
      
      continuationToken = response.NextContinuationToken;
      page++;
    } while (continuationToken);
    
    console.log('✅ S3连接成功！');
    console.log('找到文件数量:', allFiles.length);
    
    if (allFiles.length > 0) {
      console.log('\n前10个文件:');
      allFiles.slice(0, 10).forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.Key} (${file.Size} bytes, 最后修改: ${file.LastModified})`);
      });
    } else {
      console.log('存储桶为空或无法访问文件列表。');
    }
    
    return { success: true, fileCount: allFiles.length };
  } catch (error) {
    console.error('❌ S3连接失败:');
    console.error('错误信息:', error.message);
    
    if (error.name === 'InvalidAccessKeyId') {
      console.error('可能原因: Access Key ID 无效');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('可能原因: Secret Access Key 无效');
    } else if (error.name === 'NoSuchBucket') {
      console.error('可能原因: 存储桶不存在');
    } else if (error.code === 'ENOTFOUND') {
      console.error('可能原因: 端点URL无法访问');
    }
    
    return { success: false, error: error.message };
  }
}

// 运行测试
testS3Connection().then(result => {
  if (result.success) {
    console.log('\n🎉 S3连接测试完成，连接正常！');
    process.exit(0);
  } else {
    console.log('\n💥 S3连接测试失败！');
    process.exit(1);
  }
}).catch(err => {
  console.error('测试脚本执行错误:', err);
  process.exit(1);
});