import L from 'leaflet';
import { DefenseSystem, Configuration, SystemCategory, SystemRole } from '../types';
import { CITIES, SAMPLING_POINTS_COUNT, SL_BOUNDS, STRATEGIC_LOCATIONS, SystemTemplate } from '../constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const isInsideCountry = (lat: number, lng: number, geoData: any) => {
  if (!geoData) return true;
  let inside = false;
  const features = geoData.features;

  const checkPolygon = (x: number, y: number, polygon: number[][]) => {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  };

  for (const feature of features) {
    const geometry = feature.geometry;
    if (geometry.type === "Polygon") {
      if (checkPolygon(lng, lat, geometry.coordinates[0])) inside = !inside;
    } else if (geometry.type === "MultiPolygon") {
      for (const poly of geometry.coordinates) {
        if (checkPolygon(lng, lat, poly[0])) inside = !inside;
      }
    }
  }
  return inside;
};

export const calculateScores = (defenseSystems: DefenseSystem[], geoData: any) => {
  if (!geoData) return { combinedLand: 0, combinedCities: 0, combinedSea: 0, radarLand: 0, attackLand: 0 };

  let spatialLandCoveredCount = 0;
  let radarLandHitsCount = 0;
  let attackLandHitsCount = 0;
  
  let landPointsTotal = 0;
  let seaPointsTotal = 0;
  let combinedSeaHits = 0;
  
  // Only consider active systems for score calculation
  const radars = defenseSystems.filter(s => s.role === 'RADAR' && s.isActive !== false);
  const interceptors = defenseSystems.filter(s => s.role === 'INTERCEPTOR' && s.isActive !== false);

  const gridSize = Math.floor(Math.sqrt(SAMPLING_POINTS_COUNT));
  const latStep = (SL_BOUNDS.maxLat - SL_BOUNDS.minLat) / gridSize;
  const lngStep = (SL_BOUNDS.maxLng - SL_BOUNDS.minLng) / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const rLat = SL_BOUNDS.minLat + (i * latStep) + (latStep / 2);
      const rLng = SL_BOUNDS.minLng + (j * lngStep) + (lngStep / 2);

      const isLand = isInsideCountry(rLat, rLng, geoData);
      const point = L.latLng(rLat, rLng);
      
      let radarHitsAtPoint = 0;
      for (const sys of radars) {
        if (point.distanceTo(L.latLng(sys.lat, sys.lng)) / 1000 <= sys.range) {
          radarHitsAtPoint++;
          break; 
        }
      }

      let attackHitsAtPoint = 0;
      for (const sys of interceptors) {
        if (point.distanceTo(L.latLng(sys.lat, sys.lng)) / 1000 <= sys.range) {
          attackHitsAtPoint++;
          break;
        }
      }

      const isCombinedShield = radarHitsAtPoint > 0 && attackHitsAtPoint > 0;

      if (isLand) {
        landPointsTotal++;
        if (isCombinedShield) spatialLandCoveredCount++;
        if (radarHitsAtPoint > 0) radarLandHitsCount++;
        if (attackHitsAtPoint > 0) attackLandHitsCount++;
      } else {
        seaPointsTotal++;
        if (isCombinedShield) combinedSeaHits++;
      }
    }
  }

  let combinedCityScore = 0;
  let totalCityWeight = 0;
  CITIES.forEach(city => {
    totalCityWeight += city.weight;
    const cityPt = L.latLng(city.lat, city.lng);
    const isRadarCovered = radars.some(sys => cityPt.distanceTo(L.latLng(sys.lat, sys.lng)) / 1000 <= sys.range);
    const isInterceptorCovered = interceptors.some(sys => cityPt.distanceTo(L.latLng(sys.lat, sys.lng)) / 1000 <= sys.range);
    if (isRadarCovered && isInterceptorCovered) combinedCityScore += city.weight;
  });

  return {
    combinedLand: landPointsTotal > 0 ? (spatialLandCoveredCount / landPointsTotal) * 100 : 0,
    combinedCities: totalCityWeight > 0 ? (combinedCityScore / totalCityWeight) * 100 : 0,
    combinedSea: seaPointsTotal > 0 ? (combinedSeaHits / seaPointsTotal) * 100 : 0,
    radarLand: landPointsTotal > 0 ? (radarLandHitsCount / landPointsTotal) * 100 : 0,
    attackLand: landPointsTotal > 0 ? (attackLandHitsCount / landPointsTotal) * 100 : 0
  };
};

