import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, articleCardClass, articleTitle, loadingClass, emptyStateClass, submitBtn, labelClass, inputClass } from "../styles/common";

export default function AdoptionReviews() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState({});

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/adopter-api/pending-reviews");
        setApplications(res.data.payload || []);
      } catch (err) {
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleReview = async (appId, status) => {
    try {
      await api.put(`/adopter-api/review/${appId}`, {
        status,
        reviewNotes: reviewNotes[appId] || ""
      });
      toast.success(`Application ${status.toLowerCase()} successfully!`);
      setApplications(prev => prev.filter(app => app._id !== appId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to review");
    }
  };

  if (loading) return <p className={loadingClass}>Loading applications...</p>;

  return (
    <div className={pageWrapper}>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">📋 Adoption Applications Review</h1>
      
      {applications.length === 0 ? (
        <div className={emptyStateClass}>
          <p className="text-4xl mb-3">✅</p>
          <p className="text-[#6e6e73]">No pending applications to review. Great job!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <div key={app._id} className={`${articleCardClass} p-6`}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-[#0066cc]/10 text-[#0066cc] text-xs font-bold rounded-full">NEW APPLICATION</span>
                    <span className="text-xs text-[#a1a1a6]">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className={articleTitle}>Application for: {app.animal?.name || "Unnamed"} ({app.animal?.species})</h3>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><strong className="text-[#1d1d1f]">Applicant:</strong> {app.applicant?.firstName || "User"} ({app.applicant?.email})</p>
                    <p><strong className="text-[#1d1d1f]">Housing:</strong> {app.housingType} {app.hasOtherPets ? "(Has other pets)" : "(No other pets)"}</p>
                    <p><strong className="text-[#1d1d1f]">Experience:</strong> {app.petExperience}</p>
                    <p><strong className="text-[#1d1d1f]">Reason:</strong> {app.reasonForAdoption}</p>
                  </div>
                </div>

                <div className="md:w-80 flex-shrink-0 bg-[#f8f9fa] p-4 rounded-xl border border-[#e8e8ed]">
                  <h4 className="font-semibold text-[#1d1d1f] mb-3">Review Decision</h4>
                  <label className={labelClass}>Notes for Applicant (Optional)</label>
                  <textarea 
                    value={reviewNotes[app._id] || ""}
                    onChange={(e) => setReviewNotes({...reviewNotes, [app._id]: e.target.value})}
                    className={`${inputClass} mb-4`} 
                    rows="3" 
                    placeholder="e.g., Please schedule a home visit..." 
                  />
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleReview(app._id, "Approved")} className={`${submitBtn} bg-[#34c759] hover:bg-[#248a3d]`}>
                      ✅ Approve Application
                    </button>
                    <button onClick={() => handleReview(app._id, "Rejected")} className="w-full py-2.5 bg-[#ff3b30] text-white font-medium rounded-xl hover:bg-[#d62c23] transition">
                      ❌ Reject Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}