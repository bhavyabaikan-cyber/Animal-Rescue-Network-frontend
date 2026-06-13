import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { loadingClass } from "../styles/common";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get("/admin-api/stats"),
          api.get("/admin-api/users")
        ]);
        setStats(statsRes.data.payload);
        setUsers(usersRes.data.payload);
      } catch (err) {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "ADMIN") fetchData();
  }, [user]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin-api/users/${userId}/toggle-status`);
      setUsers(users.map(u => u._id === userId ? { ...u, isUserActive: !currentStatus } : u));
      toast.success(`User ${currentStatus ? "deactivated" : "activated"}`);
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  if (loading) return <p className={loadingClass}>Loading admin dashboard...</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-[#1d1d1f] to-[#434344] rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Manage users, monitor platform health, and moderate content.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Total Users</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{stats?.users || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Total Cases</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{stats?.animals || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Successful Adoptions</p>
          <p className="text-3xl font-bold text-emerald-600">{stats?.adopted || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Total Donations</p>
          <p className="text-3xl font-bold text-[#0066cc]">₹{(stats?.totalDonations || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#e8e8ed]">
          <h2 className="text-xl font-bold text-[#1d1d1f]">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8f9fa] text-[#6e6e73]">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed]">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-[#f8f9fa]">
                  <td className="px-6 py-4 font-medium text-[#1d1d1f]">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4 text-[#6e6e73]">{u.email}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-[#f5f5f7] rounded-full text-xs font-medium">{u.role}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isUserActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      {u.isUserActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleUserStatus(u._id, u.isUserActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${u.isUserActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                    >
                      {u.isUserActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}