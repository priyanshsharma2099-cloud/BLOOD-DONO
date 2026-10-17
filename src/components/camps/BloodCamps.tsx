import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Phone, 
  Check, 
  Search, 
  Heart 
} from 'lucide-react';

export const BloodCamps: React.FC = () => {
  const { camps, pledgeCampRSVP, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [pledgedCamps, setPledgedCamps] = useState<Record<string, boolean>>({});

  const filteredCamps = camps.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePledge = (campId: string) => {
    if (pledgedCamps[campId]) return;
    pledgeCampRSVP(campId);
    setPledgedCamps((prev) => ({ ...prev, [campId]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
              Community Mobilization
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nearby Blood Donation Camps
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find scheduled community drives and pledge your donation to support regional blood reserves.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search donation camps by location, organizer, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>

        {/* Camps List */}
        <div className="space-y-4">
          {filteredCamps.map((camp) => {
            const isPledged = pledgedCamps[camp.id];
            const progressPercent = Math.min(100, Math.round((camp.registeredDonorsCount / camp.targetUnits) * 100));

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold">
                      {camp.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Organized by {camp.organizer}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {camp.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(camp.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{camp.startTime} – {camp.endTime}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{camp.address}, {camp.city}</span>
                    </div>
                  </div>

                  {/* Progress Bar towards Target Units */}
                  <div className="pt-2 max-w-sm">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Pledges: <strong className="text-slate-800 font-mono">{camp.registeredDonorsCount}</strong></span>
                      <span>Target: <strong className="text-slate-800 font-mono">{camp.targetUnits} units</strong></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className="bg-rose-600 h-1.5 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="shrink-0 flex flex-col sm:items-end gap-2">
                  <button
                    onClick={() => handlePledge(camp.id)}
                    disabled={isPledged}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isPledged
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    }`}
                  >
                    {isPledged ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pledge Registered</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5" />
                        <span>Pledge to Donate</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${camp.contactPhone}`}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Inquire: {camp.contactPhone}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
