import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, BloodComponent, InventoryStatus } from '../../types';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Save, 
  AlertCircle, 
  Check, 
  Activity 
} from 'lucide-react';

export const FacilityPortal: React.FC = () => {
  const { 
    facilities, 
    updateFacilityInventory, 
    requests, 
    simulateHospitalConfirmation 
  } = useApp();

  const [activeFacilityId, setActiveFacilityId] = useState<string>(facilities[0]?.id || 'fac-metro-trauma');
  const facility = facilities.find((f) => f.id === activeFacilityId) || facilities[0];

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('prbc');
  const [quantity, setQuantity] = useState<number>(4);
  const [status, setStatus] = useState<InventoryStatus>('confirmed');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const components: { id: BloodComponent; label: string }[] = [
    { id: 'whole_blood', label: 'Whole Blood' },
    { id: 'prbc', label: 'Packed Red Blood Cells (PRBC)' },
    { id: 'platelets', label: 'Platelets (SDP / RDP)' },
    { id: 'plasma', label: 'Fresh Frozen Plasma (FFP)' },
  ];

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateFacilityInventory(facility.id, selectedGroup, selectedComponent, quantity, status);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Requests directed to or near this facility
  const facilityRequests = requests.filter(
    (r) => r.hospitalId === facility.id || r.hospitalName.toLowerCase().includes(facility.city.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
              Authorized Transfusion Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Inventory Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Update certified component stocks and confirm allocations for urgent transfusions.
            </p>
          </div>

          {/* Facility Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Managing:</span>
            <select
              value={activeFacilityId}
              onChange={(e) => setActiveFacilityId(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Facility Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {facility.name}
                </h2>
                {facility.isVerified && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Desk
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {facility.address}, {facility.city} · Hotline: {facility.emergencyHotline}
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Desk Verification</span>
            <span className="font-semibold text-slate-700">Staff Session Authorized</span>
          </div>
        </div>

        {/* Inventory Update Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Update Component Inventory Count
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none"
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
                  Component
                </label>
                <select
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value as BloodComponent)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                >
                  {components.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity Available (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmation Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InventoryStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                >
                  <option value="confirmed">Confirmed by facility</option>
                  <option value="pending">Reported available — pending check</option>
                  <option value="outdated">Information outdated</option>
                  <option value="unavailable">Currently unavailable</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Updates are logged with staff identity and timestamped immediately.
              </span>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Stock Update</span>
              </button>
            </div>
          </form>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Inventory record updated and published to emergency network!</span>
            </div>
          )}
        </div>

        {/* Patient Emergency Requisitions Queue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Incoming Emergency Transfusion Requisitions</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {facilityRequests.length} active
            </span>
          </div>

          {facilityRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No pending emergency requests assigned to this hospital.
            </p>
          ) : (
            <div className="space-y-3">
              {facilityRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-900">{req.id}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono font-bold">
                        {req.bloodGroup} {req.component.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-700">
                        ({req.unitsFulfilled}/{req.unitsRequested} units)
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Coordinator: {req.requesterName} ({req.requesterPhone}) · Timeframe: {req.requiredBy}
                    </p>
                  </div>

                  {req.status !== 'fulfilled' && (
                    <button
                      onClick={() => simulateHospitalConfirmation(req.id, 1)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Allocate 1 Unit from Stock</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
