import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../utils/api'

const CitizenDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
  })

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getIssues()
      // Filter to show only user's issues
      setIssues(data.filter(issue => issue.citizenId === user.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const newIssue = await apiService.createIssue({
        ...formData,
        userId: user.id,
      })
      setIssues([{ ...newIssue, citizenName: user.name, citizenId: user.id }, ...issues])
      setFormData({ title: '', description: '', category: 'Infrastructure' })
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getStats = () => {
    return {
      total: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      inProgress: issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
    }
  }

  const stats = getStats()

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Citizen Dashboard</h1>
          <p>Welcome back, {user.name}! Report issues and track their progress.</p>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Issues</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p>{stats.inProgress}</p>
          </div>
          <div className="stat-card">
            <h3>Resolved</h3>
            <p>{stats.resolved}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>My Issues</span>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              {showForm ? 'Cancel' : 'Report New Issue'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Issue Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Environment">Environment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Public Safety">Public Safety</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Detailed Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Provide detailed information about the issue..."
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Issue'}
              </button>
            </form>
          )}

          {loading && !showForm ? (
            <div className="spinner"></div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <h3>No issues reported yet</h3>
              <p>Click "Report New Issue" to get started</p>
            </div>
          ) : (
            <ul className="issue-list">
              {issues.map((issue) => (
                <li
                  key={issue.id}
                  className="issue-item"
                  onClick={() => navigate(`/issue/${issue.id}`)}
                >
                  <div className="issue-header">
                    <div>
                      <h3 className="issue-title">{issue.title}</h3>
                      <div className="issue-meta">
                        <span>Category: {issue.category}</span>
                        <span>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span>👍 {issue.upvotes}</span>
                      </div>
                    </div>
                    <span className={`badge badge-${issue.status}`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="issue-description">{issue.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default CitizenDashboard
