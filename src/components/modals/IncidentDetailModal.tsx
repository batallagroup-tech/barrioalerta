import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Clock, MapPin, AlertTriangle, CheckCircle2, MessageSquare, Shield, Navigation, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Incident, Location as GeoLocation } from '../../types';
import { CategoryBadge } from '../ui/CategoryBadge';
import { MapSelector } from '../ui/MapSelector';
import { BannerAd } from '../ui/BannerAd';
import { formatTimeAgo, formatDistance, calculateDistance } from '../../utils/geo';

interface IncidentDetailModalProps {
  incident: Incident | null;
  userLocation: GeoLocation;
  onClose: () => void;
  onVerify: (id: string) => void;
  onReport: (id: string) => void;
  onDiscuss: (incident: Incident) => void;
  isVerifiedByUser: boolean;
  isReportedByUser: boolean;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  userLocation,
  onClose,
  onVerify,
  onReport,
  onDiscuss,
  isVerifiedByUser,
  isReportedByUser
}) => {
  const [imgIndex, setImgIndex] = useState(0);

  if (!incident) return null;

  const isVerified = incident.verifiedCount >= 5;
  const isFake = (incident.reportCount || 0) >= 3;
  const images = incident.imageUrls && incident.imageUrls.length > 0 ? incident.imageUrls : [];

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(i => (i - 1 + images.length) % images.length);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(i => (i + 1) % images.length);
  };

  return (
    <AnimatePresence>
      {incident && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-slate-900 w-full max-w-2xl h-[90vh] sm:h-[80vh] rounded-t-[3rem] sm:rounded-3xl border-t sm:border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header Con Imagen / Carrusel */}
            <div className="relative h-64 sm:h-80 shrink-0">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[imgIndex]}
                    alt={incident.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${incident.isSensitive ? 'blur-2xl' : ''}`}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-2 rounded-full text-white z-10 hover:bg-black/70 transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImg}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-2 rounded-full text-white z-10 hover:bg-black/70 transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 z-10">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                            className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                      <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-white text-[10px] font-black z-10">
                        {imgIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <MapPin size={64} className="text-slate-700 opacity-20" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>

              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-slate-900/60 backdrop-blur-md rounded-full text-white hover:bg-slate-800 transition-all border border-white/10 z-10"
              >
                <X size={24} />
              </button>

              <div className="absolute bottom-6 left-8 pointer-events-none">
                <CategoryBadge category={incident.category} isVerified={isVerified} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
              {/* Usuario */}
              <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-3xl border border-white/5">
                {incident.userPhoto ? (
                  <img src={incident.userPhoto} className="w-12 h-12 rounded-2xl border-2 border-white/10" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-white/5 flex items-center justify-center">
                    <Shield size={24} className="text-slate-600" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black text-sm uppercase tracking-wider">{incident.userName || 'Vecino'}</p>
                    {incident.userVerified && (
                      <CheckCircle2 size={12} className="text-blue-400 fill-blue-400/20" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {incident.userVerified ? 'Miembro de Confianza' : 'Miembro Regular'}
                  </p>
                </div>
              </div>

              {/* Título y tiempo */}
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                  {incident.title}
                </h2>
                <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Clock size={14} className="text-blue-400" />
                    {formatTimeAgo(incident.timestamp)}
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <MapPin size={14} className="text-red-400" />
                    {formatDistance(calculateDistance(userLocation, incident.location))}
                  </div>
                </div>
              </div>

              {/* Descripción y mapa */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detalles del Reporte</h4>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {incident.description}
                </p>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Navigation size={12} className="text-blue-400" />
                      Ubicación del Reporte
                    </h4>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.location.lat},${incident.location.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                    >
                      <Navigation size={12} className="rotate-45" />
                      Cómo llegar
                    </button>
                  </div>

                  <MapSelector
                    center={incident.location}
                    radiusKm={0.1}
                    height={192}
                    isReadOnly={true}
                    onChange={() => {}}
                    color={incident.category === 'Crime' || incident.category === 'SOS' ? 'red' : 'blue'}
                  />
                </div>
              </div>

              {/* Verificaciones */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-black text-2xl">
                    <CheckCircle2 className="text-green-400" size={28} />
                    {incident.verifiedCount || 0}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {(incident.verifiedCount || 0) === 0
                      ? 'Sin verificaciones aún'
                      : incident.verifiedCount === 1
                      ? 'Un vecino verificó esto'
                      : `${incident.verifiedCount} vecinos verificaron esto`}
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => onVerify(incident.id)}
                    disabled={isVerifiedByUser}
                    className={`relative px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      isVerifiedByUser
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 cursor-default'
                        : 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isVerifiedByUser && <CheckCircle2 size={16} />}
                      {isVerifiedByUser ? 'Tu voto cuenta' : 'Verificar Incidente'}
                    </div>
                  </button>

                  <button
                    onClick={() => onDiscuss(incident)}
                    className="flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-widest hover:bg-emerald-600/20 transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
                  >
                    <MessageSquare size={18} />
                    Discutir
                  </button>
                </div>
              </div>

              <BannerAd />

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => onReport(incident.id)}
                  disabled={isReportedByUser}
                  className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-colors ${
                    isReportedByUser
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-red-400 hover:border-red-400/30'
                  }`}
                >
                  <AlertTriangle size={12} />
                  {isReportedByUser ? 'Reportado por ti' : 'Reportar Falsedad'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};