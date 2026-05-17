import React from 'react';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, UserSearch, Info, Shield, MapPin, Trash2, Plus, HeartHandshake,
    CheckCircle2, AlertCircle, Smartphone, Mail, IdCard, UserCheck, ChevronRight, Camera as CameraIcon

} from 'lucide-react';
import { UserProfile, UserState } from '../../types';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { MapView } from '../map/MapView';
import { Share } from '@capacitor/share';
import { CATEGORIES, CATEGORY_CONFIG } from '../../constants/categories';

interface ProfileModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  showPublicName: boolean;
  setShowPublicName: (val: boolean) => void;
  preciseLocation: boolean;
  setPreciseLocation: (val: boolean) => void;
  onSavePhoto: (url: string) => void;
  onSave: () => void;
  onClose: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
}
export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  currentUser,
  showPublicName,
  setShowPublicName,
  preciseLocation,
  setPreciseLocation,
  onSavePhoto,
  onSave,
  onClose,
  onLogin,
  onLogout
}) => {

  // Vista de no logueado
  if (isOpen && !currentUser) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="relative bg-slate-900 w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-slate-700 shadow-2xl p-8 flex flex-col items-center gap-6"
          >
            <div className="w-10 h-1 bg-slate-800 rounded-full mx-auto sm:hidden"></div>
            <div className="bg-slate-800 p-5 rounded-2xl">
              <Shield size={40} className="text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-white tracking-tighter">?nete a BarrioAlerta</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Inicia sesi?n para publicar incidentes, chatear con vecinos y personalizar tu perfil.
              </p>
            </div>
            <button
              onClick={() => { onLogin?.(); onClose(); }}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continuar con Google
            </button>
            <button onClick={onClose} className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Cancelar
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="relative bg-slate-900 w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-slate-700 shadow-2xl p-6 sm:p-8 overflow-hidden"
          >
            <div className="flex flex-col h-[75vh] sm:h-auto sm:max-h-[80vh]">
              <div className="w-10 h-1 bg-slate-800 rounded-full mx-auto mb-5 sm:hidden shrink-0"></div>
              
              <div className="flex justify-between items-center mb-5 shrink-0">
                <h2 className="text-lg font-black tracking-tighter text-white flex items-center gap-2">
                  <div className="bg-blue-600/20 p-1 rounded-md">
                    <UserSearch className="text-blue-500" size={18} />
                  </div>
                  Perfil
                </h2>
                <button 
                  onClick={onClose} 
                  className="bg-slate-800/50 p-1.5 rounded-full text-slate-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                {/* Compact User Header */}
                <div className="flex items-center gap-3 bg-slate-800/10 p-3 rounded-xl border border-white/5">
                  <div className="relative group cursor-pointer" onClick={async () => {
                    try {
                      const photo = await Camera.getPhoto({
                        quality: 80,
                        allowEditing: true,
                        resultType: CameraResultType.DataUrl,
                        source: CameraSource.Prompt,
                      });
                      if (photo.dataUrl) onSavePhoto(photo.dataUrl);
                    } catch (e) {
                      console.log('Camera cancelled');
                    }
                  }}>
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="w-12 h-12 rounded-lg bg-slate-800 border border-blue-500/10 object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                        <UserSearch size={20} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <CameraIcon size={14} className="text-white" />

                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-white font-black text-sm truncate">{currentUser?.displayName || 'Vecino'}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Vecino Registrado</span>
                    </div>
                  </div>
                </div>
                
                {/* Privacy Strips */}
                <div className="space-y-1.5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Ajustes</p>
                  <div 
                    className="p-3 flex items-center justify-between cursor-pointer bg-slate-800/5 hover:bg-slate-800/20 rounded-lg border border-white/5 transition-all"
                    onClick={() => setShowPublicName(!showPublicName)}
                  >
                    <p className="text-[11px] font-black text-slate-300">Apodo P?blico</p>
                    <div className={`w-8 h-4.5 ${showPublicName ? 'bg-blue-600' : 'bg-slate-800'} rounded-full flex items-center p-0.5 transition-all`}>
                      <motion.div animate={{ x: showPublicName ? 14 : 0 }} className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div 
                    className="p-3 flex items-center justify-between cursor-pointer bg-slate-800/5 hover:bg-slate-800/20 rounded-lg border border-white/5 transition-all"
                    onClick={() => setPreciseLocation(!preciseLocation)}
                  >
                    <p className="text-[11px] font-black text-slate-300">GPS Exacto</p>
                    <div className={`w-8 h-4.5 ${preciseLocation ? 'bg-blue-600' : 'bg-slate-800'} rounded-full flex items-center p-0.5 transition-all`}>
                      <motion.div animate={{ x: preciseLocation ? 14 : 0 }} className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
              
<div className="pt-4 mt-4 shrink-0 border-t border-white/5 space-y-2">
                {Capacitor.isNativePlatform() && (
                  <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">📱 ¿Tienes amigos con iPhone?</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Compárteles BarrioAlerta, disponible como app web para iOS.</p>
                    <button
                      onClick={async () => {
                        await Share.share({
                          title: "BarrioAlerta",
                          text: "Únete a BarrioAlerta, la app de seguridad vecinal. Disponible para iPhone aquí:",
                          url: "https://batallagroup-tech.github.io/barrioalerta/",
                          dialogTitle: "Compartir BarrioAlerta",
                        });
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black uppercase tracking-widest text-[9px] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Smartphone size={12} />
                      Compartir link para iPhone
                    </button>
                  </div>
                )}
                <button
                  onClick={onSave}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-lg active:scale-95 transition-all"
                >
                  Confirmar Perfil
                </button>
                <button
                  onClick={() => { onLogout?.(); onClose(); }}
                  className="w-full py-3.5 bg-slate-800 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-xl font-black uppercase tracking-[0.1em] text-[10px] active:scale-95 transition-all"
                >
                  Cerrar Sesi?n
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ZonesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    userState: UserState;
    setUserState: (state: UserState) => void;
  }> = ({ isOpen, onClose, onSave, userState, setUserState }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative bg-slate-900 w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-slate-700 shadow-2xl p-6 sm:p-8 overflow-hidden"
            >
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6 sm:hidden"></div>

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
                  <div className="bg-emerald-600/20 p-2 rounded-xl">
                    <MapPin className="text-emerald-500" size={24} />
                  </div>
                  Zonas y Alcance
                </h2>
                <button 
                  onClick={onClose} 
                  className="bg-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar pb-8">
                {/* Vigilance Radius */}
                <div className="bg-slate-800/40 p-5 rounded-[1.5rem] border border-emerald-500/10 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm tracking-tight">Rango de Vigilancia</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Alertas recibidas</p>
                      </div>
                    </div>
                    <span className="text-emerald-500 font-black text-sm">{userState.radiusKm} KM</span>
                  </div>
                  <input 
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={userState.radiusKm}
                    onChange={(e) => setUserState({ ...userState, radiusKm: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Broadcast Radius (SOS) */}
                <div className="bg-slate-800/40 p-5 rounded-[1.5rem] border border-red-500/10 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                        <HeartHandshake size={20} />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm tracking-tight">Radio de Alerta Vecinal</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Alcance de tu SOS</p>
                      </div>
                    </div>
                    <span className="text-red-500 font-black text-sm">{userState.broadcastRadiusKm || 3} KM</span>
                  </div>
                  <input 
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={userState.broadcastRadiusKm || 3}
                    onChange={(e) => setUserState({ ...userState, broadcastRadiusKm: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Monitoreo Remoto</p>
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-black uppercase">Pr?ximamente</span>
                  </div>
                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold">Podr?s vigilar zonas remotas como la casa de un familiar o tu trabajo.</p>
                  </div>
                </div>
              </div>

              {/* Bot?n Guardar */}
              <div className="pt-4 mt-2 border-t border-white/5">
                <button
                  onClick={() => { onSave(); onClose(); }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-lg active:scale-95 transition-all"
                >
                  Guardar Configuraci?n
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };



