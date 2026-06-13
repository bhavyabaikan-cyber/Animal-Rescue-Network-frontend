import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { container, grid, card, loadingSpinner, emptyState } from "../styles/common";

export default function AnimalList() {
  const [animals, setAnimals] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/common-api/animals")
      .then(res => setAnimals(res.data.payload || []))
      .catch(() => setAnimals([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? animals : animals.filter(a => a.status === filter);
  const badge = (s) => ({ Pending: "bg-amber-100 text-amber-800", "In Transit": "bg-blue-100 text-blue-800", Rescued: "bg-emerald-100 text-emerald-800", Adopted: "bg-purple-100 text-purple-800" }[s] || "bg-gray-100 text-gray-800");

  return (
    <div className={container}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Active Rescue Cases</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option>All</option><option>Pending</option><option>In Transit</option><option>Rescued</option><option>Adopted</option>
        </select>
      </div>

      {loading ? <p className={loadingSpinner}>Loading cases...</p> : filtered.length === 0 ? (
        <div className={emptyState}>No cases match your filter. <button onClick={() => window.location.reload()} className="text-indigo-600 ml-1">Refresh</button></div>
      ) : (
        <div className={grid}>
          {filtered.map(a => (
            <div key={a._id} className={`${card} overflow-hidden flex flex-col`}>
              <div className="h-48 bg-slate-100 relative">
                {a.imageUrl ? <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">📷 No Photo</div>}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${badge(a.status)}`}>{a.status}</span>
                {a.visibility === "private" && <span className="absolute top-3 left-3 px-2 py-1 bg-gray-800 text-white rounded-full text-xs">🔒 Private</span>}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{a.name || "Unnamed"}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">{a.description}</p>
                <p className="text-xs text-slate-400 mb-4">📍 {a.location} | 💰 ${a.totalPledged || 0} pledged</p>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => navigate(`/animal/${a._id}`)} className="flex-1 px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 transition">View</button>
                  {user?.role === "VOLUNTEER" && a.status !== "Adopted" && <button onClick={() => navigate(`/edit/${a._id}`)} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">Update</button>}
                  {user?.role === "REPORTER" && a.status === "Pending" && <button onClick={() => navigate(`/edit/${a._id}`)} className="flex-1 px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 transition">Edit</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}