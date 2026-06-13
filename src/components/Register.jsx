import { useForm } from "react-hook-form";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import {
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
  ghostBtn
} from "../styles/common";

export default function Register() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm();
  
  // Alias to avoid conflict with react-hook-form's register
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const success = await authRegister(data);
      if (success) {
        toast.success("Account created successfully! Please sign in.");
        reset(); // Clear form
        navigate("/login", { replace: true });
      }
    } catch (err) {
      // Error is already handled in authStore, but we catch to prevent unhandled promise rejection
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <div className={formCard}>
        <h2 className={formTitle}>Create Account</h2>
        <p className="text-sm text-[#6e6e73] mb-6">Join the rescue network and make a difference today.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className={formGroup}>
              <label className={labelClass}>First Name</label>
              <input 
                {...register("firstName", { required: "First name is required" })} 
                className={inputClass} 
                placeholder="John" 
              />
              {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
            </div>
            
            <div className={formGroup}>
              <label className={labelClass}>Last Name</label>
              <input 
                {...register("lastName", { required: "Last name is required" })} 
                className={inputClass} 
                placeholder="Doe" 
              />
              {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className={formGroup}>
            <label className={labelClass}>Email Address</label>
            <input 
              type="email" 
              {...register("email", { 
                required: "Email is required",
                pattern: { 
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                  message: "Please enter a valid email" 
                }
              })} 
              className={inputClass} 
              placeholder="you@example.com" 
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className={formGroup}>
            <label className={labelClass}>Password</label>
            <input 
              type="password" 
              {...register("password", { 
                required: "Password is required",
                minLength: { 
                  value: 6, 
                  message: "Password must be at least 6 characters" 
                }
              })} 
              className={inputClass} 
              placeholder="••••••••" 
            />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          {/* Role Selection */}
          <div className={formGroup}>
            <label className={labelClass}>I want to join as a...</label>
            <select 
              {...register("role", { required: "Please select a role" })} 
              className={inputClass}
            >
              <option value="">Select your role</option>
              <option value="REPORTER">Reporter (Submit rescue cases)</option>
              <option value="VOLUNTEER">Volunteer (Help rescue & transport)</option>
              <option value="DONOR">Donor (Fund vet care & rehabilitation)</option>
              <option value="ADOPTER">Adopter (Give an animal a forever home)</option>
            </select>
            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>

          {/* Submit Button */}
          <button type="submit" className={`${submitBtn} mt-2`}>
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-[#6e6e73] mt-6">
          Already have an account?{" "}
          <NavLink to="/login" className={ghostBtn}>
            Sign In
          </NavLink>
        </p>
      </div>
    </div>
  );
}