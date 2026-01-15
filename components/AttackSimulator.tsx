import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Polyline, Circle, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { DefenseSystem } from '../types';
import { Terminal, FastForward, ShieldAlert, Zap, Target, Cpu, Crosshair, Radio, Flame, Swords, ShieldCheck, Skull, BarChart3, Palette, Rocket, Gauge } from 'lucide-react';
import { SL_BOUNDS, CITIES } from '../constants';
import { Language, TRANSLATIONS } from '../locales/translations';

interface Threat {
  id: string;
  start: L.LatLng;
  target: L.LatLng;
  current: L.LatLng;
  startTime: number;
  status: 'MOVING' | 'INTERCEPTED' | 'IMPACTED';
  speed: number;
  type: string;
  interceptorId?: string;
  interceptorPos?: L.LatLng;
  predictedInterceptPoint?: L.LatLng;
  detectedByRadarId?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
}

interface AttackSimulatorProps {
  active: boolean;
  systems: DefenseSystem[];
  onDeactivate: () => void;
  geoData?: any;
  mapTheme: 'dark' | 'light' | 'warm';
  threatColor: string;
  setThreatColor: (color: string) => void;
  lang: Language;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
}

const BASE_THREAT_SPEED = 0.005;

const MISSILE_TYPES = [
  { id: 'drone', label: 'Suicide Drone', speedMod: 0.6 },
  { id: 'cruise', label: 'Cruise Missile', speedMod: 1.5 },
  { id: 'ballistic', label: 'Ballistic Missile', speedMod: 4.0 },
  { id: 'hypersonic', label: 'Hypersonic', speedMod: 12.0 } 
];

