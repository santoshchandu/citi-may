import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../utils/api'

const ModeratorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [flaggedContent, setFlaggedContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const issuesData = await apiService.getIssues()
      setIssues(issuesData)

      // Simulate flagged content
      const flagged = issuesData
        .slice(0, 5)
        .map(issue => ({
          id: issue.id,
          type: 'issue',
          title: issue.title,
          reason: ['Spam', 'Inappropriate Language', 'Off-topic', 'Duplicate'][Math.floor(Math.random() * 4)],
          reportedBy: `User ${Math.floor(Math.random() * 100)}`,
          reportedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        }))
      setFlaggedContent(flagged)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewContent = (contentId, action) => {
    setFlaggedContent(flaggedContent.map(content =>
      content.id === contentId
        ? { ...content, status: action === 'approve' ? 'approved' : 'removed' }
        : content
    ))
  }

  const getFilteredIssues = () => {
    if (filterStatus === 'all') return issues
    return issues.filter(issue => issue.status === filterStatus)
  }

  const getStats = () => {
    return {
      totalIssues: issues.length,
      flaggedContent: flaggedContent.filter(c => c.status === 'pending').length,
      approvedContent: flaggedContent.filter(c => c.status === 'approved').length,
      removedContent: flaggedContent.filter(c => c.status === 'removed').length,
    }
  }

  const stats = getStats()
  const filteredIssues = getFilteredIssues()

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Moderator Dashboard</h1>
          <p>Welcome, {user.name}! Monitor and moderate platform content.</p>
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
            <h3>Flagged Content</h3>
            <p>{stats.flaggedContent}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p>{stats.approvedContent}</p>
          </div>
          <div className="stat-card">
            <h3>Removed</h3>
            <p>{stats.removedContent}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Flagged Content</div>
          {loading ? (
            <div className="spinner"></div>
          ) : flaggedContent.length === 0 ? (
            <div className="empty-state">
              <h3>No flagged content</h3>
              <p>All clear! No content needs review</p>
            </div>
          ) : (
            <div className="user-table">
              <table>
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Reported By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedContent.map((content) => (
                    <tr key={content.id}>
                      <td>
                        <strong>{content.title}</strong>
                      </td>
                      <td>{content.type}</td>
                      <td>
                        <span className="badge badge-pending">{content.reason}</span>
                      </td>
                      <td>{content.reportedBy}</td>
                      <td>{new Date(content.reportedAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${content.status}`}>
                          {content.status}
                        </span>
                      </td>
                      <td>
                        {content.status === 'pending' && (
                          <div className="action-buttons">
                            <button
                              onClick={() => handleReviewContent(content.id, 'approve')}
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewContent(content.id, 'remove')}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>All Issues</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : filteredIssues.length === 0 ? (
            <div className="empty-state">
              <h3>No issues found</h3>
            </div>
          ) : (
            <ul className="issue-list">
              {filteredIssues.slice(0, 15).map((issue) => (
                <li
                  key={issue.id}
                  className="issue-item"
                  onClick={() => navigate(`/issue/${issue.id}`)}
                >
                  <div className="issue-header">
                    <div>
                      <h3 className="issue-title">{issue.title}</h3>
                      <div className="issue-meta">
                        <span>By: {issue.citizenName}</span>
                        <span>{issue.category}</span>
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

export default ModeratorDashboard
