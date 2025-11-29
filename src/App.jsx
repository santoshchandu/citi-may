import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import CitizenDashboard from './pages/CitizenDashboard'
import PoliticianDashboard from './pages/PoliticianDashboard'
import ModeratorDashboard from './pages/ModeratorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import IssueDetails from './pages/IssueDetails'
import './styles/App.css'

function App() {
  const { user } = useAuth()

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }

    return children
  }

  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/politician/dashboard"
            element={
              <ProtectedRoute allowedRoles={['politician']}>
                <PoliticianDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/moderator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['moderator']}>
                <ModeratorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/issue/:id"
            element={
              <ProtectedRoute>
                <IssueDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
