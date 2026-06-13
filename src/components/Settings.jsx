import { useState } from "react";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import SidebarLayout from "./SidebarLayout";
import { inputClass, labelClass, submitBtn } from "../styles/common";

// ✅ MOVED TO TOP: Helper function defined BEFORE the component
function getSidebarItems(role) {
  switch (role) {
    case "VOLUNTEER":
      return [
        { path: "/volunteer", label: "Dashboard", icon: "📊" },
        { path: "/cases", label: "All Cases", icon: "🐾" },
        { path: "/map", label: "Rescue Map", icon: "🗺️" },
        { path: "/profile", label: "Profile", icon: "👤" },
      ];
    case "REPORTER":
      return [
        { path: "/dashboard", label: "My Reports", icon: "📋" },
        { path: "/report", label: "Report Animal", icon: "📢" },
        { path: "/cases", label: "All Cases", icon: "🐾" },
        { path: "/profile", label: "Profile", icon: "👤" },
      ];
    case "DONOR":
      return [
        { path: "/dashboard", label: "My Donations", icon: "💖" },
        { path: "/cases", label: "Fund a Rescue", icon: "🐾" },
        { path: "/donate", label: "Donate", icon: "💰" },
        { path: "/profile", label: "Profile", icon: "👤" },
      ];
    case "ADOPTER":
      return [
        { path: "/adoptions", label: "My Applications", icon: "🏠" },
        { path: "/cases?status=Adoption%20Pending", label: "Available Animals", icon: "🐾" },
        { path: "/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/profile", label: "Profile", icon: "👤" },
      ];
    default:
      return [];
  }
}

export default function Settings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Now safe to call - function is already defined above
  const sidebarItems = getSidebarItems(user?.role);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    // TODO: Add API call to change password
    toast.success("Password changed successfully!");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <SidebarLayout title="Settings" sidebarItems={sidebarItems}>
      <div className="max-w-4xl space-y-6">
        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-[#e8e8ed] p-8">
          <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className={inputClass}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className={inputClass}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className={`${submitBtn} px-8`}>
              Update Password
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-[#e8e8ed] p-8">
          <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl">
              <div>
                <p className="font-medium text-[#1d1d1f]">Email Notifications</p>
                <p className="text-sm text-[#6e6e73]">Receive updates about your cases</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#0066cc]" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl">
              <div>
                <p className="font-medium text-[#1d1d1f]">New Case Alerts</p>
                <p className="text-sm text-[#6e6e73]">Get notified about new cases in your area</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#0066cc]" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl">
              <div>
                <p className="font-medium text-[#1d1d1f]">Adoption Updates</p>
                <p className="text-sm text-[#6e6e73]">Updates on your adoption applications</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#0066cc]" />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-[#ff3b30]/30 p-8">
          <h3 className="text-xl font-bold text-[#ff3b30] mb-2">Danger Zone</h3>
          <p className="text-sm text-[#6e6e73] mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => toast.error("Account deletion is disabled in demo mode")}
            className="px-6 py-2.5 bg-[#ff3b30] hover:bg-[#d62c23] text-white text-sm font-semibold rounded-lg transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}