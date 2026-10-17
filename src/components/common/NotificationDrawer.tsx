import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  HelpCircle 
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    simulateDonorResponse, 
    setActiveRequestId, 
    setCurrentView 
  } = useApp();

  if (!isOpen) return null;

  const handleOpenRequest = (requestId: string) => {
    setActiveRequestId(requestId);
    setCurrentView('tracker');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside 
          aria-label="Notifications Panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200"
        >
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-500">Live emergency request alerts & donor outreach</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close notifications panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs max-w-xs mx-auto">
                  Emergency notifications and donor responses will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = notif.status !== 'read';

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all text-sm ${
                      isUnread
                        ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {notif.requestId}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="font-semibold text-rose-700 text-xs">
                          {notif.bloodGroup} {notif.component.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mb-2">
                      Request for <span className="font-bold">{notif.units} unit(s)</span> at{' '}
                      <span className="font-medium text-slate-900">{notif.hospitalName}</span>.
                    </p>

                    {/* Donor Response State */}
                    {notif.responseStatus === 'none' ? (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] text-slate-500 font-medium block">
                          Donor Outreach Action ({notif.donorName}):
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => simulateDonorResponse(notif.id, 'interested')}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Interested</span>
                          </button>
                          <button
                            onClick={() => simulateDonorResponse(notif.id, 'unavailable')}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            Unavailable
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          {notif.responseStatus === 'interested' ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Donor Accepted to Coordinate
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Donor Unavailable
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleOpenRequest(notif.requestId)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                        >
                          <span>Track</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isUnread && (
                      <div className="mt-2 text-right">
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            <p>
              Notifications reflect in-app and simulated SMS alerts to registered consenting donors.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
