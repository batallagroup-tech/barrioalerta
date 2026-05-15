import React from 'react';
import { Incident, Location as GeoLocation } from '../../types';
import { IncidentCard } from './IncidentCard';
import { BannerAd } from '../ui/BannerAd';
import { Filter } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../constants/categories';

interface IncidentFeedProps {
  incidents: Incident[];
  userLocation: GeoLocation;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  onSelectIncident: (incident: Incident) => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  userLocation,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectIncident
}) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
      <div className="px-6 space-y-6 pt-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="¿Qué buscas en el barrio?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-800 rounded-xl text-slate-500">
              <Filter size={16} />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['All', 'Crime', 'Accident', 'Missing', 'Notice', 'Sanitary', 'Fire', 'Infrastructure', 'Utility', 'Health', 'Environment', 'Other', 'SOS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  selectedCategory === cat
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20'
                  : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat === 'All' ? 'Todos' : CATEGORY_CONFIG[cat]?.label?.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim() ?? cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Filter size={32} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-sm mb-1">Sin Novedades</h3>
              <p className="text-xs font-bold">No hay reportes recientes en tu radio de acción.</p>
            </div>
          ) : (
            incidents.map((incident, idx) => (
              <React.Fragment key={incident.id}>
                {idx > 0 && idx % 3 === 0 && <BannerAd />}
                <IncidentCard 
                  incident={incident} 
                  userLocation={userLocation} 
                  onClick={() => onSelectIncident(incident)} 
                />
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
