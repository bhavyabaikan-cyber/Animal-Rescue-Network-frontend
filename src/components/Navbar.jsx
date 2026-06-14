import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from "react";
import api from "../api/client";
import { FaPaw, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardLink = user?.role === 'ADMIN' ? '/admin' : 
                        user?.role === 'RESCUER' ? '/rescuer' : '/adopter';

  const { user } = useAuth();
const [unreadCount, setUnreadCount] = useState(0);

// Fetch unread count when user logs in
useEffect(() => {
  if (user) {
    api.get("/notification-api/unread-count")
      .then((res) => setUnreadCount(res.data.payload))
      .catch((err) => console.error("Failed to fetch notifications", err));
  } else {
    setUnreadCount(0);
  }
}, [user]);

// Function to handle clicking the bell (opens notifications & clears badge)
const handleBellClick = async () => {
  // 1. Open your notifications dropdown/modal here (your existing code)
  // setIsNotificationsOpen(!isNotificationsOpen); 
  
  // 2. Clear the badge by marking them as read
  if (unreadCount > 0) {
    try {
      await api.post("/notification-api/mark-all-read");
      setUnreadCount(0); // Instantly hide the badge
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }
};

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <FaPaw className="text-accent" /> RescueNet
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="hidden md:inline text-sm text-gray-600">Welcome, {user.firstName}</span>
            <Link to={dashboardLink} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-700 transition">Dashboard</Link>
            <button onClick={logout} className="text-red-500 hover:text-red-700"><FaSignOutAlt /></button>
          </>
        ) : (
          <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-700 transition">Login</Link>
        )}
      </div>
      {/* Notification Bell */}
<div className="relative cursor-pointer" onClick={handleBellClick}>
  {/* Your existing Bell Icon */}
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 hover:text-[#0066cc] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>

  {/* ✅ THE RED BADGE */}
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  )}
</div>
    </nav>
  );
};