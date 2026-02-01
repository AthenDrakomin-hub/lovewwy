
import React, { useState } from 'react';

interface AdminLoginModalProps {
  onLogin: (password: string) => void;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple demo password
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md glass p-8 rounded-[40px] border border-indigo-500/30 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl mx-auto mb-4 aura-glow flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-cinematic font-bold">Admin Portal</h2>
          <p className="text-zinc-500 text-sm mt-2">Enter credentials to manage Aura Stream</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              className={`w-full bg-zinc-900/50 border ${error ? 'border-red-500' : 'border-zinc-700'} rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center tracking-widest`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs text-center mt-2 font-bold uppercase tracking-widest">Invalid Access Code</p>}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            AUTHORIZE ACCESS
          </button>
        </form>

        <button 
          onClick={onClose}
          className="w-full mt-4 py-2 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AdminLoginModal;
