import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { pageWrapper, loadingClass } from "../styles/common";

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get("/user-api/badges")
        .then(res => setBadges(res.data.payload))
        .catch(err => console.error("Failed to fetch badges", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <p className={loadingClass}>Loading your achievements...</p>;

  return (
    <div className={pageWrapper}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">🏆 Your Achievements</h1>
          <p className="text-[#6e6e73]">Badges you've earned for helping animals in need</p>
        </div>

        {badges.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm p-12 text-center">
            <p className="text-6xl mb-4">🎯</p>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No badges yet!</h3>
            <p className="text-[#6e6e73]">Start reporting, volunteering, donating, or adopting to earn your first badge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div key={badge.id} className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm p-6 text-center hover:shadow-lg transition">
                <div className="text-5xl mb-4">{badge.icon}</div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-1">{badge.title}</h3>
                <p className="text-sm text-[#6e6e73]">{badge.description}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  ✓ Earned
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}