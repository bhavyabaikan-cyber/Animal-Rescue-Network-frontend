import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../api/client";
import { toast } from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({

  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Component to update map view when filters change
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function CasesMap({ userLocation, radius = 10 }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(userLocation || [12.9716, 77.5946]); // Default: Bangalore

  useEffect(() => {
    const fetchNearbyCases = async () => {
      try {
        setLoading(true);
        const [lat, lng] = mapCenter;
        const res = await api.get(`/common-api/animals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        setCases(res.data.payload || []);
      } catch (err) {
        toast.error("Failed to load nearby cases");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyCases();
  }, [mapCenter, radius]);

  const getStatusEmoji = (status) => {
    switch (status) {
      case "Pending": return "🟡";
      case "In Transit": return "🔵";
      case "Rescued": return "🟢";
      case "Adopted": return "🟣";
      default: return "⚪";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "marker-pending";
      case "In Transit": return "marker-in-transit";
      case "Rescued": return "marker-rescued";
      case "Adopted": return "marker-adopted";
      default: return "";
    }
  };

  if (loading) {
    return <div className="map-container flex items-center justify-center bg-slate-100">Loading map...</div>;
  }

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      className="map-container"
      scrollWheelZoom={true}
    >
      <MapUpdater center={mapCenter} zoom={13} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cases.map((animal) => {
        if (!animal.latitude || !animal.longitude) return null;
        
        return (
          <Marker 
            key={animal._id} 
            position={[animal.latitude, animal.longitude]}
            icon={L.divIcon({
              className: "custom-marker",
              html: `<div class="${getStatusClass(animal.status)}" style="width: 40px; height: 40px;">${getStatusEmoji(animal.status)}</div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            })}
          >
            <Popup>
              <div className="case-popup">
                {animal.imageUrl ? (
                  <img src={animal.imageUrl} alt={animal.name} className="case-popup-image" />
                ) : (
                  <div className="case-popup-image flex items-center justify-center text-4xl bg-slate-200">🐾</div>
                )}
                <div className="case-popup-content">
                  <div className="case-popup-title">{animal.name || "Unnamed"}</div>
                  <div className="case-popup-species">{animal.species}</div>
                  <div className="case-popup-location">📍 {animal.location}</div>
                  <div className="text-xs text-slate-500 mt-1">💰 ₹{animal.totalPledged || 0} pledged</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {cases.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md z-[1000] text-sm text-slate-600">
          No cases found in this area
        </div>
      )}
    </MapContainer>
  );
}