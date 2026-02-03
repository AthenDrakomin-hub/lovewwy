import '../styles/globals.css';
import React from 'react';
import SharedNavbar from '../components/SharedNavbar';

export const metadata = {
  title: 'WYY AURA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
        <SharedNavbar />
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
