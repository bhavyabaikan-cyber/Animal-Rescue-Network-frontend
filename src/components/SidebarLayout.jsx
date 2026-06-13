import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../store/authStore";
import Header from "./Header";
import Footer from "./Footer";

export default function SidebarLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const openLogin = () => {
    window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
  };

  const navLinkClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition";

  // Hide sidebar on home page and stories page (they have their own full-width layouts)
  const hideSidebar = location.pathname === "/" || location.pathname === "/stories";

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* ✅ Header is ALWAYS rendered at the very top of every page */}
      <Header />

      <div className="flex flex-1 relative">
        {/* ✅ Sidebar is conditionally rendered (hidden on Home/Stories) */}
        {!hideSidebar && (
          <aside className="w-64 bg-white border-r border-[#e8e8ed] flex flex-col fixed h-screen pt-20 z-30 overflow-y-auto">
            <nav className="flex-1 p-4 space-y-1">
              <NavLink to="/" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                Home
              </NavLink>
              <NavLink to="/cases" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                All Cases
              </NavLink>
              <NavLink to="/map" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                Map View
              </NavLink>

              {/* Communication Section */}
              {user && <div className="pt-4 pb-2"><p className="px-4 text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">Communication</p></div>}
              {user && (
                <>
                  <NavLink to="/messages" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#0066cc] text-white" : "text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] font-semibold"}`}>
                    Messages
                  </NavLink>
                  <NavLink to="/notifications" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#0066cc] text-white" : "text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] font-semibold"}`}>
                    Notifications
                  </NavLink>
                </>
              )}

              {/* My Dashboard Section */}
              {user && <div className="pt-4 pb-2"><p className="px-4 text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">My Dashboard</p></div>}
              
              {user?.role === "REPORTER" && (
                <>
                  <NavLink to="/reporter" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                    My Reports
                  </NavLink>
                  <NavLink to="/report" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                    Report Animal
                  </NavLink>
                </>
              )}
              
              {user?.role === "VOLUNTEER" && (
                <NavLink to="/volunteer" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                  Volunteer Portal
                </NavLink>
              )}
              
              {user?.role === "DONOR" && (
                <>
                  <NavLink to="/donor" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                    Donor Dashboard
                  </NavLink>
                  <NavLink to="/donate" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                    Make Donation
                  </NavLink>
                </>
              )}
              
              {user?.role === "ADOPTER" && (
                <NavLink to="/adoptions" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                  My Applications
                </NavLink>
              )}
              
              {user?.role === "ADMIN" && (
                <>
                  <NavLink to="/admin" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                    Admin Panel
                  </NavLink>
                  <NavLink to="/analytics" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                    Analytics
                  </NavLink>
                </>
              )}

              {/* More Section */}
              <div className="pt-4 pb-2"><p className="px-4 text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider">More</p></div>
              <NavLink to="/badges" className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-[#f5f5f7] text-[#0066cc]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                Badges
              </NavLink>
            </nav>

            {/* User Info at Bottom (Notification Bell removed from here, it's in the Header now) */}
            {user ? (
              <div className="p-4 border-t border-[#e8e8ed] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0066cc] text-white flex items-center justify-center font-bold flex-shrink-0">
                    {user.firstName?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1d1d1f] truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-[#6e6e73]">{user.role}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-[#e8e8ed] mb-4">
                <button 
                  onClick={openLogin}
                  className="w-full py-2.5 bg-[#0066cc] text-white rounded-lg font-semibold hover:bg-[#0052a3] transition"
                >
                  Sign In
                </button>
              </div>
            )}
          </aside>
        )}

        {/* ✅ Main Content Area (adjusts margin based on sidebar visibility) */}
        <main className={`flex-1 flex flex-col min-h-screen ${!hideSidebar ? 'ml-64' : ''}`}>
          <div className="flex-1">
            <Outlet />
          </div>
          {/* ✅ Footer is ALWAYS rendered at the bottom */}
          <Footer />
        </main>
      </div>
    </div>
  );
}