
import React, { useState } from 'react';
import { MediaItem, LinkItem } from '../types';
import { VIDEOS, MUSIC } from '../constants';

interface AdminDashboardProps {
  onClose: () => void;
  treasureLinks: LinkItem[];
  onUpdateLinks: (links: LinkItem[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, treasureLinks, onUpdateLinks }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'music' | 'treasure' | 'insights' | 'settings'>('insights');
  const [items, setItems] = useState<{videos: MediaItem[], music: MediaItem[]}>({
    videos: VIDEOS,
    music: MUSIC
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MediaItem & LinkItem>>({
    type: 'video', title: '', artist: '', category: '', tags: [], url: '', thumbnail: '', duration: '', icon: '💎', description: ''
  });

  const handleDelete = (id: string, type: string) => {
    if (confirm('Confirm deletion?')) {
      if (type === 'video') setItems(p => ({ ...p, videos: p.videos.filter(v => v.id !== id) }));
      else if (type === 'audio') setItems(p => ({ ...p, music: p.music.filter(m => m.id !== id) }));
      else if (type === 'link') onUpdateLinks(treasureLinks.filter(l => l.id !== id));
    }
  };

  const handleAdd = () => {
    const id = Math.random().toString(36).substr(2, 9);
    if (activeTab === 'treasure') {
      onUpdateLinks([{ id, title: newItem.title || 'New', url: newItem.url || '#', icon: newItem.icon || '🔗', description: newItem.description || '', category: newItem.category || 'Tools' }, ...treasureLinks]);
    } else {
      const itemToAdd = { ...newItem, id } as MediaItem;
      if (itemToAdd.type === 'video') setItems(p => ({ ...p, videos: [itemToAdd, ...p.videos] }));
      else setItems(p => ({ ...p, music: [itemToAdd, ...p.music] }));
    }
    setIsAdding(false);
    setNewItem({ type: 'video', title: '', artist: '', category: '', tags: [], url: '', thumbnail: '', duration: '', icon: '💎', description: '' });
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#09090b] overflow-hidden flex flex-col animate-fadeIn">
      <header className="h-20 px-8 flex items-center justify-between border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-xl font-cinematic font-black tracking-tighter">AURA CORE CONTROL</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {activeTab !== 'insights' && (
            <button onClick={() => setIsAdding(true)} className="bg-indigo-600 px-6 py-2 rounded-full text-[10px] font-black tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2">
              <span>ADD ENTRY</span>
            </button>
          )}
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all" aria-label="Close panel">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-zinc-800 p-8 flex flex-col gap-3 bg-zinc-950/50">
          <div className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase mb-4 px-4">Management</div>
          {[
            { id: 'insights', label: 'Pro Insights', icon: '📊' },
            { id: 'videos', label: 'Visual Library', icon: '🎬' },
            { id: 'music', label: 'Music Archive', icon: '🎵' },
            { id: 'treasure', label: 'Vault Links', icon: '💎' },
            { id: 'settings', label: 'System Config', icon: '⚙️' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-900'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-12 bg-zinc-950/20">
          {activeTab === 'insights' ? (
            <div className="animate-fadeIn space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass p-8 rounded-[32px] border border-white/5">
                     <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2">Total Subscriptions</p>
                     <p className="text-5xl font-cinematic font-black">1,284</p>
                     <p className="text-green-500 text-xs font-bold mt-2">↑ 12.4% this month</p>
                  </div>
                  <div className="glass p-8 rounded-[32px] border border-white/5">
                     <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2">Pro Revenue (Est.)</p>
                     <p className="text-5xl font-cinematic font-black">$12.5K</p>
                     <p className="text-indigo-400 text-xs font-bold mt-2">Active Billing Cycles</p>
                  </div>
                  <div className="glass p-8 rounded-[32px] border border-white/5">
                     <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2">Vault Engagement</p>
                     <p className="text-5xl font-cinematic font-black">89.2%</p>
                     <p className="text-amber-500 text-xs font-bold mt-2">Returning Members</p>
                  </div>
               </div>
               
               <div className="glass p-10 rounded-[40px] border border-white/5 h-96 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                     <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M7 14l4-4 4 4 4-4"/></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Live Traffic Map</h3>
                  <p className="text-zinc-500 text-sm max-w-sm">Regional access density visualization is currently processing. Data updates every 60 seconds.</p>
               </div>
            </div>
          ) : activeTab === 'treasure' ? (
            <div className="animate-fadeIn">
               <div className="flex justify-between items-end mb-10">
                  <h2 className="text-4xl font-cinematic font-black">Vault Management</h2>
                  <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{treasureLinks.length} Items Indexed</span>
               </div>
               <div className="grid grid-cols-1 gap-4">
                 {treasureLinks.map(link => (
                    <div key={link.id} className="glass p-6 rounded-[32px] border border-zinc-900 flex items-center gap-8 group hover:border-amber-500/20 transition-all">
                      <div className="text-5xl w-20 h-20 flex items-center justify-center bg-zinc-900 rounded-2xl group-hover:scale-110 transition-transform">{link.icon}</div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full uppercase font-black tracking-widest mb-2 inline-block">{link.category}</span>
                        <h3 className="text-xl font-bold text-white truncate">{link.title}</h3>
                        <p className="text-zinc-500 text-xs truncate font-mono opacity-50">{link.url}</p>
                      </div>
                      <button onClick={() => handleDelete(link.id, 'link')} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all">REMOVE</button>
                    </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-cinematic font-black mb-10 capitalize">{activeTab} Controls</h2>
              <div className="grid grid-cols-1 gap-4">
                {(activeTab === 'videos' ? items.videos : items.music).map(item => (
                  <div key={item.id} className="glass p-6 rounded-[32px] border border-zinc-900 flex items-center gap-8 group hover:border-indigo-500/20">
                    <img 
                      src={item.thumbnail} 
                      className="w-20 h-20 object-cover rounded-2xl shadow-xl" 
                      alt={item.type === 'video' ? `Thumbnail for video "${item.title}" by ${item.artist}` : `Album art for "${item.title}" by ${item.artist}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate">{item.title}</h3>
                      <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest opacity-60">{item.artist}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id, item.type === 'video' ? 'video' : 'audio')} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-black hover:bg-red-500 transition-all">DELETE</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsAdding(false)}></div>
          <div className="relative z-10 w-full max-w-2xl glass p-12 rounded-[56px] border border-indigo-500/30">
            <h3 className="text-3xl font-cinematic font-black mb-8">Add to {activeTab === 'treasure' ? 'Vault' : 'Archive'}</h3>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {activeTab === 'treasure' ? (
                <>
                  <div className="space-y-2 col-span-2">
                    <label htmlFor="icon-input" className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Icon / Emoji</label>
                    <input id="icon-input" type="text" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm" value={newItem.icon} onChange={e => setNewItem({...newItem, icon: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="title-input" className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Title</label>
                    <input id="title-input" type="text" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category-input" className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Category</label>
                    <input id="category-input" type="text" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label htmlFor="url-input" className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">URL</label>
                    <input id="url-input" type="text" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm" value={newItem.url} onChange={e => setNewItem({...newItem, url: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label htmlFor="description-textarea" className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Description</label>
                    <textarea id="description-textarea" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm h-32" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2 col-span-2">
                    <label htmlFor="content-title-input" className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Content Title</label>
                    <input id="content-title-input" type="text" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-zinc-900 rounded-2xl font-black uppercase text-xs tracking-widest">Discard</button>
              <button onClick={handleAdd} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20">Deploy Content</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
