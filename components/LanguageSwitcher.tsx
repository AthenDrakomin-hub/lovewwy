
import React, { useState, useEffect } from 'react';
import { Language } from '../constants/translations';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLangChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'zh', label: '简', flag: '🇨🇳' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'jp', label: 'JP', flag: '🇯🇵' },
    { code: 'kr', label: 'KR', flag: '🇰🇷' },
  ];

  const currentLabel = languages.find(l => l.code === currentLang)?.label || 'EN';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 glass rounded-full hover:border-indigo-500/50 transition-all active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className="text-[10px] font-black tracking-widest text-white">{currentLabel}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full right-0 mt-2 w-32 glass rounded-2xl overflow-hidden border border-indigo-500/20 shadow-2xl animate-fadeIn">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  onLangChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-[10px] font-bold flex items-center justify-between hover:bg-indigo-600/20 transition-colors ${currentLang === lang.code ? 'text-indigo-400 bg-indigo-600/10' : 'text-zinc-400'}`}
              >
                <span>{lang.label}</span>
                <span>{lang.flag}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
