import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { pageWrapper, navLinkClass, submitBtn } from "../styles/common";
import NotificationBell from "./NotificationBell"; // ✅ Added

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <header className="bg-white border-b border-[#e8e8ed] sticky top-0 z-50 shadow-sm">
      <div className={`${pageWrapper} py-4 flex items-center justify-between`}>
        
        <NavLink to="/" className="text-xl font-bold text-[#1d1d1f] hover:opacity-80 transition">
          <span className="text-[#0066cc]">RescueNet</span>
        </NavLink>

        <nav className="hidden md:flex gap-1">
          <NavLink to="/" className={({ isActive }) => isActive ? `${navLinkClass} bg-[#f5f5f7] rounded-lg` : `${navLinkClass} hover:bg-[#f5f5f7] rounded-lg px-3 py-2`}>Home</NavLink>
          <NavLink to="/cases" className={({ isActive }) => isActive ? `${navLinkClass} bg-[#f5f5f7] rounded-lg` : `${navLinkClass} hover:bg-[#f5f5f7] rounded-lg px-3 py-2`}>Cases</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* ✅ Notification Bell - Now in Header next to avatar */}
              <NotificationBell />

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f7] transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-[#1d1d1f] leading-tight">{user.firstName}</p>
                    <p className="text-xs text-[#6e6e73] leading-tight">{user.role}</p>
                  </div>
                  <svg className="w-4 h-4 text-[#6e6e73] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#e8e8ed] py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#e8e8ed]">
                      <p className="text-sm font-semibold text-[#1d1d1f]">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-[#6e6e73] truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { setDropdownOpen(false); navigate("/profile"); }} className="w-full text-left px-4 py-2.5 text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] transition flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      My Profile
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate("/badges"); }} className="w-full text-left px-4 py-2.5 text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] transition flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      Badges
                    </button>
                    <div className="my-2 border-t border-[#e8e8ed]"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-[#ff3b30] hover:bg-red-50 transition flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={openLogin} className={submitBtn}>Sign In</button>
          )}
        </div>
      </div>
    </header>
  );
}