const AttackSimulator: React.FC<AttackSimulatorProps> = ({ active, systems, onDeactivate, geoData, mapTheme, threatColor, setThreatColor, lang, t }) => {
  const [pointAlpha, setPointAlpha] = useState<L.LatLng | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [explosions, setExplosions] = useState<{ id: string; pos: L.LatLng; type: 'impact' | 'intercept' }[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [attackerType, setAttackerType] = useState(MISSILE_TYPES[1]); // Default Cruise
  const [attackerSpeedScale, setAttackerSpeedScale] = useState(1.0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ launched: 0, intercepted: 0, impacted: 0 });

  const speedRef = useRef<number>(speedMultiplier);
  const systemsRef = useRef<DefenseSystem[]>(systems);
  const lastUpdateRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);
  useEffect(() => { systemsRef.current = systems; }, [systems]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  useMapEvents({
    click: (e) => {
      if (!active) return;
      if (!pointAlpha) {
        setPointAlpha(e.latlng);
        const msg = lang === 'en' ? `Launch Point Locked: [${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}]` : `ප්‍රහාරක ලක්ෂ්‍යය තහවුරුයි: [${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}]`;
        addLog(msg, 'warning');
      } else {
        launchThreat(pointAlpha, e.latlng);
        setPointAlpha(null);
      }
    },
  });

  const launchThreat = (start: L.LatLng, target: L.LatLng) => {
    const finalSpeed = BASE_THREAT_SPEED * attackerType.speedMod * attackerSpeedScale;
    const newThreat: Threat = {
      id: Math.random().toString(36).substr(2, 9),
      start,
      target,
      current: start,
      startTime: Date.now(),
      status: 'MOVING',
      speed: finalSpeed,
      type: attackerType.id
    };
    setThreats(prev => [...prev, newThreat]);
    setStats(s => ({ ...s, launched: s.launched + 1 }));
  };

  const launchRandomStrike = (count: number, label: string) => {
    const startMsg = lang === 'en' ? `INCOMING: ${label} strike detected!` : `අවවාදයයි: ${label} ප්‍රහාරයක් හඳුනාගත්තා!`;
    addLog(startMsg, 'danger');
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const side = Math.floor(Math.random() * 4);
        let originLat, originLng;
        const margin = 2.5; 
        if (side === 0) {
          originLat = SL_BOUNDS.maxLat + margin;
          originLng = SL_BOUNDS.minLng + Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng);
        } else if (side === 1) {
          originLat = SL_BOUNDS.minLat - margin;
          originLng = SL_BOUNDS.minLng + Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng);
        } else if (side === 2) {
          originLat = SL_BOUNDS.minLat + Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat);
          originLng = SL_BOUNDS.maxLng + margin;
        } else {
          originLat = SL_BOUNDS.minLat + Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat);
          originLng = SL_BOUNDS.minLng - margin;
        }
        const origin = L.latLng(originLat, originLng);
        let targetPos;
        if (Math.random() > 0.3) {
          const city = CITIES[Math.floor(Math.random() * CITIES.length)];
          targetPos = L.latLng(city.lat, city.lng);
        } else {
          targetPos = L.latLng(
            SL_BOUNDS.minLat + 0.5 + Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat - 1),
            SL_BOUNDS.minLng + 0.5 + Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng - 1)
          );
        }
        launchThreat(origin, targetPos);
      }, i * (200 / (1 + count / 10)));
    }
  };

  const calculateIntercept = (threat: Threat, interceptor: DefenseSystem) => {
    const Vt = threat.speed;
    const Vi = interceptor.shotSpeed || 0.22;
    const interceptorBase = L.latLng(interceptor.lat, interceptor.lng);
    const angle = Math.atan2(threat.target.lat - threat.start.lat, threat.target.lng - threat.start.lng);
    const vx = Math.cos(angle) * Vt;
    const vy = Math.sin(angle) * Vt;
    const dx = threat.current.lng - interceptorBase.lng;
    const dy = threat.current.lat - interceptorBase.lat;
    const a = vx * vx + vy * vy - Vi * Vi;
    const b = 2 * (vx * dx + vy * dy);
    const c = dx * dx + dy * dy;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return null;
    const t = (-b - Math.sqrt(disc)) / (2 * a);
    if (t < 0) return null;
    return L.latLng(threat.current.lat + vy * t, threat.current.lng + vx * t);
  };

  const updateSimulation = (time: number) => {
    if (!lastUpdateRef.current) {
      lastUpdateRef.current = time;
      requestRef.current = requestAnimationFrame(updateSimulation);
      return;
    }
    const rawDeltaTime = (time - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = time;
    const currentSpeed = speedRef.current;
    
    const substeps = Math.min(1000, Math.ceil(currentSpeed * 2.5));
    const dt = (rawDeltaTime * currentSpeed) / substeps;
    
    setThreats(prevThreats => {
      if (prevThreats.length === 0) return prevThreats;
      let changed = false;
      const nextThreats = [...prevThreats];
      for (let s = 0; s < substeps; s++) {
        for (let i = 0; i < nextThreats.length; i++) {
          const threat = nextThreats[i];
          if (threat.status !== 'MOVING') continue;
          const angle = Math.atan2(threat.target.lat - threat.start.lat, threat.target.lng - threat.start.lng);
          const nextPos = L.latLng(
            threat.current.lat + Math.sin(angle) * threat.speed * dt,
            threat.current.lng + Math.cos(angle) * threat.speed * dt
          );
          
          // Only use active radars
          const activeRadars = systemsRef.current.filter(sys => sys.role === 'RADAR' && sys.isActive !== false);
          const detectingRadar = activeRadars.find(r => nextPos.distanceTo(L.latLng(r.lat, r.lng)) / 1000 <= r.range);
          
          if (detectingRadar) {
            nextThreats[i].detectedByRadarId = detectingRadar.id;
            if (!threat.interceptorId) {
              // Only use active interceptors
              const activeInterceptors = systemsRef.current.filter(sys => sys.role === 'INTERCEPTOR' && sys.isActive !== false);
              const bestCandidates = activeInterceptors.sort((a, b) => (b.shotSpeed || 0) - (a.shotSpeed || 0));
              for (const interceptor of bestCandidates) {
                const predictedPos = calculateIntercept(threat, interceptor);
                if (predictedPos) {
                  const distToIntercept = predictedPos.distanceTo(L.latLng(interceptor.lat, interceptor.lng)) / 1000;
                  if (distToIntercept <= interceptor.range) {
                    nextThreats[i].interceptorId = interceptor.id;
                    nextThreats[i].interceptorPos = L.latLng(interceptor.lat, interceptor.lng);
                    nextThreats[i].predictedInterceptPoint = predictedPos;
                    const lockMsg = lang === 'en' ? `Hyper-Lock: ID-${threat.id.substr(0, 4)}` : `අතිවේගී හඳුනාගැනීම: ID-${threat.id.substr(0, 4)}`;
                    addLog(lockMsg, 'warning');
                    changed = true;
                    break;
                  }
                }
              }
            }
          }
          
          if (threat.interceptorId && threat.interceptorPos) {
            const targetGoal = threat.predictedInterceptPoint || nextPos;
            const interceptor = systemsRef.current.find(sys => sys.id === threat.interceptorId);
            const shotSpeed = interceptor?.shotSpeed || 0.22;
            const iAngle = Math.atan2(targetGoal.lat - threat.interceptorPos.lat, targetGoal.lng - threat.interceptorPos.lng);
            const nextIPos = L.latLng(
              threat.interceptorPos.lat + Math.sin(iAngle) * shotSpeed * dt,
              threat.interceptorPos.lng + Math.cos(iAngle) * shotSpeed * dt
            );
            
            const killRadius = 900 + (currentSpeed > 50 ? currentSpeed * 2 : 0) + (threat.speed * 20000);
            
            if (nextIPos.distanceTo(nextPos) < killRadius) {
              nextThreats[i] = { ...threat, status: 'INTERCEPTED', current: nextPos };
              setExplosions(prev => [...prev, { id: 'kill-' + Math.random(), pos: nextPos, type: 'intercept' }]);
              setStats(st => ({ ...st, intercepted: st.intercepted + 1 }));
              const successMsg = lang === 'en' ? `Hypersonic Neutralized: ID-${threat.id.substr(0, 4)}` : `හයිපර්සොනික් විනාශ කළා: ID-${threat.id.substr(0, 4)}`;
              addLog(successMsg, 'success');
              changed = true;
              continue;
            }
            nextThreats[i].interceptorPos = nextIPos;
          }
          
          const impactThreshold = 600 + (currentSpeed > 500 ? currentSpeed : 0);
          if (nextPos.distanceTo(threat.target) < impactThreshold) {
            nextThreats[i] = { ...threat, status: 'IMPACTED', current: threat.target };
            setExplosions(prev => [...prev, { id: 'hit-' + Math.random(), pos: threat.target, type: 'impact' }]);
            setStats(st => ({ ...st, impacted: st.impacted + 1 }));
            const failMsg = lang === 'en' ? `Hypersonic Impact [ID-${threat.id.substr(0, 4)}]` : `හයිපර්සොනික් ප්‍රහාරය වැදුනා [ID-${threat.id.substr(0, 4)}]`;
            addLog(failMsg, 'danger');
            changed = true;
            continue;
          }
          nextThreats[i].current = nextPos;
          changed = true;
        }
      }
      return changed ? nextThreats : prevThreats;
    });
    requestRef.current = requestAnimationFrame(updateSimulation);
  };

  useEffect(() => {
    if (active) {
      lastUpdateRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateSimulation);
      const engMsg = lang === 'en' ? "Defense Grid: ENGAGED" : "ආරක්ෂණ පද්ධතිය සක්‍රීයයි";
      addLog(engMsg, "success");
    } else {
      cancelAnimationFrame(requestRef.current);
      setThreats([]);
      setPointAlpha(null);
      setLogs([]);
      setStats({ launched: 0, intercepted: 0, impacted: 0 });
      setExplosions([]);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [active, lang, addLog]);

  useEffect(() => {
    if (explosions.length > 0) {
      const timer = setTimeout(() => {
        setExplosions(prev => prev.filter(e => !explosions.some(ex => ex.id === e.id)));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [explosions]);

  if (!active) return null;

  const hudBgClass = mapTheme === 'dark' ? 'bg-slate-950/90 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/95 border-[#eee8d5]' : 'bg-white/95 border-slate-200';
  const hudTextClass = mapTheme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const interceptorMarkerColor = mapTheme === 'dark' ? '#fff' : '#0ea5e9';

  return (
    <>
      <div className="absolute top-[180px] md:top-24 left-4 md:left-6 z-[1001] flex flex-col gap-2 md:gap-4 max-w-[160px] md:max-w-none max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2">
        <div className={`${hudBgClass} backdrop-blur-xl border p-3 md:p-5 rounded-2xl shadow-2xl min-w-[140px] md:min-w-[200px]`}>
          <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-4 flex items-center gap-2">
            <BarChart3 className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('mission_data')}
          </div>
          <div className="space-y-1.5 md:space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase">{t('hits')}</span>
              <span className="text-sm md:text-xl font-black text-emerald-400 leading-none">{stats.intercepted}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[7px] md:text-[9px] font-bold text-red-500 uppercase">{t('fail')}</span>
              <span className="text-sm md:text-xl font-black text-red-400 leading-none">{stats.impacted}</span>
            </div>
          </div>
        </div>

        <div className={`${hudBgClass} backdrop-blur-xl border p-3 md:p-5 rounded-2xl shadow-2xl`}>
          <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-4 flex items-center gap-2">
            <Rocket className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('attacker_config')}
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase">{t('missile_type')}</span>
              <div className="grid grid-cols-2 gap-1">
                {MISSILE_TYPES.map(m => (
                  <button key={m.id} onClick={() => setAttackerType(m)} className={`p-1.5 rounded-lg border text-[7px] md:text-[8px] font-black transition-all ${attackerType.id === m.id ? 'bg-red-600 border-red-500 text-white shadow-lg' : mapTheme === 'dark' ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    {m.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase">{t('impact_speed')}</span>
                <span className={`text-[9px] md:text-[10px] font-black ${hudTextClass}`}>{attackerSpeedScale}x</span>
              </div>
              <input type="range" min="0.1" max="2.0" step="0.1" value={attackerSpeedScale} onChange={(e) => setAttackerSpeedScale(parseFloat(e.target.value))} className="w-full accent-red-600 h-1" />
            </div>
          </div>
        </div>

        <div className={`${hudBgClass} backdrop-blur-xl border p-3 md:p-5 rounded-2xl shadow-2xl`}>
          <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
            <Swords className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('strike')}
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:gap-2">
            <button onClick={() => launchRandomStrike(5, t('scout'))} className={`p-2 ${mapTheme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-xl border flex flex-col items-center justify-center gap-1`}>
              <Flame className="w-3 h-3 text-emerald-400" />
              <span className={`text-[7px] md:text-[9px] font-black ${hudTextClass} uppercase`}>{t('scout')}</span>
            </button>
            <button onClick={() => launchRandomStrike(15, t('full'))} className={`p-2 ${mapTheme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-xl border flex flex-col items-center justify-center gap-1`}>
              <Flame className="w-3 h-3 text-amber-400" />
              <span className={`text-[7px] md:text-[9px] font-black ${hudTextClass} uppercase`}>{t('full')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-[180px] md:top-24 right-4 md:right-6 z-[1001] flex flex-col gap-2">
        <div className={`${hudBgClass} backdrop-blur-xl border p-2 md:p-4 rounded-2xl flex flex-col gap-2 shadow-2xl`}>
          <div className={`flex items-center gap-1.5 md:gap-2 border-b ${mapTheme === 'dark' ? 'border-white/5' : 'border-slate-200'} pb-1.5`}>
            <FastForward className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
            <span className={`text-[7px] md:text-[10px] font-black ${hudTextClass} uppercase tracking-widest`}>{t('time')}</span>
          </div>
          <div className="flex flex-col gap-1">
            {[1, 5, 10, 25, 100].map(s => (
              <button key={s} onClick={() => setSpeedMultiplier(s)} className={`px-2 py-1 md:py-2 rounded-lg text-[7px] md:text-[9px] font-black transition-all ${speedMultiplier === s ? 'bg-blue-600 text-white' : mapTheme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className={`${hudBgClass} backdrop-blur-xl border p-2 md:p-4 rounded-2xl flex flex-col gap-2 shadow-2xl`}>
          <div className={`flex items-center gap-1.5 md:gap-2 border-b ${mapTheme === 'dark' ? 'border-white/5' : 'border-slate-200'} pb-1.5`}>
            <Palette className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
            <span className={`text-[7px] md:text-[10px] font-black ${hudTextClass} uppercase tracking-widest`}>{t('threat')}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {['#ef4444', '#f59e0b', '#8b5cf6', '#334155'].map(color => (
              <button key={color} onClick={() => setThreatColor(color)} className={`w-6 h-6 md:w-8 md:h-8 rounded-lg border-2 transition-all ${threatColor === color ? 'border-blue-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>

      {pointAlpha && (
        <Marker position={pointAlpha} icon={L.divIcon({
          className: 'target-marker',
          html: `<div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"><div class="absolute inset-0 bg-red-500/40 rounded-full animate-ping"></div><div class="w-3 h-3 md:w-4 md:h-4 bg-red-600 border-2 border-white rounded-full relative z-10"></div></div>`,
          iconAnchor: [15, 15]
        })} />
      )}

      {threats.map(threat => (
        <React.Fragment key={threat.id}>
          {threat.status === 'MOVING' && (
            <>
              {threat.detectedByRadarId && (
                <Polyline positions={[L.latLng(systems.find(s => s.id === threat.detectedByRadarId)!.lat, systems.find(s => s.id === threat.detectedByRadarId)!.lng), threat.current]} color="#3b82f6" weight={1} dashArray="4, 10" opacity={0.4} />
              )}
              <Circle center={threat.current} radius={400} pathOptions={{ fillColor: threatColor, color: mapTheme === 'dark' ? '#fff' : '#000', fillOpacity: 0.9, weight: 1.5 }} />
              {threat.interceptorPos && (
                <>
                  <Polyline positions={[L.latLng(systems.find(s => s.id === threat.interceptorId)!.lat, systems.find(s => s.id === threat.interceptorId)!.lng), threat.interceptorPos]} color="#fb923c" weight={2} opacity={0.6} dashArray="5, 5" />
                  <Marker position={threat.interceptorPos} icon={L.divIcon({
                    className: 'interceptor-node',
                    html: `<div class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"><div class="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" style="background-color: ${interceptorMarkerColor}; border: 1px solid white;"></div></div>`,
                    iconAnchor: [3, 3]
                  })} />
                </>
              )}
            </>
          )}
        </React.Fragment>
      ))}

      {explosions.map(exp => (
        <Circle key={exp.id} center={exp.pos} radius={exp.type === 'impact' ? 8000 : 5000} pathOptions={{ fillColor: exp.type === 'impact' ? threatColor : '#fb923c', color: '#fff', fillOpacity: 0.8, weight: 0 }} className="animate-blast" />
      ))}

      <div className="absolute bottom-32 right-6 z-[1001] w-[320px] md:w-[360px] pointer-events-auto hidden md:flex">
        <div className={`${hudBgClass} backdrop-blur-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[280px]`}>
          <div className={`${mapTheme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-200/40'} px-4 py-3 border-b border-white/10 flex items-center justify-between`}>
            <span className={`text-[10px] font-black ${hudTextClass} uppercase tracking-widest flex items-center gap-2`}><Radio className="w-3.5 h-3.5 text-blue-400" /> {lang === 'en' ? 'LOGS' : 'පද්ධති සටහන්'}</span>
          </div>
          <div className="p-4 overflow-y-auto flex flex-col-reverse gap-2 custom-scrollbar flex-1">
            {logs.slice(0, 50).map(log => (
              <div key={log.id} className="text-[9px] font-mono leading-tight border-l-2 pl-2 py-0.5" style={{ borderColor: log.type === 'danger' ? '#ef4444' : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#10b981' : '#3b82f6' }}>
                <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                <span className={log.type === 'danger' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : mapTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-lg px-4 md:px-6">
        <div className={`${hudBgClass} backdrop-blur-xl border border-blue-500/30 p-4 md:p-6 rounded-3xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 pointer-events-auto`}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-red-500/10 rounded-xl border border-red-500/20"><ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-red-500" /></div>
            <div>
              <div className={`text-xs md:text-sm font-black ${hudTextClass} uppercase`}>{t('sim_live')}</div>
              <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">{t('op_mode')}</div>
            </div>
          </div>
          <button onClick={onDeactivate} className="bg-red-600 hover:bg-red-500 px-4 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black text-white transition-all uppercase tracking-widest">{t('stop')}</button>
        </div>
      </div>
    </>
  );
};

export default AttackSimulator;
