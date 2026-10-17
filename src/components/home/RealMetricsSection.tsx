import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Building2, Activity, HeartPulse } from 'lucide-react';

export const RealMetricsSection: React.FC = () => {
  const { donors, facilities, requests, t } = useApp();

  const metrics = [
    {
      label: t('statDonors'),
      value: donors.length,
      detail: `${donors.filter((d) => d.isAvailable).length} available for alerts`,
      icon: Users,
    },
    {
      label: t('statFacilities'),
      value: facilities.length,
      detail: `${facilities.filter((f) => f.isVerified).length} verified blood banks`,
      icon: Building2,
    },
    {
      label: t('statRequests'),
      value: requests.length,
      detail: `${requests.filter((r) => r.status === 'fulfilled').length} fulfilled coordination`,
      icon: Activity,
    },
    {
      label: t('statActive'),
      value: requests.filter((r) => r.status === 'searching' || r.status === 'awaiting_confirmation').length,
      detail: 'In active outreach',
      icon: HeartPulse,
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
              Active Network Telemetry
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Real System Operational Counts
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            <span>Verified against active platform state · No fabricated figures</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="p-5 rounded-xl bg-slate-50/70 border border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
                  {item.value}
                </div>
                <div className="text-xs font-semibold text-slate-800 mb-0.5">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500">
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
