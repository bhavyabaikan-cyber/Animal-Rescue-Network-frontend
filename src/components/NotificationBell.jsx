import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { useSocket } from "../context/SocketContext"; // ✅ Added
import api from "../api/client";

export default function NotificationBell() {
  const { user } = useAuth();
  const { socket } = useSocket(); // ✅ Added
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    fetchDropdownData();
    const interval = setInterval(fetchDropdownData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ✅ NEW: Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (!socket || !user) return;

    // Listen for new notifications (try common event names)
    const handleNewNotification = () => {
      console.log("🔔 New notification received via Socket.IO");
      fetchDropdownData(); // Refresh immediately
    };

    const handleNewMessage = () => {
      console.log("💬 New message received via Socket.IO");
      fetchDropdownData(); // Refresh immediately
    };

    // ✅ Listen for multiple possible event names
    socket.on("newNotification", handleNewNotification);
    socket.on("notification", handleNewNotification);
    socket.on("notify", handleNewNotification);
    socket.on("newMessage", handleNewMessage);
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("notification", handleNewNotification);
      socket.off("notify", handleNewNotification);
      socket.off("newMessage", handleNewMessage);
      socket.off("message", handleNewMessage);
    };
  }, [socket, user]);

  const fetchDropdownData = async () => {
    if (!user) return;
    
    try {
      const [notifRes, msgRes] = await Promise.all([
        api.get("/notification-api"),
        api.get("/message-api/unread-summaries")
      ]);
      
      setNotifications(notifRes.data.payload || []);
      setMessages(msgRes.data.payload || []);
      
      const notifUnread = (notifRes.data.payload || []).filter(n => !n.read).length;
      const msgUnread = (msgRes.data.payload || []).reduce((sum, m) => sum + (m.unreadCount || 0), 0);
      
      setUnreadCount(notifUnread + msgUnread);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Failed to fetch dropdown data:", err);
      }
    }
  };

  if (!user) return null;

  const handleNotificationClick = (notif) => {
    setIsOpen(false);
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (notif.link) {
      navigate(notif.link);
    }
  };
  
  const handleMessageClick = (msg) => {
    setIsOpen(false);
    navigate(`/messages/${msg.conversationId}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#e8e8ed] py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-[#e8e8ed]">
            <h3 className="font-semibold text-[#1d1d1f]">Notifications & Messages</h3>
          </div>

          {notifications.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs font-semibold text-[#a1a1a6] uppercase">Notifications</p>
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 hover:bg-[#f5f5f7] cursor-pointer transition ${!notif.read ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm font-semibold text-[#1d1d1f]">{notif.title}</p>
                  <p className="text-xs text-[#6e6e73] truncate">{notif.message}</p>
                </div>
              ))}
            </div>
          )}

          {messages.length > 0 && (
            <div className="py-2 border-t border-[#e8e8ed]">
              <p className="px-4 py-1 text-xs font-semibold text-[#a1a1a6] uppercase">Messages</p>
              {messages.slice(0, 5).map((msg) => (
                <div
                  key={msg.conversationId}
                  onClick={() => handleMessageClick(msg)}
                  className="px-4 py-3 hover:bg-[#f5f5f7] cursor-pointer transition"
                >
                  <p className="text-sm font-semibold text-[#1d1d1f]">{msg.userName}</p>
                  <p className="text-xs text-[#6e6e73] truncate">{msg.lastMessage}</p>
                  {msg.unreadCount > 0 && (
                    <span className="text-xs text-[#0066cc] font-semibold">{msg.unreadCount} unread</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {notifications.length === 0 && messages.length === 0 && (
            <div className="px-4 py-8 text-center text-[#6e6e73] text-sm">
              No new notifications or messages
            </div>
          )}

          <div className="border-t border-[#e8e8ed] py-2">
            <button
              onClick={() => { setIsOpen(false); navigate("/notifications"); }}
              className="w-full px-4 py-2 text-sm text-[#0066cc] hover:bg-[#f5f5f7] text-left font-semibold transition"
            >
              View All Notifications →
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate("/messages"); }}
              className="w-full px-4 py-2 text-sm text-[#0066cc] hover:bg-[#f5f5f7] text-left font-semibold transition"
            >
              View All Messages →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}