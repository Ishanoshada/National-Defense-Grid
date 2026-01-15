import React from 'react';
import { X, Shield, Globe, Cpu, Bomb, Info, CheckCircle2, Languages } from 'lucide-react';
import { Language, TRANSLATIONS } from '../locales/translations';

interface WelcomeModalProps {
  onClose: () => void;
  lang: Language;
  onToggleLang: () => void;
  mapTheme: 'dark' | 'light' | 'warm';
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose, lang, onToggleLang, mapTheme }) => {
  const t = (key: string) => (TRANSLATIONS[lang] as any)[key] || key;

  const modalBg = mapTheme === 'dark' ? 'bg-slate-950/95 border-white/10' : mapTheme === 'warm' ? 'bg-[#fdf6e3]/95 border-[#eee8d5]' : 'bg-white/95 border-slate-200';
  const textColor = mapTheme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const subTextColor = mapTheme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/60">
      <div className={`${modalBg} w-full max-w-2xl rounded-[2.5rem] border shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500`}>
        
        {/* Header Section */}
        <div className="relative p-8 md:p-10 border-b border-white/5 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-4 rounded-2xl border border-white/20 shadow-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${textColor} leading-none mb-2`}>
                  {t('welcome_title')}
                </h2>
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-blue-400 font-bold uppercase tracking-[0.2em]">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" /> {t('welcome_intro')}
                </div>
              </div>
            </div>
            
            <button 
              onClick={onToggleLang}
              className={`p-3 rounded-xl border flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${mapTheme === 'dark' ? 'bg-white/5 border-white/10 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'}`}
            >
              <Languages className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">{lang === 'en' ? 'සිංහල' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 custom-scrollbar">
          <div className={`text-sm md:text-base leading-relaxed ${subTextColor} font-medium`}>
            {t('welcome_desc')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-5 rounded-3xl border ${mapTheme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} flex items-start gap-4`}>
              <div className="p-2 bg-blue-500/20 rounded-lg"><Globe className="w-5 h-5 text-blue-400" /></div>
              <div>
                <div className={`text-[11px] font-black uppercase ${textColor}`}>{t('priority_land')} & {t('priority_city')}</div>
                <div className="text-[10px] text-slate-500 mt-1">Realistic Sri Lankan topographic analysis.</div>
              </div>
            </div>
            <div className={`p-5 rounded-3xl border ${mapTheme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} flex items-start gap-4`}>
              <div className="p-2 bg-red-500/20 rounded-lg"><Bomb className="w-5 h-5 text-red-400" /></div>
              <div>
                <div className={`text-[11px] font-black uppercase ${textColor}`}>{t('stress_sim')}</div>
                <div className="text-[10px] text-slate-500 mt-1">Live hypersonic and cruise threat simulation.</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
            <Info className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="text-[11px] md:text-xs font-bold text-amber-500 leading-relaxed italic">
              {t('edu_disclaimer')}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-8 md:p-10 border-t border-white/5 bg-slate-950/20">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="uppercase tracking-widest text-sm">{t('get_started')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;