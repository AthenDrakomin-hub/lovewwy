import React, { useState } from 'react';
import TreasureBox from '../components/TreasureBox';
import SharedNavbar from '../components/SharedNavbar';
import { TRANSLATIONS, Language } from '../constants/translations';

interface TreasureBoxPageProps {
  lang?: Language;
}

const TreasureBoxPage: React.FC<TreasureBoxPageProps> = ({ lang = 'zh' }) => {
  const t = TRANSLATIONS[lang];
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [treasureLinks, setTreasureLinks] = useState([
    { id: 'l1', title: 'Framer Motion', url: 'https://framer.com/motion', icon: '🎨', description: 'Production-ready animations for React.', category: 'Creative' },
    { id: 'l2', title: 'Supabase', url: 'https://supabase.com', icon: '⚡', description: 'The open source Firebase alternative.', category: 'Dev Resources' },
    { id: 'l3', title: 'Raycast Store', url: 'https://www.raycast.com/store', icon: '🚀', description: 'Next level productivity for Mac.', category: 'Tools' },
    { id: 'l4', title: 'Figma', url: 'https://figma.com', icon: '🎨', description: 'Collaborative web-based interface design tool.', category: 'Creative' }
  ]);

  const handleSubscribe = () => {
    setIsSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <SharedNavbar lang={lang} />
      <div className="pt-24 border-t border-zinc-900 bg-zinc-950/80">
        <TreasureBox 
          translations={t.treasure} 
          isSubscribed={isSubscribed} 
          onSubscribe={handleSubscribe} 
          links={treasureLinks} 
        />
      </div>
    </div>
  );
};

export default TreasureBoxPage;