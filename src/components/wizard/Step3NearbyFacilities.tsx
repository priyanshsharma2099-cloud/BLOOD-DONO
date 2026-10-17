import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Facility, InventoryStatus, BloodGroup, BloodComponent } from '../../types';
import { calculateDistanceKm } from '../../data/mockData';
import { InteractiveMap } from '../map/InteractiveMap';
import { 
  Building2, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  SlidersHorizontal, 
  List, 
  Map as MapIcon, 
  HelpCircle,
  Users
} from 'lucide-react';

interface Step3NearbyFacilitiesProps {
  onProceedToDonors: () => void;
}

export const Step3NearbyFacilities: React.FC<Step3NearbyFacilitiesProps> = ({ onProceedToDonors }) => {
  const { wizardDraft, updateWizardDraft, facilities, t } = useApp();

  const [activeTab, setActiveTab] = useState<'both' | 'list' | 'map'>('both');
  const [sortBy, setSortBy] = useState<'distance' | 'freshness' | 'confirmation'>('distance');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Target hospital coordinates
  const targetHospital = useMemo(() => {
    if (wizardDraft.isHospitalManual) {
      return {
        name: wizardDraft.manualHospitalName || 'Manual Location',
        lat: wizardDraft.manualHospitalLat || 37.7749,
        lng: wizardDraft.manualHospitalLng || -122.4194,
      };
    }
    const found = facilities.find((f) => f.id === wizardDraft.selectedHospitalId);
    return found
      ? { name: found.name, lat: found.latitude, lng: found.longitude }
      : { name: 'Metro Trauma Center', lat: 37.7749, lng: -122.4194 };
  }, [facilities, wizardDraft]);

  // Radius filtering & distance calculation
  const matchedFacilities = useMemo(() => {
    const group = (wizardDraft.bloodGroup as BloodGroup) || 'O+';
    const comp = wizardDraft.component || 'whole_blood';

    return facilities.map((fac) => {
      const distance = calculateDistanceKm(
        targetHospital.lat,
        targetHospital.lng,
        fac.latitude,
        fac.longitude
      );

      // Inventory item for selected group and component
      const invGroup = fac.inventory[group];
      const invItem = invGroup ? invGroup[comp] : undefined;

      let status: InventoryStatus = invItem?.status || 'unknown';
      let quantity = invItem?.quantity ?? 0;
      let lastUpdated = invItem?.lastUpdated || null;

      return {
        ...fac,
        distanceKm: distance,
        reportedQuantity: quantity,
        reportedStatus: status,
        reportedLastUpdated: lastUpdated,
      };
    })
    .filter((fac) => fac.distanceKm <= wizardDraft.searchRadiusKm)
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'freshness') {
        const timeA = a.reportedLastUpdated ? new Date(a.reportedLastUpdated).getTime() : 0;
        const timeB = b.reportedLastUpdated ? new Date(b.reportedLastUpdated).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'confirmation') {
        const score = (st: InventoryStatus) =>
          st === 'confirmed' ? 3 : st === 'pending' ? 2 : st === 'outdated' ? 1 : 0;
        return score(b.reportedStatus) - score(a.reportedStatus);
      }
      return 0;
    });
  }, [facilities, targetHospital, wizardDraft.bloodGroup, wizardDraft.component, wizardDraft.searchRadiusKm, sortBy]);

  // Check if any confirmed stock is available within radius
  const hasConfirmedNearby = matchedFacilities.some(
    (f) => f.reportedStatus === 'confirmed' && (f.reportedQuantity || 0) >= wizardDraft.unitsRequested
  );

  const getStatusBadge = (status: InventoryStatus, qty: number) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Confirmed by facility ({qty} units)</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Reported available — confirmation pending</span>
          </span>
        );
      case 'outdated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            <span>Information outdated</span>
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Currently unavailable</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
            <span>No inventory data available</span>
          </span>
        );
    }
  };

  const getRelativeTime = (isoString: string | null) => {
    if (!isoString) return 'No timestamp recorded';
    const diffMins = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
          Step 3 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('step3Title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Showing reported inventory for <strong className="text-slate-900">{wizardDraft.bloodGroup} {wizardDraft.component.replace('_', ' ').toUpperCase()}</strong> within your selected search radius.
        </p>
      </div>

      {/* Radius Controls & Mobile View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        
        {/* Radius Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Search Radius:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {([25, 50, 100] as const).map((rad) => (
              <button
                key={rad}
                type="button"
                onClick={() => updateWizardDraft({ searchRadiusKm: rad })}
                className={`px-3 py-1 text-xs font-bold font-mono rounded-md transition-all ${
                  wizardDraft.searchRadiusKm === rad
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rad} km
              </button>
            ))}
          </div>
        </div>

        {/* Sorting Dropdown & Mobile Map Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="distance">Nearest Distance</option>
              <option value="freshness">Freshest Inventory</option>
              <option value="confirmation">Confirmation Status</option>
            </select>
          </div>

          {/* Mobile view toggle */}
          <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-lg ml-auto">
            <button
              onClick={() => setActiveTab('list')}
              className={`p-1.5 rounded-md ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`p-1.5 rounded-md ${activeTab === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              aria-label="Map view"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Fallback CTA Banner */}
      {!hasConfirmedNearby && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Can't find confirmed blood nearby? Connect to donors now.
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Dispatch an emergency alert to consenting registered donors within range while facilities are contacted.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToDonors}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Connect to Donors Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Map + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Facilities List (7 cols on desktop) */}
        <div className={`space-y-3 lg:col-span-7 ${activeTab === 'map' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">
              {matchedFacilities.length} {matchedFacilities.length === 1 ? 'Facility' : 'Facilities'} within {wizardDraft.searchRadiusKm} km
            </span>
            <span className="text-[11px] text-slate-400">
              Ordered by {sortBy}
            </span>
          </div>

          {matchedFacilities.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <Building2 className="w-8 h-8 mx-auto text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800">
                No facilities located within {wizardDraft.searchRadiusKm} km
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Expand your search radius to 50 km or 100 km, or initiate direct outreach to registered community donors.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                {wizardDraft.searchRadiusKm < 50 && (
                  <button
                    type="button"
                    onClick={() => updateWizardDraft({ searchRadiusKm: 50 })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Expand to 50 km
                  </button>
                )}
                {wizardDraft.searchRadiusKm < 100 && (
                  <button
                    type="button"
                    onClick={() => updateWizardDraft({ searchRadiusKm: 100 })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Expand to 100 km
                  </button>
                )}
                <button
                  type="button"
                  onClick={onProceedToDonors}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                >
                  Connect to Donors
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {matchedFacilities.map((fac) => (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedFacility?.id === fac.id
                      ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {fac.name}
                        </h4>
                        {fac.isVerified ? (
                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fac.address}, {fac.city}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-800 tabular-nums block">
                        {fac.distanceKm} km
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {fac.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      {getStatusBadge(fac.reportedStatus as InventoryStatus, fac.reportedQuantity || 0)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Updated {getRelativeTime(fac.reportedLastUpdated)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${fac.emergencyHotline || fac.contactPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>{fac.emergencyHotline || fac.contactPhone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProceedToDonors();
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <span>Also Alert Donors</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Vector Map (5 cols on desktop) */}
        <div className={`lg:col-span-5 ${activeTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-20">
            <InteractiveMap
              facilities={matchedFacilities}
              centerLat={targetHospital.lat}
              centerLng={targetHospital.lng}
              centerLabel={targetHospital.name}
              radiusKm={wizardDraft.searchRadiusKm}
              selectedFacilityId={selectedFacility?.id}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
              heightClass="h-[460px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
