import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BloodRequest,
  Facility,
  DonorProfile,
  BloodCamp,
  DonorNotification,
  UserRole,
  BloodGroup,
  BloodComponent,
  UrgencyLevel,
  ConditionCategory,
  ContactMethod,
  InventoryStatus,
  ActivityLog,
} from '../types';
import {
  INITIAL_FACILITIES,
  INITIAL_DONORS,
  INITIAL_CAMPS,
  INITIAL_REQUESTS,
} from '../data/mockData';
import { Language, TRANSLATIONS } from '../data/translations';

export type AppView =
  | 'home'
  | 'find-blood'
  | 'facilities'
  | 'camps'
  | 'donor-hub'
  | 'tracker'
  | 'facility-portal'
  | 'admin-portal';

export interface WizardDraft {
  step: number;
  bloodGroup: BloodGroup | '';
  component: BloodComponent;
  unitsRequested: number;
  selectedHospitalId: string;
  isHospitalManual: boolean;
  manualHospitalName: string;
  manualHospitalAddress: string;
  manualHospitalCity: string;
  manualHospitalLat: number;
  manualHospitalLng: number;
  roomWard: string;
  requiredByTime: string;
  urgency: UrgencyLevel;
  searchRadiusKm: 25 | 50 | 100;
  patientName: string;
  patientAge: string;
  requesterName: string;
  requesterPhone: string;
  preferredContact: ContactMethod;
  conditionCategory: ConditionCategory;
  conditionNote: string;
  donorMessage: string;
}

const DEFAULT_WIZARD_DRAFT: WizardDraft = {
  step: 1,
  bloodGroup: '',
  component: 'whole_blood',
  unitsRequested: 2,
  selectedHospitalId: 'fac-metro-trauma',
  isHospitalManual: false,
  manualHospitalName: '',
  manualHospitalAddress: '',
  manualHospitalCity: '',
  manualHospitalLat: 37.7749,
  manualHospitalLng: -122.4194,
  roomWard: '',
  requiredByTime: 'Within 2 hours',
  urgency: 'immediate',
  searchRadiusKm: 25,
  patientName: '',
  patientAge: '',
  requesterName: '',
  requesterPhone: '',
  preferredContact: 'phone',
  conditionCategory: 'medical',
  conditionNote: '',
  donorMessage: '',
};

interface AppContextType {
  // Navigation & View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Auth / Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUserId: string;

  // Wizard state
  wizardDraft: WizardDraft;
  updateWizardDraft: (updates: Partial<WizardDraft>) => void;
  resetWizardDraft: () => void;
  startNewBloodRequest: () => void;

  // Data collections
  requests: BloodRequest[];
  facilities: Facility[];
  donors: DonorProfile[];
  camps: BloodCamp[];
  notifications: DonorNotification[];
  activeRequestId: string | null;
  setActiveRequestId: (id: string | null) => void;

  // Operations
  submitBloodRequest: () => Promise<BloodRequest>;
  cancelRequest: (requestId: string, reason?: string) => void;
  simulateDonorResponse: (
    notificationId: string,
    response: 'interested' | 'unavailable' | 'needs_info',
    note?: string
  ) => void;
  simulateHospitalConfirmation: (requestId: string, units: number) => void;
  registerDonor: (donorData: Omit<DonorProfile, 'id' | 'isVerified' | 'totalDonationsCount' | 'consentedAt'>) => void;
  toggleDonorAvailability: (donorId: string, isAvailable: boolean) => void;
  updateFacilityInventory: (
    facilityId: string,
    bloodGroup: BloodGroup,
    component: BloodComponent,
    quantity: number,
    status: InventoryStatus
  ) => void;
  verifyFacility: (facilityId: string) => void;
  pledgeCampRSVP: (campId: string) => void;

  // Notification management
  markNotificationRead: (notificationId: string) => void;
  unreadNotificationsCount: number;

