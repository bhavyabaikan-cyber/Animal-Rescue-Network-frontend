import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { pageWrapper, loadingClass } from "../styles/common";

export default function DonateSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const animalId = searchParams.get("animalId");

  useEffect(() => {
    const verify = async () => {
      try {
        await api.post("/donor-api/verify-donation", { sessionId, animalId });
        toast.success("Donation successful! Thank you 🐾");
      } catch {
        toast.error("Verification failed. Please contact support.");
      } finally {
        navigate(`/case/${animalId}`);
      }
    };
    if (sessionId && animalId) verify();
  }, [sessionId, animalId, navigate]);

  return <div className={`${pageWrapper} text-center py-20`}><p className={loadingClass}>Verifying your donation...</p></div>;
}