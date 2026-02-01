
import React, { useState } from 'react';
import { LinkItem } from '../types';

interface TreasurePortalProps {
  translations: any;
  links: LinkItem[];
  onClose: () => void;
}

const TreasurePortal: React.FC<TreasurePortalProps> = ({ translations, links, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories: string[] = ['All', ...Array.from(new Set<string>(links.map(l => l.category)))];
  const filteredLinks = activeCategory === 'All' ? links : links.filter(l => l.category === activeCategory);

  return (
    <div className="fixed inset-0 z-[400] bg-[#050505] flex flex-col animate-fadeIn overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 h-32 px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20 rotate-3">
             <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
          </div>
          <div>
            <h1 className="text-3xl font-cinematic font-black tracking-tighter text-white uppercase">{translations.title}</h1>
            <p className="text-amber-500/60 text-[10px] font-black tracking-[0.4em] uppercase">Pro Member Vault</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="group flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all active:scale-95"
        >
          <span className="text-xs font-black tracking-widest">EXIT VAULT</span>
          <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center transition-transform group-hover:rotate-90">
             <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>
        </button>
      </header>

      {/* Categories Toolbar */}
      <div className="relative z-10 px-12 py-8 flex items-center gap-4 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
         {categories.map(cat => (
           <button
             key={cat}
             onClick={() => setActiveCategory(cat)}
             className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${
               activeCategory === cat 
               ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
               : 'text-zinc-500 hover:text-white'
             }`}
           >
             {cat.toUpperCase()}
           </button>
         ))}
      </div>

      {/* Main Content Scroll Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-12 py-16 custom-scrollbar">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredLinks.map((link, idx) => (
              <a 
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-full animate-fadeIn"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="h-full bg-zinc-900/40 backdrop-blur-md p-10 rounded-[48px] border border-white/5 hover:border-amber-500/40 transition-all duration-700 flex flex-col hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="text-6xl group-hover:scale-125 transition-transform duration-700 origin-left drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      {link.icon}
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[8px] font-black text-amber-500/40 tracking-[0.3em] uppercase mb-1">Status</span>
                       <span className="text-[9px] text-green-500 font-bold uppercase">Active</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-4 group-hover:text-amber-400 transition-colors tracking-tight">
                    {link.title}
                  </h3>
                  
                  <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium line-clamp-4 group-hover:text-zinc-300 transition-colors">
                    {link.description}
                  </p>
                  
                  <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[10px] text-zinc-600 font-mono tracking-tighter truncate max-w-[150px]">{new URL(link.url).hostname}</span>
                     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-400 transition-all">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500 group-hover:text-black transition-colors" fill="none" stroke="currentColor" strokeWidth="3">
                           <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                     </div>
                  </div>
                </div>
              </a>
            ))}
         </div>
      </main>

      <footer className="relative z-10 h-20 px-12 flex items-center justify-center border-t border-white/5 text-[9px] font-black tracking-[0.5em] text-zinc-700 uppercase">
         Protected Resource Layer &bull; Authorized Pro Access Only
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default TreasurePortal;
