import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Users,
  Trash2,
  Plus,
  CheckCircle,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  List,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { divisionAPI, enrollmentAPI } from "../../services/api";

import generateStudentListPDF from "../../utils/pdf/generateStudentListPDF"; // <-- NEW

// Reusable FilterDropdown component
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
        className="flex items-center justify-between px-4 py-2 bg-white/10 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-white/20 shadow-neumorphic border border-white/20 backdrop-blur-sm w-44 hover:shadow-lg hover:scale-105"
        aria-label={`Select ${title}`}
      >
        <span>{selected || title}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          } text-accent-teal`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-12 left-0 w-48 bg-white/10 rounded-lg shadow-neumorphic border border-white/20 z-10 transition-all duration-300 backdrop-blur-sm animate-fade-in">
          <ul className="py-2">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                onKeyPress={(e) => e.key === "Enter" && handleSelect(option)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-300 text-white ${
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

function ManageDivisions() {
  const navigate = useNavigate();

  // State
  const [divisions, setDivisions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [showAddDivisionModal, setShowAddDivisionModal] = useState(false);
  const [showEnrollmentRangeModal, setShowEnrollmentRangeModal] =
    useState(false);
  const [showAddEnrollmentModal, setShowAddEnrollmentModal] = useState(false);
  const [showDeleteDivisionModal, setShowDeleteDivisionModal] = useState(false);
  const [showDeleteAllEnrollmentsModal, setShowDeleteAllEnrollmentsModal] =
    useState(false);
  const [newDivision, setNewDivision] = useState({
    course: "",
    semester: "",
    year: "",
    status: "Active",
  });
  const [enrollmentRange, setEnrollmentRange] = useState({ start: 1, end: 20 });
  const [newEnrollment, setNewEnrollment] = useState({
    divisionId: "",
    enrollmentNumber: "",
    name: "",
  });
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Fetch divisions on mount and when filters change
  useEffect(() => {
    const fetchDivisions = async () => {
      setLoading(true);
      try {
        const params = {
          course: courseFilter === "All" ? undefined : courseFilter,
          status:
            statusFilter === "All" ? undefined : statusFilter.toLowerCase(),
        };
        const response = await divisionAPI.getAll(params);
        setDivisions(response.data.data);
      } catch (error) {
        setMessage({
          text:
            "Failed to fetch divisions: " +
            (error.response?.data?.message || error.message),
          type: "error",
        });
        setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchDivisions();
  }, [courseFilter, statusFilter]);

  // Fetch all enrollments on mount
  useEffect(() => {
    const fetchAllEnrollments = async () => {
      setLoading(true);
      try {
        const response = await enrollmentAPI.getAll();
        setEnrollments(response.data.data);
      } catch (error) {
        setMessage({
          text:
            "Failed to fetch enrollments: " +
            (error.response?.data?.message || error.message),
          type: "error",
        });
        setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchAllEnrollments();
  }, []);

  // Filter options
  const courseOptions = [
    "All",
    ...new Set(divisions.map((division) => division.course)),
  ];
  const statusOptions = ["All", "active", "inactive"];

  // Filtered divisions
  const filteredDivisions = divisions.filter((division) => {
    const matchesCourse =
      courseFilter === "All" || division.course === courseFilter;
    const matchesStatus =
      statusFilter === "All" || division.status === statusFilter;
    return matchesCourse && matchesStatus;
  });

  // Get enrollments for a division
  // ManageDivisions.jsx: Around Line 181
  // Get enrollments for a division - FIXED for inconsistent data structure
  const getDivisionEnrollments = (divisionId) => {
    return enrollments.filter((enrollment) => {
      // 1. Check for nested structure (most common, e.g., from getAll)
      if (enrollment.division && enrollment.division._id) {
        return enrollment.division._id.toString() === divisionId;
      }
      // 2. Check for flat 'divisionId' property (e.g., from manual add or simplified object)
      if (enrollment.divisionId) {
        return enrollment.divisionId.toString() === divisionId;
      }
      // 3. Check if the 'division' field itself holds the string ID
      if (typeof enrollment.division === "string") {
        return enrollment.division === divisionId;
      }
      return false; // Ignore objects that are completely malformed
    });
  };

  // Registered count
  const getRegisteredCount = (divisionId) => {
    const divisionEnrollments = getDivisionEnrollments(divisionId);
    const registeredCount = divisionEnrollments.filter(
      (e) => e.isRegistered
    ).length;
    return `${registeredCount}/${divisionEnrollments.length}`;
  };

  // Toggle status
  const handleToggleStatus = async (division) => {
    try {
      const newStatus = division.status === "active" ? "inactive" : "active";

      const response = await divisionAPI.updateStatus(division._id, {
        status: newStatus,
      });

      setDivisions(
        divisions.map((d) => (d._id === division._id ? response.data.data : d))
      );

      setMessage({
        text: `Division ${division.course} Sem${division.semester} ${division.year} status updated to ${response.data.data.status}!`,
        type: "success",
      });

      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({
        text:
          "Failed to update status: " +
          (error.response?.data?.message || error.message),
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };

  // Add division
  const handleAddDivision = async () => {
    if (!newDivision.course || !newDivision.semester || !newDivision.year) {
      setMessage({ text: "Please fill all required fields!", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
      return;
    }
    if (!/^[A-Za-z]+$/.test(newDivision.course)) {
      setMessage({ text: "Course must contain only letters!", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
      return;
    }
    const semester = parseInt(newDivision.semester);
    const year = parseInt(newDivision.year);
    if (semester < 1 || semester > 8) {
      setMessage({ text: "Semester must be between 1 and 8!", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
      return;
    }
    if (year < 2000 || year > 2100) {
      setMessage({
        text: "Year must be between 2000 and 2100!",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
      return;
    }
    try {
      const payload = {
        course: newDivision.course,
        semester,
        year,
        status: newDivision.status,
      };
      const response = await divisionAPI.create(payload);
      setDivisions([...divisions, response.data]);
      setShowAddDivisionModal(false);
      setNewDivision({ course: "", semester: "", year: "", status: "Active" });
      setMessage({
        text: `Division ${newDivision.course} Sem${semester} ${year} added successfully!`,
        type: "success",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({
        text:
          "Failed to add division: " +
          (error.response?.data?.message || error.message),
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };

  // Generate enrollments
  const handleGenerateEnrollments = async () => {
    if (
      enrollmentRange.start < 1 ||
      enrollmentRange.end < enrollmentRange.start ||
      enrollmentRange.end > 999
    ) {
      setMessage({
        text: "Invalid range! Start must be >= 1, end must be > start and <= 999.",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
      return;
    }
    try {
      const payload = {
        divisionId: selectedDivision._id,
        start: enrollmentRange.start,
        end: enrollmentRange.end,
      };
      const response = await enrollmentAPI.generate(payload);
      const enrollmentsResponse = await enrollmentAPI.getByDivision(
        selectedDivision._id
      );
      setEnrollments(enrollmentsResponse.data.data);
      setShowEnrollmentRangeModal(false);
      setEnrollmentRange({ start: 1, end: 20 });
      setMessage({ text: response.data.message, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({
        text:
          "Failed to generate enrollments: " +
          (error.response?.data?.message || error.message),
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };
  // add enrollment
  const handleAddEnrollment = async () => {
    if (!newEnrollment.divisionId) {
      setMessage({
        text: "Division ID is missing. Cannot add enrollment.",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "error" }), 3000);
      return;
    }

    if (
      !newEnrollment.enrollmentNumber ||
      !/^\d{1,3}$/.test(newEnrollment.enrollmentNumber)
    ) {
      setMessage({
        text: "Please enter a valid 1-3 digit enrollment number!",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "error" }), 3000);
      return;
    }

    try {
      // Find the division object from your divisions list
      const division = divisions.find(
        (d) => d._id === newEnrollment.divisionId
      );
      if (!division) throw new Error("Division not found!");

      // Use dynamic values from the division object
      const courseName = division.course; // e.g., MSCIT
      const year = division.year; // e.g., 2025
      const semester = division.semester; // e.g., 3
      const number = newEnrollment.enrollmentNumber.padStart(3, "0");

      const fullEnrollmentNumber = `${courseName}${year}${semester}${number}`;

      const payload = {
        divisionId: newEnrollment.divisionId,
        enrollmentNumber: fullEnrollmentNumber,
        name: newEnrollment.name,
      };

      const response = await enrollmentAPI.create(payload);
      const newEnrollmentData = response.data.data;

      // Ensure data consistency
      newEnrollmentData.divisionId = newEnrollment.divisionId;
      newEnrollmentData.enrollmentNumber = fullEnrollmentNumber;

      setEnrollments([...enrollments, newEnrollmentData]);
      setShowAddEnrollmentModal(false);
      setNewEnrollment({ divisionId: "", enrollmentNumber: "", name: "" });

      setMessage({
        text: `Enrollment ${fullEnrollmentNumber} added successfully!`,
        type: "success",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({
        text:
          "Failed to add enrollment: " +
          (error.response?.data?.message || error.message),
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "error" }), 3000);
    }
  };

  // Delete enrollment
  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      await enrollmentAPI.delete(enrollmentId);
      setEnrollments(enrollments.filter((e) => e._id !== enrollmentId));
      setMessage({ text: `Enrollment deleted successfully!`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({
        text:
          "Failed to delete enrollment: " +
          (error.response?.data?.message || error.message),
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };

  // Delete all enrollments
  // ManageDivisions.jsx: Around Line 508
  // Delete all enrollments for a division - FIXED filter key and modal close
  const handleDeleteAllEnrollments = async () => {
    try {
      const response = await enrollmentAPI.deleteAllByDivision(
        selectedDivision._id
      );
      // 🚨 FIXED: Use the nested division._id structure for filtering (consistent with getDivisionEnrollments fix)
      setEnrollments(
        enrollments.filter((e) => e.division._id !== selectedDivision._id)
      );

      setShowDeleteAllEnrollmentsModal(false); // 🚨 FIXED: Ensure the modal closes

      setMessage({ text: response.data.message, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({
        text:
          "Failed to delete enrollments: " +
          (error.response?.data?.message || error.message),
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "error" }), 3000);
    }
  };

  // Delete division
  // ManageDivisions.jsx: Around Line 605
  // Delete division - FIXED enrollment filter key
  const handleDeleteDivision = async () => {
    try {
      await divisionAPI.delete(selectedDivision._id);
      setDivisions(divisions.filter((d) => d._id !== selectedDivision._id));

      // 🚨 FIXED: Use the nested division._id structure for filtering enrollments
      setEnrollments(
        enrollments.filter((e) => e.division._id !== selectedDivision._id)
      );

      setSelectedDivision(null);
      setShowDeleteDivisionModal(false);
      setMessage({
        text: `Division ${selectedDivision.course} Sem${selectedDivision.semester} ${selectedDivision.year} deleted successfully!`,
        type: "success",
      });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({
        text:
          "Failed to delete division: " +
          (error.response?.data?.message || error.message),
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "error" }), 3000);
    }
  };

  // Detailed view
  const renderDetailsView = () => {
    const divisionEnrollments = getDivisionEnrollments(selectedDivision._id);
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setSelectedDivision(null)}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
            aria-label="Back to divisions list"
          >
            <ChevronLeft size={20} className="mr-2" /> Back to Divisions
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center tracking-tight">
            {selectedDivision.course} Sem{selectedDivision.semester}{" "}
            {selectedDivision.year}
          </h1>
          <button
            onClick={() => setShowDeleteDivisionModal(true)}
            className="flex items-center bg-red-500/80 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
            aria-label="Delete division"
          >
            <Trash2 size={20} className="mr-2" /> Delete Division
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-neumorphic border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-accent-teal tracking-tight">
              Enrollment List
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setNewEnrollment({
                    divisionId: selectedDivision._id,
                    enrollmentNumber: "",
                  });
                  setShowAddEnrollmentModal(true);
                }}
                className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Add new enrollment"
              >
                <Plus size={20} className="mr-2" /> Add Enrollment
              </button>
              <button
                onClick={() => setShowDeleteAllEnrollmentsModal(true)}
                className="flex items-center bg-red-500/80 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Delete all enrollments"
              >
                <Trash2 size={20} className="mr-2" /> Delete All
              </button>
              <button
                onClick={() => {
                  const enrollments = getDivisionEnrollments(
                    selectedDivision._id
                  );
                  generateStudentListPDF(selectedDivision, enrollments);
                }}
                className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Generate PDF"
              >
                <FileText size={20} className="mr-2" /> Generate PDF
              </button>
            </div>
          </div>
          <p className="text-white/80 mb-6 font-semibold">
            Registered Students: {getRegisteredCount(selectedDivision._id)}
          </p>
          {loading ? (
            <p className="text-white/70 text-center py-12 text-lg">
              Loading enrollments...
            </p>
          ) : divisionEnrollments.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              <p className="text-lg">
                No enrollments found. Generate enrollment numbers to start.
              </p>
              <button
                onClick={() => setShowEnrollmentRangeModal(true)}
                className="mt-4 bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Generate enrollments"
              >
                Generate Enrollments
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {divisionEnrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className={`p-4 rounded-lg border border-white/20 flex items-center justify-between ${
                    enrollment.isRegistered
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-red-500/20 hover:bg-red-500/30"
                  } transition-all duration-300 shadow-sm hover:shadow-md`}
                >
                  <div className="flex items-center">
                    <Users
                      size={28}
                      className="text-accent-teal mr-4 animate-icon-pulse"
                    />
                    <div>
                      <p className="font-semibold text-white text-lg">
                        {enrollment.enrollmentNumber}
                      </p>
                      <p className="text-sm text-white/80">
                        {enrollment.isRegistered
                          ? `Registered: ${enrollment.name || "N/A"}`
                          : "Not Registered"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEnrollment(enrollment._id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-300"
                    aria-label={`Delete enrollment ${enrollment.enrollmentNumber}`}
                  >
                    <Trash2 size={24} className="animate-icon-pulse" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // List view
  const renderListView = () => (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center tracking-tight">
          Manage Divisions
        </h1>
        <button
          onClick={() => setShowAddDivisionModal(true)}
          className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
          aria-label="Add new division"
        >
          <Plus size={20} className="mr-2" /> Add Division
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <FilterDropdown
          title="Course"
          options={courseOptions}
          selected={courseFilter}
          onSelect={setCourseFilter}
        />
        <FilterDropdown
          title="Status"
          options={statusOptions}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>
      {loading ? (
        <p className="text-white/70 text-center py-12 text-lg">
          Loading divisions...
        </p>
      ) : filteredDivisions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDivisions.map((division, index) => (
            <div
              key={division._id}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-neumorphic border border-white/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:bg-white/15 animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-xl font-bold text-white">
                  <Users
                    size={28}
                    className="text-accent-teal mr-3 animate-icon-pulse"
                  />
                  <span>
                    {division.course} Sem{division.semester} {division.year}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(division)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    division.status === "active"
                      ? "bg-gradient-to-r from-accent-teal to-cyan-400"
                      : "bg-gray-600/80"
                  } text-white hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md`}
                  title={
                    division.status === "active"
                      ? "Set to Inactive"
                      : "Set to Active"
                  }
                  aria-label={`Toggle status for ${division.course} Sem${division.semester} ${division.year}`}
                >
                  {division.status === "active" ? (
                    <Eye size={24} />
                  ) : (
                    <EyeOff size={24} />
                  )}
                </button>
              </div>
              <div className="space-y-3 text-white/90">
                <div className="flex items-center">
                  <CheckCircle
                    size={24}
                    className="mr-3 text-accent-teal animate-icon-pulse"
                  />
                  <p className="font-semibold">Status:</p>
                  <span className="ml-2">{division.status}</span>
                </div>
                <div className="flex items-center">
                  <Users
                    size={24}
                    className="mr-3 text-accent-teal animate-icon-pulse"
                  />
                  <p className="font-semibold">Registered:</p>
                  <span className="ml-2">
                    {getRegisteredCount(division._id)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDivision(division)}
                  className="flex items-center w-full bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm mt-4 animate-pulse-once"
                  aria-label={`View enrollments for ${division.course} Sem${division.semester} ${division.year}`}
                >
                  <List size={20} className="mr-2" /> View Enrollments
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/70 text-center col-span-full py-12 text-lg">
          No divisions found.
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-teal-900 font-sans relative overflow-hidden">
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
      {message.text && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 ${
            message.type === "success"
              ? "bg-gradient-to-r from-accent-teal to-cyan-400"
              : "bg-red-500/80"
          } text-white font-semibold px-6 py-3 rounded-lg shadow-neumorphic border border-white/20 backdrop-blur-sm z-50 animate-fade-in`}
        >
          {message.text}
        </div>
      )}
      {selectedDivision ? renderDetailsView() : renderListView()}
      {/* Add Division Modal */}
      {showAddDivisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-md relative transform transition-all duration-300 scale-100 hover:scale-102">
            <button
              onClick={() => setShowAddDivisionModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition duration-300"
              aria-label="Close modal"
            >
              <X size={24} className="animate-icon-pulse" />
            </button>
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">
              Add Division
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="course"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Course
                </label>
                <input
                  id="course"
                  type="text"
                  value={newDivision.course}
                  onChange={(e) =>
                    setNewDivision({ ...newDivision, course: e.target.value })
                  }
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., BCA, MCA"
                />
              </div>
              <div>
                <label
                  htmlFor="semester"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Semester
                </label>
                <input
                  id="semester"
                  type="number"
                  value={newDivision.semester}
                  onChange={(e) =>
                    setNewDivision({ ...newDivision, semester: e.target.value })
                  }
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., 1"
                  min="1"
                  max="8"
                />
              </div>
              <div>
                <label
                  htmlFor="year"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Year
                </label>
                <input
                  id="year"
                  type="number"
                  value={newDivision.year}
                  onChange={(e) =>
                    setNewDivision({ ...newDivision, year: e.target.value })
                  }
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., 2025"
                  min="2000"
                  max="2100"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={newDivision.status}
                  onChange={(e) =>
                    setNewDivision({ ...newDivision, status: e.target.value })
                  }
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300 hover:shadow-md appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300b8d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em",
                  }}
                >
                  <option value="Active" className="text-white bg-gray-800">
                    Active
                  </option>
                  <option value="Inactive" className="text-white bg-gray-800">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowAddDivisionModal(false)}
                className="flex items-center bg-gray-600/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Cancel adding division"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDivision}
                className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Add division"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Enrollment Range Modal */}
      {showEnrollmentRangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-md relative transform transition-all duration-300 scale-100 hover:scale-102">
            <button
              onClick={() => setShowEnrollmentRangeModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition duration-300"
              aria-label="Close modal"
            >
              <X size={24} className="animate-icon-pulse" />
            </button>
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">
              Generate Enrollments
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="start"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Start Range
                </label>
                <input
                  id="start"
                  type="number"
                  value={enrollmentRange.start}
                  onChange={(e) =>
                    setEnrollmentRange({
                      ...enrollmentRange,
                      start: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., 1"
                  min="1"
                />
              </div>
              <div>
                <label
                  htmlFor="end"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  End Range
                </label>
                <input
                  id="end"
                  type="number"
                  value={enrollmentRange.end}
                  onChange={(e) =>
                    setEnrollmentRange({
                      ...enrollmentRange,
                      end: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., 78"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowEnrollmentRangeModal(false)}
                className="flex items-center bg-gray-600/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Cancel generating enrollments"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateEnrollments}
                className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Generate enrollments"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Enrollment Modal */}
      {showAddEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-md relative transform transition-all duration-300 scale-100 hover:scale-102">
            <button
              onClick={() => setShowAddEnrollmentModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition duration-300"
              aria-label="Close modal"
            >
              <X size={24} className="animate-icon-pulse" />
            </button>
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">
              Add Enrollment
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="enrollmentNumber"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Enrollment Number
                </label>
                <input
                  id="enrollmentNumber"
                  type="text"
                  value={newEnrollment.enrollmentNumber}
                  onChange={(e) =>
                    setNewEnrollment({
                      ...newEnrollment,
                      enrollmentNumber: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., 001 to 999"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowAddEnrollmentModal(false)}
                className="flex items-center bg-gray-600/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Cancel adding enrollment"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEnrollment}
                className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Add enrollment"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Division Modal */}
      {showDeleteDivisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-md relative transform transition-all duration-300 scale-100 hover:scale-102">
            <button
              onClick={() => setShowDeleteDivisionModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition duration-300"
              aria-label="Close modal"
            >
              <X size={24} className="animate-icon-pulse" />
            </button>
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">
              Confirm Deletion
            </h2>
            <p className="text-white/80 text-center mb-6 text-lg">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-accent-teal">
                {selectedDivision.course} Sem{selectedDivision.semester}{" "}
                {selectedDivision.year}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setShowDeleteDivisionModal(false)}
                className="flex items-center bg-gray-600/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Cancel deleting division"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDivision}
                className="flex items-center bg-red-500/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Confirm delete division"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete All Enrollments Modal */}
      {showDeleteAllEnrollmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-neumorphic border border-white/20 w-full max-w-md relative transform transition-all duration-300 scale-100 hover:scale-102">
            <button
              onClick={() => setShowDeleteAllEnrollmentsModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition duration-300"
              aria-label="Close modal"
            >
              <X size={24} className="animate-icon-pulse" />
            </button>
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">
              Confirm Deletion
            </h2>
            <p className="text-white/80 text-center mb-6 text-lg">
              Are you sure you want to delete all enrollments for{" "}
              <span className="font-semibold text-accent-teal">
                {selectedDivision.course} Sem{selectedDivision.semester}{" "}
                {selectedDivision.year}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setShowDeleteAllEnrollmentsModal(false)}
                className="flex items-center bg-gray-600/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Cancel deleting all enrollments"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllEnrollments}
                className="flex items-center bg-red-500/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition-all duration-300 shadow-neumorphic border border-white/20 backdrop-blur-sm animate-pulse-once"
                aria-label="Confirm delete all enrollments"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDivisions;
