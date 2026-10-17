import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { startNewBloodRequest, setCurrentView, t } = useApp();

  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
      {/* Subtle background glow */}
      <div 
        className="absolute top-0 right-1/4 w-96 h-96 bg-rose-50 rounded-full blur-3xl pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          
          {/* Emergency Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold mb-6 border border-rose-200/60">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Emergency Coordination Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            {t('heroHeading')}
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl">
            {t('heroSubtext')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={startNewBloodRequest}
              className="px-7 py-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-base rounded-xl shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all flex items-center justify-center gap-3 group tracking-wide"
            >
              <span>{t('findBloodNow')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setCurrentView('nearest-map')}
              className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-800 shadow-sm"
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Nearest Blood Map</span>
            </button>

            <button
              onClick={() => setCurrentView('facilities')}
              className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <span>Facilities</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Consenting donors only</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Real-time radius matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Strict patient privacy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
