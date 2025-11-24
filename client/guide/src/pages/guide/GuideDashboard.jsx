import React, { useState, useEffect } from "react";
// @ts-nocheck
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Users2,
  FileText,
  MessageSquare,
  BarChart3,
  Calendar,
  User,
  Edit3,
  LogOut,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { guidePanelAPI, authAPI } from "../../services/api";

export default function GuideDashboard() {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [assignedGroups, setAssignedGroups] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data using the unified endpoint
      const dashboardData = await guidePanelAPI.getDashboard();
      // console.log(dashboardData);
      setAssignedGroups(dashboardData.groups || []);
      setRecentAnnouncements(dashboardData.announcements || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      setAssignedGroups([]);
      setRecentAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  // Mock data for dashboard
  /*
  const [assignedGroups] = useState([
    {
      id: "g1",
      groupName: "Alpha Team",
      projectTitle: "E-commerce Platform",
      status: "In Progress",
      progress: 75,
      members: ["Ananya Sharma", "Rahul Verma", "Neha Singh"],
      lastUpdate: "2024-01-20",
      nextSeminar: "2024-01-25",
    },
    {
      id: "g2",
      groupName: "Beta Squad",
      projectTitle: "Real-time Chat App",
      status: "Under Review",
      progress: 60,
      members: ["Vikram Rao", "Priya Patel", "Amit Kumar"],
      lastUpdate: "2024-01-18",
      nextSeminar: "2024-01-22",
    },
    {
      id: "g3",
      groupName: "Project Phoenix",
      projectTitle: "AI Recommendation System",
      status: "Completed",
      progress: 100,
      members: ["Sneha Desai", "Rajesh Mehta", "Pooja Joshi"],
      lastUpdate: "2024-01-15",
      nextSeminar: "Final Review",
    },
  ]);

  const [recentAnnouncements] = useState([
    {
      id: "a1",
      title: "Final Project Submission Deadline",
      content: "All final project submissions are due by January 30th, 2024.",
      date: "2024-01-20",
      priority: "high",
    },
    {
      id: "a2",
      title: "Evaluation Schedule Update",
      content:
        "Project evaluations will be conducted from January 25th to January 28th.",
      date: "2024-01-19",
      priority: "medium",
    },
  ]);
  */

  /**
   * Normalize status-like values for easy comparisons.
   * @param {string | null | undefined} value
   * @returns {string}
   */
  const normalizeStatus = (value = "") =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  /**
   * Safely check whether a normalized value exists within a list.
   * @param {string | null | undefined} value
   * @param {string[]} list
   * @returns {boolean}
   */
  const isInList = (value = "", list = []) =>
    Array.isArray(list) && list.indexOf(normalizeStatus(value)) !== -1;

  const STATUS_BUCKETS = {
    pending: ["pending", "pending review", "pending evaluation", "awaiting review"],
    active: [
      "active",
      "in progress",
      "not started",
      "pending",
      "pending review",
      "pending evaluation",
    ],
    completed: ["completed", "done", "finished"],
  };

  const pendingReviewsCount = assignedGroups.filter((group) => {
    const status = normalizeStatus(group.status);
    const approval = normalizeStatus(group.projectApprovalStatus);
    const evaluation = normalizeStatus(
      group.evaluationStatus || group.evaluation?.status
    );

    return (
      isInList(status, STATUS_BUCKETS.pending) ||
      isInList(approval, STATUS_BUCKETS.pending) ||
      isInList(evaluation, STATUS_BUCKETS.pending)
    );
  }).length;

  const completedProjectsCount = assignedGroups.filter((group) => {
    const status = normalizeStatus(group.status);
    const approval = normalizeStatus(group.projectApprovalStatus);
    const evaluation = normalizeStatus(
      group.evaluationStatus || group.evaluation?.status
    );

    return (
      isInList(status, STATUS_BUCKETS.completed) ||
      approval === "approved" ||
      isInList(evaluation, STATUS_BUCKETS.completed)
    );
  }).length;

  const activeProjectsCount =
    assignedGroups.filter((group) => {
      const status = normalizeStatus(group.status);
      const approval = normalizeStatus(group.projectApprovalStatus);
      const evaluation = normalizeStatus(
        group.evaluationStatus || group.evaluation?.status
      );

      if (
        isInList(status, STATUS_BUCKETS.completed) ||
        approval === "approved" ||
        isInList(evaluation, STATUS_BUCKETS.completed)
      ) {
        return false;
      }

      // Treat missing statuses as active so the UI reflects existing assignments.
      if (!status && !approval && !evaluation) {
        return true;
      }

      return (
        isInList(status, STATUS_BUCKETS.active) ||
        isInList(approval, STATUS_BUCKETS.active) ||
        isInList(evaluation, STATUS_BUCKETS.active)
      );
    }).length || Math.max(assignedGroups.length - completedProjectsCount, 0);

  const stats = [
    {
      title: "Assigned Groups",
      value: assignedGroups.length.toString(),
      icon: Users2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/20",
      route: "/guide/groups",
    },
    {
      title: "Pending Reviews",
      value: pendingReviewsCount.toString(),
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-400/20",
      route: "/guide/projects",
    },
    {
      title: "Active Projects",
      value: activeProjectsCount.toString(),
      icon: BookOpen,
      color: "text-blue-400",
      bg: "bg-blue-400/20",
      route: "/guide/projects",
    },
    {
      title: "Completed Projects",
      value: completedProjectsCount.toString(),
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-400/20",
      route: "/guide/evaluation",
    },
  ];

  const quickActions = [
    {
      title: "Manage Groups",
      description: "View and manage assigned student groups",
      icon: Users2,
      route: "/guide/groups",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Project Approval",
      description: "Review and approve project proposals",
      icon: FileText,
      route: "/guide/projects",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Provide Feedback",
      description: "Give feedback and evaluations to students",
      icon: MessageSquare,
      route: "/guide/feedback",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Project Evaluation",
      description: "Evaluate and grade student projects",
      icon: Award,
      route: "/guide/evaluation",
      color: "from-green-500 to-emerald-500",
    },
  ];

  //@ts-ignore
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/30 text-green-300 border-green-400/30";
      case "In Progress":
        return "bg-blue-500/30 text-blue-300 border-blue-400/30";
      case "Under Review":
        return "bg-orange-500/30 text-orange-300 border-orange-400/30";
      default:
        return "bg-gray-500/30 text-gray-300 border-gray-400/30";
    }
  };

  //@ts-ignore
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/30 text-red-300 border-red-400/30";
      case "medium":
        return "bg-orange-500/30 text-orange-300 border-orange-400/30";
      case "low":
        return "bg-green-500/30 text-green-300 border-green-400/30";
      default:
        return "bg-gray-500/30 text-gray-300 border-gray-400/30";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Calculations for Project Progress Overview (Handling empty array)
  const totalGroups = assignedGroups.length;
  const totalProgress = assignedGroups.reduce(
    (acc, group) => acc + (group.progress || 0),
    0
  );
  const averageProgress =
    totalGroups > 0 ? Math.round(totalProgress / totalGroups) : 0;
  const onTrackGroups = assignedGroups.filter(
    (g) => (g.progress || 0) >= 70
  ).length;
  const needsAttentionGroups = assignedGroups.filter(
    (g) => (g.progress || 0) < 50
  ).length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans">
        <div className="sticky top-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Guide Dashboard
            </h1>
          </div>
        </div>
        <div className="relative z-0 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <Loader2 size={48} className="text-purple-400 animate-spin" />
            <p className="text-xl font-semibold text-white">
              Loading Dashboard Data...
            </p>
            <p className="text-purple-200/70">
              Please wait while we fetch the latest information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans">
        <div className="sticky top-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Guide Dashboard
            </h1>
          </div>
        </div>
        <div className="relative z-0 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <XCircle size={48} className="text-red-400" />
            <h2 className="text-2xl font-bold text-white">
              Error Loading Dashboard
            </h2>
            <p className="text-purple-200/70 text-center">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000'%3E%3Cdefs%3E%3CradialGradient id='a' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='0.05'/%3E%3Cstop offset='100%25' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle fill='url(%23a)' cx='200' cy='200' r='100'/><circle fill='url(%23a)' cx='800' cy='300' r='150'/><circle fill='url(%23a)' cx='400' cy='700' r='120'/></circle></svg>')] opacity-30 animate-pulse"></div>

      {/* Header */}
      <div className="sticky top-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Guide Dashboard
                </h1>
                {/* @ts-ignore */}
                <p className="text-purple-200/80 mt-1 text-sm">
                  Welcome back, {user ? user.name : "Dr. Sarah Johnson"}! Ready
                  to inspire today?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="group bg-white/10 text-white p-3 rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
                title="Refresh Dashboard"
              >
                <Clock
                  size={20}
                  className={`group-hover:scale-110 transition-transform ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button className="group bg-white/10 text-white p-3 rounded-2xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
                  <Bell
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                  {/* Using recentAnnouncements.length here */}
                  {recentAnnouncements.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {recentAnnouncements.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  {/* @ts-ignore */}
                  <span className="hidden sm:block font-semibold">
                    {user ? user.name : "Dr. Sarah Johnson"}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden">
                    <div className="p-4">
                      <div className="mb-4 pb-4 border-b border-white/20">
                        {/* @ts-ignore */}
                        <p className="text-white font-semibold">
                          {user ? user.name : "Dr. Sarah Johnson"}
                        </p>
                        <p className="text-purple-200/70 text-sm">
                          Computer Science Guide
                        </p>
                      </div>
                      <Link
                        to="/guide/profile"
                        className="flex items-center gap-3 px-3 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
                      >
                        <User
                          size={18}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span>Profile</span>
                      </Link>
                      <hr className="border-white/20 my-3" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                      >
                        <LogOut
                          size={18}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`relative z-0 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8`}
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(stat.route)}
                className="group bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:border-purple-400/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200/70 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon size={32} className={stat.color} />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(action.route)}
                  className="group bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:border-purple-400/50 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-purple-200/70 text-sm leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Groups */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Users2 size={20} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Assigned Groups
                </h3>
              </div>
              <Link
                to="/guide/groups"
                className="group bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 text-purple-200 hover:text-white text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-6">
              {/* Conditional rendering for empty state */}
              {assignedGroups.length === 0 ? (
                <div className="text-center py-10 text-purple-200/70 border border-dashed border-white/20 rounded-2xl">
                  <AlertCircle
                    size={24}
                    className="mx-auto mb-3 text-purple-400"
                  />
                  <p>No assigned groups found.</p>
                  <p className="text-sm mt-1">
                    Please check your server connection or assignment status.
                  </p>
                </div>
              ) : (
                assignedGroups.map((group) => (
                  <div
                    key={group.id || group._id}
                    className="group bg-white/10 p-6 rounded-2xl border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/15"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-purple-200 transition-colors">
                          {group.groupName || group.name || "Unnamed Group"}
                        </h4>
                        <p className="text-purple-200/70 text-sm mt-1">
                          {group.projectTitle ||
                            group.project ||
                            "No project title"}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(
                          group.status || "In Progress"
                        )}`}
                      >
                        {group.status || "In Progress"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-purple-200/70 font-medium">
                        Progress:
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-white/10 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${group.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold">
                          {group.progress || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-purple-200/70" />
                        <span className="text-purple-200/70">
                          {group.members?.length || 0} members
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-purple-200/70" />
                        <span className="text-purple-200/70">
                          Next: {group.nextSeminar || "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Announcements & Seminars */}
          <div className="space-y-6">
            {/* Announcements */}
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Bell size={18} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Recent Announcements
                  </h3>
                </div>
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/20 text-purple-200 text-xs font-medium">
                  View All
                </span>
              </div>

              <div className="space-y-4">
                {/* Conditional rendering for empty state */}
                {recentAnnouncements.length === 0 ? (
                  <div className="text-center py-6 text-purple-200/70 border border-dashed border-white/20 rounded-2xl">
                    <AlertCircle
                      size={20}
                      className="mx-auto mb-2 text-purple-400"
                    />
                    <p className="text-sm">No recent announcements.</p>
                  </div>
                ) : (
                  recentAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id || announcement._id}
                      className="group bg-white/10 p-4 rounded-2xl border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/15"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                            (announcement.priority || "low") === "high"
                              ? "bg-gradient-to-r from-red-400 to-pink-400"
                              : (announcement.priority || "low") === "medium"
                              ? "bg-gradient-to-r from-orange-400 to-yellow-400"
                              : "bg-gradient-to-r from-green-400 to-emerald-400"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm group-hover:text-purple-200 transition-colors">
                            {announcement.title ||
                              announcement.subject ||
                              "Untitled Announcement"}
                          </h4>
                          <p className="text-purple-200/70 text-xs mt-2 leading-relaxed">
                            {announcement.content ||
                              announcement.message ||
                              "No content available"}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Calendar
                              size={12}
                              className="text-purple-200/50"
                            />
                            <p className="text-purple-200/50 text-xs">
                              {announcement.date ||
                                announcement.createdAt ||
                                "Unknown date"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Progress Overview */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <BarChart3 size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Project Progress Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center bg-white/10 p-6 rounded-3xl border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/15">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <TrendingUp size={36} className="text-white" />
              </div>
              <h4 className="text-white font-bold mb-3 text-lg">
                Average Progress
              </h4>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {averageProgress}%
              </p>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${averageProgress}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="group text-center bg-white/10 p-6 rounded-3xl border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:bg-white/15">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle size={36} className="text-white" />
              </div>
              <h4 className="text-white font-bold mb-3 text-lg">On Track</h4>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {onTrackGroups}
              </p>
              <p className="text-purple-200/70 text-sm mt-2">
                Groups performing well
              </p>
            </div>

            <div className="group text-center bg-white/10 p-6 rounded-3xl border border-white/20 hover:border-orange-400/50 transition-all duration-300 hover:bg-white/15">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <AlertCircle size={36} className="text-white" />
              </div>
              <h4 className="text-white font-bold mb-3 text-lg">
                Needs Attention
              </h4>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {needsAttentionGroups}
              </p>
              <p className="text-purple-200/70 text-sm mt-2">
                Requires guidance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
