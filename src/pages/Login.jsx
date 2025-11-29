import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'citizen',
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    // Mock login - in real app, this would call an API
    const user = {
      id: Math.floor(Math.random() * 1000),
      name: formData.email.split('@')[0],
      email: formData.email,
      role: formData.role,
      token: 'mock-jwt-token-' + Date.now(),
    }

    login(user)

    // Redirect based on role
    switch (formData.role) {
      case 'citizen':
        navigate('/citizen/dashboard')
        break
      case 'politician':
        navigate('/politician/dashboard')
        break
      case 'moderator':
        navigate('/moderator/dashboard')
        break
      case 'admin':
        navigate('/admin/dashboard')
        break
      default:
        navigate('/')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-card">
          <h1>Welcome Back</h1>
          <p>Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Select Role (Demo)
              </label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="citizen">Citizen</option>
                <option value="politician">Politician</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Sign In
            </button>
          </form>

          <div className="login-footer">
            <p>Demo app - use any email and password to login</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
