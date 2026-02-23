import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Upload, X, Check, Edit, Save, Home } from 'lucide-react';
import { uploadFile, getAllSongs } from '../lib/s3';
import { Song } from '../types';

const LonelyCollection: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
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
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const fetchedSongs = await getAllSongs();
      // 过滤出属于"孤独感集"的歌单歌曲
      const lonelyPlaylist = JSON.parse(localStorage.getItem('lonelyPlaylist') || '[]');
      const lonelySongs = fetchedSongs.filter(song => 
        lonelyPlaylist.includes(song.id)
      );
      setSongs(lonelySongs);
    } catch (error) {
      console.error('加载歌曲失败:', error);
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
      
      // 获取上传的歌曲ID并添加到歌单
      const fetchedSongs = await getAllSongs();
      // 使用S3 key来查找新上传的歌曲（更可靠）
      const newSong = fetchedSongs.find(song => song.url === key || song.url.includes(fileName));
      if (newSong) {
        const lonelyPlaylist = JSON.parse(localStorage.getItem('lonelyPlaylist') || '[]');
        if (!lonelyPlaylist.includes(newSong.id)) {
          lonelyPlaylist.push(newSong.id);
          localStorage.setItem('lonelyPlaylist', JSON.stringify(lonelyPlaylist));
          console.log('歌曲已添加到孤独感集:', newSong.id, newSong.title);
        }
      } else {
        console.warn('警告：上传后未找到歌曲，可能需要在getAllSongs中修复歌曲ID生成逻辑');
        console.log('查找参数:', { key, fileName, fetchedSongsCount: fetchedSongs.length });
      }
      
      // 重新加载歌曲列表
      setTimeout(() => {
        loadSongs();
      }, 1000);
      
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
      console.error('上传失败:', error);
      let errorMessage = '上传失败';
      if (error instanceof Error) {
        errorMessage = error.message;
        // 如果是S3连接错误，提供更友好的提示
        if (errorMessage.includes('credentials') || errorMessage.includes('AccessDenied') || errorMessage.includes('InvalidAccessKeyId')) {
          errorMessage = 'S3连接失败：请检查S3配置和凭据是否正确。可以尝试使用"测试S3连接"功能检查配置。';
        } else if (errorMessage.includes('NoSuchBucket')) {
          errorMessage = '存储桶不存在：请检查存储桶名称是否正确，或确保存储桶已创建。';
        } else if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
          errorMessage = '网络连接失败：请检查网络连接，或S3端点是否可访问。';
        }
      }
      setUploadError(errorMessage);
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

  // 从歌单移除歌曲
  const removeFromPlaylist = (songId: string) => {
    const lonelyPlaylist = JSON.parse(localStorage.getItem('lonelyPlaylist') || '[]');
    const updatedPlaylist = lonelyPlaylist.filter((id: string) => id !== songId);
    localStorage.setItem('lonelyPlaylist', JSON.stringify(updatedPlaylist));
    loadSongs();
  };

  // 将歌曲移动到其他播放列表
  const moveSongToPlaylist = (songId: string, targetPlaylist: 'lonely' | 'midnight' | 'private') => {
    try {
      // 获取当前歌曲
      const song = songs.find(s => s.id === songId);
      if (!song) return;

      // 从所有播放列表中移除（如果用户想移动而不是复制）
      // 如果希望歌曲可以同时属于多个播放列表，可以注释掉这部分
      const lonelyPlaylist = JSON.parse(localStorage.getItem('lonelyPlaylist') || '[]');
      const midnightPlaylist = JSON.parse(localStorage.getItem('midnightPlaylist') || '[]');
      const privatePlaylist = JSON.parse(localStorage.getItem('privatePlaylist') || '[]');
      
      // 从当前播放列表移除（如果存在）
      const updatedLonely = lonelyPlaylist.filter((id: string) => id !== songId);
      const updatedMidnight = midnightPlaylist.filter((id: string) => id !== songId);
      const updatedPrivate = privatePlaylist.filter((id: string) => id !== songId);
      
      // 添加到目标播放列表
      if (targetPlaylist === 'lonely' && !updatedLonely.includes(songId)) {
        updatedLonely.push(songId);
      } else if (targetPlaylist === 'midnight' && !updatedMidnight.includes(songId)) {
        updatedMidnight.push(songId);
      } else if (targetPlaylist === 'private' && !updatedPrivate.includes(songId)) {
        updatedPrivate.push(songId);
      }
      
      // 保存回localStorage
      localStorage.setItem('lonelyPlaylist', JSON.stringify(updatedLonely));
      localStorage.setItem('midnightPlaylist', JSON.stringify(updatedMidnight));
      localStorage.setItem('privatePlaylist', JSON.stringify(updatedPrivate));
      
      console.log(`歌曲 ${song.title} 已移动到 ${targetPlaylist} 播放列表`);
      
      // 重新加载歌曲列表
      loadSongs();
      
      // 如果不在目标播放列表页面，提示用户
      if (targetPlaylist !== 'lonely') {
        alert(`歌曲已移动到${targetPlaylist === 'midnight' ? '午夜电台' : '私藏珍品'}播放列表。您可以在对应页面查看。`);
      }
    } catch (error) {
      console.error('移动歌曲失败:', error);
    }
  };

  // 检查歌曲属于哪些播放列表
  const getSongPlaylists = (songId: string) => {
    const lonelyPlaylist = JSON.parse(localStorage.getItem('lonelyPlaylist') || '[]');
    const midnightPlaylist = JSON.parse(localStorage.getItem('midnightPlaylist') || '[]');
    const privatePlaylist = JSON.parse(localStorage.getItem('privatePlaylist') || '[]');
    
    const playlists = [];
    if (lonelyPlaylist.includes(songId)) playlists.push('lonely');
    if (midnightPlaylist.includes(songId)) playlists.push('midnight');
    if (privatePlaylist.includes(songId)) playlists.push('private');
    
    return playlists;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-32 px-4 md:px-12 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-16">
        <div>
          <h2 className="text-3xl font-light tracking-widest mb-2">孤独感集</h2>
          <p className="text-[#8A8FB8] text-xs tracking-widest font-light">孤独世界里的专属治愈，唯有此集，长存静谧。</p>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="text-[10px] tracking-widest text-[#8A8FB8] hover:text-white transition flex items-center gap-2"
          >
            <Home size={12} /> 返回首页
          </button>
        )}
      </div>

      <div className="space-y-20">
        {/* 上传歌曲 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Upload size={16} className="text-[#8A8FB8]" />
            <h3 className="text-xs font-medium tracking-[0.2em] text-[#8A8FB8] uppercase">添加歌曲到孤独感集</h3>
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
                        <div className="space-y-4">
                          <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Upload size={20} className="text-[#8A8FB8]" />
                          </div>
                          <div>
                            <p className="text-sm font-light mb-1">点击选择MP3文件</p>
                            <p className="text-xs text-[#8A8FB8]">或拖放文件到这里</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".mp3,audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </label>
                  
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={resetUpload}
                      className="p-3 text-[#8A8FB8] hover:text-white transition"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* 歌曲信息输入 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-[#8A8FB8] mb-2">
                    歌曲标题
                  </label>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="请输入歌曲标题"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-white/30 transition"
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
                    placeholder="请输入艺术家名称"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-white/30 transition"
                  />
                </div>
              </div>

              {/* 上传进度和状态 */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/30 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#8A8FB8] text-center">
                    {uploadProgress < 100 ? '上传中...' : '上传完成!'}
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-500/80">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                  <Check size={16} className="text-green-500/80" />
                  <p className="text-sm text-green-500/80">歌曲已成功添加到孤独感集!</p>
                </div>
              )}

              {/* 上传按钮 */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex-1 py-3 bg-white text-black text-xs font-medium rounded-lg hover:bg-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      添加到孤独感集
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 歌曲列表 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Music size={16} className="text-[#8A8FB8]" />
            <h3 className="text-xs font-medium tracking-[0.2em] text-[#8A8FB8] uppercase">
              孤独感集歌曲 ({songs.length})
            </h3>
          </div>
          
          {songs.length === 0 ? (
            <div className="p-12 text-center border border-white/5 rounded-xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Music size={24} className="text-[#8A8FB8]" />
              </div>
              <h4 className="text-sm font-light mb-2">歌单空空如也</h4>
              <p className="text-xs text-[#8A8FB8]">上传第一首歌曲，开始你的孤独感集</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => (
                <div key={song.id} className="group relative p-6 bg-[#161616] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                  {editingSongId === song.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-white/30"
                        placeholder="歌曲标题"
                      />
                      <input
                        type="text"
                        value={editingArtist}
                        onChange={(e) => setEditingArtist(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-white/30"
                        placeholder="艺术家"
                      />
                      
                      {/* 快速分类选择 */}
                      <div className="pt-2">
                        <p className="text-xs text-[#8A8FB8] mb-2">快速分类：</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => moveSongToPlaylist(song.id, 'lonely')}
                            className={`flex-1 py-2 text-xs rounded-lg transition ${getSongPlaylists(song.id).includes('lonely') ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-[#8A8FB8]'}`}
                          >
                            孤独感集
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSongToPlaylist(song.id, 'midnight')}
                            className={`flex-1 py-2 text-xs rounded-lg transition ${getSongPlaylists(song.id).includes('midnight') ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-[#8A8FB8]'}`}
                          >
                            午夜电台
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSongToPlaylist(song.id, 'private')}
                            className={`flex-1 py-2 text-xs rounded-lg transition ${getSongPlaylists(song.id).includes('private') ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-[#8A8FB8]'}`}
                          >
                            私藏珍品
                          </button>
                        </div>
                        <p className="text-xs text-[#8A8FB8] mt-2">
                          当前分类：{getSongPlaylists(song.id).map(p => 
                            p === 'lonely' ? '孤独感集' : 
                            p === 'midnight' ? '午夜电台' : 
                            '私藏珍品'
                          ).join('、') || '未分类'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEditSong}
                          className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-xs rounded-lg transition"
                        >
                          保存标题
                        </button>
                        <button
                          onClick={cancelEditSong}
                          className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-xs rounded-lg transition"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1 truncate">{song.title}</h4>
                          <p className="text-xs text-[#8A8FB8]">{song.artist}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditSong(song)}
                            className="p-1.5 text-[#8A8FB8] hover:text-white transition"
                            title="编辑"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => removeFromPlaylist(song.id)}
                            className="p-1.5 text-[#8A8FB8] hover:text-red-400 transition"
                            title="从歌单移除"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-white/5">
                        <img 
                          src={song.cover} 
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {song.hotComment && (
                        <p className="text-xs text-[#8A8FB8] italic border-l-2 border-white/10 pl-3 py-1">
                          "{song.hotComment}"
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default LonelyCollection;
