import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeartHandshake, Calendar, Building2, ArrowRight } from 'lucide-react';

export const FeatureCards: React.FC = () => {
  const { setCurrentView, t, camps, facilities, donors } = useApp();

  const cards = [
    {
      title: t('becomeDonor'),
      description: t('becomeDonorSub'),
      badge: `${donors.filter((d) => d.isAvailable).length} Available Now`,
      icon: HeartHandshake,
      actionText: 'Register or Manage Profile',
      actionView: 'donor-hub' as const,
      color: 'rose',
    },
    {
      title: t('campsNearby'),
      description: t('campsNearbySub'),
      badge: `${camps.length} Scheduled Drives`,
      icon: Calendar,
      actionText: 'View Camp Schedule',
      actionView: 'camps' as const,
      color: 'slate',
    },
    {
      title: t('hospitalsAndBanks'),
      description: t('hospitalsAndBanksSub'),
      badge: `${facilities.length} Regional Facilities`,
      icon: Building2,
      actionText: 'Check Live Inventory',
      actionView: 'facilities' as const,
      color: 'slate',
    },
  ];

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-rose-50 text-slate-700 group-hover:text-rose-600 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentView(card.actionView)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
