const API_BASE_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

// PUBLIC (No Login Required)
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

// PROTECTED (Login Required)
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

  getExamSchedules: () => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/exam-schedules", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getGuideDetails: () => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/guide-details", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getGroupChatMessages: () => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/group-chat/messages", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  sendGroupChatMessage: (message) => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/group-chat/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
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

  // 🔥 CRUD Requests for Student
  getMyRequests: () => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/requests/my-requests", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  createRequest: (data) => {
    const token = localStorage.getItem("studentToken");
    return apiRequest("/student/requests/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  updateRequest: (requestId, data) => {
    const token = localStorage.getItem("studentToken");
    return apiRequest(`/student/requests/${requestId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  deleteRequest: (requestId) => {
    const token = localStorage.getItem("studentToken");
    return apiRequest(`/student/requests/${requestId}`, {
      method: "DELETE",
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

  // 🔥 GET COURSE-WISE ANNOUNCEMENTS
  getCourseAnnouncements: (course) => {
    const token = localStorage.getItem("studentToken");
    return apiRequest(`/course-announcements?course=${course}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// ANNOUNCEMENTS API (STUDENT DASHBOARD)
export const announcementAPI = {
  // 🔥 Fetch all announcements
  getAll: () => apiRequest("/student/announcements", { method: "GET" }),
};

// NOTIFICATIONS API
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

export const documentAPI = {
  getAll: () =>
    apiRequest("/documents", {
      method: "GET",
    }),
};

export default apiRequest;
