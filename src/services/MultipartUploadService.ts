import { 
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from '@aws-sdk/client-s3';
import { s3Client } from '../utils/s3Client';

const BUCKET_NAME = process.env.REACT_APP_SUPABASE_S3_BUCKET || 'media';
const PART_SIZE = 5 * 1024 * 1024; // 5MB per part

interface PartInfo {
  PartNumber: number;
  ETag: string;
}

interface MultipartUploadInfo {
  uploadId: string;
  key: string;
  parts: PartInfo[];
}

class MultipartUploadService {
  private activeUploads: Map<string, MultipartUploadInfo> = new Map();

  /**
   * 开始分片上传
   */
  async startMultipartUpload(key: string, file: File): Promise<string> {
    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadTime: new Date().toISOString(),
        }
      });

      const response = await s3Client.send(command);
      const uploadId = response.UploadId;

      if (!uploadId) {
        throw new Error('Failed to start multipart upload');
      }

      const uploadInfo: MultipartUploadInfo = {
        uploadId,
        key,
        parts: []
      };

      this.activeUploads.set(uploadId, uploadInfo);
      return uploadId;
    } catch (error) {
      console.error('Start multipart upload error:', error);
      throw error;
    }
  }

  /**
   * 上传单个分片
   */
  async uploadPart(uploadId: string, partNumber: number, file: File, start: number, end: number): Promise<string> {
    try {
      const uploadInfo = this.activeUploads.get(uploadId);
      if (!uploadInfo) {
        throw new Error(`Upload with ID ${uploadId} not found`);
      }

      // 获取文件片段
      const chunk = file.slice(start, end);
      
      const command = new UploadPartCommand({
        Bucket: BUCKET_NAME,
        Key: uploadInfo.key,
        PartNumber: partNumber,
        UploadId: uploadId,
        Body: chunk,
      });

      const response = await s3Client.send(command);
      
      if (!response.ETag) {
        throw new Error(`Failed to upload part ${partNumber}`);
      }

      // 保存分片信息
      const partInfo: PartInfo = {
        PartNumber: partNumber,
        ETag: response.ETag
      };

      uploadInfo.parts.push(partInfo);
      this.activeUploads.set(uploadId, uploadInfo);

      return response.ETag;
    } catch (error) {
      console.error(`Upload part ${partNumber} error:`, error);
      throw error;
    }
  }

  /**
   * 完成分片上传
   */
  async completeMultipartUpload(uploadId: string): Promise<void> {
    try {
      const uploadInfo = this.activeUploads.get(uploadId);
      if (!uploadInfo) {
        throw new Error(`Upload with ID ${uploadId} not found`);
      }

      // Sort parts by PartNumber to ensure correct order
      const sortedParts = uploadInfo.parts.sort((a, b) => a.PartNumber - b.PartNumber);

      const command = new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: uploadInfo.key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: sortedParts
        }
      });

      await s3Client.send(command);
      
      // Remove from active uploads
      this.activeUploads.delete(uploadId);
    } catch (error) {
      console.error('Complete multipart upload error:', error);
      throw error;
    }
  }

  /**
   * 取消分片上传
   */
  async abortMultipartUpload(uploadId: string): Promise<void> {
    try {
      const uploadInfo = this.activeUploads.get(uploadId);
      if (!uploadInfo) {
        throw new Error(`Upload with ID ${uploadId} not found`);
      }

      const command = new AbortMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: uploadInfo.key,
        UploadId: uploadId
      });

      await s3Client.send(command);
      
      // Remove from active uploads
      this.activeUploads.delete(uploadId);
    } catch (error) {
      console.error('Abort multipart upload error:', error);
      throw error;
    }
  }

  /**
   * 上传大文件（自动使用分片上传）
   */
  async uploadLargeFile(file: File, key?: string, onProgress?: (progress: number) => void): Promise<string> {
    const fileKey = key || `${Date.now()}-${file.name}`;
    const uploadId = await this.startMultipartUpload(fileKey, file);

    try {
      const fileSize = file.size;
      const numParts = Math.ceil(fileSize / PART_SIZE);
      let completedParts = 0;

      // 创建一个共享的进度更新函数
      const updateProgress = () => {
        if (onProgress) {
          const progress = Math.round((completedParts / numParts) * 100);
          onProgress(progress);
        }
      };

      // 上传所有分片
      const uploadPromises = [];
      for (let partNumber = 1; partNumber <= numParts; partNumber++) {
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(partNumber * PART_SIZE, fileSize);

        // 创建一个 promise，该 promise 在分片上传完成后更新进度
        const partPromise = this.uploadPart(uploadId, partNumber, file, start, end)
          .then((etag) => {
            completedParts++;
            updateProgress();
            return etag;
          })
          .catch((error) => {
            console.error(`Error uploading part ${partNumber}:`, error);
            throw error;
          });

        uploadPromises.push(partPromise);
      }

      // 等待所有分片上传完成
      await Promise.all(uploadPromises);

      // 完成分片上传
      await this.completeMultipartUpload(uploadId);

      return fileKey;
    } catch (error) {
      // 如果上传失败，取消分片上传
      await this.abortMultipartUpload(uploadId);
      throw error;
    }
  }

  /**
   * 检查文件是否需要分片上传
   */
  needsMultipartUpload(file: File): boolean {
    return file.size > PART_SIZE;
  }

  /**
   * 获取分片大小（字节）
   */
  getPartSize(): number {
    return PART_SIZE;
  }

  /**
   * 获取活跃的上传信息
   */
  getActiveUploads(): Map<string, MultipartUploadInfo> {
    return this.activeUploads;
  }
}

const multipartUploadService = new MultipartUploadService();
export default multipartUploadService;