import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, X, PhoneCall, ChevronRight, Phone, Siren, HeartHandshake, CheckCircle2, Plus 
} from 'lucide-react';
import { UserState, Location } from '../../types';
import { getLocalEmergencyNumbers } from '../../utils/emergencyNumbers';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  userState: UserState;
  sosCountdown: number | null;
  setSosCountdown: (c: number | null) => void;
  activeTab: string | null;
  setActiveTab: (t: string | null) => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  userState,
  sosCountdown,
  setSosCountdown,
  activeTab,
  setActiveTab
}) => {
  const localNumbers = getLocalEmergencyNumbers(userState.location);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-x-0 bottom-0 z-[101] bg-slate-900 p-4 sm:p-6 rounded-t-[2rem] sm:rounded-t-[2.5rem] border-t border-red-500 border-x border-x-red-500/20 shadow-[0_-15px_60px_-15px_rgba(239,68,68,0.5)] flex flex-col max-h-[92vh]">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="overflow-y-auto no-scrollbar flex-1 min-h-0"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-red-500 flex items-center gap-2">
                <ShieldAlert size={26} /> EMERGENCIA
              </h2>
              <button 
                onClick={onClose} 
                className="bg-slate-800 p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed text-center font-medium opacity-80">
                Usa esta funcion unicamente en situaciones de riesgo inminente.
              </p>
              
              <div className="space-y-2 sm:space-y-3">
                {/* Police Accordion */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setActiveTab(activeTab === 'police' ? null : 'police')}
                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-blue-500/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                        <PhoneCall className="text-blue-400" size={22} />
                      </div>
                      <span className="font-bold text-white text-base sm:text-lg">Policia y Municipal</span>
                    </div>
                    <ChevronRight className={`text-slate-400 transition-transform ${activeTab === 'police' ? 'rotate-90' : ''}`} size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {activeTab === 'police' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-900/50"
                      >
                        <div className="p-3 sm:p-4 flex flex-col gap-2">
                          <div className="grid grid-cols-2 gap-2 mb-1">
                            <a href="tel:911" className="flex flex-col items-center justify-center bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all text-center">
                              <div className="text-white font-black text-[9px] sm:text-xs">EMERGENCIAS</div>
                              <div className="text-red-500 font-black text-base sm:text-lg">911</div>
                            </a>
                            <a href="tel:089" className="flex flex-col items-center justify-center bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all text-center">
                              <div className="text-white font-black text-[9px] sm:text-xs">DENUNCIA</div>
                              <div className="text-blue-400 font-black text-base sm:text-lg">089</div>
                            </a>
                          </div>

                          <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 mb-1">Autoridades locales</div>
                          {localNumbers.map((muni, idx) => (
                            <div key={muni.name} className={`bg-slate-800 p-2.5 sm:p-3 rounded-xl border ${idx === 0 ? 'border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-slate-700'} space-y-2 mb-1`}>
                              <div className="flex justify-between items-center">
                                <div className="text-white font-bold text-[11px] sm:text-xs uppercase tracking-tighter">{muni.name} {idx === 0 && '📍'}</div>
                                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{muni.distance.toFixed(1)} km</div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <a href={`tel:${muni.police}`} className="flex items-center justify-center gap-1.5 bg-slate-950/50 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold text-blue-400 border border-blue-500/10">
                                  <Phone size={9} /> Policia
                                </a>
                                <a href={`tel:${muni.ambulance}`} className="flex items-center justify-center gap-1.5 bg-slate-950/50 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold text-red-500 border border-red-500/10">
                                  <Siren size={9} /> Medico
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add other accordions here... */}
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-slate-800 shrink-0">
              {sosCountdown === null ? (
                <button 
                  onClick={() => setSosCountdown(3)}
                  className="w-full py-4 sm:py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl sm:rounded-3xl shadow-xl shadow-red-900/50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-base sm:text-lg">Alerta Vecinal (SOS)</span>
                  <span className="text-[9px] sm:text-[10px] text-red-200 uppercase tracking-widest font-normal">Notificara a todos en {userState.broadcastRadiusKm || 3}km</span>
                </button>
              ) : (
                <button 
                  onClick={() => setSosCountdown(null)}
                  className="w-full py-4 sm:py-5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl sm:rounded-3xl shadow-xl shadow-orange-900/50 transition-all animate-pulse flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-base sm:text-lg">Lanzando en {sosCountdown}...</span>
                  <span className="text-[9px] sm:text-[10px] text-orange-200 uppercase tracking-widest font-normal italic">Toca para cancelar</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};






