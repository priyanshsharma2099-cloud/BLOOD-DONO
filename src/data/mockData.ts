import { 
  Facility, 
  DonorProfile, 
  BloodCamp, 
  BloodRequest, 
  BloodGroup, 
  BloodComponent 
} from '../types';

// Helper: Calculate Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Initial seed timestamp anchors (relative to current simulation time)
const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400 * 1000).toISOString();

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'fac-metro-trauma',
    name: 'Metro City Trauma & Transfusion Center',
    type: 'hospital_blood_bank',
    address: '450 Healthcare Blvd, Metro Central',
    city: 'Metro City',
    state: 'CA',
    postalCode: '90210',
    latitude: 37.7749,
    longitude: -122.4194,
    contactPhone: '+1 (555) 234-5678',
    emergencyHotline: '+1 (555) 911-2566',
    isVerified: true,
    verifiedAt: daysAgo(45),
    inventory: {
      'O+': {
        whole_blood: { quantity: 14, status: 'confirmed', lastUpdated: minsAgo(22), verifiedBy: 'Dr. Sarah Chen' },
        prbc: { quantity: 28, status: 'confirmed', lastUpdated: minsAgo(15), verifiedBy: 'Dr. Sarah Chen' },
        platelets: { quantity: 6, status: 'confirmed', lastUpdated: minsAgo(40), verifiedBy: 'Dr. Sarah Chen' },
        plasma: { quantity: 12, status: 'confirmed', lastUpdated: minsAgo(30), verifiedBy: 'Dr. Sarah Chen' },
      },
      'O-': {
        whole_blood: { quantity: 2, status: 'confirmed', lastUpdated: minsAgo(18), verifiedBy: 'Dr. Sarah Chen' },
        prbc: { quantity: 4, status: 'confirmed', lastUpdated: minsAgo(18), verifiedBy: 'Dr. Sarah Chen' },
        platelets: { quantity: 0, status: 'unavailable', lastUpdated: hoursAgo(1), verifiedBy: 'Dr. Sarah Chen' },
        plasma: { quantity: 5, status: 'confirmed', lastUpdated: minsAgo(45), verifiedBy: 'Dr. Sarah Chen' },
      },
      'A+': {
        whole_blood: { quantity: 18, status: 'confirmed', lastUpdated: minsAgo(35), verifiedBy: 'Dr. Sarah Chen' },
        prbc: { quantity: 22, status: 'confirmed', lastUpdated: minsAgo(35), verifiedBy: 'Dr. Sarah Chen' },
        platelets: { quantity: 8, status: 'confirmed', lastUpdated: minsAgo(35), verifiedBy: 'Dr. Sarah Chen' },
      },
      'A-': {
        whole_blood: { quantity: 3, status: 'pending', lastUpdated: hoursAgo(4) },
        prbc: { quantity: 5, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Nurse R. Miller' },
        platelets: { quantity: 1, status: 'pending', lastUpdated: hoursAgo(5) },
      },
      'B+': {
        whole_blood: { quantity: 15, status: 'confirmed', lastUpdated: minsAgo(50), verifiedBy: 'Dr. Sarah Chen' },
        prbc: { quantity: 20, status: 'confirmed', lastUpdated: minsAgo(50), verifiedBy: 'Dr. Sarah Chen' },
        plasma: { quantity: 9, status: 'confirmed', lastUpdated: minsAgo(50), verifiedBy: 'Dr. Sarah Chen' },
      },
      'B-': {
        whole_blood: { quantity: 1, status: 'outdated', lastUpdated: daysAgo(3) },
        prbc: { quantity: 2, status: 'pending', lastUpdated: hoursAgo(6) },
        platelets: { quantity: 0, status: 'unavailable', lastUpdated: hoursAgo(2) },
      },
      'AB+': {
        whole_blood: { quantity: 8, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Nurse R. Miller' },
        plasma: { quantity: 16, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Nurse R. Miller' },
      },
      'AB-': {
        whole_blood: { quantity: 1, status: 'pending', lastUpdated: hoursAgo(8) },
        prbc: { quantity: 2, status: 'outdated', lastUpdated: daysAgo(4) },
      },
      'UNKNOWN': {},
    },
  },
  {
    id: 'fac-red-cross-regional',
    name: 'Red Cross Regional Blood Services Center',
    type: 'regional_center',
    address: '1200 Pacific Ave, Financial District',
    city: 'Metro City',
    state: 'CA',
    postalCode: '90212',
    latitude: 37.795,
    longitude: -122.408,
    contactPhone: '+1 (555) 432-8800',
    emergencyHotline: '+1 (555) 432-8899',
    isVerified: true,
    verifiedAt: daysAgo(120),
    inventory: {
      'O+': {
        whole_blood: { quantity: 35, status: 'confirmed', lastUpdated: minsAgo(10), verifiedBy: 'James Evans, CLS' },
        prbc: { quantity: 42, status: 'confirmed', lastUpdated: minsAgo(10), verifiedBy: 'James Evans, CLS' },
        platelets: { quantity: 14, status: 'confirmed', lastUpdated: minsAgo(12), verifiedBy: 'James Evans, CLS' },
        plasma: { quantity: 25, status: 'confirmed', lastUpdated: minsAgo(10), verifiedBy: 'James Evans, CLS' },
      },
      'O-': {
        whole_blood: { quantity: 6, status: 'confirmed', lastUpdated: minsAgo(8), verifiedBy: 'James Evans, CLS' },
        prbc: { quantity: 9, status: 'confirmed', lastUpdated: minsAgo(8), verifiedBy: 'James Evans, CLS' },
        platelets: { quantity: 3, status: 'confirmed', lastUpdated: minsAgo(8), verifiedBy: 'James Evans, CLS' },
        plasma: { quantity: 8, status: 'confirmed', lastUpdated: minsAgo(8), verifiedBy: 'James Evans, CLS' },
      },
      'A+': {
        whole_blood: { quantity: 24, status: 'confirmed', lastUpdated: minsAgo(25), verifiedBy: 'James Evans, CLS' },
        prbc: { quantity: 30, status: 'confirmed', lastUpdated: minsAgo(25), verifiedBy: 'James Evans, CLS' },
      },
      'A-': {
        whole_blood: { quantity: 4, status: 'confirmed', lastUpdated: minsAgo(30), verifiedBy: 'James Evans, CLS' },
        prbc: { quantity: 7, status: 'confirmed', lastUpdated: minsAgo(30), verifiedBy: 'James Evans, CLS' },
      },
      'B+': {
        whole_blood: { quantity: 19, status: 'confirmed', lastUpdated: minsAgo(40), verifiedBy: 'James Evans, CLS' },
      },
      'B-': {
        whole_blood: { quantity: 2, status: 'confirmed', lastUpdated: hoursAgo(1), verifiedBy: 'James Evans, CLS' },
        platelets: { quantity: 1, status: 'pending', lastUpdated: hoursAgo(3) },
      },
      'AB+': {
        plasma: { quantity: 22, status: 'confirmed', lastUpdated: minsAgo(15), verifiedBy: 'James Evans, CLS' },
      },
      'AB-': {
        prbc: { quantity: 3, status: 'confirmed', lastUpdated: hoursAgo(1), verifiedBy: 'James Evans, CLS' },
      },
      'UNKNOWN': {},
    },
  },
  {
    id: 'fac-st-jude-memorial',
    name: 'St. Jude Memorial Hospital Blood Bank',
    type: 'hospital_blood_bank',
    address: '89 Mission Hills Rd, Mission District',
    city: 'Metro City',
    state: 'CA',
    postalCode: '90215',
    latitude: 37.759,
    longitude: -122.427,
    contactPhone: '+1 (555) 789-0123',
    emergencyHotline: '+1 (555) 789-0911',
    isVerified: true,
    verifiedAt: daysAgo(60),
    inventory: {
      'O+': {
        whole_blood: { quantity: 8, status: 'pending', lastUpdated: hoursAgo(5) },
        prbc: { quantity: 11, status: 'confirmed', lastUpdated: hoursAgo(1), verifiedBy: 'Dr. Anand Patel' },
      },
      'O-': {
        whole_blood: { quantity: 1, status: 'pending', lastUpdated: hoursAgo(3) },
        prbc: { quantity: 0, status: 'unavailable', lastUpdated: hoursAgo(1), verifiedBy: 'Dr. Anand Patel' },
      },
      'A+': {
        whole_blood: { quantity: 12, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Dr. Anand Patel' },
      },
      'A-': {
        whole_blood: { quantity: 0, status: 'unavailable', lastUpdated: hoursAgo(4) },
      },
      'B+': {
        whole_blood: { quantity: 7, status: 'outdated', lastUpdated: daysAgo(2) },
      },
      'B-': {
        whole_blood: { quantity: 0, status: 'unavailable', lastUpdated: hoursAgo(6) },
      },
      'AB+': {
        whole_blood: { quantity: 5, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Dr. Anand Patel' },
      },
      'AB-': {
        whole_blood: { quantity: 0, status: 'unavailable', lastUpdated: hoursAgo(12) },
      },
      'UNKNOWN': {},
    },
  },
  {
    id: 'fac-bay-community',
    name: 'Bay Area Voluntary Community Blood Center',
    type: 'voluntary_bank',
    address: '310 Sunset Blvd, West Bay',
    city: 'Metro City',
    state: 'CA',
    postalCode: '90222',
    latitude: 37.764,
    longitude: -122.476,
    contactPhone: '+1 (555) 654-3210',
    emergencyHotline: '+1 (555) 654-3299',
    isVerified: true,
    verifiedAt: daysAgo(90),
    inventory: {
      'O+': {
        whole_blood: { quantity: 12, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Elena Rostova' },
        platelets: { quantity: 4, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Elena Rostova' },
      },
      'O-': {
        whole_blood: { quantity: 3, status: 'outdated', lastUpdated: daysAgo(3) },
        prbc: { quantity: 1, status: 'pending', lastUpdated: hoursAgo(7) },
      },
      'A+': {
        whole_blood: { quantity: 14, status: 'confirmed', lastUpdated: hoursAgo(1), verifiedBy: 'Elena Rostova' },
      },
      'A-': {
        whole_blood: { quantity: 2, status: 'pending', lastUpdated: hoursAgo(5) },
      },
      'B+': {
        whole_blood: { quantity: 10, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Elena Rostova' },
      },
      'B-': {
        whole_blood: { quantity: 1, status: 'pending', lastUpdated: hoursAgo(4) },
      },
      'AB+': {
        plasma: { quantity: 8, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Elena Rostova' },
      },
      'AB-': {
        plasma: { quantity: 2, status: 'outdated', lastUpdated: daysAgo(2) },
      },
      'UNKNOWN': {},
    },
  },
  {
    id: 'fac-valley-general-unverified',
    name: 'Valley Care Urgent Infusion Clinic',
    type: 'hospital_blood_bank',
    address: '772 Northway Dr, Outer North Suburb',
    city: 'North Valley',
    state: 'CA',
    postalCode: '94501',
    latitude: 37.882,
    longitude: -122.285,
    contactPhone: '+1 (555) 888-4422',
    emergencyHotline: '+1 (555) 888-4499',
    isVerified: false, // Explicitly unverified facility for admin verification flow
    inventory: {
      'O+': {
        whole_blood: { quantity: 5, status: 'pending', lastUpdated: hoursAgo(12) },
      },
      'O-': {
        whole_blood: { quantity: 1, status: 'outdated', lastUpdated: daysAgo(5) },
      },
      'A+': {},
      'A-': {},
      'B+': {},
      'B-': {},
      'AB+': {},
      'AB-': {},
      'UNKNOWN': {},
    },
  },
  {
    id: 'fac-stanford-tri-valley',
    name: 'Tri-Valley Regional Blood & Platelet Bank',
    type: 'regional_center',
    address: '5500 Las Positas Rd, Tri-Valley East',
    city: 'Pleasanton',
    state: 'CA',
    postalCode: '94588',
    latitude: 37.662,
    longitude: -121.874,
    contactPhone: '+1 (555) 345-9000',
    emergencyHotline: '+1 (555) 345-9099',
    isVerified: true,
    verifiedAt: daysAgo(30),
    inventory: {
      'O+': {
        whole_blood: { quantity: 28, status: 'confirmed', lastUpdated: minsAgo(45), verifiedBy: 'Dr. Marcus Vance' },
        platelets: { quantity: 9, status: 'confirmed', lastUpdated: minsAgo(45), verifiedBy: 'Dr. Marcus Vance' },
      },
      'O-': {
        whole_blood: { quantity: 5, status: 'confirmed', lastUpdated: minsAgo(45), verifiedBy: 'Dr. Marcus Vance' },
        prbc: { quantity: 8, status: 'confirmed', lastUpdated: minsAgo(45), verifiedBy: 'Dr. Marcus Vance' },
        platelets: { quantity: 2, status: 'confirmed', lastUpdated: minsAgo(45), verifiedBy: 'Dr. Marcus Vance' },
      },
      'A+': {
        whole_blood: { quantity: 20, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Dr. Marcus Vance' },
      },
      'A-': {
        whole_blood: { quantity: 4, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Dr. Marcus Vance' },
      },
      'B+': {
        whole_blood: { quantity: 16, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Dr. Marcus Vance' },
      },
      'B-': {
        whole_blood: { quantity: 3, status: 'pending', lastUpdated: hoursAgo(5) },
      },
      'AB+': {
        plasma: { quantity: 15, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Dr. Marcus Vance' },
      },
      'AB-': {
        prbc: { quantity: 2, status: 'confirmed', lastUpdated: hoursAgo(2), verifiedBy: 'Dr. Marcus Vance' },
      },
      'UNKNOWN': {},
    },
  },
];

export const INITIAL_DONORS: DonorProfile[] = [
  {
    id: 'donor-001',
    displayName: 'Alex M.',
    bloodGroup: 'O-',
    city: 'Metro City (Downtown)',
    latitude: 37.778,
    longitude: -122.415,
    contactPhone: '+1 (555) ***-4819',
    email: 'alex.m@example.com',
    preferredContact: 'sms',
    isAvailable: true,
    lastDonationDate: daysAgo(95),
    consentGiven: true,
    consentedAt: daysAgo(95),
    radiusKm: 30,
    isVerified: true,
    totalDonationsCount: 8,
  },
  {
    id: 'donor-002',
    displayName: 'Sophia K.',
    bloodGroup: 'O-',
    city: 'Metro City (Mission)',
    latitude: 37.761,
    longitude: -122.421,
    contactPhone: '+1 (555) ***-9204',
    email: 'sophia.k@example.com',
    preferredContact: 'phone',
    isAvailable: true,
    lastDonationDate: daysAgo(110),
    consentGiven: true,
    consentedAt: daysAgo(110),
    radiusKm: 25,
    isVerified: true,
    totalDonationsCount: 12,
  },
  {
    id: 'donor-003',
    displayName: 'Carlos R.',
    bloodGroup: 'O+',
    city: 'Metro City (Sunset)',
    latitude: 37.755,
    longitude: -122.482,
    contactPhone: '+1 (555) ***-3199',
    email: 'carlos.r@example.com',
    preferredContact: 'whatsapp',
    isAvailable: true,
    lastDonationDate: daysAgo(85),
    consentGiven: true,
    consentedAt: daysAgo(85),
    radiusKm: 50,
    isVerified: true,
    totalDonationsCount: 4,
  },
  {
    id: 'donor-004',
    displayName: 'Priya N.',
    bloodGroup: 'A+',
    city: 'Metro City (Marina)',
    latitude: 37.802,
    longitude: -122.436,
    contactPhone: '+1 (555) ***-7128',
    email: 'priya.n@example.com',
    preferredContact: 'in_app',
    isAvailable: true,
    lastDonationDate: daysAgo(120),
    consentGiven: true,
    consentedAt: daysAgo(120),
    radiusKm: 40,
    isVerified: true,
    totalDonationsCount: 6,
  },
  {
    id: 'donor-005',
    displayName: 'David W.',
    bloodGroup: 'B-',
    city: 'East Bay Suburbs',
    latitude: 37.805,
    longitude: -122.271,
    contactPhone: '+1 (555) ***-8821',
    email: 'david.w@example.com',
    preferredContact: 'sms',
    isAvailable: true,
    lastDonationDate: daysAgo(90),
    consentGiven: true,
    consentedAt: daysAgo(90),
    radiusKm: 50,
    isVerified: true,
    totalDonationsCount: 15,
  },
  {
    id: 'donor-006',
    displayName: 'Elena T.',
    bloodGroup: 'AB-',
    city: 'Tri-Valley Area',
    latitude: 37.669,
    longitude: -121.888,
    contactPhone: '+1 (555) ***-1102',
    email: 'elena.t@example.com',
    preferredContact: 'phone',
    isAvailable: false, // Temporarily deferred/unavailable
    lastDonationDate: daysAgo(20),
    consentGiven: true,
    consentedAt: daysAgo(90),
    radiusKm: 30,
    isVerified: true,
    totalDonationsCount: 5,
  },
  {
    id: 'donor-007',
    displayName: 'Marcus L.',
    bloodGroup: 'O+',
    city: 'Metro City (Financial)',
    latitude: 37.791,
    longitude: -122.399,
    contactPhone: '+1 (555) ***-5534',
    email: 'marcus.l@example.com',
    preferredContact: 'sms',
    isAvailable: true,
    lastDonationDate: daysAgo(75),
    consentGiven: true,
    consentedAt: daysAgo(150),
    radiusKm: 35,
    isVerified: true,
    totalDonationsCount: 3,
  },
];

export const INITIAL_CAMPS: BloodCamp[] = [
  {
    id: 'camp-civic-center',
    title: 'Metro Civic Center Community Blood Drive',
    organizer: 'Red Cross & City Health Dept',
    address: '100 Larkin Street, Civic Center Plaza',
    city: 'Metro City',
    date: '2026-10-24',
    startTime: '09:00 AM',
    endTime: '04:00 PM',
    targetUnits: 150,
    registeredDonorsCount: 94,
    status: 'upcoming',
    contactPhone: '+1 (555) 432-8850',
    latitude: 37.779,
    longitude: -122.417,
  },
  {
    id: 'camp-university-quad',
    title: 'University Medical Campus Autumn Donation Drive',
    organizer: 'Student Healthcare Association',
    address: '505 Parnassus Ave, Medical Quadrangle',
    city: 'Metro City',
    date: '2026-10-28',
    startTime: '10:00 AM',
    endTime: '05:30 PM',
    targetUnits: 200,
    registeredDonorsCount: 142,
    status: 'upcoming',
    contactPhone: '+1 (555) 987-1234',
    latitude: 37.763,
    longitude: -122.458,
  },
  {
    id: 'camp-tech-park',
    title: 'Silicon Bay Innovation Park Corporate Drive',
    organizer: 'Bay Area Corporate LifeLink Coalition',
    address: '300 Technology Way, Building C',
    city: 'Metro City',
    date: '2026-11-05',
    startTime: '08:30 AM',
    endTime: '03:00 PM',
    targetUnits: 100,
    registeredDonorsCount: 68,
    status: 'upcoming',
    contactPhone: '+1 (555) 555-8910',
    latitude: 37.788,
    longitude: -122.395,
  },
];

export const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'REQ-2026-8941',
    requesterUid: 'user-req-demo',
    requesterName: 'Michael Chang',
    requesterPhone: '+1 (555) 902-3341',
    preferredContact: 'phone',
    patientName: 'Sarah C. (Family member)',
    patientAge: 34,
    bloodGroup: 'O-',
    component: 'prbc',
    unitsRequested: 3,
    unitsFulfilled: 1,
    hospitalId: 'fac-metro-trauma',
    hospitalName: 'Metro City Trauma & Transfusion Center',
    hospitalAddress: '450 Healthcare Blvd, Metro Central',
    hospitalLat: 37.7749,
    hospitalLng: -122.4194,
    isHospitalManual: false,
    roomWard: 'ICU Bed 4, East Wing',
    requiredBy: 'Within 2 hours',
    urgency: 'immediate',
    conditionCategory: 'accident',
    conditionNote: 'Emergency trauma surgery following road collision; ongoing critical transfusion need.',
    donorMessage: 'Urgent emergency request for O- Packed Red Blood Cells (3 units needed) at Metro City Trauma Center. If you are a consenting O- registered donor within 30 km, please respond to coordinate donation through the hospital transfusion service.',
    status: 'awaiting_confirmation',
    createdAt: hoursAgo(1),
    updatedAt: minsAgo(15),
    notifiedDonorsCount: 2,
    matchedDonorIds: ['donor-001', 'donor-002'],
    activityLogs: [
      {
        id: 'log-001',
        requestId: 'REQ-2026-8941',
        timestamp: hoursAgo(1),
        actor: 'Michael Chang',
        actorRole: 'requester',
        action: 'Request Created',
        details: 'Submitted emergency request for 3 units of O- PRBC at Metro City Trauma Center.',
      },
      {
        id: 'log-002',
        requestId: 'REQ-2026-8941',
        timestamp: minsAgo(45),
        actor: 'LifeLink AI System',
        actorRole: 'system',
        action: 'Donor Notifications Queued',
        details: 'Dispatched in-app and SMS notifications to 2 consenting registered O- donors within 30km.',
      },
      {
        id: 'log-003',
        requestId: 'REQ-2026-8941',
        timestamp: minsAgo(20),
        actor: 'Alex M.',
        actorRole: 'donor',
        action: 'Donor Responded: Interested',
        details: 'Donor indicated willingness to coordinate donation. Transfusion desk notified.',
      },
      {
        id: 'log-004',
        requestId: 'REQ-2026-8941',
        timestamp: minsAgo(15),
        actor: 'Dr. Sarah Chen',
        actorRole: 'hospital_staff',
        action: 'Hospital Reserve Allocated',
        details: '1 unit of O- PRBC reserved for cross-match from central stock; 2 units still required.',
      },
    ],
  },
];

// Clinical compatibility reference table (for educational / advisory display only)
// Note: Clinical compatibility decisions must always be confirmed by laboratory cross-matching
export const BLOOD_COMPATIBILITY_CHART: Record<
  BloodGroup,
  { canReceiveFrom: BloodGroup[]; canDonateTo: BloodGroup[]; isUniversalRBC?: boolean; isUniversalPlasma?: boolean }
> = {
  'O-': {
    canReceiveFrom: ['O-'],
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    isUniversalRBC: true,
  },
  'O+': {
    canReceiveFrom: ['O-', 'O+'],
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
  },
  'A-': {
    canReceiveFrom: ['O-', 'A-'],
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
  },
  'A+': {
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    canDonateTo: ['A+', 'AB+'],
  },
  'B-': {
    canReceiveFrom: ['O-', 'B-'],
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
  },
  'B+': {
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    canDonateTo: ['B+', 'AB+'],
  },
  'AB-': {
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    canDonateTo: ['AB-', 'AB+'],
  },
  'AB+': {
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canDonateTo: ['AB+'],
    isUniversalPlasma: true,
  },
  'UNKNOWN': {
    canReceiveFrom: [],
    canDonateTo: [],
  },
};
