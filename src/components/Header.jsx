import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { pageWrapper, submitBtn } from "../styles/common";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Dynamically determine dashboard link based on user role
  const dashboardLink = user?.role === 'ADMIN' ? '/admin' : 
                        user?.role === 'VOLUNTEER' ? '/volunteer' : 
                        user?.role === 'RESCUER' ? '/rescuer' : 
                        user?.role === 'DONOR' ? '/donor' :
                        user?.role === 'REPORTER' ? '/reporter' : '/adopter';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/", { replace: true });
  };

  const openLogin = () => {
    window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
  };

  // ✅ Premium styling for navigation links
  const premiumNavLink = ({ isActive }) => 
    `px-5 py-2.5 text-[15px] font-medium rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-[#0066cc] text-white shadow-sm shadow-blue-200' 
        : 'text-[#1d1d1f] hover:bg-[#f5f5f7] hover:text-[#0066cc]'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-[#e8e8ed] sticky top-0 z-50 shadow-sm">
      <div className={`${pageWrapper} py-3 flex items-center justify-between`}>
        
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-bold text-[#1d1d1f] hover:opacity-80 transition flex items-center gap-2">
          <span className="text-3xl">🐾</span>
          <span className="text-[#0066cc]">RescueNet</span>
        </NavLink>

        {/* Center Navigation - Spacious and Premium */}
        <nav className="hidden md:flex items-center gap-2 bg-[#f5f5f7]/50 p-1.5 rounded-2xl border border-[#e8e8ed]">
          <NavLink to="/" className={premiumNavLink} end>Home</NavLink>
          {user && (
            <NavLink to={dashboardLink} className={premiumNavLink}>Dashboard</NavLink>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* Avatar Dropdown - Larger and more clickable */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl hover:bg-[#f5f5f7] transition border border-transparent hover:border-[#e8e8ed]"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-base shadow-md">
                    {user.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-[#1d1d1f] leading-tight">{user.firstName}</p>
                    <p className="text-xs text-[#6e6e73] leading-tight font-medium">{user.role}</p>
                  </div>
                  <svg className={`w-4 h-4 text-[#6e6e73] hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e8e8ed] py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#e8e8ed]">
                      <p className="text-sm font-bold text-[#1d1d1f]">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-[#6e6e73] truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { setDropdownOpen(false); navigate("/profile"); }} className="w-full text-left px-4 py-3 text-sm font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      My Profile
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate("/badges"); }} className="w-full text-left px-4 py-3 text-sm font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      Badges
                    </button>
                    <div className="my-1 border-t border-[#e8e8ed]"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-medium text-[#ff3b30] hover:bg-red-50 transition flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={openLogin} className={`${submitBtn} px-6 py-2.5 text-[15px] font-semibold shadow-md shadow-blue-200`}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}