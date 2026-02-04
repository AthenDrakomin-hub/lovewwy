import React, { useState, useEffect, useRef } from 'react';
import { listBucketContents } from '../services/storageService';
import { FilePreview } from './FilePreview';
import { BatchOperations } from './BatchOperations';
import { getAccessToken } from '../src/lib/supabaseClient';

type Props = {
  adminPassword?: string;
  edgeBaseUrl?: string;
  defaultBucket?: string;
};

const S3Admin: React.FC<Props> = ({
  adminPassword,
  edgeBaseUrl = '',
  defaultBucket = process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET || 'wangyiyun',
}) => {
  const [prefix, setPrefix] = useState('music/');
  const [limit, setLimit] = useState(100);
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploadKey, setUploadKey] = useState('');
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [showBatchOps, setShowBatchOps] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Search filters
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'large' | ''>('');
  const [minSize, setMinSize] = useState<string>('');
  const [maxSize, setMaxSize] = useState<string>('');

  // Pagination for search
  const [offset, setOffset] = useState<number>(0);
  const [total, setTotal] = useState<number | null>(null);
  const isSearching = Boolean(searchTerm || searchDate || sizeFilter || minSize || maxSize);

  // 使用环境变量或 props 提供的 Edge Function URL
  const FUNCTIONS_URL =
    edgeBaseUrl ||
    (process.env.NEXT_PUBLIC_FUNCTIONS_URL as string) ||
    '';

  // ✅ 核心：带认证的 fetch 函数
  const authFetch = async (path: string, opts: RequestInit = {}) => {
    // 检查管理员密码
    if (!adminPassword) throw new Error('Admin password required');

    // 获取用户 token
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated - no token available');

    // ✅ 构建请求 headers
    const headers: Record<string, string> = {
      ...(opts.headers as Record<string, string>) || {},
      Authorization: `Bearer ${token}`,           // ✅ 用户认证
      'x-admin-password': adminPassword,          // ✅ 管理员认证
    };

    // 设置 Content-Type（仅当需要时）
    if (
      !(opts.body instanceof FormData) &&
      !(opts.body instanceof Blob) &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] = 'application/json';
    }

    // 发送请求
    const url = `${FUNCTIONS_URL}${path}`;
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res;
  };

  useEffect(() => {
    if (!adminPassword) {
      setStatus('请先通过管理员登录（输入管理员密码）以使用此界面');
    }
  }, [adminPassword]);



  const listObjects = async () => {
    try {
      setStatus('Loading...');
      const files = await listBucketContents(defaultBucket, prefix);
      setItems(files);
      setStatus(`Loaded ${files.length} items`);
    } catch (err: any) {
      setStatus(err.message || 'Error listing objects');
    }
  };

  const searchObjects = async (offsetParam: number = offset) => {
    try {
      setStatus('Searching...');
      const parts: string[] = [
        `bucket=${encodeURIComponent(defaultBucket)}`,
      ];
      if (prefix) parts.push(`prefix=${encodeURIComponent(prefix)}`);
      if (searchTerm) parts.push(`q=${encodeURIComponent(searchTerm)}`);
      if (searchDate) parts.push(`date=${encodeURIComponent(searchDate)}`);
      if (sizeFilter) parts.push(`size=${encodeURIComponent(sizeFilter)}`);
      if (minSize) parts.push(`min_size=${encodeURIComponent(minSize)}`);
      if (maxSize) parts.push(`max_size=${encodeURIComponent(maxSize)}`);
      if (limit) parts.push(`limit=${encodeURIComponent(String(limit))}`);
      if (offsetParam) parts.push(`offset=${encodeURIComponent(String(offsetParam))}`);
      const qs = `?${parts.join('&')}`;
      const res = await authFetch(`/search${qs}`, { method: 'GET' });
      const data = await res.json();
      setItems(data.items || []);
      setTotal(typeof data.total === 'number' ? data.total : (data.items || []).length);
      setOffset(offsetParam);
      setStatus(`Search results: ${data.total ?? (data.items || []).length}`);
    } catch (err: any) {
      setStatus(err.message || 'Error searching');
    }
  }; 

  const download = async (key: string) => {
    try {
      setStatus('Downloading...');
      const res = await authFetch(
        `/get?key=${encodeURIComponent(key)}`,
        { method: 'GET' }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.split('/').pop() || key;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('Downloaded');
    } catch (err: any) {
      setStatus(err.message || 'Error downloading');
    }
  };

  const remove = async (key: string) => {
    if (!confirm(`Delete ${key}?`)) return;
    try {
      setStatus('Deleting...');
      await authFetch(`/delete?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      setStatus('Deleted');
      await listObjects();
    } catch (err: any) {
      setStatus(err.message || 'Error deleting');
    }
  };

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    const key = uploadKey || file?.name;
    if (!file || !key) {
      setStatus('Choose file and set key');
      return;
    }
    try {
      setStatus('Uploading...');
      await authFetch(`/put?key=${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: file,
      });
      setStatus('Uploaded');
      await listObjects();
    } catch (err: any) {
      setStatus(err.message || 'Error uploading');
    }
  };

  // 当 adminPassword 改变时重新加载对象列表
  useEffect(() => {
    if (adminPassword) {
      listObjects().catch((e) => setStatus(e.message || 'List error'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPassword]);

  if (!adminPassword) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 pt-12 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">S3 Storage Admin</h1>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6 text-yellow-200">
            请先通过管理员登录（输入管理员密码）以使用此界面。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pt-12 px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">S3 Storage Admin</h1>

        {/* List objects & Search controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">List / Search Objects</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Prefix (e.g. music/)"
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 flex-grow"
            />
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              placeholder="Limit"
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-32"
            />
            <button
              onClick={listObjects}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition"
            >
              List Objects
            </button>
            <button
              onClick={() => setShowBatchOps(true)}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white font-semibold transition"
              title="批量上传或删除文件"
            >
              📦 Batch Ops
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
              placeholder="Search (name contains)"
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 flex-grow"
              title="按文件名模糊搜索"
            />

            <input
              type="date"
              value={searchDate}
              onChange={(e) => { setSearchDate(e.target.value); setOffset(0); }}
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-44"
              title="按更新日期过滤"
            />

            <select
              value={sizeFilter}
              onChange={(e) => { setSizeFilter(e.target.value as any); setOffset(0); }}
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-36"
              title="按大小分类筛选"
            >
              <option value="">Size</option>
              <option value="small">Small (&lt;10MB)</option>
              <option value="large">Large (&gt;100MB)</option>
            </select>

            <input
              type="number"
              value={minSize}
              onChange={(e) => { setMinSize(e.target.value); setOffset(0); }}
              placeholder="min size (bytes)"
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-40"
              title="最小文件大小 (字节)"
            />

            <input
              type="number"
              value={maxSize}
              onChange={(e) => { setMaxSize(e.target.value); setOffset(0); }}
              placeholder="max size (bytes)"
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-40"
              title="最大文件大小 (字节)"
            />

            <button
              onClick={() => searchObjects(0)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
            >
              Search
            </button>
            <button
              onClick={() => { setSearchTerm(''); setSearchDate(''); setSizeFilter(''); setMinSize(''); setMaxSize(''); setOffset(0); setTotal(null); listObjects(); }}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-semibold transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Search pagination & stats */}
        {isSearching && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              Showing {items.length === 0 ? 0 : offset + 1} - {Math.min(offset + items.length, total ?? offset + items.length)} of {total ?? (items.length || 0)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => searchObjects(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                title="Previous page"
              >
                ◀ Prev
              </button>
              <button
                onClick={() => searchObjects(offset + limit)}
                disabled={total !== null && offset + limit >= (total || 0)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                title="Next page"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}

        {/* Upload controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">Upload File</h2>
          <div className="flex flex-wrap gap-4">
            <input
              type="file"
              ref={fileRef}
              title="Select file to upload"
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <input
              type="text"
              value={uploadKey}
              onChange={(e) => setUploadKey(e.target.value)}
              placeholder="Upload key (e.g. music/song.mp3)"
              className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 flex-grow"
            />
            <button
              onClick={upload}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold transition"
            >
              Upload
            </button>
          </div>
        </div>

        {/* Status message */}
        {status && (
          <div
            className={`mb-6 p-4 rounded ${
              status.toLowerCase().includes('error')
                ? 'bg-red-900/30 text-red-200 border border-red-700'
                : 'bg-green-900/30 text-green-200 border border-green-700'
            }`}
          >
            {status}
          </div>
        )}

        {/* Objects list */}
        <div className="bg-gray-900 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-700">
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => {
                const key = item.name || item.key || item.path || 'unknown';
                const size = item.size || item.bytes || 0;
                const mod =
                  item.updated_at ||
                  item.last_modified ||
                  item.updated ||
                  '';
                const isSelected = selectedFiles.has(key);
                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 bg-gray-800 rounded border transition ${
                      isSelected
                        ? 'border-orange-500 bg-gray-700'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelected = new Set(selectedFiles);
                          if (e.target.checked) {
                            newSelected.add(key);
                          } else {
                            newSelected.delete(key);
                          }
                          setSelectedFiles(newSelected);
                        }}
                        title={`选择 ${key}`}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-medium text-white truncate break-all">
                          {key}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                          {mod ? ` • ${new Date(mod).toLocaleString()}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => setPreviewFile(item)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm font-semibold transition"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => download(key)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm font-semibold transition"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => remove(key)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-semibold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No objects found
            </div>
          )}
        </div>

        {/* File Preview Modal */}
        {previewFile && (
          <FilePreview
            file={previewFile}
            bucket={defaultBucket}
            prefix={prefix}
            adminPassword={adminPassword}
            edgeBaseUrl={FUNCTIONS_URL}
            onClose={() => setPreviewFile(null)}
          />
        )}

        {/* Batch Operations Modal */}
        {showBatchOps && (
          <BatchOperations
            bucket={defaultBucket}
            adminPassword={adminPassword || ''}
            edgeBaseUrl={FUNCTIONS_URL}
            onComplete={() => {
              setShowBatchOps(false);
              setSelectedFiles(new Set());
              listObjects().catch((e) => setStatus(e.message || 'List error'));
            }}
            onCancel={() => {
              setShowBatchOps(false);
              setSelectedFiles(new Set());
            }}
          />
        )}
      </div>
    </div>
  );
};

export default S3Admin;