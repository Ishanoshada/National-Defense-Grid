import React from 'react';
import { X, Info, Zap, LayoutGrid, Target, FileJson, MousePointer2, Settings, HelpCircle, BookOpen, BrainCircuit } from 'lucide-react';
import { Language, TRANSLATIONS } from '../locales/translations';

interface AboutPanelProps {
  onClose: () => void;
  lang: Language;
  mapTheme: 'dark' | 'light' | 'warm';
}

const AboutPanel: React.FC<AboutPanelProps> = ({ onClose, lang, mapTheme }) => {
  const t = (key: string) => (TRANSLATIONS[lang] as any)[key] || key;

  const panelBg = mapTheme === 'dark' ? 'bg-slate-900/95 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/95 border-[#eee8d5]' : 'bg-white/95 border-slate-200';
  const textColor = mapTheme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = mapTheme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-y-0 right-0 z-[4000] w-full max-w-lg p-4 md:p-6 flex pointer-events-none">
      <div className={`${panelBg} w-full h-full rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-right-8 duration-500 backdrop-blur-3xl`}>
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className={`text-xl font-black uppercase tracking-tight ${textColor}`}>{t('guide_title')}</h2>

            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl hover:bg-white/5 transition-colors ${subTextColor}`}><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">
              <BrainCircuit className="w-4 h-4" /> {t('formula_header')}
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1.5 h-auto bg-blue-500/30 rounded-full" />
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase ${textColor}`}>{t('formula_intercept')}</h4>
                  <div className="font-mono text-[10px] p-3 bg-black/30 rounded-xl border border-white/5 text-emerald-400">
                    Vt²t² + 2(Vt·D)t + |D|² = Vi²t²
                  </div>
                  <p className={`text-[11px] leading-relaxed ${subTextColor}`}>{t('formula_intercept_desc')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1.5 h-auto bg-amber-500/30 rounded-full" />
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase ${textColor}`}>{t('formula_coverage')}</h4>
                  <p className={`text-[11px] leading-relaxed ${subTextColor}`}>{t('formula_coverage_desc')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1.5 h-auto bg-purple-500/30 rounded-full" />
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase ${textColor}`}>{t('opt_logic')}</h4>
                  <p className={`text-[11px] leading-relaxed ${subTextColor}`}>{t('opt_logic_desc')}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">
              <Settings className="w-4 h-4" /> {t('usage_header')}
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: MousePointer2, text: t('usage_1'), color: 'text-emerald-400' },
                { icon: Zap, text: t('usage_2'), color: 'text-amber-400' },
                { icon: Target, text: t('usage_3'), color: 'text-red-400' },
                { icon: FileJson, text: t('usage_4'), color: 'text-blue-400' },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-3xl border ${mapTheme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} flex items-center gap-4`}>
                  <div className={`p-2 rounded-xl bg-slate-900/50 ${item.color}`}><item.icon className="w-4 h-4" /></div>
                  <div className={`text-[11px] font-medium leading-normal ${textColor}`}>{item.text}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
            <Info className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="text-[11px] font-bold text-amber-500 leading-relaxed italic">
              {t('edu_disclaimer')}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all"
          >
            <span className="uppercase tracking-widest text-xs">{t('close_guide')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPanel;