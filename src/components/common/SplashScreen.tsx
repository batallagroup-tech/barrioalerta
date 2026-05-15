import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="relative bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <Shield size={64} className="text-blue-500" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Barrio<span className="text-blue-500">Alerta</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            Seguridad Comunitaria
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Desarrollado por
        </p>
        <p className="text-white text-sm font-black tracking-tight mt-1">
          Batalla Group
        </p>
      </motion.div>
    </motion.div>
  );
};
