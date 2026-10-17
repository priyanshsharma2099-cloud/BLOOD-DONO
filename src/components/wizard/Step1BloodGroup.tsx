import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, BloodComponent } from '../../types';
import { HelpCircle, AlertCircle, Check, Info } from 'lucide-react';

export const Step1BloodGroup: React.FC = () => {
  const { wizardDraft, updateWizardDraft, t } = useApp();
  const [showUnsureModal, setShowUnsureModal] = useState(false);

  const bloodGroups: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const components: { id: BloodComponent; label: string; detail: string }[] = [
    { id: 'whole_blood', label: 'Whole Blood', detail: 'Unseparated blood for massive hemorrhage or major trauma' },
    { id: 'prbc', label: 'Packed Red Blood Cells (PRBC)', detail: 'Oxygen delivery for severe anemia or surgical blood loss' },
    { id: 'platelets', label: 'Platelets (SDP / RDP)', detail: 'Clotting support for thrombocytopenia, oncology, or trauma' },
    { id: 'plasma', label: 'Fresh Frozen Plasma (FFP)', detail: 'Coagulation factors for liver trauma or bleeding disorders' },
    { id: 'cryo', label: 'Cryoprecipitate', detail: 'Fibrinogen and clotting factor concentrates' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
          Step 1 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('step1Title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select the exact ABO and Rh blood group required by the treating hospital.
        </p>
      </div>

      {/* Blood Group Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Required Blood Group <span className="text-rose-600">*</span>
        </label>

        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          {bloodGroups.map((grp) => {
            const isSelected = wizardDraft.bloodGroup === grp;

            return (
              <button
                key={grp}
                type="button"
                onClick={() => updateWizardDraft({ bloodGroup: grp })}
                className={`py-4 px-2 sm:px-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50/70 text-rose-900 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                  {grp}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {grp === 'O-' ? 'Universal RBC' : grp === 'AB+' ? 'Universal Plasma' : 'ABO/Rh'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Not Sure Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowUnsureModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Not sure about the patient's blood group?</span>
          </button>
        </div>
      </div>

      {/* Component Selection */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Required Blood Component <span className="text-rose-600">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {components.map((comp) => {
            const isSelected = wizardDraft.component === comp.id;

            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => updateWizardDraft({ component: comp.id })}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50/60 ring-1 ring-rose-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                    {comp.label}
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    {comp.detail}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Needed */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Number of Units Needed
          </label>
          <span className="font-mono text-base font-extrabold text-rose-600 tabular-nums">
            {wizardDraft.unitsRequested} {wizardDraft.unitsRequested === 1 ? 'Unit' : 'Units'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => updateWizardDraft({ unitsRequested: num })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                wizardDraft.unitsRequested === num
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          Typical surgical allocations range from 1 to 4 units; coordinate larger allocations directly with blood bank managers.
        </p>
      </div>

      {/* Unsure Modal */}
      {showUnsureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm With Treating Physician
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Administering an incompatible blood group can cause severe hemolytic transfusion reactions.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-2 mb-5">
              <p>
                1. Look at the patient's hospital chart, requisition slip, or blood sample tube.
              </p>
              <p>
                2. Contact the duty nursing officer or hospital blood bank desk directly.
              </p>
              <p>
                3. In extreme, uncrossmatched trauma resuscitations, hospitals utilize emergency <strong>O-Negative</strong> uncrossmatched units under physician orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUnsureModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
