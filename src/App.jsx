import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAuth } from "./store/authStore";
import { SocketProvider } from "./context/SocketContext";

import SidebarLayout from "./components/SidebarLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthModal from "./components/AuthModal";

import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Cases from "./components/Cases";
import CaseDetails from "./components/CaseDetails";
import ReportAnimal from "./components/ReportAnimal";
import Donate from "./components/Donate";
import DonateSuccess from "./components/DonateSuccess";
import VolunteerPortal from "./components/VolunteerPortal";
import AdopterDashboard from "./components/AdopterDashboard";
import DonorDashboard from "./components/DonorDashboard";
import ReporterDashboard from "./components/ReporterDashboard";
import Profile from "./components/Profile";
import Messages from "./components/Messages";
import ChatWindow from "./components/ChatWindow";
import MapView from "./components/MapView";
import AdminDashboard from "./components/AdminDashboard";
import SuccessStories from "./components/SuccessStories";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Badges from "./components/Badges";
import NotificationsPage from "./components/NotificationsPage"; // ✅ Added

function App() {
  const { refreshSession } = useAuth();
  const [authModal, setAuthModal] = useState({ open: false, view: "login" });

  useEffect(() => {
    refreshSession();
    const handleOpenAuth = (e) => setAuthModal({ open: true, view: e.detail || "login" });
    window.addEventListener("openAuth", handleOpenAuth);
    return () => window.removeEventListener("openAuth", handleOpenAuth);
  }, [refreshSession]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <SidebarLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
        { path: "cases", element: <Cases /> },
        { path: "case/:id", element: <CaseDetails /> },
        { path: "report", element: <ProtectedRoute requiredRole="REPORTER"><ReportAnimal /></ProtectedRoute> },
        { path: "donate", element: <ProtectedRoute requiredRole="DONOR"><Donate /></ProtectedRoute> },
        { path: "donate-success", element: <ProtectedRoute><DonateSuccess /></ProtectedRoute> },
        { path: "volunteer", element: <ProtectedRoute><VolunteerPortal /></ProtectedRoute> },
        { path: "adoptions", element: <ProtectedRoute requiredRole="ADOPTER"><AdopterDashboard /></ProtectedRoute> },
        { path: "donor", element: <ProtectedRoute requiredRole="DONOR"><DonorDashboard /></ProtectedRoute> },
        { path: "reporter", element: <ProtectedRoute requiredRole="REPORTER"><ReporterDashboard /></ProtectedRoute> },
        { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
        { path: "messages", element: <ProtectedRoute><Messages /></ProtectedRoute> },
        { path: "messages/:convId", element: <ProtectedRoute><ChatWindow /></ProtectedRoute> },
        { path: "notifications", element: <ProtectedRoute><NotificationsPage /></ProtectedRoute> }, // ✅ Added
        { path: "map", element: <MapView /> },
        { path: "admin", element: <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute> },
        { path: "stories", element: <SuccessStories /> },
        { path: "analytics", element: <ProtectedRoute requiredRole="ADMIN"><AnalyticsDashboard /></ProtectedRoute> },
        { path: "badges", element: <Badges /> },
      ],
    },
  ]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
      <AuthModal isOpen={authModal.open} onClose={() => setAuthModal({ open: false, view: "login" })} initialView={authModal.view} />
    </>
  );
}

export default App;