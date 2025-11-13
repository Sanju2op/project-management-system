// @ts-nocheck
const API_BASE_URL = "http://localhost:5000/api";

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage
  const token = localStorage.getItem("token");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add Authorization header if token exists
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        "Server returned non-JSON response. Please check if the backend server is running."
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Authentication API functions
export const authAPI = {
  // Admin Login
  login: async (credentials) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Return the data in the format expected by the frontend
    return {
      token: response.data.token,
      data: response.data.data,
    };
  },

  // Admin Register
  register: async (userData) => {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Return the data in the format expected by the frontend
    return {
      token: response.data.token,
      data: response.data.data,
    };
  },

  // Guide Login
  guideLogin: async (credentials) => {
    const response = await apiRequest("/auth/guide/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Return the data in the format expected by the frontend
    return {
      token: response.data.token,
      data: response.data.data,
    };
  },

  // Guide Register
  guideRegister: async (userData) => {
    const response = await apiRequest("/auth/guide/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Return the data in the format expected by the frontend
    return {
      token: response.data.token,
      data: response.data.data,
    };
  },

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current guide profile
  getGuideProfile: async () => {
    const token = localStorage.getItem("token");
    const response = await apiRequest("/auth/guide/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // Update guide profile
  updateGuideProfile: async (profileData) => {
    const token = localStorage.getItem("token");
    const response = await apiRequest("/auth/guide/me", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    return response.data;
  },

  // Change guide password
  changeGuidePassword: async (passwordData) => {
    const token = localStorage.getItem("token");
    const response = await apiRequest("/auth/guide/change-password", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    return response.data;
  },
};

export const groupAPI = {
  getAllGroups: () => apiRequest("/groups"),
  getGroupById: (id) => apiRequest(`/groups/${id}`),
  getGroupsByGuide: (guideId) => apiRequest(`/groups/guide/${guideId}`),
  createGroup: (data) =>
    apiRequest("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateGroup: (id, data) =>
    apiRequest(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateProjectDetails: (id, data) =>
    apiRequest(`/groups/${id}/project`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteGroup: (id) =>
    apiRequest(`/groups/${id}`, {
      method: "DELETE",
    }),
};

export const guideAPI = {
  getAllGuides: () => apiRequest("/guides"),
  getGuideById: (id) => apiRequest(`/guides/${id}`),
  createGuide: (data) =>
    apiRequest("/guides", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateGuide: (id, data) =>
    apiRequest(`/guides/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteGuide: (id) =>
    apiRequest(`/guides/${id}`, {
      method: "DELETE",
    }),
};

export const projectAPI = {
  getAllProjects: () => apiRequest("/projects"),
  getProjectById: (id) => apiRequest(`/projects/${id}`),
  createProject: (data) =>
    apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id, data) =>
    apiRequest(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProject: (id) =>
    apiRequest(`/projects/${id}`, {
      method: "DELETE",
    }),
};

// Guide Panel API - Merged from guidePanelAPI.js
// Note: Based on backend routes, some endpoints may not be implemented yet
export const guidePanelAPI = {
  // Dashboard - Fetch groups and announcements
  getDashboard: async () => {
    try {
      const [groupsData, announcementsData] = await Promise.all([
        guidePanelAPI.getGroups().catch(() => []),
        guidePanelAPI
          .getCommunication({ type: "announcement" })
          .catch(() => []),
      ]);

      return {
        groups: groupsData || [],
        announcements: announcementsData || [],
        profile: null,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        groups: [],
        announcements: [],
        profile: null,
      };
    }
  },

  // Group Management
  getGroups: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/guide-panel/groups?${queryString}`, {
      method: "GET",
    });
    return response.data;
  },

  getGroupDetails: async (groupId) => {
    const response = await apiRequest(`/guide-panel/groups/${groupId}`, {
      method: "GET",
    });
    return response.data;
  },

  updateGroup: async (groupId, groupData) => {
    const response = await apiRequest(`/guide-panel/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(groupData),
    });
    return response.data;
  },

  updateGroupDetails: async (groupId, groupData) => {
    const response = await apiRequest(
      `/guide-panel/groups/${groupId}/details`,
      {
        method: "PUT",
        body: JSON.stringify(groupData),
      }
    );
    return response.data;
  },

  getAvailableStudentsForGroup: async (groupId) => {
    const response = await apiRequest(
      `/guide-panel/groups/${groupId}/available-students`,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  // Student Management
  getStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/guide-panel/students?${queryString}`, {
      method: "GET",
    });
    return response.data;
  },

  searchStudents: async (enrollment) => {
    const response = await apiRequest(
      `/guide-panel/students/search?enrollment=${encodeURIComponent(
        enrollment
      )}`,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  getStudentDetails: async (studentId) => {
    const response = await apiRequest(`/guide-panel/students/${studentId}`, {
      method: "GET",
    });
    return response.data;
  },

  // Profile Management
  getProfile: async () => {
    return await authAPI.getGuideProfile();
  },

  updateProfile: async (profileData) => {
    return await authAPI.updateGuideProfile(profileData);
  },

  // ------------------------------
  // 🔹 EVALUATION SYSTEM (NEW)
  // ------------------------------

  /**
   * Get all dynamic evaluation parameters from backend
   * @returns {Promise<object[]>}
   */
  getEvaluationParameters: async () => {
    const response = await apiRequest(`/guide-panel/evaluation-parameters`, {
      method: "GET",
    });
    return response.data;
  },

  getEvaluationByGroup: async (groupId) => {
    const response = await apiRequest(
      `/guide-panel/projects/${groupId}/evaluation`,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  saveEvaluation: async (groupId, evaluations) => {
    const response = await apiRequest(
      `/guide-panel/projects/${groupId}/evaluate`,
      {
        method: "POST",
        body: JSON.stringify({ evaluations }),
      }
    );
    return response.data;
  },

  // ------------------------------

  // Project Management
  getProjects: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/guide-panel/projects?${queryString}`, {
      method: "GET",
    });
    return response.data;
  },

  getProjectDetails: async (projectId) => {
    const response = await apiRequest(`/guide-panel/groups/${projectId}`, {
      method: "GET",
    });
    return response.data;
  },

  evaluateProject: async (projectId, evaluationData) => {
    const response = await apiRequest(
      `/guide-panel/projects/${projectId}/evaluate`,
      {
        method: "POST",
        body: JSON.stringify(evaluationData),
      }
    );
    return response.data;
  },

  // Project Approval
  getProjectApprovals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(
      `/guide-panel/project-approvals?${queryString}`,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  approveProject: async (groupId) => {
    const response = await apiRequest(
      `/guide-panel/project-approvals/${groupId}/approve`,
      {
        method: "PUT",
      }
    );
    return response.data;
  },

  rejectProject: async (groupId, reason) => {
    const response = await apiRequest(
      `/guide-panel/project-approvals/${groupId}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({ reason }),
      }
    );
    return response.data;
  },

  // Feedback System
  getFeedback: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/guide-panel/feedback?${queryString}`, {
      method: "GET",
    });
    return response.data;
  },

  submitFeedback: async (feedbackData) => {
    const response = await apiRequest(`/guide-panel/feedback`, {
      method: "POST",
      body: JSON.stringify(feedbackData),
    });
    return response.data;
  },

  updateFeedback: async (id, feedbackData) => {
    const response = await apiRequest(`/guide-panel/feedback/${id}`, {
      method: "PUT",
      body: JSON.stringify(feedbackData),
    });
    return response.data;
  },

  deleteFeedback: async (id) => {
    const response = await apiRequest(`/guide-panel/feedback/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },

  remindGroup: async (feedbackId) => {
    const response = await apiRequest(
      `/guide-panel/feedback/${feedbackId}/remind`,
      {
        method: "POST",
      }
    );
    return response.data;
  },
};

// ✅ Notifications API for guide dashboard
export const notificationAPI = {
  getAll: () => apiRequest("/notifications"),

  create: (payload) =>
    apiRequest("/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  markRead: (id) =>
    apiRequest(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    apiRequest("/notifications/mark-all-read", {
      method: "PATCH",
    }),
};

export default apiRequest;
