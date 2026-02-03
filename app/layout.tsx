import '../styles/globals.css';
import React from 'react';
import { Metadata } from 'next';

// 1. 使用 Metadata API 定义元数据，Next.js 会自动处理 <title> 和 <meta>
export const metadata: Metadata = {
  title: 'WYY AURA',
  description: 'WYY AURA - Personal Creative Space',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 2. 这里的字体链接会应用到全局 */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,900;1,400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
        {/* 注意：如果你在每个 page.tsx 里都写了 <SharedNavbar />，
          那么这里的 <SharedNavbar /> 应该移除，否则页面上会出现两个导航栏。
          建议统一写在这里，然后删掉所有 page.tsx 里的 <SharedNavbar />。
        */}
        {children}
      </body>
    </html>
  );
}