import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, loadingClass } from "../styles/common";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = ["#0066cc", "#34c759", "#ff9500", "#ff3b30", "#af52de", "#5ac8fa", "#ffcc00", "#ff2d55"];

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/analytics-api/dashboard");
        setData(res.data.payload);
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "ADMIN") fetchData();
  }, [user]);

  if (loading) return <p className={loadingClass}>Loading analytics...</p>;
  if (!data) return <p className="text-center py-20">No data available</p>;

  // Prepare chart data
  const statusLabels = Object.keys(data.statusDistribution);
  const statusValues = Object.values(data.statusDistribution);

  const speciesLabels = Object.keys(data.speciesDistribution);
  const speciesValues = Object.values(data.speciesDistribution);

  const roleLabels = Object.keys(data.roleDistribution);
  const roleValues = Object.values(data.roleDistribution);

  const monthLabels = data.monthlyTrends.map(m => m.month);
  const monthCounts = data.monthlyTrends.map(m => m.count);

  const donationLabels = data.monthlyDonations.map(m => m.month);
  const donationAmounts = data.monthlyDonations.map(m => m.amount);

  // Line Chart Data
  const lineData = {
    labels: monthLabels,
    datasets: [{
      label: "Rescues",
      data: monthCounts,
      borderColor: "#0066cc",
      backgroundColor: "rgba(0, 102, 204, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#0066cc",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(29, 29, 31, 0.9)",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(232, 232, 237, 0.5)" },
        ticks: { color: "#6e6e73" }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6e6e73" }
      }
    }
  };

  // Bar Chart Data
  const barData = {
    labels: donationLabels,
    datasets: [{
      label: "Donations (₹)",
      data: donationAmounts,
      backgroundColor: "rgba(52, 199, 89, 0.8)",
      borderColor: "#34c759",
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(29, 29, 31, 0.9)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `₹${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(232, 232, 237, 0.5)" },
        ticks: {
          color: "#6e6e73",
          callback: (value) => `₹${value.toLocaleString()}`
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6e6e73" }
      }
    }
  };

  // Pie Chart Data
  const statusPieData = {
    labels: statusLabels,
    datasets: [{
      data: statusValues,
      backgroundColor: COLORS.slice(0, statusLabels.length),
      borderWidth: 2,
      borderColor: "#fff"
    }]
  };

  const speciesPieData = {
    labels: speciesLabels,
    datasets: [{
      data: speciesValues,
      backgroundColor: COLORS.slice(0, speciesLabels.length),
      borderWidth: 2,
      borderColor: "#fff"
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: { size: 12 },
          color: "#6e6e73"
        }
      },
      tooltip: {
        backgroundColor: "rgba(29, 29, 31, 0.9)",
        padding: 12,
        cornerRadius: 8
      }
    }
  };

  return (
    <div className={pageWrapper}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#434344] to-[#1d1d1f] rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
        <p className="text-gray-300">Comprehensive insights into your rescue network's performance.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Total Animals</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{data.metrics.totalAnimals}</p>
          <p className="text-xs text-[#a1a1a6] mt-1">{data.metrics.pending} pending</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Total Donations</p>
          <p className="text-3xl font-bold text-[#0066cc]">₹{data.metrics.totalDonations.toLocaleString()}</p>
          <p className="text-xs text-[#a1a1a6] mt-1">Avg: ₹{data.metrics.avgDonation}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Adoption Rate</p>
          <p className="text-3xl font-bold text-emerald-600">{data.metrics.adoptionRate}%</p>
          <p className="text-xs text-[#a1a1a6] mt-1">{data.metrics.adopted} adopted</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#e8e8ed] shadow-sm">
          <p className="text-sm text-[#6e6e73]">Total Users</p>
          <p className="text-3xl font-bold text-purple-600">{data.metrics.totalUsers}</p>
          <p className="text-xs text-[#a1a1a6] mt-1">{data.metrics.totalDonors} donors</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Rescue Trends */}
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">📈 Monthly Rescue Trends</h3>
          <div style={{ height: "300px" }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Monthly Donation Trends */}
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">💰 Monthly Donations (₹)</h3>
          <div style={{ height: "300px" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">🎯 Case Status Distribution</h3>
          <div style={{ height: "300px" }}>
            <Pie data={statusPieData} options={pieOptions} />
          </div>
        </div>

        {/* Species Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">🐕 Species Distribution</h3>
          <div style={{ height: "300px" }}>
            <Pie data={speciesPieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm mb-8">
        <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">👥 User Role Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roleLabels.map((role, i) => (
            <div key={role} className="p-4 bg-[#f8f9fa] rounded-xl border border-[#e8e8ed] text-center">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold mb-2" style={{ background: COLORS[i % COLORS.length] }}>
                {roleValues[i]}
              </div>
              <p className="text-sm font-semibold text-[#1d1d1f]">{role}</p>
              <p className="text-xs text-[#6e6e73]">{Math.round((roleValues[i] / data.metrics.totalUsers) * 100)}% of total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Location Heatmap Info */}
      <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
        <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">🗺️ Rescue Locations</h3>
        <p className="text-sm text-[#6e6e73] mb-4">Total locations with coordinates: <strong>{data.locations.length}</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {data.locations.slice(0, 20).map((loc, i) => (
            <div key={i} className="p-3 bg-[#f8f9fa] rounded-lg border border-[#e8e8ed] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                📍
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1d1d1f] truncate">{loc.name || "Unknown"}</p>
                <p className="text-xs text-[#6e6e73]">{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">{loc.status}</span>
            </div>
          ))}
        </div>
        {data.locations.length > 20 && (
          <p className="text-xs text-[#a1a1a6] mt-3 text-center">Showing 20 of {data.locations.length} locations</p>
        )}
      </div>
    </div>
  );
}