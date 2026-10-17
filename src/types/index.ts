export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'UNKNOWN';

export type BloodComponent = 'whole_blood' | 'prbc' | 'platelets' | 'plasma' | 'cryo';

export type UrgencyLevel = 'immediate' | 'within_2_hours' | 'today' | 'scheduled';

export type ConditionCategory = 'accident' | 'surgery' | 'childbirth' | 'medical' | 'critical' | 'other';

export type FacilityType = 'hospital_blood_bank' | 'regional_center' | 'voluntary_bank';

export type InventoryStatus = 
  | 'confirmed' 
  | 'pending' 
  | 'outdated' 
  | 'unavailable' 
  | 'unknown';

export type RequestStatus = 
  | 'searching' 
  | 'awaiting_confirmation' 
  | 'confirmed' 
  | 'partially_fulfilled' 
  | 'fulfilled' 
  | 'unavailable' 
  | 'cancelled' 
  | 'expired';

export type UserRole = 'requester' | 'donor' | 'hospital_staff' | 'blood_bank_staff' | 'admin';

export type ContactMethod = 'phone' | 'sms' | 'whatsapp' | 'in_app';

export interface InventoryItem {
  quantity: number;
  status: InventoryStatus;
  lastUpdated: string; // ISO date string
  verifiedBy?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  emergencyHotline: string;
  isVerified: boolean;
  verifiedAt?: string;
  distanceKm?: number;
  inventory: Record<BloodGroup, Partial<Record<BloodComponent, InventoryItem>>>;
}

export interface DonorProfile {
  id: string;
  displayName: string;
  bloodGroup: BloodGroup;
  city: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  email: string;
  preferredContact: ContactMethod;
  isAvailable: boolean;
  lastDonationDate?: string;
  consentGiven: boolean;
  consentedAt: string;
  radiusKm: number;
  isVerified: boolean;
  totalDonationsCount: number;
}

export interface DonorNotification {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  hospitalName: string;
  units: number;
  status: 'queued' | 'delivered' | 'read';
  responseStatus: 'none' | 'interested' | 'unavailable' | 'needs_info';
  responseNote?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface ActivityLog {
  id: string;
  requestId: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole | 'system';
  action: string;
  details: string;
}

export interface BloodRequest {
  id: string;
  requesterUid: string;
  requesterName: string;
  requesterPhone: string;
  preferredContact: ContactMethod;
  patientName?: string;
  patientAge?: number;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsRequested: number;
  unitsFulfilled: number;
  hospitalId?: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalLat: number;
  hospitalLng: number;
  isHospitalManual: boolean;
  roomWard?: string;
  requiredBy: string; // ISO string or relative e.g. "Within 2 hours"
  urgency: UrgencyLevel;
  conditionCategory: ConditionCategory;
  conditionNote?: string;
  donorMessage: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  notifiedDonorsCount: number;
  matchedDonorIds: string[];
  activityLogs: ActivityLog[];
}

export interface BloodCamp {
  id: string;
  title: string;
  organizer: string;
  address: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  targetUnits: number;
  registeredDonorsCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  contactPhone: string;
  latitude: number;
  longitude: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  facilityId?: string;
  donorId?: string;
}
