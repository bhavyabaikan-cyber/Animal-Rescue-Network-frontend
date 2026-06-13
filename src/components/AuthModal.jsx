import { useState, useEffect } from "react";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";

export default function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const { login, register } = useAuth();
  
  const [view, setView] = useState(initialView);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "REPORTER"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Reset form when modal opens or view changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "REPORTER"
      });
      setErrors({});
      setView(initialView);
    }
  }, [isOpen, initialView]);

  const validateForm = () => {
    const newErrors = {};

    if (view === "register") {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (view === "login") {
        // ✅ Get the user payload back
        const userPayload = await login({ email: formData.email, password: formData.password });
        
        if (userPayload) {
          toast.success("Login successful!");
          onClose();
          
          // ✅ Determine redirect path based on role
          const role = userPayload.role;
          let redirectPath = "/"; // Default fallback

          if (role === "REPORTER") redirectPath = "/reporter";
          else if (role === "VOLUNTEER") redirectPath = "/volunteer";
          else if (role === "DONOR") redirectPath = "/donor";
          else if (role === "ADOPTER") redirectPath = "/adoptions";
          else if (role === "ADMIN") redirectPath = "/admin";

          // ✅ Use window.location.href instead of useNavigate
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 100);
        }
      } else {
        await register(formData);
        toast.success("Registration successful! Please login.");
        setView("login");
        setFormData({ firstName: "", lastName: "", email: "", password: "", role: "REPORTER" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1d1d1f]">
            {view === "login" ? "Welcome Back" : "Join RescueNet"}
          </h2>
          <button onClick={onClose} className="text-[#a1a1a6] hover:text-[#1d1d1f] text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {view === "register" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-[#e8e8ed] focus:ring-[#0066cc]'
                  }`}
                  placeholder="Enter your first name"
                  autoComplete="off"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">⚠️ {errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-[#e8e8ed] focus:ring-[#0066cc]'
                  }`}
                  placeholder="Enter your last name"
                  autoComplete="off"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">⚠️ {errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] transition"
                >
                  <option value="REPORTER">Reporter</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="DONOR">Donor</option>
                  <option value="ADOPTER">Adopter</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#e8e8ed] focus:ring-[#0066cc]'
              }`}
              placeholder="Enter your email"
              autoComplete="new-email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">⚠️ {errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-[#e8e8ed] focus:ring-[#0066cc]'
              }`}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">⚠️ {errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : view === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#6e6e73]">
            {view === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setView(view === "login" ? "register" : "login");
                setFormData({ firstName: "", lastName: "", email: "", password: "", role: "REPORTER" });
                setErrors({});
              }}
              className="ml-2 text-[#0066cc] font-semibold hover:underline"
            >
              {view === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}