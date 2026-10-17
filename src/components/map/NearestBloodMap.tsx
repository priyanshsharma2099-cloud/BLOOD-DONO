/// <reference types="google.maps" />
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useApp } from '../../context/AppContext';
import { Facility, DonorProfile, BloodGroup } from '../../types';
import { calculateDistanceKm } from '../../data/mockData';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Locate, 
  Heart, 
  Building2, 
  Users, 
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyBJVCl5ew74-i4jwdXQP6lB77n0uKly-YQ';

// Sensible default: San Francisco / Bay Area Medical Center coords
const DEFAULT_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

const BLOOD_GROUPS: (BloodGroup | 'ALL')[] = [
  'ALL',
  'O-',
  'O+',
  'A-',
  'A+',
  'B-',
  'B+',
  'AB-',
  'AB+',
];

export const NearestBloodMap: React.FC = () => {
  const { facilities, donors, startNewBloodRequest, updateWizardDraft, setCurrentView } = useApp();

  // User coordinates state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [hasUserGeo, setHasUserGeo] = useState(false);

  // Filters & Search
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'facilities' | 'donors'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ type: 'facility' | 'donor'; data: Facility | DonorProfile } | null>(null);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite'>('roadmap');

  // Try fetching user GPS geolocation on initial mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLocatingUser(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setHasUserGeo(true);
          setIsLocatingUser(false);
        },
        (err) => {
          console.warn('Geolocation lookup notice (using medical district default):', err.message);
          setIsLocatingUser(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Calculate available units for a facility based on filter
  const getFacilityBloodUnits = (facility: Facility, targetGroup: BloodGroup | 'ALL'): number => {
    if (targetGroup === 'ALL') {
      let total = 0;
      Object.entries(facility.inventory || {}).forEach(([_group, comps]) => {
        if (comps) {
          Object.values(comps).forEach((item) => {
            if (item && typeof item.quantity === 'number') {
              total += item.quantity;
            }
          });
        }
      });
      return total;
    }

    const groupInv = facility.inventory?.[targetGroup];
    if (!groupInv) return 0;
    let sum = 0;
    Object.values(groupInv).forEach((item) => {
      if (item && typeof item.quantity === 'number') {
        sum += item.quantity;
      }
    });
    return sum;
  };

  // Filtered & sorted facilities by distance
  const sortedFacilities = useMemo(() => {
    return facilities
      .map((fac) => {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, fac.latitude, fac.longitude);
        const units = getFacilityBloodUnits(fac, selectedBloodGroup);
        return {
          ...fac,
          calculatedDistance: dist,
          unitsAvailable: units,
        };
      })
      .filter((fac) => {
        if (selectedBloodGroup !== 'ALL' && fac.unitsAvailable <= 0) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = fac.name.toLowerCase().includes(q);
          const matchesAddress = fac.address.toLowerCase().includes(q) || fac.city.toLowerCase().includes(q);
          if (!matchesName && !matchesAddress) return false;
        }
        return true;
      })
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [facilities, userLocation, selectedBloodGroup, searchQuery]);

  // Filtered & sorted active donors by distance
  const sortedDonors = useMemo(() => {
    return donors
      .filter((d) => d.isAvailable)
      .map((donor) => {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, donor.latitude, donor.longitude);
        return {
          ...donor,
          calculatedDistance: dist,
        };
      })
      .filter((donor) => {
        if (selectedBloodGroup !== 'ALL' && donor.bloodGroup !== selectedBloodGroup) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = donor.displayName.toLowerCase().includes(q);
          const matchesCity = donor.city.toLowerCase().includes(q);
          if (!matchesName && !matchesCity) return false;
        }
        return true;
      })
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [donors, userLocation, selectedBloodGroup, searchQuery]);

  // Initialize Google Maps instance with modern importLibrary API
  useEffect(() => {
    let isCancelled = false;

    async function initGoogleMap() {
      try {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly',
        });

        const { Map, InfoWindow } = await importLibrary('maps');
        await importLibrary('marker');

        if (isCancelled || !mapContainerRef.current) return;

        const map = new Map(mapContainerRef.current, {
          center: userLocation,
          zoom: 12,
          mapTypeId: 'roadmap',
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi.medical',
              elementType: 'geometry',
              stylers: [{ color: '#fecdd3' }],
            },
            {
              featureType: 'poi.medical',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#be123c' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e0f2fe' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#475569' }],
            },
          ],
        });

        infoWindowRef.current = new InfoWindow();
        mapInstanceRef.current = map;
        setMapLoaded(true);
        setMapError(null);
      } catch (err: unknown) {
        console.error('Google Maps Load Error:', err);
        setMapError(err instanceof Error ? err.message : 'Failed to initialize Google Maps.');
      }
    }

    initGoogleMap();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Update User Location Marker whenever user coordinates change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof google === 'undefined') return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    const userSvgPin: google.maps.Symbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: '#2563eb',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
    };

    const marker = new google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Your Location (Search Center)',
      icon: userSvgPin,
      zIndex: 100,
    });

    marker.addListener('click', () => {
      if (infoWindowRef.current && mapInstanceRef.current) {
        infoWindowRef.current.setContent(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 170px;">
            <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase;">You Are Here</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">Search Origin</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</div>
          </div>
        `);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      }
    });

    userMarkerRef.current = marker;
  }, [mapLoaded, userLocation]);

  // Update Facility & Donor Markers on Map
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof google === 'undefined') return;
    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng));

    // 1. Add Facility Markers if category allows
    if (selectedCategory === 'all' || selectedCategory === 'facilities') {
      sortedFacilities.forEach((fac) => {
        const position = { lat: fac.latitude, lng: fac.longitude };
        bounds.extend(position);

        const isHospital = fac.type === 'hospital_blood_bank';
        const pinColor = isHospital ? '#e11d48' : '#0284c7';

        const svgMarker: google.maps.Symbol = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: pinColor,
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: '#ffffff',
          scale: 1.6,
          anchor: new google.maps.Point(12, 22),
        };

        const marker = new google.maps.Marker({
          position,
          map,
          title: fac.name,
          icon: svgMarker,
          zIndex: isHospital ? 50 : 40,
        });

        marker.addListener('click', () => {
          setSelectedItem({ type: 'facility', data: fac });
          openFacilityInfoWindow(fac, marker);
        });

        markersRef.current.push(marker);
      });
    }

    // 2. Add Donor Markers if category allows
    if (selectedCategory === 'all' || selectedCategory === 'donors') {
      sortedDonors.forEach((donor) => {
        const position = { lat: donor.latitude, lng: donor.longitude };
        bounds.extend(position);

        const donorSvgMarker: google.maps.Symbol = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: '#ffffff',
          scale: 1.4,
          anchor: new google.maps.Point(12, 22),
        };

        const marker = new google.maps.Marker({
          position,
          map,
          title: `Registered Donor: ${donor.displayName} (${donor.bloodGroup})`,
          icon: donorSvgMarker,
          zIndex: 30,
        });

        marker.addListener('click', () => {
          setSelectedItem({ type: 'donor', data: donor });
          openDonorInfoWindow(donor, marker);
        });

        markersRef.current.push(marker);
      });
    }

    if (markersRef.current.length > 0) {
      map.fitBounds(bounds, 50);
    }
  }, [mapLoaded, sortedFacilities, sortedDonors, selectedCategory]);

  // Open InfoWindow for a Facility
  const openFacilityInfoWindow = (fac: any, marker: google.maps.Marker) => {
    if (!infoWindowRef.current || !mapInstanceRef.current) return;

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`;
    const distanceText = `${fac.calculatedDistance} km away`;
    const unitsText = `${fac.unitsAvailable} Units in Stock`;

    const availableGroups = Object.entries(fac.inventory || {})
      .map(([grp, comps]) => {
        let count = 0;
        if (comps) {
          Object.values(comps as Record<string, any>).forEach((it) => {
            if (it?.quantity) count += it.quantity;
          });
        }
        return { grp, count };
      })
      .filter((g) => g.count > 0 && g.grp !== 'UNKNOWN')
      .slice(0, 4);

    const inventoryChips = availableGroups
      .map(
        (g) =>
          `<span style="display:inline-block;background:#f1f5f9;color:#0f172a;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-right:4px;margin-bottom:4px;font-family:monospace;">${g.grp}: ${g.count}u</span>`
      )
      .join('');

    const content = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; max-width: 280px; color: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #e11d48; letter-spacing: 0.5px;">
            ${fac.type === 'hospital_blood_bank' ? '🏥 Hospital Blood Bank' : '🩸 Regional Center'}
          </span>
          <span style="font-size: 10px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">
            ${distanceText}
          </span>
        </div>
        <h3 style="font-size: 14px; font-weight: 800; margin: 0 0 4px; line-height: 1.3;">
          ${fac.name}
        </h3>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 8px;">
          ${fac.address}, ${fac.city}
        </p>
        
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #9f1239; text-transform: uppercase;">
            Matching Blood Stock:
          </div>
          <div style="font-size: 13px; font-weight: 900; color: #be123c;">
            ${unitsText}
          </div>
          <div style="margin-top: 4px;">
            ${inventoryChips}
          </div>
        </div>

        <div style="display: flex; gap: 6px;">
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #0f172a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 10px; border-radius: 6px;">
            🗺️ Directions
          </a>
          <a href="tel:${fac.emergencyHotline || fac.contactPhone}" style="flex: 1; text-align: center; background: #e11d48; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 10px; border-radius: 6px;">
            📞 Call Desk
          </a>
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  // Open InfoWindow for a Donor
  const openDonorInfoWindow = (donor: any, marker: google.maps.Marker) => {
    if (!infoWindowRef.current || !mapInstanceRef.current) return;

    const content = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; max-width: 260px; color: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px;">
            🛡️ Verified Active Donor
          </span>
          <span style="font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">
            ${donor.calculatedDistance} km away
          </span>
        </div>
        <h3 style="font-size: 14px; font-weight: 800; margin: 0 0 2px;">
          ${donor.displayName}
        </h3>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 8px;">
          ${donor.city} · Registered Radius: ${donor.radiusKm} km
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 600; color: #166534;">Blood Group</span>
          <span style="font-size: 16px; font-weight: 900; color: #15803d; font-family: monospace;">${donor.bloodGroup}</span>
        </div>

        <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
          Consented to emergency alerts. You can dispatch an alert via the Find Blood Wizard.
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  // Focus map on a selected facility or donor from the sidebar
  const handleFocusItem = (item: { type: 'facility' | 'donor'; data: any }) => {
    setSelectedItem(item);
    if (!mapInstanceRef.current) return;

    const lat = item.data.latitude;
    const lng = item.data.longitude;
    mapInstanceRef.current.panTo({ lat, lng });
    mapInstanceRef.current.setZoom(14);

    const targetMarker = markersRef.current.find((m) => {
      const pos = m.getPosition();
      return (
        pos &&
        Math.abs(pos.lat() - lat) < 0.0001 &&
        Math.abs(pos.lng() - lng) < 0.0001
      );
    });

    if (targetMarker) {
      if (item.type === 'facility') {
        openFacilityInfoWindow(item.data, targetMarker);
      } else {
        openDonorInfoWindow(item.data, targetMarker);
      }
    }
  };

  // Re-center on user coordinates
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo(userLocation);
    mapInstanceRef.current.setZoom(12);

    if (userMarkerRef.current && infoWindowRef.current) {
      infoWindowRef.current.setContent(`
        <div style="font-family: system-ui; padding: 4px;">
          <div style="font-size: 11px; font-weight: 800; color: #2563eb;">Current Center</div>
          <div style="font-size: 12px; color: #475569;">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</div>
        </div>
      `);
      infoWindowRef.current.open(mapInstanceRef.current, userMarkerRef.current);
    }
  };

  // Pre-fill requisition in FindBloodWizard
  const handleRequisitionFromFacility = (fac: Facility) => {
    updateWizardDraft({
      selectedHospitalId: fac.id,
      bloodGroup: selectedBloodGroup !== 'ALL' ? selectedBloodGroup : '',
      step: 1,
    });
    setCurrentView('find-blood');
  };

  // Toggle map type (Roadmap vs Satellite)
  const toggleMapType = () => {
    if (!mapInstanceRef.current) return;
    const nextType = mapTypeId === 'roadmap' ? 'satellite' : 'roadmap';
    setMapTypeId(nextType);
    mapInstanceRef.current.setMapTypeId(nextType);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Google Maps Platform Integration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nearest Blood Availability Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live interactive geographic discovery of verified blood units in hospital banks, regional centers, and consenting donors sorted by proximity.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedBloodGroup !== 'ALL') {
                updateWizardDraft({ bloodGroup: selectedBloodGroup });
              }
              startNewBloodRequest();
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Requisition Blood Now</span>
          </button>
        </div>
      </div>

      {/* Blood Group Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-rose-600" />
            Filter by Blood Type (Instantly Updates Map Pins &amp; Inventory Counts)
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {sortedFacilities.length} Facilities · {sortedDonors.length} Donors
          </span>
        </div>

        {/* Blood Group Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {BLOOD_GROUPS.map((group) => {
            const isSelected = selectedBloodGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedBloodGroup(group)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold font-mono transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500 ring-offset-1 scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {group === 'ALL' ? (
                  <span>All Types</span>
                ) : (
                  <>
                    <span>{group}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                      isSelected ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {facilities.reduce(
                        (sum, fac) => sum + getFacilityBloodUnits(fac, group),
                        0
                      )}u
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Companion Sidebar & Right Interactive Google Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Search & Distance-Sorted Availability List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search & Category Filter Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search facility by name, neighborhood, or city..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-900 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`py-1.5 rounded-md transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                All ({sortedFacilities.length + sortedDonors.length})
              </button>
              <button
                onClick={() => setSelectedCategory('facilities')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${
                  selectedCategory === 'facilities'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3 h-3 text-rose-600" />
                <span>Banks ({sortedFacilities.length})</span>
              </button>
              <button
                onClick={() => setSelectedCategory('donors')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${
                  selectedCategory === 'donors'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Users className="w-3 h-3 text-emerald-600" />
                <span>Donors ({sortedDonors.length})</span>
              </button>
            </div>
          </div>

          {/* Sorted Results List Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>Sorted from Nearest to Farthest</span>
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <Navigation className="w-3 h-3" />
              Calculated via GPS Matrix
            </span>
          </div>

          {/* Scrollable Location List */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {/* Facilities List */}
            {(selectedCategory === 'all' || selectedCategory === 'facilities') &&
              sortedFacilities.map((fac) => {
                const isSelected =
                  selectedItem?.type === 'facility' && selectedItem.data.id === fac.id;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`;

                return (
                  <div
                    key={fac.id}
                    className={`bg-white rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'border-rose-500 shadow-md ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            {fac.type === 'hospital_blood_bank' ? 'Hospital Blood Bank' : 'Regional Center'}
                          </span>
                          {fac.isVerified && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {fac.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {fac.address}, {fac.city}
                        </p>
                      </div>

                      {/* Distance Pill */}
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono font-bold text-xs">
                          {fac.calculatedDistance} km
                        </span>
                      </div>
                    </div>

                    {/* Stock Count Bar */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-3">
                      <span className="text-slate-600 font-medium">
                        {selectedBloodGroup === 'ALL'
                          ? 'Total Units in Inventory:'
                          : `${selectedBloodGroup} Available:`}
                      </span>
                      <span className="font-extrabold font-mono text-slate-900 text-sm">
                        {fac.unitsAvailable} Unit(s)
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => handleFocusItem({ type: 'facility', data: fac })}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Focus on Map</span>
                      </button>

                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Directions</span>
                      </a>

                      <button
                        onClick={() => handleRequisitionFromFacility(fac)}
                        className="ml-auto px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors text-xs"
                      >
                        <span>Requisition</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Donors List */}
            {(selectedCategory === 'all' || selectedCategory === 'donors') &&
              sortedDonors.map((donor) => {
                const isSelected =
                  selectedItem?.type === 'donor' && selectedItem.data.id === donor.id;

                return (
                  <div
                    key={donor.id}
                    className={`bg-white rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Consenting Donor
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            Radius: {donor.radiusKm} km
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {donor.displayName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {donor.city}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono font-bold text-xs">
                          {donor.calculatedDistance} km
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs mb-3">
                      <span className="text-emerald-800 font-medium">Donor Blood Group:</span>
                      <span className="font-extrabold font-mono text-emerald-700 text-base">
                        {donor.bloodGroup}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => handleFocusItem({ type: 'donor', data: donor })}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Focus on Map</span>
                      </button>

                      <button
                        onClick={() => {
                          updateWizardDraft({
                            bloodGroup: donor.bloodGroup,
                            step: 1,
                          });
                          setCurrentView('find-blood');
                        }}
                        className="ml-auto px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 transition-colors text-xs"
                      >
                        <span>Dispatch Alert</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Empty State */}
            {sortedFacilities.length === 0 && sortedDonors.length === 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">
                  No matching blood availability found
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try clearing the search query or selecting "All Types" to view all available regional facilities.
                </p>
                <button
                  onClick={() => {
                    setSelectedBloodGroup('ALL');
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Google Maps Interactive Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3 sticky top-20">
          
          {/* Map Controls Header Bar */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">
                Live Google Maps View
              </span>
              {hasUserGeo && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  GPS Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMapType}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                title="Toggle Satellite / Street View"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span className="capitalize">{mapTypeId}</span>
              </button>

              <button
                onClick={handleRecenter}
                disabled={isLocatingUser}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                title="Re-center on Your Location"
              >
                <Locate className="w-3.5 h-3.5 text-blue-600" />
                <span>Locate Me</span>
              </button>
            </div>
          </div>

          {/* Google Maps Container */}
          <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
            {/* The Google Maps Canvas */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Loading Overlay */}
            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
                <RefreshCw className="w-8 h-8 text-rose-600 animate-spin mb-3" />
                <h4 className="text-sm font-bold text-slate-900">
                  Initializing Google Maps Platform...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Loading street network, live medical markers, and distance matrix
                </p>
              </div>
            )}

            {/* Error Overlay with Resilience Fallback */}
            {mapError && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Google Maps Connection Notice
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  {mapError}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  You can continue reviewing nearest facilities and directions in the list beside this map.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Map Legend Floating Tag */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-slate-200 flex items-center gap-3 text-[11px] text-slate-700">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                <span className="font-semibold">Hospital Blood Bank</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                <span className="font-semibold">Regional Center</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="font-semibold">Active Donor</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block ring-2 ring-blue-300" />
                <span className="font-semibold">Your Location</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
