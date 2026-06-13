import { useEffect, useState } from "react";
import api from "../api/client";
import { pageWrapper, loadingClass, emptyStateClass } from "../styles/common";

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, statsRes] = await Promise.all([
          api.get("/story-api"),
          api.get("/story-api/stats")
        ]);
        setStories(storiesRes.data.payload || []);
        setStats(statsRes.data.payload);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className={loadingClass}>Loading success stories...</p>;

  return (
    <div className={pageWrapper}>
      <div className="bg-gradient-to-r from-[#34c759] via-[#28a745] to-[#1e7e34] rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-10">🎉</div>
        <div className="relative z-10">
          <p className="text-green-100 text-sm mb-2 uppercase tracking-wide font-semibold">Happy Endings</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Success Stories</h1>
          <p className="text-green-50 text-lg max-w-2xl">Every rescue has a story. These are the animals who found their forever homes thanks to our amazing community.</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm text-center">
            <p className="text-4xl mb-2">🐾</p>
            <p className="text-3xl font-bold text-[#1d1d1f]">{stats.totalAnimals}</p>
            <p className="text-sm text-[#6e6e73] mt-1">Animals Helped</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm text-center">
            <p className="text-4xl mb-2">🏠</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.adopted}</p>
            <p className="text-sm text-[#6e6e73] mt-1">Happy Adoptions</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm text-center">
            <p className="text-4xl mb-2">💰</p>
            <p className="text-3xl font-bold text-[#0066cc]">₹{stats.totalDonations.toLocaleString()}</p>
            <p className="text-sm text-[#6e6e73] mt-1">Total Donations</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm text-center">
            <p className="text-4xl mb-2">📈</p>
            <p className="text-3xl font-bold text-purple-600">{stats.adoptionRate}%</p>
            <p className="text-sm text-[#6e6e73] mt-1">Adoption Rate</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">Our Happy Families</h2>
        <p className="text-[#6e6e73]">Meet the animals who found love and the families who gave it to them.</p>
      </div>

      {stories.length === 0 ? (
        <div className={`${emptyStateClass} py-20 bg-white rounded-2xl border border-[#e8e8ed]`}>
          <p className="text-6xl mb-4">📖</p>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No stories yet</h3>
          <p className="text-[#6e6e73]">Be the first to help an animal find a forever home!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map(story => (
            <div key={story._id} className="bg-white rounded-2xl overflow-hidden border border-[#e8e8ed] shadow-sm hover:shadow-xl transition group">
              <div className="h-64 bg-[#f5f5f7] relative overflow-hidden">
                {story.imageUrl ? (
                  <img src={story.imageUrl} alt={story.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🐾</div>
                )}
                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  ADOPTED
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#1d1d1f]">{story.name || "Our Friend"}</h3>
                    <p className="text-sm text-[#6e6e73]">{story.species} {story.breed && `• ${story.breed}`}</p>
                  </div>
                  <span className="text-2xl">❤️</span>
                </div>

                <p className="text-sm text-[#1d1d1f] leading-relaxed mb-4 italic">"{story.story}"</p>

                <div className="pt-4 border-t border-[#e8e8ed] space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#6e6e73]">Adopted by:</span>
                    <span className="font-semibold text-[#1d1d1f]">{story.adopterName}</span>
                  </div>
                  {story.adoptionDate && (
                    <div className="flex items-center gap-2 text-xs text-[#a1a1a6]">
                      <span>{new Date(story.adoptionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                  {story.location && (
                    <div className="flex items-center gap-2 text-xs text-[#a1a1a6]">
                      <span>{story.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-[#6e6e73] pt-2">
                    <span>₹{story.totalDonations.toLocaleString()} raised</span>
                    <span>•</span>
                    <span>{story.donorCount} donors</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-3xl p-8 sm:p-12 text-white text-center shadow-lg">
        <h3 className="text-3xl font-bold mb-3">Help Write the Next Success Story</h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Every donation, every report, every adoption brings us one step closer to a world where no animal is left behind.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/cases" className="px-6 py-3 bg-white text-[#0066cc] font-bold rounded-full hover:bg-blue-50 transition shadow-lg">
            View Active Cases
          </a>
          <a href="/donate" className="px-6 py-3 bg-[#34c759] text-white font-bold rounded-full hover:bg-[#28a745] transition shadow-lg">
            Donate Now
          </a>
        </div>
      </div>
    </div>
  );
}