import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";

export default function RoleUpgradePrompt({ targetRole, featureName }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    try {
      await api.put(`/user-api/update-role`, { role: targetRole });
      
      const res = await api.get("/common-api/me");
      const updatedUser = res.data.payload;
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();
      
      toast.success(`Successfully registered as ${targetRole}`);
    } catch (err) {
      console.error("Upgrade error:", err);
      toast.error(err.response?.data?.message || "Failed to upgrade role");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-[#e8e8ed] overflow-hidden">
        <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Access Restricted</h1>
          <p className="text-blue-100">This feature requires {targetRole} privileges</p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">
              You're currently registered as a {user?.role}
            </h2>
            <p className="text-[#6e6e73] leading-relaxed mb-4">
              To access the <strong>{featureName}</strong>, you need to upgrade your account to a <strong>{targetRole}</strong>. 
              This helps us maintain the quality and safety of our platform.
            </p>
            
            <div className="bg-[#f8f9fa] rounded-xl p-5 border border-[#e8e8ed]">
              <h3 className="font-semibold text-[#1d1d1f] mb-3">What you'll be able to do as a {targetRole}:</h3>
              <ul className="space-y-2 text-sm text-[#6e6e73]">
                {targetRole === "VOLUNTEER" && (
                  <>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Accept and manage rescue cases</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Update animal status with photos</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Upload expense receipts</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Coordinate adoptions</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Communicate with reporters and adopters</li>
                  </>
                )}
                {targetRole === "DONOR" && (
                  <>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Donate to rescue cases</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Track your donations</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Receive tax receipts</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> View impact reports</li>
                  </>
                )}
                {targetRole === "ADOPTER" && (
                  <>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Apply for animal adoption</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Track application status</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Communicate with volunteers</li>
                    <li className="flex gap-2"><span className="text-[#34c759]">✓</span> Share your success story</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold rounded-xl transition shadow-sm"
            >
              Upgrade to {targetRole}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-semibold rounded-xl transition border border-[#e8e8ed]"
            >
              Go Back
            </button>
          </div>

          <p className="text-xs text-[#a1a1a6] text-center mt-6">
            By upgrading, you agree to our community guidelines and terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}