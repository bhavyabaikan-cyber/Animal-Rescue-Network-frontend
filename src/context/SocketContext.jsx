// import { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { useAuth } from "../store/authStore";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const { user } = useAuth();
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   useEffect(() => {
//     if (user) {
//       const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:12000");     auth: {
//           token: localStorage.getItem("token"),
//           userId: user.id
//         }
//       });

//       newSocket.on("connect", () => {
//         console.log("✅ Socket Connected!");
//       });

//       // ✅ Listen for real-time online users list from server
//       newSocket.on("getOnlineUsers", (users) => {
//         setOnlineUsers(users);
//       });

//       setSocket(newSocket);
      
//       return () => {
//         newSocket.off("getOnlineUsers");
//         newSocket.close();
//       };
//     } else {
//       setOnlineUsers([]); // Clear online users if logged out
//     }
//   }, [user]);

//   return (
//     <SocketContext.Provider value={{ socket, onlineUsers }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../store/authStore";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      // ✅ FIXED: Proper syntax for socket.io connection
            const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:12000", {
        auth: {
          token: localStorage.getItem("token"),
          userId: user.id
        }
      });
      
      newSocket.on("connect", () => {
        console.log("✅ Socket Connected!");
      });

      // ✅ Listen for real-time online users list from server
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);
      
      return () => {
        newSocket.off("getOnlineUsers");
        newSocket.close();
      };
    } else {
      setOnlineUsers([]); // Clear online users if logged out
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);