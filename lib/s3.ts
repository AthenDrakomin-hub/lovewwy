import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';

// 从环境变量获取S3配置
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return '';
};

const endpoint = getEnv('S3_ENDPOINT') || 'https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3';
const region = getEnv('S3_REGION') || 'ap-south-1';
const accessKeyId = getEnv('S3_ACCESS_KEY_ID') || 'f38ef481de3083a75df0a4641914962a';
const secretAccessKey = getEnv('S3_SECRET_ACCESS_KEY') || '7d3bbaf345256cb64e9e377457018f8cdc4013aa6ec0d9a6d87e4d2e1003c91c';

// 创建S3客户端配置
export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Supabase Storage需要path style
});

// 存储桶名称（需要根据实际情况设置）
const BUCKET_NAME = 'wangyiyun'; // 用户提供的存储桶名称

/**
 * 列出存储桶中的文件
 */
export async function listFiles(prefix?: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });
    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

/**
 * 获取文件的公开URL（如果文件是公开的）
 * 支持S3兼容模式，包括Supabase Storage和其他S3兼容服务
 */
export function getPublicUrl(key: string) {
  try {
    // 如果key已经是完整URL，直接返回
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    
    // 检查是否为Supabase Storage端点
    if (endpoint.includes('supabase.co/storage/v1/s3')) {
      // Supabase Storage的公开URL格式
      return `${endpoint.replace('/storage/v1/s3', '')}/storage/v1/object/public/${BUCKET_NAME}/${key}`;
    }
    
    // 标准S3兼容服务URL格式（path style）
    // 格式: https://endpoint/bucket/key
    if (endpoint) {
      const url = new URL(endpoint);
      return `${url.protocol}//${url.host}/${BUCKET_NAME}/${key}`;
    }
    
    // 如果endpoint为空，返回原始key（可能是相对路径）
    return key;
  } catch (error) {
    console.error('Error generating public URL:', error);
    // 出错时返回原始key
    return key;
  }
}

/**
 * 获取文件的预签名URL（用于临时访问私有文件）
 */
export async function getSignedFileUrl(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

/**
 * 上传文件到存储桶
 */
export async function uploadFile(key: string, file: File | Buffer, contentType?: string) {
  try {
    const body = file instanceof File ? await file.arrayBuffer() : file;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
    });
    
    await s3Client.send(command);
    return getPublicUrl(key);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * 检查S3连接是否正常
 */
export async function testS3Connection() {
  try {
    const files = await listFiles();
    console.log('S3 connection successful. Found files:', files.length);
    return { success: true, fileCount: files.length };
  } catch (error) {
    console.error('S3 connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}