import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { pageWrapper, articleCardClass, loadingClass, emptyStateClass } from "../styles/common";

export default function Cases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || ""); // What user is typing
  const [search, setSearch] = useState(searchParams.get("search") || ""); // What's actually being searched
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [urgency, setUrgency] = useState(searchParams.get("urgency") || "All");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "date");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");

  // Fetch animals when search/filters change
  useEffect(() => {
    const fetchAnimals = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search, status, urgency, sortBy, sortOrder });
        const res = await api.get(`/common-api/animals?${params.toString()}`);
        setAnimals(res.data.payload || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, [search, status, urgency, sortBy, sortOrder]);

  // ✅ Handle Enter key press for search
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearch(searchInput); // Trigger search
      // Update URL
      const newParams = new URLSearchParams({ search: searchInput, status, urgency, sortBy, sortOrder });
      setSearchParams(newParams);
    }
  };

  // ✅ Clear search
  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    const newParams = new URLSearchParams({ search: "", status, urgency, sortBy, sortOrder });
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    if (key === "status") setStatus(value);
    else if (key === "urgency") setUrgency(value);
    else if (key === "sortBy") setSortBy(value);
    else if (key === "sortOrder") setSortOrder(value);
    
    const newParams = new URLSearchParams({ search, status, urgency, sortBy, sortOrder });
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-amber-100 text-amber-800 border border-amber-200",
      "In Transit": "bg-blue-100 text-blue-800 border border-blue-200",
      Rescued: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      "Adoption Pending": "bg-purple-100 text-purple-800 border border-purple-200",
      Adopted: "bg-gray-100 text-gray-800 border border-gray-200"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <p className={loadingClass}>Loading cases...</p>;

  return (
    <div className={pageWrapper}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🐾 Animal Cases</h1>
        <p className="text-blue-100">Find animals in need of help, rescue, or adoption.</p>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e8e8ed] shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input with Enter Key */}
        <div className="relative lg:col-span-2">
          <input 
            type="text" 
            placeholder="🔍 Search name, species, location... (Press Enter)" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full px-4 py-2 pr-10 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
          />
          {searchInput && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1a6] hover:text-[#1d1d1f] transition"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <select value={status} onChange={(e) => handleFilterChange("status", e.target.value)} className="px-4 py-2 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg focus:outline-none">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Rescued">Rescued</option>
          <option value="Adoption Pending">Adoption Pending</option>
          <option value="Adopted">Adopted</option>
        </select>

        <select value={urgency} onChange={(e) => handleFilterChange("urgency", e.target.value)} className="px-4 py-2 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg focus:outline-none">
          <option value="All">All Urgency</option>
          <option value="true">🚨 Urgent Only</option>
          <option value="false">Normal</option>
        </select>

        <select value={`${sortBy}-${sortOrder}`} onChange={(e) => {
          const [newSortBy, newSortOrder] = e.target.value.split("-");
          handleFilterChange("sortBy", newSortBy);
          handleFilterChange("sortOrder", newSortOrder);
        }} className="px-4 py-2 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg focus:outline-none">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="donations-desc">Highest Donations</option>
          <option value="urgency-desc">Most Urgent</option>
        </select>
      </div>

      {/* Search Info Banner */}
      {search && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-[#166534]">
            <span className="font-semibold">🔍 Searching for:</span> "{search}"
            {animals.length > 0 && <span className="ml-2">• Found {animals.length} result{animals.length !== 1 ? 's' : ''}</span>}
          </p>
          <button onClick={clearSearch} className="text-xs text-[#0066cc] font-semibold hover:underline">
            Clear Search
          </button>
        </div>
      )}

      {/* Results */}
      {animals.length === 0 ? (
        <div className={`${emptyStateClass} py-20 bg-white rounded-2xl border border-[#e8e8ed]`}>
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">
            {search ? "No animals found" : "No cases available"}
          </h3>
          <p className="text-[#6e6e73] mb-6 max-w-md mx-auto">
            {search 
              ? `We couldn't find any animals matching "${search}". Try adjusting your search terms or filters.`
              : "There are no animal cases at the moment. Check back later!"
            }
          </p>
          {search && (
            <button 
              onClick={clearSearch}
              className="px-6 py-3 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold rounded-xl transition shadow-sm"
            >
              Clear Search & View All Cases
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map(a => (
            <div key={a._id} className={`${articleCardClass} p-5 hover:shadow-lg transition cursor-pointer flex flex-col`} onClick={() => navigate(`/case/${a._id}`)}>
              <div className="h-48 bg-[#f5f5f7] rounded-xl overflow-hidden mb-4 relative">
                {a.imageUrl ? <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>}
                {a.urgency && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">🚨 URGENT</span>}
                <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(a.status)}`}>{a.status}</span>
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-1">{a.name || "Unnamed"} <span className="text-sm font-normal text-[#6e6e73]">({a.species})</span></h3>
              <p className="text-sm text-[#6e6e73] line-clamp-2 mb-3 flex-1">{a.description}</p>
              <div className="flex justify-between items-center text-xs text-[#a1a1a6] pt-3 border-t border-[#e8e8ed]">
                <span>📍 {a.location?.address || "Unknown"}</span>
                <span className="font-semibold text-[#34c759]">💰 ₹{a.totalPledged || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}