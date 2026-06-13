import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { useSocket } from "../context/SocketContext";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, loadingClass } from "../styles/common";

export default function ChatWindow() {
  const { convId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherUserTyping]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/message-api/conversations/${convId}`);
        const convData = res.data.payload;
        setConversation(convData);
        
        const other = convData.participants.find(p => p._id !== user.id);
        setOtherUser(other);
        setMessages(convData.messages || []);

        // ✅ AUTO-MARK AS READ: Tell backend we viewed this conversation
        await api.put(`/message-api/conversations/${convId}/read`);
        
      } catch (err) {
        console.error("Failed to fetch conversation:", err);
        toast.error("Failed to load chat");
      }
    };
    
    if (convId && user) {
      fetchData();
    }
  }, [convId, user]);

  useEffect(() => {
    if (socket && convId) {
      socket.emit("joinRoom", convId);

      const handleReceiveMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
      };

      const handleUserTyping = (data) => {
        if (data.userId !== user.id) setIsOtherUserTyping(true);
      };

      const handleUserStoppedTyping = (data) => {
        if (data.userId !== user.id) setIsOtherUserTyping(false);
      };

      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("userTyping", handleUserTyping);
      socket.on("userStoppedTyping", handleUserStoppedTyping);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("userTyping", handleUserTyping);
        socket.off("userStoppedTyping", handleUserStoppedTyping);
      };
    }
  }, [socket, convId, user.id]);

  const handleTyping = () => {
    socket.emit("typing", { roomId: convId, userId: user.id });
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket.emit("stopTyping", { roomId: convId, userId: user.id });
    }, 2000);
    setTypingTimeout(timeout);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    // ✅ FILE SIZE VALIDATION (Max 5MB)
    if (image && image.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setSending(true);
    const formData = new FormData();
    if (newMessage.trim()) formData.append("text", newMessage.trim());
    if (image) formData.append("image", image);

    try {
      const res = await api.post(`/message-api/conversations/${convId}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const sentMsg = res.data.payload;
      setMessages((prev) => [...prev, sentMsg]);
      socket.emit("sendMessage", { roomId: convId, message: sentMsg });
      
      setNewMessage("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      socket.emit("stopTyping", { roomId: convId, userId: user.id });
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!conversation || !otherUser) return <p className={loadingClass}>Loading chat...</p>;

  const isOnline = onlineUsers.includes(otherUser._id);

  return (
    <div className={`${pageWrapper} h-[calc(100vh-140px)] flex flex-col`}>
      <div className="bg-white border border-[#e8e8ed] rounded-t-2xl p-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/messages")} className="p-2 hover:bg-[#f5f5f7] rounded-full transition md:hidden">←</button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {otherUser.firstName?.[0]?.toUpperCase() || "U"}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1d1d1f]">{otherUser.firstName} {otherUser.lastName}</h3>
            <p className={`text-xs flex items-center gap-1.5 font-medium ${isOnline ? 'text-emerald-600' : 'text-[#6e6e73]'}`}>
              {isOnline ? <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>Online</> : <><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>Offline</>}
            </p>
          </div>
        </div>
        <button onClick={() => navigate(`/case/${conversation.animalId}`)} className="text-sm text-[#0066cc] hover:underline font-medium">View Case →</button>
      </div>

      <div className="flex-1 bg-[#f8f9fa] border-x border-[#e8e8ed] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-[#6e6e73]"><p className="text-4xl mb-2">👋</p><p>No messages yet. Say hello!</p></div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender._id === user.id;
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'bg-[#0066cc] text-white rounded-br-md' : 'bg-white text-[#1d1d1f] border border-[#e8e8ed] rounded-bl-md'}`}>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Attachment" className="rounded-lg mb-2 max-w-full h-auto" />}
                  {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-blue-100' : 'text-[#a1a1a6]'}`}>
                    <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                    {isMine && <span className="text-[10px]">{msg.readBy?.some(r => r.toString() === otherUser._id) ? '✓✓' : '✓'}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isOtherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#e8e8ed] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white border border-[#e8e8ed] rounded-b-2xl p-4 flex items-end gap-3 shadow-sm flex-shrink-0">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-[#6e6e73] hover:bg-[#f5f5f7] rounded-full transition flex-shrink-0" title="Attach image">📎</button>
        <div className="flex-1 relative">
          <textarea
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
            placeholder="Type a message..."
            className="w-full px-4 py-2.5 bg-[#f5f5f7] border border-[#e8e8ed] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066cc] resize-none max-h-32"
            rows="1"
            style={{ minHeight: '44px' }}
          />
          {image && (
            <div className="absolute -top-12 left-0 bg-white border border-[#e8e8ed] rounded-lg p-2 shadow-md flex items-center gap-2">
              <span className="text-xs text-[#6e6e73] truncate max-w-[150px]">{image.name}</span>
              <button type="button" onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          )}
        </div>
        <button type="submit" disabled={sending || (!newMessage.trim() && !image)} className="p-2.5 bg-[#0066cc] text-white rounded-full hover:bg-[#0052a3] transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}