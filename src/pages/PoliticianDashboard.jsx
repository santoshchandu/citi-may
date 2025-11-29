import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../utils/api'

const PoliticianDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    content: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [issuesData, updatesData] = await Promise.all([
        apiService.getIssues(),
        apiService.getUpdates(),
      ])
      setIssues(issuesData)
      setUpdates(updatesData.filter(u => u.politicianId === user.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateIssueStatus = async (issueId, newStatus) => {
    try {
      await apiService.updateIssueStatus(issueId, newStatus)
      setIssues(issues.map(issue =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ))
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePostUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const newUpdate = await apiService.createUpdate({
        ...updateFormData,
        userId: user.id,
      })
      setUpdates([
        { ...newUpdate, politicianName: user.name, politicianId: user.id },
        ...updates,
      ])
      setUpdateFormData({ title: '', content: '' })
      setShowUpdateForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setUpdateFormData({
      ...updateFormData,
      [e.target.name]: e.target.value,
    })
  }

  const getStats = () => {
    return {
      totalIssues: issues.length,
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
          <h1>Politician Dashboard</h1>
          <p>Welcome, {user.name}! Respond to citizen concerns and post updates.</p>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Issues</h3>
            <p>{stats.totalIssues}</p>
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

        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">Citizen Issues</div>
            {loading ? (
              <div className="spinner"></div>
            ) : issues.length === 0 ? (
              <div className="empty-state">
                <h3>No issues found</h3>
              </div>
            ) : (
              <ul className="issue-list">
                {issues.slice(0, 10).map((issue) => (
                  <li key={issue.id} className="issue-item">
                    <div className="issue-header">
                      <div>
                        <h3 className="issue-title">{issue.title}</h3>
                        <div className="issue-meta">
                          <span>By: {issue.citizenName}</span>
                          <span>{issue.category}</span>
                          <span>👍 {issue.upvotes}</span>
                        </div>
                      </div>
                      <span className={`badge badge-${issue.status}`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="issue-description">{issue.description}</p>
                    <div className="action-buttons">
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateIssueStatus(issue.id, 'in-progress')}
                          className="btn btn-sm btn-primary"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {issue.status === 'in-progress' && (
                        <button
                          onClick={() => handleUpdateIssueStatus(issue.id, 'resolved')}
                          className="btn btn-sm btn-success"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/issue/${issue.id}`)}
                        className="btn btn-sm btn-outline"
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>My Updates</span>
              <button
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="btn btn-sm btn-primary"
              >
                {showUpdateForm ? 'Cancel' : 'Post Update'}
              </button>
            </div>

            {showUpdateForm && (
              <form onSubmit={handlePostUpdate} style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Update Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    value={updateFormData.title}
                    onChange={handleChange}
                    required
                    placeholder="Brief title for your update"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content" className="form-label">
                    Update Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    className="form-textarea"
                    value={updateFormData.content}
                    onChange={handleChange}
                    required
                    placeholder="Share updates with your constituents..."
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Update'}
                </button>
              </form>
            )}

            {loading && !showUpdateForm ? (
              <div className="spinner"></div>
            ) : updates.length === 0 ? (
              <div className="empty-state">
                <h3>No updates posted yet</h3>
                <p>Share updates with your constituents</p>
              </div>
            ) : (
              <div>
                {updates.map((update) => (
                  <div key={update.id} className="card" style={{ marginBottom: '15px' }}>
                    <h4>{update.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>
                      {new Date(update.createdAt).toLocaleDateString()} • ❤️ {update.likes}
                    </p>
                    <p>{update.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoliticianDashboard
