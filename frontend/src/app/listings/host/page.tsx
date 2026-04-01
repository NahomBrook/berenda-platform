// frontend/src/app/properties/host/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { api } from "@/services/api";

// Dynamically import map components (needed for Next.js)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Map click handler component using react-leaflet's useMapEvents
function MapClickHandler({ onClick }: { onClick: (e: any) => void }) {
  // dynamically require to avoid SSR issues
  const { useMapEvents } = require('react-leaflet');
  useMapEvents({
    click: (e: any) => onClick && onClick(e),
  });
  return null;
}

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export default function HostPropertyPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [area, setArea] = useState("");
  
  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(10);
  const [mapSelected, setMapSelected] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Search locations as user types
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const results = await api.searchLocations(query);
      setLocationSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching locations:", error);
    }
  }, []);

  // Debounced location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location) {
        searchLocations(location);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [location, searchLocations]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setLocation(`${suggestion.name}, ${suggestion.city}, ${suggestion.country}`);
    setLatitude(suggestion.latitude);
    setLongitude(suggestion.longitude);
    setMapCenter([suggestion.latitude, suggestion.longitude]);
    setMapZoom(15);
    setMapSelected(true);
    setShowSuggestions(false);
  };

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setLatitude(lat);
    setLongitude(lng);
    setMapSelected(true);
    
    // Reverse geocode to get location name
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setLocation(data.display_name);
        }
      })
      .catch(console.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate that location is selected via map
    if (!mapSelected || !latitude || !longitude) {
      setError("Please select your property location by clicking on the map");
      return;
    }

    setLoading(true);

    try {
      const propertyData = {
        title,
        description,
        location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        monthlyPrice: parseFloat(monthlyPrice),
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
        maxGuests: maxGuests ? parseInt(maxGuests) : undefined,
        area: area ? parseFloat(area) : undefined,
      };

      const newProperty = await api.createProperty(propertyData);
      console.log("Property created:", newProperty);
      router.push(`/listings/${newProperty.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Host Your Property</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Beautiful Downtown Apartment"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe your property..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($) *</label>
            <input
              type="number"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., 1500"
              required
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Property Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 1.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 850"
              />
            </div>
          </div>
        </div>

        {/* Location with Required Map */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Location *</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ You must click on the map to select your property location before submitting.
            </p>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Address will appear when you click on the map"
              readOnly
            />
            
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium">{suggestion.name}</p>
                    <p className="text-sm text-gray-500">{suggestion.city}, {suggestion.country}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Click on the map to set your property location *
            </label>
            <div className={`h-96 rounded-lg overflow-hidden border-2 ${!mapSelected ? 'border-red-500' : 'border-gray-300'}`}>
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                <MapClickHandler onClick={handleMapClick} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {latitude && longitude && (
                  <Marker position={[latitude, longitude]}>
                    <Popup>
                      {location || "Selected location"}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={mapSelected}
                readOnly
                className="w-4 h-4 text-red-600"
              />
              <label className="text-sm text-gray-600">
                {mapSelected 
                  ? "✓ Location selected! You can proceed." 
                  : "⚠️ Required: Click on the map to select your property location"}
              </label>
            </div>
            {latitude && longitude && (
              <p className="text-xs text-gray-500 mt-1">
                📍 Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !mapSelected}
          className={`w-full py-3 rounded-lg transition-colors font-medium ${
            loading || !mapSelected
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {loading ? "Creating Property..." : !mapSelected ? "Please select location on map first" : "List Property"}
        </button>
      </form>
    </div>
  );
}