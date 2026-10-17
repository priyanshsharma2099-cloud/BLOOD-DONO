import React from 'react';
import { useApp } from '../../context/AppContext';
import { ConditionCategory, ContactMethod } from '../../types';
import { ShieldCheck, User, Phone, AlertCircle, FileText } from 'lucide-react';

export const Step4PatientDetails: React.FC = () => {
  const { wizardDraft, updateWizardDraft, facilities, t } = useApp();

  const conditionOptions: { id: ConditionCategory; label: string }[] = [
    { id: 'accident', label: 'Accident / Trauma' },
    { id: 'surgery', label: 'Surgical Procedure' },
    { id: 'childbirth', label: 'Childbirth / Maternal' },
    { id: 'medical', label: 'Medical Condition' },
    { id: 'critical', label: 'Critical ICU Situation' },
    { id: 'other', label: 'Other Healthcare Need' },
  ];

  const contactMethods: { id: ContactMethod; label: string }[] = [
    { id: 'phone', label: 'Direct Phone Call' },
    { id: 'sms', label: 'SMS Text' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'in_app', label: 'LifeLink In-App Only' },
  ];

  // Resolve hospital name
  const hospitalName = wizardDraft.isHospitalManual
    ? wizardDraft.manualHospitalName || 'Manual Location'
    : facilities.find((f) => f.id === wizardDraft.selectedHospitalId)?.name || 'Selected Hospital';

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
          Step 4 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('step4Title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide essential contact and coordination details. Only coordination data is shared with consenting donors.
        </p>
      </div>

      {/* Carried Forward Summary Strip */}
      <div className="p-3.5 bg-slate-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Requirement</span>
          <span className="font-extrabold text-rose-700 font-mono text-sm">
            {wizardDraft.unitsRequested} Unit(s) of {wizardDraft.bloodGroup} {wizardDraft.component.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Facility</span>
          <span className="font-bold text-slate-800 truncate max-w-xs block">
            {hospitalName}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Timeframe</span>
          <span className="font-semibold text-slate-800">
            {wizardDraft.requiredByTime}
          </span>
        </div>
      </div>

      {/* Requester Contact (Mandatory for coordination) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Primary Requester / Coordinator Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Name / Attendant Name <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. David Ross (Patient's Brother)"
                value={wizardDraft.requesterName}
                onChange={(e) => updateWizardDraft({ requesterName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone Number <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                placeholder="e.g. +1 (555) 019-2831"
                value={wizardDraft.requesterPhone}
                onChange={(e) => updateWizardDraft({ requesterPhone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Preferred Contact Method */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Preferred Method for Responding Donors to Reach You
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {contactMethods.map((cm) => (
              <button
                key={cm.id}
                type="button"
                onClick={() => updateWizardDraft({ preferredContact: cm.id })}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                  wizardDraft.preferredContact === cm.id
                    ? 'border-rose-600 bg-rose-50 text-rose-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Information (Minimal & Optional for privacy) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Patient Information (Optional for Privacy)
          </h3>
          <span className="text-[11px] text-slate-400">Never broadcast publicly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Patient Name / Initials (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. S.R. (or leave blank)"
              value={wizardDraft.patientName}
              onChange={(e) => updateWizardDraft({ patientName: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Patient Age (Optional)
            </label>
            <input
              type="number"
              placeholder="e.g. 42"
              value={wizardDraft.patientAge}
              onChange={(e) => updateWizardDraft({ patientAge: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Condition Category Chips */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Condition Category (Optional context for coordination)
        </label>
        <div className="flex flex-wrap gap-2">
          {conditionOptions.map((opt) => {
            const isSelected = wizardDraft.conditionCategory === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateWizardDraft({ conditionCategory: opt.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Short Non-Confidential Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Brief Non-Confidential Note (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Scheduled morning cardiac surgery; blood bank requisition #B-4921."
          value={wizardDraft.conditionNote}
          onChange={(e) => updateWizardDraft({ conditionNote: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Do not include diagnosis codes, sensitive medical records, or government ID numbers.
        </p>
      </div>

      {/* Privacy Guarantee Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Safeguard:</strong> LifeLink AI never broadcasts full patient identities or clinical charts. Only matching donors receive the coordination hospital location, required component, and units needed.
        </p>
      </div>
    </div>
  );
};
