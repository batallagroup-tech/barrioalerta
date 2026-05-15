import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../../types';
import { Search, X } from 'lucide-react';

interface MapSelectorProps {
  center: Location;
  onChange: (loc: Location) => void;
  height?: number;
  radiusKm?: number;
  isReadOnly?: boolean;
  color?: string;
}

function ClickHandler({ isReadOnly, onChange }: { isReadOnly: boolean; onChange: (loc: Location) => void }) {
  useMapEvents({
    click(e) {
      if (!isReadOnly) onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ location }: { location: Location }) {
  const map = useMap();
  useEffect(() => { map.flyTo([location.lat, location.lng], 16, { duration: 1 }); }, [location]);
  return null;
}

interface Suggestion { display_name: string; lat: string; lon: string; }

export const MapSelector: React.FC<MapSelectorProps> = ({
  center, onChange, height = 200, isReadOnly = false, color = 'blue',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [flyTarget, setFlyTarget] = useState<Location | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&addressdetails=1`, {
          headers: { 'Accept-Language': 'es' }
        });
        const data = await res.json();
        setSuggestions(data);
      } catch {}
      setLoading(false);
    }, 400);
  };

  const pick = (s: Suggestion) => {
    const loc = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
    onChange(loc);
    setFlyTarget(loc);
    setQuery(s.display_name.split(',').slice(0,2).join(','));
    setSuggestions([]);
  };

  const markerColor = color === 'red' ? '#ef4444' : '#3b82f6';
  const icon = L.divIcon({
    html: `<div style="width:20px;height:20px;background:${markerColor};border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
    className: '', iconSize: [20, 20], iconAnchor: [10, 10],
  });

  return (
    <div className="space-y-2">
      {!isReadOnly && (
        <div className="relative">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-red-500 transition-all">
            <Search size={15} className="text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar direccion o lugar..."
              value={query}
              onChange={e => search(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-slate-600"
            />
            {query && <button onClick={() => { setQuery(''); setSuggestions([]); }} className="text-slate-500 hover:text-white"><X size={14} /></button>}
            {loading && <div className="w-3 h-3 border border-slate-500 border-t-white rounded-full animate-spin" />}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute z-[999] top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => pick(s)}
                  className="w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-slate-800 border-b border-slate-800 last:border-0 transition-colors">
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800" style={{ height }}>
        <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            subdomains="abcd" maxZoom={19}
          />
          <ClickHandler isReadOnly={isReadOnly} onChange={onChange} />
          {flyTarget && <FlyTo location={flyTarget} />}
          <Marker position={[center.lat, center.lng]} icon={icon} />
        </MapContainer>
      </div>
    </div>
  );
};
