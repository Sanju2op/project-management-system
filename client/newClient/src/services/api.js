import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
});

// Add Authorization header automatically for admin API
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function for guide/student API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("token") || localStorage.getItem("studentToken");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

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

// ==================== ADMIN API ====================
export const authAPI = {
  login: async (payload) => {
    const { data } = await adminApi.post("/login", payload);
    localStorage.setItem("token", data.token);
    return data;
  },
};

export const guideAPI = {
  getAll: () => adminApi.get("/get-all-guides"),
  getActive: () => adminApi.get("/guides/active"),
  add: (payload) => adminApi.post("/add-guide", payload),
  update: (id, payload) => adminApi.put(`/update-guide/${id}`, payload),
  delete: (id) => adminApi.delete(`/guides/${id}`),
  updateStatus: (id, status) =>
    adminApi.patch(`/new-guide-status/${id}`, { status }),
};

export const groupAPI = {
  getAll: (params) => adminApi.get("/get-groups", { params }),
  getById: (id) => adminApi.get(`/groups/${id}`),
  getAvailableStudents: (id, params) =>
    adminApi.get(`/groups/${id}/students/available`, { params }),
  create: (payload) => adminApi.post("/groups", payload),
  update: (id, payload) => adminApi.put(`/update-group/${id}`, payload),
  delete: (id) => adminApi.delete(`/groups/${id}`),
};

export const studentAPI = {
  getAll: (params) => adminApi.get("/students", { params }),
  getById: (id) => adminApi.get(`/students/${id}`),
  getAvailable: (params) => adminApi.get("/get-available-students", { params }),
  add: (payload) => adminApi.post("/add-student", payload),
  update: (id, payload) => adminApi.put(`/students/${id}`, payload),
  delete: (id) => adminApi.delete(`/students/${id}`),
};

export const divisionAPI = {
  getAll: (params) => adminApi.get("/get-divisions", { params }),
  create: (payload) => adminApi.post("/add-division", payload),
  updateStatus: (divisionId, payload) =>
    adminApi.patch(`/update-division-status/${divisionId}`, payload),
  delete: (id) => adminApi.delete(`/delete-division/${id}`),
};

export const enrollmentAPI = {
  getAll: () => adminApi.get("/get-student-enrollments"),
  getByDivision: (divisionId) =>
    adminApi.get(`/get-enrollment-by-division/${divisionId}`),
  create: (payload) => adminApi.post("/add-student-enrollment", payload),
  generate: (payload) => adminApi.post("/generate-enrollments", payload),
  delete: (id) => adminApi.delete(`/remove-student/${id}`),
  deleteAllByDivision: (divisionId) =>
    adminApi.delete(`/remove-all-students/${divisionId}`),
};

export const evaluationParameterAPI = {
  getAll: () => adminApi.get("/get-evaluation-params"),
  create: (payload) => adminApi.post("/add-evaluation-param", payload),
  update: (id, payload) => adminApi.put(`/update-evaluation-param/${id}`, payload),
  delete: (id) => adminApi.delete(`/delete-evaluation-param/${id}`),
};

export const adminAPI = {
  getProfile: () => adminApi.get("/admin/profile"),
  updateProfile: (payload) => adminApi.put("/admin/profile", payload),
  changePassword: (payload) => adminApi.post("/admin/change-password", payload),
};

export const examScheduleAPI = {
  getAll: (params) => adminApi.get("/exam-schedules", { params }),
  create: (payload) => adminApi.post("/exam-schedules", payload),
  update: (id, payload) => adminApi.put(`/exam-schedules/${id}`, payload),
  delete: (id) => adminApi.delete(`/exam-schedules/${id}`),
};

export const courseAnnouncementAPI = {
  getAll: () => adminApi.get("/course-announcements"),
  create: (payload) => adminApi.post("/course-announcements", payload),
  update: (id, payload) => adminApi.put(`/course-announcements/${id}`, payload),
  delete: (id) => adminApi.delete(`/course-announcements/${id}`),
};

export const projectEvaluationAPI = {
  getAll: () => adminApi.get("/get-project-evaluations"),
  getByProject: (projectId) => adminApi.get(`/get-project-evaluation/${projectId}`),
  update: (projectId, parameterId, payload) =>
    adminApi.put(`/project-evaluations/${projectId}/${parameterId}`, payload),
};

