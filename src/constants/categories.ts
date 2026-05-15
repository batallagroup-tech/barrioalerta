import { 
  Shield, 
  Car, 
  UserSearch, 
  Info, 
  HeartHandshake, 
  Globe, 
  MoreVertical, 
  Siren,
  CircleAlert,
  ShieldAlert,
  Droplets,
  TreeDeciduous,
  Bell,
  Flame,
  HardHat,
  Zap,
  Activity
} from 'lucide-react';
import { Category } from '../types';

export const CATEGORY_CONFIG: Record<string, any> = {
  Crime: { 
    icon: Shield, 
    mapIcon: ShieldAlert,
    color: 'text-red-400', 
    mapColor: '#ef4444',
    label: '👮 Crimen',
    emoji: '👮'
  },
  Accident: { 
    icon: Car, 
    mapIcon: CircleAlert,
    color: 'text-orange-400', 
    mapColor: '#f59e0b',
    label: '🚑 Siniestros',
    emoji: '🚑'
  },
  Missing: { 
    icon: UserSearch, 
    mapIcon: UserSearch,
    color: 'text-blue-400', 
    mapColor: '#3b82f6',
    label: '🔍 Búsqueda',
    emoji: '🔍'
  },
  Notice: { 
    icon: Info, 
    mapIcon: Info,
    color: 'text-slate-400', 
    mapColor: '#94a3b8',
    label: '🚧 Aviso',
    emoji: '🚧'
  },
  Sanitary: { 
    icon: HeartHandshake, 
    mapIcon: Droplets,
    color: 'text-emerald-400', 
    mapColor: '#10b981',
    label: '🏥 Sanidad',
    emoji: '🏥'
  },
  Environment: { 
    icon: Globe, 
    mapIcon: TreeDeciduous,
    color: 'text-green-400', 
    mapColor: '#22c55e',
    label: '🌿 Ambiental',
    emoji: '🌿'
  },
  Fire: { 
    icon: Flame, 
    mapIcon: Flame,
    color: 'text-orange-600', 
    mapColor: '#ea580c',
    label: '🔥 Incendio',
    emoji: '🔥'
  },
  Infrastructure: { 
    icon: HardHat, 
    mapIcon: HardHat,
    color: 'text-yellow-500', 
    mapColor: '#eab308',
    label: '🔨 Infraestructura',
    emoji: '🔨'
  },
  Utility: { 
    icon: Zap, 
    mapIcon: Zap,
    color: 'text-cyan-400', 
    mapColor: '#22d3ee',
    label: '⚡ Servicios',
    emoji: '⚡'
  },
  Health: { 
    icon: Activity, 
    mapIcon: Activity,
    color: 'text-rose-400', 
    mapColor: '#fb7185',
    label: '🩺 Salud',
    emoji: '🩺'
  },
  Other: { 
    icon: MoreVertical, 
    mapIcon: Bell,
    color: 'text-slate-400', 
    mapColor: '#64748b',
    label: '❓ Otro',
    emoji: '❓'
  },
  SOS: { 
    icon: Siren, 
    mapIcon: Siren,
    color: 'text-red-500', 
    mapColor: '#ef4444',
    label: '🚨 SOS',
    emoji: '🚨'
  },
};

export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];
