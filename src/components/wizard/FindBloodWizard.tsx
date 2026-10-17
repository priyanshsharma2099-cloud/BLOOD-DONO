import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Step1BloodGroup } from './Step1BloodGroup';
import { Step2HospitalDetails } from './Step2HospitalDetails';
import { Step3NearbyFacilities } from './Step3NearbyFacilities';
import { Step4PatientDetails } from './Step4PatientDetails';
import { Step5DonorMessage } from './Step5DonorMessage';
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  AlertTriangle, 
  Check, 
  HeartHandshake 
} from 'lucide-react';

export const FindBloodWizard: React.FC = () => {
  const { 
    wizardDraft, 
    updateWizardDraft, 
    resetWizardDraft, 
    setCurrentView, 
    t 
  } = useApp();

  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const currentStep = wizardDraft.step || 1;

  const stepsList = [
    { number: 1, title: 'Blood Group' },
    { number: 2, title: 'Hospital' },
    { number: 3, title: 'Facilities & Map' },
    { number: 4, title: 'Patient Info' },
    { number: 5, title: 'Donor Message' },
  ];

  // Validate step before advancing
  const handleNext = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!wizardDraft.bloodGroup) {
        setValidationError('Please select a blood group to proceed.');
        return;
      }
    } else if (currentStep === 2) {
      if (wizardDraft.isHospitalManual) {
        if (!wizardDraft.manualHospitalName.trim() || !wizardDraft.manualHospitalAddress.trim()) {
          setValidationError('Please provide both the hospital name and address for manual entry.');
          return;
        }
      } else {
        if (!wizardDraft.selectedHospitalId) {
          setValidationError('Please select a hospital or choose manual entry.');
          return;
        }
      }
    } else if (currentStep === 4) {
      if (!wizardDraft.requesterName.trim() || !wizardDraft.requesterPhone.trim()) {
        setValidationError('Please enter your contact name and phone number so donors can coordinate.');
        return;
      }
    }

    updateWizardDraft({ step: currentStep + 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      updateWizardDraft({ step: currentStep - 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowDiscardModal(true);
    }
  };

  const handleDiscard = () => {
    resetWizardDraft();
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Top Progress Bar & Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Cancel Request' : t('back')}</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-500 tabular-nums">
              Step {currentStep} of 5
            </span>

            <button
              type="button"
              onClick={() => setShowDiscardModal(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Discard draft"
              aria-label="Discard draft"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Dots & Line */}
          <div className="relative">
            <div className="overflow-hidden h-1.5 mb-2 text-xs flex rounded-full bg-slate-100">
              <div
                style={{ width: `${(currentStep / 5) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-600 transition-all duration-300"
              />
            </div>

            <div className="hidden sm:grid grid-cols-5 text-center text-[11px] font-semibold text-slate-500">
              {stepsList.map((s) => (
                <span
                  key={s.number}
                  className={currentStep === s.number ? 'text-rose-600 font-bold' : currentStep > s.number ? 'text-slate-900' : 'text-slate-400'}
                >
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          {currentStep === 1 && <Step1BloodGroup />}
          {currentStep === 2 && <Step2HospitalDetails />}
          {currentStep === 3 && (
            <Step3NearbyFacilities
              onProceedToDonors={() => {
                updateWizardDraft({ step: 4 });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
          {currentStep === 4 && <Step4PatientDetails />}
          {currentStep === 5 && <Step5DonorMessage onBack={() => updateWizardDraft({ step: 4 })} />}

          {/* Validation Alert */}
          {validationError && (
            <div className="mt-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Bottom Navigation Buttons (Step 1-4) */}
          {currentStep < 5 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {currentStep === 1 ? 'Cancel' : t('back')}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 text-xs sm:text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>{currentStep === 3 ? 'Connect to Donors' : t('continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Discard Emergency Request?
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to exit? Your selected options will be discarded.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
