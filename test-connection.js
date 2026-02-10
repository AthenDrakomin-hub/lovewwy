import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/list-files',
  method: 'GET',
  timeout: 5000
};

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
      console.log('响应:', JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 200) {
        console.log('✅ S3连接成功!');
        if (jsonData.files) {
          console.log(`找到 ${jsonData.files.length} 个文件`);
        }
      } else {
        console.log('❌ API返回错误状态');
        if (jsonData.error) {
          console.log('错误信息:', jsonData.error);
          
          // 检查是否是S3相关错误
          if (jsonData.error.includes('S3') || 
              jsonData.error.includes('InvalidAccessKeyId') ||
              jsonData.error.includes('credentials') ||
              jsonData.error.includes('storage')) {
            console.log('\n💡 这仍然是S3连接问题！');
            console.log('可能的原因:');
            console.log('1. S3凭据仍然无效');
            console.log('2. 存储桶权限问题');
            console.log('3. 网络连接问题');
          }
        }
      }
    } catch (e) {
      console.log('响应数据:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ 连接错误:', error.message);
  console.log('可能的原因:');
  console.log('1. 服务器未运行');
  console.log('2. 网络连接问题');
  console.log('3. 防火墙阻止');
});

req.on('timeout', () => {
  console.log('❌ 请求超时');
  req.destroy();
});

req.end();