import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import RoleUpgradePrompt from "./RoleUpgradePrompt";

export default function VolunteerPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCases, setPendingCases] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [completedCases, setCompletedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending, active, completed
  const [selectedCase, setSelectedCase] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: "", description: "", image: null });
  const [receipts, setReceipts] = useState([]);
  const [processing, setProcessing] = useState(false);

  // ✅ Role Check
  if (user && user.role !== "VOLUNTEER") {
    return <RoleUpgradePrompt targetRole="VOLUNTEER" featureName="Volunteer Portal" />;
  }

  useEffect(() => {
    fetchAllCases();
  }, []);

  const fetchAllCases = async () => {
    try {
      setLoading(true);
      const [pendingRes, myCasesRes, completedRes] = await Promise.all([
        api.get("/volunteer-api/pending"),
        api.get("/volunteer-api/my-cases"),
        api.get("/volunteer-api/completed-cases")
      ]);
      setPendingCases(pendingRes.data.payload || []);
      setMyCases(myCasesRes.data.payload || []);
      setCompletedCases(completedRes.data.payload || []);
    } catch (err) {
      console.error("Failed to fetch cases:", err);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (animalId) => {
    try {
      setProcessing(true);
      await api.put(`/volunteer-api/accept/${animalId}`);
      toast.success("Case accepted successfully");
      fetchAllCases(); // Refresh all lists
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept case");
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    const formData = new FormData();
    formData.append("status", statusUpdate.status);
    formData.append("description", statusUpdate.description);
    if (statusUpdate.image) formData.append("rescueImage", statusUpdate.image);

    try {
      setProcessing(true);
      await api.put(`/volunteer-api/update-status/${selectedCase._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Status updated successfully");
      setSelectedCase(null);
      setStatusUpdate({ status: "", description: "", image: null });
      fetchAllCases();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setProcessing(false);
    }
  };

  const handleReceiptUpload = async (animalId) => {
    if (receipts.length === 0) {
      toast.error("Please select at least one receipt");
      return;
    }

    const formData = new FormData();
    receipts.forEach((file, index) => {
      formData.append("receipts", file);
      formData.append(`titles`, `Expense ${index + 1}`);
    });

    try {
      setProcessing(true);
      await api.post(`/volunteer-api/receipts/${animalId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Receipts uploaded successfully");
      setReceipts([]);
      setSelectedCase(null);
    } catch (err) {
      toast.error("Failed to upload receipts");
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteAdoption = async (animalId) => {
    try {
      setProcessing(true);
      await api.post(`/volunteer-api/animals/${animalId}/complete-adoption`);
      toast.success("Adoption completed successfully!");
      fetchAllCases();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete adoption");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ NEW: Approve Adoption Application
  const handleApproveAdoption = async (animalId) => {
    if (!window.confirm("Accept this adoption application? The animal will be marked as Adopted.")) return;
    try {
      setProcessing(true);
      await api.post(`/volunteer-api/approve-adoption/${animalId}`);
      toast.success("Adoption approved! 🎉");
      fetchAllCases();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve adoption");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ NEW: Reject Adoption Application
  const handleRejectAdoption = async (animalId) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return; // User cancelled
    
    try {
      setProcessing(true);
      await api.post(`/volunteer-api/reject-adoption/${animalId}`, { reason });
      toast.success("Adoption application rejected");
      fetchAllCases();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject adoption");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
  const badges = {
    // Regular statuses
    "In Transit": "bg-blue-100 text-blue-800 border border-blue-200",
    "Rescued": "bg-emerald-100 text-emerald-800 border border-emerald-200",
    "Adoption Pending": "bg-purple-100 text-purple-800 border border-purple-200",
    "Adopted": "bg-gray-100 text-gray-800 border border-gray-200",
    
    // Lost case statuses
    "Found": "bg-blue-100 text-blue-800 border border-blue-200",
    "Owner Contacted": "bg-indigo-100 text-indigo-800 border border-indigo-200",
    "Met Owner": "bg-cyan-100 text-cyan-800 border border-cyan-200",
    "Reunited with Owner": "bg-emerald-100 text-emerald-800 border border-emerald-200",
    "Still Missing": "bg-red-100 text-red-800 border border-red-200"
  };
  return badges[status] || "bg-gray-100 text-gray-800";
};

  if (loading) return <p className="text-center py-20 text-[#6e6e73]">Loading volunteer cases...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f]">Volunteer Portal</h1>
        <p className="text-[#6e6e73] mt-1">Manage your rescue cases and updates.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Pending Cases</p>
          <p className="text-3xl font-bold text-amber-600">{pendingCases.length}</p>
          <p className="text-xs text-[#a1a1a6] mt-1">Available to accept</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">My Active Cases</p>
          <p className="text-3xl font-bold text-[#0066cc]">{myCases.length}</p>
          <p className="text-xs text-[#a1a1a6] mt-1">Currently working on</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73] mb-1">Completed</p>
          <p className="text-3xl font-bold text-emerald-600">{completedCases.length}</p>
          <p className="text-xs text-[#a1a1a6] mt-1">Successfully adopted</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#e8e8ed]">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition ${
              activeTab === "pending"
                ? "bg-[#f5f5f7] text-[#0066cc] border-b-2 border-[#0066cc]"
                : "text-[#6e6e73] hover:bg-[#f8f9fa]"
            }`}
          >
            Pending Cases ({pendingCases.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition ${
              activeTab === "active"
                ? "bg-[#f5f5f7] text-[#0066cc] border-b-2 border-[#0066cc]"
                : "text-[#6e6e73] hover:bg-[#f8f9fa]"
            }`}
          >
            My Active Cases ({myCases.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition ${
              activeTab === "completed"
                ? "bg-[#f5f5f7] text-[#0066cc] border-b-2 border-[#0066cc]"
                : "text-[#6e6e73] hover:bg-[#f8f9fa]"
            }`}
          >
            Completed ({completedCases.length})
          </button>
        </div>

        {/* Pending Cases Tab */}
        {activeTab === "pending" && (
          <div className="p-6">
            {pendingCases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📋</p>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No pending cases</h3>
                <p className="text-[#6e6e73]">Great job! There are no pending cases waiting for a volunteer.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingCases.map((animal) => (
                  <div key={animal._id} className="bg-[#f8f9fa] rounded-xl border border-[#e8e8ed] p-5">
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="w-full md:w-40 h-40 bg-[#f5f5f7] rounded-lg overflow-hidden flex-shrink-0">
                        {animal.imageUrl ? (
                          <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-[#a1a1a6]">🐾</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-[#1d1d1f]">{animal.name || "Unnamed"}</h3>
                            <p className="text-sm text-[#6e6e73]">{animal.species} • {animal.location?.address || "Unknown"}</p>
                          </div>
                          {animal.urgency && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-200">
                              URGENT
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-[#1d1d1f] mb-4 line-clamp-2">{animal.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => handleAccept(animal._id)}
                            disabled={processing}
                            className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                          >
                            Accept Case
                          </button>
                          <button 
                            onClick={() => navigate(`/case/${animal._id}`)}
                            className="px-4 py-2 bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-sm font-semibold rounded-lg transition border border-[#e8e8ed]"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Active Cases Tab */}
        {activeTab === "active" && (
          <div className="p-6">
            {myCases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📭</p>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No active cases</h3>
                <p className="text-[#6e6e73]">You haven't accepted any cases yet. Check the "Pending Cases" tab to get started!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {myCases.map((animal) => (
                  <div key={animal._id} className="bg-[#f8f9fa] rounded-xl border border-[#e8e8ed] p-5">
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="w-full md:w-40 h-40 bg-[#f5f5f7] rounded-lg overflow-hidden flex-shrink-0">
                        {animal.imageUrl ? (
                          <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-[#a1a1a6]">🐾</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-[#1d1d1f]">{animal.name || "Unnamed"}</h3>
                            <p className="text-sm text-[#6e6e73]">{animal.species} • {animal.location?.address || "Unknown"}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(animal.status)}`}>
                            {animal.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-[#1d1d1f] mb-4 line-clamp-2">{animal.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* ✅ NEW: Adoption Approval Buttons (if there's a pending application) */}
                          {animal.adoption?.applicant && animal.adoption.status === "Pending" ? (
                            <>
                              <button 
                                onClick={() => handleApproveAdoption(animal._id)}
                                disabled={processing}
                                className="px-4 py-2 bg-[#34c759] hover:bg-[#28a745] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                              >
                                ✓ Accept Adoption
                              </button>
                              <button 
                                onClick={() => handleRejectAdoption(animal._id)}
                                disabled={processing}
                                className="px-4 py-2 bg-[#ff3b30] hover:bg-[#d62c23] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                              >
                                ✕ Reject
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => setSelectedCase(animal)}
                                className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition"
                              >
                                Update Status
                              </button>
                              <button 
                                onClick={() => navigate(`/case/${animal._id}`)}
                                className="px-4 py-2 bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-sm font-semibold rounded-lg transition border border-[#e8e8ed]"
                              >
                                View Details
                              </button>
                              {animal.status === "Rescued" && (
                                <button 
                                  onClick={() => handleCompleteAdoption(animal._id)}
                                  disabled={processing}
                                  className="px-4 py-2 bg-[#34c759] hover:bg-[#28a745] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                  Mark as Adopted
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Cases Tab */}
        {activeTab === "completed" && (
          <div className="p-6">
            {completedCases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🎉</p>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No completed cases yet</h3>
                <p className="text-[#6e6e73]">Keep up the great work! Your completed adoptions will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {completedCases.map((animal) => (
                  <div key={animal._id} className="bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] p-5">
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="w-full md:w-40 h-40 bg-[#f5f5f7] rounded-lg overflow-hidden flex-shrink-0">
                        {animal.imageUrl ? (
                          <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-[#a1a1a6]">🐾</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-[#1d1d1f]">{animal.name || "Unnamed"}</h3>
                            <p className="text-sm text-[#6e6e73]">{animal.species} • {animal.location?.address || "Unknown"}</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                            Adopted
                          </span>
                        </div>
                        
                        <p className="text-sm text-[#1d1d1f] mb-4 line-clamp-2">{animal.description}</p>
                        
                        {animal.adoption?.adoptionDate && (
                          <p className="text-xs text-[#6e6e73]">
                            Adopted on: {new Date(animal.adoption.adoptionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        
                        <button 
                          onClick={() => navigate(`/case/${animal._id}`)}
                          className="mt-3 px-4 py-2 bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-sm font-semibold rounded-lg transition border border-[#e8e8ed]"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
{selectedCase && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
      <h3 className="text-xl font-bold mb-4">Update Case Status</h3>
      <form onSubmit={handleStatusUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1">New Status</label>
          <select 
            value={statusUpdate.status} 
            onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
            className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
            required
          >
            <option value="">Select status</option>
            
            {/* ✅ Regular Case Statuses */}
            {selectedCase.caseType !== "Lost" && (
              <>
                <option value="In Transit">In Transit</option>
                <option value="Rescued">Rescued</option>
                <option value="Adoption Pending">Adoption Pending</option>
              </>
            )}
            
            {/* ✅ Lost/Missing Case Statuses */}
            {selectedCase.caseType === "Lost" && (
              <>
                <option value="Found">Found</option>
                <option value="Owner Contacted">Owner Contacted</option>
                <option value="Met Owner">Met Owner</option>
                <option value="Reunited with Owner">Reunited with Owner</option>
                <option value="Still Missing">Still Missing</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Notes / Description</label>
          <textarea 
            value={statusUpdate.description}
            onChange={(e) => setStatusUpdate({...statusUpdate, description: e.target.value})}
            className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
            rows="3"
            placeholder="Add any relevant details..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Upload Photo (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setStatusUpdate({...statusUpdate, image: e.target.files[0]})}
            className="w-full text-sm text-[#6e6e73] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f5f5f7] file:text-[#1d1d1f] hover:file:bg-[#e8e8ed]"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-[#0066cc] text-white font-semibold rounded-lg hover:bg-[#0052a3] disabled:opacity-50">
            {processing ? "Updating..." : "Update Status"}
          </button>
          <button type="button" onClick={() => setSelectedCase(null)} className="flex-1 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] font-semibold rounded-lg hover:bg-[#e8e8ed]">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}