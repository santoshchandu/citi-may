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

// Mock English issue data
const mockIssues = [
  { title: 'Potholes on Main Street need urgent repair', description: 'The road conditions on Main Street have deteriorated significantly with multiple deep potholes causing damage to vehicles and creating safety hazards for drivers.' },
  { title: 'Street lights not working in residential area', description: 'Several street lights in the Oak Avenue residential area have been out for over two weeks, creating safety concerns for residents walking at night.' },
  { title: 'Park playground equipment needs maintenance', description: 'The playground equipment at Central Park is showing signs of wear and rust. Some swings are broken and the slide has sharp edges that could injure children.' },
  { title: 'Improve public transportation schedule', description: 'Current bus schedules do not align with work hours for most residents. Many people miss connections and arrive late to work. Request more frequent service during peak hours.' },
  { title: 'Water pressure issues in downtown district', description: 'Residents in the downtown area are experiencing low water pressure, especially during morning and evening hours. This needs investigation and repair.' },
  { title: 'Need more waste bins in public parks', description: 'Public parks are becoming littered as there are insufficient waste bins. Request installation of additional bins and recycling stations.' },
  { title: 'Traffic congestion at School Road intersection', description: 'The intersection at School Road and Park Avenue experiences severe traffic congestion during school drop-off and pickup times. Consider adding traffic lights or a crossing guard.' },
  { title: 'Community center needs air conditioning repair', description: 'The air conditioning system at the community center has not been working properly for the past month, making it uncomfortable for seniors and children during programs.' },
  { title: 'Sidewalk cracks creating trip hazards', description: 'Multiple sidewalks along Elm Street have significant cracks and uneven surfaces that pose trip hazards, especially for elderly residents and those with mobility issues.' },
  { title: 'Noise pollution from construction site', description: 'Construction work starting before 7 AM is causing noise disturbances to nearby residents. Request enforcement of noise ordinances and reasonable work hours.' },
]

// localStorage key for user-created issues
const USER_ISSUES_KEY = 'user_created_issues'

