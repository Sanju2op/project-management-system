import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ArrowLeft,
  Plus,
  Edit,
  Trash,
  AlertCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  examScheduleAPI,
  courseAnnouncementAPI,
  guideAnnouncementAPI,
  divisionAPI,
} from "../../services/api";

// Simple error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-center p-4">
          <h2>Error Rendering Exam Schedules</h2>
          <p>{this.state.error?.message || "An unknown error occurred"}</p>
          <p>Please check the console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ExamScheduleManagement() {
  const navigate = useNavigate();

  // State for schedules
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState(null);

  // State for course announcements
  const [courseAnnouncements, setCourseAnnouncements] = useState([]);
  const [courseAnnouncementsLoading, setCourseAnnouncementsLoading] =
    useState(false);
  const [courseAnnouncementsError, setCourseAnnouncementsError] =
    useState(null);

  // State for guide announcements
  const [guideAnnouncements, setGuideAnnouncements] = useState([]);
  const [guideAnnouncementsLoading, setGuideAnnouncementsLoading] =
    useState(false);
  const [guideAnnouncementsError, setGuideAnnouncementsError] = useState(null);

  // State for divisions
  const [divisions, setDivisions] = useState([]);

  // UI state
  const [filterCourse, setFilterCourse] = useState("All");
  const [activeTab, setActiveTab] = useState("schedules");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCourseAnnouncementModalOpen, setIsCourseAnnouncementModalOpen] =
    useState(false);
  const [isGuideAnnouncementModalOpen, setIsGuideAnnouncementModalOpen] =
    useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [currentCourseAnnouncement, setCurrentCourseAnnouncement] =
    useState(null);
  const [currentGuideAnnouncement, setCurrentGuideAnnouncement] =
    useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    course: "",
    type: "Exam",
    description: "",
    date: "",
    time: "",
  });
  const [courseAnnouncementForm, setCourseAnnouncementForm] = useState({
    title: "",
    message: "",
    date: "",
    courses: [],
  });
  const [guideAnnouncementForm, setGuideAnnouncementForm] = useState({
    title: "",
    message: "",
    date: "",
    guides: ["All"],
  });

  // State for unique courses
  const [courses, setCourses] = useState([]);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // "schedule", "courseAnnouncement", "guideAnnouncement"

  // Fetch data from APIs
  useEffect(() => {
    fetchSchedules();
    fetchCourseAnnouncements();
    fetchGuideAnnouncements();
    fetchDivisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set courses from divisions
  useEffect(() => {
    if (divisions.length > 0) {
      setCourses([...new Set(divisions.map((d) => d.course))]);
    }
  }, [divisions]);

  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      setSchedulesError(null);
      const response = await examScheduleAPI.getAll({ course: filterCourse });
      setSchedules(response.data.data);
    } catch (error) {
      setSchedulesError(
        error.response?.data?.message || "Failed to fetch schedules"
      );
      console.error("Error fetching schedules:", error);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchCourseAnnouncements = async () => {
    try {
      setCourseAnnouncementsLoading(true);
      setCourseAnnouncementsError(null);
      const response = await courseAnnouncementAPI.getAll();
      setCourseAnnouncements(response.data.data);
    } catch (error) {
      setCourseAnnouncementsError(
        error.response?.data?.message || "Failed to fetch course announcements"
      );
      console.error("Error fetching course announcements:", error);
    } finally {
      setCourseAnnouncementsLoading(false);
    }
  };

  const fetchGuideAnnouncements = async () => {
    try {
      setGuideAnnouncementsLoading(true);
      setGuideAnnouncementsError(null);
      const response = await guideAnnouncementAPI.getAll();
      setGuideAnnouncements(response.data.data);
    } catch (error) {
      setGuideAnnouncementsError(
        error.response?.data?.message || "Failed to fetch guide announcements"
      );
      console.error("Error fetching guide announcements:", error);
    } finally {
      setGuideAnnouncementsLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await divisionAPI.getAll();
      setDivisions(response.data.data);
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleKeyDown = (e, tab) => {
    if (e.key === "Enter" || e.key === " ") {
      setActiveTab(tab);
    }
  };

  const handleAddEditSchedule = async () => {
    if (
      !scheduleForm.course ||
      !scheduleForm.type ||
      !scheduleForm.description ||
      !scheduleForm.date
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (currentSchedule) {
        await examScheduleAPI.update(currentSchedule._id, scheduleForm);
      } else {
        await examScheduleAPI.create(scheduleForm);
      }
      setIsScheduleModalOpen(false);
      setScheduleForm({
        course: "BCA",
        type: "Exam",
        description: "",
        date: "",
        time: "",
      });
      setCurrentSchedule(null);
      fetchSchedules(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save schedule");
      console.error("Error saving schedule:", error);
    }
  };

  const handleDeleteSchedule = async (id) => {
    setDeleteItem(id);
    setDeleteType("schedule");
    setIsDeleteModalOpen(true);
  };

  const handleAddEditCourseAnnouncement = async () => {
    if (
      !courseAnnouncementForm.title ||
      !courseAnnouncementForm.message ||
      courseAnnouncementForm.courses.length === 0
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (currentCourseAnnouncement) {
        await courseAnnouncementAPI.update(
          currentCourseAnnouncement._id,
          courseAnnouncementForm
        );
      } else {
        await courseAnnouncementAPI.create(courseAnnouncementForm);
      }
      setIsCourseAnnouncementModalOpen(false);
      setCourseAnnouncementForm({
        title: "",
        message: "",
        date: "",
        courses: [],
      });
      setCurrentCourseAnnouncement(null);
      fetchCourseAnnouncements(); // Refresh the list
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to save course announcement"
      );
      console.error("Error saving course announcement:", error);
    }
  };

  const handleDeleteCourseAnnouncement = async (id) => {
    setDeleteItem(id);
    setDeleteType("courseAnnouncement");
    setIsDeleteModalOpen(true);
  };

  const handleAddEditGuideAnnouncement = async () => {
    if (
      !guideAnnouncementForm.title ||
      !guideAnnouncementForm.message ||
      !guideAnnouncementForm.date
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const formData = { ...guideAnnouncementForm, guides: ["All"] };
      if (currentGuideAnnouncement) {
        await guideAnnouncementAPI.update(
          currentGuideAnnouncement._id,
          formData
        );
      } else {
        await guideAnnouncementAPI.create(formData);
      }
      setIsGuideAnnouncementModalOpen(false);
      setGuideAnnouncementForm({
        title: "",
        message: "",
        date: "",
        guides: ["All"],
      });
      setCurrentGuideAnnouncement(null);
      fetchGuideAnnouncements(); // Refresh the list
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to save guide announcement"
      );
      console.error("Error saving guide announcement:", error);
    }
  };

  const handleDeleteGuideAnnouncement = async (id) => {
    setDeleteItem(id);
    setDeleteType("guideAnnouncement");
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === "schedule") {
        await examScheduleAPI.delete(deleteItem);
        fetchSchedules();
      } else if (deleteType === "courseAnnouncement") {
        await courseAnnouncementAPI.delete(deleteItem);
        fetchCourseAnnouncements();
      } else if (deleteType === "guideAnnouncement") {
        await guideAnnouncementAPI.delete(deleteItem);
        fetchGuideAnnouncements();
      }
      setIsDeleteModalOpen(false);
      setDeleteItem(null);
      setDeleteType("");
    } catch (error) {
      alert(error.response?.data?.message || `Failed to delete ${deleteType}`);
      console.error(`Error deleting ${deleteType}:`, error);
    }
  };

  const openScheduleModal = (schedule = null) => {
    setCurrentSchedule(schedule);
    setScheduleForm(
      schedule || {
        course: "BCA",
        type: "Exam",
        description: "",
        date: "",
        time: "",
      }
    );
    setIsScheduleModalOpen(true);
  };

  const openCourseAnnouncementModal = (announcement = null) => {
    setCurrentCourseAnnouncement(announcement);
    setCourseAnnouncementForm(
      announcement || { title: "", message: "", date: "", courses: [] }
    );
    setIsCourseAnnouncementModalOpen(true);
  };

  const openGuideAnnouncementModal = (announcement = null) => {
    setCurrentGuideAnnouncement(announcement);
    setGuideAnnouncementForm(
      announcement || { title: "", message: "", date: "", guides: [] }
    );
    setIsGuideAnnouncementModalOpen(true);
  };

  const filteredSchedules =
    filterCourse === "All"
      ? schedules
      : schedules.filter((s) => s.course === filterCourse);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans">
        <style>
          {`
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse-once {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            @keyframes icon-pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.6s ease-out;
            }
            .animate-pulse-once {
              animation: pulse-once 0.5s ease-in-out;
            }
            .animate-icon-pulse {
              animation: icon-pulse 2s infinite ease-in-out;
            }
            .bg-particles {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Ccircle fill='%2300b8d4' cx='100' cy='100' r='5'/%3E%3Ccircle fill='%2300b8d4' cx='700' cy='200' r='4'/%3E%3Ccircle fill='%2300b8d4' cx='300' cy='600' r='6'/%3E%3Ccircle fill='%2300b8d4' cx='500' cy='400' r='5'/%3E%3C/svg%3E") repeat;
              opacity: 0.1;
            }
            .tab-button {
              position: relative;
              z-index: 10;
              pointer-events: auto;
            }
          `}
        </style>
        <div className="bg-particles" />
        <div className="sticky top-0 w-full bg-white/10 backdrop-blur-sm border-b border-white/30 shadow-lg z-10 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="mr-4 text-white hover:text-cyan-400 transition duration-200"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
                Exam Schedules & Announcements
              </h1>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto mt-8 px-4 sm:px-6">
          {/* Tabs */}
          <div className="flex border-b border-white/30 mb-6 space-x-2">
            <button
              onClick={() => handleTabChange("schedules")}
              onKeyDown={(e) => handleKeyDown(e, "schedules")}
              className={`tab-button px-4 py-2 font-semibold text-white cursor-pointer ${
                activeTab === "schedules" ? "bg-teal-500" : "bg-gray-800"
              } rounded-t-lg transition duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              aria-label="View Schedules"
              data-testid="tab-schedules"
            >
              Schedules
            </button>
            <button
              onClick={() => handleTabChange("courseAnnouncements")}
              onKeyDown={(e) => handleKeyDown(e, "courseAnnouncements")}
              className={`tab-button px-4 py-2 font-semibold text-white cursor-pointer ${
                activeTab === "courseAnnouncements"
                  ? "bg-teal-500"
                  : "bg-gray-800"
              } rounded-t-lg transition duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              aria-label="View Course Announcements"
              data-testid="tab-courseAnnouncements"
            >
              Course Announcements
            </button>
            <button
              onClick={() => handleTabChange("guideAnnouncements")}
              onKeyDown={(e) => handleKeyDown(e, "guideAnnouncements")}
              className={`tab-button px-4 py-2 font-semibold text-white cursor-pointer ${
                activeTab === "guideAnnouncements"
                  ? "bg-teal-500"
                  : "bg-gray-800"
              } rounded-t-lg transition duration-200 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              aria-label="View Guide Announcements"
              data-testid="tab-guideAnnouncements"
            >
              Guide Announcements
            </button>
          </div>

          {/* Schedules Tab */}
          {activeTab === "schedules" && (
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/30 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Schedules</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                    aria-label="Filter by course"
                  >
                    <option value="All">All Courses</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => openScheduleModal()}
                    className="flex items-center bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-lg animate-pulse-once"
                    aria-label="Add New Schedule"
                  >
                    <Plus size={20} className="mr-2" /> Add Schedule
                  </button>
                </div>
              </div>

              {schedulesLoading ? (
                <div className="text-white text-center p-4 flex items-center justify-center">
                  <Loader2 size={24} className="mr-2 animate-spin" /> Loading
                  schedules...
                </div>
              ) : schedulesError ? (
                <div className="text-red-500 text-center p-4 flex items-center justify-center">
                  <AlertCircle size={24} className="mr-2" /> {schedulesError}
                </div>
              ) : filteredSchedules.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/30">
                        <th className="p-2 text-left">Course</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Time</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map((schedule) => (
                        <tr
                          key={schedule._id}
                          className="border-b border-white/20 hover:bg-white/10 animate-fade-in-up"
                        >
                          <td className="p-2">{schedule.course}</td>
                          <td className="p-2">{schedule.type}</td>
                          <td className="p-2">{schedule.description}</td>
                          <td className="p-2">
                            {new Date(schedule.date).toLocaleDateString()}
                          </td>
                          <td className="p-2">{schedule.time || "-"}</td>
                          <td className="p-2 flex space-x-2">
                            <button
                              onClick={() => openScheduleModal(schedule)}
                              className="text-cyan-400 hover:text-cyan-300"
                              aria-label={`Edit ${schedule.description}`}
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule._id)}
                              className="text-red-400 hover:text-red-300"
                              aria-label={`Delete ${schedule.description}`}
                            >
                              <Trash size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-white text-center p-4 flex items-center justify-center">
                  <AlertCircle size={24} className="mr-2" /> No schedules
                  available for {filterCourse}.
                </div>
              )}
            </div>
          )}

          {/* Course Announcements Tab */}
          {activeTab === "courseAnnouncements" && (
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/30 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Course Announcements
                </h2>
                <button
                  onClick={() => openCourseAnnouncementModal()}
                  className="flex items-center bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-lg animate-pulse-once"
                  aria-label="Add New Course Announcement"
                >
                  <Plus size={20} className="mr-2" /> Add Announcement
                </button>
              </div>
              {courseAnnouncementsLoading ? (
                <div className="text-white text-center p-4 flex items-center justify-center">
                  <Loader2 size={24} className="mr-2 animate-spin" /> Loading
                  course announcements...
                </div>
              ) : courseAnnouncementsError ? (
                <div className="text-red-500 text-center p-4 flex items-center justify-center">
                  <AlertCircle size={24} className="mr-2" />{" "}
                  {courseAnnouncementsError}
                </div>
              ) : courseAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {courseAnnouncements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="bg-white/5 p-4 rounded-lg border border-white/20 animate-fade-in-up"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {announcement.title}
                          </h3>
                          <p className="text-white/90">
                            {announcement.message}
                          </p>
                          <p className="text-sm text-white/70">
                            Date:{" "}
                            {new Date(announcement.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-white/70">
                            Courses: {announcement.courses.join(", ")}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              openCourseAnnouncementModal(announcement)
                            }
                            className="text-cyan-400 hover:text-cyan-300"
                            aria-label={`Edit ${announcement.title}`}
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCourseAnnouncement(announcement._id)
                            }
                            className="text-red-400 hover:text-red-300"
                            aria-label={`Delete ${announcement.title}`}
                          >
                            <Trash size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white text-center p-4 flex items-center justify-center">
                  <AlertCircle size={24} className="mr-2" /> No course
                  announcements available.
                </div>
              )}
            </div>
          )}

          {/* Guide Announcements Tab */}
          {activeTab === "guideAnnouncements" && (
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/30 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Guide Announcements
                </h2>
                <button
                  onClick={() => openGuideAnnouncementModal()}
                  className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-lg animate-pulse-once"
                  aria-label="Add New Guide Announcement"
                >
                  <Plus size={20} className="mr-2" /> Add Announcement
                </button>
              </div>
              {guideAnnouncementsLoading ? (
                <div className="text-white text-center p-4 flex items-center justify-center">
                  <Loader2 size={24} className="mr-2 animate-spin" /> Loading
                  guide announcements...
                </div>
              ) : guideAnnouncementsError ? (
                <div className="text-red-500 text-center p-4 flex items-center justify-center">
                  <AlertCircle size={24} className="mr-2" />{" "}
                  {guideAnnouncementsError}
                </div>
              ) : guideAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {guideAnnouncements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="bg-white/5 p-4 rounded-lg border border-white/20 animate-fade-in-up"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {announcement.title}
                          </h3>
                          <p className="text-white/90">
                            {announcement.message}
                          </p>
                          <p className="text-sm text-white/70">
                            Date:{" "}
                            {new Date(announcement.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-white/70">
                            Guides: {announcement.guides.join(", ")}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              openGuideAnnouncementModal(announcement)
                            }
                            className="text-teal-300 hover:text-teal-200"
                            aria-label={`Edit ${announcement.title}`}
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteGuideAnnouncement(announcement._id)
                            }
                            className="text-red-400 hover:text-red-300"
                            aria-label={`Delete ${announcement.title}`}
                          >
                            <Trash size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white text-center p-4 flex items-center justify-center">
                  <AlertCircle size={24} className="mr-2" /> No guide
                  announcements available.
                </div>
              )}
            </div>
          )}

          {/* Schedule Modal */}
          {isScheduleModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/30 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentSchedule ? "Edit Schedule" : "Add Schedule"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/90 mb-1">Course</label>
                    <select
                      value={scheduleForm.course}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          course: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      aria-label="Select course"
                    >
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">Type</label>
                    <select
                      value={scheduleForm.type}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          type: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      aria-label="Select type"
                    >
                      <option value="Exam">Exam</option>
                      <option value="Submission">Submission</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.description}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      placeholder="e.g., Internal Exam 1"
                      aria-label="Schedule description"
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      aria-label="Schedule date"
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">
                      Time (optional)
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          time: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      aria-label="Schedule time"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition duration-200"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEditSchedule}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-200 shadow-lg animate-pulse-once"
                    aria-label={
                      currentSchedule ? "Save Schedule" : "Add Schedule"
                    }
                  >
                    {currentSchedule ? "Save" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Course Announcement Modal */}
          {isCourseAnnouncementModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/30 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentCourseAnnouncement
                    ? "Edit Course Announcement"
                    : "Add Course Announcement"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/90 mb-1">Title</label>
                    <input
                      type="text"
                      value={courseAnnouncementForm.title}
                      onChange={(e) =>
                        setCourseAnnouncementForm({
                          ...courseAnnouncementForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      placeholder="e.g., Exam Schedule Update"
                      aria-label="Course announcement title"
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">Message</label>
                    <textarea
                      value={courseAnnouncementForm.message}
                      onChange={(e) =>
                        setCourseAnnouncementForm({
                          ...courseAnnouncementForm,
                          message: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      placeholder="e.g., Internal exams rescheduled."
                      rows="4"
                      aria-label="Course announcement message"
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">
                      Date (optional)
                    </label>
                    <input
                      type="date"
                      value={courseAnnouncementForm.date}
                      onChange={(e) =>
                        setCourseAnnouncementForm({
                          ...courseAnnouncementForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      aria-label="Course announcement date"
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">Courses</label>
                    <div className="flex space-x-2">
                      {divisions.map((division) => {
                        const courseValue = `${division.course} Sem${division.semester}`;
                        return (
                          <label
                            key={division._id}
                            className="flex items-center text-white"
                          >
                            <input
                              type="checkbox"
                              checked={courseAnnouncementForm.courses.includes(
                                courseValue
                              )}
                              onChange={(e) => {
                                const courses = e.target.checked
                                  ? [
                                      ...courseAnnouncementForm.courses,
                                      courseValue,
                                    ]
                                  : courseAnnouncementForm.courses.filter(
                                      (c) => c !== courseValue
                                    );
                                setCourseAnnouncementForm({
                                  ...courseAnnouncementForm,
                                  courses,
                                });
                              }}
                              className="mr-2"
                              aria-label={`Select ${courseValue}`}
                            />
                            {courseValue}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setIsCourseAnnouncementModalOpen(false)}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition duration-200"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEditCourseAnnouncement}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-200 shadow-lg animate-pulse-once"
                    aria-label={
                      currentCourseAnnouncement
                        ? "Save Course Announcement"
                        : "Send Course Announcement"
                    }
                  >
                    {currentCourseAnnouncement ? "Save" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Guide Announcement Modal */}
          {isGuideAnnouncementModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/30 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentGuideAnnouncement
                    ? "Edit Guide Announcement"
                    : "Add Guide Announcement"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/90 mb-1">Title</label>
                    <input
                      type="text"
                      value={guideAnnouncementForm.title}
                      onChange={(e) =>
                        setGuideAnnouncementForm({
                          ...guideAnnouncementForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      placeholder="e.g., Project Evaluation Deadline"
                      aria-label="Guide announcement title"
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">Message</label>
                    <textarea
                      value={guideAnnouncementForm.message}
                      onChange={(e) =>
                        setGuideAnnouncementForm({
                          ...guideAnnouncementForm,
                          message: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      placeholder="e.g., Submit evaluations by 10 Mar."
                      rows="4"
                      aria-label="Guide announcement message"
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">Date</label>
                    <input
                      type="date"
                      value={guideAnnouncementForm.date}
                      onChange={(e) =>
                        setGuideAnnouncementForm({
                          ...guideAnnouncementForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-lg border border-white/30"
                      aria-label="Guide announcement date"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setIsGuideAnnouncementModalOpen(false)}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition duration-200"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEditGuideAnnouncement}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-200 shadow-lg animate-pulse-once"
                    aria-label={
                      currentGuideAnnouncement
                        ? "Save Guide Announcement"
                        : "Send Guide Announcement"
                    }
                  >
                    {currentGuideAnnouncement ? "Save" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/30 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Confirm Deletion
                </h2>
                <p className="text-white/90 mb-6">
                  Are you sure you want to delete this{" "}
                  {deleteType === "schedule"
                    ? "schedule"
                    : deleteType === "courseAnnouncement"
                    ? "course announcement"
                    : "guide announcement"}
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition duration-200"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition duration-200"
                    aria-label="Confirm Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ExamScheduleManagement;
