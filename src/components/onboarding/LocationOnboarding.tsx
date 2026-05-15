import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Search, CheckCircle2, AlertTriangle, Loader } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { Location as GeoLocation } from '../../types';

const ONBOARDING_KEY = 'barrioalerta_location_onboarding_done';

interface LocationOnboardingProps {
  onComplete: (location: GeoLocation, cityName: string) => void;
}

async function getCityName(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || data.address?.state || 'tu zona';
  } catch {
    return 'tu zona';
  }
}

export async function isOnboardingDone(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: ONBOARDING_KEY });
    return value === 'true';
  }
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export async function markOnboardingDone(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: ONBOARDING_KEY, value: 'true' });
  } else {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }
}

export function useLocationOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    isOnboardingDone().then(done => {
      if (!done) setShowOnboarding(true);
      setChecked(true);
    });
  }, []);

  const completeOnboarding = async () => {
    await markOnboardingDone();
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding, checked };
}

type Step = 'requesting' | 'detected' | 'manual' | 'denied';

export const LocationOnboarding: React.FC<LocationOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('requesting');
  const [detectedLocation, setDetectedLocation] = useState<GeoLocation | null>(null);
  const [manualLocation, setManualLocation] = useState<GeoLocation | null>(null);
  const [cityName, setCityName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setStep('requesting');
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') {
          setStep('denied');
          return;
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDetectedLocation(loc);
        setStep('detected');
        const city = await getCityName(loc.lat, loc.lng);
        setCityName(city);
      } else {
        if (!('geolocation' in navigator)) {
          setStep('denied');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setDetectedLocation(loc);
            setStep('detected');
            const city = await getCityName(loc.lat, loc.lng);
            setCityName(city);
          },
          () => setStep('denied'),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch {
      setStep('denied');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const selectResult = async (result: any) => {
    const loc = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setManualLocation(loc);
    setSearchQuery(result.display_name.split(',').slice(0, 3).join(','));
    setSearchResults([]);
    const city = await getCityName(loc.lat, loc.lng);
    setCityName(city);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">

        {step === 'requesting' && (
          <motion.div
            key="requesting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm flex flex-col items-center gap-8 text-center"
          >
            <div className="bg-red-600/10 p-8 rounded-3xl border border-red-600/20">
              <Navigation size={56} className="text-red-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white tracking-tighter">BarrioAlerta</h1>
              <p className="text-slate-400 leading-relaxed text-sm">
                Necesitamos tu ubicacion para mostrarte alertas cercanas y proteger tu barrio.
              </p>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <Loader size={16} className="animate-spin text-red-500" />
              <span>Detectando ubicacion...</span>
            </div>
          </motion.div>
        )}

        {step === 'detected' && detectedLocation && (
          <motion.div
            key="detected"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-sm flex flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20">
                <CheckCircle2 size={56} className="text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Ubicacion detectada</h2>
                <p className="text-slate-400 text-sm">Se te detecto en</p>
                <p className="text-red-400 font-black text-xl">{cityName || 'Cargando...'}</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-red-400 shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Coordenadas</p>
                  <p className="text-slate-300 text-xs font-mono">
                    {detectedLocation.lat.toFixed(4)}, {detectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-xs text-center">
              Es correcta tu ubicacion? Es esencial para recibir alertas cercanas.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('manual')}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95"
              >
                No, cambiar
              </button>
              <button
                onClick={() => onComplete(detectedLocation, cityName)}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-900/30 transition-all active:scale-95"
              >
                Si, correcto
              </button>
            </div>
          </motion.div>
        )}

        {step === 'manual' && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-sm flex flex-col gap-5"
          >
            <div className="text-center space-y-2">
              <div className="bg-blue-600/10 p-5 rounded-3xl border border-blue-600/20 w-fit mx-auto">
                <Search size={40} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Busca tu ubicacion</h2>
              <p className="text-slate-500 text-sm">Escribe tu ciudad, municipio o colonia.</p>
            </div>

            <div className="relative">
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder="Ej: Juan Galindo, Puebla"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
                />
                <button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={searching}
                  className="px-4 py-3.5 bg-red-600 hover:bg-red-500 rounded-xl text-white transition-all active:scale-95"
                >
                  {searching ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-slate-900 border border-slate-700 rounded-xl mt-1 overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => selectResult(r)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 border-b border-slate-800 last:border-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-xs">{r.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {manualLocation && (
              <div className="bg-slate-900 rounded-2xl p-4 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ubicacion seleccionada</p>
                    <p className="text-green-400 font-bold text-sm">{cityName}</p>
                  </div>
                </div>
              </div>
            )}

            {manualLocation && (
              <button
                onClick={() => onComplete(manualLocation, cityName)}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg transition-all active:scale-95"
              >
                Guardar ubicacion
              </button>
            )}

            <button
              onClick={requestLocation}
              className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center py-2"
            >
              Intentar detectar de nuevo
            </button>
          </motion.div>
        )}

        {step === 'denied' && (
          <motion.div
            key="denied"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm flex flex-col items-center gap-6 text-center"
          >
            <div className="bg-red-600/10 p-8 rounded-3xl border border-red-600/20">
              <AlertTriangle size={56} className="text-red-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white">Ubicacion requerida</h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                BarrioAlerta necesita tu ubicacion para mostrarte alertas cercanas. Sin ella la app no puede funcionar correctamente.
              </p>
            </div>
            <button
              onClick={() => setStep('manual')}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg transition-all active:scale-95"
            >
              Ingresar manualmente
            </button>
            <button
              onClick={requestLocation}
              className="text-slate-500 text-sm font-bold uppercase tracking-widest"
            >
              Intentar de nuevo
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};