import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Plus, Minus } from "lucide-react";
import { Incident, Location as GeoLocation } from "../../types/incident.types";
import { CATEGORY_CONFIG } from "../../constants/categories";

// Fix default icon paths for Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${emoji}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [zoom]);
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center[0], center[1]]);
  return null;
}

// ── OpenStreetMap tile providers (gratuitos, sin API key) ────────────────────
type MapType = "dark" | "streets" | "topo" | "humanitarian";

const MAP_TYPES: { id: MapType; label: string }[] = [
  { id: "dark",         label: "Noche" },
  { id: "streets",     label: "Mapa" },
  { id: "topo",        label: "Topo" },
  { id: "humanitarian",label: "Claro" },
];

interface TileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
}

function getTileConfig(type: MapType): TileConfig {
  switch (type) {
    case "dark":
      return {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      };
    case "streets":
      return {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: "abc",
      };
    case "topo":
      return {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
        subdomains: "abc",
      };
    case "humanitarian":
      return {
        url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles by <a href="https://hot.openstreetmap.org/">HOT</a>',
        maxZoom: 19,
        subdomains: "abc",
      };
  }
}

interface MapViewProps {
  incidents: Incident[];
  userLocation: GeoLocation;
  radiusKm: number;
  onSelectIncident?: (incident: Incident) => void;
  interactive?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  userLocation,
  radiusKm,
  onSelectIncident,
  interactive = true,
}) => {
  const [mapType, setMapType] = useState<MapType>("dark");
  const [zoom, setZoom] = useState(14);

  const center: [number, number] = [userLocation.lat, userLocation.lng];
  const tileConfig = getTileConfig(mapType);

  return (
    <div style={{ position: "relative", height: "calc(100vh - 140px)", width: "100%" }}>
      <style>{`
        .leaflet-pane { z-index: 1 !important; }
        .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", minHeight: 400, background: "#0f172a" }}
        zoomControl={false}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          key={mapType}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={tileConfig.maxZoom}
          subdomains={tileConfig.subdomains}
        />

        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.05,
            weight: 1,
          }}
        />

        <Marker
          position={center}
          icon={L.divIcon({
            html: `<div style="width:26px;height:26px;background:#2563eb;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
            className: "",
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          })}
        >
          <Popup>Tu ubicación</Popup>
        </Marker>

        {incidents.map((incident) => {
          const cfg = CATEGORY_CONFIG[incident.category] ?? CATEGORY_CONFIG.Other;
          return (
            <Marker
              key={incident.id}
              position={[incident.location.lat, incident.location.lng]}
              icon={createEmojiIcon(cfg.emoji)}
              eventHandlers={{ click: () => onSelectIncident?.(incident) }}
            >
              <Popup>
                <strong>{incident.title}</strong>
                <br />
                <span style={{ fontSize: 12 }}>{incident.description}</span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {interactive && (
        <>
          <div className="absolute top-6 left-6 z-[5] flex flex-col gap-1 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.min(z + 1, 18))}
              className="p-3 text-slate-400 hover:text-white rounded-xl"
              aria-label="Acercar"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 1, 3))}
              className="p-3 text-slate-400 hover:text-white rounded-xl"
              aria-label="Alejar"
            >
              <Minus size={20} />
            </button>
          </div>

          <div className="absolute top-6 right-6 z-[5]">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl flex gap-1">
              {MAP_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMapType(t.id)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${
                    mapType === t.id
                      ? "bg-slate-800 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};