/**
 * S3云存储相关数据结构
 * 基于AWS S3 SDK的响应格式定义
 */

export interface CloudFile {
  key: string; // 文件键（路径）
  name: string; // 文件名
  size: number; // 文件大小（字节）
  type: string; // 文件类型
  lastModified: Date; // 最后修改时间
  url: string; // 文件访问URL
  etag: string; // ETag
  metadata: Record<string, string>; // 元数据
  storageClass: string; // 存储类别
  versionId?: string; // 版本ID
}

export interface CloudFileUpload {
  key: string; // 上传键
  file: File; // 上传文件
  metadata?: Record<string, string>; // 元数据
  contentType?: string; // 内容类型
  storageClass?: string; // 存储类别
  progressCallback?: (progress: number) => void; // 进度回调
}

export interface CloudFileDownload {
  key: string; // 下载键
  filename?: string; // 保存文件名
  progressCallback?: (progress: number) => void; // 进度回调
}

export interface CloudFileListOptions {
  prefix?: string; // 前缀过滤
  delimiter?: string; // 分隔符
  maxKeys?: number; // 最大返回数量
  continuationToken?: string; // 续传令牌
}

export interface CloudFileListResponse {
  files: CloudFile[];
  isTruncated: boolean;
  nextContinuationToken?: string;
  commonPrefixes: string[];
}

export interface CloudFileMetadata {
  key: string;
  lastModified: Date;
  size: number;
  eTag: string;
  contentType: string;
  metadata: Record<string, string>;
}

export interface CloudStorageBucket {
  name: string;
  creationDate: Date;
  region: string;
  versioning: boolean;
  cors: boolean;
  encryption: boolean;
}

export interface CloudStorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  useSSL: boolean;
  pathStyle: boolean;
}

export interface CloudFileOperationResult {
  success: boolean;
  key: string;
  error?: string;
  data?: any;
}

export interface CloudFileUploadProgress {
  key: string;
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // 上传速度（字节/秒）
  eta: number; // 预计剩余时间（秒）
}

export interface CloudFileDownloadProgress {
  key: string;
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // 下载速度（字节/秒）
  eta: number; // 预计剩余时间（秒）
}

export interface CloudFilePresignedUrl {
  url: string;
  expiresAt: Date;
  method: 'GET' | 'PUT' | 'DELETE';
}

export interface CloudStorageUsage {
  totalSize: number; // 总使用空间（字节）
  fileCount: number; // 文件数量
  bucketCount: number; // 存储桶数量
  lastUpdated: Date;
}

export interface CloudStorageSettings {
  maxFileSize: number; // 最大文件大小（字节）
  allowedFileTypes: string[]; // 允许的文件类型
  autoCompress: boolean; // 自动压缩
  compressionQuality: number; // 压缩质量（0-1）
  cacheControl: string; // 缓存控制
  autoDeleteExpired: boolean; // 自动删除过期文件
  expirationDays: number; // 过期天数
}