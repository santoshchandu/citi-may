import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'citizen':
        return '/citizen/dashboard'
      case 'politician':
        return '/politician/dashboard'
      case 'moderator':
        return '/moderator/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            CitizenConnect
          </Link>

          <div className="navbar-menu">
            <Link to="/" className="navbar-link">
              Home
            </Link>

            {user ? (
              <>
                <Link to={getDashboardLink()} className="navbar-link">
                  Dashboard
                </Link>
                <div className="navbar-user">
                  <span className="navbar-username">{user.name}</span>
                  <span className="navbar-role">{user.role}</span>
                  <button onClick={handleLogout} className="btn btn-sm btn-outline">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-sm btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
