// Update src/components/layout/Navbar.jsx to include new navigation
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/my-events">My Events</Link>
          <Link to="/organization-hierarchy">Organization Hierarchy</Link>
        </div>
        <div className="flex items-center gap-4">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}