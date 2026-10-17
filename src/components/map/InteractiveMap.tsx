import React, { useState } from 'react';
import { Facility, InventoryStatus } from '../../types';
import { 
  MapPin, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface InteractiveMapProps {
  facilities: Facility[];
  centerLat: number;
  centerLng: number;
  centerLabel?: string;
  radiusKm: number;
  selectedFacilityId?: string;
  onSelectFacility?: (facility: Facility) => void;
  heightClass?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  facilities,
  centerLat,
  centerLng,
  centerLabel = 'Patient Location',
  radiusKm,
  selectedFacilityId,
  onSelectFacility,
  heightClass = 'h-[440px]',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activePopupFacility, setActivePopupFacility] = useState<Facility | null>(null);

  // Conversion of lat/long delta into SVG coordinate space
  // Base scale: 1 degree latitude ~ 111 km.
  // We center at (250, 200) inside a 500x400 viewBox.
  const svgWidth = 500;
  const svgHeight = 400;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Scale factor: adjusts based on radiusKm so the radius circle fits well in view
  // At 25km radius, circle radius ~ 120px
  const baseScale = (130 / radiusKm) * zoomLevel;

  // Convert (lat, lng) to (x, y) relative to center
  const getCoordinates = (lat: number, lng: number) => {
    // 1 deg lat ~ 111 km
    // 1 deg lng ~ 111 * cos(lat) km
    const latDiffKm = (lat - centerLat) * 111;
    const lngDiffKm = (lng - centerLng) * 111 * Math.cos((centerLat * Math.PI) / 180);

    const x = centerX + lngDiffKm * baseScale;
    const y = centerY - latDiffKm * baseScale; // SVG y is inverted
    return { x, y };
  };

  const radiusInPixels = radiusKm * baseScale;

  return (
    <div className={`relative w-full ${heightClass} bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner select-none`}>
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-slate-800/90 backdrop-blur-md border border-slate-700/80 text-white text-xs font-semibold flex items-center gap-2 shadow-sm">
          <Navigation className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Interactive Radius: <strong className="font-mono text-rose-400">{radiusKm} km</strong></span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
          className="w-8 h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 transition-colors shadow-sm"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.6))}
          className="w-8 h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 transition-colors shadow-sm"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="w-8 h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition-colors shadow-sm"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Vector Map Rendering Canvas */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="radiusGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.08" />
            <stop offset="90%" stopColor="#e11d48" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        {/* Background Grid */}
        <rect width={svgWidth} height={svgHeight} fill="#090d16" />
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

        {/* Dynamic Radius Coverage Ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusInPixels}
          fill="url(#radiusGradient)"
          stroke="#f43f5e"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Facility Markers */}
        {facilities.map((facility) => {
          const { x, y } = getCoordinates(facility.latitude, facility.longitude);
          const isSelected = selectedFacilityId === facility.id;

          // Determine marker color by facility status
          let markerColor = '#10b981'; // Green for verified / confirmed
          if (!facility.isVerified) {
            markerColor = '#f59e0b'; // Amber for unverified
          }

          return (
            <g
              key={facility.id}
              className="cursor-pointer transition-transform duration-150 hover:scale-125"
              onClick={() => {
                setActivePopupFacility(facility);
                onSelectFacility?.(facility);
              }}
            >
              {/* Highlight Halo for Selected */}
              {isSelected && (
                <circle cx={x} cy={y} r="14" fill="#f43f5e" fillOpacity="0.35" />
              )}
              {/* Outer Glow */}
              <circle cx={x} cy={y} r="8" fill={markerColor} fillOpacity="0.25" />
              {/* Core Pin */}
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill={markerColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Minimal Text Label for prominent facilities */}
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
                fontWeight="500"
                className="pointer-events-none"
              >
                {facility.name.length > 18 ? facility.name.slice(0, 15) + '…' : facility.name}
              </text>
            </g>
          );
        })}

        {/* Center Patient / Target Hospital Marker (Crimson) */}
        <g>
          {/* Pulsing ring around patient */}
          <circle
            cx={centerX}
            cy={centerY}
            r="16"
            fill="#e11d48"
            fillOpacity="0.2"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="7"
            fill="#e11d48"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY - 12}
            textAnchor="middle"
            fontSize="10"
            fill="#fecdd3"
            fontWeight="700"
            className="pointer-events-none"
          >
            {centerLabel}
          </text>
        </g>
      </svg>

      {/* Facility Details Interactive Popover Card */}
      {activePopupFacility && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm z-20 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {activePopupFacility.name}
            </h4>
            <button
              onClick={() => setActivePopupFacility(null)}
              className="text-slate-400 hover:text-slate-600 text-xs px-1"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mb-2 truncate">
            {activePopupFacility.address}, {activePopupFacility.city}
          </p>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {activePopupFacility.distanceKm !== undefined && (
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {activePopupFacility.distanceKm} km away
                </span>
              )}
              {activePopupFacility.isVerified ? (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </div>

            <a
              href={`tel:${activePopupFacility.emergencyHotline || activePopupFacility.contactPhone}`}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Call Desk</span>
            </a>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 backdrop-blur-md border border-slate-700 text-[11px] text-slate-300">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
          <span>Patient</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Verified Facility</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Unverified</span>
        </div>
      </div>
    </div>
  );
};
