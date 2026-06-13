import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { container, card, label, input, btnPrimary, btnSecondary, errorText } from "../styles/common";
import { useState } from "react";

export default function CreateReport() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach(k => formData.append(k, data[k]));
    if (imageFile) formData.append("image", imageFile);

    try {
      await api.post("/reporter-api/report", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("🐾 Report submitted successfully!");
      navigate("/list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={container}>
      <div className={`${card} max-w-2xl mx-auto p-6`}>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Report an Animal in Need</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className={label}>Animal Photo (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImage} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 h-32 w-32 object-cover rounded-lg border" />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><label className={label}>Name</label><input {...register("name")} className={input} placeholder="Bella, Stray, etc." /></div>
            <div><label className={label}>Species <span className="text-red-500">*</span></label><select {...register("species", { required: true })} className={input}><option value="">Select</option><option>Dog</option><option>Cat</option><option>Bird</option><option>Other</option></select>{errors.species && <p className={errorText}>Required</p>}</div>
          </div>
          <div><label className={label}>Location <span className="text-red-500">*</span></label><input {...register("location", { required: true })} className={input} placeholder="Street, landmark, area" />{errors.location && <p className={errorText}>Required</p>}</div>
          <div><label className={label}>Contact Number <span className="text-red-500">*</span></label><input {...register("contactNumber", { required: true })} className={input} placeholder="+91 98765 43210" />{errors.contactNumber && <p className={errorText}>Required</p>}</div>
          <div><label className={label}>Description & Condition <span className="text-red-500">*</span></label><textarea {...register("description", { required: true, minLength: 10 })} rows="4" className={input} placeholder="Injuries, behavior, surroundings..." />{errors.description && <p className={errorText}>Min 10 characters</p>}</div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("urgency")} className="w-4 h-4 text-indigo-600 rounded" /> <span className="text-sm text-amber-700 font-medium">🚨 Mark as Urgent</span></label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={submitting} className={btnPrimary}>{submitting ? "Submitting..." : "Submit Report"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}