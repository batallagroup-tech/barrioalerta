import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, MapPin, Siren, Megaphone, Plus } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenSOS: () => void;
  onOpenAlert: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  currentView, 
  setCurrentView, 
  onOpenSOS, 
  onOpenAlert 
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-[100] pb-6 px-6 pointer-events-none">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex-1 flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <button 
            onClick={() => setCurrentView('feed')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-all ${currentView === 'feed' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <LayoutGrid size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
          </button>
          <button 
            onClick={() => setCurrentView('map')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-all ${currentView === 'map' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <MapPin size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Mapa</span>
          </button>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSOS}
          className="w-20 h-20 bg-red-600 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] border-4 border-slate-950 relative overflow-hidden group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <Siren size={28} className="text-white relative z-10 animate-pulse" />
          <span className="text-[9px] font-black text-white relative z-10 mt-0.5">SOS</span>
        </motion.button>
        
        <div className="flex-1 flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <button 
            onClick={() => setCurrentView('notices')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-all ${currentView === 'notices' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <div className="relative">
              <Megaphone size={20} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Avisos</span>
          </button>
          <button 
            onClick={onOpenAlert}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-all text-slate-500 hover:bg-white/5`}
          >
            <Plus size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Alertar</span>
          </button>
        </div>
      </div>
    </nav>
  );
};


