import React, { useState } from 'react';
import { testS3Connection, listFiles } from '../lib/s3';

const TestS3Connection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; fileCount?: number; error?: string } | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [bucketName, setBucketName] = useState('');

  const handleTestConnection = async () => {
    setLoading(true);
    setResult(null);
    setFiles([]);
    
    try {
      // 首先测试连接
      const testResult = await testS3Connection();
      setResult(testResult);
      
      // 如果连接成功，列出文件
      if (testResult.success) {
        const fileList = await listFiles();
        setFiles(fileList);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">S3连接测试</h1>
      
      <div className="mb-6 p-4 bg-gray-900 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">当前配置</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">端点: </span>
            <code className="bg-gray-800 px-2 py-1 rounded">
              {(import.meta as any).env.VITE_S3_ENDPOINT || 'https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3'}
            </code>
          </div>
          <div>
            <span className="text-gray-400">区域: </span>
            <code className="bg-gray-800 px-2 py-1 rounded">
              {(import.meta as any).env.VITE_S3_REGION || 'ap-south-1'}
            </code>
          </div>
          <div>
            <span className="text-gray-400">Access Key ID: </span>
            <code className="bg-gray-800 px-2 py-1 rounded">
              {(import.meta as any).env.VITE_S3_ACCESS_KEY_ID ? '***' + (import.meta as any).env.VITE_S3_ACCESS_KEY_ID.slice(-4) : '已配置'}
            </code>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          存储桶名称 (Bucket Name)
        </label>
        <input
          type="text"
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          placeholder="输入存储桶名称"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <p className="mt-2 text-sm text-gray-400">
          注意：需要在lib/s3.ts中更新BUCKET_NAME常量
        </p>
      </div>

      <button
        onClick={handleTestConnection}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '测试中...' : '测试S3连接'}
      </button>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
          <h3 className="text-lg font-semibold mb-2">
            {result.success ? '✅ 连接成功' : '❌ 连接失败'}
          </h3>
          {result.success ? (
            <p>找到 {result.fileCount} 个文件</p>
          ) : (
            <p>错误: {result.error}</p>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">存储桶中的文件</h3>
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">文件名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">大小</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">最后修改</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {files.map((file) => (
                  <tr key={file.Key} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-mono">{file.Key}</td>
                    <td className="px-4 py-3 text-sm">
                      {file.Size ? `${(file.Size / 1024).toFixed(2)} KB` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {file.LastModified ? new Date(file.LastModified).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>在lib/s3.ts中更新BUCKET_NAME常量为您的存储桶名称</li>
          <li>确保存储桶存在且配置正确</li>
          <li>点击"测试S3连接"按钮验证连接</li>
          <li>如果连接成功，可以查看存储桶中的文件列表</li>
        </ol>
      </div>
    </div>
  );
};

export default TestS3Connection;