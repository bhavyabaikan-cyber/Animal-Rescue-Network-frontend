import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, loadingClass } from "../styles/common";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notification-api");
      setNotifications(res.data.payload || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification-api/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notification-api/read-all");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notification-api/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "case_update": return "📋";
      case "adoption": return "🏠";
      case "donation": return "💰";
      case "message": return "💬";
      default: return "🔔";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "case_update": return "bg-blue-100 text-blue-600";
      case "adoption": return "bg-purple-100 text-purple-600";
      case "donation": return "bg-green-100 text-green-600";
      case "message": return "bg-orange-100 text-orange-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <p className={loadingClass}>Loading notifications...</p>;

  return (
    <div className={pageWrapper}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f]">Notifications</h1>
          <p className="text-[#6e6e73] mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[#0066cc] text-white text-sm font-semibold rounded-lg hover:bg-[#0052a3] transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "all" ? "bg-[#0066cc] text-white" : "bg-white text-[#6e6e73] hover:bg-[#f5f5f7] border border-[#e8e8ed]"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "unread" ? "bg-[#0066cc] text-white" : "bg-white text-[#6e6e73] hover:bg-[#f5f5f7] border border-[#e8e8ed]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e8e8ed]">
          <p className="text-6xl mb-4">🔔</p>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="text-[#6e6e73]">
            {filter === "unread" ? "You're all caught up! Great job." : "When you get notifications, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`bg-white rounded-xl border p-5 transition hover:shadow-md cursor-pointer ${
                notif.read ? "border-[#e8e8ed]" : "border-[#0066cc] bg-blue-50/30"
              }`}
              onClick={() => {
                if (!notif.read) markAsRead(notif._id);
                if (notif.link) navigate(notif.link);
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${getColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${notif.read ? "text-[#1d1d1f]" : "text-[#0066cc]"}`}>
                        {notif.title}
                      </h4>
                      <p className="text-sm text-[#6e6e73] mb-2">{notif.message}</p>
                      <p className="text-xs text-[#a1a1a6]">
                        {new Date(notif.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.read && (
                        <span className="w-2 h-2 bg-[#0066cc] rounded-full"></span>
                      )}
                      <button
                        onClick={(e) => deleteNotification(notif._id, e)}
                        className="p-1.5 text-[#a1a1a6] hover:text-[#ff3b30] hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}