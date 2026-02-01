import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../src/lib/supabaseClient';

interface S3Object {
  name: string;
  size: number;
  updated_at: string;
}

interface FilePreviewProps {
  file: S3Object;
  bucket: string;
  prefix: string;
  adminPassword: string;
  edgeBaseUrl: string;
  onClose: () => void;
}

type PreviewType = 'image' | 'audio' | 'video' | 'text' | 'none';

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  bucket,
  prefix,
  adminPassword,
  edgeBaseUrl,
  onClose,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getAccessToken();
        if (!token) {
          setError('未获取到访问令牌');
          return;
        }

        // 调用 s3-preview-url Edge Function
        const response = await fetch(`${edgeBaseUrl}s3-preview-url`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-admin-password': adminPassword,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bucket,
            path: `${prefix}${file.name}`,
            expires_in: 3600, // 1小时有效期
            thumbnail: true,
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('文件不存在');
          } else {
            setError(`请求失败: HTTP ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        setUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取预览 URL 失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewUrl();
  }, [file, bucket, prefix, adminPassword, edgeBaseUrl]);

  const getPreviewType = (fileName: string): PreviewType => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || ''))
      return 'image';
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext || ''))
      return 'audio';
    if (['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv'].includes(ext || ''))
      return 'video';
    if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(ext || ''))
      return 'text';

    return 'none';
  };

  const previewType = getPreviewType(file.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold truncate">{file.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">{error}</div>
            </div>
          ) : !url ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">无法生成预览</div>
            </div>
          ) : previewType === 'image' ? (
            <div className="flex items-center justify-center">
              <img
                src={url}
                alt={file.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : previewType === 'audio' ? (
            <div className="flex items-center justify-center">
              <audio
                controls
                src={url}
                className="w-full"
                controlsList="nodownload"
              />
            </div>
          ) : previewType === 'video' ? (
            <div className="flex items-center justify-center">
              <video
                controls
                src={url}
                className="max-w-full max-h-full"
                controlsList="nodownload"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  此文件类型不支持预览
                </p>
                <a
                  href={url}
                  download={file.name}
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  点击下载
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 text-sm text-gray-600 space-y-1">
          <p>大小: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <p>修改时间: {new Date(file.updated_at).toLocaleString('zh-CN')}</p>
        </div>
      </div>
    </div>
  );
};
