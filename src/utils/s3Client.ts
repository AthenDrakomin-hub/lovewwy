import { S3Client } from '@aws-sdk/client-s3';

// 从环境变量获取配置
const endpoint = process.env.REACT_APP_SUPABASE_S3_ENDPOINT || '';
const region = process.env.REACT_APP_SUPABASE_S3_REGION || '';
const accessKeyId = process.env.REACT_APP_SUPABASE_S3_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.REACT_APP_SUPABASE_S3_SECRET_ACCESS_KEY || '';

// 创建 S3 客户端实例
export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // 必需：Supabase 使用路径样式端点
});

export default s3Client;