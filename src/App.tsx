import React, { useState } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import MediaUploader from './components/MediaUploader';
import MediaGallery from './components/MediaGallery';
import { MediaFile } from './services/MediaService';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

  const handleUploadComplete = (file: MediaFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">媒体管理器</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Supabase S3 兼容</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls Section */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">上传媒体文件</h2>
                <MediaUploader onUploadComplete={handleUploadComplete} />
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">筛选选项</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      搜索文件
                    </label>
                    <input
                      type="text"
                      id="search"
                      placeholder="输入文件名..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                      文件类型
                    </label>
                    <select
                      id="filter"
                      value={fileTypeFilter}
                      onChange={(e) => setFileTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部</option>
                      <option value="image">图片</option>
                      <option value="video">视频</option>
                      <option value="audio">音频</option>
                      <option value="document">文档</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">媒体库</h2>
              <div className="text-sm text-gray-500">
                {uploadedFiles.length > 0 && (
                  <span>{uploadedFiles.length} 个文件已上传</span>
                )}
              </div>
            </div>
            
            <MediaGallery 
              searchTerm={searchTerm} 
              fileTypeFilter={fileTypeFilter} 
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Supabase S3 媒体管理器 &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </NotificationProvider>
  );
};

export default App;