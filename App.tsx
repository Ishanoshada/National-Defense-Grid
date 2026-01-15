import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Circle, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import { 
  Shield, 
  Settings2,
  Crosshair,
  Radio,
  Scan,
  Database,
  RefreshCw,
  Cpu,
  Globe,
  LayoutGrid,
  Building2,
  Timer,
  Download,
  Upload,
  FileJson,
  SortAsc,
  ChevronRight,
  ChevronLeft,
  Award,
  Trash2,
  Save,
  Move,
  Layers,
  Coins,
  Zap,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  Wifi,
  Waves,
  Mountain,
  Anchor,
  Plus,
  Minus,
  CheckCircle2,
  Search,
  History,
  Dna,
  Info,
  DollarSign,
  FlaskConical,
  Bomb,
  Star,
  Gauge,
  Palette,
  Edit3,
  Wrench,
  PlusCircle,
  Menu,
  X,
  Github,
  ExternalLink,
  MapPin,
  GripVertical,
  Sun,
  Moon,
  Coffee,
  Languages,
  Box,
  Camera,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeft,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  History as HistoryIcon,
  PlayCircle,
  HelpCircle
} from 'lucide-react';
import { DefenseSystem, Configuration, SystemCategory, SystemRole } from './types';
import { SRI_LANKA_GEOJSON_URL, CITIES, SYSTEM_TEMPLATES, STRATEGIC_LOCATIONS, SystemTemplate } from './constants';
import * as Solver from './engine/SolverEngine';
import AttackSimulator from './components/AttackSimulator';
import StressTest from './components/StressTest';
import WelcomeModal from './components/WelcomeModal';
import AboutPanel from './components/AboutPanel';
import { TRANSLATIONS, Language } from './locales/translations';

const generateId = () => Math.random().toString(36).substr(2, 9);

const ELITE_PRESET_SYSTEMS: DefenseSystem[] = [
  { "id": "wsyshu5cu", "lat": 6.904614950833644, "lng": 81.22740447455746, "category": "Barak-8", "role": "INTERCEPTOR", "targetType": "target_barak_8", "range": 150, "systemCost": 100, "shotCost": "$1.1 Million", "shotSpeed": 0.25, "killMethod": "Hard Kill", "color": "#2563eb", "name": "Barak-8-1", "isActive": true },
  { "id": "o2acp84fv", "lat": 8.798226658331622, "lng": 80.5188144751626, "category": "Barak-8", "role": "INTERCEPTOR", "targetType": "target_barak_8", "range": 150, "systemCost": 100, "shotCost": "$1.1 Million", "shotSpeed": 0.25, "killMethod": "Hard Kill", "color": "#2563eb", "name": "Barak-8-2", "isActive": true },
  { "id": "8mmcvsaop", "lat": 6.910057402157946, "lng": 80.3428892724168, "category": "Barak-8", "role": "INTERCEPTOR", "targetType": "target_barak_8", "range": 150, "systemCost": 100, "shotCost": "$1.1 Million", "shotSpeed": 0.25, "killMethod": "Hard Kill", "color": "#2563eb", "name": "Barak-8-3", "isActive": true },
  { "id": "icsbfmask", "lat": 8.208765134587678, "lng": 80.46385466986996, "category": "Iron Beam", "role": "INTERCEPTOR", "targetType": "target_iron_beam", "range": 7, "systemCost": 50, "shotCost": "$2 - $5", "shotSpeed": 1.5, "killMethod": "100kW Laser", "color": "#f97316", "name": "Iron Beam-2", "isActive": true },
  { "id": "dtrthlgkv", "lat": 6.063527379062164, "lng": 80.52671589765869, "category": "Iron Beam", "role": "INTERCEPTOR", "targetType": "target_iron_beam", "range": 7, "systemCost": 50, "shotCost": "$2 - $5", "shotSpeed": 1.5, "killMethod": "100kW Laser", "color": "#f97316", "name": "Iron Beam-3", "isActive": true },
  { "id": "j31c9quwe", "lat": 6.931863926916902, "lng": 79.9801041740242, "category": "Iron Beam", "role": "INTERCEPTOR", "targetType": "target_iron_beam", "range": 7, "systemCost": 50, "shotCost": "$2 - $5", "shotSpeed": 1.5, "killMethod": "100kW Laser", "color": "#f97316", "name": "Iron Beam-4", "isActive": true },
  { "id": "dy9fdr460", "lat": 7.0409201970583455, "lng": 80.51880978105133, "category": "JY-27", "role": "RADAR", "targetType": "target_jy_27", "range": 500, "systemCost": 20, "shotCost": "N/A", "shotSpeed": 0, "killMethod": "VHF Scanning", "color": "#eab308", "name": "JY-27-1", "isActive": true },
  { "id": "kk71udbt2", "lat": 6.970042791849378, "lng": 81.09550281949957, "category": "YLC-18", "role": "RADAR", "targetType": "target_ylc_18", "range": 250, "systemCost": 10, "shotCost": "N/A", "shotSpeed": 0, "killMethod": "L-Band 3D Scanning", "color": "#0891b2", "name": "YLC-18-1", "isActive": true },
  { "id": "rgj7m5sep", "lat": 8.92306611469321, "lng": 80.53801473176934, "category": "YLC-18", "role": "RADAR", "targetType": "target_ylc_18", "range": 250, "systemCost": 10, "shotCost": "N/A", "shotSpeed": 0, "killMethod": "L-Band 3D Scanning", "color": "#0891b2", "name": "YLC-18-3", "isActive": true }
];

const WORKSHOP_PALETTE = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', 
  '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', 
  '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#b91c1c', 
  '#475569', '#334155', '#1e293b', '#0f172a', '#57534e', '#ffffff'
];

const MapEvents = ({ onMapClick, activeMode, onDropSystem }: { onMapClick: (e: L.LeafletMouseEvent) => void, activeMode: boolean, onDropSystem: (lat: number, lng: number, templateName: string) => void }) => {
  const map = useMap();
  
  useEffect(() => {
    const container = map.getContainer();
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const templateName = e.dataTransfer?.getData('text/plain');
      if (templateName) {
        const point = map.mouseEventToLatLng(e as any);
        onDropSystem(point.lat, point.lng, templateName);
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    
    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [map, onDropSystem]);

  useMapEvents({ 
    click: (e) => {
      if (activeMode) onMapClick(e);
    } 
  });
  return null;
};

const MapController = ({ geoData }: { geoData: any }) => {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      const layer = L.geoJSON(geoData);
      // Wait for map container to settle before fitting bounds to avoid grey areas
      setTimeout(() => {
        map.fitBounds(layer.getBounds(), { padding: [40, 40] });
      }, 500);
    }
  }, [geoData, map]);
  return null;
};

type PriorityType = 'land' | 'urban' | 'sea';
type MapTheme = 'dark' | 'light' | 'warm';

