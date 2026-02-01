import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from './components/Hero';
import LanguageSwitcher from './components/LanguageSwitcher';

import { TRANSLATIONS, Language } from './constants/translations';

const App: React.FC = () => {
  // 语言状态
  const [lang, setLang] = useState<Language>('zh');
  const navigate = useNavigate();
  const t = TRANSLATIONS[lang];

  // 导航功能
  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  const goToHome = () => {
    navigate('/');
  };

  // 状态管理
  const [isSubscribed, setIsSubscribed] = useState(false);
  // 获取当前路径
  const location = useLocation();

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
    setIsSubscribed(true);
    localStorage.setItem('aura-sub', 'true');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-24 px-12 flex items-center justify-between glass border-b border-white/5">
        <div className="flex items-center gap-4 group cursor-pointer">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-500 rounded-2xl aura-glow transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110"></div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-cinematic font-black tracking-tighter block leading-none">WYY AURA</span>
                {isSubscribed && <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Pro</span>}
              </div>
              <span className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase opacity-60">Personal Media Hub</span>
            </div>
          </Link>
        </div>
        
        <div className="hidden md:flex gap-10 text-[11px] font-black tracking-[0.3em] uppercase">
          <Link to="/music" className="text-zinc-500 hover:text-white transition-all hover:scale-110">{t.nav.home}</Link>
          <Link to="/videos" className="text-zinc-500 hover:text-white transition-all hover:scale-110">{t.nav.visuals}</Link>
          <Link to="/treasure" className="text-zinc-500 hover:text-white transition-all hover:scale-110">{t.nav.treasure}</Link>
        </div>
        
        <div className="flex items-center gap-6">
           <LanguageSwitcher currentLang={lang} onLangChange={handleLangChange} />
           <Link to="/admin">
             <button title="Admin" aria-label="Admin" className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-xl active:scale-90 group">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-zinc-500 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             </button>
           </Link>
        </div>
      </nav>

      <main className="animate-fadeIn pt-24">
        {/* 根据当前路径显示相应内容 */}
        {location.pathname === '/' && (
          <>
            <section className="min-h-screen flex items-center justify-center px-8">
              <div className="text-center max-w-4xl">
                <h1 className="text-6xl md:text-8xl font-cinematic font-black text-white mb-6 tracking-tight">
                  WYY AURA
                </h1>
                <p className="text-xl md:text-2xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Personal Media Hub & Digital Experience Platform
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/music" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all">
                    进入音乐世界
                  </Link>
                  <Link to="/videos" className="px-8 py-3 border border-zinc-700 hover:border-indigo-500 text-white font-bold rounded-full transition-all">
                    探索视觉
                  </Link>
                </div>
              </div>
            </section>

            <footer className="py-20 text-center border-t border-zinc-900/50 bg-gradient-to-t from-black to-transparent">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-px bg-zinc-800"></div>
                <p className="text-zinc-600 text-[10px] font-mono tracking-[0.8em] uppercase">lovewyy.top &bull; digital aura systems &copy; 2024</p>
              </div>
            </footer>
          </>
        )}
      </main>

      {isSubscribed && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-fadeIn">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSubscribed(false)}></div>
           <div className="relative glass p-8 rounded-[32px] border border-amber-500/50 max-w-md w-full text-center shadow-[0_0_100px_rgba(245,158,11,0.2)]">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/40">
                 <svg viewBox="0 0 24 24" className="w-8 h-8 text-black" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="text-2xl font-cinematic font-black mb-3">Thank You!</h3>
              <p className="text-zinc-400 mb-6 text-sm">You are now subscribed to WYY AURA.</p>
              <button onClick={() => setIsSubscribed(false)} className="w-full py-3 bg-white text-black font-black rounded-2xl hover:bg-amber-500 hover:text-white transition-all">CONTINUE</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;