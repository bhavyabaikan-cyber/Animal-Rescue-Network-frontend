import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { container, card, btnPrimary, btnSecondary, badgePending, badgeTransit, badgeRescued, badgeAdopted, loadingSpinner } from "../styles/common";

export default function AnimalDetails() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    setLoading(true);
    api.get(`/common-api/animals/${id}`).then(res => setAnimal(res.data.payload)).finally(() => setLoading(false));
  }, [id]);

  const handlePledge = async (data) => {
    try {
      const res = await api.post(`/donor-api/pledge/${id}`, data);
      setAnimal(res.data.payload);
      reset();
      toast.success("Pledge recorded! Thank you 💖");
    } catch { toast.error("Pledge failed. Please try again."); }
  };

  const handleAction = async (type) => {
    try {
      await api.post("/common-api/help-action", { animalId: id, actionType: type });
      if (type === "share") window.open(`https://wa.me/?text=Urgent+rescue:+${window.location.href}`, "_blank");
      if (type === "call") window.location.href = `tel:${animal.contactNumber}`;
      toast.success("Action recorded! Thank you 🐾");
    } catch { toast.error("Failed to record action."); }
  };

  if (loading) return <p className={`${container} ${loadingSpinner}`}>Loading case details...</p>;
  if (!animal) return <p className={`${container} text-center py-10 text-slate-500`}>Case not found or restricted.</p>;

  const statusBadge = { Pending: badgePending, "In Transit": badgeTransit, Rescued: badgeRescued, Adopted: badgeAdopted }[animal.status] || "bg-gray-100 text-gray-800";

  return (
    <div className={container}>
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-medium">← Back to Cases</button>
      
      <div className={`${card} overflow-hidden`}>
        <div className="h-64 sm:h-80 bg-slate-100 relative">
          {animal.imageUrl ? <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">📷 No photo available</div>}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-slate-900">{animal.name || "Unnamed"} <span className="text-slate-500 text-lg font-normal">({animal.species})</span></h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge}`}>{animal.status}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
            <p>📍 <strong>Location:</strong> {animal.location}</p>
            <p>📞 <strong>Contact:</strong> {animal.contactNumber}</p>
            <p>⚡ <strong>Urgency:</strong> {animal.urgency ? "🔴 High" : "🟡 Normal"}</p>
            <p>👤 <strong>Reported By:</strong> {animal.reportedBy?.email || "Anonymous"}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg text-slate-800 mb-6 border border-slate-100">
            <h3 className="font-medium text-slate-700 mb-2">Condition & Notes</h3>
            <p className="whitespace-pre-wrap">{animal.description}</p>
          </div>

          {/* Micro-Actions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Ways to Help</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction("share")} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition">📤 Share Case</button>
              <button onClick={() => handleAction("call")} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition">📞 Call Reporter</button>
              <button onClick={() => handleAction("donate")} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition">💖 Donate</button>
              <button onClick={() => handleAction("offer_transport")} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition">🚗 Offer Transport</button>
            </div>
          </div>

          {/* Role Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            {user?.role === "VOLUNTEER" && animal.status !== "Adopted" && <button onClick={() => navigate(`/edit/${animal._id}`)} className={btnPrimary}>Update Status</button>}
            {user?.role === "REPORTER" && animal.status === "Pending" && <button onClick={() => navigate(`/edit/${animal._id}`)} className={btnSecondary}>Edit Report</button>}
          </div>
        </div>
      </div>

      {/* Donor Pledge Section */}
      {user?.role === "DONOR" && (
        <div className={`${card} p-6 mt-6`}>
          <h3 className="font-semibold text-slate-900 mb-3">💖 Support This Case (${animal.totalPledged || 0} pledged)</h3>
          <form onSubmit={handleSubmit(handlePledge)} className="flex flex-col sm:flex-row gap-3">
            <input className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" type="number" min="1" placeholder="Amount (₹/$)" {...register("amount", { required: true })} />
            <input className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Message (optional)" {...register("message")} />
            <button type="submit" className={btnPrimary}>Pledge Now</button>
          </form>
        </div>
      )}

      {/* Donations List */}
      {animal.donations?.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Contributions</h3>
          <div className="space-y-3">
            {animal.donations.map((d, i) => (
              <div key={i} className={`${card} p-4 flex justify-between text-sm`}>
                <span className="font-medium text-slate-700">🤝 Anonymous Donor</span>
                <span className="text-emerald-700 font-semibold">+{d.amount} <span className="text-slate-500 font-normal ml-1">- {d.message || "General support"}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}