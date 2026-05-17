import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const PWA_WELCOME_KEY = "barrioalerta_pwa_welcome_shown";

export default function PWAWelcome() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const shown = localStorage.getItem(PWA_WELCOME_KEY);
    if (!shown) setShow(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(PWA_WELCOME_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-sm flex flex-col items-center gap-6">
        <div className="bg-blue-600/20 p-6 rounded-3xl border border-blue-500/30">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tighter">¡Bienvenido!</h1>
          <p className="text-blue-400 font-black text-sm uppercase tracking-widest">BarrioAlerta</p>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          Sabemos que esta no es la experiencia ideal. Estamos trabajando para llevar BarrioAlerta a más tiendas y dispositivos.
        </p>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2 w-full">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">💡 Tip para iPhone</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Para una mejor experiencia, agrega esta página a tu pantalla de inicio. Toca el botón <span className="text-blue-400 font-bold">Compartir</span> y selecciona <span className="text-blue-400 font-bold">"Agregar a pantalla de inicio"</span>.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95"
        >
          Entendido, continuar
        </button>
      </div>
    </div>
  );
}
