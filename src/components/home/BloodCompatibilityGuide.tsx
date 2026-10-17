import React, { useState } from 'react';
import { BloodGroup } from '../../types';
import { BLOOD_COMPATIBILITY_CHART } from '../../data/mockData';
import { ShieldAlert, Info, Check, X } from 'lucide-react';

export const BloodCompatibilityGuide: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const groups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const currentInfo = BLOOD_COMPATIBILITY_CHART[selectedGroup];

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Clinical Reference
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Red Blood Cell Compatibility Matrix
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Quick educational reference for emergency coordination. Transfusion centers always run laboratory cross-matches prior to release.
          </p>
        </div>

        {/* Blood Group Selectors */}
        <div className="flex flex-wrap gap-2 mb-6">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                selectedGroup === grp
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Interactive Compatibility Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Can Receive From */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                Patient with <strong className="text-rose-600 font-mono">{selectedGroup}</strong> can receive red blood cells from:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groups.map((grp) => {
                const canReceive = currentInfo.canReceiveFrom.includes(grp);
                return (
                  <div
                    key={grp}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
                      canReceive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                    }`}
                  >
                    {canReceive ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                    <span>{grp}</span>
                  </div>
                );
              })}
            </div>
            {currentInfo.isUniversalRBC && (
              <p className="text-[11px] text-emerald-700 font-medium">
                ★ Universal Red Blood Cell Donor: O- red cells can be given to any recipient in extreme emergencies.
              </p>
            )}
          </div>

          {/* Can Donate To */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                Donor with <strong className="text-rose-600 font-mono">{selectedGroup}</strong> can give red blood cells to:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groups.map((grp) => {
                const canDonate = currentInfo.canDonateTo.includes(grp);
                return (
                  <div
                    key={grp}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
                      canDonate
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                    }`}
                  >
                    {canDonate ? <Check className="w-3 h-3 text-rose-600" /> : <X className="w-3 h-3 text-slate-400" />}
                    <span>{grp}</span>
                  </div>
                );
              })}
            </div>
            {currentInfo.isUniversalPlasma && (
              <p className="text-[11px] text-sky-700 font-medium">
                ★ Universal Plasma Donor: AB+ plasma contains no ABO antibodies and is safe for all recipients.
              </p>
            )}
          </div>
        </div>

        {/* Safety Callout */}
        <div className="mt-4 flex items-start gap-2.5 text-xs text-slate-500">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            Components have differing biological compatibility rules: Whole Blood, Packed Red Blood Cells (PRBC), Platelets, and Fresh Frozen Plasma (FFP) require specific hospital serology screening. Never assume interchangeability.
          </p>
        </div>
      </div>
    </section>
  );
};
