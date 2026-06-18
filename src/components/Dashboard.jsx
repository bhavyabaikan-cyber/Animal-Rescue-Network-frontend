import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import SidebarLayout from "./SidebarLayout";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  // Define sidebar items based on role
  const getSidebarItems = () => {
    switch (user.role) {
      case "REPORTER":
        return [
          { path: "/reporter-dashboard", label: "My Reports", icon: "📋" },
          { path: "/report", label: "Report Animal", icon: "📢" },
          { path: "/cases", label: "All Cases", icon: "🐾" },
          { path: "/profile", label: "Profile", icon: "👤" },
        ];
      case "DONOR":
        return [
          { path: "/donor", label: "My Donor Dashboard", icon: "💙", description: "Track your donations and the impact you've made" },
          { path: "/cases", label: "Fund a Rescue", icon: "💖", description: "Browse active cases and donate to vet care" },
          { path: "/profile", label: "Profile", icon: "👤" },
        ];
      case "ADOPTER":
        return [
          { path: "/dashboard", label: "My Applications", icon: "🏠" },
          { path: "/cases?status=Adoption%20Pending", label: "Available Animals", icon: "🐾" },
          { path: "/adoptions", label: "Adoptions", icon: "📋" },
          { path: "/profile", label: "Profile", icon: "👤" },
        ];
      case "VOLUNTEER":
        return [
          { path: "/volunteer", label: "My Cases", icon: "🦸" },
          { path: "/cases", label: "All Cases", icon: "🐾" },
          { path: "/profile", label: "Profile", icon: "👤" },
        ];
      case "ADMIN":
        return [
          { path: "/admin", label: "Admin Dashboard", icon: "⚙️" },
          { path: "/analytics", label: "Analytics", icon: "📊" },
          { path: "/profile", label: "Profile", icon: "👤" },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  const content = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {sidebarItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="bg-white p-6 rounded-2xl border border-[#e8e8ed] hover:shadow-lg transition text-left"
        >
          <div className="text-3xl mb-3">{item.icon}</div>
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">{item.label}</h3>
          <p className="text-sm text-[#6e6e73]">
            {item.description || `Manage your ${item.label.toLowerCase()}`}
          </p>
        </button>
      ))}
    </div>
  );

  return (
    <SidebarLayout title={`${user.role} Dashboard`} sidebarItems={sidebarItems}>
      {content}
    </SidebarLayout>
  );
}