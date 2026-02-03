import { Metadata } from 'next';

// 导出元数据对象，Next.js 会自动将其注入到 <head> 中
export const metadata: Metadata = {
  title: 'WYY AURA',
  description: 'WYY AURA Personal Space', // 建议加上描述，对 SEO 有好处
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        {/* 字体建议保留在这里，或者使用 next/font (更推荐) */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,900;1,400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}