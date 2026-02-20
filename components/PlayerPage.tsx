
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { Song } from '../types';

interface PlayerPageProps {
  song: Song;
  isPlaying: boolean;
}

const PlayerPage: React.FC<PlayerPageProps> = ({ song, isPlaying }) => {
  const [showFullComments, setShowFullComments] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 flex transition-all duration-500 overflow-hidden">
      {/* Sidebar - Song List Placeholder */}
      <div className="hidden lg:block w-[20%] pr-8">
        <h3 className="text-xs font-medium tracking-widest text-[#8A8FB8] uppercase mb-6">我的歌单</h3>
        <ul className="space-y-4 text-sm text-white/60">
          <li className="text-white font-medium border-l-2 border-white pl-4">当前播放</li>
          <li className="hover:text-white cursor-pointer pl-4 transition">孤独感集</li>
          <li className="hover:text-white cursor-pointer pl-4 transition">午夜电台</li>
          <li className="hover:text-white cursor-pointer pl-4 transition">私藏珍品</li>
        </ul>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-500 ${showFullComments ? 'lg:pr-12' : ''}`}>
        <motion.div 
          key={song.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          <img 
            src={song.cover} 
            alt={song.title}
            className={`w-[260px] h-[260px] md:w-[320px] md:h-[320px] rounded-full object-cover shadow-2xl spinning-cover ${isPlaying ? '' : 'paused'}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/40 border border-white/20 backdrop-blur-sm" />
          </div>
        </motion.div>

        <div className="mt-12 text-center max-w-xl w-full">
          <h2 className="text-2xl font-semibold mb-2">{song.title}</h2>
          <p className="text-[#8A8FB8] text-sm mb-8">{song.artist}</p>
          
          <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
            {song.lyrics?.map((line, i) => (
              <p 
                key={i} 
                className={`text-sm transition-all duration-700 ${i === 2 ? 'text-white text-lg font-medium opacity-100' : 'text-white/30'}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Floating Hot Comment */}
        <div className="mt-12 max-w-md hidden md:block">
          <div className="flex gap-4 items-start bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <MessageSquare size={16} className="text-[#8A8FB8] mt-1 shrink-0" />
            <p className="text-xs italic text-[#8A8FB8] leading-relaxed">
              "{song.hotComment}"
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Full Comments Toggle */}
      <div className={`hidden lg:flex flex-col border-l border-white/5 bg-black/20 transition-all duration-500 overflow-hidden ${showFullComments ? 'w-[25%]' : 'w-0'}`}>
        <div className="p-8 min-w-[300px]">
          <h3 className="text-xs font-medium tracking-widest text-[#8A8FB8] uppercase mb-8">热评墙</h3>
          <div className="space-y-8">
            <CommentCard text="有些歌听得懂的时候，其实已经晚了。" author="佚名" />
            <CommentCard text="那是最好的一年，也是最坏的一年。" author="孤独的夜猫子" />
            <CommentCard text="希望能遇到那个让你觉得人间值得的人。" author="时光机" />
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setShowFullComments(!showFullComments)}
        className="fixed right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full text-[#8A8FB8] hover:text-white transition hidden lg:block"
      >
        {showFullComments ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
};

const CommentCard = ({ text, author }: { text: string; author: string }) => (
  <div className="space-y-2 opacity-80 hover:opacity-100 transition">
    <p className="text-xs leading-relaxed font-light">“{text}”</p>
    <div className="text-[10px] text-[#8A8FB8]">— {author}</div>
  </div>
);

export default PlayerPage;
