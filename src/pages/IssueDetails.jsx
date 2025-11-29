import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../utils/api'

const IssueDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchIssueDetails()
  }, [id])

  const fetchIssueDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const [issueData, commentsData] = await Promise.all([
        apiService.getIssueById(id),
        apiService.getComments(id),
      ])
      setIssue(issueData)
      setComments(commentsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      setSubmittingComment(true)
      const newComment = await apiService.addComment(id, {
        name: user.name,
        body: commentText,
        email: user.email,
      })
      setComments([
        ...comments,
        {
          ...newComment,
          author: user.name,
          authorRole: user.role,
        },
      ])
      setCommentText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await apiService.updateIssueStatus(id, newStatus)
      setIssue({ ...issue, status: newStatus })
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="alert alert-danger">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          Go Back
        </button>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="empty-state">
          <h3>Issue not found</h3>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const canUpdateStatus = user.role === 'politician' || user.role === 'admin' || user.role === 'moderator'

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '20px' }}>
            ← Back
          </button>
          <h1>{issue.title}</h1>
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px', fontSize: '14px' }}>
            <span>Category: <strong>{issue.category}</strong></span>
            <span>•</span>
            <span>Reported by: <strong>{issue.citizenName}</strong></span>
            <span>•</span>
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>👍 {issue.upvotes} upvotes</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-2">
          <div>
            <div className="card">
              <div className="card-header">Issue Details</div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
                  {issue.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong>Status:</strong>
                <span className={`badge badge-${issue.status}`}>
                  {issue.status}
                </span>
              </div>

              {canUpdateStatus && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                  <strong style={{ display: 'block', marginBottom: '10px' }}>
                    Update Status:
                  </strong>
                  <div className="action-buttons">
                    {issue.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate('pending')}
                        className="btn btn-sm btn-outline"
                      >
                        Mark Pending
                      </button>
                    )}
                    {issue.status !== 'in-progress' && (
                      <button
                        onClick={() => handleStatusUpdate('in-progress')}
                        className="btn btn-sm btn-primary"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {issue.status !== 'resolved' && (
                      <button
                        onClick={() => handleStatusUpdate('resolved')}
                        className="btn btn-sm btn-success"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card-header">
                Comments ({comments.length})
              </div>

              <div className="comments-section">
                {comments.length === 0 ? (
                  <div className="empty-state">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <div>
                          <span className="comment-author">{comment.author}</span>
                          {comment.authorRole && (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: 'var(--primary-color)',
                                color: 'white',
                                marginLeft: '8px',
                              }}
                            >
                              {comment.authorRole}
                            </span>
                          )}
                        </div>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-body">{comment.body}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitComment} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                <div className="form-group">
                  <label htmlFor="comment" className="form-label">
                    Add a Comment
                  </label>
                  <textarea
                    id="comment"
                    className="form-textarea"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts or provide updates..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingComment || !commentText.trim()}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetails
