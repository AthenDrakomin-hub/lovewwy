import React, { useState, useRef, ChangeEvent } from 'react';
import MediaService from '../services/MediaService';
import { MediaFile } from '../services/MediaService';
import { useNotification } from '../contexts/NotificationContext';

interface MediaUploaderProps {
  onUploadComplete?: (file: MediaFile) => void;
  allowedTypes?: string[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onUploadComplete, 
  allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'] 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 验证文件类型
    if (!allowedTypes.some(type => 
      (type === 'image/*' && file.type.startsWith('image/')) ||
      (type === 'video/*' && file.type.startsWith('video/')) ||
      (type === 'audio/*' && file.type.startsWith('audio/')) ||
      file.type === type ||
      file.name.toLowerCase().endsWith(type.replace('.', ''))
    )) {
      const errorMsg = `不支持的文件类型: ${file.type}. 只允许: ${allowedTypes.join(', ')}`;
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // 上传文件，传递进度回调
      const key = await MediaService.uploadFile(file, undefined, (progress) => {
        setUploadProgress(progress);
      });
      
      // 获取文件信息
      const fileInfo = await MediaService.getFileInfo(key);
      
      if (fileInfo) {
        const successMsg = `${file.name} 上传成功!`;
        setSuccess(successMsg);
        showNotification(successMsg, 'success');
        
        if (onUploadComplete) {
          onUploadComplete(fileInfo);
        }
        
        // 重置状态
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = '上传失败: ' + (err instanceof Error ? err.message : '未知错误');
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isUploading 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={allowedTypes.join(',')}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center">
          <svg 
            className="w-12 h-12 text-gray-400 mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          
          <p className="text-lg font-medium text-gray-700">
            {isUploading ? '正在上传...' : '点击选择文件或拖拽到此处'}
          </p>
          
          <p className="text-sm text-gray-500 mt-1">
            支持图片、视频、音频和文档
          </p>
          
          {isUploading && (
            <div className="w-full max-w-xs mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && !isUploading && (
        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;