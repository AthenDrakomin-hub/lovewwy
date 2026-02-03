'use client'
import React, { useState } from 'react';
import AdminLoginModal from '../../components/AdminLoginModal';
import AdminDashboard from '../../components/AdminDashboard';
import S3Admin from '../../components/S3Admin';
import SharedNavbar from '../../components/SharedNavbar';
import { Language } from '../../constants/translations';

// 适配 App Router 的标准 Props 类型
interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function AdminPage({ searchParams }: PageProps) {
  // 获取语言参数，默认为 'zh'
  const lang = (searchParams?.lang as Language) || 'zh';

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showS3Admin, setShowS3Admin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = (password: string) => {
    setAdminPassword(password);
    setIsAdminLoggedIn(true);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* 将语言传递给 Navbar */}
      <SharedNavbar lang={lang} />
      
      {isAdminLoggedIn ? (
        <div className="pt-24">
          {/* Admin navigation */}
          <div className="fixed top-24 left-0 right-0 z-40 h-16 px-12 flex gap-4 bg-[#09090b] border-b border-zinc-800">
            <button
              onClick={() => { setShowDashboard(true); setShowS3Admin(false); }}
              className={`px-4 py-2 rounded ${showDashboard ? 'bg-indigo-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              title="Show Dashboard"
            >
              Dashboard
            </button>
            <button
              onClick={() => { setShowDashboard(false); setShowS3Admin(true); }}
              className={`px-4 py-2 rounded ${showS3Admin ? 'bg-indigo-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              title="Show S3 Admin Panel"
            >
              S3 Admin
            </button>
            <button
              onClick={() => {
                setIsAdminLoggedIn(false);
                setShowDashboard(false);
                setShowS3Admin(false);
              }}
              className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              title="Logout from admin panel"
            >
              Logout
            </button>
          </div>

          <div className="pt-16">
            {showDashboard && (
              <AdminDashboard 
                onClose={() => {
                  setShowDashboard(false);
                  setIsAdminLoggedIn(false);
                }} 
                treasureLinks={[]} 
                onUpdateLinks={() => {}} 
              />
            )}
            {showS3Admin && <S3Admin adminPassword={adminPassword} />}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[80vh]">
          <AdminLoginModal 
            onLogin={handleAdminLogin} 
            onClose={() => {}} // 登录页通常不提供关闭，或根据需要跳转回首页
          />
        </div>
      )}
    </div>
  );
}