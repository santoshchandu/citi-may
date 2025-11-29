import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // Using JSONPlaceholder as mock API
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const apiService = {
  // Issues
  getIssues: async () => {
    try {
      const response = await api.get('/posts')
      // Transform posts to issues format
      return response.data.map(post => ({
        id: post.id,
        title: post.title,
        description: post.body,
        status: ['pending', 'in-progress', 'resolved'][Math.floor(Math.random() * 3)],
        category: ['Infrastructure', 'Healthcare', 'Education', 'Environment'][Math.floor(Math.random() * 4)],
        citizenId: post.userId,
        citizenName: `Citizen ${post.userId}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: Math.floor(Math.random() * 100),
      }))
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch issues')
    }
  },

  getIssueById: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`)
      return {
        id: response.data.id,
        title: response.data.title,
        description: response.data.body,
        status: 'pending',
        category: 'Infrastructure',
        citizenId: response.data.userId,
        citizenName: `Citizen ${response.data.userId}`,
        createdAt: new Date().toISOString(),
        upvotes: Math.floor(Math.random() * 100),
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch issue')
    }
  },

  createIssue: async (issueData) => {
    try {
      const response = await api.post('/posts', issueData)
      return {
        ...response.data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        upvotes: 0,
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create issue')
    }
  },

  updateIssueStatus: async (id, status) => {
    try {
      const response = await api.patch(`/posts/${id}`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update issue status')
    }
  },

  // Comments
  getComments: async (issueId) => {
    try {
      const response = await api.get(`/posts/${issueId}/comments`)
      return response.data.map(comment => ({
        id: comment.id,
        issueId: issueId,
        author: comment.name,
        authorRole: ['citizen', 'politician', 'moderator'][Math.floor(Math.random() * 3)],
        body: comment.body,
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      }))
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments')
    }
  },

  addComment: async (issueId, commentData) => {
    try {
      const response = await api.post(`/posts/${issueId}/comments`, commentData)
      return {
        ...response.data,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment')
    }
  },

  // Users (for admin)
  getUsers: async () => {
    try {
      const response = await api.get('/users')
      return response.data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: ['citizen', 'politician', 'moderator', 'admin'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }))
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/users/${userId}`, { role })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role')
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete(`/users/${userId}`)
      return { success: true }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  // Updates (for politicians)
  getUpdates: async () => {
    try {
      const response = await api.get('/posts')
      return response.data.slice(0, 10).map(post => ({
        id: post.id,
        title: post.title,
        content: post.body,
        politicianId: post.userId,
        politicianName: `Politician ${post.userId}`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 200),
      }))
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch updates')
    }
  },

  createUpdate: async (updateData) => {
    try {
      const response = await api.post('/posts', updateData)
      return {
        ...response.data,
        createdAt: new Date().toISOString(),
        likes: 0,
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create update')
    }
  },
}

export default api
