import { useState } from "react";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper } from "../styles/common";

export default function Profile() {
  const { user, refreshSession } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }

    setChangingPassword(true);
    try {
      await api.put("/user-api/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className={pageWrapper}>
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-3xl shadow-lg">
              {user?.firstName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1d1d1f]">{user?.firstName} {user?.lastName}</h1>
              <p className="text-[#6e6e73]">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#0066cc] text-white text-xs font-semibold rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  passwordErrors.currentPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-[#e8e8ed] focus:ring-[#0066cc]'
                }`}
                placeholder="Enter your current password"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  passwordErrors.newPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-[#e8e8ed] focus:ring-[#0066cc]'
                }`}
                placeholder="Enter new password (min 6 characters)"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {passwordErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  passwordErrors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-[#e8e8ed] focus:ring-[#0066cc]'
                }`}
                placeholder="Confirm your new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements Info */}
            <div className="bg-[#f5f5f7] rounded-lg p-4 border border-[#e8e8ed]">
              <p className="text-sm font-semibold text-[#1d1d1f] mb-2">Password Requirements:</p>
              <ul className="text-xs text-[#6e6e73] space-y-1">
                <li className="flex items-center gap-2">
                  <span className={passwordForm.newPassword.length >= 6 ? 'text-[#34c759]' : 'text-[#a1a1a6]'}>
                    {passwordForm.newPassword.length >= 6 ? '✓' : '○'}
                  </span>
                  At least 6 characters
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}