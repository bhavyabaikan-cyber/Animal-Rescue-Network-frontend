import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, formCard, formTitle, formGroup, labelClass, inputClass, submitBtn, errorClass, ghostBtn, loadingClass } from "../styles/common";

export default function Apply() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const res = await api.get(`/common-api/animals/${id}`);
        if (res.data.payload.status !== "Adoption Pending") {
          toast.error("This animal is no longer available for adoption.");
          navigate("/adopt");
          return;
        }
        setAnimal(res.data.payload);
      } catch {
        toast.error("Failed to load animal details.");
        navigate("/adopt");
      } finally {
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [id, navigate]);

  const onSubmit = async (data) => {
    if (!user) return toast.error("Please log in to apply.");
    setSubmitting(true);
    try {
      await api.post(`/adopter-api/apply/${id}`, data);
      toast.success("🎉 Application submitted successfully! The volunteer will contact you soon.");
      navigate("/adopt");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className={loadingClass}>Loading application...</p>;
  if (!animal) return null;

  return (
    <div className={pageWrapper}>
      <button onClick={() => navigate("/adopt")} className={`${ghostBtn} mb-6`}>← Back to Available Animals</button>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Animal Summary */}
        <div className="md:col-span-1">
          <div className={`${formCard} sticky top-24`}>
            {animal.imageUrl ? (
              <img src={animal.imageUrl} alt={animal.name} className="w-full h-48 object-cover rounded-xl mb-4" />
            ) : (
              <div className="w-full h-48 bg-[#f5f5f7] rounded-xl flex items-center justify-center text-[#a1a1a6] text-4xl mb-4">🐾</div>
            )}
            <h2 className="text-xl font-bold text-[#1d1d1f]">{animal.name || "Unnamed"} ({animal.species})</h2>
            <p className="text-sm text-[#6e6e73] mt-2">{animal.description}</p>
            <p className="text-xs text-[#a1a1a6] mt-4">🤝 Assigned Volunteer: {animal.assignedVolunteer?.firstName || "Pending Assignment"}</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="md:col-span-2">
          <div className={formCard}>
            <h2 className={formTitle}>Adoption Application</h2>
            <p className="text-sm text-[#6e6e73] mb-6">Please provide honest details. This helps us ensure the best match for both you and the animal.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className={formGroup}>
                <label className={labelClass}>Housing Type <span className="text-[#ff3b30]">*</span></label>
                <select {...register("housingType", { required: "Required" })} className={inputClass}>
                  <option value="">Select your housing type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House with Yard">House with Yard</option>
                  <option value="House without Yard">House without Yard</option>
                  <option value="Other">Other</option>
                </select>
                {errors.housingType && <p className={errorClass}>{errors.housingType.message}</p>}
              </div>

              <div className={formGroup}>
                <label className={labelClass}>Do you currently have other pets? <span className="text-[#ff3b30]">*</span></label>
                <select {...register("hasOtherPets", { required: "Required" })} className={inputClass}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              <div className={formGroup}>
                <label className={labelClass}>Previous Pet Experience <span className="text-[#ff3b30]">*</span></label>
                <textarea {...register("petExperience", { required: "Required", minLength: { value: 20, message: "Please provide more detail" } })} rows="4" className={inputClass} placeholder="Tell us about any pets you've owned or cared for in the past..." />
                {errors.petExperience && <p className={errorClass}>{errors.petExperience.message}</p>}
              </div>

              <div className={formGroup}>
                <label className={labelClass}>Why do you want to adopt this animal? <span className="text-[#ff3b30]">*</span></label>
                <textarea {...register("reasonForAdoption", { required: "Required", minLength: { value: 30, message: "Please provide more detail" } })} rows="4" className={inputClass} placeholder="Share your motivations and how this animal fits into your life..." />
                {errors.reasonForAdoption && <p className={errorClass}>{errors.reasonForAdoption.message}</p>}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e8e8ed]">
                <button type="button" onClick={() => navigate("/adopt")} className={ghostBtn}>Cancel</button>
                <button type="submit" disabled={submitting} className={`${submitBtn} flex-1`}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}