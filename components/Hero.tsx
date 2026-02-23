
import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStartListening: () => void;
  onGoToWall: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartListening, onGoToWall }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1a1a1a]"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8A8FB8] rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#4a4a4a] rounded-full mix-blend-screen filter blur-3xl animate-pulse-slower"></div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="%238A8FB8" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E')] opacity-10"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] mb-4 artistic-title">
          人间不值得
        </h1>
        <p className="text-[#8A8FB8] text-sm md:text-lg tracking-[0.5em] font-light mb-12">
          唯有音乐，可抵人间喧嚣
        </p>
        
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@900&display=swap');
          
          .artistic-title {
            font-family: 'Ma Shan Zheng', cursive;
            font-weight: 400;
            background: linear-gradient(135deg, 
              #ffffff 0%, 
              #d4d4d4 25%, 
              #8A8FB8 50%, 
              #4a4a4a 75%, 
              #2a2a2a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% 200%;
            animation: gradientShift 8s ease infinite;
            text-shadow: 
              0 2px 4px rgba(0, 0, 0, 0.5),
              0 4px 8px rgba(138, 143, 184, 0.3),
              0 8px 16px rgba(138, 143, 184, 0.2);
            position: relative;
            letter-spacing: 0.05em;
            line-height: 1.2;
            filter: drop-shadow(0 0 10px rgba(138, 143, 184, 0.1));
          }
          
          .artistic-title::before {
            content: '人间不值得';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmer 3s ease-in-out infinite;
            z-index: -1;
          }
          
          .artistic-title::after {
            content: '';
            position: absolute;
            bottom: -12px;
            left: 15%;
            width: 70%;
            height: 3px;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(138, 143, 184, 0.8), 
              rgba(255, 255, 255, 0.6), 
              rgba(138, 143, 184, 0.8), 
              transparent);
            opacity: 0.7;
            border-radius: 2px;
            animation: linePulse 4s ease-in-out infinite;
          }
          
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes shimmer {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
          }
          
          @keyframes linePulse {
            0%, 100% { 
              opacity: 0.5;
              transform: scaleX(0.9);
            }
            50% { 
              opacity: 0.8;
              transform: scaleX(1);
            }
          }
          
          /* Dynamic background animations */
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
          }
          
          @keyframes pulse-slower {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.03); }
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 8s ease-in-out infinite;
          }
          
          .animate-pulse-slower {
            animation: pulse-slower 12s ease-in-out infinite;
          }
        `}</style>
        
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
