import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import {
  pageWrapper,
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
  ghostBtn,
} from "../styles/common";

export default function ReportAnimal() {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ ENHANCED: Get Current Location + Auto-Fill Address
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 1. Save GPS coordinates
        setValue("lat", latitude);
        setValue("lng", longitude);

        // 2. ✅ Reverse Geocoding: Convert GPS to readable address (Free OpenStreetMap API)
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          if (data && data.display_name) {
            setValue("location", data.display_name);
          } else {
            setValue("location", `GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch (err) {
          setValue("location", `GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }

        setGettingLocation(false);
        toast.dismiss();
        toast.success("📍 Location captured & address found!");
      },
      (error) => {
        setGettingLocation(false);
        toast.dismiss();
        let errorMsg = "Failed to get location.";
        if (error.code === 1) errorMsg = "Location access denied. Please allow location permissions in your browser.";
        else if (error.code === 2) errorMsg = "Location unavailable.";
        else if (error.code === 3) errorMsg = "Location request timed out.";
        toast.error(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name?.trim() || "Unnamed");
      formData.append("species", data.species);
      formData.append("breed", data.breed?.trim() || "");  // ✅ NEW: Append breed
      formData.append("caseType", data.caseType || "Stray");
      formData.append("location", data.location.trim());
      formData.append("contactNumber", data.contactNumber.trim());
      formData.append("description", data.description.trim());
      formData.append("urgency", data.urgency || false);
      
      // Append GPS coordinates if available
      if (data.lat && data.lng) {
        formData.append("lat", data.lat);
        formData.append("lng", data.lng);
      }
      
      if (imageFile) formData.append("image", imageFile);

      const res = await api.post("/reporter-api/report", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("🐾 Report submitted successfully!");
      reset();
      setImageFile(null);
      setImagePreview(null);
      navigate(`/case/${res.data.payload._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className={`${pageWrapper} text-center py-20`}>
        <p className="text-[#6e6e73] mb-4">Please sign in to report an animal.</p>
        <button onClick={() => navigate("/login")} className={submitBtn}>Sign In</button>
        <button onClick={() => navigate("/register")} className={`${ghostBtn} ml-4`}>Register</button>
      </div>
    );
  }

  return (
    <div className={pageWrapper}>
      <div className={`${formCard} max-w-2xl mx-auto p-6`}>
        <h2 className={formTitle}>Report an Animal in Need</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Image Upload */}
          <div className={formGroup}>
            <label className={labelClass}>Animal Photo (Recommended)</label>
            <div className="flex gap-4 items-start">
              <div className="w-32 h-32 border-2 border-dashed border-[#e8e8ed] rounded-xl bg-[#f5f5f7] flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#a1a1a6] text-sm text-center px-2">📷 No Image</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="block w-full text-sm text-[#6e6e73] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0066cc]/10 file:text-[#0066cc] hover:file:bg-[#0066cc]/20 transition cursor-pointer" 
                />
                <p className="text-xs text-[#a1a1a6] mt-2">JPG, PNG or WebP. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Name, Species & Breed */}
          <div className="grid sm:grid-cols-3 gap-5">
            <div className={formGroup}>
              <label className={labelClass}>Animal Name <span className="text-[#a1a1a6] font-normal">(Optional)</span></label>
              <input {...register("name")} className={inputClass} placeholder="Bella, Stray, etc." />
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Species <span className="text-[#ff3b30]">*</span></label>
              <select {...register("species", { required: "Please select species" })} className={inputClass}>
                <option value="">Select species</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Cow">Cow</option>
                <option value="Goat">Goat</option>
                <option value="Other">Other</option>
              </select>
              {errors.species && <p className={errorClass}>{errors.species.message}</p>}
            </div>
            {/* ✅ NEW: Breed Field */}
            <div className={formGroup}>
              <label className={labelClass}>Breed <span className="text-[#a1a1a6] font-normal">(Optional)</span></label>
              <input {...register("breed")} className={inputClass} placeholder="Labrador, Persian, etc." />
            </div>
          </div>

          {/* ✅ NEW: Case Type Selection */}
          <div className={formGroup}>
            <label className={labelClass}>Case Type <span className="text-[#ff3b30]">*</span></label>
            <select 
              {...register("caseType", { required: "Please select case type" })} 
              className={inputClass}
              defaultValue="Stray"
            >
              <option value="Stray">Stray / Abandoned / Injured (Needs Rescue & Adoption)</option>
              <option value="Lost">Lost / Missing Pet (Needs to be Reunited with Owner)</option>
            </select>
            <p className="text-xs text-[#6e6e73] mt-1">
              Select "Lost" if this pet has an owner who is looking for it. Adoption will be disabled for lost pets.
            </p>
            {errors.caseType && <p className={errorClass}>{errors.caseType.message}</p>}
          </div>

          {/* ✅ Location with Auto-Fill GPS Button */}
          <div className={formGroup}>
            <label className={labelClass}>Exact Location <span className="text-[#ff3b30]">*</span></label>
            <input 
              {...register("location", { required: "Location is required" })} 
              className={inputClass} 
              placeholder="Street name, landmark, area, city" 
            />
            {errors.location && <p className={errorClass}>{errors.location.message}</p>}
            
            {/* GPS Capture Button */}
            <button 
              type="button" 
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className={`mt-2 text-sm font-medium flex items-center gap-2 transition ${gettingLocation ? 'text-[#a1a1a6] cursor-not-allowed' : 'text-[#0066cc] hover:text-[#0052a3] hover:underline'}`}
            >
              {gettingLocation ? (
                <>⏳ Getting location & address...</>
              ) : (
                <>📍 Use my current location (Auto-fill address)</>
              )}
            </button>
            
            {/* Hidden inputs to store GPS coordinates */}
            <input type="hidden" {...register("lat")} />
            <input type="hidden" {...register("lng")} />
          </div>

          {/* Contact */}
          <div className={formGroup}>
            <label className={labelClass}>Your Contact Number <span className="text-[#ff3b30]">*</span></label>
            <input {...register("contactNumber", { 
              required: "Contact number is required",
              pattern: { value: /^[0-9+\-\s()]{6,}$/, message: "Enter a valid phone number" }
            })} className={inputClass} placeholder="+91 98765 43210" />
            {errors.contactNumber && <p className={errorClass}>{errors.contactNumber.message}</p>}
          </div>

          {/* Description */}
          <div className={formGroup}>
            <label className={labelClass}>Condition & Description <span className="text-[#ff3b30]">*</span></label>
            <textarea {...register("description", { 
              required: "Description is required",
              minLength: { value: 20, message: "Please provide at least 20 characters" }
            })} rows="5" className={inputClass} placeholder="Describe injuries, behavior, surroundings..." />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          {/* Urgency Toggle */}
          <label className="flex items-start gap-3 p-4 bg-[#fff3cd] border border-[#ffe69c] rounded-xl cursor-pointer hover:bg-[#ffecb5]/50 transition">
            <input type="checkbox" {...register("urgency")} className="mt-1 w-4 h-4 text-[#0066cc] border-[#e8e8ed] rounded focus:ring-[#0066cc]" />
            <div>
              <span className="text-sm font-semibold text-[#856404]">🚨 Mark as Urgent</span>
              <p className="text-xs text-[#856404] mt-1">Check this if the animal is injured, trapped, or in immediate danger.</p>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[#e8e8ed]">
            <button type="button" onClick={() => navigate(-1)} className={ghostBtn}>Cancel</button>
            <button type="submit" disabled={submitting} className={`${submitBtn} flex items-center justify-center gap-2`}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}