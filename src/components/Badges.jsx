import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { pageWrapper } from "../styles/common";

export default function Badges() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Badges only for VOLUNTEER, DONOR, and ADMIN
  const getBadgesForRole = (role) => {
    const allBadges = [
      // VOLUNTEER Badges
      {
        id: 1,
        name: "First Rescue",
        description: "Accepted your first rescue case",
        icon: "🦸",
        color: "from-blue-500 to-blue-600",
        unlocked: true,
        roles: ["VOLUNTEER", "ADMIN"]
      },
      {
        id: 2,
        name: "Helper Hero",
        description: "Successfully completed 5 rescue cases",
        icon: "⭐",
        color: "from-purple-500 to-purple-600",
        unlocked: false,
        roles: ["VOLUNTEER", "ADMIN"]
      },
      {
        id: 3,
        name: "Community Leader",
        description: "Helped 50 animals find forever homes",
        icon: "🌟",
        color: "from-yellow-500 to-yellow-600",
        unlocked: false,
        roles: ["VOLUNTEER", "ADMIN"]
      },
      {
        id: 4,
        name: "Fast Responder",
        description: "Accepted a case within 1 hour of reporting",
        icon: "⚡",
        color: "from-orange-500 to-orange-600",
        unlocked: false,
        roles: ["VOLUNTEER", "ADMIN"]
      },

      // DONOR Badges
      {
        id: 5,
        name: "First Donation",
        description: "Made your first donation to help an animal",
        icon: "💰",
        color: "from-green-500 to-green-600",
        unlocked: true,
        roles: ["DONOR", "ADMIN"]
      },
      {
        id: 6,
        name: "Generous Soul",
        description: "Donated to 10 different rescue cases",
        icon: "💎",
        color: "from-cyan-500 to-cyan-600",
        unlocked: false,
        roles: ["DONOR", "ADMIN"]
      },
      {
        id: 7,
        name: "Major Supporter",
        description: "Donated over ₹10,000 in total",
        icon: "🏆",
        color: "from-amber-500 to-amber-600",
        unlocked: false,
        roles: ["DONOR", "ADMIN"]
      },
      {
        id: 8,
        name: "Consistent Supporter",
        description: "Donated every month for 3 months",
        icon: "📈",
        color: "from-indigo-500 to-indigo-600",
        unlocked: false,
        roles: ["DONOR", "ADMIN"]
      },

      // ADMIN Badges
      {
        id: 9,
        name: "Platform Guardian",
        description: "Managing the RescueNet platform",
        icon: "🛡️",
        color: "from-red-500 to-red-600",
        unlocked: true,
        roles: ["ADMIN"]
      },
      {
        id: 10,
        name: "System Master",
        description: "Oversaw 100+ successful rescues",
        icon: "👑",
        color: "from-yellow-600 to-yellow-700",
        unlocked: false,
        roles: ["ADMIN"]
      },

      // Shared Badge (for all eligible roles)
      {
        id: 11,
        name: "Early Adopter",
        description: "Joined RescueNet in the first month",
        icon: "🎖️",
        color: "from-indigo-500 to-indigo-600",
        unlocked: true,
        roles: ["VOLUNTEER", "DONOR", "ADMIN"]
      }
    ];

    return allBadges.filter(badge => badge.roles.includes(role));
  };

  // ✅ Roles that don't have badges
  const rolesWithoutBadges = ["REPORTER", "ADOPTER"];

  if (!user) {
    return (
      <div className={pageWrapper}>
        <div className="bg-white rounded-2xl p-12 border border-[#e8e8ed] shadow-sm text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Login Required</h3>
          <p className="text-[#6e6e73] mb-6">Please login to view your badges.</p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }))}
            className="px-6 py-3 bg-[#0066cc] text-white font-semibold rounded-lg hover:bg-[#0052a3] transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ✅ Show message for REPORTER and ADOPTER
  if (rolesWithoutBadges.includes(user.role)) {
    return (
      <div className={pageWrapper}>
        <div className="bg-white rounded-2xl p-12 border border-[#e8e8ed] shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto bg-[#f5f5f7] rounded-full flex items-center justify-center text-4xl mb-6">
            {user.role === "REPORTER" ? "📋" : "🏠"}
          </div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-4">
            {user.role === "REPORTER" ? "Reporters Don't Need Badges" : "Adopters Don't Need Badges"}
          </h1>
          <p className="text-[#6e6e73] mb-6 leading-relaxed">
            {user.role === "REPORTER" 
              ? "As a Reporter, your contribution is invaluable - you're the eyes and ears of our rescue network. Every report you submit helps save lives, and that's recognition enough."
              : "As an Adopter, you've already given an animal the greatest gift of all - a forever home. That's the ultimate achievement!"
            }
          </p>
          
          <div className="bg-[#f8f9fa] rounded-xl p-6 border border-[#e8e8ed] text-left mb-6">
            <h3 className="font-semibold text-[#1d1d1f] mb-3">Who earns badges?</h3>
            <ul className="space-y-2 text-sm text-[#6e6e73]">
              <li className="flex items-start gap-2">
                <span className="text-[#0066cc] font-bold">•</span>
                <span><strong>Volunteers</strong> - For accepting and completing rescue cases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066cc] font-bold">•</span>
                <span><strong>Donors</strong> - For financially supporting rescue operations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066cc] font-bold">•</span>
                <span><strong>Admins</strong> - For managing the platform</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#0066cc] text-white font-semibold rounded-lg hover:bg-[#0052a3] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const userBadges = getBadgesForRole(user.role);
  const unlockedCount = userBadges.filter(b => b.unlocked).length;
  const progressPercent = userBadges.length > 0 ? Math.round((unlockedCount / userBadges.length) * 100) : 0;

  return (
    <div className={pageWrapper}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Badges & Achievements</h1>
        <p className="text-blue-100">
          You've unlocked <span className="font-bold text-white">{unlockedCount}</span> out of <span className="font-bold text-white">{userBadges.length}</span> badges as a <span className="font-bold text-white">{user.role}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-[#1d1d1f]">Your Progress</span>
          <span className="text-sm text-[#6e6e73]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#f5f5f7] rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#0066cc] to-[#34c759] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {userBadges.map(badge => (
          <div 
            key={badge.id}
            className={`bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm transition-all ${
              badge.unlocked ? 'hover:shadow-lg' : 'opacity-60 grayscale'
            }`}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl mb-4 shadow-md`}>
              {badge.icon}
            </div>
            <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">{badge.name}</h3>
            <p className="text-sm text-[#6e6e73] mb-3">{badge.description}</p>
            {badge.unlocked ? (
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                Unlocked
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-[#f5f5f7] text-[#6e6e73] text-xs font-semibold rounded-full border border-[#e8e8ed]">
                Locked
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm">
        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Leaderboard</h2>
        <div className="space-y-3">
          {[
            { rank: 1, name: "Sarah M.", points: 2450, badge: "1st" },
            { rank: 2, name: "John D.", points: 2100, badge: "2nd" },
            { rank: 3, name: "Emily R.", points: 1850, badge: "3rd" },
            { rank: 4, name: "You", points: 1200, badge: "4th" },
            { rank: 5, name: "Michael K.", points: 950, badge: "5th" }
          ].map((entry) => (
            <div 
              key={entry.rank}
              className={`flex items-center justify-between p-4 rounded-xl ${
                entry.name === "You" ? 'bg-[#0066cc] text-white' : 'bg-[#f8f9fa] hover:bg-[#f5f5f7]'
              } transition`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${entry.name === "You" ? 'text-white' : 'text-[#0066cc]'}`}>
                  #{entry.rank}
                </span>
                <span className={`font-semibold ${entry.name === "You" ? 'text-white' : 'text-[#1d1d1f]'}`}>
                  {entry.name}
                </span>
              </div>
              <span className={`font-bold ${entry.name === "You" ? 'text-white' : 'text-[#0066cc]'}`}>
                {entry.points.toLocaleString()} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-8 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6 text-center">
        <p className="text-sm text-[#166534]">
          <strong>More badges coming soon!</strong> Keep up the great work to unlock new achievements.
        </p>
      </div>
    </div>
  );
}