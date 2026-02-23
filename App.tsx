
import React, { useState, useEffect, useRef } from 'react';
import { View, Song } from './types';
import MusicPlayer from './components/MusicPlayer';
import Hero from './components/Hero';
import PlayerPage from './components/PlayerPage';
import CommentWall from './components/CommentWall';
import VideoCollection from './components/VideoCollection';
import PrivateCollection from './components/PrivateCollection';
import LonelyIsland from './components/LonelyIsland';
import { supabase } from './lib/supabase';
import { getAllSongs } from './lib/s3';
import { Music, MessageSquare, Video, User, Info, Home, Tent, Share2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bananaCount, setBananaCount] = useState(0);

  const listeningTimerRef = useRef<number>(0);

  // 从S3获取所有歌曲
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const fetchedSongs = await getAllSongs();
        setSongs(fetchedSongs);
        if (fetchedSongs.length > 0 && !currentSong) {
          setCurrentSong(fetchedSongs[0]);
        }
      } catch (error) {
        console.error('Failed to fetch songs from S3:', error);
      }
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from('island_state')
          .select('banana_count')
          .single();
        if (data) setBananaCount(data.banana_count);
      } catch (e) {
        console.warn('Supabase not configured or error fetching stats');
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(async () => {
        listeningTimerRef.current += 1;
        if (listeningTimerRef.current >= 60) {
          try {
            const { error } = await (supabase as any).rpc('increment_banana');
            if (!error) setBananaCount(prev => prev + 1);
          } catch (e) {}
          listeningTimerRef.current = 0;
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSongEnded = async () => {
    try {
      await supabase.from('island_state').update({
        banana_count: bananaCount + 2
      }).match({ id: 1 });
      setBananaCount(prev => prev + 2);
    } catch (e) {}
    nextSong();
  };

  const nextSong = () => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const nextIdx = (idx + 1) % songs.length;
    setCurrentSong(songs[nextIdx]);
  };

  const prevSong = () => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const prevIdx = (idx - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIdx]);
  };

  const selectSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const renderView = () => {
    switch(currentView) {
      case 'home': return <Hero onStartListening={() => setCurrentView('player')} onGoToWall={() => setCurrentView('wall')} />;
      case 'player': return <PlayerPage song={currentSong} isPlaying={isPlaying} onSelectSong={selectSong} onTogglePlay={togglePlay} />;
      case 'wall': return <CommentWall />;
      case 'video': return <VideoCollection />;
      case 'private': return <PrivateCollection />;
      case 'island': return <LonelyIsland onBack={() => setCurrentView('home')} />;
      case 'about':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-light tracking-[0.4em] mb-12 uppercase">人间不值得</motion.h1>
            <div className="max-w-md space-y-6 text-[#8A8FB8] text-sm leading-loose font-light">
              <p>以音为渡，静听人间。</p>
              <p>收录心动过的旋律，留存看过的光影。</p>
              <p>私人收藏，仅此而已。</p>
            </div>
            <button onClick={() => setCurrentView('island')} className="mt-12 group flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition duration-700">
              <Tent size={18} className="text-[#8A8FB8] group-hover:text-white transition" />
              <span className="text-[10px] tracking-[0.3em] text-[#8A8FB8] uppercase">发现孤岛</span>
            </button>
            <p className="mt-24 text-[10px] tracking-widest text-white/10 font-mono">lovewyy.top © 2026</p>
          </div>
        );
      case 'share':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-light tracking-[0.4em] mb-12 uppercase">好物分享</motion.h1>
            <div className="max-w-md space-y-8 text-[#8A8FB8] text-sm leading-loose font-light">
              <div className="space-y-4">
                <p className="text-white/80 mb-4">发现一些有趣的网站</p>
                <a 
                  href="https://ai.hubtoday.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 border border-white/10 rounded-lg hover:border-white/30 transition-all duration-300 hover:bg-white/5 group"
                >
                  <div className="text-white group-hover:text-white/90 transition">AI每日资讯</div>
                  <div className="text-xs text-white/50 mt-1">https://ai.hubtoday.app/</div>
                  <div className="text-xs text-white/30 mt-2">AI发展跟踪</div>
                </a>
                <a 
                  href="https://www.trjyy.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 border border-white/10 rounded-lg hover:border-white/30 transition-all duration-300 hover:bg-white/5 group"
                >
                  <div className="text-white group-hover:text-white/90 transition">唐人街影院</div>
                  <div className="text-xs text-white/50 mt-1">https://www.trjyy.com/</div>
                  <div className="text-xs text-white/30 mt-2">免费观影</div>
                </a>
              </div>
              <p className="text-white/40 text-xs mt-8">更多好物分享，敬请期待...</p>
            </div>
            <button onClick={() => setCurrentView('home')} className="mt-12 group flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition duration-700">
              <Home size={18} className="text-[#8A8FB8] group-hover:text-white transition" />
              <span className="text-[10px] tracking-[0.3em] text-[#8A8FB8] uppercase">返回首页</span>
            </button>
            <p className="mt-24 text-[10px] tracking-widest text-white/10 font-mono">lovewyy.top © 2026</p>
          </div>
        );
      default: return <Hero onStartListening={() => setCurrentView('player')} onGoToWall={() => setCurrentView('wall')} />;
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F0F0F0] selection:bg-white selection:text-black min-h-screen">
      {/* Top Navigation - Desktop */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 pointer-events-none hidden lg:flex">
        <div className="flex items-center gap-4 pointer-events-auto cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#121212] to-[#222] border border-white/5 flex items-center justify-center shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
          </div>
          <span className="text-[10px] font-medium tracking-[0.4em] uppercase">人间不值得</span>
        </div>

        <div className="flex items-center gap-6 md:gap-10 pointer-events-auto">
          <NavItem active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home size={18} />} label="首页" />
          <NavItem active={currentView === 'player'} onClick={() => setCurrentView('player')} icon={<Music size={18} />} label="音乐" />
          <NavItem active={currentView === 'wall'} onClick={() => setCurrentView('wall')} icon={<MessageSquare size={18} />} label="热评" />
          <NavItem active={currentView === 'video'} onClick={() => setCurrentView('video')} icon={<Video size={18} />} label="影像" />
          <NavItem active={currentView === 'private'} onClick={() => setCurrentView('private')} icon={<User size={18} />} label="私藏" />
          <NavItem active={currentView === 'about'} onClick={() => setCurrentView('about')} icon={<Info size={18} />} label="关于" />
          <NavItem active={currentView === 'share'} onClick={() => setCurrentView('share')} icon={<Share2 size={18} />} label="好物分享" />
        </div>
      </nav>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-around pointer-events-auto lg:hidden">
        <NavItem active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home size={20} />} label="首页" mobile />
        <NavItem active={currentView === 'player'} onClick={() => setCurrentView('player')} icon={<Music size={20} />} label="音乐" mobile />
        <NavItem active={currentView === 'wall'} onClick={() => setCurrentView('wall')} icon={<MessageSquare size={20} />} label="热评" mobile />
        <NavItem active={currentView === 'video'} onClick={() => setCurrentView('video')} icon={<Video size={20} />} label="影像" mobile />
        <NavItem active={currentView === 'private'} onClick={() => setCurrentView('private')} icon={<User size={20} />} label="私藏" mobile />
        <NavItem active={currentView === 'about'} onClick={() => setCurrentView('about')} icon={<Info size={20} />} label="关于" mobile />
      </nav>

      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <MusicPlayer 
        songs={songs}
        currentSong={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={handleSongEnded}
        onPrev={prevSong}
        onExpand={() => setCurrentView('player')}
        onSelectSong={selectSong}
      />

      {/* Global Aesthetics: Cinematic Atmospheric Lighting */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-[#8A8FB8]/5 blur-[120px] rounded-full opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-white/5 blur-[150px] rounded-full opacity-20" />
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, mobile = false }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; mobile?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center ${mobile ? 'flex-1 h-full' : 'gap-1.5'} group transition-all duration-500 ${active ? 'text-white' : 'text-[#8A8FB8]/60'}`}
  >
    <div className={`transition-all duration-500 ${active ? (mobile ? 'scale-110' : 'scale-110 translate-y-[-2px]') : 'group-hover:text-white/80'}`}>
      {icon}
    </div>
    <span className={`${mobile ? 'text-[8px] mt-1' : 'text-[9px]'} font-light tracking-[0.2em] uppercase transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0 scale-95'}`}>
      {label}
    </span>
  </button>
);

export default App;
