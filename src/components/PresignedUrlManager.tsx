import React, { useState } from 'react';
import MediaService, { MediaFile } from '../services/MediaService';

interface PresignedUrlManagerProps {
  file: MediaFile;
}

const PresignedUrlManager: React.FC<PresignedUrlManagerProps> = ({ file }) => {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number>(3600); // 默认1小时
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePresignedUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      setCopied(false);
      
      const url = await MediaService.getPresignedUrl(file.key, expiresIn);
      setPresignedUrl(url);
    } catch (err) {
      console.error('Generate presigned URL error:', err);
      setError('生成预签名 URL 失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (presignedUrl) {
      navigator.clipboard.writeText(presignedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInNewTab = () => {
    if (presignedUrl) {
      window.open(presignedUrl, '_blank');
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">预签名 URL 管理</h4>
      
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <label htmlFor="expiresIn" className="text-sm text-gray-600">
          过期时间:
        </label>
        <select
          id="expiresIn"
          value={expiresIn}
          onChange={(e) => setExpiresIn(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value={900}>15 分钟</option>
          <option value={1800}>30 分钟</option>
          <option value={3600}>1 小时</option>
          <option value={7200}>2 小时</option>
          <option value={21600}>6 小时</option>
          <option value={43200}>12 小时</option>
          <option value={86400}>24 小时</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={generatePresignedUrl}
          disabled={loading}
          className={`px-3 py-2 rounded text-sm font-medium ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '生成中...' : '生成预签名 URL'}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {presignedUrl && (
        <div className="mt-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={presignedUrl}
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm truncate"
            />
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
              >
                {copied ? '已复制!' : '复制'}
              </button>
              <button
                onClick={openInNewTab}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                在新标签页打开
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            此链接将在{' '}
            {new Date(Date.now() + expiresIn * 1000).toLocaleString('zh-CN')}{' '}
            过期
          </p>
        </div>
      )}
    </div>
  );
};

export default PresignedUrlManager;