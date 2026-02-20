
import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStartListening: () => void;
  onGoToWall: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartListening, onGoToWall }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] mb-4">
          人间不值得
        </h1>
        <p className="text-[#8A8FB8] text-sm md:text-lg tracking-[0.5em] font-light mb-12">
          唯有音乐，可抵人间喧嚣
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStartListening}
            className="px-10 py-3 bg-white text-black text-sm font-medium rounded-full hover:bg-[#F0F0F0] transition-colors"
          >
            开始听歌
          </button>
          <button 
            onClick={onGoToWall}
            className="px-10 py-3 border border-white/20 text-white text-sm font-medium rounded-full hover:bg-white/5 transition-colors"
          >
            热评墙
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-24 grid grid-cols-3 gap-12 text-center"
      >
        <div className="cursor-pointer group">
          <div className="text-[10px] tracking-widest text-[#8A8FB8] group-hover:text-white transition">音乐库</div>
        </div>
        <div className="cursor-pointer group">
          <div className="text-[10px] tracking-widest text-[#8A8FB8] group-hover:text-white transition">影像集</div>
        </div>
        <div className="cursor-pointer group">
          <div className="text-[10px] tracking-widest text-[#8A8FB8] group-hover:text-white transition">私藏</div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
