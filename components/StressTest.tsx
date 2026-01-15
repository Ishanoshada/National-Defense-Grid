import React, { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import { 
  X, 
  Rocket, 
  Terminal, 
  Activity, 
  BarChart3, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  Skull, 
  Layers, 
  History as HistoryIcon,
  Flame,
  Zap
} from 'lucide-react';
import { DefenseSystem } from '../types';
import { SL_BOUNDS, CITIES } from '../constants';
import { Language, TRANSLATIONS } from '../locales/translations';

interface StressTestProps {
  systems: DefenseSystem[];
  geoData: any;
  onClose: () => void;
  mapTheme: 'dark' | 'light' | 'warm';
  lang: Language;
  t: (key: string) => string;
}

const MISSILE_TYPES = [
  { id: 'drone', label: 'Suicide Drone', speedMod: 0.6 },
  { id: 'cruise', label: 'Cruise Missile', speedMod: 1.5 },
  { id: 'ballistic', label: 'Ballistic Missile', speedMod: 4.0 },
  { id: 'hypersonic', label: 'Hypersonic', speedMod: 12.0 } 
];

const StressTest: React.FC<StressTestProps> = ({ systems, onClose, mapTheme, lang, t }) => {
  const [rounds, setRounds] = useState(100);
  const [missilesPerRound, setMissilesPerRound] = useState(20);
  const [selectedMissile, setSelectedMissile] = useState(MISSILE_TYPES[1]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<{
    totalLaunched: number;
    intercepted: number;
    impacted: number;
    detectionRate: number;
    logs: string[];
    timeTaken: number;
  } | null>(null);

  const runBatchTest = useCallback(() => {
    setIsSimulating(true);
    const startTime = performance.now();
    
    // Using a timeout to prevent UI freeze during heavy calculation
    setTimeout(() => {
      let totalLaunched = 0;
      let interceptedCount = 0;
      let impactedCount = 0;
      let detectedCount = 0;
      const batchLogs: string[] = [];

      const activeRadars = systems.filter(s => s.role === 'RADAR' && s.isActive !== false);
      const activeInterceptors = systems.filter(s => s.role === 'INTERCEPTOR' && s.isActive !== false);

      for (let r = 0; r < rounds; r++) {
        for (let m = 0; m < missilesPerRound; m++) {
          totalLaunched++;
          
          // Generate a random path
          const side = Math.floor(Math.random() * 4);
          let startLat, startLng;
          if (side === 0) { startLat = SL_BOUNDS.maxLat + 1; startLng = SL_BOUNDS.minLng + Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng); }
          else if (side === 1) { startLat = SL_BOUNDS.minLat - 1; startLng = SL_BOUNDS.minLng + Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng); }
          else if (side === 2) { startLat = SL_BOUNDS.minLat + Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat); startLng = SL_BOUNDS.maxLng + 1; }
          else { startLat = SL_BOUNDS.minLat + Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat); startLng = SL_BOUNDS.minLng - 1; }

          const targetCity = CITIES[Math.floor(Math.random() * CITIES.length)];
          const start = L.latLng(startLat, startLng);
          const target = L.latLng(targetCity.lat, targetCity.lng);

          // Simulation Logic: Check path intersection with defense circles
          let detected = false;
          for (const radar of activeRadars) {
            const radarPos = L.latLng(radar.lat, radar.lng);
            // Simple proximity check for fast batch test
            // Check distance from radar to path segment
            const dist = L.LineUtil.pointToSegmentDistance(
              L.point(radarPos.lng, radarPos.lat),
              L.point(start.lng, start.lat),
              L.point(target.lng, target.lat)
            );
            // Degrees to KM (approx)
            if (dist * 111 <= radar.range) {
              detected = true;
              break;
            }
          }

          if (detected) {
            detectedCount++;
            let hit = false;
            for (const interceptor of activeInterceptors) {
              const interceptorPos = L.latLng(interceptor.lat, interceptor.lng);
              const distToPath = L.LineUtil.pointToSegmentDistance(
                L.point(interceptorPos.lng, interceptorPos.lat),
                L.point(start.lng, start.lat),
                L.point(target.lng, target.lat)
              );
              // Interception probability check: simpler version of live sim
              if (distToPath * 111 <= interceptor.range) {
                // Check if interceptor is fast enough relative to missile
                const speedAdvantage = (interceptor.shotSpeed || 0.25) / (0.005 * selectedMissile.speedMod);
                if (speedAdvantage > 0.8) { // Reasonable threshold for batch mode
                   hit = true;
                   break;
                }
              }
            }

            if (hit) {
              interceptedCount++;
              if (totalLaunched % 100 === 0) batchLogs.push(`[R-${r+1}] Intercepted missile near ${targetCity.name}`);
            } else {
              impactedCount++;
              if (totalLaunched % 50 === 0) batchLogs.push(`[R-${r+1}] Critical Failure: Impact on ${targetCity.name}`);
            }
          } else {
            impactedCount++;
            if (totalLaunched % 20 === 0) batchLogs.push(`[R-${r+1}] Undetected Threat Impact on ${targetCity.name}`);
          }
        }
      }

      const endTime = performance.now();
      setResults({
        totalLaunched,
        intercepted: interceptedCount,
        impacted: impactedCount,
        detectionRate: (detectedCount / totalLaunched) * 100,
        logs: batchLogs.slice(0, 20), // Top 20 relevant logs
        timeTaken: (endTime - startTime) / 1000
      });
      setIsSimulating(false);
    }, 100);
  }, [rounds, missilesPerRound, selectedMissile, systems]);

  const modalBg = mapTheme === 'dark' ? 'bg-slate-950/90 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/95 border-[#eee8d5]' : 'bg-white/95 border-slate-200';
  const textColor = mapTheme === 'dark' ? 'text-white' : 'text-slate-900';
  const labelColor = mapTheme === 'dark' ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
      <div className={`${modalBg} w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-600/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className={`text-xl font-black uppercase tracking-tight ${textColor}`}>{t('batch_sim')}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('high_speed_calc')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {!results ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <HistoryIcon className="w-3 h-3" /> {t('rounds')}
                  </label>
                  <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <input type="range" min="1" max="1000" value={rounds} onChange={(e) => setRounds(parseInt(e.target.value))} className="flex-1 accent-amber-500" />
                    <span className={`text-sm font-black w-12 text-center ${textColor}`}>{rounds}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Rocket className="w-3 h-3" /> {t('missiles_per_round')}
                  </label>
                  <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <input type="range" min="1" max="100" value={missilesPerRound} onChange={(e) => setMissilesPerRound(parseInt(e.target.value))} className="flex-1 accent-red-500" />
                    <span className={`text-sm font-black w-12 text-center ${textColor}`}>{missilesPerRound}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Flame className="w-3 h-3" /> {t('missile_type')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MISSILE_TYPES.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setSelectedMissile(m)} 
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all flex flex-col items-center gap-2 ${selectedMissile.id === m.id ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                    >
                      <Rocket className={`w-4 h-4 ${selectedMissile.id === m.id ? 'text-white' : 'text-slate-600'}`} />
                      {m.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={runBatchTest}
                disabled={isSimulating}
                className="w-full py-5 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl transition-all disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    {t('testing')}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {t('run_test')}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-tighter">{t('hits')}</span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-2xl font-black text-emerald-400">{results.intercepted}</span>
                  </div>
                </div>
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-tighter">{t('fail')}</span>
                  <div className="flex items-center gap-2">
                    <Skull className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-black text-red-400">{results.impacted}</span>
                  </div>
                </div>
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-tighter">SUCCESS %</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-black text-blue-400">{((results.intercepted / results.totalLaunched) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl border border-white/5 p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('time')}</span>
                  <span className={`text-lg font-black ${textColor}`}>{results.timeTaken.toFixed(3)}s</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DETECTION RATE</span>
                  <span className={`text-lg font-black ${textColor}`}>{results.detectionRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-[0.2em]">
                  <Terminal className="w-3.5 h-3.5" /> SIMULATION LOGS (SAMPLED)
                </h3>
                <div className="bg-black/40 rounded-2xl p-4 h-48 overflow-y-auto border border-white/5 custom-scrollbar font-mono text-[9px] leading-relaxed">
                  {results.logs.map((log, i) => (
                    <div key={i} className={`py-1 border-b border-white/5 ${log.includes('Failure') ? 'text-red-400' : 'text-emerald-400 opacity-80'}`}>
                      <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      {log}
                    </div>
                  ))}
                  {results.logs.length === 0 && <div className="text-slate-700 italic">No critical anomalies logged. Total Shield integrity maintained.</div>}
                </div>
              </div>

              <button 
                onClick={() => setResults(null)}
                className="w-full py-4 border border-white/10 hover:bg-white/5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> RECONFIGURE TEST
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StressTest;
