import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import SidebarLayout from "./SidebarLayout";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Status colors
const statusColors = {
  Pending: "#f59e0b",
  "In Transit": "#3b82f6",
  Rescued: "#10b981",
  "Adoption Pending": "#a855f7",
  Adopted: "#6b7280"
};

const createIcon = (color) => L.divIcon({
  className: "custom-marker",
  html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function ReporterMap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center

  const sidebarItems = [
    { path: "/reporter-dashboard", label: "My Reports", icon: "📋" },
    { path: "/report", label: "Report Animal", icon: "📢" },
    { path: "/reporter-map", label: "My Reports Map", icon: "🗺️" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get("/common-api/animals");
        const allCases = res.data.payload || [];
        
        // Filter only cases reported by this user
        const userReports = allCases.filter(
          a => a.reportedBy?._id === user?.id || a.reportedBy === user?.id
        );
        
        setMyReports(userReports);

        // Center map on first case if available
        if (userReports.length > 0) {
          const firstCase = userReports[0];
          const coords = firstCase.location?.coordinates?.coordinates;
          if (coords && coords.length === 2) {
            setCenter([coords[1], coords[0]]);
          }
        }
      } catch (err) {
        toast.error("Failed to load your reports");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "REPORTER") {
      fetchReports();
    }
  }, [user]);

  // Count by status
  const statusCounts = myReports.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const content = (
    <>
      {/* Status Legend */}
      <div className="bg-white rounded-2xl border border-[#e8e8ed] p-5 mb-6">
        <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">STATUS LEGEND</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ background: color }}></div>
              <span className="text-sm text-[#6e6e73]">{status}</span>
              {statusCounts[status] && (
                <span className="text-xs font-bold text-[#1d1d1f]">({statusCounts[status]})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e8e8ed]">
          <p className="text-[#6e6e73]">Loading your reports...</p>
        </div>
      ) : myReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e8e8ed]">
          <p className="text-5xl mb-4">🗺️</p>
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">No Reports to Show</h3>
          <p className="text-[#6e6e73] mb-6">Report an animal to see it on the map.</p>
          <button
            onClick={() => navigate("/report")}
            className="px-6 py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold rounded-lg transition"
          >
            Report Your First Animal
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e8ed] overflow-hidden">
          <div className="p-5 border-b border-[#e8e8ed]">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#1d1d1f]">Your Reports on Map</h2>
                <p className="text-sm text-[#6e6e73] mt-1">
                  Tracking {myReports.length} {myReports.length === 1 ? "report" : "reports"}
                </p>
              </div>
              <button
                onClick={() => navigate("/reporter-dashboard")}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-sm font-medium rounded-lg transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          <div style={{ height: "600px" }}>
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {myReports.map(c => {
                const coords = c.location?.coordinates?.coordinates;
                if (!coords || coords.length !== 2) return null;
                const [lng, lat] = coords;

                return (
                  <Marker
                    key={c._id}
                    position={[lat, lng]}
                    icon={createIcon(statusColors[c.status] || "#6b7280")}
                  >
                    <Popup>
                      <div style={{ minWidth: "220px", fontFamily: "system-ui" }}>
                        {c.imageUrl && (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
                          />
                        )}
                        <h3 style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 4px 0", color: "#1d1d1f" }}>
                          {c.name || "Unnamed"}
                        </h3>
                        <div style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: "12px",
                          fontSize: "11px", fontWeight: "500",
                          background: statusColors[c.status] + "20",
                          color: statusColors[c.status],
                          marginBottom: "6px"
                        }}>
                          {c.status}
                        </div>
                        <p style={{ fontSize: "12px", color: "#6e6e73", margin: "4px 0", lineHeight: "1.4" }}>
                          {c.description?.substring(0, 80)}{c.description?.length > 80 ? "..." : ""}
                        </p>
                        <p style={{ fontSize: "11px", color: "#a1a1a6", margin: "4px 0" }}>
                          📍 {c.location?.address}
                        </p>
                        <button
                          onClick={() => navigate(`/case/${c._id}`)}
                          style={{
                            width: "100%", marginTop: "8px", padding: "6px",
                            background: "#0066cc", color: "white", border: "none",
                            borderRadius: "8px", fontSize: "12px", fontWeight: "500", cursor: "pointer"
                          }}
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
        </div>
      )}

      {/* Reports List Below Map */}
      {myReports.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">All Your Reports ({myReports.length})</h3>
          <div className="grid gap-3">
            {myReports.map(a => (
              <div
                key={a._id}
                onClick={() => navigate(`/case/${a._id}`)}
                className="bg-white rounded-xl p-4 border border-[#e8e8ed] hover:shadow-md transition cursor-pointer flex items-center gap-4"
              >
                <div
                  className="w-3 h-12 rounded-full flex-shrink-0"
                  style={{ background: statusColors[a.status] || "#6b7280" }}
                ></div>
                <div className="w-16 h-16 bg-[#f5f5f7] rounded-lg overflow-hidden flex-shrink-0">
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#1d1d1f] truncate">{a.name || "Unnamed"}</h4>
                  <p className="text-sm text-[#6e6e73] truncate">{a.species} • {a.location?.address || "Unknown"}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
                  style={{
                    background: statusColors[a.status] + "20",
                    color: statusColors[a.status]
                  }}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <SidebarLayout title="My Reports Map" sidebarItems={sidebarItems}>
      {content}
    </SidebarLayout>
  );
}