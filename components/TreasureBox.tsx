
import React, { useState } from 'react';
import { LinkItem } from '../types';
import SubscribeButton from './SubscribeButton';

interface TreasureBoxProps {
  translations: any;
  isSubscribed: boolean;
  onSubscribe: () => void;
  links: LinkItem[];
}

const TreasureBox: React.FC<TreasureBoxProps> = ({ translations, isSubscribed, onSubscribe, links }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories: string[] = ['All', ...Array.from(new Set<string>(links.map(l => l.category)))];
  const filteredLinks = activeCategory === 'All' ? links : links.filter(l => l.category === activeCategory);

  if (!isSubscribed) {
    return (
      <div className="py-32 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-cinematic font-black mb-6 bg-gradient-to-r from-white via-zinc-400 to-white bg-clip-text text-transparent">
            {translations.title}
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
            {translations.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Showcase Side */}
          <div className="lg:col-span-7 relative group">
            <div className="aspect-video rounded-[56px] overflow-hidden glass border-2 border-white/5 relative shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-transparent to-amber-500/20"></div>
               
               {/* Blurred Mockup Content */}
               <div className="absolute inset-0 grid grid-cols-3 gap-6 p-12 opacity-40 blur-md pointer-events-none">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-full bg-zinc-800/80 rounded-3xl border border-white/10"></div>
                  ))}
               </div>

               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-black/40 backdrop-blur-[2px]">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-8 aura-glow shadow-xl shadow-amber-500/20">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor">
                      <path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2zm6-9h-1V6a5 5 0 0 0-10 0v2H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3zM9 6a3 3 0 0 1 6 0v2H9V6z"/>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">{translations.locked}</h3>
                  <p className="text-zinc-400 text-base max-w-sm">{translations.unlockDesc}</p>
               </div>
            </div>
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-[120px] -z-10"></div>
          </div>

          {/* Pricing/Subscription Card */}
          <div className="lg:col-span-5">
            <div className="glass p-12 rounded-[56px] border-2 border-amber-500/40 shadow-[0_0_80px_rgba(245,158,11,0.15)] relative overflow-hidden group hover:border-amber-500 transition-colors duration-500">
               <div className="absolute top-0 right-0 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[10px] font-black tracking-widest uppercase rounded-bl-[32px] shadow-lg">
                  PREMIUM ACCESS
               </div>
               
               <div className="mb-10">
                  <h4 className="text-amber-500 text-xs font-black uppercase tracking-[0.4em] mb-4">{translations.planName}</h4>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-cinematic font-black text-white">{translations.price}</span>
                    <span className="text-zinc-500 text-sm font-bold">{translations.period}</span>
                  </div>
               </div>

               <div className="space-y-5 mb-12">
                  {translations.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                       <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                       </div>
                       <span className="text-zinc-300 text-sm font-semibold tracking-wide">{feature}</span>
                    </div>
                  ))}
               </div>

               {/* Subscribe Button - integrated with payment API */}
               <SubscribeButton onSuccess={onSubscribe} amount="9.9" translations={translations} />
               
               {/* Fallback small note */}
               <p className="text-center text-[10px] text-zinc-600 mt-8 font-bold tracking-widest uppercase opacity-60">Verified Payment • No Hidden Costs</p>
               
               <p className="text-center text-[10px] text-zinc-600 mt-8 font-bold tracking-widest uppercase opacity-60">Verified Payment • No Hidden Costs</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-4">
             <span className="w-12 h-1 bg-amber-500 rounded-full"></span>
             <span className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase">Private Directory</span>
          </div>
          <h2 className="text-6xl font-cinematic font-black mb-4 flex items-center gap-6">
            {translations.title}
          </h2>
          <p className="text-zinc-500 text-lg leading-relaxed font-light">{translations.desc}</p>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 glass rounded-2xl border-zinc-800">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                activeCategory === cat 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'text-zinc-500 hover:text-white'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredLinks.map((link, idx) => (
          <a 
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative h-full"
          >
            <div className="h-full glass p-8 rounded-[40px] border border-zinc-800 hover:border-amber-500/50 transition-all duration-500 flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Category Badge */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[9px] px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-full font-black uppercase tracking-widest group-hover:border-amber-500/30 group-hover:text-amber-500 transition-colors">
                  {link.category}
                </span>
                {idx < 2 && <span className="text-[9px] px-2 py-0.5 bg-red-500/20 text-red-500 rounded font-bold uppercase">Trending</span>}
              </div>

              {/* Icon & Title */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 origin-left drop-shadow-2xl">
                {link.icon}
              </div>
              
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-amber-400 transition-colors">
                {link.title}
              </h3>
              
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-medium line-clamp-3">
                {link.description}
              </p>
              
              {/* Link Footer */}
              <div className="mt-auto flex items-center justify-between border-t border-zinc-900 pt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-700 font-mono font-bold tracking-tighter">ENDPOINT</span>
                  <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[120px]">{new URL(link.url).hostname}</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-zinc-600 group-hover:text-black transition-colors" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TreasureBox;
