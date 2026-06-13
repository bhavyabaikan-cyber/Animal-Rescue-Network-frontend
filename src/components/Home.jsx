import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [urgentCases, setUrgentCases] = useState([]);
  const [featuredCases, setFeaturedCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroImages = [
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1600&q=80"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get("/common-api/animals");
        const allCases = res.data.payload || [];
        const urgent = allCases.filter(a => a.urgency || a.status === "Pending").slice(0, 4);
        const featured = allCases.filter(a => a.status === "Rescued" || a.status === "Adoption Pending").slice(0, 4);
        setUrgentCases(urgent);
        setFeaturedCases(featured);
      } catch (err) {
        console.error("Failed to fetch cases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleAction = (path) => {
    if (path === "/login") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
    } else if (path === "/register") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    } else if (!user) {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 md:pb-0">
      
      {/* HERO SECTION */}
      <section className="relative h-[400px] sm:h-[500px] overflow-hidden">
        {heroImages.map((img, index) => (
          <img key={index} src={img} alt={`Hero Slide ${index + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'serif' }}>"Save a Life Today."</h1>
          <button onClick={() => handleAction("/cases?status=Adoption%20Pending")} className="px-8 py-4 bg-[#34c759] hover:bg-[#28a745] text-white font-bold text-lg rounded-full transition shadow-lg transform hover:scale-105">FIND YOUR MATCH</button>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {heroImages.map((_, index) => (
            <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"}`} />
          ))}
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="bg-white border-b border-[#e8e8ed]">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-[#0066cc] mb-2">500+</div>
              <div className="text-sm text-[#6e6e73]">Animals Rescued</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-[#34c759] mb-2">350+</div>
              <div className="text-sm text-[#6e6e73]">Successful Adoptions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-[#0066cc] mb-2">200+</div>
              <div className="text-sm text-[#6e6e73]">Active Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-[#34c759] mb-2">₹15L+</div>
              <div className="text-sm text-[#6e6e73]">Funds Raised</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ QUICK ACTION ICONS (STATIC / NON-CLICKABLE) */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-[#e8e8ed] p-6 grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2 cursor-default">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-2xl">🚨</div>
            <span className="text-xs font-semibold text-[#1d1d1f] text-center">REPORT A STRAY</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-default">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-2xl">💰</div>
            <span className="text-xs font-semibold text-[#1d1d1f] text-center">DONATE</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-default">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-2xl">🤝</div>
            <span className="text-xs font-semibold text-[#1d1d1f] text-center">VOLUNTEER</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-default">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-2xl">🏆</div>
            <span className="text-xs font-semibold text-[#1d1d1f] text-center">SUCCESS STORIES</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-[#1d1d1f] text-center mb-12">How RescueNet Works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#0066cc] rounded-full flex items-center justify-center text-4xl text-white mb-4 shadow-lg">1️⃣</div>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Report or Browse</h3>
            <p className="text-[#6e6e73] text-sm">Report animals in need or browse available rescues looking for help and homes.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#34c759] rounded-full flex items-center justify-center text-4xl text-white mb-4 shadow-lg">2️⃣</div>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Volunteer & Support</h3>
            <p className="text-[#6e6e73] text-sm">Our volunteers rescue, transport, and provide medical care. You can help by donating.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#0066cc] rounded-full flex items-center justify-center text-4xl text-white mb-4 shadow-lg">3️⃣</div>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Adopt & Celebrate</h3>
            <p className="text-[#6e6e73] text-sm">Find your perfect match, complete the adoption, and give an animal a forever home.</p>
          </div>
        </div>
      </section>

      {/* URGENT RESCUES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#1d1d1f]">URGENT RESCUES</h2>
          <button onClick={() => handleAction("/cases?status=Pending")} className="text-[#0066cc] text-sm font-semibold hover:underline">View All →</button>
        </div>
        {loading ? (
          <p className="text-center text-[#6e6e73] py-8">Loading...</p>
        ) : urgentCases.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#e8e8ed]"><p className="text-[#6e6e73]">No urgent cases right now.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {urgentCases.map(a => (
              <div key={a._id} onClick={() => navigate(`/case/${a._id}`)} className="bg-white rounded-xl overflow-hidden border border-[#e8e8ed] hover:shadow-md transition cursor-pointer">
                <div className="h-32 bg-[#f5f5f7] relative">
                  {a.imageUrl ? <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>}
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-[#ff3b30] text-white text-[10px] font-bold rounded uppercase">URGENT</span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-[#1d1d1f] text-sm">{a.name || "Unnamed"}</h3>
                  <p className="text-xs text-[#6e6e73] mt-1">📍 {a.location?.address?.split(',')[0] || "Unknown"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED ADOPTABLES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#1d1d1f]">FEATURED ADOPTABLES</h2>
          <button onClick={() => handleAction("/cases?status=Adoption%20Pending")} className="text-[#0066cc] text-sm font-semibold hover:underline">View All →</button>
        </div>
        {loading ? (
          <p className="text-center text-[#6e6e73] py-8">Loading...</p>
        ) : featuredCases.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#e8e8ed]"><p className="text-[#6e6e73]">Check back soon for new friends! 🐕</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCases.map(a => (
              <div key={a._id} className="bg-white rounded-2xl overflow-hidden border border-[#e8e8ed] hover:shadow-lg transition">
                <div className="h-48 bg-[#f5f5f7] relative">
                  {a.imageUrl ? <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#1d1d1f] text-lg">{a.name || "Unnamed"}</h3>
                  <p className="text-xs text-[#6e6e73] mt-1 line-clamp-2 h-8">{a.description || "Waiting for a forever home."}</p>
                  <button onClick={() => navigate(`/case/${a._id}`)} className="w-full mt-4 py-2.5 bg-[#34c759] hover:bg-[#28a745] text-white text-sm font-bold rounded-lg transition">ADOPT</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-[#0066cc] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RescueNet?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏥</div>
              <h3 className="text-lg font-bold mb-2">Full Medical Care</h3>
              <p className="text-blue-100 text-sm">Every animal receives complete veterinary care and vaccinations.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-bold mb-2">Transparent Process</h3>
              <p className="text-blue-100 text-sm">Track every rupee spent on rescue and rehabilitation.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-lg font-bold mb-2">Expert Support</h3>
              <p className="text-blue-100 text-sm">Guidance from experienced volunteers and veterinarians.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💚</div>
              <h3 className="text-lg font-bold mb-2">Forever Homes</h3>
              <p className="text-blue-100 text-sm">Careful matching to ensure successful adoptions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ NEW SUCCESS STORIES BAR */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-4">
        <div className="bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">📖 Inspiring Success Stories</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">See how your support has transformed lives. Read about animals who found their forever homes thanks to RescueNet.</p>
          <button 
            onClick={() => navigate("/stories")} 
            className="px-8 py-4 bg-white text-[#8b5cf6] font-bold rounded-full hover:bg-indigo-50 transition shadow-lg"
          >
            Read Success Stories
          </button>
        </div>
      </section>

      {/* ✅ READY TO MAKE A DIFFERENCE BAR (EXISTING) */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-[#34c759] to-[#28a745] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-green-50 mb-8 max-w-2xl mx-auto">Join thousands of animal lovers who are changing lives every day through RescueNet.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => handleAction("/register")} className="px-8 py-4 bg-white text-[#34c759] font-bold rounded-full hover:bg-green-50 transition shadow-lg">Join RescueNet Today</button>
            <button onClick={() => handleAction("/cases")} className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition">Browse Animals</button>
          </div>
        </div>
      </section>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e8ed] py-3 px-6 flex justify-between items-center z-50 shadow-lg">
        <button onClick={() => navigate("/")} className="flex flex-col items-center text-[#0066cc]">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold mt-1">Home</span>
        </button>
        <button onClick={() => handleAction("/cases?status=Adoption%20Pending")} className="flex flex-col items-center text-[#6e6e73]">
          <span className="text-xl">🐾</span>
          <span className="text-[10px] font-medium mt-1">Adopt</span>
        </button>
        <button onClick={() => handleAction("/cases")} className="flex flex-col items-center text-[#6e6e73]">
          <span className="text-xl">🚑</span>
          <span className="text-[10px] font-medium mt-1">Rescues</span>
        </button>
        <button onClick={() => handleAction("/map")} className="flex flex-col items-center text-[#6e6e73]">
          <span className="text-xl">👥</span>
          <span className="text-[10px] font-medium mt-1">Community</span>
        </button>
        <button onClick={() => handleAction(user ? "/dashboard" : "/login")} className="flex flex-col items-center text-[#6e6e73]">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}