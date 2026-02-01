
import React from 'react';
import { FEATURED_VIDEO } from '../constants';

interface HeroProps {
  translations: any;
}

const Hero: React.FC<HeroProps> = ({ translations }) => {
  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        <img 
          src={FEATURED_VIDEO.thumbnail} 
          alt="Featured Preview" 
          className="w-full h-full object-cover brightness-[0.3] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-6 animate-fadeIn">
          <span className="w-12 h-px bg-indigo-500"></span>
          <span className="text-indigo-400 font-black tracking-[0.4em] uppercase text-[10px]">{translations.tag}</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-cinematic font-black text-white mb-8 max-w-4xl leading-[0.9] tracking-tighter animate-fadeIn">
          {FEATURED_VIDEO.title}
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed font-light animate-fadeIn">
          {FEATURED_VIDEO.description}
        </p>
        
        <div className="flex flex-wrap gap-6 animate-fadeIn">
          <button className="group relative px-10 py-4 bg-white text-black font-black rounded-full overflow-hidden transition-all hover:pr-14 active:scale-95">
            <span className="relative z-10">{translations.cta}</span>
            <svg viewBox="0 0 24 24" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          
          <button className="px-10 py-4 glass text-white font-black rounded-full hover:bg-white/10 transition-all border border-white/10">
            {translations.catalogue}
          </button>
        </div>
      </div>

      <div className="absolute right-12 bottom-24 hidden lg:block animate-pulse">
        <div className="flex flex-col gap-4 items-center">
           <div className="w-px h-24 bg-gradient-to-b from-transparent via-indigo-500 to-transparent"></div>
           <span className="text-[10px] font-mono text-zinc-500 rotate-90 whitespace-nowrap tracking-[0.5em]">{translations.scroll}</span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
