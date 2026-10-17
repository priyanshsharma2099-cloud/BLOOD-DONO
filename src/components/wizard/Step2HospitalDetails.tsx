import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  MapPin, 
  Search, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Check, 
  Plus 
} from 'lucide-react';
import { calculateDistanceKm } from '../../data/mockData';

export const Step2HospitalDetails: React.FC = () => {
  const { wizardDraft, updateWizardDraft, facilities, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // User's coordinates from geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filter facilities by query
  const filteredFacilities = useMemo(() => {
    return facilities.map((fac) => {
      const distance = userLocation
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, fac.latitude, fac.longitude)
        : calculateDistanceKm(37.7749, -122.4194, fac.latitude, fac.longitude);
      return { ...fac, distanceKm: distance };
    }).filter((fac) => {
      const matchName = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = !cityFilter || fac.city.toLowerCase().includes(cityFilter.toLowerCase());
      return matchName && matchCity;
    }).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [facilities, searchQuery, cityFilter, userLocation]);

  // Request Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Locating nearby facilities...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('Location acquired successfully.');
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('Location access denied or unavailable. You can search manually.');
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 8000 }
    );
  };

  const handleSelectFacility = (facId: string) => {
    updateWizardDraft({
      selectedHospitalId: facId,
      isHospitalManual: false,
    });
  };

  const timeframeOptions = [
    { label: 'Immediate (< 1 hr)', value: 'Immediate' },
    { label: 'Within 2 hours', value: 'Within 2 hours' },
    { label: 'Today (Within 6 hrs)', value: 'Today' },
    { label: 'Scheduled Surgery (Tomorrow)', value: 'Tomorrow' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
          Step 2 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('step2Title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Specify the treatment facility where units will be delivered or cross-matched.
        </p>
      </div>

      {/* Mode Switcher: Verified Directory vs Manual Entry */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => updateWizardDraft({ isHospitalManual: false })}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            !wizardDraft.isHospitalManual
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Select Participating Facility</span>
        </button>

        <button
          type="button"
          onClick={() => updateWizardDraft({ isHospitalManual: true })}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            wizardDraft.isHospitalManual
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Enter Hospital Manually (Unverified)</span>
        </button>
      </div>

      {!wizardDraft.isHospitalManual ? (
        /* Participating Hospital Directory Search */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search hospital by name or street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 text-rose-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
            </button>
          </div>

          {locationStatus && (
            <p className="text-[11px] text-slate-500 italic px-1">
              {locationStatus}
            </p>
          )}

          {/* Facility List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredFacilities.map((fac) => {
              const isSelected = wizardDraft.selectedHospitalId === fac.id;

              return (
                <div
                  key={fac.id}
                  onClick={() => handleSelectFacility(fac.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/60 ring-1 ring-rose-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {fac.name}
                        </span>
                        {fac.isVerified ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Unverified
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {fac.address}, {fac.city}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-700 tabular-nums block">
                      ~{fac.distanceKm} km
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {fac.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Manual Hospital Entry Form */
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Manual hospital entries will be tagged as Unverified.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hospital / Clinic Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. St. Luke's Community Hospital"
              value={wizardDraft.manualHospitalName}
              onChange={(e) => updateWizardDraft({ manualHospitalName: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street Address <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 742 Evergreen Terrace"
                value={wizardDraft.manualHospitalAddress}
                onChange={(e) => updateWizardDraft({ manualHospitalAddress: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Region <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Metro City"
                value={wizardDraft.manualHospitalCity}
                onChange={(e) => updateWizardDraft({ manualHospitalCity: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Ward / Room and Timeframe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Ward, Room, or ICU Bed (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Ward 4B, ICU Bed 12"
            value={wizardDraft.roomWard}
            onChange={(e) => updateWizardDraft({ roomWard: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Required-By Urgency <span className="text-rose-600">*</span>
          </label>
          <select
            value={wizardDraft.requiredByTime}
            onChange={(e) => updateWizardDraft({ requiredByTime: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {timeframeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
