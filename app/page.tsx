'use client'
import React from 'react';
import Hero from '../components/Hero';
import Link from 'next/link';
import { TRANSLATIONS, Language } from '../constants/translations';

const HomePage: React.FC = () => {
  const t = TRANSLATIONS['zh' as Language];

  return (
    <div>
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-cinematic font-black text-white mb-6 tracking-tight">
            WYY AURA
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Personal Media Hub & Digital Experience Platform
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/music" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all">
              进入音乐世界
            </Link>
            <Link href="/videos" className="px-8 py-3 border border-zinc-700 hover:border-indigo-500 text-white font-bold rounded-full transition-all">
              探索视觉
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-zinc-900/50 bg-gradient-to-t from-black to-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-px bg-zinc-800"></div>
          <p className="text-zinc-600 text-[10px] font-mono tracking-[0.8em] uppercase">lovewyy.top • digital aura systems © 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
