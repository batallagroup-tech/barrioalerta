import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, CheckCircle2, Shield, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Incident, Location as GeoLocation } from '../../types';
import { CategoryBadge } from '../ui/CategoryBadge';
import { formatTimeAgo, formatDistance, calculateDistance } from '../../utils/geo';

interface IncidentCardProps {
  incident: Incident;
  userLocation: GeoLocation;
  onClick: () => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  userLocation,
  onClick
}) => {
  const distance = calculateDistance(userLocation, incident.location);
  const isVerified = incident.verifiedCount >= 5;
  const isFake = (incident.reportCount || 0) >= 3;
  const images = incident.imageUrls && incident.imageUrls.length > 0 ? incident.imageUrls : [];
  const [imgIndex, setImgIndex] = useState(0);

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(i => (i - 1 + images.length) % images.length);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(i => (i + 1) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`relative group bg-slate-900 rounded-[2rem] border overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-2xl ${
        isFake ? 'border-red-500/40' : (isVerified ? 'border-green-500/20' : 'border-slate-800')
      }`}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[imgIndex]}
              alt={incident.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${incident.isSensitive ? 'blur-2xl' : ''}`}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-1.5 rounded-full text-white z-10"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-1.5 rounded-full text-white z-10"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1 z-10">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <MapPin size={48} className="text-slate-700 opacity-20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none"></div>

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <CategoryBadge category={incident.category} isVerified={isVerified} />
          {isFake && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest border border-red-500/50">
              <Shield size={10} /> POSIBLE FALSO
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-6 right-6 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            {incident.userPhoto ? (
              <img src={incident.userPhoto} className="w-5 h-5 rounded-md border border-white/20" alt="" />
            ) : (
              <div className="w-5 h-5 rounded-md bg-slate-800 border border-white/10 flex items-center justify-center">
                <UserCheck size={10} className="text-slate-500" />
              </div>
            )}
            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest truncate max-w-[120px]">
              {incident.userName || 'Vecino'}
            </span>
            {incident.userVerified && (
              <CheckCircle2 size={10} className="text-blue-400 fill-blue-400/20" />
            )}
          </div>
          <h3 className="text-xl font-black text-white leading-tight mb-2 tracking-tight line-clamp-2">
            {incident.title}
          </h3>
          <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-blue-400" />
              {formatTimeAgo(incident.timestamp)}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-red-400" />
              {formatDistance(distance)}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 bg-slate-900 group-hover:bg-slate-800/50 transition-colors">
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4 font-medium opacity-80">
          {incident.description}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
          <div className="flex items-center gap-1.5 text-green-400">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{incident.verifiedCount} Verificaciones</span>
          </div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest group-hover:text-white transition-colors">
            Ver Detalles →
          </div>
        </div>
      </div>
    </motion.div>
  );
};