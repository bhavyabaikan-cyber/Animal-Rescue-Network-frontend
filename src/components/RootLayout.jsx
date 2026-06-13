import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}