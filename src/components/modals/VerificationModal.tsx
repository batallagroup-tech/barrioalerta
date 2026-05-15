import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle2, ChevronRight, Smartphone, Mail, IdCard, 
  UserCheck, Camera, Shield, AlertCircle, Loader2
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  type: 'email' | 'phone' | 'id' | 'facial' | null;
  onClose: () => void;
  onComplete: (type: 'email' | 'phone' | 'id' | 'facial') => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  type,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [otpDigits, setOtpDigits] = useState(['','','','','','']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'facial' && step === 2 && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [type, step, isOpen]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleAction = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    
    if (type === 'email' || type === 'phone') {
      if (step === 1) setStep(2);
      else {
        onComplete(type);
        onClose();
        setStep(1);
      }
    } else if (type === 'id') {
       if (step === 1) setStep(2);
       else {
         onComplete(type);
         onClose();
         setStep(1);
       }
    } else if (type === 'facial') {
       if (step === 1) setStep(2);
       else {
         onComplete(type);
         onClose();
         setStep(1);
       }
    }
  };

  const config = {
    email: {
      title: 'Verificar Correo',
      icon: <Mail className="text-blue-500" size={32} />,
      steps: [
        { title: 'Enviar Código', desc: 'Enviaremos un código a tu correo registrado.' },
        { title: 'Ingresar Código', desc: 'Revisa tu bandeja de entrada (y spam).' }
      ]
    },
    phone: {
      title: 'Verificar Teléfono',
      icon: <Smartphone className="text-green-500" size={32} />,
      steps: [
        { title: 'Número Móvil', desc: 'Ingresa tu número para recibir un SMS.' },
        { title: 'Código SMS', desc: 'Ingresa el código de 6 dígitos enviado.' }
      ]
    },
    id: {
      title: 'Validar Identidad (INE)',
      icon: <IdCard className="text-purple-500" size={32} />,
      steps: [
        { title: 'Frente del INE', desc: 'Captura una foto clara del frente de tu identificación.' },
        { title: 'Reverso del INE', desc: 'Captura el reverso donde aparece el código QR/BC.' }
      ]
    },
    facial: {
      title: 'Escaneo Biométrico',
      icon: <UserCheck className="text-emerald-500" size={32} />,
      steps: [
        { title: 'Instrucciones', desc: 'Asegúrate de estar en un lugar iluminado y sin lentes.' },
        { title: 'Escaneando...', desc: 'Mantén tu rostro dentro del círculo.' }
      ]
    }
  };

  if (!type) return null;
  const currentConfig = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="bg-slate-800/50 p-4 rounded-3xl">
                  {currentConfig.icon}
                </div>
                <button onClick={onClose} className="bg-slate-800 p-2 rounded-full text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">{currentConfig.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {currentConfig.steps[step - 1].desc}
                </p>
              </div>

              <div className="relative">
                {type === 'facial' && step === 2 ? (
                  <div className="aspect-square rounded-full border-4 border-dashed border-emerald-500/30 overflow-hidden relative group">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover grayscale brightness-125"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-64 border-2 border-emerald-500/50 rounded-[4rem] shadow-[0_0_50px_rgba(16,185,129,0.2)]"></div>
                    </div>
                    {loading && (
                      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <Loader2 size={40} className="text-white animate-spin" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Analizando Rostro...</span>
                      </div>
                    )}
                  </div>
                ) : type === 'id' && step === 2 ? (
                  <div className="aspect-[1.6/1] w-full bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-purple-500/50 transition-all">
                    <Camera size={32} className="text-slate-600 group-hover:text-purple-500 transition-colors" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tocar para capturar</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {step === 1 ? (
                      <input 
                        placeholder={type === 'email' ? 'correo@ejemplo.com' : 'Número a 10 dígitos'}
                        className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-5 text-white outline-none focus:border-blue-500 transition-all font-bold placeholder:text-slate-600"
                      />
                    ) : (
                      <div className="flex gap-2">
                        {otpDigits.map((d, i) => (
                          <input key={i} maxLength={1} value={d}
                            onChange={e => { const v = e.target.value.replace(/\D/,''); const nd=[...otpDigits]; nd[i]=v; setOtpDigits(nd); if(v && e.target.nextSibling) (e.target.nextSibling as HTMLInputElement).focus(); }}
                            className="flex-1 aspect-square bg-slate-800 rounded-xl border-2 border-slate-700 text-center text-xl font-black text-white outline-none focus:border-blue-500"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {error && <p className="text-red-400 text-xs text-center font-bold">{error}</p>}
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                    loading ? 'bg-slate-800 text-slate-500' : 
                    type === 'facial' ? 'bg-emerald-600 shadow-emerald-900/30 text-white' :
                    type === 'id' ? 'bg-purple-600 shadow-purple-900/30 text-white' :
                    'bg-blue-600 shadow-blue-900/30 text-white'
                  }`}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {step === 1 ? 'Continuar' : 'Confirmar Verificación'}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  <Shield size={10} />
                  <span>Tus datos están encriptados</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
