import React, { useState, useEffect } from 'react';
import MediaService, { MediaFile } from '../services/MediaService';
import MediaPreviewModal from './MediaPreviewModal';

interface MediaGalleryProps {
  searchTerm?: string;
  fileTypeFilter?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  searchTerm = '', 
  fileTypeFilter = '' 
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const allFiles = await MediaService.listFiles();
        
        // 应用搜索和过滤
        let filteredFiles = allFiles;
        if (searchTerm) {
          filteredFiles = filteredFiles.filter(file => 
            file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (fileTypeFilter && fileTypeFilter !== 'all') {
          filteredFiles = filteredFiles.filter(file => file.type === fileTypeFilter);
        }
        
        setFiles(filteredFiles);
      } catch (err) {
        console.error('Load files error:', err);
        setError('加载文件列表失败: ' + (err instanceof Error ? err.message : '未知错误'));
      } finally {
        setLoading(false);
      }
    };
    
    loadFiles();
  }, [searchTerm, fileTypeFilter]);

  const handleDelete = async (key: string) => {
    try {
      await MediaService.deleteFile(key);
      setFiles(files.filter(file => file.key !== key));
    } catch (err) {
      console.error('Delete file error:', err);
      alert('删除文件失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleOpenPreview = async (file: MediaFile) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <div className="bg-blue-100 rounded-full p-3">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        );
      case 'video':
        return (
          <div className="bg-purple-100 rounded-full p-3">
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
        );
      case 'audio':
        return (
          <div className="bg-green-100 rounded-full p-3">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-full p-3">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
        );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {files.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到文件</h3>
          <p className="mt-1 text-sm text-gray-500">上传一些文件开始吧。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => (
            <div 
              key={file.key} 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div 
                className="cursor-pointer p-4 flex flex-col items-center"
                onClick={() => handleOpenPreview(file)}
              >
                {getFileIcon(file.type)}
                
                <div className="mt-3 text-center">
                  <h4 className="text-sm font-medium text-gray-900 truncate max-w-full" title={file.fileName}>
                    {file.fileName}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{file.type}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPreview(file);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  预览
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.key);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <MediaPreviewModal 
          file={selectedFile} 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default MediaGallery;