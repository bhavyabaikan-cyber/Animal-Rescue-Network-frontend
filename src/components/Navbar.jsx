import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPaw, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardLink = user?.role === 'ADMIN' ? '/admin' : 
                        user?.role === 'RESCUER' ? '/rescuer' : '/adopter';

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <FaPaw className="text-accent" /> RescueNet
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="hidden md:inline text-sm text-gray-600">Welcome, {user.firstName}</span>
            <Link to={dashboardLink} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-700 transition">Dashboard</Link>
            <button onClick={logout} className="text-red-500 hover:text-red-700"><FaSignOutAlt /></button>
          </>
        ) : (
          <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-700 transition">Login</Link>
        )}
      </div>
    </nav>
  );
};