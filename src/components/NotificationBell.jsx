import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
export default function NotificationBell() {
const { user } = useAuth();
const navigate = useNavigate();
const [unreadCount, setUnreadCount] = useState(0);
const [notifications, setNotifications] = useState([]);
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
const fetchNotifications = async () => {
try {
const res = await api.get("/notification-api");
setNotifications(res.data.payload || []);
} catch (err) {
console.error("Failed to fetch notifications", err);
}
};
// ✅ THIS IS THE MAGIC FUNCTION
const handleBellClick = async () => {
const newIsOpen = !isOpen;
setIsOpen(newIsOpen);
// If we are OPENING the dropdown, fetch notifications and vanish badge
if (newIsOpen) {
await fetchNotifications();
if (unreadCount > 0) {
setUnreadCount(0);
try {
await api.post("/notification-api/mark-all-read");
} catch (err) {
console.error("Failed to mark notifications as read", err);
}
}
}
};
// ✅ Navigate to case when clicking notification
const handleNotificationClick = (notification) => {
setIsOpen(false);
if (notification.link) {
navigate(notification.link);
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
     <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#e8e8ed] py-2 z-50 max-h-96 overflow-y-auto">
       <div className="px-4 py-2 border-b border-[#e8e8ed] flex justify-between items-center">
         <h3 className="font-semibold text-[#1d1d1f] text-sm">Notifications</h3>
         <span className="text-xs text-[#6e6e73]">
          {notifications.length} total
         </span>
       </div>
       {notifications.length === 0 ? (
         <div className="p-4 text-center text-sm text-[#6e6e73]">
          No notifications yet
         </div>
       ) : (
         <div className="divide-y divide-[#e8e8ed]">
          {notifications.map((notif) => (
             <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`px-4 py-3 hover:bg-[#f5f5f7] cursor-pointer transition ${!notif.read ? "bg-blue-50" : ""}`}
             >
               <p className="text-sm font-semibold text-[#1d1d1f]">{notif.title}</p>
               <p className="text-xs text-[#6e6e73] mt-1">{notif.message}</p>
               <p className="text-[10px] text-[#a1a1a6] mt-1">
                {new Date(notif.createdAt).toLocaleString()}
               </p>
             </div>
          ))}
         </div>
       )}
     </div>
  )}
 </div>
);
}