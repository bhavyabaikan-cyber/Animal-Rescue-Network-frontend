import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { pageWrapper, loadingClass } from "../styles/common";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/message-api/conversations");
        setConversations(res.data.payload || []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchConversations();
  }, [user]);

  if (loading) return <p className={loadingClass}>Loading conversations...</p>;

  if (conversations.length === 0) {
    return (
      <div className={`${pageWrapper} text-center py-20`}>
        <p className="text-6xl mb-4">💬</p>
        <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">No conversations yet</h3>
        <p className="text-[#6e6e73] mb-6">Start a conversation by visiting an animal's case page.</p>
        <button onClick={() => navigate("/cases")} className="px-6 py-3 bg-[#0066cc] text-white font-semibold rounded-lg hover:bg-[#0052a3] transition">
          Browse Cases
        </button>
      </div>
    );
  }

  return (
    <div className={pageWrapper}>
      <h1 className="text-3xl font-bold text-[#1d1d1f] mb-6">Messages</h1>
      <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden">
        {conversations
          .filter(conv => conv && conv._id && conv.participants) // ✅ Filter out invalid conversations
          .map((conv) => {
            const otherUser = conv.participants.find(p => p && p._id !== user.id);
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            
            return (
              <div 
                key={conv._id} 
                onClick={() => navigate(`/messages/${conv._id}`)}
                className="flex items-center gap-4 p-4 border-b border-[#e8e8ed] last:border-0 hover:bg-[#f8f9fa] cursor-pointer transition"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {otherUser?.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-[#1d1d1f] truncate">
                      {otherUser?.firstName || "User"} {otherUser?.lastName || ""}
                    </h3>
                    {lastMsg && (
                      <span className="text-xs text-[#a1a1a6] flex-shrink-0 ml-2">
                        {new Date(lastMsg.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6e6e73] truncate">
                    {lastMsg 
                      ? (lastMsg.sender?._id === user.id 
                          ? `You: ${lastMsg.text || "📷 Photo"}` 
                          : `${lastMsg.text || "📷 Photo"}`)
                      : "No messages yet"
                    }
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}