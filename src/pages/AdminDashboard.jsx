import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../utils/api'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'citizen',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [usersData, issuesData] = await Promise.all([
        apiService.getUsers(),
        apiService.getIssues(),
      ])
      setUsers(usersData)
      setIssues(issuesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiService.updateUserRole(userId, newRole)
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await apiService.deleteUser(userId)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddUser = (e) => {
    e.preventDefault()
    const addedUser = {
      id: Date.now(),
      ...newUser,
      status: 'active',
      joinedAt: new Date().toISOString(),
    }
    setUsers([addedUser, ...users])
    setNewUser({ name: '', email: '', role: 'citizen' })
    setShowAddUser(false)
  }

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    })
  }

  const getStats = () => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalIssues: issues.length,
      pendingIssues: issues.filter(i => i.status === 'pending').length,
    }
  }

  const stats = getStats()

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'var(--danger-color)'
      case 'politician': return 'var(--secondary-color)'
      case 'moderator': return 'var(--warning-color)'
      default: return 'var(--primary-color)'
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}! Manage users and oversee platform operations.</p>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p>{stats.activeUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Issues</h3>
            <p>{stats.totalIssues}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Issues</h3>
            <p>{stats.pendingIssues}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>User Management</span>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="btn btn-primary"
            >
              {showAddUser ? 'Cancel' : 'Add New User'}
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUser} style={{ marginBottom: '20px', padding: '20px', background: 'var(--light-bg)', borderRadius: '6px' }}>
              <div className="grid grid-3">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={newUser.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={newUser.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="form-select"
                    value={newUser.role}
                    onChange={handleChange}
                  >
                    <option value="citizen">Citizen</option>
                    <option value="politician">Politician</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Add User
              </button>
            </form>
          )}

          {loading ? (
            <div className="spinner"></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
            </div>
          ) : (
            <div className="user-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="form-select"
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            backgroundColor: getRoleColor(u.role),
                            color: 'white',
                            border: 'none',
                            fontWeight: '500',
                          }}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="politician">Politician</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge badge-${u.status === 'active' ? 'resolved' : 'pending'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn btn-sm btn-danger"
                          disabled={u.id === user.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">Platform Analytics</div>
          <div className="grid grid-3">
            <div>
              <h4>Issues by Category</h4>
              <ul style={{ listStyle: 'none', marginTop: '10px' }}>
                {['Infrastructure', 'Healthcare', 'Education', 'Environment'].map(category => (
                  <li key={category} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <strong>{category}:</strong> {issues.filter(i => i.category === category).length}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Users by Role</h4>
              <ul style={{ listStyle: 'none', marginTop: '10px' }}>
                {['citizen', 'politician', 'moderator', 'admin'].map(role => (
                  <li key={role} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{role}:</strong> {users.filter(u => u.role === role).length}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Issue Resolution Rate</h4>
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success-color)' }}>
                  {issues.length > 0 ? Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100) : 0}%
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {issues.filter(i => i.status === 'resolved').length} of {issues.length} resolved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
