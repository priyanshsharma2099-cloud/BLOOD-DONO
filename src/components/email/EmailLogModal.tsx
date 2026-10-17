import React, { useState, useEffect } from 'react';
import { 
  EmailLogEntry, 
  getEmailLogs, 
  sendEmergencyAlert, 
  clearEmailLogs, 
  deleteEmailLog,
  EmergencyEmailPayload 
} from '../../services/emailService';
import { 
  googleSignIn, 
  logoutGoogle, 
  auth, 
  hasActiveAccessToken 
} from '../../services/authService';
import { User } from 'firebase/auth';
import { 
  Mail, 
  Send, 
  X, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';

interface EmailLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_USER_EMAIL = 'priyansh.sharma2099@gmail.com';

export const EmailLogModal: React.FC<EmailLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  
  // Active email preview
  const [previewLog, setPreviewLog] = useState<EmailLogEntry | null>(null);

  // Test send dialog state
  const [isTestSendOpen, setIsTestSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form fields for test send
  const [testRecipientName, setTestRecipientName] = useState('Priyansh Sharma');
  const [testRecipientEmail, setTestRecipientEmail] = useState(DEFAULT_USER_EMAIL);
  const [testBloodGroup, setTestBloodGroup] = useState('O-');
  const [testUrgency, setTestUrgency] = useState('Immediate (< 1 hr)');
  const [testHospital, setTestHospital] = useState('Metro City Trauma & Transfusion Center');
  const [testLocation, setTestLocation] = useState('450 Healthcare Blvd, Metro Central');

  // Google OAuth User and Token State
  const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
  const [hasToken, setHasToken] = useState<boolean>(hasActiveAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLogs(getEmailLogs());
      setGoogleUser(auth.currentUser);
      setHasToken(hasActiveAccessToken());
    }
  }, [isOpen]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setHasToken(true);
        showToast(`Connected as ${res.user.email}! Real emails will now be delivered via Gmail.`);
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      const msg = err?.message || 'Sign in was cancelled or popup was blocked.';
      setAuthError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setHasToken(false);
    showToast('Signed out of Google. Switched to sandbox simulation mode.', 'info');
  };

  const handleSendToUserEmail = async () => {
    setIsSending(true);
    try {
      const payload: EmergencyEmailPayload = {
        recipientName: 'Priyansh Sharma',
        recipientEmail: DEFAULT_USER_EMAIL,
        bloodGroup: 'O-',
        component: 'Packed Red Blood Cells (PRBC)',
        unitsRequested: 2,
        urgency: 'Immediate (< 1 hr)',
        hospitalName: 'Metro City Trauma & Transfusion Center',
        location: '450 Healthcare Blvd, Metro Central',
        requestId: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customMessage: 'Emergency trauma resuscitation in ICU Bed 4. Urgent call for O- registered donor candidate.',
      };

      const result = await sendEmergencyAlert(payload);
      setLogs(getEmailLogs());

      if (result.success) {
        if (result.log.deliveryMode === 'real_gmail') {
          showToast(`Real email successfully dispatched to ${DEFAULT_USER_EMAIL} via your Gmail account! Check your inbox.`);
        } else {
          showToast(`Test alert simulated for ${DEFAULT_USER_EMAIL}. Sign in with Google above to send a real email!`, 'info');
        }
      } else {
        showToast(`Gmail API Error: ${result.error || 'Failed to send.'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Dispatch failed'}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const payload: EmergencyEmailPayload = {
        recipientName: testRecipientName.trim() || 'Emergency Coordinator',
        recipientEmail: testRecipientEmail.trim() || DEFAULT_USER_EMAIL,
        bloodGroup: testBloodGroup,
        component: 'Packed Red Blood Cells (PRBC)',
        unitsRequested: 3,
        urgency: testUrgency,
        hospitalName: testHospital,
        location: testLocation,
        requestId: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        customMessage: 'Emergency surgical blood requisition. Immediate cross-match requested.',
      };

      const result = await sendEmergencyAlert(payload);
      setLogs(getEmailLogs());
      setIsTestSendOpen(false);

      if (result.success) {
        if (result.log.deliveryMode === 'real_gmail') {
          showToast(`Email delivered to ${payload.recipientEmail} via Live Gmail API!`);
        } else {
          showToast(`Alert simulated for ${payload.recipientEmail}. Connect Gmail to deliver to real inboxes.`, 'info');
        }
      } else {
        showToast(`Gmail API Error: ${result.error || 'Check permissions.'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Send error: ${err?.message || 'Network issue'}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear all stored email dispatch logs?')) {
      clearEmailLogs();
      setLogs([]);
      showToast('All email dispatch logs cleared.');
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEmailLog(id);
    setLogs(getEmailLogs());
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchQuery =
      log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchGroup = selectedGroupFilter === 'ALL' || log.bloodGroup === selectedGroupFilter;

    return matchQuery && matchGroup;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-log-title"
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="email-log-title" className="text-lg font-bold text-slate-900 tracking-tight">
                  Automated Gmail & Emergency Email System
                </h2>
                {hasToken ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono border border-emerald-300">
                    Live Gmail Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono border border-slate-300">
                    Simulation Mode Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatch automated alerts to registered donors and hospital blood banks during trauma emergencies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick 1-click test button to the user's email */}
            <button
              onClick={handleSendToUserEmail}
              disabled={isSending}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              title={`Send emergency test email to ${DEFAULT_USER_EMAIL}`}
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
              <span>{isSending ? 'Sending...' : 'Test Send to My Email'}</span>
            </button>

            <button
              onClick={() => setIsTestSendOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              + Custom Alert
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Google Workspace Account Connection Banner */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-4 h-4 shrink-0 ${hasToken ? 'text-emerald-600' : 'text-slate-400'}`} />
              {hasToken && googleUser ? (
                <div className="text-slate-700">
                  <span>Connected to Google as <strong className="text-slate-900">{googleUser.email}</strong>. Real emails will be sent from your Gmail account.</span>
                </div>
              ) : (
                <div className="text-slate-600">
                  <span>Want real emails sent to your actual Gmail inbox? Connect your Google account below with 1 click.</span>
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {hasToken && googleUser ? (
                <button
                  onClick={handleGoogleSignOut}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 font-semibold rounded hover:bg-rose-50 transition-colors"
                >
                  Disconnect Account
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {authError && (
            <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{authError} If popup was blocked, allow popups for this site.</span>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by recipient, hospital, or request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Blood Groups</option>
              {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((grp) => (
                <option key={grp} value={grp}>
                  Group {grp}
                </option>
              ))}
            </select>

            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white border border-slate-200 transition-colors"
                title="Clear logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toast Notification Alert */}
        {toast && (
          <div className={`mx-4 sm:mx-6 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150 ${
            toast.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : toast.type === 'info'
              ? 'bg-sky-50 border border-sky-200 text-sky-900'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-2">
              ✕
            </button>
          </div>
        )}

        {/* Email Logs List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Mail className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">No email dispatch logs found</p>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Trigger a test alert using the buttons above or submit an emergency request in the Find Blood wizard.
              </p>
              <button
                onClick={handleSendToUserEmail}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Emergency Test to {DEFAULT_USER_EMAIL}</span>
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isLive = log.deliveryMode === 'real_gmail' && log.status !== 'Failed (Gmail API Error)';
              const isFailed = log.status === 'Failed (Gmail API Error)';

              return (
                <div
                  key={log.id}
                  onClick={() => setPreviewLog(log)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs group ${
                    isFailed
                      ? 'border-rose-200 bg-rose-50/30 hover:bg-rose-50/60'
                      : isLive
                      ? 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isFailed ? 'bg-rose-600' : isLive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                      <span className="font-bold text-sm text-slate-900">
                        {log.recipientName}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">({log.recipientEmail})</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Live Gmail Sent</span>
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Gmail API Error</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Delivered (Simulation)</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                      <span className="font-mono font-bold text-rose-600">
                        {log.bloodGroup} ({log.component})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hospital</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {log.hospitalName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Urgency</span>
                      <span className="font-semibold text-amber-700">
                        {log.urgency}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewLog(log);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Body</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(log.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {log.errorDetail && (
                    <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded">
                      <strong>Error Details:</strong> {log.errorDetail}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Status */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums font-bold text-slate-700">
              {logs.length} Total Alerts Logged
            </span>
            <span>·</span>
            <span>Persisted in browser localStorage</span>
          </div>

          <span className="text-[11px] text-slate-400">
            Emergency cross-matching verified directly by blood centers.
          </span>
        </div>
      </div>

      {/* Modal: Custom Test Send */}
      {isTestSendOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Broadcast Emergency Email Alert
                </h3>
              </div>
              <button
                onClick={() => setIsTestSendOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTestSend} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Recipient Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={testRecipientName}
                    onChange={(e) => setTestRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Recipient Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={testRecipientEmail}
                    onChange={(e) => setTestRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Blood Group
                  </label>
                  <select
                    value={testBloodGroup}
                    onChange={(e) => setTestBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={testUrgency}
                    onChange={(e) => setTestUrgency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                  >
                    <option value="Immediate (< 1 hr)">Immediate (&lt; 1 hr)</option>
                    <option value="Within 2 hours">Within 2 hours</option>
                    <option value="Today (Within 6 hrs)">Today (Within 6 hrs)</option>
                    <option value="Scheduled Surgery">Scheduled Surgery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={testHospital}
                  onChange={(e) => setTestHospital(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Facility Address / City
                </label>
                <input
                  type="text"
                  value={testLocation}
                  onChange={(e) => setTestLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestSendOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Dispatching...' : 'Dispatch Emergency Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full HTML Email Preview */}
      {previewLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-xs text-slate-900">
                  Email Preview · Message ID: <code className="font-mono text-[11px] text-slate-600">{previewLog.messageId}</code>
                </span>
              </div>
              <button
                onClick={() => setPreviewLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs space-y-1 text-slate-600">
              <div><strong>To:</strong> {previewLog.recipientName} &lt;{previewLog.recipientEmail}&gt;</div>
              <div><strong>Subject:</strong> {previewLog.subject}</div>
              <div><strong>Sent:</strong> {new Date(previewLog.timestamp).toLocaleString()} ({previewLog.status})</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div 
                className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: previewLog.htmlBody }}
              />
            </div>

            <div className="p-3 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setPreviewLog(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
