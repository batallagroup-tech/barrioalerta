import React from 'react';
import { Shield, Navigation, User } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenZones: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onOpenZones, 
  onOpenProfile 
}) => {
  return (
    <header className="sticky top-0 z-50 px-6 pt-12 pb-4 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="bg-red-600 p-2.5 rounded-[1.25rem] shadow-lg shadow-red-900/40">
          <Shield size={24} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white leading-none">BarrioAlerta</h1>
          <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mt-0.5">Seguridad Vecinal</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 pointer-events-auto">
        <button 
          onClick={onOpenZones}
          className="bg-slate-900/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl"
        >
          <Navigation size={20} />
        </button>
        <button 
          onClick={onOpenProfile}
          className="bg-slate-900/40 backdrop-blur-md p-0.5 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl overflow-hidden"
        >
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" className="w-9 h-9 rounded-[0.85rem] object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 flex items-center justify-center">
              <User size={20} />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