const App: React.FC = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [systems, setSystems] = useState<DefenseSystem[]>([]);
  const [expandedInventory, setExpandedInventory] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['Barak-8', 'Iron Beam', 'JY-27', 'YLC-18']);
  const [unitCounts, setUnitCounts] = useState<Record<string, number>>({ 
    'Barak-8': 0, 
    'Iron Beam': 0, 
    'JY-27': 1, 
    'YLC-18': 2 
  });

  useEffect(() => {
    const removeLeafletBottomRight = () => {
      const el = document.querySelector(
        ".leaflet-bottom.leaflet-right"
      ) as HTMLElement | null;

      if (el) el.remove();
    };
    removeLeafletBottomRight();
    const observer = new MutationObserver(() => {
      removeLeafletBottomRight();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const [activeRoleTab, setActiveRoleTab] = useState<SystemRole>('INTERCEPTOR');
  const [customArsenal, setCustomArsenal] = useState<SystemTemplate[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [mapTheme, setMapTheme] = useState<MapTheme>('warm');
  const [threatColor, setThreatColor] = useState<string>('#ef4444');
  const [lang, setLang] = useState<Language>('en');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStressTest, setShowStressTest] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const t = useCallback((key: string) => {
    return (TRANSLATIONS[lang] as any)[key] || (TRANSLATIONS.en as any)[key] || key;
  }, [lang]);

  const allTemplatesMap = useMemo(() => {
    const map: Record<string, SystemTemplate> = {};
    Object.values(SYSTEM_TEMPLATES).forEach(template => {
      if (template.category !== 'Custom') map[template.category] = template;
    });
    customArsenal.forEach(template => {
      if (template.name) map[template.name] = template;
    });
    return map;
  }, [customArsenal]);

  const reservedColors = useMemo(() => {
    return new Set((Object.values(allTemplatesMap) as SystemTemplate[]).map(template => template.color.toLowerCase()));
  }, [allTemplatesMap]);

  const [workshopMode, setWorkshopMode] = useState(false);
  const [workshopConfig, setWorkshopConfig] = useState<{
    name: string;
    role: SystemRole;
    range: number;
    systemCost: number;
    shotCost: string;
    shotSpeed: number;
    color: string;
    targetType: string;
    killMethod: string;
  }>({
    name: "Prototype Alpha",
    role: "INTERCEPTOR",
    range: 120,
    systemCost: 80,
    shotCost: "$45,000",
    shotSpeed: 0.6,
    color: "#ff00ff", 
    targetType: "target_custom",
    killMethod: "Microwave Pulse"
  });

  const [iterations, setIterations] = useState(250);
  const [isBruteforcing, setIsBruteforcing] = useState(false);
  const [isDeepExploring, setIsDeepExploring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [radarStatus, setRadarStatus] = useState(0);
  const [attackStatus, setAttackStatus] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [topConfigs, setTopConfigs] = useState<Configuration[]>([]);
  const [coverage, setCoverage] = useState(0);
  const [cityCoverage, setCityCoverage] = useState(0);
  const [seaCoverage, setSeaCoverage] = useState(0);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [placementStrategy, setPlacementStrategy] = useState<'inside' | 'outside' | 'both'>('inside');
  const [rankingPriorities, setRankingPriorities] = useState<PriorityType[]>(['land', 'urban']);
  const [stopMode, setStopMode] = useState<'cycles' | 'target'>('target');
  const [targetPercent, setTargetPercent] = useState(100);
  const [optPhase, setOptPhase] = useState<'SEARCH' | 'ENGAGEMENT' | 'DUAL' | 'DEEP'>('SEARCH');
  const [hasImported, setHasImported] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bruteforceRef = useRef<boolean>(false);

  useEffect(() => {
    fetch(SRI_LANKA_GEOJSON_URL)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load map data", err));

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    const lastDismissedStr = localStorage.getItem('sl_defense_welcome_dismissed_time');
    const currentTime = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (!lastDismissedStr || (currentTime - parseInt(lastDismissedStr)) > TWENTY_FOUR_HOURS) {
      setShowWelcome(true);
    }

    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('sl_defense_welcome_dismissed_time', Date.now().toString());
  };

  useEffect(() => {
    if (systems.length > 0) {
      const scores = Solver.calculateScores(systems, geoData);
      setCoverage(scores.combinedLand);
      setCityCoverage(scores.combinedCities);
      setSeaCoverage(scores.combinedSea);
    } else {
      setCoverage(0);
      setCityCoverage(0);
      setSeaCoverage(0);
    }
  }, [systems, geoData]);

  const totalCost = systems.reduce((acc, s) => acc + s.systemCost, 0);

  const loadStrategicPreset = () => {
    setSystems(ELITE_PRESET_SYSTEMS.map(s => ({ ...s, isActive: true })));
    setUnitCounts({ 
      'Barak-8': 3, 
      'Iron Beam': 3, 
      'JY-27': 1, 
      'YLC-18': 3 
    });
    setSelectedConfigId("elite-preset");
    const scores = Solver.calculateScores(ELITE_PRESET_SYSTEMS, geoData);
    setRadarStatus(scores.radarLand);
    setAttackStatus(scores.attackLand);
    setHasImported(true);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const updateUnitCount = (catName: string, delta: number) => {
    setUnitCounts(prev => ({
      ...prev,
      [catName]: Math.max(0, (prev[catName] || 0) + delta)
    }));
    if (!selectedTemplates.includes(catName) && delta > 0) {
      setSelectedTemplates(prev => [...prev, catName]);
    }
  };

  const toggleTemplate = (catName: string) => {
    setSelectedTemplates(prev => {
      if (prev.includes(catName)) {
        return prev.length > 1 ? prev.filter(c => c !== catName) : prev;
      }
      if (!(unitCounts[catName]! > 0)) {
        setUnitCounts(curr => ({ ...curr, [catName]: 1 }));
      }
      return [...prev, catName];
    });
  };

  const toggleUnitActive = (id: string) => {
    setSystems(prev => prev.map(s => s.id === id ? { ...s, isActive: s.isActive === false } : s));
  };

  const toggleInventoryCat = (name: string) => {
    setExpandedInventory(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const registerCustomAsset = () => {
    const newTemplate: SystemTemplate = {
      category: 'Custom',
      ...workshopConfig,
    };
    if (customArsenal.some(t_arsenal => t_arsenal.name === workshopConfig.name)) {
      alert("An asset with this name already exists in your arsenal.");
      return;
    }
    setCustomArsenal(prev => [...prev, newTemplate]);
    setUnitCounts(prev => ({ ...prev, [workshopConfig.name]: 1 }));
    setSelectedTemplates(prev => [...prev, workshopConfig.name]);
    setWorkshopMode(false);
  };

  const togglePriority = (p: PriorityType) => {
    setRankingPriorities(prev => 
      prev.includes(p) 
        ? (prev.length > 1 ? prev.filter(item => item !== p) : prev) 
        : [...prev, p]
    );
  };

  const executeOptimization = async (deepMode: boolean = false) => {
    const activeUnitCounts = selectedTemplates.reduce((acc, name) => {
      if (unitCounts[name] > 0) {
        acc[name] = unitCounts[name];
      }
      return acc;
    }, {} as Record<string, number>);

    if (isBruteforcing || isDeepExploring || Object.keys(activeUnitCounts).length === 0) return;
    
    if (deepMode) setIsDeepExploring(true);
    else setIsBruteforcing(true);
    
    bruteforceRef.current = true;
    let configs: Configuration[] = [...topConfigs];
    let currentIteration = 0;
    setProgress(0);

    while (bruteforceRef.current) {
      currentIteration++;
      setTotalCycles(prev => prev + 1);

      const best = configs[0];
      const currentScores = best ? Solver.calculateScores(best.systems, geoData) : null;
      const isRadarSecure = currentScores ? (currentScores.radarLand >= targetPercent) : false;
      const isAttackSecure = currentScores ? (currentScores.attackLand >= targetPercent) : false;
      
      if (deepMode) setOptPhase('DEEP');
      else if (!isRadarSecure) setOptPhase('SEARCH');
      else if (!isAttackSecure) setOptPhase('ENGAGEMENT');
      else setOptPhase('DUAL');

      let testSystems;
      if (best && Math.random() > 0.2) {
        testSystems = Solver.mutateDeployment(best.systems, isRadarSecure, geoData, placementStrategy, deepMode);
      } else {
        testSystems = Solver.generateRandomDeploymentWithCounts(activeUnitCounts, placementStrategy, geoData, allTemplatesMap);
      }

      const scores = Solver.calculateScores(testSystems, geoData);
      setRadarStatus(scores.radarLand);
      setAttackStatus(scores.attackLand);
      
      let aggregatedMetric = 0;
      rankingPriorities.forEach(p => {
        if (p === 'land') aggregatedMetric += scores.combinedLand;
        if (p === 'urban') aggregatedMetric += scores.combinedCities;
        if (p === 'sea') aggregatedMetric += scores.combinedSea;
      });
      aggregatedMetric /= rankingPriorities.length;

      configs.push({
        id: generateId(),
        systems: testSystems.map(s => ({ ...s, isActive: true })),
        coverage: scores.combinedLand,
        cityCoverage: scores.combinedCities,
        seaCoverage: scores.combinedSea,
        totalCost: testSystems.reduce((acc, s) => acc + s.systemCost, 0),
        analysis: Solver.generateAnalysis(scores, rankingPriorities),
        timestamp: Date.now()
      });

      configs.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        rankingPriorities.forEach(p => {
          if (p === 'land') { scoreA += a.coverage; scoreB += b.coverage; }
          if (p === 'urban') { scoreA += a.cityCoverage!; scoreB += b.cityCoverage!; }
          if (p === 'sea') { scoreA += a.seaCoverage!; scoreB += b.seaCoverage!; }
        });
        return (scoreB / rankingPriorities.length) - (scoreA / rankingPriorities.length);
      });

      configs = configs.slice(0, 20);
      setTopConfigs(configs);

      if (deepMode) {
        setProgress((currentIteration % 100));
      } else if (stopMode === 'cycles' && currentIteration >= iterations) break;
      else if (stopMode === 'target' && isRadarSecure && aggregatedMetric >= targetPercent) break;

      if (currentIteration % 4 === 0) {
        setSystems(configs[0].systems);
        setSelectedConfigId(configs[0].id);
      }

      if (currentIteration >= 50000) break;
      await new Promise(r => setTimeout(r, 4));
    }
    setIsBruteforcing(false);
    setIsDeepExploring(false);
    setHasImported(false);
  };

  const stopBruteforce = () => {
    bruteforceRef.current = false;
    setIsBruteforcing(false);
    setIsDeepExploring(false);
  };

  const saveCurrentToConfigs = () => {
    if (systems.length === 0) return;
    const scores = Solver.calculateScores(systems, geoData);
    const newConfig: Configuration = {
      id: generateId(),
      systems: JSON.parse(JSON.stringify(systems)),
      coverage: scores.combinedLand,
      cityCoverage: scores.combinedCities,
      seaCoverage: scores.combinedSea,
      totalCost: systems.reduce((acc, s) => acc + s.systemCost, 0),
      analysis: "[SNAPSHOT] Optimized Defense Tier",
      timestamp: Date.now()
    };
    setTopConfigs([newConfig, ...topConfigs].slice(0, 20));
    setSelectedConfigId(newConfig.id);
  };

  const applyConfig = (config: Configuration) => {
    setSystems([...config.systems].map(s => ({ ...s, isActive: s.isActive ?? true })));
    setSelectedConfigId(config.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const clearAll = () => {
    setSystems([]);
    setUnitCounts({ 
      'Barak-8': 0, 
      'Iron Beam': 0, 
      'JY-27': 0, 
      'YLC-18': 0 
    });
    setTopConfigs([]);
    setSelectedConfigId(null);
    setCoverage(0);
    setCityCoverage(0);
    setSeaCoverage(0);
    setProgress(0);
    setTotalCycles(0);
    setRadarStatus(0);
    setAttackStatus(0);
    setHasImported(false);
    setSimulationMode(false);
  };

  const addManualSystem = (e: L.LeafletMouseEvent) => {
    if (!manualMode || simulationMode) return;
    const activeTemplateName = selectedTemplates[selectedTemplates.length - 1];
    const template = allTemplatesMap[activeTemplateName];
    if (!template) return;
    
    const tKey = `target_${template.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    setSystems([...systems, { 
      id: generateId(), 
      lat: e.latlng.lat, 
      lng: e.latlng.lng, 
      ...template,
      targetType: tKey,
      isActive: true,
      name: `${template.name || template.category}-${systems.length + 1}` 
    }]);
    setSelectedConfigId(null);
  };

  const handleDropSystem = useCallback((lat: number, lng: number, templateName: string) => {
    const template = allTemplatesMap[templateName];
    if (!template) return;
    
    const tKey = `target_${template.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    setSystems(prev => [...prev, { 
      id: generateId(), 
      lat, 
      lng, 
      ...template,
      targetType: tKey,
      isActive: true,
      name: `${template.name || template.category}-${prev.length + 1}` 
    }]);
    setSelectedConfigId(null);
  }, [allTemplatesMap]);

  const handleRemoveSystem = (id: string) => {
    setSystems(prev => prev.filter(s => s.id !== id));
    setSelectedConfigId(null);
  };

  const handleMoveSystem = (id: string, lat: number, lng: number) => {
    setSystems(prev => prev.map(s => s.id === id ? { ...s, lat, lng } : s));
    setSelectedConfigId(null);
  };

  const handleExport = () => {
    const exportData = { 
      version: "6.3", 
      objectives: { stopMode, stopValue: stopMode === 'cycles' ? iterations : targetPercent, unitCounts, rankingPriorities },
      results: { combinedCoverage: coverage, cityCoverage, seaCoverage, totalCost },
      activeSystems: systems,
      customArsenal,
      optimalConfigs: topConfigs 
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SL_IADS_Bundle_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.optimalConfigs) {
          const importedConfigs = json.optimalConfigs.slice(0, 20);
          setTopConfigs(importedConfigs);
          if (json.customArsenal) setCustomArsenal(json.customArsenal);
          if (json.activeSystems) setSystems(json.activeSystems.map((s: any) => ({ ...s, isActive: s.isActive ?? true })));
          else if (importedConfigs.length > 0) setSystems(importedConfigs[0].systems.map(s => ({ ...s, isActive: true })));
          setSelectedConfigId(json.activeSystems ? null : importedConfigs[0]?.id);
          if (json.objectives?.unitCounts) setUnitCounts(json.objectives.unitCounts);
          if (json.objectives?.stopMode) setStopMode(json.objectives.stopMode);
          if (json.objectives?.stopValue) {
            if (json.objectives.stopMode === 'cycles' || json.objectives.stopMode === 'target') {
              if (json.objectives.stopMode === 'cycles') setIterations(json.objectives.stopValue);
              else setTargetPercent(json.objectives.stopValue);
            }
          }
          setHasImported(true);
        }
      } catch (err) {
        alert("Invalid strategy bundle format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleTheme = () => {
    setMapTheme(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'warm';
      return 'dark';
    });
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'si' : 'en');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleScreenshot = async () => {
    const element = document.body;
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: mapTheme === 'dark' ? '#020617' : mapTheme === 'warm' ? '#eee8d5' : '#f8fafc',
      scale: 2,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `SL_Defense_Snapshot_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const isAnyOptimizing = isBruteforcing || isDeepExploring;
  const uiTemplates = [
    ...Object.values(SYSTEM_TEMPLATES).filter(template => template.category !== 'Custom'),
    ...customArsenal
  ];

  const sidebarThemeClass = mapTheme === 'dark' ? 'bg-slate-900/40 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/90 border-[#eee8d5]' : 'bg-white/80 border-slate-200';
  const textThemeClass = mapTheme === 'dark' ? 'text-white' : mapTheme === 'warm' ? 'text-[#586e75]' : 'text-slate-900';
  const gridThemeClass = mapTheme === 'dark' ? 'bg-grid-white/[0.02]' : mapTheme === 'warm' ? 'bg-grid-amber-900/[0.03]' : 'bg-grid-slate-900/[0.02]';

  const systemSummary = useMemo(() => {
    const summary: Record<string, { count: number, color: string, role: SystemRole, systems: DefenseSystem[] }> = {};
    systems.forEach(s => {
      const key = s.category === 'Custom' ? s.name : s.category;
      if (!key) return;
      if (!summary[key]) {
        summary[key] = { count: 0, color: s.color, role: s.role, systems: [] };
      }
      summary[key].count++;
      summary[key].systems.push(s);
    });
    return summary;
  }, [systems]);

  const toggleZenMode = () => setIsZenMode(!isZenMode);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className={`flex h-screen ${mapTheme === 'dark' ? 'bg-[#020617]' : mapTheme === 'warm' ? 'bg-[#eee8d5]' : 'bg-[#f8fafc]'} text-slate-100 font-sans overflow-hidden transition-colors duration-300`}>
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
      
      {showWelcome && <WelcomeModal onClose={handleDismissWelcome} lang={lang} onToggleLang={toggleLang} mapTheme={mapTheme} />}
      {showAbout && <AboutPanel onClose={() => setShowAbout(false)} lang={lang} mapTheme={mapTheme} />}

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2001] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {!isZenMode && (
        <aside className={`
          fixed inset-y-0 left-0 z-[2002] w-full max-w-[440px] ${sidebarThemeClass} backdrop-blur-3xl border-r flex flex-col shadow-2xl transition-all duration-500
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative md:z-[1001]'}
          ${isSidebarCollapsed ? 'md:w-0 md:max-w-0 md:opacity-0 md:-translate-x-full' : ''}
        `}>
          <div className={`absolute inset-0 ${gridThemeClass} pointer-events-none`} />
          
          <div className={`p-6 md:p-8 border-b ${mapTheme === 'dark' ? 'border-white/10' : mapTheme === 'warm' ? 'border-[#eee8d5]' : 'border-slate-200'} bg-gradient-to-br from-blue-500/10 via-transparent to-transparent flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-2.5 rounded-xl border border-white/20 shadow-2xl">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-black tracking-tighter ${textThemeClass} uppercase leading-none`}>{t('app_title')}</h1>
                <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                  <Radio className="w-3 h-3 animate-ping" /> {t('spatial_hardware_grid')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleSidebarCollapse}
                className={`hidden md:flex p-2 ${mapTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'} hover:text-blue-500 transition-colors`}
                title={t('collapse_sidebar')}
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
              <button 
                className={`md:hidden p-2 ${mapTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'} hover:text-blue-500 transition-colors`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar relative">
            <div className="flex flex-col gap-2">
              <button 
                onClick={loadStrategicPreset} 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 p-4 rounded-xl border border-white/10 flex items-center gap-4 transition-all shadow-xl group"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white uppercase tracking-wider">{t('deploy_elite')}</div>
                  <div className="text-[9px] font-bold text-white/60 uppercase mt-0.5">{t('strategic_snapshots')}</div>
                </div>
              </button>
              <button 
                onClick={() => setWorkshopMode(!workshopMode)} 
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all shadow-xl group ${workshopMode ? 'bg-indigo-600 border-indigo-400 shadow-indigo-500/20' : mapTheme === 'dark' ? 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60' : mapTheme === 'warm' ? 'bg-[#fdf6e3] border-[#eee8d5] hover:bg-[#eee8d5]/80' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
              >
                <div className={`p-2 rounded-lg ${workshopMode ? 'bg-white/20' : 'bg-indigo-500/20'}`}>
                  <Wrench className={`w-5 h-5 ${workshopMode ? 'text-white' : 'text-indigo-400'}`} />
                </div>
                <div className="text-left">
                  <div className={`text-xs font-black ${workshopMode ? 'text-white' : textThemeClass} uppercase tracking-wider`}>{t('custom_workshop')}</div>
                  <div className={`text-[9px] font-bold ${workshopMode ? 'text-white/60' : 'text-slate-500'} uppercase mt-0.5`}>{workshopMode ? t('bespoke_hardware') : t('design_tech')}</div>
                </div>
              </button>
            </div>

            {workshopMode && (
              <section className={`${mapTheme === 'dark' ? 'bg-indigo-950/30' : mapTheme === 'warm' ? 'bg-[#fdf6e3]' : 'bg-indigo-50'} border border-indigo-500/30 p-5 rounded-2xl space-y-4 animate-in zoom-in-95 slide-in-from-top-4 duration-300`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-2"><Edit3 className="w-3.5 h-3.5" /> {t('blueprint_config')}</h2>
                  <div className={`flex ${mapTheme === 'dark' ? 'bg-slate-950' : 'bg-white'} p-1 rounded-lg border border-white/5`}>
                      <button onClick={() => setWorkshopConfig(config => ({...config, role: 'INTERCEPTOR'}))} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${workshopConfig.role === 'INTERCEPTOR' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>{t('attack')}</button>
                      <button onClick={() => setWorkshopConfig(config => ({...config, role: 'RADAR'}))} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${workshopConfig.role === 'RADAR' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}>{t('radar')}</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase block mb-1 tracking-widest">{t('asset_title')}</label>
                    <input type="text" value={workshopConfig.name} onChange={e => setWorkshopConfig(config => ({...config, name: e.target.value}))} placeholder="e.g., Eagle SAM" className={`w-full ${mapTheme === 'dark' ? 'bg-slate-950/50 text-white' : 'bg-white text-slate-900'} border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase block mb-1 tracking-widest">{t('radius_km')}</label>
                      <input type="number" value={workshopConfig.range} onChange={e => setWorkshopConfig(config => ({...config, range: Number(e.target.value)}))} className={`w-full ${mapTheme === 'dark' ? 'bg-slate-950/50 text-white' : 'bg-white text-slate-900'} border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none`} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase block mb-1 tracking-widest">{t('capital_m')}</label>
                      <input type="number" value={workshopConfig.systemCost} onChange={e => setWorkshopConfig(config => ({...config, systemCost: Number(e.target.value)}))} className={`w-full ${mapTheme === 'dark' ? 'bg-slate-950/50 text-white' : 'bg-white text-slate-900'} border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none`} />
                    </div>
                  </div>
                  {workshopConfig.role === 'INTERCEPTOR' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase block mb-1 tracking-widest">{t('per_shot')}</label>
                        <input type="text" value={workshopConfig.shotCost} onChange={e => setWorkshopConfig(config => ({...config, shotCost: e.target.value}))} className={`w-full ${mapTheme === 'dark' ? 'bg-slate-950/50 text-white' : 'bg-white text-slate-900'} border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none`} />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase block mb-1 tracking-widest">{t('velocity')}</label>
                        <input type="number" step="0.1" value={workshopConfig.shotSpeed} onChange={e => setWorkshopConfig(config => ({...config, shotSpeed: Number(e.target.value)}))} className={`w-full ${mapTheme === 'dark' ? 'bg-slate-950/50 text-white' : 'bg-white text-slate-900'} border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none`} />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase block mb-1 tracking-widest">{t('color_matrix')}</label>
                    <div className="grid grid-cols-6 gap-2">
                        {WORKSHOP_PALETTE.map(color => {
                          const isReserved = reservedColors.has(color.toLowerCase());
                          const isSelected = workshopConfig.color.toLowerCase() === color.toLowerCase();
                          return (
                            <button 
                              key={color} 
                              disabled={isReserved}
                              onClick={() => setWorkshopConfig(config => ({...config, color}))} 
                              className={`
                                w-full aspect-square rounded-lg border-2 transition-all relative group
                                ${isSelected ? 'border-white scale-110 shadow-lg z-10' : 'border-transparent hover:scale-105'}
                                ${isReserved ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer'}
                              `} 
                              style={{ backgroundColor: color }} 
                            >
                              {isReserved && <div className="absolute inset-0 flex items-center justify-center"><X className="w-3 h-3 text-white/50" /></div>}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                  <button onClick={registerCustomAsset} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 mt-4 transition-all">
                    <PlusCircle className="w-4 h-4" /> {t('save_arsenal')}
                  </button>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex flex-col">
                  <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${mapTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}>
                    <Wifi className="w-3.5 h-3.5" /> {t('unit_arsenal')}
                  </h2>
                  <span className="text-[8px] text-blue-400 font-bold uppercase mt-1">{t('drag_assets')}</span>
                </div>
                <div className={`flex ${mapTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'} p-1 rounded-lg border border-white/5 self-start`}>
                  <button onClick={() => setActiveRoleTab('INTERCEPTOR')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${activeRoleTab === 'INTERCEPTOR' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>{t('attack').toUpperCase()}</button>
                  <button onClick={() => setActiveRoleTab('RADAR')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${activeRoleTab === 'RADAR' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>{t('radar').toUpperCase()}</button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {uiTemplates.filter(template_ui => template_ui.role === activeRoleTab).map((template) => {
                  const nameKey = template.name || template.category;
                  const isSelected = selectedTemplates.includes(nameKey);
                  const count = unitCounts[nameKey] || 0;
                  const isCustom = template.category === 'Custom';
                  
                  const tKey = `target_${template.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

                  return (
                    <div 
                      key={nameKey} 
                      draggable 
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', nameKey);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className={`p-4 rounded-xl border transition-all flex flex-col group relative overflow-hidden cursor-grab active:cursor-grabbing ${isSelected ? mapTheme === 'dark' ? 'border-blue-500 shadow-lg' : 'border-blue-400 bg-white shadow-md' : mapTheme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3] border-[#eee8d5] hover:border-[#93a1a1]' : 'bg-white border-slate-200 hover:border-slate-300'}`} 
                      style={{ backgroundColor: isSelected && mapTheme === 'dark' ? `${template.color}20` : undefined }}
                    >
                      <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: template.color }} />
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 cursor-pointer" onClick={() => toggleTemplate(nameKey)}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                              <span className={`text-sm font-black uppercase tracking-tight ${textThemeClass}`} style={{ color: template.color }}>{nameKey}</span>
                              {isCustom && <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[7px] font-black uppercase rounded border border-indigo-500/20">{t('custom')}</span>}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 flex items-center gap-1.5 pl-5"><Target className="w-3 h-3 text-slate-600" /> {t(tKey)}</span>
                          </div>
                        </div>
                        <div className={`flex items-center ${mapTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'} rounded-lg p-1 border border-white/5 ml-2`}>
                          <button onClick={(e) => { e.stopPropagation(); updateUnitCount(nameKey, -1); }} className="p-1 hover:text-blue-400 text-slate-500 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                          <span className={`px-2 text-xs font-black min-w-[20px] text-center ${count > 0 ? textThemeClass : 'text-slate-600'}`}>{count}</span>
                          <button onClick={(e) => { e.stopPropagation(); updateUnitCount(nameKey, 1); }} className="p-1 hover:text-blue-400 text-slate-500 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1 pl-5">
                        <div className={`flex items-center gap-1.5 ${mapTheme === 'dark' ? 'bg-slate-950/50' : mapTheme === 'warm' ? 'bg-[#eee8d5]' : 'bg-slate-50'} px-2 py-1.5 rounded-md border border-white/5`}>
                          <Coins className="w-3 h-3 text-emerald-500" />
                          <div className="flex flex-col">
                             <span className="text-[7px] text-slate-500 font-bold uppercase leading-none mb-0.5">{t('asset_cost')}</span>
                             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">${template.systemCost}M</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 ${mapTheme === 'dark' ? 'bg-slate-950/50' : mapTheme === 'warm' ? 'bg-[#eee8d5]' : 'bg-slate-50'} px-2 py-1.5 rounded-md border border-white/5`}>
                          <Activity className="w-3 h-3 text-blue-500" />
                          <div className="flex flex-col">
                             <span className="text-[7px] text-slate-500 font-bold uppercase leading-none mb-0.5">{t('range')}</span>
                             <span className={`text-[9px] font-black ${mapTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'} uppercase tracking-wider`}>{template.range}KM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${mapTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}><BarChart3 className="w-3.5 h-3.5" /> {t('strategic_priorities')}</h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'land' as PriorityType, label: t('priority_land'), icon: Globe }, 
                  { id: 'urban' as PriorityType, label: t('priority_city'), icon: Building2 }, 
                  { id: 'sea' as PriorityType, label: t('priority_sea'), icon: Anchor }
                ].map((f) => {
                  const isActive = rankingPriorities.includes(f.id);
                  return (
                    <button key={f.id} onClick={() => togglePriority(f.id)} className={`flex flex-col items-center py-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all border ${isActive ? `bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/10` : mapTheme === 'dark' ? 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300' : mapTheme === 'warm' ? 'bg-[#fdf6e3] border-[#eee8d5] text-[#586e75] hover:bg-[#eee8d5]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}`}><f.icon className={`w-4 h-4 mb-1.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />{f.label}</button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-5 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${mapTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}><Target className="w-3.5 h-3.5" /> {t('mission_parameters')}</h2>
                <div className={`flex ${mapTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'} p-1 rounded-lg border border-white/5`}>
                  <button onClick={() => setStopMode('target')} className={`p-1.5 rounded-md transition-all ${stopMode === 'target' ? 'bg-blue-600 text-white' : 'text-slate-500'}`} title="Target Combined Score"><Target className="w-3 h-3" /></button>
                  <button onClick={() => setStopMode('cycles')} className={`p-1.5 rounded-md transition-all ${stopMode === 'cycles' ? 'bg-blue-600 text-white' : 'text-slate-500'}`} title="Fixed Cycles"><Activity className="w-3 h-3" /></button>
                </div>
              </div>
              <div className={`${mapTheme === 'dark' ? 'bg-slate-950/40' : 'bg-slate-100'} p-3 rounded-xl border border-white/5`}>
                <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase">{stopMode === 'target' ? t('goal_milestone') : t('cycles')}</span><span className={`text-sm font-black ${textThemeClass}`}>{stopMode === 'target' ? `${targetPercent}%` : iterations}</span></div>
                <input type="range" min={stopMode === 'target' ? "5" : "10"} max={stopMode === 'target' ? "100" : "2000"} step={stopMode === 'cycles' ? "10" : "1"} value={stopMode === 'target' ? targetPercent : iterations} onChange={(e) => stopMode === 'target' ? setTargetPercent(Number(e.target.value)) : setIterations(Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
            </section>

            <section className="space-y-2">
              {!isAnyOptimizing ? (
                <div className="flex flex-col gap-2">
                  <button onClick={() => executeOptimization(false)} className={`group w-full ${hasImported ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'} text-white font-black py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3`}>
                    <Cpu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    {hasImported ? t('resume_calc').toUpperCase() : t('start_search').toUpperCase()}
                  </button>
                  <button onClick={() => executeOptimization(true)} className="group w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-black py-3 rounded-xl transition-all shadow-xl border border-white/10 flex items-center justify-center gap-3">
                    <Dna className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    {t('maxima_search').toUpperCase()}
                  </button>
                </div>
              ) : (
                <div className={`p-4 rounded-xl border ${isDeepExploring ? 'bg-purple-900/40 border-purple-500/50' : 'bg-slate-800/80 border-blue-500/30'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      {optPhase === 'DEEP' ? <Zap className="w-4 h-4 text-amber-400 animate-bounce" /> : <Search className="w-4 h-4 text-blue-400 animate-pulse" />}
                      <span className="text-[10px] font-black text-white uppercase">{isDeepExploring ? t('calculating') : t('phase_grid')}</span>
                    </div>
                    <button onClick={stopBruteforce} className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase">{t('stop')}</button>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>{t('sensor_coverage')}</span><span>{radarStatus.toFixed(1)}%</span></div>
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden"><div style={{ width: `${Math.min(100, (radarStatus/targetPercent)*100)}%` }} className="h-full bg-amber-500 transition-all duration-300" /></div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>{t('combat_shield')}</span><span>{attackStatus.toFixed(1)}%</span></div>
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden"><div style={{ width: `${Math.min(100, (attackStatus/targetPercent)*100)}%` }} className="h-full bg-blue-500 transition-all duration-300" /></div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden"><div style={{ width: `${progress}%` }} className={`h-full transition-all duration-300 ${isDeepExploring ? 'bg-purple-500' : 'bg-emerald-500'}`} /></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={saveCurrentToConfigs} disabled={systems.length === 0} className={`${mapTheme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'} text-white text-[10px] font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50`}><Save className="w-3.5 h-3.5" /> {t('snapshot').toUpperCase()}</button>
                <button onClick={clearAll} className={`${mapTheme === 'dark' ? 'bg-white/5 hover:bg-red-500/10' : mapTheme === 'warm' ? 'bg-white/40 hover:bg-red-50' : 'bg-slate-100 hover:bg-red-50'} text-slate-400 text-[10px] font-black py-3 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2`}><RefreshCw className="w-3.5 h-3.5" /> {t('reset').toUpperCase()}</button>
              </div>
            </section>

            {topConfigs.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${mapTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}><Award className="w-3.5 h-3.5" /> {t('ranked_plans')}</h2>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tabular-nums">{topConfigs.length}/20</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {topConfigs.map((config, idx) => {
                    let avgMetric = 0;
                    rankingPriorities.forEach(p => {
                      if (p === 'land') avgMetric += config.coverage;
                      if (p === 'urban') avgMetric += config.cityCoverage!;
                      if (p === 'sea') avgMetric += config.seaCoverage!;
                    });
                    avgMetric /= rankingPriorities.length;
                    return (
                      <button key={config.id} onClick={() => applyConfig(config)} className={`w-full p-3 rounded-xl border transition-all text-left flex flex-col gap-2 group mb-2 ${selectedConfigId === config.id ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/5' : mapTheme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3] border-[#eee8d5] hover:bg-[#eee8d5]' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center font-black text-[10px] ${selectedConfigId === config.id ? 'bg-blue-500 text-white' : mapTheme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</div>
                            <div><div className={`text-sm font-black ${textThemeClass} leading-none`}>{avgMetric.toFixed(1)}%</div><div className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">${config.totalCost}M • {config.systems.length} Assets</div></div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className={`p-6 md:p-8 ${mapTheme === 'dark' ? 'bg-slate-950 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#eee8d5]' : 'bg-slate-100 border-slate-200'} border-t shadow-[0_-10px_30px_rgba(0,0,0,0.2)]`}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`${mapTheme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'} p-3 rounded-xl border border-white/5`}><div className="text-[9px] font-bold text-slate-500 uppercase mb-1">{t('total_cost')}</div><div className="text-xl font-black text-emerald-400 tracking-tighter">${totalCost}M</div></div>
              <div className={`${mapTheme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'} p-3 rounded-xl border border-white/5`}><div className="text-[9px] font-bold text-slate-500 uppercase mb-1">{t('grid_shield')}</div><div className="text-xl font-black text-blue-400 tracking-tighter">{coverage.toFixed(1)}%</div></div>
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                  <a href="https://www.ishanoshada.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 hover:text-blue-400 transition-all uppercase tracking-[0.2em] group">
                    <Globe className="w-2.5 h-2.5 group-hover:rotate-12 transition-transform" /> ishanoshada.com
                  </a>
                  <a href="https://github.com/ishanoshada/National-Defense-Grid" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-[0.2em] group">
                    <Github className="w-2.5 h-2.5 group-hover:scale-110 transition-transform" /> Repository
                  </a>
              </div>
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {!isZenMode && (
          <div className={`flex md:hidden items-center justify-between p-4 ${mapTheme === 'dark' ? 'bg-slate-950/80' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80' : 'bg-white/80'} backdrop-blur-md border-b ${mapTheme === 'dark' ? 'border-white/10' : mapTheme === 'warm' ? 'border-[#eee8d5]' : 'border-slate-200'} z-[1000]`}>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-sm font-black uppercase tracking-tight ${textThemeClass}`}>{t('app_title')}</h1>
                <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">Operational</div>
              </div>
            </div>
            <button 
              className={`p-2 ${mapTheme === 'dark' ? 'bg-slate-900 border-white/10' : mapTheme === 'warm' ? 'bg-[#eee8d5] border-[#93a1a1]' : 'bg-white border-slate-200'} border rounded-xl`}
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className={`w-5 h-5 ${mapTheme === 'dark' ? 'text-white' : 'text-slate-700'}`} />
            </button>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          <MapContainer 
            center={[7.8731, 80.7718]} 
            zoom={7} 
            className="w-full h-full" 
            zoomControl={false}
            preferCanvas={true} 
          >
            <TileLayer url={mapTheme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : mapTheme === 'warm' ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"} />
            <MapController geoData={geoData} />
            <MapEvents onMapClick={addManualSystem} activeMode={manualMode} onDropSystem={handleDropSystem} />
            {geoData && <GeoJSON data={geoData} style={{ fillColor: mapTheme === 'dark' ? "#0f172a" : mapTheme === 'warm' ? "#fdf6e3" : "#f1f5f9", weight: 1.5, opacity: 0.8, color: mapTheme === 'dark' ? "#1e293b" : mapTheme === 'warm' ? "#93a1a1" : "#cbd5e1", fillOpacity: mapTheme === 'dark' ? 0.2 : mapTheme === 'warm' ? 0.1 : 0.4 }} />}
            {systems.map((sys) => (
              <React.Fragment key={sys.id}>
                {sys.isActive !== false && (
                  <>
                    <Circle 
                      center={[sys.lat, sys.lng]} 
                      radius={sys.range * 1000} 
                      pathOptions={{ 
                        fillColor: sys.color, 
                        color: sys.color, 
                        weight: 2, 
                        fillOpacity: sys.role === 'RADAR' ? 0.08 : 0.12, 
                        dashArray: sys.role === 'RADAR' ? '10, 15' : undefined 
                      }} 
                    />
                    <Polyline 
                      positions={[
                        [sys.lat, sys.lng], 
                        [sys.lat, sys.lng + (sys.range / (111 * Math.cos(sys.lat * Math.PI / 180)))]
                      ]} 
                      pathOptions={{ 
                        color: sys.color, 
                        weight: 1, 
                        dashArray: '4, 6', 
                        opacity: 0.4 
                      }} 
                    />
                  </>
                )}
                <Marker opacity={sys.isActive !== false ? 1 : 0.3} position={[sys.lat, sys.lng]} draggable={manualMode && !simulationMode} eventHandlers={{ dragend: (e) => { const marker = e.target; const pos = marker.getLatLng(); handleMoveSystem(sys.id, pos.lat, pos.lng); } }} icon={L.divIcon({ className: 'radar-node', html: `<div class="relative w-12 h-12 flex items-center justify-center"><div class="absolute inset-0 rounded-full ${sys.isActive !== false ? 'animate-ping' : ''} opacity-30" style="background-color: ${sys.color}"></div><div class="w-6 h-6 rounded-lg border-2 border-white shadow-2xl relative z-10 flex items-center justify-center" style="background-color: ${sys.color}"><div class="w-2.5 h-2.5 bg-white ${sys.role === 'RADAR' ? 'rounded-full' : 'rounded-sm'}"></div></div></div>`, iconSize: [48, 48], iconAnchor: [24, 24] })}>
                  <Popup className="tech-popup">
                    <div className={`${mapTheme === 'dark' ? 'bg-slate-950' : mapTheme === 'warm' ? 'bg-[#fdf6e3]' : 'bg-white'} p-4 text-slate-100 rounded-xl border ${mapTheme === 'dark' ? 'border-white/10' : mapTheme === 'warm' ? 'border-[#eee8d5]' : 'border-slate-200'} min-w-[280px] shadow-2xl`}>
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                        <div className="p-1.5 rounded-lg shadow-inner" style={{ backgroundColor: `${sys.color}20` }}>
                          <Shield className="w-5 h-5" style={{ color: sys.color }} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black uppercase tracking-widest ${textThemeClass}`}>{sys.name}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{sys.isActive !== false ? t('active_deployment') : 'DEACTIVATED'}</span>
                        </div>
                      </div>
                      <div className="space-y-3 mb-5">
                        <div className={`flex items-center justify-between p-2 rounded-lg ${mapTheme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} border ${mapTheme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Target className="w-3 h-3" /> {t('target_profile')}</span>
                          <span className={`text-[10px] font-black ${mapTheme === 'dark' ? 'text-white' : 'text-slate-800'} text-right max-w-[140px] leading-tight`}>{t(sys.targetType)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`flex flex-col p-2 rounded-lg ${mapTheme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} border ${mapTheme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                            <span className="text-[8px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Coins className="w-2.5 h-2.5 text-emerald-500" /> {t('hits')}</span>
                            <span className="text-xs font-black text-emerald-400">${sys.systemCost}M</span>
                          </div>
                          <div className={`flex flex-col p-2 rounded-lg ${mapTheme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} border ${mapTheme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                            <span className="text-[8px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Activity className="w-2.5 h-2.5 text-blue-500" /> {t('range')}</span>
                            <span className={`text-xs font-black ${mapTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{sys.range} KM</span>
                          </div>
                        </div>
                      </div>
                      {manualMode && !simulationMode && (
                        <div className="flex flex-col gap-2">
                          <button onClick={() => { 
                            toggleUnitActive(sys.id);
                          }} className={`w-full ${sys.isActive === false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'} text-[10px] font-black py-3 rounded-lg border flex items-center justify-center gap-2 transition-all`}>
                            {sys.isActive === false ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            {sys.isActive === false ? 'REACTIVATE UNIT' : 'DEACTIVATE UNIT'}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveSystem(sys.id); }} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black py-3 rounded-lg border border-red-500/20 flex items-center justify-center gap-2 transition-all">
                            <Trash2 className="w-4 h-4" /> {t('decommission').toUpperCase()}
                          </button>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
            {CITIES.map((city) => (
              <Marker key={city.name} position={[city.lat, city.lng]} icon={L.divIcon({ className: 'city-label', html: `<div class="flex flex-col items-center"><div class="w-1.5 h-1.5 bg-blue-400 rounded-full border border-white shadow-[0_0_8px_#3b82f6]"></div><span class="text-[8px] font-bold ${mapTheme === 'dark' ? 'text-white/70' : mapTheme === 'warm' ? 'text-[#93a1a1]' : 'text-slate-700/80'} uppercase tracking-tighter mt-1 whitespace-nowrap ${mapTheme === 'dark' ? 'bg-slate-950/90' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/90 shadow-sm border-[#eee8d5]' : 'bg-white/90 shadow-sm'} px-1 py-0.5 rounded-md border border-white/10">${city.name}</span></div>`, iconSize: [80, 40], iconAnchor: [40, 10] })} />
            ))}
            {!isZenMode && <AttackSimulator active={simulationMode} systems={systems} onDeactivate={() => setSimulationMode(false)} geoData={geoData} mapTheme={mapTheme} threatColor={threatColor} setThreatColor={setThreatColor} lang={lang} t={t} />}
          </MapContainer>

          {showStressTest && <StressTest systems={systems} geoData={geoData} onClose={() => setShowStressTest(false)} mapTheme={mapTheme} lang={lang} t={t} />}

          {!isZenMode && (
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none flex flex-col gap-3">
              <div className={`${mapTheme === 'dark' ? 'bg-slate-950/60' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#eee8d5]' : 'bg-white/80 shadow-lg'} backdrop-blur-xl p-4 rounded-2xl border flex flex-col gap-1 hidden md:block`}>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  <Scan className="w-3 h-3" /> {t('spatial_hardware_grid')}
                </div>
                <div className={`text-2xl font-black ${textThemeClass} tracking-tighter tabular-nums leading-none`}>
                  {lang === 'en' ? 'DEPLOYED' : 'ස්ථාපිතයි'}: <span className="text-blue-400 font-mono">#{systems.length}</span>
                </div>
              </div>

              {systems.length > 0 && (
                <div className={`${mapTheme === 'dark' ? 'bg-slate-950/60' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#eee8d5]' : 'bg-white/80 shadow-lg'} backdrop-blur-xl p-4 rounded-2xl border flex flex-col gap-3 hidden md:block w-64 animate-in slide-in-from-left-4 duration-500 pointer-events-auto`}>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Box className="w-3 h-3" /> {lang === 'en' ? 'INVENTORY' : 'ඒකක ගබඩාව'}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {(Object.entries(systemSummary) as [string, any][]).map(([name, data]) => {
                      const isExpanded = expandedInventory.includes(name);
                      return (
                        <div key={name} className="flex flex-col border border-white/5 rounded-lg overflow-hidden transition-all bg-black/10">
                          <div 
                            onClick={() => toggleInventoryCat(name)}
                            className={`flex items-center justify-between p-2 cursor-pointer hover:bg-white/5 transition-colors group ${isExpanded ? 'bg-white/5' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                              <span className={`text-[10px] font-black uppercase tracking-tight ${textThemeClass} opacity-80 group-hover:opacity-100`}>{name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <span className="text-[9px] font-mono font-black text-blue-400">x{data.count}</span>
                               {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="flex flex-col gap-1 p-2 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
                              {(data.systems as DefenseSystem[]).map((s, idx) => (
                                <div key={s.id} className="flex items-center justify-between py-1 group/item">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <button 
                                      onClick={() => toggleUnitActive(s.id)}
                                      className={`p-0.5 rounded transition-colors ${s.isActive !== false ? 'text-blue-500 hover:text-blue-600' : 'text-slate-600 hover:text-slate-500'}`}
                                      title={s.isActive !== false ? "Deactivate Unit" : "Activate Unit"}
                                    >
                                      {s.isActive !== false ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                    </button>
                                    <span className={`text-[9px] font-bold uppercase truncate transition-all ${s.isActive !== false ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                                      {s.name}
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-black text-slate-700 opacity-0 group-hover/item:opacity-100 transition-opacity uppercase">Operational</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            {!isZenMode && (
              <>
                <button 
                  onClick={toggleLang} 
                  className={`p-3 md:p-4 rounded-xl border transition-all flex items-center justify-center shadow-2xl backdrop-blur-md ${mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-emerald-400' : 'bg-white/80 border-slate-200 text-emerald-600'}`}
                  title="Change Language / භාෂාව වෙනස් කරන්න"
                >
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 md:w-5 h-5" />
                    <span className="text-[10px] font-black uppercase">{lang === 'en' ? 'EN' : 'SI'}</span>
                  </div>
                </button>

                <button 
                  onClick={toggleTheme} 
                  className={`p-3 md:p-4 rounded-xl border transition-all flex items-center justify-center shadow-2xl backdrop-blur-md ${mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-yellow-400' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#93a1a1] text-amber-700' : 'bg-white/80 border-slate-200 text-blue-600'}`}
                >
                  {mapTheme === 'dark' ? <Sun className="w-4 h-4 md:w-5 h-5" /> : mapTheme === 'light' ? <Coffee className="w-4 h-4 md:w-5 h-5" /> : <Moon className="w-4 h-4 md:w-5 h-5" />}
                </button>
              </>
            )}

            <button 
              onClick={toggleZenMode} 
              className={`p-3 md:p-4 rounded-xl border transition-all flex items-center justify-center shadow-2xl backdrop-blur-md ${isZenMode ? 'bg-blue-600 border-blue-400 text-white' : mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-slate-400' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#93a1a1] text-slate-500' : 'bg-white/80 border-slate-200 text-slate-500'}`}
              title={isZenMode ? t('exit_zen') : t('zen_mode')}
            >
              {isZenMode ? <Eye className="w-4 h-4 md:w-5 h-5" /> : <EyeOff className="w-4 h-4 md:w-5 h-5" />}
            </button>

            {!isZenMode && (
              <>
                <button 
                  onClick={toggleFullScreen} 
                  className={`p-3 md:p-4 rounded-xl border transition-all flex items-center justify-center shadow-2xl backdrop-blur-md ${isFullscreen ? 'bg-blue-600 border-blue-400 text-white' : mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-slate-400' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#93a1a1] text-slate-500' : 'bg-white/80 border-slate-200 text-slate-500'}`}
                  title={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 h-5" /> : <Maximize className="w-4 h-4 md:w-5 h-5" />}
                </button>

                <button 
                  onClick={handleScreenshot} 
                  className={`p-3 md:p-4 rounded-xl border transition-all flex items-center justify-center shadow-2xl backdrop-blur-md ${mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-500'} hover:text-blue-400`}
                  title={t('screenshot')}
                >
                  <Camera className="w-4 h-4 md:w-5 h-5" />
                </button>

                <button 
                  onClick={() => setManualMode(!manualMode)} 
                  className={`p-3 md:p-4 rounded-xl border transition-all flex items-center gap-3 shadow-2xl backdrop-blur-md ${manualMode ? 'bg-blue-600 border-blue-400 text-white' : mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-slate-400' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#93a1a1] text-[#586e75]' : 'bg-white/80 border-slate-200 text-slate-500'}`}
                >
                  <Crosshair className="w-4 h-4 md:w-5 h-5" />
                  <div className="text-left hidden sm:block">
                    <div className="text-[9px] font-black uppercase tracking-widest leading-none">{t('field_command')}</div>
                    <div className="text-[11px] font-bold opacity-80">{manualMode ? t('manual_access') : t('read_only')}</div>
                  </div>
                </button>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setSimulationMode(!simulationMode)} 
                    disabled={systems.length === 0}
                    className={`p-3 md:p-4 rounded-xl border transition-all flex items-center gap-3 shadow-2xl backdrop-blur-md disabled:opacity-50 ${simulationMode ? 'bg-red-600 border-red-400 text-white animate-pulse' : mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-slate-400' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#93a1a1] text-[#586e75]' : 'bg-white/80 border-slate-200 text-slate-500'}`}
                  >
                    <Bomb className="w-4 h-4 md:w-5 h-5" />
                    <div className="text-left hidden sm:block">
                      <div className="text-[9px] font-black uppercase tracking-widest leading-none">{t('stress_sim')}</div>
                      <div className="text-[11px] font-bold opacity-80">{simulationMode ? t('live_engagement') : t('system_ready')}</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setShowStressTest(true)}
                    disabled={systems.length === 0}
                    className={`p-3 md:p-4 rounded-xl border transition-all flex items-center gap-3 shadow-2xl backdrop-blur-md disabled:opacity-50 ${mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-amber-400 hover:text-amber-300' : 'bg-white/80 border-slate-200 text-amber-600 hover:text-amber-500'}`}
                  >
                    <HistoryIcon className="w-4 h-4 md:w-5 h-5" />
                    <div className="text-left hidden sm:block">
                      <div className="text-[9px] font-black uppercase tracking-widest leading-none">{t('batch_sim')}</div>
                      <div className="text-[11px] font-bold opacity-80">{t('high_speed_calc')}</div>
                    </div>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <button onClick={handleImportClick} className={`p-3 md:p-4 rounded-xl border ${mapTheme === 'dark' ? 'bg-slate-950/80 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#93a1a1]' : 'bg-white/80 border-slate-200'} text-slate-400 hover:text-blue-400 transition-all flex items-center gap-3 shadow-2xl backdrop-blur-md`}><Upload className="w-4 h-4 md:w-5 h-5" /><div className="text-[9px] font-black uppercase tracking-widest leading-none hidden sm:block">{t('import')}</div></button>
                  <button onClick={handleExport} className={`p-3 md:p-4 rounded-xl border ${mapTheme === 'dark' ? 'bg-slate-950/80 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/80 border-[#93a1a1]' : 'bg-white/80 border-slate-200'} text-slate-400 hover:text-blue-400 transition-all flex items-center gap-3 shadow-2xl backdrop-blur-md`}><Download className="w-4 h-4 md:w-5 h-5" /><div className="text-[9px] font-black uppercase tracking-widest leading-none hidden sm:block">{t('export')}</div></button>
                </div>
              </>
            )}
          </div>

          <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
            <button 
              onClick={() => setShowAbout(true)}
              className={`p-3 md:p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${mapTheme === 'dark' ? 'bg-slate-900/80 border-white/10 text-indigo-400' : 'bg-white/80 border-slate-200 text-indigo-600'}`}
              title="App Logic & Guide"
            >
              <HelpCircle className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>

          {isSidebarCollapsed && !isZenMode && (
            <button 
              onClick={toggleSidebarCollapse}
              className={`absolute top-1/2 -translate-y-1/2 left-0 z-[1005] p-2 ${mapTheme === 'dark' ? 'bg-slate-900 border-white/10 text-blue-400' : 'bg-white border-slate-200 text-blue-600'} border border-l-0 rounded-r-2xl shadow-2xl transition-all hover:pl-4 animate-in slide-in-from-left-4 duration-300`}
              title={t('expand_sidebar')}
            >
              <PanelLeft className="w-6 h-6" />
            </button>
          )}
        </div>
      </main>

      <style>{`
        .leaflet-container { background: ${mapTheme === 'dark' ? '#020617' : mapTheme === 'warm' ? '#eee8d5' : '#f1f5f9'} !important; } 
        .tech-popup .leaflet-popup-content-wrapper { background: transparent; padding: 0; box-shadow: none; border-radius: 12px; } 
        .tech-popup .leaflet-popup-tip { background: ${mapTheme === 'dark' ? '#020617' : mapTheme === 'warm' ? '#fdf6e3' : '#ffffff'}; } 
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; } 
        input[type="range"] { -webkit-appearance: none; background: transparent; } 
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: #3b82f6; border: 2px solid white; cursor: pointer; margin-top: -5px; } 
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 4px; background: #1e293b; border-radius: 2px; }
        @keyframes blast {
          0% { transform: scale(0.1); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        .animate-blast {
          animation: blast 1.2s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;