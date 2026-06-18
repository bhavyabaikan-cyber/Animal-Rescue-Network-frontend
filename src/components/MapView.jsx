import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, loadingClass, ghostBtn, submitBtn } from "../styles/common";

// ✅ Fix Leaflet's default marker icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ Custom colored markers by status
const createIcon = (color) => new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const statusColors = {
  Pending: "#f59e0b",
  "In Transit": "#3b82f6",
  Rescued: "#10b981",
  "Adoption Pending": "#a855f7",
  Adopted: "#6b7280"
};

// Component to recenter map
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

export default function MapView() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [radius, setRadius] = useState(50);
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch cases
  const fetchCases = async (lat, lng, rad) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append("lat", lat);
        params.append("lng", lng);
        params.append("radius", rad || radius);
      }
      if (statusFilter !== "All") params.append("status", statusFilter);
      
      const res = await api.get(`/common-api/animals/nearby?${params.toString()}`);
      setCases(res.data.payload || []);
    } catch (err) {
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, [statusFilter]);

  // Get user's current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    toast.loading("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        fetchCases(latitude, longitude, radius);
        toast.dismiss();
        toast.success("📍 Location found!");
      },
      (err) => {
        toast.dismiss();
        toast.error("Location access denied. Showing all cases.");
        fetchCases();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (userLocation) {
      fetchCases(userLocation[0], userLocation[1], newRadius);
    }
  };

  return (
    <div className={pageWrapper}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">🗺️ Rescue Map</h1>
          <p className="text-sm text-[#6e6e73]">Find animals in need near you</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleGetLocation} className={`${submitBtn} px-4 py-2 text-sm`}>📍 Use My Location</button>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-[#e8e8ed] rounded-xl text-sm bg-white">
            <option>All</option>
            <option>Pending</option>
            <option>In Transit</option>
            <option>Rescued</option>
            <option>Adoption Pending</option>
            <option>Adopted</option>
          </select>
        </div>
      </div>

      {/* Radius Slider (only show if user location is set) */}
      {userLocation && (
        <div className="mb-4 p-4 bg-[#f8f9fa] rounded-xl border border-[#e8e8ed]">
          <label className="text-sm font-medium text-[#1d1d1f]">
            Search Radius: <span className="text-[#0066cc] font-bold">{radius} km</span>
          </label>
          <input type="range" min="5" max="200" step="5" value={radius} onChange={(e) => handleRadiusChange(parseInt(e.target.value))} className="w-full mt-2 accent-[#0066cc]" />
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {Object.entries(statusColors).map(([status, color]) => {
          const count = cases.filter(c => c.status === status).length;
          return (
            <div key={status} className="p-3 bg-white rounded-xl border border-[#e8e8ed] text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
                <span className="text-xs text-[#6e6e73]">{status}</span>
              </div>
              <p className="text-xl font-bold text-[#1d1d1f] mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#e8e8ed] shadow-sm" style={{ height: "600px" }}>
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
            <p className={loadingClass}>Loading map...</p>
          </div>
        )}
        
        <MapContainer center={mapCenter} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <RecenterMap center={mapCenter} />

          {/* User location marker */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={new L.DivIcon({
                className: "user-marker",
                html: `<div style="background:#0066cc;width:20px;height:20px;border-radius:50%;border:4px solid white;box-shadow:0 0 0 2px #0066cc,0 2px 8px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle center={userLocation} radius={radius * 1000} pathOptions={{ color: "#0066cc", fillColor: "#0066cc", fillOpacity: 0.1 }} />
            </>
          )}

          {/* ✅ Case markers - SINGLE CLEAN LOOP */}
          {cases
            .filter(c => c && c._id)
            .map(c => {
              const hasCoords = c.location?.coordinates?.coordinates && c.location.coordinates.coordinates.length === 2;
              
              // ✅ If no coordinates and user hasn't shared location, skip this marker
              if (!hasCoords && !userLocation) return null;
              
              // ✅ Determine position
              let lat, lng;
              if (hasCoords) {
                const coords = c.location.coordinates.coordinates;
                [lng, lat] = coords;
              } else {
                // Use user's location for cases without coordinates
                [lat, lng] = [userLocation[0], userLocation[1]];
              }
              
              // ✅ Different marker for cases without coordinates
              const markerIcon = hasCoords 
                ? createIcon(statusColors[c.status] || "#6b7280")
                : new L.DivIcon({
                    className: "custom-marker",
                    html: `<div style="background:#9ca3af;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;">?</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 28],
                  });
              
              return (
                <Marker key={c._id} position={[lat, lng]} icon={markerIcon}>
                  <Popup>
                    <div style={{ minWidth: "220px", fontFamily: "system-ui" }}>
                      {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />}
                      <h3 style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 4px 0", color: "#1d1d1f" }}>
                        {c.name || "Unnamed"} ({c.species})
                      </h3>
                      <div style={{ display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "500", background: statusColors[c.status] + "20", color: statusColors[c.status], marginBottom: "6px" }}>
                        {c.status}
                      </div>
                      {!hasCoords && (
                        <div style={{ display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "500", background: "#fef3c7", color: "#92400e", marginLeft: "4px" }}>
                          📍 Location not specified
                        </div>
                      )}
                      <p style={{ fontSize: "12px", color: "#6e6e73", margin: "4px 0", lineHeight: "1.4" }}>
                        {c.description?.substring(0, 80)}{c.description?.length > 80 ? "..." : ""}
                      </p>
                      <p style={{ fontSize: "11px", color: "#a1a1a6", margin: "4px 0" }}>
                        📍 {c.location?.address || (hasCoords ? "Coordinates available" : "Address not provided")}
                      </p>
                      <button 
                        onClick={() => navigate(`/case/${c._id}`)}
                        style={{ width: "100%", marginTop: "8px", padding: "6px", background: "#0066cc", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}
                      >
                        View Details →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-white rounded-xl border border-[#e8e8ed]">
        <p className="text-xs font-semibold text-[#1d1d1f] mb-2">Legend</p>
        <div className="flex flex-wrap gap-4 text-xs text-[#6e6e73]">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
              <span>{status}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#9ca3af]"></div>
            <span>No Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0066cc] border-2 border-white shadow-[0_0_0_2px_#0066cc]"></div>
            <span>You</span>
          </div>
        </div>
      </div>

      {cases.length === 0 && !loading && (
        <div className="mt-6 p-8 bg-white rounded-2xl border border-[#e8e8ed] text-center">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-[#6e6e73]">No cases found in this area. Try expanding the radius or changing filters.</p>
        </div>
      )}
    </div>
  );
}