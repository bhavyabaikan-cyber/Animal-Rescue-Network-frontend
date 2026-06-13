import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { container, card, label, input, btnPrimary, btnSecondary, loadingSpinner, errorText } from "../styles/common";

export default function EditCase() {
  const { id } = useParams();
  const { register, handleSubmit, setValue } = useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    api.get(`/common-api/animals/${id}`)
      .then(res => {
        const a = res.data.payload;
        Object.keys(a).forEach(k => setValue(k, a[k]));
        setLoading(false);
      })
      .catch(() => {
        setApiError("Failed to load case");
        setLoading(false);
      });
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError(null);
    
    try {
      // Use the correct endpoint for volunteers
      const endpoint = `/volunteer-api/update-status/${id}`;
      
      console.log("📤 Sending update:", { endpoint, data });
      
      const res = await api.put(endpoint, data);
      
      console.log("✅ Response:", res.data);
      
      toast.success("Case updated successfully!");
      navigate("/list");
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err.message);
      setApiError(err.response?.data?.message || err.response?.data?.error || "Update failed");
      toast.error("Failed to update case");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className={`${container} ${loadingSpinner}`}>Loading case...</p>;
  if (apiError) return <p className={`${container} text-center py-10 text-red-600`}>{apiError}</p>;

  return (
    <div className={container}>
      <div className={`${card} max-w-2xl mx-auto p-6`}>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Update Rescue Case</h2>
        
        {apiError && <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{apiError}</p>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className={label}>Status</label>
            <select {...register("status")} className={input}>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Rescued">Rescued</option>
              <option value="Adopted">Adopted</option>
            </select>
          </div>
          
          <div>
            <label className={label}>Description / Notes</label>
            <textarea {...register("description")} rows="4" className={input} />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("urgency")} className="w-4 h-4 text-indigo-600 rounded" /> 
            <span className="text-sm text-amber-700 font-medium">🚨 Urgent Status</span>
          </label>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={submitting} className={btnPrimary}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}