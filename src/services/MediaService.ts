import { 
  PutObjectCommand, 
  GetObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../utils/s3Client';

const BUCKET_NAME = process.env.REACT_APP_SUPABASE_S3_BUCKET || 'media';

export interface MediaFile {
  key: string;
  fileName: string;
  size: number;
  type: string;
  lastModified?: Date;
  url?: string;
}

class MediaService {
  /**
   * 上传文件到 S3
   */
  async uploadFile(file: File, key?: string): Promise<string> {
    try {
      const fileKey = key || `${Date.now()}-${file.name}`;
      
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: file,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadTime: new Date().toISOString(),
        }
      });

      await s3Client.send(putCommand);
      return fileKey;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * 获取存储桶中的所有文件
   */
  async listFiles(prefix: string = ''): Promise<MediaFile[]> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
      });

      const response = await s3Client.send(listCommand);
      
      if (!response.Contents) {
        return [];
      }

      const files: MediaFile[] = response.Contents.map((obj) => ({
        key: obj.Key || '',
        fileName: obj.Key?.split('/').pop() || '',
        size: obj.Size || 0,
        type: this.getFileType(obj.Key || ''),
        lastModified: obj.LastModified,
      }));

      return files;
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  /**
   * 获取文件的预签名 URL
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, getCommand, { expiresIn });
      return url;
    } catch (error) {
      console.error('Get presigned URL error:', error);
      throw error;
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(key: string): Promise<MediaFile | null> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(headCommand);

      return {
        key,
        fileName: key.split('/').pop() || '',
        size: response.ContentLength || 0,
        type: response.ContentType || '',
        lastModified: response.LastModified,
      };
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }

  /**
   * 根据文件扩展名确定文件类型
   */
  private getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return 'unknown';

    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

    if (imageTypes.includes(ext)) return 'image';
    if (videoTypes.includes(ext)) return 'video';
    if (audioTypes.includes(ext)) return 'audio';

    return 'document';
  }
}

export default new MediaService();