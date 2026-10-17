import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  X, 
  User, 
  HeartHandshake, 
  Building, 
  FlaskConical, 
  ShieldCheck, 
  Check 
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentRole, setCurrentRole, setCurrentView } = useApp();

  if (!isOpen) return null;

  const roles: {
    id: UserRole;
    title: string;
    description: string;
    icon: React.ElementType;
    targetView?: 'find-blood' | 'donor-hub' | 'facility-portal' | 'admin-portal';
  }[] = [
    {
      id: 'requester',
      title: 'Emergency Requester / Patient Family',
      description: 'Search nearby blood banks, locate reported stock, and initiate donor coordination.',
      icon: User,
      targetView: 'find-blood',
    },
    {
      id: 'donor',
      title: 'Consenting Registered Donor',
      description: 'Manage donation eligibility, view incoming matching requests, and coordinate response.',
      icon: HeartHandshake,
      targetView: 'donor-hub',
    },
    {
      id: 'hospital_staff',
      title: 'Hospital Transfusion Staff',
      description: 'Update real-time inventory counts, confirm stock availability, and manage patient allocation.',
      icon: Building,
      targetView: 'facility-portal',
    },
    {
      id: 'blood_bank_staff',
      title: 'Blood Bank Officer',
      description: 'Maintain regional blood bank reserves, verify component safety, and monitor city demand.',
      icon: FlaskConical,
      targetView: 'facility-portal',
    },
    {
      id: 'admin',
      title: 'Platform Administrator',
      description: 'Audit facility verification requests, inspect coordination activity logs, and oversee governance.',
      icon: ShieldCheck,
      targetView: 'admin-portal',
    },
  ];

  const handleSelectRole = (role: UserRole, targetView?: 'find-blood' | 'donor-hub' | 'facility-portal' | 'admin-portal') => {
    setCurrentRole(role);
    if (targetView) {
      setCurrentView(targetView);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-switcher-title"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          aria-label="Close role switcher"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Testing & Persona Navigation
          </span>
          <h2 id="role-switcher-title" className="text-lg font-bold text-slate-900">
            Switch Application Perspective
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Experience LifeLink AI as different stakeholders across the coordination lifecycle.
          </p>
        </div>

        <div className="space-y-2.5">
          {roles.map((r) => {
            const isSelected = currentRole === r.id;
            const Icon = r.icon;

            return (
              <button
                key={r.id}
                onClick={() => handleSelectRole(r.id, r.targetView)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50/60 ring-1 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">{r.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Persisted in your local browser session for rapid testing across all views.
        </div>
      </div>
    </div>
  );
};