export const generateAnalysis = (scores: any, priorities: string[]) => {
  let text = `Priorities: ${priorities.join(' + ').toUpperCase()}. `;
  if (scores.combinedCities > 95) text += " [Fortress Protocol Active]";
  else if (scores.combinedCities > 75) text += " [High-Priority Urban Shield]";
  if (scores.radarLand > 98) text += " [Total Detection Awareness]";
  return text;
};

export const mutateDeployment = (
  baseSystems: DefenseSystem[],
  radarSecured: boolean,
  geoData: any,
  placementStrategy: string,
  forceHighEntropy: boolean = false
): DefenseSystem[] => {
  return baseSystems.map(sys => {
    if (!forceHighEntropy && radarSecured && sys.role === 'RADAR') return { ...sys };
    
    const mutationChance = forceHighEntropy ? 0.45 : 0.25;
    if (Math.random() > mutationChance) return { ...sys };

    if (forceHighEntropy && Math.random() < 0.08) {
      return {
        ...sys,
        lat: Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat) + SL_BOUNDS.minLat,
        lng: Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng) + SL_BOUNDS.minLng
      };
    }

    const moveAmount = sys.role === 'RADAR' ? 1.5 : 0.45;
    const entropyMultiplier = forceHighEntropy ? 2.5 : 1.0;

    let newLat = sys.lat + (Math.random() - 0.5) * moveAmount * entropyMultiplier;
    let newLng = sys.lng + (Math.random() - 0.5) * moveAmount * entropyMultiplier;

    newLat = Math.max(SL_BOUNDS.minLat, Math.min(SL_BOUNDS.maxLat, newLat));
    newLng = Math.max(SL_BOUNDS.minLng, Math.min(SL_BOUNDS.maxLng, newLng));

    return { ...sys, lat: newLat, lng: newLng };
  });
};

export const generateRandomDeploymentWithCounts = (
  unitCounts: Record<string, number>,
  placementStrategy: string,
  geoData: any,
  templates: Record<string, SystemTemplate>
): DefenseSystem[] => {
  const randomSystems: DefenseSystem[] = [];
  
  Object.entries(unitCounts).forEach(([templateKey, count]) => {
    const template = templates[templateKey];
    if (!template) return;

    for (let s = 0; s < count; s++) {
      let valid = false;
      let lat = 0, lng = 0;
      let attempts = 0;

      while (!valid && attempts < 50) {
        attempts++;
        const roll = Math.random();
        
        if (roll > 0.7 && placementStrategy !== 'outside') {
           const locs = Object.values(STRATEGIC_LOCATIONS);
           const target = locs[Math.floor(Math.random() * locs.length)];
           lat = target.lat + (Math.random() - 0.5) * 0.4;
           lng = target.lng + (Math.random() - 0.5) * 0.4;
        } else if (roll > 0.4 && placementStrategy !== 'outside') {
          const targetCity = CITIES[Math.floor(Math.random() * CITIES.length)];
          lat = targetCity.lat + (Math.random() - 0.5) * 0.6;
          lng = targetCity.lng + (Math.random() - 0.5) * 0.6;
        } else {
          lat = Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat) + SL_BOUNDS.minLat;
          lng = Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng) + SL_BOUNDS.minLng;
        }

        const inside = isInsideCountry(lat, lng, geoData);
        if (placementStrategy === 'inside') valid = inside;
        else if (placementStrategy === 'outside') valid = !inside;
        else valid = true;
      }

      randomSystems.push({
        id: generateId(),
        lat,
        lng,
        ...template,
        isActive: true,
        name: `${template.name || template.category}-${s + 1}`
      });
    }
  });

  return randomSystems;
};
