import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestStatus, ActivityLog } from '../../types';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Users, 
  Phone, 
  Calendar, 
  Heart, 
  ShieldAlert, 
  X, 
  Check, 
  PlusCircle, 
  ArrowLeft,
  Mail
} from 'lucide-react';
import { sendEmergencyAlert } from '../../services/emailService';

export const RequestTracker: React.FC = () => {
  const { 
    requests, 
    activeRequestId, 
    setActiveRequestId, 
    startNewBloodRequest, 
    simulateHospitalConfirmation, 
    simulateDonorResponse, 
    notifications, 
    donors, 
    cancelRequest, 
    setIsEmailLogModalOpen,
    t 
  } = useApp();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [emailAlertSending, setEmailAlertSending] = useState(false);
  const [emailSuccessNote, setEmailSuccessNote] = useState<string | null>(null);

  // Target request to view
  const currentRequest = requests.find((r) => r.id === activeRequestId) || requests[0];

  if (!currentRequest) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <Activity className="w-12 h-12 mx-auto text-slate-300" />
          <h2 className="text-xl font-bold text-slate-900">No Emergency Requests Found</h2>
          <p className="text-xs text-slate-500">
            You haven't submitted or tracked any blood coordination requests yet.
          </p>
          <button
            onClick={startNewBloodRequest}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            {t('findBloodNow')}
          </button>
        </div>
      </div>
    );
  }

  // Get notifications linked to this request
  const linkedNotifications = notifications.filter((n) => n.requestId === currentRequest.id);

  const getStatusDisplay = (status: RequestStatus) => {
    switch (status) {
      case 'searching':
        return {
          label: 'Outreach Active (Searching)',
          className: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'awaiting_confirmation':
        return {
          label: 'Awaiting Transfusion Desk Confirmation',
          className: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'confirmed':
      case 'partially_fulfilled':
        return {
          label: status === 'confirmed' ? 'Reserve Confirmed' : `Partially Fulfilled (${currentRequest.unitsFulfilled}/${currentRequest.unitsRequested})`,
          className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      case 'fulfilled':
        return {
          label: 'Transfusion Requisition Fulfilled',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'cancelled':
        return {
          label: 'Request Cancelled',
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
      default:
        return {
          label: status,
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusInfo = getStatusDisplay(currentRequest.status);

  const handleConfirmCancel = () => {
    cancelRequest(currentRequest.id, cancelReason);
    setCancelModalOpen(false);
    setCancelReason('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Header & Request Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-500">
                {currentRequest.id}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                Created {new Date(currentRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Coordination Tracker
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Request Dropdown if multiple */}
            {requests.length > 1 && (
              <select
                value={currentRequest.id}
                onChange={(e) => setActiveRequestId(e.target.value)}
                className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} ({r.bloodGroup} - {r.status})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={startNewBloodRequest}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              New Request
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${statusInfo.className}`}>
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                  <span>{statusInfo.label}</span>
                </span>

                {currentRequest.urgency === 'immediate' && (
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                    Immediate Priority
                  </span>
                )}
              </div>

              <div className="text-2xl font-black text-slate-900 font-mono">
                {currentRequest.unitsFulfilled} of {currentRequest.unitsRequested} Unit(s) Fulfilled
              </div>
            </div>

            {/* Cancel Action */}
            {currentRequest.status !== 'fulfilled' && currentRequest.status !== 'cancelled' && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
              >
                Cancel Request
              </button>
            )}
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
              <span className="text-xl font-black font-mono text-rose-600 block">
                {currentRequest.bloodGroup}
              </span>
              <span className="text-slate-500 capitalize">
                {currentRequest.component.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Hospital Location</span>
              <span className="font-bold text-slate-900 block truncate">
                {currentRequest.hospitalName}
              </span>
              <span className="text-slate-500">
                {currentRequest.roomWard || 'Inpatient Service'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Coordinator</span>
              <span className="font-bold text-slate-900 block truncate">
                {currentRequest.requesterName}
              </span>
              <span className="text-slate-500">
                {currentRequest.requesterPhone}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Donors Notified</span>
              <span className="text-xl font-black font-mono text-slate-900 block">
                {currentRequest.notifiedDonorsCount}
              </span>
              <span className="text-slate-500">
                Consenting candidates
              </span>
            </div>
          </div>
        </div>

        {/* Live Simulation Controls Box (CTO Test Harness) */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Interactive Testing Harness (Simulate Real-World Responses)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Role Simulation Active
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Trigger simulated actions to observe live status progression and activity history logs.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => simulateHospitalConfirmation(currentRequest.id, 1)}
              disabled={currentRequest.status === 'fulfilled' || currentRequest.status === 'cancelled'}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simulate Hospital Unit Allocation (+1)</span>
            </button>

            <button
              onClick={async () => {
                setEmailAlertSending(true);
                setEmailSuccessNote(null);
                try {
                  await sendEmergencyAlert({
                    recipientEmail: 'oncall.transfusion@metrotrauma.org',
                    recipientName: 'On-Call Transfusion Desk',
                    bloodGroup: currentRequest.bloodGroup,
                    component: currentRequest.component,
                    unitsRequested: currentRequest.unitsRequested,
                    urgency: currentRequest.requiredBy,
                    hospitalName: currentRequest.hospitalName,
                    location: currentRequest.hospitalAddress,
                    requestId: currentRequest.id,
                    customMessage: currentRequest.donorMessage,
                  });
                  setEmailSuccessNote('Emergency Gmail alert dispatched to oncall.transfusion@metrotrauma.org!');
                  setTimeout(() => setEmailSuccessNote(null), 4000);
                } finally {
                  setEmailAlertSending(false);
                }
              }}
              disabled={emailAlertSending}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Mail className={`w-3.5 h-3.5 ${emailAlertSending ? 'animate-pulse' : ''}`} />
              <span>{emailAlertSending ? 'Sending...' : 'Dispatch Emergency Gmail Alert'}</span>
            </button>

            <button
              onClick={() => setIsEmailLogModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span>View Gmail Dispatch Logs</span>
            </button>

            {linkedNotifications.length > 0 && (
              <>
                <button
                  onClick={() => simulateDonorResponse(linkedNotifications[0].id, 'interested')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate Donor Accepted ("Interested")</span>
                </button>
                <button
                  onClick={() => simulateDonorResponse(linkedNotifications[0].id, 'unavailable')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span>Simulate Donor Unavailable</span>
                </button>
              </>
            )}
          </div>

          {emailSuccessNote && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{emailSuccessNote}</span>
            </div>
          )}
        </div>

        {/* Two-Column Grid: Donor Outreach Roster + Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Donor Outreach Roster (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-600" />
                <span>Donor Outreach Roster</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {linkedNotifications.length} alerts
              </span>
            </div>

            {linkedNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No matching donors registered within radius at time of submission.
              </p>
            ) : (
              <div className="space-y-2.5">
                {linkedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {notif.donorName}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {notif.bloodGroup}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Response Status:
                      </span>
                      {notif.responseStatus === 'interested' ? (
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Interested in Donating
                        </span>
                      ) : notif.responseStatus === 'unavailable' ? (
                        <span className="font-semibold text-slate-500">
                          Unavailable
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          No response yet
                        </span>
                      )}
                    </div>

                    {notif.responseNote && (
                      <p className="text-[10px] text-slate-600 italic pt-1 border-t border-slate-100">
                        "{notif.responseNote}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Coordination Activity Log</span>
            </h3>

            <div className="space-y-4">
              {currentRequest.activityLogs.map((log, idx) => (
                <div key={log.id || idx} className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-0 last:pb-0">
                  {/* Dot */}
                  <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-rose-600" />

                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-bold text-slate-900">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-rose-700 block mb-0.5">
                    By {log.actor} ({log.actorRole.replace('_', ' ')})
                  </span>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Request Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Cancel Emergency Request?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              This will update the active tracking state and notify any responding donors that the need has been resolved.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for cancellation
              </label>
              <input
                type="text"
                placeholder="e.g. Units arranged via central hospital reserve"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
