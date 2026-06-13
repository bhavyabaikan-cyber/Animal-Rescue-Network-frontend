import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { pageWrapper, articleGrid, articleCardClass, articleTitle, loadingClass, emptyStateClass, submitBtn } from "../styles/common";

export default function Adopt() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await api.get("/adopter-api/available");
        setAnimals(res.data.payload || []);
      } catch (err) {
        console.error("Failed to fetch available animals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailable();
  }, []);

  if (loading) return <p className={loadingClass}>Loading available friends...</p>;

  return (
    <div className={pageWrapper}>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-3">🏠 Find Your New Best Friend</h1>
        <p className="text-[#6e6e73] max-w-2xl mx-auto">These animals have been rescued, vet-checked, and are ready for their forever homes. Submit an application to meet them!</p>
      </div>

      {animals.length === 0 ? (
        <div className={`${emptyStateClass} py-20`}>
          <p className="text-4xl mb-3">🐾</p>
          <p className="text-[#6e6e73]">No animals are currently available for adoption. Check back soon!</p>
        </div>
      ) : (
        <div className={articleGrid}>
          {animals.map(a => (
            <div key={a._id} className={`${articleCardClass} cursor-pointer hover:shadow-md transition`} onClick={() => navigate(`/apply/${a._id}`)}>
              <div className="h-48 bg-[#f5f5f7] relative rounded-t-2xl overflow-hidden">
                {a.imageUrl ? (
                  <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#a1a1a6] text-4xl">🐾</div>
                )}
              </div>
              <div className="p-5">
                <h3 className={articleTitle}>{a.name || "Unnamed"} <span className="text-[#6e6e73] font-normal">({a.species})</span></h3>
                <p className="text-sm text-[#6e6e73] mt-2 line-clamp-2">{a.description}</p>
                <p className="text-xs text-[#a1a1a6] mt-3">📍 {a.location?.address || a.location}</p>
                <button className={`${submitBtn} w-full mt-4`}>Apply to Adopt</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}