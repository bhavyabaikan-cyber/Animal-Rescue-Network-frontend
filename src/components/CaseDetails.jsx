import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, loadingClass } from "../styles/common";

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const showApplicationOnly = searchParams.get("review") === "application";

  // ✅ Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [animal, setAnimal] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [posting, setPosting] = useState(false);
  
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [adoptionForm, setAdoptionForm] = useState({
    message: "",
    experience: "",
    livingSituation: "",
    otherPets: ""
  });
  const [applying, setApplying] = useState(false);
  
  const [applicantInfo, setApplicantInfo] = useState(null);

  useEffect(() => {
    fetchAnimal();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (animal?.adoption?.applicant) {
      fetchApplicantInfo();
    }
  }, [animal]);

  const fetchAnimal = async () => {
    try {
      const res = await api.get(`/common-api/animals/${id}`);
      setAnimal(res.data.payload);
    } catch (err) {
      console.error("Failed to fetch animal:", err);
      toast.error("Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comment-api/animal/${id}`);
      setComments(res.data.payload || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const fetchApplicantInfo = async () => {
    try {
      const res = await api.get(`/user-api/profile/${animal.adoption.applicant}`);
      setApplicantInfo(res.data.payload);
    } catch (err) {
      console.error("Failed to fetch applicant info:", err);
    }
  };

  const handleHelpAction = async (actionType) => {
  if (!user) {
    window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
    return;
  }

  // ✅ If it's a share action, trigger the actual share dialog
  if (actionType === "share") {
    const shareData = {
      title: `Help ${animal.name || "this animal"} - Animal Rescue Network`,
      text: `${animal.species} ${animal.breed ? `- ${animal.breed}` : ""} needs help! ${animal.description?.substring(0, 100)}...`,
      url: window.location.href
    };

    // ✅ Try native share API (works on mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Record the share action in backend
        await api.post("/common-api/help-action", { animalId: id, actionType });
        toast.success("Thanks for sharing! 🙏");
        fetchAnimal();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Share failed:", err);
          // Fallback: Open WhatsApp directly
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
          window.open(whatsappUrl, '_blank');
          await api.post("/common-api/help-action", { animalId: id, actionType });
          toast.success("Shared on WhatsApp! 💚");
          fetchAnimal();
        }
      }
    } else {
      // ✅ Fallback for desktop: Open WhatsApp directly
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
      window.open(whatsappUrl, '_blank');
      await api.post("/common-api/help-action", { animalId: id, actionType });
      toast.success("Shared on WhatsApp! 💚");
      fetchAnimal();
    }
  } else {
    // For other actions (like, etc.)
    try {
      await api.post("/common-api/help-action", { animalId: id, actionType });
      toast.success(`${actionType} recorded! Thank you!`);
      fetchAnimal();
    } catch (err) {
      toast.error("Failed to record action");
    }
  }
};

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to comment");
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
      return;
    }
    
    if (!newComment.trim() && !commentImage) {
      toast.error("Please write a comment or upload an image");
      return;
    }

    setPosting(true);
    
    try {
      const formData = new FormData();
      formData.append("text", newComment.trim());
      if (commentImage) {
        formData.append("image", commentImage);
      }

      const res = await api.post(`/comment-api/animal/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setNewComment("");
      setCommentImage(null);
      toast.success("Comment added!");
      fetchComments();
    } catch (err) {
      console.error("❌ Comment error:", err);
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
      return;
    }
    try {
      const res = await api.post(`/comment-api/${commentId}/like`);
      setComments(comments.map(c => 
        c._id === commentId 
          ? { ...c, likeCount: res.data.payload.likeCount, isLikedByMe: res.data.payload.isLikedByMe }
          : c
      ));
    } catch (err) {
      toast.error("Failed to like");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comment-api/${commentId}`);
      toast.success("Comment deleted");
      fetchComments();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleAdoptionSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
      return;
    }

    setApplying(true);
    try {
      await api.post(`/adopter-api/apply/${id}`, adoptionForm);
      toast.success("Adoption application submitted successfully!");
      setShowAdoptionModal(false);
      setAdoptionForm({ message: "", experience: "", livingSituation: "", otherPets: "" });
      fetchAnimal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const handleApproveAdoption = async () => {
    if (!window.confirm("Approve this adoption application?")) return;
    try {
      await api.post(`/volunteer-api/approve-adoption/${id}`);
      toast.success("Adoption approved! 🎉");
      fetchAnimal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleRejectAdoption = async () => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return;
    
    try {
      await api.post(`/volunteer-api/reject-adoption/${id}`, { reason });
      toast.success("Adoption rejected");
      fetchAnimal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  const handleMessageVolunteer = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
      return;
    }
    if (!animal.assignedVolunteer) return;

    try {
      toast.loading("Opening chat...");
      
      const volunteerId = typeof animal.assignedVolunteer === 'object' 
        ? animal.assignedVolunteer._id 
        : animal.assignedVolunteer;

      const res = await api.post("/message-api/conversations", {
        otherUserId: volunteerId,
        animalId: animal._id
      });
      
      toast.dismiss();
      const convId = res.data.payload._id;
      navigate(`/messages/${convId}`);
    } catch (err) {
      toast.dismiss();
      console.error("Failed to open chat:", err);
      toast.error("Failed to open chat with volunteer");
    }
  };

  // ✅ Check if current user is the reporter
  const isReporter = () => {
    if (!user || user.role !== "REPORTER") return false;
    const reporterId = typeof animal.reportedBy === 'object' 
      ? animal.reportedBy._id 
      : animal.reportedBy;
    return reporterId === user.id;
  };

  // ✅ Open edit modal with pre-filled data
  const handleOpenEdit = () => {
    setEditForm({
      name: animal.name || "",
      species: animal.species || "",
      breed: animal.breed || "",
      description: animal.description || "",
      urgency: animal.urgency ? "true" : "false",
      caseType: animal.caseType || "Stray",
      address: animal.location?.address || "",
      latitude: animal.location?.coordinates?.coordinates?.[1] || "",
      longitude: animal.location?.coordinates?.coordinates?.[0] || ""
    });
    setEditImage(null);
    setShowEditModal(true);
  };

  // ✅ Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("species", editForm.species);
      formData.append("breed", editForm.breed);
      formData.append("description", editForm.description);
      formData.append("urgency", editForm.urgency);
      formData.append("caseType", editForm.caseType);
      formData.append("address", editForm.address);
      if (editForm.latitude) formData.append("latitude", editForm.latitude);
      if (editForm.longitude) formData.append("longitude", editForm.longitude);
      if (editImage) formData.append("image", editImage);

      await api.put(`/reporter-api/report/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Report updated successfully! ✏️");
      setShowEditModal(false);
      fetchAnimal();
    } catch (err) {
      console.error("Edit error:", err);
      toast.error(err.response?.data?.message || "Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete report
  const handleDeleteReport = async () => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/reporter-api/report/${id}`);
      toast.success("Report deleted successfully!");
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete report");
    }
  };

  const canApplyForAdoption = () => {
    if (!user || user.role !== "ADOPTER") return false;
    if (animal.status !== "Adoption Pending" && animal.status !== "Rescued") return false;
    if (animal.adoption?.applicant) return false;
    if (animal.caseType === "Lost") return false; 
    return true;
  };

  const hasAlreadyApplied = () => {
    return animal?.adoption?.applicant === user?.id;
  };

  const isVolunteerViewingApplication = () => {
    return user?.role === "VOLUNTEER" && animal?.adoption?.applicant && animal.adoption.status === "Pending";
  };

  if (loading) return <p className={loadingClass}>Loading case details...</p>;
  if (!animal) {
    return (
      <div className={pageWrapper}>
        <div className="bg-white rounded-2xl p-12 border border-[#e8e8ed] shadow-sm text-center max-w-2xl mx-auto">
          <p className="text-6xl mb-4">😕</p>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Case Not Found</h3>
          <p className="text-[#6e6e73] mb-6">This case might have been removed or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#0066cc] text-white font-semibold rounded-lg hover:bg-[#0052a3] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageWrapper}>
      {showApplicationOnly ? (
        <>
          <div className="mb-6">
            <button 
              onClick={() => navigate(`/case/${id}`)}
              className="flex items-center gap-2 text-[#0066cc] hover:text-[#0052a3] font-semibold mb-4 transition"
            >
              ← Back to Case Details
            </button>
          </div>

          {isVolunteerViewingApplication() && applicantInfo ? (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-lg p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-[#1d1d1f] flex items-center gap-3">
                  🏠 Review Adoption Application
                </h1>
                <span className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-bold rounded-full">
                  PENDING REVIEW
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 mb-6 border border-[#e8e8ed]">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#f5f5f7] flex-shrink-0">
                    {animal.imageUrl ? (
                      <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1d1d1f]">{animal.name || "Unnamed"}</h3>
                    <p className="text-[#6e6e73]">{animal.species} {animal.breed && `• ${animal.breed}`}</p>
                    <p className="text-sm text-[#a1a1a6] mt-1">📍 {animal.location?.address || "Unknown location"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6 border border-[#e8e8ed]">
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">👤 Applicant Information</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-2xl">
                    {applicantInfo.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#1d1d1f]">{applicantInfo.firstName} {applicantInfo.lastName}</p>
                    <p className="text-[#6e6e73]">{applicantInfo.email}</p>
                    <p className="text-sm text-[#a1a1a6] mt-1">
                      Applied on {new Date(animal.adoption.applicationDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-[#1d1d1f]">Application Details</h3>
                {animal.adoption.message && (
                  <div className="bg-white rounded-xl p-5 border border-[#e8e8ed]">
                    <p className="text-xs font-bold text-[#6e6e73] uppercase tracking-wider mb-2">Why they want to adopt:</p>
                    <p className="text-[#1d1d1f] leading-relaxed">{animal.adoption.message}</p>
                  </div>
                )}
                {animal.adoption.experience && (
                  <div className="bg-white rounded-xl p-5 border border-[#e8e8ed]">
                    <p className="text-xs font-bold text-[#6e6e73] uppercase tracking-wider mb-2">Experience with animals:</p>
                    <p className="text-[#1d1d1f] leading-relaxed">{animal.adoption.experience}</p>
                  </div>
                )}
                {animal.adoption.livingSituation && (
                  <div className="bg-white rounded-xl p-5 border border-[#e8e8ed]">
                    <p className="text-xs font-bold text-[#6e6e73] uppercase tracking-wider mb-2">Living situation:</p>
                    <p className="text-[#1d1d1f] leading-relaxed">{animal.adoption.livingSituation}</p>
                  </div>
                )}
                {animal.adoption.otherPets && (
                  <div className="bg-white rounded-xl p-5 border border-[#e8e8ed]">
                    <p className="text-xs font-bold text-[#6e6e73] uppercase tracking-wider mb-2">Other pets at home:</p>
                    <p className="text-[#1d1d1f] leading-relaxed">{animal.adoption.otherPets}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#e8e8ed]">
                <button
                  onClick={handleApproveAdoption}
                  className="flex-1 px-8 py-4 bg-[#34c759] hover:bg-[#28a745] text-white font-bold text-lg rounded-xl transition shadow-lg hover:shadow-xl"
                >
                  ✓ Approve Adoption
                </button>
                <button
                  onClick={handleRejectAdoption}
                  className="flex-1 px-8 py-4 bg-[#ff3b30] hover:bg-[#d62c23] text-white font-bold text-lg rounded-xl transition shadow-lg hover:shadow-xl"
                >
                  ✕ Reject Application
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-[#e8e8ed] shadow-sm text-center max-w-2xl mx-auto">
              <p className="text-6xl mb-4">❓</p>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No Application Found</h3>
              <p className="text-[#6e6e73] mb-4">There's no pending application to review for this case.</p>
              <button 
                onClick={() => navigate(`/case/${id}`)}
                className="px-6 py-3 bg-[#0066cc] text-white font-semibold rounded-lg hover:bg-[#0052a3] transition"
              >
                View Case Details
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden mb-6">
            <div className="md:flex">
              <div className="md:w-1/2 h-64 md:h-auto bg-[#f5f5f7]">
                {animal.imageUrl ? (
                  <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-[#a1a1a6]">🐾</div>
                )}
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[#1d1d1f] mb-1">{animal.name || "Unnamed"}</h1>
                    <p className="text-[#6e6e73]">{animal.species} {animal.breed && `• ${animal.breed}`}</p>
                    {animal.caseType === "Lost" && (
                      <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        🐾 Lost Pet - Owner Looking
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    animal.status === "Adopted" ? "bg-emerald-100 text-emerald-800" :
                    animal.status === "Rescued" ? "bg-blue-100 text-blue-800" :
                    animal.status === "Adoption Pending" ? "bg-purple-100 text-purple-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {animal.status}
                  </span>
                </div>

                <p className="text-[#1d1d1f] mb-4 leading-relaxed">{animal.description}</p>

                <div className="space-y-2 text-sm text-[#6e6e73] mb-6">
                  <p>📍 <strong>Location:</strong> {animal.location?.address || "Unknown"}</p>
                  <p>👤 <strong>Reported by:</strong> {animal.reportedBy?.firstName || "Anonymous"}</p>
                  {animal.assignedVolunteer && (
                    <p>🦸 <strong>Volunteer:</strong> {typeof animal.assignedVolunteer === 'object' ? animal.assignedVolunteer.firstName : "Assigned"}</p>
                  )}
                  <p>📅 <strong>Date:</strong> {new Date(animal.createdAt).toLocaleDateString('en-IN')}</p>
                </div>

                {/* ✅ Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  
                  {/* ✅ Edit Button - Only for the reporter */}
                  {isReporter() && (
                    <button
                      onClick={handleOpenEdit}
                      className="px-4 py-2 bg-[#5856d6] hover:bg-[#4a48c4] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
                    >
                      ✏️ Edit Report
                    </button>
                  )}

                  {/* ✅ Delete Button - Only for the reporter (only if status is Pending) */}
                  {isReporter() && animal.status === "Pending" && (
                    <button
                      onClick={handleDeleteReport}
                      className="px-4 py-2 bg-[#ff3b30] hover:bg-[#d62c23] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
                    >
                      🗑️ Delete Report
                    </button>
                  )}

                  {/* ✅ Contact button for Lost Pets */}
                  {animal.caseType === "Lost" && (
                    <button
                      onClick={() => toast.info("Please contact the reporter or local authorities to verify ownership.")}
                      className="px-4 py-2 bg-[#ff9500] hover:bg-[#e08500] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
                    >
                      🐾 I am the Owner / Found this Pet
                    </button>
                  )}

                  {/* ✅ Donate Button for Donors */}
                  {user?.role === "DONOR" && (
                    <button
                      onClick={() => navigate('/donate')}
                      className="px-4 py-2 bg-[#ff9500] hover:bg-[#e08500] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 shadow-sm"
                    >
                      💰 Donate to this Case
                    </button>
                  )}

                  {/* Message Volunteer Button */}
                  {animal.assignedVolunteer && user?.id !== (typeof animal.assignedVolunteer === 'object' ? animal.assignedVolunteer._id : animal.assignedVolunteer) && (
                    <button
                      onClick={handleMessageVolunteer}
                      className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
                    >
                      💬 Message Volunteer
                    </button>
                  )}

                  {canApplyForAdoption() && (
                    <button
                      onClick={() => setShowAdoptionModal(true)}
                      className="px-4 py-2 bg-[#34c759] hover:bg-[#28a745] text-white text-sm font-semibold rounded-lg transition"
                    >
                      🏠 Apply for Adoption
                    </button>
                  )}
                  {hasAlreadyApplied() && (
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-lg">
                      ✓ Application Submitted
                    </span>
                  )}
                  {user?.role === "VOLUNTEER" && animal.status === "Pending" && (
                    <button
                      onClick={() => navigate("/volunteer")}
                      className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition"
                    >
                      Accept Case
                    </button>
                  )}
                  <button onClick={() => handleHelpAction("share")} className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-sm font-semibold rounded-lg transition border border-[#e8e8ed]">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isVolunteerViewingApplication() && applicantInfo && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#1d1d1f] flex items-center gap-2">
                  🏠 Adoption Application
                </h2>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  PENDING REVIEW
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 mb-4 border border-[#e8e8ed]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-lg">
                    {applicantInfo.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-[#1d1d1f]">{applicantInfo.firstName} {applicantInfo.lastName}</p>
                    <p className="text-sm text-[#6e6e73]">{applicantInfo.email}</p>
                    <p className="text-xs text-[#a1a1a6]">Applied on {new Date(animal.adoption.applicationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {animal.adoption.message && (
                  <div className="bg-white rounded-xl p-4 border border-[#e8e8ed]">
                    <p className="text-xs font-semibold text-[#6e6e73] uppercase mb-1">Why they want to adopt:</p>
                    <p className="text-[#1d1d1f]">{animal.adoption.message}</p>
                  </div>
                )}
                {animal.adoption.experience && (
                  <div className="bg-white rounded-xl p-4 border border-[#e8e8ed]">
                    <p className="text-xs font-semibold text-[#6e6e73] uppercase mb-1">Experience with animals:</p>
                    <p className="text-[#1d1d1f]">{animal.adoption.experience}</p>
                  </div>
                )}
                {animal.adoption.livingSituation && (
                  <div className="bg-white rounded-xl p-4 border border-[#e8e8ed]">
                    <p className="text-xs font-semibold text-[#6e6e73] uppercase mb-1">Living situation:</p>
                    <p className="text-[#1d1d1f]">{animal.adoption.livingSituation}</p>
                  </div>
                )}
                {animal.adoption.otherPets && (
                  <div className="bg-white rounded-xl p-4 border border-[#e8e8ed]">
                    <p className="text-xs font-semibold text-[#6e6e73] uppercase mb-1">Other pets:</p>
                    <p className="text-[#1d1d1f]">{animal.adoption.otherPets}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApproveAdoption}
                  className="flex-1 px-6 py-3 bg-[#34c759] hover:bg-[#28a745] text-white font-semibold rounded-lg transition shadow-md"
                >
                  ✓ Approve Adoption
                </button>
                <button
                  onClick={handleRejectAdoption}
                  className="flex-1 px-6 py-3 bg-[#ff3b30] hover:bg-[#d62c23] text-white font-semibold rounded-lg transition shadow-md"
                >
                  ✕ Reject Application
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Comments ({comments.length})</h2>

            <form onSubmit={handleCommentSubmit} className="mb-6 pb-6 border-b border-[#e8e8ed]">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Share your thoughts..." : "Login to comment"}
                disabled={!user}
                className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc] resize-none mb-3"
                rows="3"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="comment-image"
                    className="hidden"
                    onChange={(e) => setCommentImage(e.target.files[0])}
                  />
                  <label htmlFor="comment-image" className="cursor-pointer px-3 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] text-sm rounded-lg transition border border-[#e8e8ed]">
                    📎 Photo
                  </label>
                  {commentImage && (
                    <span className="text-xs text-[#6e6e73]">{commentImage.name}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={posting || (!newComment.trim() && !commentImage)}
                  className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

            {comments.length === 0 ? (
              <p className="text-center py-8 text-[#6e6e73]">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {c.user?.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 bg-[#f8f9fa] rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-[#1d1d1f] text-sm">{c.user?.firstName} {c.user?.lastName}</p>
                          <p className="text-xs text-[#a1a1a6]">{new Date(c.createdAt).toLocaleString()}</p>
                        </div>
                        {user && (c.userId === user.id || user.role === "ADMIN") && (
                          <button onClick={() => handleDeleteComment(c._id)} className="text-[#a1a1a6] hover:text-[#ff3b30] text-sm">✕</button>
                        )}
                      </div>
                      <p className="text-[#1d1d1f] text-sm mb-2">{c.text}</p>
                      {c.imageUrl && (
                        <img src={c.imageUrl} alt="Comment" className="rounded-lg max-w-xs mb-2" />
                      )}
                      <button
                        onClick={() => handleLike(c._id)}
                        className={`flex items-center gap-1 text-xs ${c.isLikedByMe ? 'text-red-500' : 'text-[#6e6e73]'} hover:text-red-500 transition`}
                      >
                        {c.isLikedByMe ? '❤️' : '🤍'} {c.likeCount || 0}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ✅ Edit Report Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#1d1d1f]">✏️ Edit Report</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-[#a1a1a6] hover:text-[#1d1d1f] text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                You're updating the report for <strong>{animal.name || "this animal"}</strong>.
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Animal's name"
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Species *</label>
                  <input
                    type="text"
                    value={editForm.species}
                    onChange={(e) => setEditForm({...editForm, species: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Breed</label>
                <input
                  type="text"
                  value={editForm.breed}
                  onChange={(e) => setEditForm({...editForm, breed: e.target.value})}
                  placeholder="Breed (optional)"
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Case Type</label>
                  <select
                    value={editForm.caseType}
                    onChange={(e) => setEditForm({...editForm, caseType: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  >
                    <option value="Stray">Stray Animal</option>
                    <option value="Lost">Lost Pet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Urgent?</label>
                  <select
                    value={editForm.urgency}
                    onChange={(e) => setEditForm({...editForm, urgency: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes - Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Address *</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Latitude (optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.latitude}
                    onChange={(e) => setEditForm({...editForm, latitude: e.target.value})}
                    placeholder="e.g., 17.385"
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Longitude (optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.longitude}
                    onChange={(e) => setEditForm({...editForm, longitude: e.target.value})}
                    placeholder="e.g., 78.486"
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Replace Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg"
                />
                {editImage && (
                  <p className="text-xs text-[#6e6e73] mt-1">New image: {editImage.name}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#5856d6] hover:bg-[#4a48c4] text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] font-semibold rounded-lg hover:bg-[#e8e8ed] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdoptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#1d1d1f]">Adoption Application</h3>
              <button onClick={() => setShowAdoptionModal(false)} className="text-[#a1a1a6] hover:text-[#1d1d1f] text-2xl">×</button>
            </div>
            
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 mb-4">
              <p className="text-sm text-[#166534]">
                You're applying to adopt <strong>{animal.name || "this animal"}</strong>. Please fill out the form below.
              </p>
            </div>

            <form onSubmit={handleAdoptionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Why do you want to adopt? *</label>
                <textarea
                  value={adoptionForm.message}
                  onChange={(e) => setAdoptionForm({...adoptionForm, message: e.target.value})}
                  placeholder="Tell us why you'd be a great match..."
                  required
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Experience with Animals</label>
                <textarea
                  value={adoptionForm.experience}
                  onChange={(e) => setAdoptionForm({...adoptionForm, experience: e.target.value})}
                  placeholder="Any previous experience with pets?"
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Living Situation</label>
                <input
                  type="text"
                  value={adoptionForm.livingSituation}
                  onChange={(e) => setAdoptionForm({...adoptionForm, livingSituation: e.target.value})}
                  placeholder="e.g., Apartment with yard, House, etc."
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Other Pets</label>
                <input
                  type="text"
                  value={adoptionForm.otherPets}
                  onChange={(e) => setAdoptionForm({...adoptionForm, otherPets: e.target.value})}
                  placeholder="Do you have other pets at home?"
                  className="w-full px-3 py-2 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={applying || !adoptionForm.message.trim()}
                  className="flex-1 py-2.5 bg-[#34c759] hover:bg-[#28a745] text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdoptionModal(false)}
                  className="flex-1 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] font-semibold rounded-lg hover:bg-[#e8e8ed] transition"
                >
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