export const guideAnnouncementAPI = {
  getAll: () => adminApi.get("/guide-announcements"),
  create: (payload) => adminApi.post("/guide-announcements", payload),
  update: (id, payload) => adminApi.put(`/guide-announcements/${id}`, payload),
  delete: (id) => adminApi.delete(`/guide-announcements/${id}`),
};

// ==================== GUIDE API ====================
export const guideAuthAPI = {
  guideLogin: async (credentials) => {
    const response = await apiRequest("/auth/guide/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return {
      token: response.data.token,
      data: response.data.data,
    };
  },
  guideRegister: async (userData) => {
    const response = await apiRequest("/auth/guide/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return {
      token: response.data.token,
      data: response.data.data,
    };
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
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

// Guide Panel API
export const guidePanelAPI = {
  getDashboard: async () => {
    try {
      const [groupsData, announcementsData] = await Promise.all([
        guidePanelAPI.getGroups().catch(() => []),
        guidePanelAPI.getCommunication({ type: "announcement" }).catch(() => []),
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
    const response = await apiRequest(`/guide-panel/groups/${groupId}/details`, {
      method: "PUT",
      body: JSON.stringify(groupData),
    });
    return response.data;
  },
  getAvailableStudentsForGroup: async (groupId) => {
    const response = await apiRequest(`/guide-panel/groups/${groupId}/available-students`, {
      method: "GET",
    });
    return response.data;
  },
  getStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/guide-panel/students?${queryString}`, {
      method: "GET",
    });
    return response.data;
  },
  searchStudents: async (enrollment) => {
    const response = await apiRequest(
      `/guide-panel/students/search?enrollment=${encodeURIComponent(enrollment)}`,
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
  getProfile: async () => {
    return await guideAuthAPI.getGuideProfile();
  },
  updateProfile: async (profileData) => {
    return await guideAuthAPI.updateGuideProfile(profileData);
  },
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
    const response = await apiRequest(`/guide-panel/projects/${projectId}/evaluate`, {
      method: "POST",
      body: JSON.stringify(evaluationData),
    });
    return response.data;
  },
  getProjectApprovals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/guide-panel/project-approvals?${queryString}`, {
      method: "GET",
    });
    return response.data;
  },
  approveProject: async (groupId) => {
    const response = await apiRequest(`/guide-panel/project-approvals/${groupId}/approve`, {
      method: "PUT",
    });
    return response.data;
  },
  rejectProject: async (groupId, reason) => {
    const response = await apiRequest(`/guide-panel/project-approvals/${groupId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
    return response.data;
  },
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
    const response = await apiRequest(`/guide-panel/feedback/${feedbackId}/remind`, {
      method: "POST",
    });
    return response.data;
  },
  getSeminarSchedule: async (params = {}) => {
    console.warn("getSeminarSchedule endpoint not implemented in backend yet");
    return [];
  },
  scheduleSeminar: async (seminarData) => {
    console.warn("scheduleSeminar endpoint not implemented in backend yet");
    return null;
  },
  getCommunication: async (params = {}) => {
    return [];
  },
  sendMessage: async (messageData) => {
    console.warn("sendMessage endpoint not implemented in backend yet");
    return null;
  },
  getReports: async (type, params = {}) => {
    console.warn("getReports endpoint not implemented in backend yet");
    return null;
  },
};

// Additional guide APIs
export const guideGroupAPI = {
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

export const guideProjectAPI = {
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

// ==================== STUDENT API ====================
export const studentPublicAPI = {
  getDivisions: () => apiRequest("/student/divisions"),
  getPendingEnrollments: (divisionId) =>
    apiRequest(`/student/pending-enrollments?divisionId=${divisionId}`),
  register: (payload) =>
    apiRequest("/student/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    apiRequest("/student/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const studentProtectedAPI = {
  getProfile: () => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAvailableStudents: () => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/available-students", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createGroup: (payload) => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/create-group", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
  checkGroup: () => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/check-group", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default { adminApi, apiRequest };
