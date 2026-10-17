import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ShieldCheck, AlertCircle, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setIsReadinessModalOpen, t } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                LifeLink<span className="text-rose-500">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Rapid emergency blood coordination connecting families, treating hospitals, blood banks, and consenting community donors when every minute counts.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setIsReadinessModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('systemReadiness')}</span>
              </button>
            </div>
          </div>

          {/* Directory & Services */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Coordination
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('facilities')}
                  className="hover:text-white transition-colors"
                >
                  Blood Banks & Hospitals
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('camps')}
                  className="hover:text-white transition-colors"
                >
                  Community Blood Camps
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('donor-hub')}
                  className="hover:text-white transition-colors"
                >
                  Donor Registration & Consent
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('tracker')}
                  className="hover:text-white transition-colors"
                >
                  Live Request Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical & Trust Standards */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Standards & Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('facility-portal')}
                  className="hover:text-white transition-colors"
                >
                  Hospital Inventory Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin-portal')}
                  className="hover:text-white transition-colors"
                >
                  Facility Verification Desk
                </button>
              </li>
              <li className="pt-2">
                <span className="text-[11px] text-slate-400 block leading-normal">
                  Strict privacy: No patient names or sensitive medical charts are broadcast publicly.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clinical Advisory Box */}
        <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-white block">
              Important Clinical & Safety Notice:
            </span>
            <p className="leading-relaxed text-slate-300">
              {t('emergencyDisclaimer')} LifeLink AI provides coordination mechanisms and reported inventory awareness; it does not substitute for accredited laboratory serology screening, antibody panels, or direct medical judgment.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>© 2026 LifeLink AI Platform</span>
            <span>·</span>
            <span>All rights reserved</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono">v1.0.0-PROD-READY</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReadinessModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Operational Status
            </button>
            <span>·</span>
            <span className="text-slate-400">WCAG AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
