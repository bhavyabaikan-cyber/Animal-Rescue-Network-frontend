import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../store/authStore"; // Adjust path if needed

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      // ✅ CRITICAL FIX: Hardcode the production URL as a fallback
      const SOCKET_URL = import.meta.env.VITE_API_URL || "https://animal-rescue-network-backend-95mm.onrender.com";
      
      console.log("🔌 Connecting to socket at:", SOCKET_URL);

      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem("token"),
          userId: user.id
        },
        transports: ['websocket', 'polling'] // ✅ Forces websocket connection
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket Connected successfully!");
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket Connection Error:", err.message);
      });

      newSocket.on("getOnlineUsers", (users) => {
        console.log("🟢 Online users updated:", users);
        setOnlineUsers(users);
      });

      setSocket(newSocket);
      
      return () => {
        newSocket.off("getOnlineUsers");
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setOnlineUsers([]);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);