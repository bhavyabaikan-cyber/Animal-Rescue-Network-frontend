import { useForm } from "react-hook-form";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import { formCard, formTitle, formGroup, labelClass, inputClass, submitBtn, errorClass, ghostBtn } from "../styles/common";
export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = async (data) => { try { const success = await login(data); if (success) { toast.success("Login successful!"); navigate("/dashboard", { replace: true }); } } catch (err) { toast.error(err.response?.data?.message || "Login failed"); } };
  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <div className={formCard}>
        <h2 className={formTitle}>Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={formGroup}><label className={labelClass}>Email</label><input type="email" className={inputClass} {...register("email", { required: "Email required" })} />{errors.email && <p className={errorClass}>{errors.email.message}</p>}</div>
          <div className={formGroup}><label className={labelClass}>Password</label><input type="password" className={inputClass} {...register("password", { required: "Password required" })} />{errors.password && <p className={errorClass}>{errors.password.message}</p>}</div>
          <button type="submit" className={submitBtn}>Sign In</button>
        </form>
        <p className="text-center text-sm text-[#6e6e73] mt-4">Don't have an account? <NavLink to="/register" className={ghostBtn}>Register</NavLink></p>
      </div>
    </div>
  );
}