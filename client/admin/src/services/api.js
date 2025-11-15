import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/admin",
});

// ✅ Add Authorization header automatically
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (payload) => {
    const { data } = await api.post("/login", payload);
    // backend should return: { token, data: { ...admin } }
    // ✅ Save token for later requests
    localStorage.setItem("token", data.token);
    return data;
  },
};

// ✅ Guides API
export const guideAPI = {
  getAll: () => api.get("/get-all-guides"),
  getActive: () => api.get("/guides/active"), // Added for GroupManagement
  add: (payload) => api.post("/add-guide", payload),
  update: (id, payload) => api.put(`/update-guide/${id}`, payload),
  delete: (id) => api.delete(`/guides/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/new-guide-status/${id}`, { status }),
};

// ✅ Groups API
export const groupAPI = {
  getAll: (params) => api.get("/get-groups", { params }), // Supports course and year filters
  getById: (id) => api.get(`/groups/${id}`),
  getAvailableStudents: (id, params) =>
    api.get(`/groups/${id}/students/available`, { params }),
  create: (payload) => api.post("/groups", payload),
  update: (id, payload) => api.put(`/update-group/${id}`, payload),
  delete: (id) => api.delete(`/groups/${id}`),
};

// ✅ Students API
export const studentAPI = {
  getAll: (params) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),
  getAvailable: (params) => api.get("/get-available-students", { params }),
  add: (payload) => api.post("/add-student", payload),
  update: (id, payload) => api.put(`/students/${id}`, payload),
  delete: (id) => api.delete(`/students/${id}`),
};

// ✅ Divisions API
export const divisionAPI = {
  getAll: (params) => api.get("/get-divisions", { params }),
  create: (payload) => api.post("/add-division", payload),
  updateStatus: (divisionId, payload) =>
    api.patch(`/update-division-status/${divisionId}`, payload),
  delete: (id) => api.delete(`/delete-division/${id}`),
};

// ✅ Enrollments API
export const enrollmentAPI = {
  getAll: () => api.get("/get-student-enrollments"),
  getByDivision: (divisionId) =>
    api.get(`/get-enrollment-by-division/${divisionId}`),
  create: (payload) => api.post("/add-student-enrollment", payload),
  generate: (payload) => api.post("/generate-enrollments", payload),
  delete: (id) => api.delete(`/remove-student/${id}`),
  deleteAllByDivision: (divisionId) =>
    api.delete(`/remove-all-students/${divisionId}`),
  // AddEnroll: (payload) => api.post("/add-student-enrollment", payload),
};

// ✅ Evaluation Parameters API
export const evaluationParameterAPI = {
  getAll: () => api.get("/get-evaluation-params"),

  create: (payload) => api.post("/add-evaluation-param", payload),
  update: (id, payload) => api.put(`/update-evaluation-param/${id}`, payload),
  delete: (id) => api.delete(`/delete-evaluation-param/${id}`),
};

// ✅ Admin API
export const adminAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (payload) => api.put("/profile", payload),
  changePassword: (payload) => api.post("/change-password", payload),
};

// ✅ Exam Schedules API
export const examScheduleAPI = {
  getAll: (params) => api.get("/exam-schedules", { params }),
  create: (payload) => api.post("/exam-schedules", payload),
  update: (id, payload) => api.put(`/exam-schedules/${id}`, payload),
  delete: (id) => api.delete(`/exam-schedules/${id}`),
};

// ✅ Course Announcements API
export const courseAnnouncementAPI = {
  getAll: () => api.get("/course-announcements"),
  create: (payload) => api.post("/course-announcements", payload),
  update: (id, payload) => api.put(`/course-announcements/${id}`, payload),
  delete: (id) => api.delete(`/course-announcements/${id}`),
};

// ✅ Project Evaluations API
// services/api.js (या जहाँ भी है)

// ✅ Project Evaluations API – FINAL & FULLY WORKING
export const projectEvaluationAPI = {
  getByProject: (groupId) => api.get(`/get-group-evaluation/${groupId}`),
  saveAll: (groupId, evaluations) =>
    api.post(`/save-all-project-evaluations/${groupId}`, { evaluations }),
  getAllEvaluations: async () => {
    const response = await api.get("/get-all-evaluations");
    return response.data; // { success: true, data: [...] }
  },
};
// ✅ Guide Announcements API
export const guideAnnouncementAPI = {
  getAll: () => api.get("/guide-announcements"),
  create: (payload) => api.post("/guide-announcements", payload),
  update: (id, payload) => api.put(`/guide-announcements/${id}`, payload),
  delete: (id) => api.delete(`/guide-announcements/${id}`),
};

// inside api.js (where `api` axios instance exists)
export const notificationAPI = {
  getAll: () => api.get("/notifications"), // GET /api/notifications
  create: (payload) => api.post("/notifications", payload),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/mark-all-read"),
};

export const expertiseAPI = {
  getAll: () => api.get("/expertise"),
  create: (data) => api.post("/expertise", data),
  update: (id, data) => api.put(`/expertise/${id}`, data),
  delete: (id) => api.delete(`/expertise/${id}`),
};

export default api;
