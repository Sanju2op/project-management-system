/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Users,
  User,
  BookOpen,
  Smartphone,
  Code,
  Hash,
  Trash2,
  Edit,
  X,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Reusable Dropdown component for filters and student selection
const FilterDropdown = ({
  title,
  options,
  selected,
  onSelect,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-white/10 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-white/20 shadow-neumorphic border border-white/20 backdrop-blur-sm w-40 appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300b8d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.5rem center",
          backgroundSize: "1.5em",
        }}
        aria-label={`Select ${title}`}
      >
        <span>{selected || title}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          } text-accent-teal`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-12 left-0 w-48 bg-white/10 rounded-lg shadow-neumorphic border border-white/20 z-10 transition-all duration-200 backdrop-blur-sm animate-fade-in">
          <ul className="py-2">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                onKeyPress={(e) => e.key === "Enter" && handleSelect(option)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-200 text-white ${
                  selected === option
                    ? "bg-accent-teal font-bold"
                    : "hover:bg-accent-teal/50"
                }`}
                tabIndex={0}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function GroupManagement() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [guides, setGuides] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showChangeGuideModal, setShowChangeGuideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [forceAddEnabled, setForceAddEnabled] = useState(false);
  const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false);
  const [newGuide, setNewGuide] = useState("");
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("All");
  const [selectedYearFilter, setSelectedYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Token and API base URL
  const adminToken = localStorage.getItem("token");
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).replace(/\/admin$/, "");
  const headers = { Authorization: `Bearer ${adminToken}` };
  // Fetch all initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!adminToken) {
        setErrorMessage("No authentication token found. Please log in.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${adminToken}` };

        // Fetch guides (use active-guides; adapt if public /guides/active)
        const guidesResponse = await axios.get(
          `${API_BASE_URL}/admin/active-guides`,
          { headers }
        );
        setGuides(guidesResponse.data.data || guidesResponse.data || []);

        // Fetch groups with filters
        const groupsParams = {};

        // CLASS FILTER
        if (selectedClassFilter && selectedClassFilter !== "All") {
          const [course, semester] = selectedClassFilter.split(" ");
          groupsParams.course = course;
          groupsParams.semester = Number(semester);
        }

        // YEAR FILTER
        if (selectedYearFilter !== "All Years") {
          groupsParams.year = Number(selectedYearFilter);
        }

        const groupsResponse = await axios.get(
          `${API_BASE_URL}/admin/get-groups`,
          {
            headers,
            params: groupsParams,
          }
        );
        setGroups(groupsResponse.data.data || []);

        // Fetch divisions
        const divisionsResponse = await axios.get(
          `${API_BASE_URL}/admin/get-divisions`,
          { headers }
        );
        setDivisions(divisionsResponse.data.data || []);
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch data.";
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(""), 3000);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClassFilter, selectedYearFilter, adminToken, API_BASE_URL]);

  // Filter options
  const allClassNames = [
    "All",
    ...new Set(
      divisions.map((division) => `${division.course} ${division.semester}`)
    ),
  ];
  const allYears = [
    "All Years",
    ...new Set(divisions.map((division) => division.year.toString())),
  ]
    .sort()
    .reverse();

  // Get available students for a group
  const getAvailableStudents = async () => {
    if (!selectedGroup) return [];
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };

      const response = await axios.get(
        `${API_BASE_URL}/admin/groups/${selectedGroup._id}/students/available`,
        { headers }
      );

      return response.data.data || [];
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch available students.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error fetching available students:", error);
      return [];
    }
  };

  // Handlers
  const handleBack = () => {
    navigate("/admin/dashboard", { replace: true });
  };

  const handleViewDetails = async (group) => {
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const response = await axios.get(
        `${API_BASE_URL}/admin/get-group/${group._id}`,
        { headers }
      );
      setSelectedGroup(response.data.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch group details.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error fetching group details:", error);
    }
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddSelectedStudents = async () => {
    if (selectedStudents.length === 0) {
      setErrorMessage("Please select at least one student.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const totalAfterAdd =
      selectedGroup.members.length + selectedStudents.length;

    if (totalAfterAdd > 5 && !forceAddEnabled) {
      setErrorMessage(
        "Cannot add more than 4 students (enable override to add 5th)."
      );
      return;
    }
    if (totalAfterAdd > 5) {
      setErrorMessage("Cannot exceed 5 members total, even with override.");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      await axios.put(
        `${API_BASE_URL}/admin/update-group/${selectedGroup._id}`,
        { addStudentIds: selectedStudents },
        { headers }
      );

      // Refresh group data
      const response = await axios.get(
        `${API_BASE_URL}/admin/get-group/${selectedGroup._id}`,
        { headers }
      );
      setSelectedGroup(response.data.data);
      setShowAddStudentModal(false);
      setSelectedStudents([]);
      setForceAddEnabled(false); // reset override after success

      setSuccessMessage(
        `${selectedStudents.length} student(s) added successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add students.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error adding students:", error);
    }
  };

  const openChangeGuideModal = () => {
    setNewGuide(selectedGroup.guide?.name || "");
    setShowChangeGuideModal(true);
  };

  const handleSaveGuideChange = async () => {
    if (!newGuide) {
      setErrorMessage("Please select a guide.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      const adminToken = localStorage.getItem("token");
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const headers = { Authorization: `Bearer ${adminToken}` };

      // ✅ Find the selected guide object
      const selectedGuideObj = guides.find((guide) => guide.name === newGuide);

      if (!selectedGuideObj) {
        setErrorMessage("Selected guide not found.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      // ✅ Step 1: Fetch the current guide limit from backend
      const limitRes = await axios.get(`${API_BASE_URL}/get-guide-limit`, {
        headers,
      });
      const currentLimit = limitRes.data?.limit ?? 3; // fallback to 3 if not found
      console.log("🎯 Current Guide Limit:", currentLimit);

      // ✅ Step 2: Try updating the guide for the group
      const response = await axios.put(
        `${API_BASE_URL}/update-group-guide/${selectedGroup._id}`,
        { guideId: selectedGuideObj._id },
        { headers }
      );

      console.log("✅ Group updated successfully:", response.data);

      // ✅ Step 3: Refresh updated group details
      const groupResponse = await axios.get(
        `${API_BASE_URL}/get-group/${selectedGroup._id}`,
        { headers }
      );

      setSelectedGroup(groupResponse.data.data);
      setShowChangeGuideModal(false);
      setSuccessMessage(
        `Guide for ${selectedGroup.name} changed to ${newGuide}!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error updating group guide:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to change guide. Please try again.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 4000);
      setShowChangeGuideModal(false);
    }
  };
  const handleDeleteStudent = async () => {
    if (!studentToDelete?._id) {
      setErrorMessage("No student selected for deletion.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${adminToken}` };

      // Call backend to remove student
      await axios.put(
        `${API_BASE_URL}/admin/update-group/${selectedGroup._id}`,
        { removeStudentId: studentToDelete._id },
        { headers }
      );

      // Refresh group details
      const response = await axios.get(
        `${API_BASE_URL}/admin/get-group/${selectedGroup._id}`,
        { headers }
      );
      setSelectedGroup(response.data.data);
      setShowDeleteStudentModal(false);
      setSuccessMessage(
        `✅ Student ${studentToDelete.name} removed successfully from ${selectedGroup.name}`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove student.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error removing student:", error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      await axios.delete(
        `${API_BASE_URL}/admin/delete-group/${selectedGroup._id}`,
        { headers }
      );
      setGroups(groups.filter((group) => group._id !== selectedGroup._id));
      setSelectedGroup(null);
      setShowDeleteModal(false);
      setSuccessMessage(`Group "${selectedGroup.name}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete group.";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 3000);
      console.error("Error deleting group:", error);
    }
  };

  // Open Add Student Modal and fetch available students
  const handleOpenAddStudentModal = async () => {
    setShowAddStudentModal(true);
    setSelectedStudents([]);
    try {
      const students = await getAvailableStudents();
      setAvailableStudents(students);
    } catch (error) {
      // Handled in getAvailableStudents
    }
  };

  // Render details view (exact from designed page)
  const renderDetailsView = () => {
    const guideDetails = selectedGroup.guide || {};
    const hasMembers =
      selectedGroup.members && selectedGroup.members.length > 0;

    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToList}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
            aria-label="Back to groups list"
          >
            <ChevronLeft size={20} className="mr-2" /> Back to Groups
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center tracking-tight">
            {selectedGroup.name}
          </h1>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center bg-red-500/80 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
            aria-label="Delete group"
          >
            <Trash2 size={20} className="mr-2" /> Delete Group
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-light-glass backdrop-blur-sm p-6 rounded-xl shadow-neumorphic border border-white/30">
            <h2 className="text-2xl font-bold text-accent-teal mb-4">
              Project Details
            </h2>
            <div className="space-y-4 text-white/90">
              <div className="flex items-center">
                <BookOpen
                  size={20}
                  className="mr-3 text-accent-teal animate-icon-pulse"
                />
                <p className="font-semibold">Project Title:</p>
                <span className="ml-2">{selectedGroup.projectTitle}</span>
              </div>
              <div className="flex items-center">
                <Users
                  size={20}
                  className="mr-3 text-accent-teal animate-icon-pulse"
                />
                <p className="font-semibold">Course:</p>
                <span className="ml-2">
                  {selectedGroup.division?.course}{" "}
                  {selectedGroup.division?.semester}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-accent-teal text-lg mr-3">🗓️</span>
                <p className="font-semibold">Year:</p>
                <span className="ml-2">{selectedGroup.year}</span>
              </div>
              <div className="flex items-center">
                <Code
                  size={20}
                  className="mr-3 text-accent-teal animate-icon-pulse"
                />
                <p className="font-semibold">Technology:</p>
                <span className="ml-2">{selectedGroup.projectTechnology}</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Description:</p>
                <p className="text-sm">{selectedGroup.projectDescription}</p>
              </div>
            </div>
          </div>

          <div className="bg-light-glass backdrop-blur-sm p-6 rounded-xl shadow-neumorphic border border-white/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-accent-teal">
                Guide Details
              </h2>
              <button
                onClick={openChangeGuideModal}
                className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Change guide"
              >
                <Edit size={20} className="mr-2" /> Change Guide
              </button>
            </div>
            <div className="space-y-4 text-white/90">
              <div className="flex items-center">
                <User
                  size={20}
                  className="mr-3 text-accent-teal animate-icon-pulse"
                />
                <p className="font-semibold">Name:</p>
                <span className="ml-2">{guideDetails.name || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Code
                  size={20}
                  className="mr-3 text-accent-teal animate-icon-pulse"
                />
                <p className="font-semibold">Expertise:</p>
                <span className="ml-2">{guideDetails.expertise || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Smartphone
                  size={20}
                  className="mr-3 text-accent-teal animate-icon-pulse"
                />
                <p className="font-semibold">Mobile:</p>
                <span className="ml-2">{guideDetails.phone || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-light-glass backdrop-blur-sm p-6 rounded-xl shadow-neumorphic border border-white/30 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-accent-teal">
              Group Members
            </h2>
            <button
              onClick={handleOpenAddStudentModal}
              disabled={selectedGroup.members.length >= 5} // only disable at 5
              className={`flex items-center py-2 px-4 sm:px-3 rounded-lg font-semibold transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once ${
                selectedGroup.members.length < 5
                  ? "bg-gradient-to-r from-accent-teal to-cyan-500 text-white hover:bg-opacity-90 hover:scale-105"
                  : "bg-gray-600/80 text-white/70 cursor-not-allowed"
              }`}
              aria-label="Add student"
            >
              <Plus size={20} className="mr-2" />
              {selectedGroup.members.length >= 4
                ? "Add Student (Admin Override)"
                : "Add Student"}
            </button>
          </div>

          <div className="flex flex-col space-y-4">
            {selectedGroup.members.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/10 p-4 rounded-lg border border-white/20"
              >
                <div className="flex items-center">
                  <User
                    size={24}
                    className="text-accent-teal mr-4 animate-icon-pulse"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg text-white">
                      {member.name}
                    </span>
                    <div className="text-sm text-white/80">
                      {member.enrollment}
                    </div>

                    {/* ⭐ ADD THIS LINE ⭐ */}
                    <div className="text-xs text-white/60">
                      {selectedGroup.division?.course}{" "}
                      {selectedGroup.division?.semester}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStudentToDelete(member);
                    setShowDeleteStudentModal(true);
                  }}
                  className="flex items-center text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={20} className="mr-1" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Change Guide Modal (exact from design) */}
        {showChangeGuideModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-light-glass backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-sm relative transform transition-all duration-200 scale-100 hover:scale-102">
              <button
                onClick={() => setShowChangeGuideModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition duration-200"
                aria-label="Close modal"
              >
                <X size={24} className="animate-icon-pulse" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">
                Change Guide
              </h2>
              <label
                htmlFor="new-guide-select"
                className="block text-white text-sm font-semibold mb-2"
              >
                Select a new guide
              </label>
              <div className="relative">
                <select
                  id="new-guide-select"
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-200 shadow-neumorphic backdrop-blur-sm appearance-none cursor-pointer pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300b8d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em",
                  }}
                  value={newGuide}
                  onChange={(e) => setNewGuide(e.target.value)}
                >
                  <option value="">Select a guide</option>
                  {guides.map((guide) => (
                    <option key={guide._id} value={guide.name}>
                      {guide.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowChangeGuideModal(false)}
                  className="flex items-center bg-gray-600/80 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                  aria-label="Cancel changing guide"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGuideChange}
                  disabled={!newGuide}
                  className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Change guide"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal with Checkboxes (exact from design) */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-light-glass backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-md relative transform transition-all duration-200 scale-100 hover:scale-102 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">
                Add Students
              </h2>
              {/* ⚙️ Admin Override Toggle */}
              <div className="mt-5 flex justify-between items-center border-t border-white/20 pt-3">
                <p className="text-sm text-white/70">
                  Default limit:{" "}
                  <span className="font-semibold text-white">4 members</span>
                </p>
                <button
                  onClick={() => setForceAddEnabled((prev) => !prev)}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    forceAddEnabled
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white/20 hover:bg-white/30 text-white/80"
                  }`}
                >
                  {forceAddEnabled
                    ? "⚠️ Override Enabled"
                    : "Enable Admin Override"}
                </button>
              </div>

              <p className="text-white/80 text-center mb-6">
                Select students to add (Max: {4 - selectedGroup.members.length}{" "}
                more)
              </p>

              {selectedGroup.members.length === 4 && (
                <p className="text-sm text-yellow-400 mt-2">
                  ⚠️ 4 members reached use “Admin Override”to add one more.
                </p>
              )}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between bg-white/10 p-4 rounded-lg"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`student-${student._id}`}
                          checked={selectedStudents.includes(student._id)}
                          disabled={
                            !forceAddEnabled &&
                            selectedStudents.length >=
                              4 - selectedGroup.members.length &&
                            !selectedStudents.includes(student._id)
                          }
                          onChange={() => handleCheckboxChange(student._id)}
                          className="mr-4 w-4 h-4 text-accent-teal bg-white/10 border-white/20 rounded focus:ring-accent-teal focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div>
                          <span className="font-semibold text-white">
                            {student.name}
                          </span>
                          <div className="text-sm text-white/80">
                            {student.enrollmentNumber}
                          </div>
                          <div className="text-xs text-white/60">
                            {selectedGroup.division?.course}{" "}
                            {selectedGroup.division?.semester}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/70 text-center">
                    No eligible students available
                  </p>
                )}
              </div>
              {availableStudents.length > 0 && (
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="flex items-center bg-gray-600/80 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                    aria-label="Cancel adding students"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedStudents}
                    disabled={selectedStudents.length === 0}
                    className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Add selected students"
                  >
                    Add Selected Students
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Student Confirmation Modal (exact from design) */}
        {showDeleteStudentModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white/10 border border-white/20 p-6 rounded-lg text-white shadow-xl">
              <h3 className="text-lg font-semibold mb-4">
                Remove {studentToDelete?.name} from this group?
              </h3>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteStudentModal(false)}
                  className="px-4 py-2 rounded bg-gray-500/70 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Group Confirmation Modal (exact from design) */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-light-glass backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-sm relative transform transition-all duration-200 scale-100 hover:scale-102">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition duration-200"
                aria-label="Close modal"
              >
                <X size={24} className="animate-icon-pulse" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">
                Confirm Deletion
              </h2>
              <p className="text-white/80 text-center mb-6">
                Are you sure you want to delete the group{" "}
                <span className="font-semibold text-accent-teal">
                  "{selectedGroup.name}"
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex items-center bg-gray-600/80 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                  aria-label="Cancel deleting group"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="flex items-center bg-red-500/80 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                  aria-label="Delete group"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render list view (adapted from design with filters)
  const renderListView = () => {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
            aria-label="Back to dashboard"
          >
            <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center tracking-tight">
            Manage Groups
          </h1>
          <div className="w-[200px]"></div> {/* Spacer */}
        </div>

        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <FilterDropdown
            title="Class"
            options={allClassNames}
            selected={selectedClassFilter}
            onSelect={setSelectedClassFilter}
          />
          <FilterDropdown
            title="Years"
            options={allYears}
            selected={selectedYearFilter}
            onSelect={setSelectedYearFilter}
          />
        </div>

        {loading ? (
          <p className="text-white/70 text-center col-span-full py-8 text-lg">
            Loading groups...
          </p>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <div
                key={group._id}
                onClick={() => handleViewDetails(group)}
                className="bg-light-glass backdrop-blur-sm p-6 rounded-xl shadow-neumorphic border border-white/30 flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:bg-white/20 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
                aria-label={`View details for ${group.name}`}
              >
                <div>
                  <div className="flex items-center text-xl font-bold text-accent-teal mb-2">
                    <Users size={24} className="mr-3 animate-icon-pulse" />
                    <span className="text-white">{group.name}</span>
                  </div>
                  <div className="space-y-2 text-white/90">
                    <div className="flex items-center">
                      <BookOpen
                        size={20}
                        className="mr-3 text-accent-teal animate-icon-pulse"
                      />
                      <p className="font-semibold">Project Title:</p>
                      <span className="ml-2">{group.projectTitle}</span>
                    </div>
                    <div className="flex items-center">
                      <User
                        size={20}
                        className="mr-3 text-accent-teal animate-icon-pulse"
                      />
                      <p className="font-semibold">Guide:</p>
                      <span className="ml-2">{group.guide?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/70 text-center col-span-full py-8 text-lg">
            No groups found.
          </p>
        )}
      </div>
    );
  };

  // Main render (with styles from design)
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-teal-900 font-sans text-white">
      <style>
        {`
          @keyframes fade-in {
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
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
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
        `}
      </style>
      <div className="bg-particles" />
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent-teal to-cyan-500 text-white font-semibold px-6 py-3 rounded-lg shadow-neumorphic border border-white/20 backdrop-blur-sm z-50 animate-fade-in">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-500/80 text-white font-semibold px-6 py-3 rounded-lg shadow-neumorphic border border-white/20 backdrop-blur-sm z-50 animate-fade-in">
          {errorMessage}
        </div>
      )}

      {selectedGroup ? renderDetailsView() : renderListView()}
    </div>
  );
}

export default GroupManagement;
