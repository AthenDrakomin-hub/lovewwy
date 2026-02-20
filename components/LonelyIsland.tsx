
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, UtensilsCrossed, Sparkles, Home as HomeIcon, Palmtree, Sofa } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Minion, IslandState } from '../types';

interface Banana {
  id: number;
  x: number;
  y: number;
}

const LonelyIsland: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [islandState, setIslandState] = useState<IslandState | null>(null);
  const [minions, setMinions] = useState<Minion[]>([]);
  const [activeBananas, setActiveBananas] = useState<Banana[]>([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [breedingTask, setBreedingTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const islandRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: stateData } = await supabase.from('island_state').select('*').single();
      if (!stateData) {
        await supabase.from('island_state').insert([{ banana_count: 10 }]);
        return fetchData();
      }
      setIslandState(stateData as IslandState);

      const { data: minionData } = await supabase.from('minions').select('*').order('birth_time', { ascending: true });
      if (!minionData || minionData.length === 0) {
        await supabase.from('minions').insert([{ growth_value: 0, is_adult: false }]);
        return fetchData();
      }

      const uiMinions = (minionData as any[]).map((m) => ({
        ...m,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40,
        isEating: false,
        isHappy: false
      }));
      setMinions(uiMinions);

      const { data: taskData } = await supabase
        .from('breeding_tasks')
        .select('*')
        .eq('is_completed', false)
        .single();
      
      setBreedingTask(taskData);
    } catch (e) {
      console.warn('Persistence disconnected. UI will reset on refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!islandRef.current) return;
    const rect = islandRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinions(prev => prev.map(m => {
        if (m.isEating) return m;
        return {
          ...m,
          x: Math.max(25, Math.min(75, m.x + (Math.random() - 0.5) * 10)),
          y: Math.max(25, Math.min(75, m.y + (Math.random() - 0.5) * 10)),
        };
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleFeed = async () => {
    if (!islandState || islandState.banana_count < 1) return;

    const bX = 35 + Math.random() * 30;
    const bY = 35 + Math.random() * 30;
    const newBanana = { id: Date.now(), x: bX, y: bY };
    setActiveBananas(prev => [...prev, newBanana]);

    setIslandState(prev => prev ? { ...prev, banana_count: prev.banana_count - 1 } : null);
    try {
      await supabase.from('island_state').update({ banana_count: islandState.banana_count - 1 }).match({ id: 1 });
    } catch (e) {}

    setTimeout(() => {
      setMinions(prev => {
        const hungryIdx = prev.findIndex(m => !m.isEating);
        if (hungryIdx === -1) return prev;
        const nextMinions = [...prev];
        nextMinions[hungryIdx] = { ...nextMinions[hungryIdx], x: bX, y: bY, isEating: true };
        return nextMinions;
      });

      setTimeout(async () => {
        setActiveBananas(prev => prev.filter(b => b.id !== newBanana.id));
        setMinions(prev => prev.map(m => {
          if (m.isEating && m.x === bX) {
            const newVal = m.growth_value + 1;
            const adult = newVal >= 20;
            try { supabase.from('minions').update({ growth_value: newVal, is_adult: adult }).eq('id', m.id); } catch (e) {}
            return { ...m, isEating: false, isHappy: true, growth_value: newVal, is_adult: adult };
          }
          return m;
        }));
        setTimeout(() => setMinions(prev => prev.map(m => ({ ...m, isHappy: false }))), 2000);
      }, 1500);
    }, 600);
  };

  const handleBreed = async () => {
    const adults = minions.filter(m => m.is_adult);
    if (!islandState || islandState.banana_count < 50 || adults.length < 2) return;

    const finish = new Date();
    finish.setHours(finish.getHours() + 24);

    try {
      const { data: task, error } = await supabase.from('breeding_tasks').insert([{
        finish_time: finish.toISOString()
      }]).select().single();

      if (!error) {
        setBreedingTask(task);
        setIslandState(prev => prev ? { ...prev, banana_count: prev.banana_count - 50 } : null);
        await supabase.from('island_state').update({ banana_count: islandState.banana_count - 50 }).match({ id: 1 });
      }
    } catch (e) {}
  };

  useEffect(() => {
    const checkTask = async () => {
      if (breedingTask && new Date(breedingTask.finish_time) <= new Date()) {
        try {
          await supabase.from('breeding_tasks').update({ is_completed: true }).eq('id', breedingTask.id);
          await supabase.from('minions').insert([{ growth_value: 0, is_adult: false }]);
          setBreedingTask(null);
          fetchData();
        } catch (e) {}
      }
    };
    const interval = setInterval(checkTask, 60000);
    return () => clearInterval(interval);
  }, [breedingTask]);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border border-white/5 border-t-white/30 rounded-full animate-spin" />
      <p className="mt-8 text-[10px] tracking-[0.5em] text-[#8A8FB8]/60 uppercase font-light">寻觅专属孤岛...</p>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] flex flex-col items-center justify-center">
      {/* Background Starry Sky */}
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0D]/50 to-black pointer-events-none" />

      {/* Narrative Header */}
      <div className="fixed top-24 text-center pointer-events-none select-none z-10">
        <h2 className="text-[11px] text-white/20 tracking-[1em] uppercase font-light mb-2">专属孤岛</h2>
        <div className="w-12 h-px bg-white/5 mx-auto" />
      </div>

      <div className="fixed top-20 left-6 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-[#8A8FB8]/40 hover:text-white transition duration-700 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] tracking-[0.4em] uppercase font-light">返回人间</span>
        </button>
      </div>

      <div className="fixed top-24 right-8 z-20 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center mb-2 shadow-inner">
            <span className="text-xl filter grayscale contrast-75 brightness-75">🍌</span>
          </div>
          <span className="text-[10px] font-mono text-[#8A8FB8]/40 uppercase tracking-widest">{islandState?.banana_count}</span>
        </div>
        
        <button 
          onClick={handleFeed}
          disabled={!islandState || islandState.banana_count < 1}
          className="w-14 h-14 rounded-full border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-700 flex items-center justify-center group disabled:opacity-5"
        >
          <UtensilsCrossed size={16} className="text-[#8A8FB8]/40 group-hover:text-white transition duration-700" />
        </button>

        {minions.filter(m => m.is_adult).length >= 2 && (
          <button 
            onClick={handleBreed}
            disabled={!breedingTask && (islandState?.banana_count || 0) < 50}
            className="w-14 h-14 rounded-full border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] transition-all duration-700 flex items-center justify-center group disabled:opacity-5"
          >
            {breedingTask ? (
              <div className="w-5 h-5 border border-white/5 border-t-white/40 rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} className="text-[#8A8FB8]/40 group-hover:text-white transition duration-700" />
            )}
          </button>
        )}
      </div>

      <div className="fixed bottom-24 left-8 z-20 text-left space-y-2 pointer-events-none opacity-40">
        <p className="text-[9px] tracking-[0.3em] text-[#8A8FB8] font-light uppercase">
          陪伴者: {minions.length} / {islandState?.max_minions}
        </p>
        <p className="text-[9px] tracking-[0.3em] text-[#8A8FB8] font-light uppercase">
          岛屿等级: LV.{islandState?.island_level}
        </p>
      </div>

      <motion.div 
        ref={islandRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-[85vw] max-w-[500px] aspect-square flex items-center justify-center"
      >
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="relative w-full h-full">
          {/* Main Island Visual */}
          <div className="absolute inset-8 rounded-full bg-[#1A1A1A] shadow-[0_50px_120px_rgba(0,0,0,0.8)] border-b-[16px] border-black/60 overflow-hidden">
             <div className="absolute top-[20%] left-[10%] w-[70%] h-[50%] bg-gradient-to-br from-[#2A2A2A] to-transparent blur-3xl opacity-20 rotate-12" />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03]" />
          </div>

          {/* Environmental Decoration */}
          <AnimatePresence>
            {islandState && islandState.island_level >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} className="absolute top-[18%] right-[25%] pointer-events-none">
                <Palmtree size={56} className="text-white" />
              </motion.div>
            )}
            {islandState && islandState.island_level >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} className="absolute bottom-[28%] left-[22%] pointer-events-none">
                <HomeIcon size={44} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Objects */}
          <AnimatePresence>
            {activeBananas.map(b => (
              <motion.div key={b.id} initial={{ opacity: 0, y: -150 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.8, type: "spring" }} className="absolute text-2xl filter grayscale brightness-50" style={{ left: `${b.x}%`, top: `${b.y}%` }}>🍌</motion.div>
            ))}
          </AnimatePresence>

          {minions.map((m) => {
            const eyeDX = (mousePos.x - m.x) / 14;
            const eyeDY = (mousePos.y - m.y) / 14;
            return (
              <motion.div
                key={m.id}
                animate={{ left: `${m.x}%`, top: `${m.y}%`, rotate: m.isHappy ? [0, 10, -10, 0] : 0, scale: m.is_adult ? 1 : 0.7 }}
                transition={{ duration: m.isEating ? 1 : 8, ease: "easeInOut" }}
                className="absolute w-12 h-16 -ml-6 -mt-8"
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 blur-md rounded-full" />
                <div className={`relative w-full h-full bg-[#C4AC51] rounded-t-full rounded-b-2xl overflow-hidden border border-black/10 transition-shadow duration-1000 ${m.isHappy ? 'shadow-[0_0_25px_rgba(212,185,88,0.2)]' : ''}`}>
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#E0E0E0] rounded-full flex items-center justify-center overflow-hidden">
                     <motion.div animate={{ x: m.isEating ? 0 : Math.max(-3, Math.min(3, eyeDX)), y: m.isEating ? 0 : Math.max(-3, Math.min(3, eyeDY)) }} className="relative w-2.5 h-2.5 bg-black rounded-full" />
                   </div>
                   <div className="absolute top-[22px] w-full h-1.5 bg-[#1A1A1A]" />
                   <div className="absolute bottom-0 w-full h-[35%] bg-[#243142]" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
      
      <div className="mt-20 text-center max-w-sm pointer-events-none select-none z-10 opacity-20">
        <p className="text-[9px] text-[#8A8FB8] tracking-[0.6em] uppercase font-light leading-loose">
          孤独世界里的专属治愈<br/>
          唯有此岛，长存静谧
        </p>
      </div>
    </div>
  );
};

export default LonelyIsland;
