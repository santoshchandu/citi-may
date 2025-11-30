import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../utils/api'
import { issueTrackingService } from '../utils/issueTracking'

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
  const [issueTracking, setIssueTracking] = useState({})

  useEffect(() => {
    fetchIssues()

    // Set up interval to refresh issues and tracking info every 5 seconds
    const intervalId = setInterval(() => {
      // Refresh tracking info
      const allTracking = issueTrackingService.getAllTracking()
      setIssueTracking(allTracking)

      // Refresh issues list to get status updates
      apiService.getIssues().then(data => {
        const userIssues = data.filter(issue => issue.citizenId === user.id)
        setIssues(userIssues)
      }).catch(err => {
        console.error('Failed to refresh issues:', err)
      })
    }, 5000)

    // Refresh when window regains focus
    const handleFocus = () => {
      const allTracking = issueTrackingService.getAllTracking()
      setIssueTracking(allTracking)
      fetchIssues()
    }

    window.addEventListener('focus', handleFocus)

    // Cleanup interval and event listener on unmount
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getIssues()
      // Filter to show only user's issues
      const userIssues = data.filter(issue => issue.citizenId === user.id)
      setIssues(userIssues)

      // Load tracking info for all issues from localStorage
      const allTracking = issueTrackingService.getAllTracking()
      setIssueTracking(allTracking)
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
        citizenName: user.name,
      })
      setIssues([newIssue, ...issues])
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
          <div className="stat-card" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
            <h3>⏳ Pending</h3>
            <p>{stats.pending}</p>
            <small style={{ fontSize: '12px', color: '#666' }}>Waiting for assignment</small>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#fff4e5', borderLeft: '4px solid #ff9800' }}>
            <h3>🔧 In Progress</h3>
            <p>{stats.inProgress}</p>
            <small style={{ fontSize: '12px', color: '#666' }}>Being worked on</small>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4CAF50' }}>
            <h3>✅ Resolved</h3>
            <p>{stats.resolved}</p>
            <small style={{ fontSize: '12px', color: '#666' }}>Problem solved!</small>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>My Issues</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  const allTracking = issueTrackingService.getAllTracking()
                  setIssueTracking(allTracking)
                  fetchIssues()
                }}
                className="btn btn-outline"
                title="Refresh issues and assignments"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn btn-primary"
              >
                {showForm ? 'Cancel' : 'Report New Issue'}
              </button>
            </div>
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
              {issues.map((issue) => {
                const tracking = issueTracking[issue.id]
                return (
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span
                          className={`badge badge-${issue.status}`}
                          style={{
                            fontSize: '13px',
                            padding: '6px 12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {issue.status === 'pending' && '⏳ Pending'}
                          {issue.status === 'in-progress' && '🔧 In Progress'}
                          {issue.status === 'resolved' && '✅ Resolved'}
                        </span>
                        {issue.status === 'in-progress' && (
                          <span style={{ fontSize: '11px', color: '#ff9800', fontStyle: 'italic' }}>
                            Being worked on
                          </span>
                        )}
                        {issue.status === 'resolved' && (
                          <span style={{ fontSize: '11px', color: '#4CAF50', fontStyle: 'italic' }}>
                            Issue solved!
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="issue-description">{issue.description}</p>

                    {/* Status progress indicator */}
                    {issue.status !== 'pending' && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                          Progress Timeline:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#4CAF50', fontSize: '16px' }}>✓</span>
                            <span style={{ fontSize: '12px', color: '#4CAF50' }}>Reported</span>
                          </div>
                          <div style={{ flex: 1, height: '2px', backgroundColor: issue.status === 'resolved' || issue.status === 'in-progress' ? '#4CAF50' : '#ddd' }}></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: issue.status === 'in-progress' || issue.status === 'resolved' ? '#4CAF50' : '#ddd', fontSize: '16px' }}>
                              {issue.status === 'in-progress' || issue.status === 'resolved' ? '✓' : '○'}
                            </span>
                            <span style={{ fontSize: '12px', color: issue.status === 'in-progress' || issue.status === 'resolved' ? '#4CAF50' : '#ddd' }}>
                              In Progress
                            </span>
                          </div>
                          <div style={{ flex: 1, height: '2px', backgroundColor: issue.status === 'resolved' ? '#4CAF50' : '#ddd' }}></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: issue.status === 'resolved' ? '#4CAF50' : '#ddd', fontSize: '16px' }}>
                              {issue.status === 'resolved' ? '✓' : '○'}
                            </span>
                            <span style={{ fontSize: '12px', color: issue.status === 'resolved' ? '#4CAF50' : '#ddd' }}>
                              Resolved
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show tracking info if available */}
                    {tracking && (tracking.assignedTo || tracking.inCharge) && (
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '2px solid #4CAF50',
                          fontSize: '13px',
                          backgroundColor: '#f0f8f0',
                          padding: '12px',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ marginBottom: '8px', color: '#2e7d32', fontWeight: '600', fontSize: '12px' }}>
                          ✓ Issue Being Handled
                        </div>
                        {tracking.inCharge && (
                          <div style={{ marginBottom: '6px' }}>
                            <strong style={{ color: '#333' }}>In Charge:</strong>{' '}
                            <span style={{ color: '#2e7d32', fontWeight: '600' }}>
                              {tracking.inCharge.name}
                            </span>
                            <span
                              className="badge"
                              style={{
                                marginLeft: '6px',
                                fontSize: '11px',
                                padding: '3px 8px',
                                backgroundColor: '#2e7d32',
                                color: 'white',
                              }}
                            >
                              {tracking.inCharge.role}
                            </span>
                          </div>
                        )}
                        {tracking.assignedTo && (
                          <div>
                            <strong style={{ color: '#333' }}>Assigned To:</strong>{' '}
                            <span style={{ color: '#2e7d32', fontWeight: '600' }}>
                              {tracking.assignedTo.name}
                            </span>
                            <span
                              className="badge"
                              style={{
                                marginLeft: '6px',
                                fontSize: '11px',
                                padding: '3px 8px',
                                backgroundColor: '#2e7d32',
                                color: 'white',
                              }}
                            >
                              {tracking.assignedTo.role}
                            </span>
                          </div>
                        )}
                        {tracking.lastUpdated && (
                          <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                            Last updated: {new Date(tracking.lastUpdated).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default CitizenDashboard
