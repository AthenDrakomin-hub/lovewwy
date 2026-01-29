import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MediaService, { MediaFile } from '../services/MediaService';
import PresignedUrlManager from './PresignedUrlManager';
import AdvancedAudioPlayer from './AdvancedAudioPlayer';

interface MediaPreviewModalProps {
  file: MediaFile;
  isOpen: boolean;
  onClose: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ 
  file, 
  isOpen, 
  onClose 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPreview();
    } else {
      setPreviewUrl(null);
      setLoading(true);
      setError(null);
    }
  }, [isOpen, file]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取预签名 URL 用于安全预览
      const url = await MediaService.getPresignedUrl(file.key);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Load preview error:', err);
      setError('无法加载预览: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '未知时间';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 truncate max-w-xs" title={file.fileName}>
            {file.fileName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-4">
          {error ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">加载失败</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="flex justify-center">
                {file.type === 'image' && previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt={file.fileName} 
                    className="max-h-[60vh] max-w-full object-contain"
                    onError={() => setError('无法加载图像')}
                  />
                )}
                
                {file.type === 'video' && previewUrl && (
                  <video 
                    controls 
                    className="max-h-[60vh] max-w-full"
                    onError={() => setError('无法加载视频')}
                  >
                    <source src={previewUrl} type="video/mp4" />
                    您的浏览器不支持视频标签。
                  </video>
                )}
                
                {file.type === 'audio' && previewUrl && (
                  <div className="w-full max-w-3xl">
                    <AdvancedAudioPlayer 
                      url={previewUrl} 
                      title={file.fileName} 
                    />
                  </div>
                )}
                
                {(file.type === 'document' || !previewUrl) && (
                  <div className="bg-gray-100 rounded-lg p-8 text-center w-full">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">文档预览不可用</h3>
                    <p className="mt-1 text-sm text-gray-500">此文件类型不支持在线预览</p>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">文件类型</p>
                  <p className="font-medium capitalize">{file.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">文件大小</p>
                  <p className="font-medium">{formatFileSize(file.size)}</p>
                </div>
                <div>
                  <p className="text-gray-500">上传时间</p>
                  <p className="font-medium">{formatDate(file.lastModified)}</p>
                </div>
                <div>
                  <p className="text-gray-500">文件路径</p>
                  <p className="font-medium truncate" title={file.key}>{file.key}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              在新窗口打开
            </a>
          )}
          <PresignedUrlManager file={file} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MediaPreviewModal;