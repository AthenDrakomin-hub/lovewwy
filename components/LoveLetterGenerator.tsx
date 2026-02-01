
import React, { useState } from 'react';
import { generateLoveLetter } from '../services/geminiService';
import { LoveLetterConfig } from '../types';

const LoveLetterGenerator: React.FC = () => {
  const [config, setConfig] = useState<LoveLetterConfig>({
    tone: 'romantic',
    occasion: 'Just because',
    recipientName: ''
  });
  const [letter, setLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!config.recipientName) return;
    setIsLoading(true);
    const result = await generateLoveLetter(config);
    setLetter(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-rose-200 max-w-2xl mx-auto my-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full -z-10 opacity-50"></div>
      
      <h3 className="text-2xl font-serif font-bold text-rose-800 mb-6 text-center">Write a Magic Note</h3>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-rose-700 mb-1">To My Dearest...</label>
          <input
            type="text"
            className="w-full p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 outline-none"
            placeholder="Enter name"
            value={config.recipientName}
            onChange={(e) => setConfig({ ...config, recipientName: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-rose-700 mb-1">Occasion</label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 outline-none"
              placeholder="e.g., Anniversary"
              value={config.occasion}
              onChange={(e) => setConfig({ ...config, occasion: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-rose-700 mb-1">Tone</label>
            <select
              className="w-full p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 outline-none bg-white"
              value={config.tone}
              onChange={(e) => setConfig({ ...config, tone: e.target.value as any })}
            >
              <option value="romantic">Romantic</option>
              <option value="poetic">Poetic</option>
              <option value="funny">Funny</option>
              <option value="short">Sweet & Short</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !config.recipientName}
        className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${
          isLoading ? 'bg-rose-300 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white'
        }`}
      >
        {isLoading ? 'Whispering to the stars...' : 'Generate Letter'}
      </button>

      {letter && (
        <div className="mt-8 p-6 bg-rose-50/50 rounded-2xl border border-rose-100 animate-fadeIn">
          <p className="font-romantic text-2xl leading-relaxed text-rose-900 whitespace-pre-wrap">
            {letter}
          </p>
        </div>
      )}
    </div>
  );
};

export default LoveLetterGenerator;
