import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/authStore";
import api from "../api/client";

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count when user logs in
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notification-api/unread-count");
      setUnreadCount(res.data.payload || 0);
    } catch (err) {
      console.error("Failed to fetch notification count", err);
    }
  };

  // ✅ THIS IS THE MAGIC FUNCTION
  const handleBellClick = async () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // If we are OPENING the dropdown, instantly vanish the badge and mark as read
    if (newIsOpen && unreadCount > 0) {
      setUnreadCount(0); // ✅ Instantly hides the badge on the UI!
      
      try {
        await api.post("/notification-api/mark-all-read");
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-[#6e6e73] hover:text-[#0066cc] transition rounded-lg hover:bg-[#f5f5f7]"
      >
        {/* Bell Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* ✅ The Red Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-[#ff3b30] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#e8e8ed] py-2 z-50">
          <div className="px-4 py-2 border-b border-[#e8e8ed] flex justify-between items-center">
            <h3 className="font-semibold text-[#1d1d1f] text-sm">Notifications</h3>
            <span className="text-xs text-[#6e6e73]">
              {unreadCount === 0 ? "All caught up!" : `${unreadCount} new`}
            </span>
          </div>
          <div className="p-4 text-center text-sm text-[#6e6e73]">
            {unreadCount === 0 ? "No new notifications" : "Loading notifications..."}
          </div>
        </div>
      )}
    </div>
  );
}