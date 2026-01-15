
import { SystemCategory, SystemRole } from './types';

export const SRI_LANKA_GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/LKA.geo.json";

export const DEFAULT_RANGE = 70; // km
export const MAX_BRUTEFORCE_ITERATIONS = 500;
export const SAMPLING_POINTS_COUNT = 3600; 

export interface SystemTemplate {
  category: SystemCategory;
  role: SystemRole;
  targetType: string;
  range: number;
  systemCost: number;
  shotCost: string;
  shotSpeed: number;
  killMethod: string;
  color: string;
  name?: string;
}

export const SYSTEM_TEMPLATES: Record<SystemCategory, SystemTemplate> = {
  'Barak-8': {
    category: 'Barak-8',
    role: 'INTERCEPTOR',
    targetType: 'target_barak_8',
    range: 150, 
    systemCost: 100,
    shotCost: '$1.1 Million',
    shotSpeed: 0.25,
    killMethod: 'Hard Kill',
    color: '#2563eb'
  },
  'Iron Beam': {
    category: 'Iron Beam',
    role: 'INTERCEPTOR',
    targetType: 'target_iron_beam',
    range: 7,
    systemCost: 50,
    shotCost: '$2 - $5',
    shotSpeed: 1.5,
    killMethod: '100kW Laser',
    color: '#f97316'
  },
  'DragonFire': {
    category: 'DragonFire',
    role: 'INTERCEPTOR',
    targetType: 'target_dragonfire',
    range: 15,
    systemCost: 100,
    shotCost: '$13',
    shotSpeed: 1.2,
    killMethod: 'Hard Kill',
    color: '#dc2626'
  },
  'Silent Hunter': {
    category: 'Silent Hunter',
    role: 'INTERCEPTOR',
    targetType: 'target_silent_hunter',
    range: 4,
    systemCost: 30,
    shotCost: '$5',
    shotSpeed: 0.9,
    killMethod: 'Close Range',
    color: '#16a34a'
  },
  'ODIN': {
    category: 'ODIN',
    role: 'INTERCEPTOR',
    targetType: 'target_odin',
    range: 20,
    systemCost: 40,
    shotCost: 'Electronic',
    shotSpeed: 2.0,
    killMethod: 'Soft Kill',
    color: '#9333ea'
  },
  'JY-27': {
    category: 'JY-27',
    role: 'RADAR',
    targetType: 'target_jy_27',
    range: 500,
    systemCost: 20,
    shotCost: 'N/A',
    shotSpeed: 0,
    killMethod: 'VHF Scanning',
    color: '#eab308'
  },
  'YLC-18': {
    category: 'YLC-18',
    role: 'RADAR',
    targetType: 'target_ylc_18',
    range: 250,
    systemCost: 10,
    shotCost: 'N/A',
    shotSpeed: 0,
    killMethod: 'L-Band 3D Scanning',
    color: '#0891b2'
  },
  'Custom': {
    category: 'Custom',
    role: 'INTERCEPTOR',
    targetType: 'target_custom',
    range: 0,
    systemCost: 0,
    shotCost: 'N/A',
    shotSpeed: 0,
    killMethod: 'N/A',
    color: '#ffffff'
  }
};

export const STRATEGIC_LOCATIONS = {
  PIDURUTHALAGALA: { name: "පිදුරුතලාගල මුදුන", lat: 7.0001, lng: 80.7725 },
  TRINCO_COAST: { name: "ත්‍රිකුණාමලය වෙරළ", lat: 8.5873, lng: 81.2152 },
  HAMBANTHOTA_COAST: { name: "හම්බන්තොට වෙරළ", lat: 6.1246, lng: 81.1245 },
  POTTUVIL_COAST: { name: "පොතුවිල් වෙරළ", lat: 6.8724, lng: 81.8210 },
  DONDRA_HEAD: { name: "දෙවිනුවර තුඩුව", lat: 5.9234, lng: 80.5873 }
};

export const CITIES = [
  { name: "Colombo", lat: 6.9271, lng: 79.8612, weight: 5 },
  { name: "Kandy", lat: 7.2906, lng: 80.6337, weight: 3 },
  { name: "Galle", lat: 6.0535, lng: 80.2210, weight: 2 },
  { name: "Jaffna", lat: 9.6615, lng: 80.0104, weight: 2 },
  { name: "Trincomalee", lat: 8.5873, lng: 81.2152, weight: 2 },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037, weight: 3.5 },
  { name: "Batticaloa", lat: 7.7102, lng: 81.6924, weight: 1.5 },
  { name: "Matara", lat: 5.9549, lng: 80.5550, weight: 2.5 },
  { name: "Ratnapura", lat: 6.6828, lng: 80.3992, weight: 1.5 },
  { name: "Kurunegala", lat: 7.4818, lng: 80.3609, weight: 1.5 },
  { name: "Pottuvil", lat: 6.8724, lng: 81.8210, weight: 1.2 }
];

export const SL_BOUNDS = {
  minLat: 5.8,
  maxLat: 9.9,
  minLng: 79.5,
  maxLng: 82.0
};
