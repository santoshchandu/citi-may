// Issue tracking service for managing assignments in localStorage
const STORAGE_KEY = 'issue_tracking'

export const issueTrackingService = {
  // Get tracking info for all issues
  getAllTracking: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Error reading issue tracking from localStorage:', error)
      return {}
    }
  },

  // Get tracking info for a specific issue
  getIssueTracking: (issueId) => {
    const allTracking = issueTrackingService.getAllTracking()
    return allTracking[issueId] || null
  },

  // Assign someone to an issue
  assignIssue: (issueId, assignedTo) => {
    try {
      const allTracking = issueTrackingService.getAllTracking()

      // Create or update tracking info
      allTracking[issueId] = {
        ...allTracking[issueId],
        assignedTo: {
          id: assignedTo.id,
          name: assignedTo.name,
          role: assignedTo.role,
          assignedAt: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTracking))
      return allTracking[issueId]
    } catch (error) {
      console.error('Error assigning issue:', error)
      throw new Error('Failed to assign issue')
    }
  },

  // Set who is in charge of an issue (e.g., department head, team lead)
  setInCharge: (issueId, inCharge) => {
    try {
      const allTracking = issueTrackingService.getAllTracking()

      allTracking[issueId] = {
        ...allTracking[issueId],
        inCharge: {
          id: inCharge.id,
          name: inCharge.name,
          role: inCharge.role,
          assignedAt: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTracking))
      return allTracking[issueId]
    } catch (error) {
      console.error('Error setting in charge:', error)
      throw new Error('Failed to set in charge')
    }
  },

  // Add a status update note
  addStatusUpdate: (issueId, note, updatedBy) => {
    try {
      const allTracking = issueTrackingService.getAllTracking()

      if (!allTracking[issueId]) {
        allTracking[issueId] = { statusUpdates: [] }
      }

      if (!allTracking[issueId].statusUpdates) {
        allTracking[issueId].statusUpdates = []
      }

      allTracking[issueId].statusUpdates.push({
        note,
        updatedBy: {
          id: updatedBy.id,
          name: updatedBy.name,
          role: updatedBy.role,
        },
        timestamp: new Date().toISOString(),
      })

      allTracking[issueId].lastUpdated = new Date().toISOString()

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTracking))
      return allTracking[issueId]
    } catch (error) {
      console.error('Error adding status update:', error)
      throw new Error('Failed to add status update')
    }
  },

  // Unassign someone from an issue
  unassignIssue: (issueId) => {
    try {
      const allTracking = issueTrackingService.getAllTracking()

      if (allTracking[issueId]) {
        delete allTracking[issueId].assignedTo
        allTracking[issueId].lastUpdated = new Date().toISOString()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allTracking))
      }

      return allTracking[issueId] || null
    } catch (error) {
      console.error('Error unassigning issue:', error)
      throw new Error('Failed to unassign issue')
    }
  },

  // Remove in-charge assignment
  removeInCharge: (issueId) => {
    try {
      const allTracking = issueTrackingService.getAllTracking()

      if (allTracking[issueId]) {
        delete allTracking[issueId].inCharge
        allTracking[issueId].lastUpdated = new Date().toISOString()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allTracking))
      }

      return allTracking[issueId] || null
    } catch (error) {
      console.error('Error removing in charge:', error)
      throw new Error('Failed to remove in charge')
    }
  },

  // Clear all tracking data (for testing/admin purposes)
  clearAllTracking: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing tracking data:', error)
    }
  },
}

export default issueTrackingService
