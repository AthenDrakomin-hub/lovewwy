'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { TRANSLATIONS, Language } from '../constants/translations';

interface SharedNavbarProps {
  lang?: Language;
  onLangChange?: (lang: Language) => void;
}

const SharedNavbar: React.FC<SharedNavbarProps> = ({ 
  lang = 'zh', 
  onLangChange 
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showLogin] = useState(false); // For demo purposes
  const router = useRouter();
  const pathname = usePathname() || '/';
  const t = TRANSLATIONS[lang];

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to get access token from supabase client
        const { getAccessToken } = await import('../src/lib/supabaseClient');
        const token = await getAccessToken();
        const headers: Record<string,string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/subscriptions/status', { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.subscribed) setIsSubscribed(true);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const goBack = () => {
    router.back();
  };

  const goForward = () => {
    router.forward();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-24 px-12 flex items-center justify-between glass border-b border-white/5">
      <div className="flex items-center gap-4 group cursor-pointer">
        <Link href="/" className="flex items-center gap-4">
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
        <button type="button" onClick={goBack} aria-label="Go back" className="text-zinc-500 hover:text-white transition-all hover:scale-110 mr-4">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button type="button" onClick={goForward} aria-label="Go forward" className="text-zinc-500 hover:text-white transition-all hover:scale-110 mr-4">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        <Link 
          href="/music" 
          className={`transition-all hover:scale-110 ${pathname === '/music' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
        >
          {t.nav.home}
        </Link>
        <Link 
          href="/videos" 
          className={`transition-all hover:scale-110 ${pathname === '/videos' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
        >
          {t.nav.visuals}
        </Link>
        <Link 
          href="/treasure" 
          className={`transition-all hover:scale-110 flex items-center gap-2 ${pathname === '/treasure' ? (isSubscribed ? 'text-amber-500' : 'text-white') : (isSubscribed ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-400')}`}
        >
          {t.nav.treasure}
          {!isSubscribed && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-zinc-700" fill="currentColor"><path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2zm6-9h-1V6a5 5 0 0 0-10 0v2H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3zM9 6a3 3 0 0 1 6 0v2H9V6z"/></svg>}
        </Link>
        <Link href="/profile" className="ml-6 text-zinc-500 hover:text-white">Profile</Link>
      </div>
    </nav>
  );
};

export default SharedNavbar;