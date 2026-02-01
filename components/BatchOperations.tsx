import React, { useState } from 'react';
import { getAccessToken } from '../src/lib/supabaseClient';

interface BatchItem {
  path: string;
  contentType?: string;
  file?: File;
}

interface BatchResult {
  path: string;
  success: boolean;
  signedUrl?: string;
  error?: string;
}

interface BatchOperationsProps {
  bucket: string;
  adminPassword: string;
  edgeBaseUrl: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const BatchOperations: React.FC<BatchOperationsProps> = ({
  bucket,
  adminPassword,
  edgeBaseUrl,
  onComplete,
  onCancel,
}) => {
  const [operationType, setOperationType] = useState<'upload' | 'delete'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<BatchResult[]>([]);
  const [status, setStatus] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
    setStatus(`已选择 ${files.length} 个文件`);
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) {
      setStatus('请先选择要删除的文件');
      return;
    }

    if (!confirm(`确定要删除 ${selectedFiles.size} 个文件吗？此操作不可撤销！`)) {
      return;
    }

    try {
      setIsProcessing(true);
      setProgress({ current: 0, total: selectedFiles.size });
      setResults([]);

      const token = await getAccessToken();
      if (!token) throw new Error('未获取到访问令牌');

      const paths = Array.from(selectedFiles);
      const batchResults: BatchResult[] = [];

      // 使用 s3-batch Edge Function 进行批量删除
      const response = await fetch(`${edgeBaseUrl}s3-batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-password': adminPassword,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          bucket,
          items: paths.map((path) => ({ path })),
        }),
      });

      if (!response.ok) {
        throw new Error(`批量删除失败: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // 处理返回的结果
      if (data.results) {
        data.results.forEach((result: any) => {
          batchResults.push({
            path: result.path,
            success: !result.error,
            error: result.error,
          });
        });
      }

      setResults(batchResults);
      setProgress({ current: selectedFiles.size, total: selectedFiles.size });
      setStatus(`批量删除完成: ${batchResults.filter(r => r.success).length}/${batchResults.length} 成功`);
      setSelectedFiles(new Set());
    } catch (err) {
      setStatus(`错误: ${err instanceof Error ? err.message : '批量删除失败'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchUpload = async () => {
    if (uploadFiles.length === 0) {
      setStatus('请先选择要上传的文件');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress({ current: 0, total: uploadFiles.length });
      setResults([]);

      const token = await getAccessToken();
      if (!token) throw new Error('未获取到访问令牌');

      // 步骤1: 获取所有文件的预签名 URL（批量）
      const items = uploadFiles.map((file) => ({
        path: file.name,
        contentType: file.type,
      }));

      const signResponse = await fetch(`${edgeBaseUrl}s3-batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-password': adminPassword,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upload',
          bucket,
          items,
          expires_in: 3600,
        }),
      });

      if (!signResponse.ok) {
        throw new Error(`获取预签名 URL 失败: HTTP ${signResponse.status}`);
      }

      const signData = await signResponse.json();
      const signedItems = signData.signed || [];

      // 步骤2: 使用 Promise.all() 并行上传所有文件
      const uploadPromises = uploadFiles.map(async (file, index) => {
        try {
          const signedItem = signedItems[index];
          if (!signedItem?.signedUrl) {
            return {
              path: file.name,
              success: false,
              error: signedItem?.error || '无法获取预签名 URL',
            };
          }

          // 使用预签名 URL 上传文件
          const uploadResp = await fetch(signedItem.signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          });

          if (!uploadResp.ok) {
            return {
              path: file.name,
              success: false,
              error: `上传失败: HTTP ${uploadResp.status}`,
            };
          }

          return {
            path: file.name,
            success: true,
          };
        } catch (err) {
          return {
            path: file.name,
            success: false,
            error: err instanceof Error ? err.message : '上传出错',
          };
        }
      });

      // 等待所有上传完成
      const uploadResults = await Promise.all(uploadPromises);

      setResults(uploadResults as BatchResult[]);
      const successCount = uploadResults.filter(r => r.success).length;
      setProgress({ current: uploadFiles.length, total: uploadFiles.length });
      setStatus(`批量上传完成: ${successCount}/${uploadFiles.length} 成功`);
      setUploadFiles([]);
    } catch (err) {
      setStatus(`错误: ${err instanceof Error ? err.message : '批量上传失败'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">
            {operationType === 'upload' ? '批量上传' : '批量删除'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Operation Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setOperationType('upload');
              setSelectedFiles(new Set());
              setResults([]);
            }}
            disabled={isProcessing}
            className={`flex-1 py-3 font-semibold transition ${
              operationType === 'upload'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                : 'text-gray-700 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            📤 批量上传
          </button>
          <button
            onClick={() => {
              setOperationType('delete');
              setUploadFiles([]);
              setResults([]);
            }}
            disabled={isProcessing}
            className={`flex-1 py-3 font-semibold transition ${
              operationType === 'delete'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-700'
                : 'text-gray-700 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            🗑️ 批量删除
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {operationType === 'upload' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  选择文件（支持多选）
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                  title="选择要上传的文件（支持多选）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 disabled:opacity-50"
                />
              </div>

              {uploadFiles.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">
                    已选择 {uploadFiles.length} 个文件
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {uploadFiles.map((file, idx) => (
                      <p key={idx} className="text-sm text-gray-600 truncate">
                        {idx + 1}. {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ 请在下面的文件列表中勾选要删除的文件，然后点击"执行删除"按钮。
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && progress.total > 0 && (
            <div className="my-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  处理进度
                </span>
                <span className="text-sm text-gray-600">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <progress
                  value={progress.current}
                  max={progress.total || 1}
                  className={`w-full h-2 rounded ${
                    operationType === 'upload' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div
              className={`mb-4 p-3 rounded ${
                status.includes('错误')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : status.includes('完成')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {status}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">操作结果</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm ${
                      result.success
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">
                        {result.success ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium truncate">{result.path}</p>
                        {result.error && (
                          <p className="text-xs opacity-75">{result.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition disabled:opacity-50"
          >
            关闭
          </button>
          <button
            onClick={() => {
              if (operationType === 'upload') {
                handleBatchUpload();
              } else {
                handleBatchDelete();
              }
            }}
            disabled={isProcessing || (operationType === 'upload' ? uploadFiles.length === 0 : selectedFiles.size === 0)}
            className={`px-6 py-2 rounded-lg text-white font-semibold transition disabled:opacity-50 ${
              operationType === 'upload'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                处理中...
              </>
            ) : (
              <>
                {operationType === 'upload' ? '📤 开始上传' : '🗑️ 执行删除'}
                {operationType === 'upload' && uploadFiles.length > 0 && (
                  <span className="ml-2 text-sm">({uploadFiles.length})</span>
                )}
                {operationType === 'delete' && selectedFiles.size > 0 && (
                  <span className="ml-2 text-sm">({selectedFiles.size})</span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
