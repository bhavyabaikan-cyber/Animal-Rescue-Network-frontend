import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { loadingClass, emptyStateClass } from "../styles/common";

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/donor-api/my-donations");
        setData(res.data.payload);
      } catch (err) {
        console.error("Donor fetch error:", err);
        toast.error("Failed to load donation data");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "DONOR") fetchData();
  }, [user]);

  if (loading) return <p className={loadingClass}>Loading your donations...</p>;
  if (!data) return <p className="text-center py-20 text-[#6e6e73]">No data available</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 sm:p-12 text-white mb-8 shadow-lg">
        <div className="relative z-10">
          <p className="text-blue-100 text-sm mb-2">Thank you for your generosity,</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{user.firstName || 'Donor'}</h1>
          <p className="text-blue-100 text-lg max-w-2xl">Your contributions are making a real difference in animals' lives.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Total Donated</p>
          <p className="text-3xl font-bold text-[#34c759]">₹{data.totalDonated.toLocaleString()}</p>
          <p className="text-xs text-[#a1a1a6] mt-2">Your lifetime contribution</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Cases Funded</p>
          <p className="text-3xl font-bold text-[#0066cc]">{data.casesFunded}</p>
          <p className="text-xs text-[#a1a1a6] mt-2">Animals you've helped</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Total Donations</p>
          <p className="text-3xl font-bold text-purple-600">{data.donations?.reduce((sum, d) => sum + (d.myDonations?.length || 0), 0) || 0}</p>
          <p className="text-xs text-[#a1a1a6] mt-2">Individual transactions</p>
        </div>
      </div>

      {/* Donation History Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f]">My Donation History</h2>
          <p className="text-sm text-[#6e6e73] mt-1">Track all your contributions and their impact</p>
        </div>
        <button onClick={() => navigate("/donate")} className="px-4 py-2 bg-[#34c759] hover:bg-[#28a745] text-white text-sm font-semibold rounded-lg transition">
          Make New Donation
        </button>
      </div>

      {/* Empty State */}
      {data.donations?.length === 0 ? (
        <div className={`${emptyStateClass} py-20 bg-white rounded-2xl border border-[#e8e8ed]`}>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No donations yet</h3>
          <p className="text-[#6e6e73] mb-6 max-w-md mx-auto">You haven't made any donations yet. Start helping animals today!</p>
          <button 
            onClick={() => navigate("/donate")} 
            className="px-6 py-3 bg-[#34c759] hover:bg-[#28a745] text-white font-semibold rounded-xl transition shadow-sm"
          >
            Make Your First Donation
          </button>
        </div>
      ) : (
        /* Donation Cards */
        <div className="grid gap-6">
          {data.donations?.map((animal) => (
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
                      <p className="text-sm text-[#6e6e73]">{animal.species} • {animal.location?.address || "Unknown location"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      animal.status === "Adopted" ? "bg-gray-100 text-gray-800" :
                      animal.status === "Rescued" ? "bg-emerald-100 text-emerald-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {animal.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[#1d1d1f] mb-4 line-clamp-2">{animal.description}</p>
                  
                  {/* My Donations for this animal */}
                  <div className="space-y-2 mb-4">
                    {animal.myDonations?.map((donation, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#e8e8ed]">
                        <div>
                          <p className="text-sm font-semibold text-[#1d1d1f]">₹{donation.amount}</p>
                          <p className="text-xs text-[#6e6e73]">{donation.message || "General support"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#a1a1a6]">{new Date(donation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-[#34c759] font-medium">Completed</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/case/${animal._id}`)}
                      className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-sm font-semibold rounded-lg transition border border-[#e8e8ed]"
                    >
                      View Case Details
                    </button>
                    <button 
                      onClick={() => navigate(`/donate?animalId=${animal._id}`)}
                      className="px-4 py-2 bg-[#34c759] hover:bg-[#28a745] text-white text-sm font-semibold rounded-lg transition"
                    >
                      Donate Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Impact Summary */}
      {data.donations?.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-[#34c759] to-[#28a745] rounded-3xl p-8 sm:p-12 text-white text-center shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">Your Impact Matters</h3>
          <p className="text-green-50 mb-6 max-w-2xl mx-auto">
            Every rupee you donate directly helps provide food, medical care, and shelter to animals in need.
          </p>
          <button 
            onClick={() => navigate("/donate")}
            className="px-8 py-3 bg-white text-[#34c759] font-bold rounded-full hover:bg-green-50 transition shadow-lg"
          >
            Continue Supporting
          </button>
        </div>
      )}
    </div>
  );
}