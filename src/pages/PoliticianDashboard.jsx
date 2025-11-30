import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../utils/api'
import { issueTrackingService } from '../utils/issueTracking'

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
  const [issueTracking, setIssueTracking] = useState({})

  useEffect(() => {
    fetchData()

    // Set up interval to refresh issues every 5 seconds
    const intervalId = setInterval(() => {
      apiService.getIssues().then(data => {
        setIssues(data)
      }).catch(err => {
        console.error('Failed to refresh issues:', err)
      })

      // Refresh tracking info
      const allTracking = issueTrackingService.getAllTracking()
      setIssueTracking(allTracking)
    }, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
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

      // Load tracking info
      const allTracking = issueTrackingService.getAllTracking()
      setIssueTracking(allTracking)
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
    const myAssignments = Object.entries(issueTracking).filter(
      ([_, tracking]) => tracking?.assignedTo?.id === user.id || tracking?.inCharge?.id === user.id
    ).length

    const myInCharge = Object.entries(issueTracking).filter(
      ([_, tracking]) => tracking?.inCharge?.id === user.id
    ).length

    const myAssignedTo = Object.entries(issueTracking).filter(
      ([_, tracking]) => tracking?.assignedTo?.id === user.id
    ).length

    const newIssues = issues.filter(i => String(i.id).startsWith('user_')).length

    const todaysIssues = issues.filter(i => {
      const today = new Date()
      const createdDate = new Date(i.createdAt)
      return createdDate.toDateString() === today.toDateString()
    }).length

    const categoryBreakdown = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {})

    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]

    return {
      totalIssues: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      inProgress: issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      myAssignments,
      myInCharge,
      myAssignedTo,
      newIssues,
      todaysIssues,
      categoryBreakdown,
      topCategory,
      resolutionRate: issues.length > 0 ? Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100) : 0
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

        {/* Main Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Issues</h3>
            <p>{stats.totalIssues}</p>
            <small style={{ fontSize: '12px', color: '#666' }}>All reported issues</small>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
            <h3>⏳ Pending</h3>
            <p>{stats.pending}</p>
            <small style={{ fontSize: '12px', color: '#666' }}>Needs attention</small>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#fff4e5', borderLeft: '4px solid #ff9800' }}>
            <h3>🔧 In Progress</h3>
            <p>{stats.inProgress}</p>
            <small style={{ fontSize: '12px', color: '#666' }}>Currently working</small>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4CAF50' }}>
            <h3>✅ Resolved</h3>
            <p>{stats.resolved}</p>
            <small style={{ fontSize: '12px', color: '#666' }}>Completed</small>
          </div>
        </div>

        {/* Detailed Stats Board */}
        <div className="card" style={{ marginTop: '30px', marginBottom: '30px' }}>
          <div className="card-header" style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>📊 Performance Dashboard</h2>
          </div>

          {/* Personal Performance Stats */}
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#555', borderBottom: '1px solid #e9ecef', paddingBottom: '10px' }}>
              Your Activity
            </h3>
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <h3 style={{ color: 'white', fontSize: '14px' }}>📌 Total Assignments</h3>
                <p style={{ color: 'white', fontSize: '36px', margin: '10px 0' }}>{stats.myAssignments}</p>
                <small style={{ color: 'rgba(255,255,255,0.9)' }}>Issues you're handling</small>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <h3 style={{ color: 'white', fontSize: '14px' }}>👨‍💼 In Charge</h3>
                <p style={{ color: 'white', fontSize: '36px', margin: '10px 0' }}>{stats.myInCharge}</p>
                <small style={{ color: 'rgba(255,255,255,0.9)' }}>You're overseeing</small>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <h3 style={{ color: 'white', fontSize: '14px' }}>🔧 Assigned To You</h3>
                <p style={{ color: 'white', fontSize: '36px', margin: '10px 0' }}>{stats.myAssignedTo}</p>
                <small style={{ color: 'rgba(255,255,255,0.9)' }}>You're solving</small>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <h3 style={{ color: 'white', fontSize: '14px' }}>📈 Resolution Rate</h3>
                <p style={{ color: 'white', fontSize: '36px', margin: '10px 0' }}>{stats.resolutionRate}%</p>
                <small style={{ color: 'rgba(255,255,255,0.9)' }}>Issues resolved</small>
              </div>
            </div>

            {/* Activity & Insights */}
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#555', borderBottom: '1px solid #e9ecef', paddingBottom: '10px' }}>
              Activity & Insights
            </h3>
            <div className="grid grid-3" style={{ gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🆕 New Issues</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#2196F3' }}>{stats.newIssues}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Citizen reports today</div>
              </div>
              <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>📅 Today's Issues</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ff9800' }}>{stats.todaysIssues}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Reported in last 24h</div>
              </div>
              <div style={{ backgroundColor: '#f3e5f5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #9c27b0' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🏆 Top Category</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#9c27b0', marginTop: '8px' }}>
                  {stats.topCategory ? stats.topCategory[0] : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  {stats.topCategory ? `${stats.topCategory[1]} issues` : 'No data'}
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#555', borderBottom: '1px solid #e9ecef', paddingBottom: '10px' }}>
              Issues by Category
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => {
                const colors = {
                  'Infrastructure': '#ff6b6b',
                  'Healthcare': '#4ecdc4',
                  'Education': '#45b7d1',
                  'Environment': '#96ceb4',
                  'Transportation': '#ffeaa7',
                  'Public Safety': '#ff7675'
                }
                const color = colors[category] || '#95a5a6'
                const percentage = stats.totalIssues > 0 ? Math.round((count / stats.totalIssues) * 100) : 0

                return (
                  <div key={category} style={{
                    backgroundColor: '#fff',
                    padding: '15px',
                    borderRadius: '8px',
                    border: `2px solid ${color}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: color,
                      opacity: 0.1,
                      transition: 'width 0.3s ease'
                    }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>
                        {category}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: color }}>{count}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{percentage}%</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                Citizen Issues
                {issues.filter(i => String(i.id).startsWith('user_')).length > 0 && (
                  <span style={{
                    marginLeft: '10px',
                    fontSize: '12px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    {issues.filter(i => String(i.id).startsWith('user_')).length} New
                  </span>
                )}
              </span>
              <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                🔄 Auto-updating
              </span>
            </div>
            {loading ? (
              <div className="spinner"></div>
            ) : issues.length === 0 ? (
              <div className="empty-state">
                <h3>No issues found</h3>
              </div>
            ) : (
              <ul className="issue-list">
                {issues.slice(0, 10).map((issue) => {
                  const tracking = issueTracking[issue.id]
                  const isUserCreated = String(issue.id).startsWith('user_')
                  const isAssignedToMe = tracking?.assignedTo?.id === user.id || tracking?.inCharge?.id === user.id

                  return (
                    <li key={issue.id} className="issue-item" style={{
                      borderLeft: isUserCreated ? '4px solid #2196F3' : isAssignedToMe ? '4px solid #4CAF50' : undefined
                    }}>
                      <div className="issue-header">
                        <div>
                          <h3 className="issue-title">
                            {issue.title}
                            {isUserCreated && (
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: '600'
                              }}>
                                NEW
                              </span>
                            )}
                          </h3>
                          <div className="issue-meta">
                            <span>By: {issue.citizenName}</span>
                            <span>{issue.category}</span>
                            <span>👍 {issue.upvotes}</span>
                            {isAssignedToMe && (
                              <span style={{ color: '#4CAF50', fontWeight: '600' }}>
                                ✓ Assigned to you
                              </span>
                            )}
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
                  )
                })}
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
