
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock, Copy, Check } from 'lucide-react';
import { MOCK_COMMENTS } from '../constants';
import { Comment } from '../types';

const CommentWall: React.FC = () => {
  const [filter, setFilter] = useState<string>('World');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['关于遗憾', '关于成长', '关于心动', '关于人间'];
  const mapping: Record<string, string> = {
    '关于遗憾': 'Regret',
    '关于成长': 'Growth',
    '关于心动': 'Heartbeat',
    '关于人间': 'World'
  };

  const filteredComments = MOCK_COMMENTS.filter(c => c.category === filter);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h2 className="text-3xl font-light tracking-widest mb-4">热评墙</h2>
          <div className="flex flex-wrap gap-6">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setFilter(mapping[cat])}
                className={`text-xs tracking-widest transition-all ${mapping[cat] === filter ? 'text-white border-b border-white pb-1' : 'text-[#8A8FB8] hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
            <button className="text-[#8A8FB8] hover:text-white transition">
              <Lock size={14} />
            </button>
          </div>
        </div>
        
        <div className="relative group w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FB8]" />
          <input 
            type="text" 
            placeholder="搜索热评"
            className="w-full bg-white/5 border-none rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-white/20 outline-none transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredComments.map((comment, i) => (
          <motion.div 
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 bg-[#161616] border border-white/5 rounded-xl group relative hover:border-white/10 transition-all duration-500 flex flex-col justify-between ${i % 3 === 1 ? 'md:row-span-2' : ''}`}
          >
            <p className="text-sm font-light leading-relaxed mb-12 opacity-80 group-hover:opacity-100">
              “{comment.content}”
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-[#8A8FB8] font-mono uppercase">
                {comment.songTitle || '未知曲目'}
              </span>
              <button 
                onClick={() => handleCopy(comment.id, comment.content)}
                className="text-[#8A8FB8] opacity-0 group-hover:opacity-100 transition-all"
              >
                {copiedId === comment.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
            {copiedId === comment.id && (
              <div className="absolute top-4 right-4 text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded">已复制</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommentWall;
