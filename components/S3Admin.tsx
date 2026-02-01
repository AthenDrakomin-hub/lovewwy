import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

type Props = {
  supabase?: SupabaseClient;
  edgeBaseUrl?: string; // default '/functions/v1/list-files'
};

const S3Admin: React.FC<Props> = ({ supabase, edgeBaseUrl = '/functions/v1/list-files' }) => {
  const [prefix, setPrefix] = useState('music/');
  const [limit, setLimit] = useState(100);
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploadKey, setUploadKey] = useState('');

  const getToken = async () => {
    // 使用环境变量中的ANON KEY，或者获取会话token
    const token = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!token) throw new Error('Not authenticated - no token available');
    return token;
  };

  const authFetch = async (path: string, opts: RequestInit = {}) => {
    const token = await getToken();
    opts.headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` } as HeadersInit;
    
    // 构建正确的API URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_AUTH_URL?.replace('/functions/v1/s3-auth', '');
    const apiUrl = `${supabaseUrl}${edgeBaseUrl}${path}`;
    
    const res = await fetch(apiUrl, opts);
    if (!res.ok) {
      const text = await res.text().catch(()=>res.statusText);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res;
  };

  const listObjects = async () => {
    try {
      setStatus('Loading...');
      const res = await authFetch(`?bucket=${encodeURIComponent(import.meta.env.VITE_SUPABASE_S3_BUCKET || 'wangyiyun')}&prefix=${encodeURIComponent(prefix)}&limit=${limit}`);
      const data = await res.json();
      
      let arr = [];
      if (Array.isArray(data)) arr = data;
      else if (data.items) arr = data.items;
      else if (data.objects) arr = data.objects;
      else arr = data.files || data;
      
      setItems(arr);
      setStatus('Loaded');
    } catch (err: any) {
      setStatus(err.message || 'Error');
    }
  };

  const download = async (key: string) => {
    try {
      setStatus('Downloading...');
      const res = await authFetch(`/get?key=${encodeURIComponent(key)}`);
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
      setStatus(err.message || 'Error');
    }
  };

  const remove = async (key: string) => {
    if (!confirm(`Delete ${key}?`)) return;
    try {
      setStatus('Deleting...');
      await authFetch(`/delete?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      setStatus('Deleted');
      listObjects();
    } catch (err: any) {
      setStatus(err.message || 'Error');
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
      await authFetch(`/put?key=${encodeURIComponent(key)}`, { method: 'PUT', body: file });
      setStatus('Uploaded');
      listObjects();
    } catch (err: any) {
      setStatus(err.message || 'Error');
    }
  };

  // Initial load
  useEffect(() => {
    listObjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">S3 Storage Admin</h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="Prefix (e.g. music/)"
            className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            placeholder="Limit"
            className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <button
            onClick={listObjects}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            List Objects
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="file"
            ref={fileRef}
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
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            Upload
          </button>
        </div>

        <div className="mb-4 text-white">
          {status && <span className={status.includes('Error') || status.includes('error') ? 'text-red-400' : 'text-green-400'}>{status}</span>}
        </div>

        <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item, index) => {
                const key = item.name || item.key || item.path || 'unknown';
                const size = item.size || item.bytes || '';
                const mod = item.updated_at || item.last_modified || item.updated || '';
                
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{key}</div>
                      <div className="text-sm text-gray-400">
                        {size && `${(size / 1024 / 1024).toFixed(2)} MB`} 
                        {mod && ` • ${new Date(mod).toLocaleString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => download(key)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => remove(key)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No objects found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default S3Admin;