import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLoginModal from '../components/AdminLoginModal';
import AdminDashboard from '../components/AdminDashboard';
import S3Admin from '../components/S3Admin';
import SharedNavbar from '../components/SharedNavbar';

interface AdminPageProps {}

const AdminPage: React.FC<AdminPageProps> = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showS3Admin, setShowS3Admin] = useState(false);

  const handleAdminLogin = (password: string) => {
    setIsAdminLoggedIn(true);
    setShowLogin(false);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <SharedNavbar />
      {isAdminLoggedIn ? (
        <div className="pt-24">
          {/* Admin navigation */}
          <div className="fixed top-24 left-0 right-0 z-40 h-16 px-12 flex gap-4 bg-[#09090b] border-b border-zinc-800">
            <button
              onClick={() => { setShowDashboard(true); setShowS3Admin(false); }}
              className={`px-4 py-2 rounded ${showDashboard ? 'bg-indigo-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setShowDashboard(false); setShowS3Admin(true); }}
              className={`px-4 py-2 rounded ${showS3Admin ? 'bg-indigo-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              S3 Admin
            </button>
            <button
              onClick={() => {
                setIsAdminLoggedIn(false);
                setShowLogin(true);
                setShowDashboard(false);
                setShowS3Admin(false);
              }}
              className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
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
                  setShowLogin(true);
                }} 
                treasureLinks={[]} 
                onUpdateLinks={() => {}} 
              />
            )}
            {showS3Admin && <S3Admin />}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[80vh]">
          <AdminLoginModal 
            onLogin={handleAdminLogin} 
            onClose={() => setShowLogin(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default AdminPage;