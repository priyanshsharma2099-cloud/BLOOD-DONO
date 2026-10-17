import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Facility, BloodGroup, BloodComponent, InventoryStatus } from '../../types';
import { 
  Building2, 
  Search, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter, 
  ExternalLink 
} from 'lucide-react';

export const FacilityDirectory: React.FC = () => {
  const { facilities, startNewBloodRequest, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const components: BloodComponent[] = ['whole_blood', 'prbc', 'platelets', 'plasma'];

  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      const matchQuery =
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'ALL' || fac.type === selectedType;

      let matchGroup = true;
      if (selectedGroup !== 'ALL') {
        const groupInv = fac.inventory[selectedGroup];
        matchGroup = Boolean(groupInv && Object.keys(groupInv).length > 0);
      }

      return matchQuery && matchType && matchGroup;
    });
  }, [facilities, searchQuery, selectedType, selectedGroup]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
              Participating Healthcare Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospitals & Blood Banks Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search verified facilities, view reported component reserves, and access emergency transfusion desks.
            </p>
          </div>

          <button
            onClick={startNewBloodRequest}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            {t('findBloodNow')}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search facility by name, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Facility Types</option>
                <option value="hospital_blood_bank">Hospital Blood Bank</option>
                <option value="regional_center">Regional Blood Center</option>
                <option value="voluntary_bank">Voluntary Community Center</option>
              </select>

              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value as any)}
                className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Blood Groups</option>
                {bloodGroups.map((grp) => (
                  <option key={grp} value={grp}>
                    Group {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredFacilities.length} facilities</span>
            <span>Stock counts subject to direct hospital confirmation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFacilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Details */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {fac.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fac.address}, {fac.city}, {fac.state} {fac.postalCode}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {fac.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Unverified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inventory Mini-Matrix */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                      Reported Component Stock
                    </span>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {bloodGroups.slice(0, 4).map((grp) => {
                        const inv = fac.inventory[grp];
                        const wholeQty = inv?.whole_blood?.quantity ?? 0;
                        const prbcQty = inv?.prbc?.quantity ?? 0;

                        return (
                          <div key={grp} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              {grp}
                            </span>
                            <span className="text-[10px] text-slate-500 block tabular-nums">
                              {wholeQty + prbcQty} units
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Contact Hotline */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${fac.emergencyHotline || fac.contactPhone}`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{fac.emergencyHotline || fac.contactPhone}</span>
                  </a>

                  <button
                    onClick={startNewBloodRequest}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Request From Facility →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