  // System readiness modal
  isReadinessModalOpen: boolean;
  setIsReadinessModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  REQUESTS: 'lifelink_requests_v1',
  FACILITIES: 'lifelink_facilities_v1',
  DONORS: 'lifelink_donors_v1',
  CAMPS: 'lifelink_camps_v1',
  NOTIFICATIONS: 'lifelink_notifications_v1',
  WIZARD: 'lifelink_wizard_draft_v1',
  ROLE: 'lifelink_user_role_v1',
  LANG: 'lifelink_language_v1',
  ACTIVE_REQ: 'lifelink_active_req_id_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'en';
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'requester';
  });

  const [currentUserId] = useState<string>('user-primary-session');

  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);

  // Wizard state
  const [wizardDraft, setWizardDraft] = useState<WizardDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WIZARD);
      return saved ? JSON.parse(saved) : DEFAULT_WIZARD_DRAFT;
    } catch {
      return DEFAULT_WIZARD_DRAFT;
    }
  });

  // Collections
  const [requests, setRequests] = useState<BloodRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      return saved ? JSON.parse(saved) : INITIAL_FACILITIES;
    } catch {
      return INITIAL_FACILITIES;
    }
  });

  const [donors, setDonors] = useState<DonorProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DONORS);
      return saved ? JSON.parse(saved) : INITIAL_DONORS;
    } catch {
      return INITIAL_DONORS;
    }
  });

  const [camps, setCamps] = useState<BloodCamp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPS);
      return saved ? JSON.parse(saved) : INITIAL_CAMPS;
    } catch {
      return INITIAL_CAMPS;
    }
  });

  const [notifications, setNotifications] = useState<DonorNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
      // Seed initial notification corresponding to initial request
      return [
        {
          id: 'notif-init-1',
          requestId: 'REQ-2026-8941',
          donorId: 'donor-001',
          donorName: 'Alex M.',
          bloodGroup: 'O-',
          component: 'prbc',
          hospitalName: 'Metro City Trauma & Transfusion Center',
          units: 3,
          status: 'delivered',
          responseStatus: 'interested',
          responseNote: 'Ready to donate within 45 minutes.',
          createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
          respondedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        },
        {
          id: 'notif-init-2',
          requestId: 'REQ-2026-8941',
          donorId: 'donor-002',
          donorName: 'Sophia K.',
          bloodGroup: 'O-',
          component: 'prbc',
          hospitalName: 'Metro City Trauma & Transfusion Center',
          units: 3,
          status: 'delivered',
          responseStatus: 'none',
          createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  const [activeRequestId, setActiveRequestIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_REQ) || 'REQ-2026-8941';
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMPS, JSON.stringify(camps));
  }, [camps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WIZARD, JSON.stringify(wizardDraft));
  }, [wizardDraft]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  };

  const setActiveRequestId = (id: string | null) => {
    setActiveRequestIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_REQ, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_REQ);
    }
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  const updateWizardDraft = (updates: Partial<WizardDraft>) => {
    setWizardDraft((prev) => ({ ...prev, ...updates }));
  };

  const resetWizardDraft = () => {
    setWizardDraft(DEFAULT_WIZARD_DRAFT);
    localStorage.removeItem(STORAGE_KEYS.WIZARD);
  };

  const startNewBloodRequest = () => {
    resetWizardDraft();
    setCurrentView('find-blood');
  };

  // Submit Blood Request
  const submitBloodRequest = async (): Promise<BloodRequest> => {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `REQ-${new Date().getFullYear()}-${randomSuffix}`;

    // Resolve hospital details
    let hospitalName = 'Metro City Trauma & Transfusion Center';
    let hospitalAddress = '450 Healthcare Blvd, Metro Central';
    let hospitalLat = 37.7749;
    let hospitalLng = -122.4194;
    let hospitalId: string | undefined = undefined;

    if (wizardDraft.isHospitalManual) {
      hospitalName = wizardDraft.manualHospitalName.trim() || 'Manual Hospital Entry';
      hospitalAddress = `${wizardDraft.manualHospitalAddress.trim()}, ${wizardDraft.manualHospitalCity.trim()}`;
      hospitalLat = wizardDraft.manualHospitalLat || 37.7749;
      hospitalLng = wizardDraft.manualHospitalLng || -122.4194;
    } else {
      const foundFacility = facilities.find((f) => f.id === wizardDraft.selectedHospitalId);
      if (foundFacility) {
        hospitalId = foundFacility.id;
        hospitalName = foundFacility.name;
        hospitalAddress = foundFacility.address;
        hospitalLat = foundFacility.latitude;
        hospitalLng = foundFacility.longitude;
      }
    }

    // Match eligible consented donors within radius
    const matchingDonors = donors.filter((donor) => {
      if (!donor.isAvailable || !donor.consentGiven) return false;
      // Exact or compatible blood group check
      if (wizardDraft.bloodGroup && donor.bloodGroup !== wizardDraft.bloodGroup && donor.bloodGroup !== 'O-') {
        return false;
      }
      return true;
    });

    const matchedDonorIds = matchingDonors.map((d) => d.id);

    const initialLogs: ActivityLog[] = [
      {
        id: `log-${Date.now()}-1`,
        requestId: newId,
        timestamp,
        actor: wizardDraft.requesterName.trim() || 'Requester',
        actorRole: 'requester',
        action: 'Emergency Request Created',
        details: `Requested ${wizardDraft.unitsRequested} units of ${wizardDraft.bloodGroup} (${wizardDraft.component.replace('_', ' ')}) at ${hospitalName}.`,
      },
      {
        id: `log-${Date.now()}-2`,
        requestId: newId,
        timestamp,
        actor: 'LifeLink AI System',
        actorRole: 'system',
        action: 'Donor Notification Batch Queued',
        details: `Identified ${matchingDonors.length} eligible, consenting registered donors within range. Notifications prepared.`,
      },
    ];

    const newRequest: BloodRequest = {
      id: newId,
      requesterUid: currentUserId,
      requesterName: wizardDraft.requesterName.trim() || 'Anonymous Requester',
      requesterPhone: wizardDraft.requesterPhone.trim() || 'Not specified',
      preferredContact: wizardDraft.preferredContact,
      patientName: wizardDraft.patientName.trim() || undefined,
      patientAge: wizardDraft.patientAge ? parseInt(wizardDraft.patientAge, 10) : undefined,
      bloodGroup: (wizardDraft.bloodGroup as BloodGroup) || 'O+',
      component: wizardDraft.component,
      unitsRequested: wizardDraft.unitsRequested,
      unitsFulfilled: 0,
      hospitalId,
      hospitalName,
      hospitalAddress,
      hospitalLat,
      hospitalLng,
      isHospitalManual: wizardDraft.isHospitalManual,
      roomWard: wizardDraft.roomWard.trim() || undefined,
      requiredBy: wizardDraft.requiredByTime,
      urgency: wizardDraft.urgency,
      conditionCategory: wizardDraft.conditionCategory,
      conditionNote: wizardDraft.conditionNote.trim() || undefined,
      donorMessage: wizardDraft.donorMessage.trim(),
      status: 'searching',
      createdAt: timestamp,
      updatedAt: timestamp,
      notifiedDonorsCount: matchingDonors.length,
      matchedDonorIds,
      activityLogs: initialLogs,
    };

    // Create notifications for matched donors
    const newNotifications: DonorNotification[] = matchingDonors.map((donor, idx) => ({
      id: `notif-${Date.now()}-${idx}`,
      requestId: newId,
      donorId: donor.id,
      donorName: donor.displayName,
      bloodGroup: newRequest.bloodGroup,
      component: newRequest.component,
      hospitalName: newRequest.hospitalName,
      units: newRequest.unitsRequested,
      status: 'delivered',
      responseStatus: 'none',
      createdAt: timestamp,
    }));

    setRequests((prev) => [newRequest, ...prev]);
    setNotifications((prev) => [...newNotifications, ...prev]);
    setActiveRequestId(newId);
    resetWizardDraft();
    setCurrentView('tracker');

    return newRequest;
  };

  const cancelRequest = (requestId: string, reason?: string) => {
    const timestamp = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          requestId,
          timestamp,
          actor: 'Requester',
          actorRole: 'requester',
          action: 'Request Cancelled',
          details: reason || 'Request was cancelled by the requester.',
        };
        return {
          ...r,
          status: 'cancelled',
          updatedAt: timestamp,
          activityLogs: [newLog, ...r.activityLogs],
        };
      })
    );
  };

  const simulateDonorResponse = (
    notificationId: string,
    response: 'interested' | 'unavailable' | 'needs_info',
    note?: string
  ) => {
    const timestamp = new Date().toISOString();
    let targetRequestId = '';
    let donorName = '';

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id !== notificationId) return n;
        targetRequestId = n.requestId;
        donorName = n.donorName;
        return {
          ...n,
          responseStatus: response,
          responseNote: note || (response === 'interested' ? 'Ready to coordinate donation.' : 'Currently unavailable to donate.'),
          respondedAt: timestamp,
        };
      })
    );

    if (targetRequestId) {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== targetRequestId) return r;
          const statusText =
            response === 'interested'
              ? 'Interested in coordinating donation'
              : response === 'unavailable'
              ? 'Unavailable to donate at this time'
              : 'Requested more information';

          const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            requestId: targetRequestId,
            timestamp,
            actor: donorName || 'Registered Donor',
            actorRole: 'donor',
            action: `Donor Response: ${response.toUpperCase()}`,
            details: `${statusText}${note ? `: "${note}"` : ''}`,
          };

          const newStatus = response === 'interested' && r.status === 'searching' ? 'awaiting_confirmation' : r.status;

          return {
            ...r,
            status: newStatus,
            updatedAt: timestamp,
            activityLogs: [newLog, ...r.activityLogs],
          };
        })
      );
    }
  };

  const simulateHospitalConfirmation = (requestId: string, units: number) => {
    const timestamp = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const totalFulfilled = Math.min(r.unitsRequested, r.unitsFulfilled + units);
        const newStatus = totalFulfilled >= r.unitsRequested ? 'fulfilled' : 'partially_fulfilled';

        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          requestId,
          timestamp,
          actor: 'Transfusion Desk / Blood Bank',
          actorRole: 'hospital_staff',
          action: 'Units Reserved & Confirmed',
          details: `Allocated ${units} unit(s). Total fulfilled: ${totalFulfilled}/${r.unitsRequested} units.`,
        };

        return {
          ...r,
          unitsFulfilled: totalFulfilled,
          status: newStatus,
          updatedAt: timestamp,
          activityLogs: [newLog, ...r.activityLogs],
        };
      })
    );
  };

  const registerDonor = (
    donorData: Omit<DonorProfile, 'id' | 'isVerified' | 'totalDonationsCount' | 'consentedAt'>
  ) => {
    const newDonor: DonorProfile = {
      ...donorData,
      id: `donor-${Date.now()}`,
      isVerified: true,
      totalDonationsCount: 0,
      consentedAt: new Date().toISOString(),
    };
    setDonors((prev) => [newDonor, ...prev]);
  };

  const toggleDonorAvailability = (donorId: string, isAvailable: boolean) => {
    setDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, isAvailable } : d))
    );
  };

  const updateFacilityInventory = (
    facilityId: string,
    bloodGroup: BloodGroup,
    component: BloodComponent,
    quantity: number,
    status: InventoryStatus
  ) => {
    const timestamp = new Date().toISOString();
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id !== facilityId) return f;
        const groupInv = f.inventory[bloodGroup] || {};
        return {
          ...f,
          lastInventoryUpdate: timestamp,
          inventory: {
            ...f.inventory,
            [bloodGroup]: {
              ...groupInv,
              [component]: {
                quantity,
                status,
                lastUpdated: timestamp,
                verifiedBy: 'Staff Member (Session)',
              },
            },
          },
        };
      })
    );
  };

  const verifyFacility = (facilityId: string) => {
    const timestamp = new Date().toISOString();
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, isVerified: true, verifiedAt: timestamp } : f))
    );
  };

  const pledgeCampRSVP = (campId: string) => {
    setCamps((prev) =>
      prev.map((c) =>
        c.id === campId ? { ...c, registeredDonorsCount: c.registeredDonorsCount + 1 } : c
      )
    );
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, status: 'read' } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => n.status !== 'read').length;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        language,
        setLanguage,
        t,
        currentRole,
        setCurrentRole,
        currentUserId,
        wizardDraft,
        updateWizardDraft,
        resetWizardDraft,
        startNewBloodRequest,
        requests,
        facilities,
        donors,
        camps,
        notifications,
        activeRequestId,
        setActiveRequestId,
        submitBloodRequest,
        cancelRequest,
        simulateDonorResponse,
        simulateHospitalConfirmation,
        registerDonor,
        toggleDonorAvailability,
        updateFacilityInventory,
        verifyFacility,
        pledgeCampRSVP,
        markNotificationRead,
        unreadNotificationsCount,
        isReadinessModalOpen,
        setIsReadinessModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
