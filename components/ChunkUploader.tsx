'use client'

import React, { useState, useRef } from 'react';
import {
  initiateMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
} from '../services/storageService';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  message?: string;
}

const ChunkUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setUploads(
      selectedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending',
      }))
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const results = [...uploads];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      results[i].status = 'uploading';
      results[i].message = 'Initializing...';
      setUploads([...results]);

      try {
        // 初始化分片上传
        const { uploadId, key } = await initiateMultipartUpload(file.name, file.type);

        const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
        const parts = [];

        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          // 读取分片为ArrayBuffer
          const arrayBuffer = await chunk.arrayBuffer();

          results[i].message = `Uploading chunk ${chunkIndex + 1}/${chunkCount}`;
          results[i].progress = Math.round((chunkIndex / chunkCount) * 100);
          setUploads([...results]);

          // 上传分片
          const { ETag, PartNumber } = await uploadPart(uploadId, key, chunkIndex + 1, arrayBuffer);
          parts.push({ ETag, PartNumber });
        }

        // 完成上传
        await completeMultipartUpload(uploadId, key, parts);

        results[i].status = 'completed';
        results[i].progress = 100;
        results[i].message = 'Upload completed';
      } catch (error) {
        console.error('Upload failed:', error);
        results[i].status = 'error';
        results[i].message = error instanceof Error ? error.message : 'Upload failed';
      } finally {
        setUploads([...results]);
      }
    }

    setIsUploading(false);
  };

  const handleCancel = () => {
    // 取消所有上传（简化实现）
    setFiles([]);
    setUploads([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">分片上传</h2>
      
      <div className="space-y-6">
        {/* 文件选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            选择文件（支持大文件分片上传）
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 disabled:opacity-50"
          />
          <p className="mt-2 text-sm text-gray-500">
            支持大文件上传，自动分片（每片{CHUNK_SIZE / 1024 / 1024}MB）
          </p>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-white mb-3">已选择文件 ({files.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="ml-4">
                    {uploads[index]?.status === 'pending' && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-700 text-gray-300">
                        等待上传
                      </span>
                    )}
                    {uploads[index]?.status === 'uploading' && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-900 text-blue-300">
                        上传中
                      </span>
                    )}
                    {uploads[index]?.status === 'completed' && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-900 text-green-300">
                        已完成
                      </span>
                    )}
                    {uploads[index]?.status === 'error' && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-900 text-red-300">
                        错误
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 进度条 */}
        {uploads.some(u => u.status === 'uploading') && (
          <div className="space-y-4">
            {uploads.map((upload, index) => (
              upload.status === 'uploading' && (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 truncate">{upload.file.name}</span>
                    <span className="text-gray-400">{upload.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    ></div>
                  </div>
                  {upload.message && (
                    <p className="text-xs text-gray-500">{upload.message}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isUploading ? '上传中...' : '开始上传'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            取消
          </button>
        </div>

        {/* 移动端优化提示 */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-300">移动端优化</h4>
              <p className="mt-1 text-sm text-blue-400/80">
                本上传组件已针对移动设备优化，支持触摸操作和响应式布局。建议在Wi-Fi环境下上传大文件。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChunkUploader;
