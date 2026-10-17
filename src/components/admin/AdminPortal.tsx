import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Building2, 
  Check, 
  AlertCircle, 
  Activity, 
  Lock, 
  CheckCircle2, 
  Users 
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { facilities, verifyFacility, requests, donors, t } = useApp();

  const [activeTab, setActiveTab] = useState<'verification' | 'audit' | 'overview'>('verification');

  const unverifiedFacilities = facilities.filter((f) => !f.isVerified);
  const verifiedFacilities = facilities.filter((f) => f.isVerified);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
              Governance & Oversight
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrative Verification Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review unverified healthcare facilities, inspect request lifecycle audit trails, and oversee network integrity.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl max-w-md">
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative ${
              activeTab === 'verification'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Facility Verification</span>
            {unverifiedFacilities.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono">
                {unverifiedFacilities.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security Overview
          </button>
        </div>

        {/* TAB 1: Verification Queue */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Pending Verification Requests ({unverifiedFacilities.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Facilities entered manually by users or awaiting accreditation
                </span>
              </div>

              {unverifiedFacilities.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold">All facilities in directory are verified!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unverifiedFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{fac.name}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {fac.address}, {fac.city} · Contact: {fac.contactPhone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => verifyFacility(fac.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Verify Facility</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List of Verified Facilities */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Accredited Participating Facilities ({verifiedFacilities.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {verifiedFacilities.map((fac) => (
                  <div key={fac.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{fac.name}</span>
                      <span className="text-slate-500">{fac.address}, {fac.city}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accredited
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              System Coordination Activity Stream
            </h3>

            <div className="space-y-3">
              {requests.flatMap((r) => r.activityLogs).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[11px] font-mono text-slate-500">{log.requestId}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                    <span className="text-[10px] text-rose-700 font-semibold block">
                      Actor: {log.actor} ({log.actorRole.replace('_', ' ')})
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Security & Compliance Overview */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Security Governance & Privacy Safeguards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Least Privilege Access Control</span>
                <p className="text-slate-600 leading-relaxed">
                  Requesters can only view and manage their own requests. Hospital staff are restricted to their authenticated facility inventory. Donors cannot enumerate or view other registered donors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Strict Donor Privacy</span>
                <p className="text-slate-600 leading-relaxed">
                  Donor phone numbers and exact coordinates are never exposed to the public web interface or queryable endpoints. Coordination is facilitated through in-app channels.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">No Fabricated Telemetry</span>
                <p className="text-slate-600 leading-relaxed">
                  All metrics in the application reflect actual persisted data items in local storage and backend endpoints. Stock freshness timestamps are explicitly recorded.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Clinical Boundary Enforcement</span>
                <p className="text-slate-600 leading-relaxed">
                  The application coordinates information; it explicitly disclaims clinical compatibility determinations, which must be executed by laboratory blood testing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
