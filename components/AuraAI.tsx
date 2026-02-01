
import React, { useState } from 'react';
import { getMoodVibe, generateMoodImage } from '../services/geminiService';

interface AuraAIProps {
  translations: any;
  isPro?: boolean;
}

const AuraAI: React.FC<AuraAIProps> = ({ translations, isPro }) => {
  const [mood, setMood] = useState('');
  const [vibe, setVibe] = useState('');
  const [moodImg, setMoodImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeMood = async () => {
    if (!mood.trim()) return;
    setIsLoading(true);
    setVibe('');
    setMoodImg(null);
    
    try {
      const textResult = await getMoodVibe(mood);
      setVibe(textResult);
      
      if (isPro) {
        const imgResult = await generateMoodImage(mood);
        setMoodImg(imgResult);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 px-4 bg-zinc-950/40 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="glass p-12 md:p-16 rounded-[56px] border border-white/5 shadow-2xl">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
              <span className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase">Cognitive Sync</span>
            </div>
            <h2 className="text-5xl font-cinematic font-black mb-4">{translations.title}</h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">{translations.desc}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <input
              type="text"
              className="flex-1 bg-white/5 border border-white/10 rounded-3xl px-8 py-5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-zinc-600"
              placeholder={translations.placeholder}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeMood()}
            />
            <button
              onClick={analyzeMood}
              disabled={isLoading}
              className="px-10 py-5 bg-white text-black rounded-3xl font-black hover:bg-indigo-500 hover:text-white disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
              {isLoading ? translations.loading : translations.button}
            </button>
          </div>

          {(vibe || moodImg) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
              <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  <span className="font-black tracking-[0.2em] text-[10px] text-indigo-400 uppercase">{translations.rec}</span>
                </div>
                <p className="text-2xl italic text-zinc-200 leading-relaxed font-serif">
                  "{vibe}"
                </p>
                {isPro && !moodImg && isLoading && (
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-[10px] font-bold text-zinc-600 animate-pulse tracking-widest uppercase">Generating Visual Aura...</p>
                  </div>
                )}
              </div>

              {moodImg && (
                <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl aspect-video group relative">
                  <img src={moodImg} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Mood Vibe" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                     <span className="text-[10px] font-black text-white/50 tracking-[0.5em] uppercase">Personal Aura Visualization</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuraAI;
