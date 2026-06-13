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
        return (
          <>
            <button onClick={() => navigate("/donor")} className={`${articleCardClass} text-left p-6 cursor-pointer hover:shadow-md transition border-l-4 border-l-[#0066cc] bg-[#eff6ff]`}>
              <h4 className={articleTitle}>💙 My Donor Dashboard</h4>
              <p className="text-sm text-[#6e6e73] mt-1">Track your donations and the impact you've made</p>
            </button>
            <button onClick={() => navigate("/cases")} className={`${articleCardClass} text-left p-6 cursor-pointer hover:shadow-md transition`}>
              <h4 className={articleTitle}>💖 Fund a Rescue</h4>
              <p className="text-sm text-[#6e6e73] mt-1">Browse active cases and donate to vet care</p>
            </button>
          </>
        );
      case "ADOPTER":
        return [
          { path: "/dashboard", label: "My Applications", icon: "🏠" },
          { path: "/cases?status=Adoption%20Pending", label: "Available Animals", icon: "🐾" },
          { path: "/adoptions", label: "Adoptions", icon: "📋" },
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
          <p className="text-sm text-[#6e6e73]">Manage your {item.label.toLowerCase()}</p>
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