'use client'
import React from 'react';
import Hero from '../components/Hero';
import Link from 'next/link';
import { TRANSLATIONS, Language } from '../constants/translations';

// 定义标准 Props 结构
interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function HomePage({ searchParams }: PageProps) {
  // 从 URL 获取语言参数，例如 lovewyy.top/?lang=en，默认为 'zh'
  const lang = (searchParams?.lang as Language) || 'zh';
  const t = TRANSLATIONS[lang];

  return (
    <div className="relative overflow-hidden">
      {/* 装饰性背景光效 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)] pointer-events-none" />

      <section className="min-h-[90vh] flex items-center justify-center px-8 relative z-10">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">
            WYY AURA
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Personal Media Hub & Digital Experience Platform
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              href={`/music?lang=${lang}`} 
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              进入音乐世界
            </Link>
            <Link 
              href={`/videos?lang=${lang}`} 
              className="px-10 py-4 border border-zinc-700 hover:border-indigo-500 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95"
            >
              探索视觉
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-zinc-900/50 bg-gradient-to-t from-black to-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-px bg-zinc-800"></div>
          <p className="text-zinc-600 text-[10px] font-mono tracking-[0.8em] uppercase">
            lovewyy.top • digital aura systems © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}