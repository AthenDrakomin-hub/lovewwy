
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Music, MessageSquare, Video as VideoIcon, ChevronRight } from 'lucide-react';
import { MOCK_PRIVATE_PLAYLISTS, MOCK_PRIVATE_COMMENTS, MOCK_PRIVATE_VIDEOS } from '../constants';

const PrivateCollection: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

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
        {/* Module 1: Favorite Playlists */}
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
