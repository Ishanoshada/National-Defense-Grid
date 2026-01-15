
export type SystemRole = 'INTERCEPTOR' | 'RADAR';
export type SystemCategory = 'Barak-8' | 'DragonFire' | 'Silent Hunter' | 'ODIN' | 'JY-27' | 'YLC-18' | 'Iron Beam' | 'Custom';

export interface DefenseSystem {
  id: string;
  lat: number;
  lng: number;
  range: number;
  name: string;
  category: SystemCategory;
  role: SystemRole;
  systemCost: number; // In millions $
  shotCost: string;
  shotSpeed: number; // Simulation speed units
  targetType: string;
  killMethod: string;
  color: string;
  isActive?: boolean;
}

export interface Configuration {
  id: string;
  systems: DefenseSystem[];
  coverage: number;
  cityCoverage?: number;
  seaCoverage?: number;
  totalCost?: number;
  analysis?: string;
  timestamp: number;
}
