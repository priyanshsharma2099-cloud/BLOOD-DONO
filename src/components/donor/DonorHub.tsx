import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, ContactMethod } from '../../types';
import { 
  HeartHandshake, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  UserPlus, 
  BellRing, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';

export const DonorHub: React.FC = () => {
  const { 
    donors, 
    registerDonor, 
    toggleDonorAvailability, 
    notifications, 
    simulateDonorResponse, 
    requests, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'incoming' | 'register'>('profile');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState<BloodGroup>('O+');
  const [regCity, setRegCity] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regContactMethod, setRegContactMethod] = useState<ContactMethod>('sms');
  const [regRadius, setRegRadius] = useState<number>(30);
  const [regConsentAlerts, setRegConsentAlerts] = useState(false);
  const [regConsentHealth, setRegConsentHealth] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // Active donor profile for testing (default to first donor)
  const [activeDonorId, setActiveDonorId] = useState<string>(donors[0]?.id || 'donor-001');
  const activeDonor = donors.find((d) => d.id === activeDonorId) || donors[0];

  // Incoming alerts for this donor
  const donorAlerts = notifications.filter((n) => n.donorId === activeDonor?.id);

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regCity.trim() || !regPhone.trim()) {
      setRegError('Please fill in your name, broad location, and phone number.');
      return;
    }
    if (!regConsentAlerts || !regConsentHealth) {
      setRegError('Please confirm the consent declarations to join the donor registry.');
      return;
    }

    registerDonor({
      displayName: regName.trim(),
      bloodGroup: regBloodGroup,
      city: regCity.trim(),
      latitude: 37.7749,
      longitude: -122.4194,
      contactPhone: regPhone.trim(),
      email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      preferredContact: regContactMethod,
      isAvailable: true,
      consentGiven: true,
      radiusKm: regRadius,
    });

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setActiveTab('profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
              Voluntary Donor Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Donor Coordination Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage emergency outreach preferences, availability status, and direct request responses.
            </p>
          </div>

          {/* Persona selector for rapid testing */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Test Donor:</span>
            <select
              value={activeDonor?.id}
              onChange={(e) => setActiveDonorId(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.displayName} ({d.bloodGroup} - {d.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl max-w-md">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Profile & Availability
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative ${
              activeTab === 'incoming'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Emergency Requests</span>
            {donorAlerts.some((a) => a.responseStatus === 'none') && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                {donorAlerts.filter((a) => a.responseStatus === 'none').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Register New
          </button>
        </div>

        {/* TAB 1: Profile & Availability */}
        {activeTab === 'profile' && activeDonor && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            
            {/* Header Strip with Availability Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-mono font-extrabold text-xl shrink-0">
                  {activeDonor.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeDonor.displayName}
                    </h3>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Consenting Donor
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeDonor.city} · Alert Radius: {activeDonor.radiusKm} km · Preferred: {activeDonor.preferredContact.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Availability Switch */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  {activeDonor.isAvailable ? 'Available for Alerts' : 'Temporarily Unavailable'}
                </span>
                <button
                  type="button"
                  onClick={() => toggleDonorAvailability(activeDonor.id, !activeDonor.isAvailable)}
                  className={`p-1 rounded-full transition-colors ${
                    activeDonor.isAvailable ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-500'
                  }`}
                  aria-label="Toggle availability"
                >
                  {activeDonor.isAvailable ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            </div>

            {/* Profile Statistics & Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lifetime Donations</span>
                <span className="text-xl font-black font-mono text-slate-900 block">
                  {activeDonor.totalDonationsCount}
                </span>
                <span className="text-[11px] text-slate-500">Verified at blood centers</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Donation Date</span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  {activeDonor.lastDonationDate
                    ? new Date(activeDonor.lastDonationDate).toLocaleDateString()
                    : 'No prior record'}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">Eligible to donate</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Privacy</span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  Protected Mask
                </span>
                <span className="text-[11px] text-slate-500">Number never public</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Alert Dispatch</span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  In-App & SMS
                </span>
                <span className="text-[11px] text-slate-500">Active within {activeDonor.radiusKm} km</span>
              </div>
            </div>

            {/* Privacy Declaration */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Privacy Notice:</span>
                <p>
                  Your exact home address and contact number are never shown publicly. When an emergency matching your blood group ({activeDonor.bloodGroup}) is initiated, you receive a direct coordination alert. Only if you explicitly click "Interested" will the treating hospital transfusion desk be notified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Incoming Emergency Requests */}
        {activeTab === 'incoming' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Emergency Alerts Matched to {activeDonor?.displayName} ({activeDonor?.bloodGroup})
            </h3>

            {donorAlerts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                <BellRing className="w-8 h-8 mx-auto text-slate-300" />
                <h4 className="text-sm font-bold text-slate-800">No Active Emergency Requests</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When a hospital or family within {activeDonor?.radiusKm} km submits an emergency request for {activeDonor?.bloodGroup}, alerts will appear here instantly.
                </p>
              </div>
            ) : (
              donorAlerts.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono font-bold text-xs">
                          {notif.bloodGroup} {notif.component.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {notif.units} unit(s) urgently needed
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Facility: <strong className="text-slate-800">{notif.hospitalName}</strong>
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Donor Action Controls */}
                  {notif.responseStatus === 'none' ? (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <span className="text-xs text-slate-600 font-medium">
                        Are you available and willing to coordinate with this hospital?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => simulateDonorResponse(notif.id, 'interested')}
                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Interested in Coordinating</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => simulateDonorResponse(notif.id, 'unavailable')}
                          className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Unavailable
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {notif.responseStatus === 'interested' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          You accepted to coordinate. Transfusion desk has been notified.
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Marked as unavailable for this request.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Donor Registration Form */}
        {activeTab === 'register' && (
          <form
            onSubmit={handleRegister}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Register as a Consenting Donor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Join our network to receive direct emergency alerts when a matching patient needs blood.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name (e.g. Alex M.) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rachel K."
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group <span className="text-rose-600">*</span>
                </label>
                <select
                  value={regBloodGroup}
                  onChange={(e) => setRegBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {bloodGroups.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / Broad Neighborhood <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metro City (Downtown)"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 492-0199"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Contact Channel
                </label>
                <select
                  value={regContactMethod}
                  onChange={(e) => setRegContactMethod(e.target.value as ContactMethod)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none"
                >
                  <option value="sms">SMS Text Alert</option>
                  <option value="phone">Direct Phone Call</option>
                  <option value="whatsapp">WhatsApp Notification</option>
                  <option value="in_app">LifeLink In-App Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maximum Alert Radius ({regRadius} km)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={regRadius}
                  onChange={(e) => setRegRadius(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-600 mt-2"
                />
              </div>
            </div>

            {/* Explicit Consent Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regConsentAlerts}
                  onChange={(e) => setRegConsentAlerts(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <span>
                  <strong>Explicit Emergency Consent:</strong> I agree to receive urgent automated and direct coordination notifications when a compatible patient requires blood within my selected radius.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regConsentHealth}
                  onChange={(e) => setRegConsentHealth(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <span>
                  <strong>Medical Protocol Understanding:</strong> I understand that my willingness to coordinate does not certify blood safety or clinical suitability; all donations are subject to laboratory screening and health checks by authorized blood centers.
                </span>
              </label>
            </div>

            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Donor profile registered successfully! Loading profile...</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-colors"
            >
              Confirm Registration & Join Donor Network
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
