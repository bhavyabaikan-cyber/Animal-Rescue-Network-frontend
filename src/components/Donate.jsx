import { useForm } from "react-hook-form";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, formCard, formTitle, formGroup, labelClass, inputClass, submitBtn, errorClass } from "../styles/common";

export default function Donate() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    try {
      // In production: integrate Stripe/Razorpay here
      // For demo: show success
      toast.success(`Thank you! ₹${data.amount} pledge recorded for animal #${data.animalId || "general"}.`);
      reset();
    } catch (err) {
      toast.error("Donation failed. Please try again.");
    }
  };

  return (
    <div className={pageWrapper}>
      <div className={`${formCard} max-w-xl mx-auto p-6`}>
        <h2 className={formTitle}>💖 Support a Rescue</h2>
        <p className="text-[#6e6e73] mb-6">Your donation goes directly to vet care, food, and transport for animals in need.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className={formGroup}>
            <label className={labelClass}>Animal ID (Optional)</label>
            <input {...register("animalId")} className={inputClass} placeholder="Enter case ID or leave blank for general donation" />
          </div>
          
          <div className={formGroup}>
            <label className={labelClass}>Amount (₹) <span className="text-[#ff3b30]">*</span></label>
            <input type="number" min="10" {...register("amount", { required: "Amount required", min: { value: 10, message: "Minimum ₹10" } })} className={inputClass} placeholder="Enter amount" />
            {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
          </div>
          
          <div className={formGroup}>
            <label className={labelClass}>Message (Optional)</label>
            <textarea {...register("message")} rows="3" className={inputClass} placeholder="Add a note of encouragement..." />
          </div>
          
          <div className="p-4 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] text-sm text-[#6e6e73]">
            <p>✅ 100% of your donation goes to animal care. No administrative fees.</p>
            <p className="mt-2">🔒 Secure payment processing (demo mode)</p>
          </div>
          
          <button type="submit" className={submitBtn}>Donate Now</button>
        </form>
      </div>
    </div>
  );
}