import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { loadingClass, emptyStateClass } from "../styles/common";

export default function AdopterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/adopter-api/my-applications");
        setApplications(res.data.payload || []);
      } catch (err) {
        console.error("Adopter fetch error:", err);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "ADOPTER") fetchApplications();
  }, [user]);

  if (loading) return <p className={loadingClass}>Loading your applications...</p>;

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-amber-100 text-amber-800 border border-amber-200",
      Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      Rejected: "bg-red-100 text-red-800 border border-red-200",
      Adopted: "bg-purple-100 text-purple-800 border border-purple-200"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 sm:p-12 text-white mb-8 shadow-lg">
        <div className="relative z-10">
          <p className="text-blue-100 text-sm mb-2">Welcome,</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{user.firstName || 'Adopter'}</h1>
          <p className="text-blue-100 text-lg max-w-2xl">Track your adoption applications and find your perfect companion.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{applications.length}</p>
          <p className="text-xs text-[#a1a1a6] mt-2">Submitted applications</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-amber-600">{applications.filter(a => a.adoption?.status === "Pending").length}</p>
          <p className="text-xs text-[#a1a1a6] mt-2">Awaiting decision</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Approved</p>
          <p className="text-3xl font-bold text-emerald-600">{applications.filter(a => a.adoption?.status === "Approved" || a.status === "Adopted").length}</p>
          <p className="text-xs text-[#a1a1a6] mt-2">Successful adoptions</p>
        </div>
      </div>

      {/* Applications Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f]">My Adoption Applications</h2>
          <p className="text-sm text-[#6e6e73] mt-1">Track the status of your adoption requests</p>
        </div>
        <button onClick={() => navigate("/cases?status=Adoption%20Pending")} className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition">
          Browse Animals
        </button>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className={`${emptyStateClass} py-20 bg-white rounded-2xl border border-[#e8e8ed]`}>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No applications yet</h3>
          <p className="text-[#6e6e73] mb-6 max-w-md mx-auto">You haven't submitted any adoption applications yet. Find your perfect companion today!</p>
          <button 
            onClick={() => navigate("/cases?status=Adoption%20Pending")} 
            className="px-6 py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold rounded-xl transition shadow-sm"
          >
            Browse Available Animals
          </button>
        </div>
      ) : (
        /* Applications Grid */
        <div className="grid gap-6">
          {applications.map((animal) => (
            <div key={animal._id} className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-48 h-48 bg-[#f5f5f7] rounded-xl overflow-hidden flex-shrink-0">
                  {animal.imageUrl ? (
                    <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-[#a1a1a6]">🐾</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#1d1d1f]">{animal.name || "Unnamed"}</h3>
                      <p className="text-sm text-[#6e6e73]">{animal.species} • {animal.breed || "Unknown breed"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(animal.adoption?.status || animal.status)}`}>
                      {animal.adoption?.status || animal.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[#1d1d1f] mb-4 line-clamp-2">{animal.description}</p>
                  
                  {/* Application Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#e8e8ed]">
                      <div>
                        <p className="text-xs text-[#a1a1a6]">Applied on</p>
                        <p className="text-sm font-semibold text-[#1d1d1f]">
                          {new Date(animal.adoption?.applicationDate || animal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#a1a1a6]">Status</p>
                        <p className="text-sm font-semibold text-[#1d1d1f]">
                          {animal.adoption?.status === "Approved" ? "Approved" : 
                           animal.adoption?.status === "Rejected" ? "Not Selected" : 
                           animal.status === "Adopted" ? "Adopted" : "Under Review"}
                        </p>
                      </div>
                    </div>
                    
                    {animal.adoption?.handoffNotes && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-[#0066cc] font-semibold mb-1">Volunteer Notes:</p>
                        <p className="text-sm text-[#1d1d1f]">{animal.adoption.handoffNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/case/${animal._id}`)}
                      className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-sm font-semibold rounded-lg transition border border-[#e8e8ed]"
                    >
                      View Case Details
                    </button>
                    {animal.adoption?.status === "Approved" && (
                      <button 
                        onClick={() => navigate(`/messages`)}
                        className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition"
                      >
                        Contact Volunteer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {applications.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 sm:p-12 text-white text-center shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">Looking for Another Companion?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            There are many more animals waiting for their forever homes. Could you give one of them a chance?
          </p>
          <button 
            onClick={() => navigate("/cases?status=Adoption%20Pending")}
            className="px-8 py-3 bg-white text-[#0066cc] font-bold rounded-full hover:bg-blue-50 transition shadow-lg"
          >
            Browse More Animals
          </button>
        </div>
      )}
    </div>
  );
}