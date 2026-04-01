// frontend/src/components/PropertyMapPicker.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface PropertyMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  zoomToLocation?: { lat: number; lng: number; address?: string } | null;
}

// Component to handle map view updates
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  
  return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: PropertyMapPickerProps['onLocationSelect'] }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationSelect(lat, lng, address);
        
        // Add a marker at clicked position
        L.marker([lat, lng]).addTo(map).bindPopup(address).openPopup();
      } catch (error) {
        console.error("Error getting address:", error);
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    },
  });
  
  return position ? <Marker position={position} /> : null;
}

export default function PropertyMapPicker({ onLocationSelect, zoomToLocation }: PropertyMapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  // Addis Ababa, Ethiopia coordinates
  const addisAbabaCenter: [number, number] = [9.0320, 38.7469];
  const [mapCenter, setMapCenter] = useState<[number, number]>(addisAbabaCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [hasZoomedToLocation, setHasZoomedToLocation] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update map when zoomToLocation changes - FIXED: use ref to prevent infinite loop
  useEffect(() => {
    if (zoomToLocation && zoomToLocation.lat && zoomToLocation.lng && !hasZoomedToLocation) {
      setMapCenter([zoomToLocation.lat, zoomToLocation.lng]);
      setMapZoom(16);
      setMarkerPosition([zoomToLocation.lat, zoomToLocation.lng]);
      setHasZoomedToLocation(true);
      
      // Note: Do NOT call onLocationSelect here to avoid infinite loop
      // The parent component already has this location from the selection that triggered zoomToLocation
    }
  }, [zoomToLocation, hasZoomedToLocation]);

  // Reset hasZoomedToLocation when zoomToLocation becomes null (for new selections)
  useEffect(() => {
    if (!zoomToLocation) {
      setHasZoomedToLocation(false);
    }
  }, [zoomToLocation]);

  if (!isMounted) {
    return <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>;
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onLocationSelect={onLocationSelect} />
      <MapController center={mapCenter} zoom={mapZoom} />
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>
            Selected location
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}