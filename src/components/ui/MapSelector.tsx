import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../../types';

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
      if (!isReadOnly) {
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  center,
  onChange,
  height = 200,
  isReadOnly = false,
  color = 'blue',
}) => {
  const markerColor = color === 'red' ? '#ef4444' : '#3b82f6';

  const icon = L.divIcon({
    html: `<div style="width:20px;height:20px;background:${markerColor};border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <ClickHandler isReadOnly={isReadOnly} onChange={onChange} />
        <Marker position={[center.lat, center.lng]} icon={icon} />
      </MapContainer>
    </div>
  );
};