// Helper functions for localStorage
const getStoredIssues = () => {
  try {
    const stored = localStorage.getItem(USER_ISSUES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading stored issues:', error)
    return []
  }
}

const saveIssueToStorage = (issue) => {
  try {
    const stored = getStoredIssues()
    stored.unshift(issue) // Add to beginning of array
    localStorage.setItem(USER_ISSUES_KEY, JSON.stringify(stored))
    return issue
  } catch (error) {
    console.error('Error saving issue to storage:', error)
    throw new Error('Failed to save issue')
  }
}

const getStoredIssueById = (id) => {
  const stored = getStoredIssues()
  return stored.find(issue => issue.id === id)
}

// API endpoints
export const apiService = {
  // Issues
  getIssues: async () => {
    try {
      const response = await api.get('/posts')
      // Transform posts to issues format with English content
      const apiIssues = response.data.map((post, index) => {
        const mockIssue = mockIssues[index % mockIssues.length]
        return {
          id: post.id,
          title: mockIssue.title,
          description: mockIssue.description,
          status: ['pending', 'in-progress', 'resolved'][Math.floor(Math.random() * 3)],
          category: ['Infrastructure', 'Healthcare', 'Education', 'Environment', 'Transportation', 'Public Safety'][Math.floor(Math.random() * 6)],
          citizenId: post.userId,
          citizenName: `Citizen ${post.userId}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          upvotes: Math.floor(Math.random() * 100),
        }
      })

      // Get user-created issues from localStorage
      const storedIssues = getStoredIssues()

      // Merge stored issues with API issues (stored issues first)
      return [...storedIssues, ...apiIssues]
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch issues')
    }
  },

  getIssueById: async (id) => {
    try {
      // Check localStorage first for user-created issues
      const storedIssue = getStoredIssueById(id)
      if (storedIssue) {
        return storedIssue
      }

      // If not in localStorage, fetch from API
      const response = await api.get(`/posts/${id}`)
      const mockIssue = mockIssues[(id - 1) % mockIssues.length]
      return {
        id: response.data.id,
        title: mockIssue.title,
        description: mockIssue.description,
        status: ['pending', 'in-progress', 'resolved'][id % 3],
        category: ['Infrastructure', 'Healthcare', 'Education', 'Environment', 'Transportation', 'Public Safety'][id % 6],
        citizenId: response.data.userId,
        citizenName: `Citizen ${response.data.userId}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: Math.floor(Math.random() * 100),
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch issue')
    }
  },

  createIssue: async (issueData) => {
    try {
      // Create issue with unique ID (timestamp-based to avoid conflicts)
      const newIssue = {
        id: `user_${Date.now()}`,
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        status: 'pending',
        citizenId: issueData.userId,
        citizenName: issueData.citizenName || 'Citizen',
        createdAt: new Date().toISOString(),
        upvotes: 0,
      }

      // Save to localStorage
      saveIssueToStorage(newIssue)

      return newIssue
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create issue')
    }
  },

  updateIssueStatus: async (id, status) => {
    try {
      // Check if it's a user-created issue (stored in localStorage)
      const storedIssue = getStoredIssueById(id)
      if (storedIssue) {
        // Update in localStorage
        const allIssues = getStoredIssues()
        const updatedIssues = allIssues.map(issue =>
          issue.id === id ? { ...issue, status } : issue
        )
        localStorage.setItem(USER_ISSUES_KEY, JSON.stringify(updatedIssues))
        return { ...storedIssue, status }
      }

      // If not in localStorage, it's an API issue (mock update)
      return { id, status }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update issue status')
    }
  },

  // Comments
  getComments: async (issueId) => {
    try {
      const response = await api.get(`/posts/${issueId}/comments`)
      const mockCommentBodies = [
        'Thank you for reporting this issue. Our team is looking into it and will provide an update soon.',
        'I have also noticed this problem in my neighborhood. This needs immediate attention.',
        'We have allocated resources to address this concern. Work is scheduled to begin next week.',
        'This has been affecting our community for too long. Appreciate you bringing it up.',
        'Our department is aware of this issue and it is on our priority list for this quarter.',
        'Can you provide more details about the exact location? This will help us respond faster.',
        'I completely agree. This is affecting many residents in the area.',
        'We have completed the initial assessment and are working on a solution.',
      ]

      return response.data.map((comment, index) => ({
        id: comment.id,
        issueId: issueId,
        author: comment.name.split(' ')[0], // Use first name only
        authorRole: ['citizen', 'politician', 'moderator'][Math.floor(Math.random() * 3)],
        body: mockCommentBodies[index % mockCommentBodies.length],
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
      const mockUpdates = [
        {
          title: 'New Community Center Opening Next Month',
          content: 'We are excited to announce that the new community center on Park Avenue will open its doors next month. The facility will include a gym, library, and meeting rooms for community events.'
        },
        {
          title: 'Road Repair Schedule for March',
          content: 'Our public works department has finalized the road repair schedule for March. Main Street, Oak Avenue, and Elm Street are prioritized. We appreciate your patience during the construction work.'
        },
        {
          title: 'Free Health Screening Event This Weekend',
          content: 'Join us this Saturday at the City Hall for a free health screening event. Services include blood pressure checks, diabetes screening, and health consultations with medical professionals.'
        },
        {
          title: 'Town Hall Meeting Scheduled',
          content: 'Please join us for our quarterly town hall meeting on the 15th of this month. We will discuss upcoming projects, budget allocation, and address your concerns. All residents are welcome.'
        },
        {
          title: 'New Recycling Program Launched',
          content: 'We have launched an enhanced recycling program to help keep our community clean and sustainable. New recycling bins will be distributed to all households next week.'
        },
      ]

      return response.data.slice(0, 10).map((post, index) => {
        const mockUpdate = mockUpdates[index % mockUpdates.length]
        return {
          id: post.id,
          title: mockUpdate.title,
          content: mockUpdate.content,
          politicianId: post.userId,
          politicianName: `Politician ${post.userId}`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 200),
        }
      })
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
