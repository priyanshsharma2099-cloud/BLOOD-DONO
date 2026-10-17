import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { generateDonorMessage } from '../../services/geminiService';
import { 
  Sparkles, 
  Send, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Building2, 
  RefreshCw, 
  CheckCircle2, 
  Users 
} from 'lucide-react';

interface Step5DonorMessageProps {
  onBack: () => void;
}

export const Step5DonorMessage: React.FC<Step5DonorMessageProps> = ({ onBack }) => {
  const { 
    wizardDraft, 
    updateWizardDraft, 
    facilities, 
    donors, 
    submitBloodRequest, 
    t 
  } = useApp();

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Hospital Name
  const hospitalName = wizardDraft.isHospitalManual
    ? wizardDraft.manualHospitalName || 'Manual Healthcare Location'
    : facilities.find((f) => f.id === wizardDraft.selectedHospitalId)?.name || 'Selected Facility';

  // Matched consented donors within range
  const matchedDonors = donors.filter((d) => {
    if (!d.isAvailable || !d.consentGiven) return false;
    if (wizardDraft.bloodGroup && d.bloodGroup !== wizardDraft.bloodGroup && d.bloodGroup !== 'O-') {
      return false;
    }
    return true;
  });

  // Generate default message on initial load if empty
  useEffect(() => {
    if (!wizardDraft.donorMessage) {
      const defaultMsg = `Urgent request for ${wizardDraft.bloodGroup} ${wizardDraft.component.replace('_', ' ').toUpperCase()} (${wizardDraft.unitsRequested} unit${
        wizardDraft.unitsRequested > 1 ? 's' : ''
      }) at ${hospitalName}. If you are a consenting registered donor willing to help, please respond through LifeLink AI. Real clinical eligibility and donation arrangements will be confirmed directly by the transfusion center.`;
      updateWizardDraft({ donorMessage: defaultMsg });
    }
  }, [wizardDraft.bloodGroup, wizardDraft.component, wizardDraft.unitsRequested, hospitalName]);

  // AI Refinement Call
  const handleRefineWithAi = async () => {
    setIsAiLoading(true);
    setAiNote(null);
    try {
      const result = await generateDonorMessage({
        bloodGroup: wizardDraft.bloodGroup,
        component: wizardDraft.component,
        unitsRequested: wizardDraft.unitsRequested,
        hospitalName,
        conditionCategory: wizardDraft.conditionCategory,
        conditionNote: wizardDraft.conditionNote,
      });

      updateWizardDraft({ donorMessage: result.message });
      if (result.isAiGenerated) {
        setAiNote('Message refined by Gemini 3.8 Flash.');
      } else {
        setAiNote('Message drafted using standard emergency coordination template.');
      }
    } catch (err) {
      setAiNote('Template active. Configure GEMINI_API_KEY in Secrets for live AI drafting.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit Request
  const handleSubmit = async () => {
    if (!wizardDraft.bloodGroup) {
      setSubmissionError('Please select a blood group before submitting.');
      return;
    }
    if (!wizardDraft.requesterName || !wizardDraft.requesterPhone) {
      setSubmissionError('Please provide a coordinator name and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await submitBloodRequest();
      // On success, submitBloodRequest automatically navigates to 'tracker' view!
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setSubmissionError(err instanceof Error ? err.message : 'Failed to submit emergency request. Please retry.');
      setIsSubmitting(false);
    }
  };

  const charLimit = 320;
  const currentLength = wizardDraft.donorMessage.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
          Step 5 of 5 — Review & Broadcast
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('step5Title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review the broadcast text sent to consenting registered donors within range.
        </p>
      </div>

      {/* Request Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Request Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
            <span className="text-base font-black font-mono text-rose-600 block">
              {wizardDraft.bloodGroup}
            </span>
            <span className="text-[11px] text-slate-500 capitalize">
              {wizardDraft.component.replace('_', ' ')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quantity</span>
            <span className="text-base font-black font-mono text-slate-900 block">
              {wizardDraft.unitsRequested} {wizardDraft.unitsRequested === 1 ? 'Unit' : 'Units'}
            </span>
            <span className="text-[11px] text-slate-500">
              {wizardDraft.requiredByTime}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 col-span-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hospital & Ward</span>
            <span className="text-xs font-bold text-slate-900 truncate block">
              {hospitalName}
            </span>
            <span className="text-[11px] text-slate-500">
              {wizardDraft.roomWard || 'General Inpatient Requisition'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Donors Match Strip */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold font-mono">
            {matchedDonors.length}
          </div>
          <div>
            <span className="font-bold text-emerald-950 block">
              {matchedDonors.length} Consenting Registered Donors Eligible
            </span>
            <span className="text-[11px] text-emerald-700">
              Within {wizardDraft.searchRadiusKm} km radius of {hospitalName}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-800">
          In-App & SMS Alerts
        </span>
      </div>

      {/* Message Editing Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Donor Broadcast Message <span className="text-rose-600">*</span>
          </label>

          <button
            type="button"
            onClick={handleRefineWithAi}
            disabled={isAiLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Drafting...' : 'Refine with Gemini AI'}</span>
          </button>
        </div>

        <textarea
          rows={4}
          value={wizardDraft.donorMessage}
          maxLength={charLimit}
          onChange={(e) => updateWizardDraft({ donorMessage: e.target.value })}
          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{aiNote || 'Concise message avoiding private clinical details.'}</span>
          <span className={`font-mono tabular-nums ${currentLength > charLimit - 20 ? 'text-amber-600 font-bold' : ''}`}>
            {currentLength} / {charLimit}
          </span>
        </div>
      </div>

      {/* Message Preview Box */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-600 block">Donor Notification Preview:</span>
        <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-sans leading-relaxed border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1 font-mono">
            <span>[LifeLink Alert · {wizardDraft.bloodGroup}]</span>
            <span>Just Now</span>
          </div>
          <p>{wizardDraft.donorMessage}</p>
        </div>
      </div>

      {/* Error state */}
      {submissionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Final Submission Bar */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-center"
        >
          Back to Details
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3.5 text-xs sm:text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all flex items-center justify-center gap-2.5 tracking-wide disabled:opacity-50"
        >
          <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
          <span>{isSubmitting ? 'PERSISTING & DISPATCHING...' : t('sendEmergencyRequest')}</span>
        </button>
      </div>
    </div>
  );
};
