
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Music, MessageSquare, Video as VideoIcon, ChevronRight, Upload, X, Check, Edit, Save } from 'lucide-react';
import { MOCK_PRIVATE_PLAYLISTS, MOCK_PRIVATE_COMMENTS, MOCK_PRIVATE_VIDEOS } from '../constants';
import { uploadFile, getAllSongs } from '../lib/s3';
import { Song } from '../types';

const PrivateCollection: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  // 上传相关状态
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('未知');
  
  // 歌曲管理状态
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingArtist, setEditingArtist] = useState('');

  // 加载歌曲列表
  useEffect(() => {
    if (isAuthorized) {
      loadSongs();
    }
  }, [isAuthorized]);

  const loadSongs = async () => {
    try {
      const fetchedSongs = await getAllSongs();
      setSongs(fetchedSongs);
    } catch (error) {
      console.error('加载歌曲失败:', error);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2026') {
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
      // Shake effect or feedback
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('audio/') && !file.name.toLowerCase().endsWith('.mp3')) {
        setUploadError('请选择MP3音频文件');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);
      
      // 从文件名生成歌曲标题
      const fileName = file.name.replace('.mp3', '').replace(/_/g, ' ');
      if (!songTitle) {
        setSongTitle(fileName);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('请先选择文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // 生成文件key：music/文件名.mp3
      const fileName = selectedFile.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
      const key = `music/${fileName}`;
      
      // 保存中文标题到localStorage
      if (songTitle && songTitle.trim() !== '') {
        try {
          const titleMap = JSON.parse(localStorage.getItem('songTitleMap') || '{}');
          titleMap[fileName] = {
            title: songTitle.trim(),
            artist: artist.trim() !== '' ? artist.trim() : '未知',
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('songTitleMap', JSON.stringify(titleMap));
          console.log('中文标题已保存到localStorage:', fileName, songTitle);
          
          // 重新加载歌曲列表以显示更新后的标题
          setTimeout(() => {
            loadSongs();
          }, 1000);
        } catch (storageError) {
          console.error('保存到localStorage失败:', storageError);
        }
      }
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // 实际上传文件
      const publicUrl = await uploadFile(key, selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // 重置表单
      setTimeout(() => {
        setSelectedFile(null);
        setSongTitle('');
        setArtist('未知');
        setUploadProgress(0);
        setUploadSuccess(false);
      }, 3000);

      console.log('文件上传成功:', publicUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '上传失败');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setSongTitle('');
    setArtist('未知');
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  // 开始编辑歌曲标题
  const startEditSong = (song: Song) => {
    setEditingSongId(song.id);
    setEditingTitle(song.title);
    setEditingArtist(song.artist);
  };

  // 保存编辑的歌曲标题
  const saveEditSong = () => {
    if (!editingSongId) return;
    
    const song = songs.find(s => s.id === editingSongId);
    if (!song) return;
    
    // 从歌曲URL提取文件名
    const url = song.url;
    const fileNameMatch = url.match(/music\/(.+\.mp3)$/);
    if (!fileNameMatch) return;
    
    const fileName = fileNameMatch[1];
    const fileBaseName = fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    
    try {
      const titleMap = JSON.parse(localStorage.getItem('songTitleMap') || '{}');
      titleMap[fileBaseName] = {
        title: editingTitle.trim(),
        artist: editingArtist.trim() !== '' ? editingArtist.trim() : '未知',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('songTitleMap', JSON.stringify(titleMap));
      console.log('更新歌曲标题:', fileBaseName, editingTitle);
      
      // 重新加载歌曲列表
      loadSongs();
      setEditingSongId(null);
    } catch (error) {
      console.error('保存编辑失败:', error);
    }
  };

  // 取消编辑
  const cancelEditSong = () => {
    setEditingSongId(null);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Lock size={24} className="text-[#8A8FB8]" />
            </div>
          </div>
          <h2 className="text-xl font-light tracking-[0.3em] mb-2 uppercase">私密访问</h2>
          <p className="text-xs text-[#8A8FB8] mb-8 font-light">此区域内容受保护，请输入访问密码</p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-lg py-3 px-4 text-center text-lg tracking-[1em] focus:outline-none focus:border-white/30 transition-all`}
              autoFocus
            />
            {error && <p className="text-[10px] text-red-500/80 tracking-widest">密码错误，请重试</p>}
            <button 
              type="submit"
              className="w-full py-3 bg-white text-black text-xs font-medium rounded-lg hover:bg-[#F0F0F0] transition-colors tracking-widest uppercase"
            >
              验证并进入
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-32 px-4 md:px-12 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-16">
        <div>
          <h2 className="text-3xl font-light tracking-widest mb-2">私藏</h2>
          <p className="text-[#8A8FB8] text-xs tracking-widest font-light">私人空间，唯己可见。</p>
        </div>
        <button 
          onClick={() => setIsAuthorized(false)}
          className="text-[10px] tracking-widest text-[#8A8FB8] hover:text-white transition flex items-center gap-2"
        >
          <Unlock size={12} /> 锁定并退出
        </button>
      </div>

      <div className="space-y-20">
        {/* Module 0: 上传歌曲 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Upload size={16} className="text-[#8A8FB8]" />
            <h3 className="text-xs font-medium tracking-[0.2em] text-[#8A8FB8] uppercase">上传私藏歌曲</h3>
          </div>
          <div className="p-8 bg-[#161616] border border-white/5 rounded-xl">
            <form onSubmit={handleUpload} className="space-y-6">
              {/* 文件选择区域 */}
              <div className="space-y-4">
                <label className="block text-sm font-light text-[#8A8FB8]">
                  选择MP3文件
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className={`p-8 border-2 border-dashed rounded-xl text-center transition-all ${selectedFile ? 'border-white/20 bg-white/5' : 'border-white/10 hover:border-white/20'}`}>
                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <Music size={24} className="text-white/40" />
                            <span className="text-sm font-light truncate max-w-xs">{selectedFile.name}</span>
                          </div>
                          <p className="text-xs text-[#8A8FB8]">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload size={32} className="mx-auto text-white/20" />
                          <p className="text-sm text-[#8A8FB8]">点击或拖拽文件到此区域</p>
                          <p className="text-xs text-white/30">支持MP3格式，最大100MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".mp3,audio/mpeg"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                    </div>
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={resetUpload}
                      className="p-2 text-white/40 hover:text-white transition"
                      disabled={uploading}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* 歌曲信息 */}
              {selectedFile && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-[#8A8FB8] mb-2">
                      歌曲标题
                    </label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-all text-sm"
                      placeholder="输入歌曲标题"
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-[#8A8FB8] mb-2">
                      艺术家
                    </label>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-all text-sm"
                      placeholder="输入艺术家名称"
                      disabled={uploading}
                    />
                  </div>
                </div>
              )}

              {/* 上传进度 */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#8A8FB8]">
                    <span>上传中...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/80 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 状态消息 */}
              {uploadError && (
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <p className="text-sm text-red-400">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <p className="text-sm text-green-400">上传成功！歌曲已添加到您的私藏。</p>
                </div>
              )}

              {/* 上传按钮 */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className={`w-full py-3 rounded-lg text-sm font-medium tracking-widest uppercase transition-all ${!selectedFile || uploading ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-black hover:bg-[#F0F0F0]'}`}
                >
                  {uploading ? '上传中...' : '上传歌曲'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Module 1: 管理歌曲标题 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Edit size={16} className="text-[#8A8FB8]" />
            <h3 className="text-xs font-medium tracking-[0.2em] text-[#8A8FB8] uppercase">管理歌曲标题</h3>
          </div>
          <div className="p-8 bg-[#161616] border border-white/5 rounded-xl">
            <div className="space-y-4">
              <p className="text-sm text-[#8A8FB8] mb-4">
                为已上传的歌曲设置中文标题，使其在播放器中显示为中文。
              </p>
              
              {songs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-white/40">暂无歌曲，请先上传歌曲。</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {songs.map((song) => (
                    <div key={song.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      {editingSongId === song.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-[#8A8FB8] mb-1">歌曲标题</label>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm"
                              placeholder="输入中文标题"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-[#8A8FB8] mb-1">艺术家</label>
                            <input
                              type="text"
                              value={editingArtist}
                              onChange={(e) => setEditingArtist(e.target.value)}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm"
                              placeholder="输入艺术家"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={saveEditSong}
                              className="px-3 py-1.5 bg-white text-black text-xs rounded hover:bg-white/90 transition"
                            >
                              <Save size={12} className="inline mr-1" /> 保存
                            </button>
                            <button
                              onClick={cancelEditSong}
                              className="px-3 py-1.5 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                                <Music size={14} className="text-white/40" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-light truncate">{song.title}</h4>
                                <p className="text-xs text-[#8A8FB8] truncate">{song.artist}</p>
                                <p className="text-[10px] text-white/30 mt-1 truncate">
                                  {song.url.replace('music/', '')}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => startEditSong(song)}
                            className="ml-4 p-1.5 text-white/40 hover:text-white transition"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-[#8A8FB8]">
                  提示：标题修改后，刷新页面或重新进入播放器页面即可看到更新。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Module 2: Favorite Playlists */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Music size={16} className="text-[#8A8FB8]" />
            <h3 className="text-xs font-medium tracking-[0.2em] text-[#8A8FB8] uppercase">收藏的歌单</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PRIVATE_PLAYLISTS.map((playlist) => (
              <div 
                key={playlist.id}
                className="group flex items-center justify-between p-6 bg-[#161616] border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                    <Music size={18} className="text-white/20 group-hover:text-white/40 transition" />
                  </div>
                  <div>
                    <h4 className="text-sm font-light tracking-wide">{playlist.name}</h4>
                    <p className="text-[10px] text-[#8A8FB8] mt-1 uppercase tracking-tighter">{playlist.count} 首歌曲</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/10 group-hover:text-white transition" />
              </div>
            ))}
          </div>
        </section>

        {/* Module 2: Favorite Comments */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare size={16} className="text-[#8A8FB8]" />
            <h3 className="text-xs font-medium tracking-[0.2em] text-[#8A8FB8] uppercase">收藏的热评</h3>
          </div>
          <div className="space-y-4">
            {MOCK_PRIVATE_COMMENTS.map((comment) => (
              <div 
                key={comment.id}
                className="p-8 bg-[#161616] border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <p className="text-sm font-light leading-relaxed mb-6 italic opacity-80">
                  “{comment.content}”
                </p>
                <div className="text-[10px] tracking-[0.2em] text-[#8A8FB8] font-mono uppercase">
                  FROM: {comment.songTitle}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Module 3: Private Videos */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <VideoIcon size={16} className="text-[#8A8FB8]" />
            <h3 className="text-xs font-medium tracking-[0.2em] text-[#8A8FB8] uppercase">私密影像</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_PRIVATE_VIDEOS.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-[#161616] border border-white/5">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Lock size={16} className="text-white/40" />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-light tracking-wide">{video.title}</h4>
                  <p className="text-[10px] text-[#8A8FB8] mt-1 font-light italic">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default PrivateCollection;
