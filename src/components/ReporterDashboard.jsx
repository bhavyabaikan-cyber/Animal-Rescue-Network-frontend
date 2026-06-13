import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { loadingClass, emptyStateClass } from "../styles/common";

export default function ReporterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, rescued: 0, adopted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log("🔄 Fetching reports from /reporter-api/my-reports...");
        const res = await api.get("/reporter-api/my-reports");
        console.log("✅ Response received:", res.data);
        
        // ✅ Correctly parse the response structure
        setReports(res.data.payload.animals || []);
        setStats(res.data.payload.stats || { total: 0, pending: 0, inTransit: 0, rescued: 0, adopted: 0 });
      } catch (err) {
        console.error("❌ Reporter fetch error:", err);
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === "REPORTER") {
      fetchReports();
    }
  }, [user]);

  if (loading) return <p className={loadingClass}>Loading your reports...</p>;

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-amber-100 text-amber-800 border border-amber-200",
      "In Transit": "bg-blue-100 text-blue-800 border border-blue-200",
      Rescued: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      "Adoption Pending": "bg-purple-100 text-purple-800 border border-purple-200",
      Adopted: "bg-gray-100 text-gray-800 border border-gray-200"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 sm:p-12 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-100 text-sm mb-2">Welcome back,</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{user.firstName || 'User'}</h1>
          <p className="text-blue-100 text-lg max-w-2xl">Track the status of all animals you've reported.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Total Reported</p>
          <p className="text-2xl font-bold text-[#1d1d1f]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">In Transit</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Rescued</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.rescued}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Adopted</p>
          <p className="text-2xl font-bold text-gray-600">{stats.adopted}</p>
        </div>
      </div>

      {/* Achievement Banner */}
      {stats.adopted > 0 && (
        <div className="bg-gradient-to-r from-[#34c759] to-[#28a745] rounded-2xl p-6 mb-8 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-xl font-bold">You helped {stats.adopted} animal{stats.adopted > 1 ? 's' : ''} find forever homes!</h3>
              <p className="text-green-50 text-sm mt-1">Your reports made happy endings possible.</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports List Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f]">My Reported Cases</h2>
          <p className="text-sm text-[#6e6e73] mt-1">Track the status of animals you've reported</p>
        </div>
        <button onClick={() => navigate("/report")} className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition">
          Report New Animal
        </button>
      </div>

      {/* Empty State */}
      {reports.length === 0 ? (
        <div className={`${emptyStateClass} py-20 bg-white rounded-2xl border border-[#e8e8ed]`}>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No reports yet</h3>
          <p className="text-[#6e6e73] mb-6 max-w-md mx-auto">You haven't reported any animals yet. Be the first to help an animal in need.</p>
          <button 
            onClick={() => navigate("/report")} 
            className="px-6 py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold rounded-xl transition shadow-sm"
          >
            Report an Animal
          </button>
        </div>
      ) : (
        /* Reports Grid */
        <div className="grid gap-4">
          {reports.map(a => (
            <div 
              key={a._id} 
              className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start hover:shadow-md transition cursor-pointer border border-[#e8e8ed]"
              onClick={() => navigate(`/case/${a._id}`)}
            >
              {/* Image */}
              <div className="w-full sm:w-28 h-28 bg-[#f5f5f7] rounded-xl overflow-hidden flex-shrink-0">
                {a.imageUrl ? (
                  <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#a1a1a6]">🐾</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-[#1d1d1f]">{a.name || "Unnamed"}</h3>
                  <span className="text-sm text-[#6e6e73]">({a.species})</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(a.status)}`}>
                    {a.status}
                  </span>
                </div>
                
                <p className="text-sm text-[#6e6e73] line-clamp-2 mb-3">{a.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-[#a1a1a6]">
                  <span>Reported: {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>{a.location?.address || a.location}</span>
                  {a.assignedVolunteer && (
                    <span className="text-[#0066cc] font-medium">
                      Volunteer: {a.assignedVolunteer.firstName || "Assigned"}
                    </span>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${a.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-400"}`}>
                    Reported
                  </span>
                  <span className="text-[#a1a1a6]">→</span>
                  <span className={`px-2 py-1 rounded ${["In Transit", "Rescued", "Adoption Pending", "Adopted"].includes(a.status) ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-400"}`}>
                    Volunteer
                  </span>
                  <span className="text-[#a1a1a6]">→</span>
                  <span className={`px-2 py-1 rounded ${["Rescued", "Adoption Pending", "Adopted"].includes(a.status) ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-400"}`}>
                    Rescued
                  </span>
                  <span className="text-[#a1a1a6]">→</span>
                  <span className={`px-2 py-1 rounded ${a.status === "Adopted" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-400"}`}>
                    Adopted
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/case/${a._id}`);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-sm font-semibold rounded-lg transition border border-[#e8e8ed]"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {reports.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 sm:p-12 text-white text-center shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">Keep Making a Difference</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            There are still many animals waiting for help. Your next report could save a life.
          </p>
          <button 
            onClick={() => navigate("/report")}
            className="px-8 py-3 bg-white text-[#0066cc] font-bold rounded-full hover:bg-blue-50 transition shadow-lg"
          >
            Report Another Animal
          </button>
        </div>
      )}
    </div>
  );
}