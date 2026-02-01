
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import VideoFeed from './components/VideoFeed';
import MusicHub from './components/MusicHub';
import AuraAI from './components/AuraAI';
import TreasureBox from './components/TreasureBox';
import TreasurePortal from './components/TreasurePortal';
import Player from './components/Player';
import VideoModal from './components/VideoModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';
import { MediaItem, LinkItem } from './types';
import { MUSIC } from './constants';
import { TRANSLATIONS, Language } from './constants/translations';

const App: React.FC = () => {
  // 语言状态
  const [lang, setLang] = useState<Language>('zh');
  const t = TRANSLATIONS[lang];

  // 状态管理
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProcessingSub, setIsProcessingSub] = useState(false);
  const [showSubSuccess, setShowSubSuccess] = useState(false);
  const [showTreasurePortal, setShowTreasurePortal] = useState(false);

  // 百宝箱链接数据
  const [treasureLinks, setTreasureLinks] = useState<LinkItem[]>([
    { id: 'l1', title: 'Framer Motion', url: 'https://framer.com/motion', icon: '🎨', description: 'Production-ready animations for React.', category: 'Creative' },
    { id: 'l2', title: 'Supabase', url: 'https://supabase.com', icon: '⚡', description: 'The open source Firebase alternative.', category: 'Dev Resources' },
    { id: 'l3', title: 'Raycast Store', url: 'https://www.raycast.com/store', icon: '🚀', description: 'Next level productivity for Mac.', category: 'Tools' },
    { id: 'l4', title: 'Midjourney', url: 'https://www.midjourney.com', icon: '🌌', description: 'Generative AI for artistic imagery.', category: 'Creative' }
  ]);

  // 音频播放状态
  const [currentTrack, setCurrentTrack] = useState<MediaItem>(MUSIC[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 视频播放状态
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);

  // 管理员状态
  const [showLogin, setShowLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // 初始化加载
  useEffect(() => {
    const savedLang = localStorage.getItem('aura-lang') as Language;
    if (savedLang && TRANSLATIONS[savedLang]) setLang(savedLang);
    
    const savedSub = localStorage.getItem('aura-sub') === 'true';
    setIsSubscribed(savedSub);
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('aura-lang', newLang);
  };

  const handleSubscribe = () => {
    setIsProcessingSub(true);
    setTimeout(() => {
      setIsProcessingSub(false);
      setIsSubscribed(true);
      setShowSubSuccess(true);
      localStorage.setItem('aura-sub', 'true');
    }, 2500);
  };

  const handlePlayTrack = (track: MediaItem) => {
    setActiveVideo(null);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayVideo = (video: MediaItem) => {
    setIsPlaying(false);
    setActiveVideo(video);
  };

  const handleAdminLogin = (password: string) => {
    setIsAdminLoggedIn(true);
    setShowLogin(false);
    setShowDashboard(true);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openTreasure = (e: React.MouseEvent) => {
    if (isSubscribed) {
      e.preventDefault();
      setShowTreasurePortal(true);
    } else {
      scrollToSection(e, 'treasure');
    }
  };

  return (
    <div className={`min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30 pb-24 ${showTreasurePortal ? 'overflow-hidden' : ''}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-24 px-12 flex items-center justify-between glass border-b border-white/5">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={(e) => scrollToSection(e, 'music')}>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-500 rounded-2xl aura-glow transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110"></div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-cinematic font-black tracking-tighter block leading-none">WYY AURA</span>
              {isSubscribed && <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Pro</span>}
            </div>
            <span className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase opacity-60">Personal Media Hub</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-[11px] font-black tracking-[0.3em] uppercase">
          <button onClick={(e) => scrollToSection(e, 'music')} className="text-white hover:text-indigo-400 transition-all hover:scale-110">{t.nav.home}</button>
          <button onClick={(e) => scrollToSection(e, 'videos')} className="text-zinc-500 hover:text-white transition-all hover:scale-110">{t.nav.visuals}</button>
          <button onClick={(e) => scrollToSection(e, 'ai')} className="text-zinc-500 hover:text-white transition-all hover:scale-110">{t.nav.ai}</button>
          <button onClick={openTreasure} className={`transition-all hover:scale-110 flex items-center gap-2 ${isSubscribed ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-400'}`}>
             {t.nav.treasure}
             {!isSubscribed && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-zinc-700" fill="currentColor"><path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2zm6-9h-1V6a5 5 0 0 0-10 0v2H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3zM9 6a3 3 0 0 1 6 0v2H9V6z"/></svg>}
          </button>
        </div>
        
        <div className="flex items-center gap-6">
           <LanguageSwitcher currentLang={lang} onLangChange={handleLangChange} />
           {!isSubscribed ? (
             <button onClick={handleSubscribe} className="hidden lg:flex bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-amber-600/20 active:scale-95 text-white">
               {t.nav.subscribe}
             </button>
           ) : (
             <div onClick={() => setShowTreasurePortal(true)} className="hidden lg:flex items-center gap-2 text-[10px] font-black tracking-widest text-amber-500 glass px-4 py-2 rounded-full border-amber-500/20 cursor-pointer hover:border-amber-500/50 transition-all">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                OPEN VAULT
             </div>
           )}
           <button onClick={() => isAdminLoggedIn ? setShowDashboard(true) : setShowLogin(true)} className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-xl active:scale-90 group">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-zinc-500 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </nav>

      <main className="animate-fadeIn pt-24">
        <section id="music" className="scroll-mt-24">
          <Hero translations={t.hero} />
          <div className="bg-gradient-to-b from-[#09090b] to-zinc-950/50">
            <MusicHub onPlayTrack={handlePlayTrack} currentTrackId={currentTrack.id} isPlaying={isPlaying} translations={t.beats} />
          </div>
        </section>
        
        <div className="relative">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[160px] -z-10"></div>
          <section id="videos" className="scroll-mt-24"><VideoFeed onPlayVideo={handlePlayVideo} translations={t.visuals} /></section>
          <section id="ai" className="scroll-mt-24"><AuraAI translations={t.ai} isPro={isSubscribed} /></section>
          <section id="treasure" className="scroll-mt-24 border-t border-zinc-900 bg-zinc-950/80">
            <TreasureBox translations={t.treasure} isSubscribed={isSubscribed} onSubscribe={handleSubscribe} links={treasureLinks} />
          </section>
        </div>

        <footer className="py-40 text-center border-t border-zinc-900/50 bg-gradient-to-t from-black to-transparent">
          <div className="mb-12"><h2 className="text-8xl md:text-[12rem] font-cinematic font-black opacity-[0.03] select-none tracking-tighter uppercase">AURA PRO</h2></div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-px bg-zinc-800"></div>
            <p className="text-zinc-600 text-[10px] font-mono tracking-[0.8em] uppercase">lovewyy.top &bull; digital aura systems &copy; 2024</p>
          </div>
        </footer>
      </main>

      {/* Full-screen Immersive Portal */}
      {showTreasurePortal && <TreasurePortal translations={t.treasure} links={treasureLinks} onClose={() => setShowTreasurePortal(false)} />}

      <Player currentTrack={currentTrack} isPlaying={isPlaying} onPlayPause={(playing) => setIsPlaying(playing)} />
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />

      {isProcessingSub && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center glass backdrop-blur-3xl animate-fadeIn">
           <div className="text-center">
              <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-8"></div>
              <h3 className="text-2xl font-black tracking-widest uppercase mb-2">Securing Connection...</h3>
              <p className="text-zinc-500 text-sm font-bold animate-pulse uppercase tracking-[0.2em]">Authenticating Pro Identity</p>
           </div>
        </div>
      )}

      {showSubSuccess && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-fadeIn">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSubSuccess(false)}></div>
           <div className="relative glass p-12 rounded-[56px] border border-amber-500/50 max-w-md w-full text-center shadow-[0_0_100px_rgba(245,158,11,0.2)]">
              <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/40">
                 <svg viewBox="0 0 24 24" className="w-12 h-12 text-black" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="text-4xl font-cinematic font-black mb-4">Welcome, Pro.</h3>
              <p className="text-zinc-400 mb-10 leading-relaxed">Your digital aura has been upgraded. All premium resources and the Treasure Box are now fully unlocked.</p>
              <button onClick={() => setShowSubSuccess(false)} className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-amber-500 hover:text-white transition-all transform active:scale-95">START EXPLORING</button>
           </div>
        </div>
      )}

      {showLogin && <AdminLoginModal onLogin={handleAdminLogin} onClose={() => setShowLogin(false)} />}
      {showDashboard && <AdminDashboard onClose={() => setShowDashboard(false)} treasureLinks={treasureLinks} onUpdateLinks={setTreasureLinks} />}
    </div>
  );
};

export default App;
