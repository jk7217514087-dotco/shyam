import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ComplaintStatus, PriorityLevel, WasteCategory } from '../types/index.js';

interface MapMarkerItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: ComplaintStatus;
  priority?: PriorityLevel;
  category?: WasteCategory;
  address?: string;
  trackingId?: string;
  imageUrl?: string;
}

interface Props {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarkerItem[];
  selectedLocation?: { lat: number; lng: number } | null;
  interactivePicker?: boolean;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  height?: string;
  onMarkerClick?: (id: string) => void;
}

// Custom SVG icon generator for Leaflet
const createCustomIcon = (color: string, label?: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10.5 16 26 16 26s16-15.5 16-26C32 7.16 24.84 0 16 0z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="15" r="7" fill="#0f172a"/>
      <circle cx="16" cy="15" r="4" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
};

const getStatusColor = (status: ComplaintStatus): string => {
  switch (status) {
    case 'Resolved':
      return '#10b981'; // Emerald
    case 'Cleaned_Pending_Verification':
      return '#f59e0b'; // Amber
    case 'In Progress':
      return '#06b6d4'; // Cyan
    case 'Assigned':
      return '#a855f7'; // Purple
    case 'Rejected':
      return '#f43f5e'; // Rose
    case 'Submitted':
    default:
      return '#3b82f6'; // Blue
  }
};

// Component to dynamically pan and fly map when coordinates change
const ChangeView: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 15, { duration: 0.8 });
    }
  }, [center[0], center[1], zoom, map]);
  return null;
};

// Component for capturing user map clicks
const MapEventsHandler: React.FC<{ onLocationSelect?: (coords: { lat: number; lng: number }) => void }> = ({
  onLocationSelect,
}) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

export const MapView: React.FC<Props> = ({
  center = [12.9716, 77.5946],
  zoom = 13,
  markers = [],
  selectedLocation,
  interactivePicker = false,
  onLocationSelect,
  height = '400px',
  onMarkerClick,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const pickerIcon = createCustomIcon('#10b981'); // Emerald pin for picker

  if (!mapReady) {
    return (
      <div
        className="w-full rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-sm"
        style={{ height }}
      >
        Initializing Interactive Map...
      </div>
    );
  }

  const initialCenter: [number, number] = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : markers.length > 0 && markers[0].lat && markers[0].lng
    ? [markers[0].lat, markers[0].lng]
    : center;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl"
      style={{ height, minHeight: '260px', maxHeight: '80vh' }}
    >
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {interactivePicker && <MapEventsHandler onLocationSelect={onLocationSelect} />}

        {/* Dynamic Map Controller that pans to selected pin or GPS */}
        {selectedLocation && (
          <ChangeView center={[selectedLocation.lat, selectedLocation.lng]} zoom={zoom || 15} />
        )}

        {/* Selected Pin in Picker mode (draggable for fine-tuning) */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={pickerIcon}
            draggable={interactivePicker}
            eventHandlers={
              interactivePicker && onLocationSelect
                ? {
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      onLocationSelect({ lat: position.lat, lng: position.lng });
                    },
                  }
                : undefined
            }
          >
            <Popup>
              <div className="text-xs text-slate-100 font-sans">
                <p className="font-bold text-emerald-400 mb-0.5">Selected Complaint Location</p>
                <p className="text-slate-300">
                  Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                </p>
                {interactivePicker && (
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    💡 Drag pin or tap anywhere on map to reposition
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Complaint Markers */}
        {markers.map((item) => {
          if (!item.lat || !item.lng) return null;
          const markerIcon = createCustomIcon(getStatusColor(item.status));
          return (
            <Marker key={item.id} position={[item.lat, item.lng]} icon={markerIcon}>
              <Popup>
                <div className="text-xs text-slate-100 min-w-[180px] max-w-[240px] font-sans">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-24 object-cover rounded-md mb-2 border border-slate-700"
                    />
                  )}
                  {item.trackingId && (
                    <span className="text-[10px] font-mono text-emerald-400 block mb-0.5">
                      {item.trackingId}
                    </span>
                  )}
                  <h5 className="font-bold text-slate-100 leading-snug mb-1 line-clamp-1">{item.title}</h5>
                  {item.address && <p className="text-slate-400 text-[11px] mb-2 line-clamp-2">{item.address}</p>}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {onMarkerClick && (
                      <button
                        onClick={() => onMarkerClick(item.id)}
                        className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded transition"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating map legend: Responsive Collapsible for Mobile, Expanded for Tablets/Desktop */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <button
          type="button"
          onClick={() => setLegendOpen(!legendOpen)}
          className="sm:hidden bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{legendOpen ? 'Close Legend' : 'Map Legend'}</span>
        </button>

        <div
          className={`${
            legendOpen ? 'block' : 'hidden'
          } sm:block bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-2xl text-[10px] space-y-1 mt-1 sm:mt-0`}
        >
          <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Status Legend</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-300">Assigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">Cleaned (Pending)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Resolved & Cleaned</span>
          </div>
        </div>
      </div>
    </div>
  );
};
