import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import api from "../api/client";

export default function PointsDisplay() {
  const { user } = useAuth();
  const [points, setPoints] = useState(null);

  useEffect(() => {
    if (user) {
      api.get("/user-api/points")
        .then(res => setPoints(res.data.payload))
        .catch(err => console.error("Failed to fetch points", err));
    }
  }, [user]);

  if (!points) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-[#e8e8ed] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] flex items-center gap-2">
            {points.level.icon} {points.level.name}
          </h2>
          <p className="text-sm text-[#6e6e73]">Your contribution level</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold" style={{ color: points.level.color }}>
            {points.totalPoints}
          </p>
          <p className="text-xs text-[#6e6e73]">Total Points</p>
        </div>
      </div>

      {points.breakdown.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-[#e8e8ed]">
          <p className="text-xs font-semibold text-[#6e6e73] uppercase">Points Breakdown</p>
          {points.breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-[#1d1d1f]">{item.action}</span>
              <span className="font-semibold text-[#0066cc]">+{item.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}