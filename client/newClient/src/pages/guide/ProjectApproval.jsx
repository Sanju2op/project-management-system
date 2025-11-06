// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Briefcase,
  Code,
  Edit,
  X,
  ChevronDown,
  MessageSquare,
  CheckCircle,
  FileText,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { guidePanelAPI } from "../../services/api";

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
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-white/10 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-white/20 shadow-glow border border-white/30 backdrop-blur-md w-40 appearance-none cursor-pointer"
      >
        <span>{selected || title}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          } text-white`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-12 left-0 w-48 bg-white/20 backdrop-blur-md rounded-lg shadow-glow border border-white/30 z-10 transition-all duration-200">
          <ul className="py-2">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-200 text-white ${
                  selected === option
                    ? "bg-teal-400/30 font-bold"
                    : "hover:bg-teal-400/30"
                }`}
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

function ProjectApproval() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for UI
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [projectToReject, setProjectToReject] = useState(null);

  // Filter options
  const statusOptions = ["All", "Pending", "Approved", "Rejected"];
  const techOptions = [
    "All",
    ...new Set(projects.map((project) => project.technology).filter(Boolean)),
  ];

  // Available technologies for editing
  const availableTechnologies = [
    "MERN Stack",
    "Flutter",
    "PHP / MySQL",
    "Python / ML",
    "React Native",
    "Node.js",
    "Java Spring",
    "Angular",
    "Vue.js",
    "Django",
    "Laravel",
    "Express.js",
  ];

  // Filter projects based on selected filters
  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === "All" || project.status === statusFilter;
    const matchesTech =
      techFilter === "All" || project.technology === techFilter;
    return matchesStatus && matchesTech;
  });
  // Load projects from backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await guidePanelAPI.getProjectApprovals();
        // Normalize to component's expected shape
        const normalized = (Array.isArray(data) ? data : []).map((p) => ({
          id: p.id,
          title: p.title || "",
          description: p.description || "",
          technology: p.technology || "",
          assignedGroup: p.assignedGroup || "",
          proposalPdf: p.proposalPdf || null,
          members: Array.isArray(p.members) ? p.members : [],
          // For this page's filters, reflect proposal approval state as status
          status: p.projectApprovalStatus || "Pending",
          rejectionReason: p.rejectionReason || "",
        }));
        setProjects(normalized);
      } catch (e) {
        setError(e?.message || "Failed to load project approvals");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle back navigation
  const handleBack = () => {
    navigate("/guide/dashboard");
  };

  // Handle view details
  const handleViewDetails = (project) => {
    setSelectedProject(project);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedProject(null);
  };

  // Open edit modal
  const openEditModal = (project) => {
    setEditProject({ ...project });
    setShowEditModal(true);
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditProject((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save project (guides can edit title, description, technology, and members)
  const handleSaveProject = async () => {
    if (
      !editProject.title ||
      !editProject.description ||
      !editProject.technology
    ) {
      setSuccessMessage("Please fill all required fields!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    // 1. Find the full project object to get the current members
    // Assuming 'projects' is an array of all group objects, including the 'members' array.
    const currentProject = projects.find((p) => p.id === editProject.id);

    // Fallback for getting members, assuming the editProject object now holds the members if the modal updates them.
    // We prioritize members from editProject as the modal might have changed them.
    const sourceOfMembers = editProject.members || currentProject?.members;

    if (!sourceOfMembers || !Array.isArray(sourceOfMembers)) {
      setSuccessMessage("Error: Could not retrieve current group members.");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    // 2. Extract only the IDs of the current members for the API payload
    // The API expects an array of IDs, not full objects.
    const currentMemberIds = sourceOfMembers.map(
      (member) => member.id || member._id || member
    ); // Handle student ID objects or plain strings

    // Safety Check: Ensure the number of members is 3-4 before sending the request
    if (currentMemberIds.length < 3 || currentMemberIds.length > 4) {
      setSuccessMessage(
        "Error: Group must have 3-4 members to update project details."
      );
      setTimeout(() => setSuccessMessage(""), 5000);
      return;
    }

    try {
      // 3. Send the API request with project details AND the required 'members' list
      await guidePanelAPI.updateGroupDetails(editProject.id, {
        projectTitle: editProject.title,
        projectDescription: editProject.description,
        technology: editProject.technology,
        // CRITICAL FIX: Include the 'members' field with all current student IDs
        members: currentMemberIds,
      });

      // 4. Update the local state ('projects' and 'selectedProject')
      setProjects(
        projects.map((p) =>
          p.id === editProject.id
            ? {
                ...p,
                title: editProject.title,
                description: editProject.description,
                technology: editProject.technology,
                // Also update members in the local state if they were edited
                members: sourceOfMembers,
              }
            : p
        )
      );

      setSelectedProject((prev) =>
        prev && prev.id === editProject.id
          ? {
              ...prev,
              title: editProject.title,
              description: editProject.description,
              technology: editProject.technology,
              // Also update members in the local state
              members: sourceOfMembers,
            }
          : prev
      );

      setSuccessMessage(`Project "${editProject.title}" updated successfully!`);
      setShowEditModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      const errorMessage =
        e?.response?.data?.message || e?.message || "Failed to update project";
      setSuccessMessage(errorMessage);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  // Handle provide feedback navigation
  const handleProvideFeedback = (project) => {
    navigate("/guide/feedback", { state: { project } });
  };

  // Handle approve project
  const handleApproveProject = async (project) => {
    try {
      await guidePanelAPI.approveProject(project.id);
      setProjects(
        projects.map((p) =>
          p.id === project.id
            ? { ...p, status: "Approved", rejectionReason: "" }
            : p
        )
      );
      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject({
          ...selectedProject,
          status: "Approved",
          rejectionReason: "",
        });
      }
      setSuccessMessage(`Project "${project.title}" has been approved!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      setSuccessMessage(e?.message || "Failed to approve project");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Handle reject project - open modal
  const handleRejectProject = (project) => {
    setProjectToReject(project);
    setShowRejectModal(true);
  };

  // Handle confirm reject
  const handleConfirmReject = async () => {
    if (!projectToReject) return;
    try {
      await guidePanelAPI.rejectProject(projectToReject.id, rejectionReason);
      setProjects(
        projects.map((p) =>
          p.id === projectToReject.id
            ? { ...p, status: "Rejected", rejectionReason }
            : p
        )
      );
      if (selectedProject && selectedProject.id === projectToReject.id) {
        setSelectedProject({
          ...selectedProject,
          status: "Rejected",
          rejectionReason,
        });
      }
      setSuccessMessage(
        `Project "${projectToReject.title}" has been rejected!`
      );
    } catch (e) {
      setSuccessMessage(e?.message || "Failed to reject project");
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowRejectModal(false);
      setRejectionReason("");
      setProjectToReject(null);
    }
  };

  // Render detailed view
  const renderDetailsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToList}
          className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
        >
          <ChevronLeft size={18} className="mr-2" /> Back to Projects
        </button>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
          {selectedProject.assignedGroup}
        </h1>
        <button
          onClick={() => handleProvideFeedback(selectedProject)}
          className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
        >
          <MessageSquare size={18} className="mr-2" /> Provide Feedback
        </button>
      </div>

      <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 space-y-6">
        <h2 className="text-2xl font-bold text-white">Project Details</h2>
        <div className="space-y-4 text-white/90">
          <div className="flex items-center">
            <Briefcase size={20} className="mr-3 text-white" />
            <p className="font-semibold">Title:</p>
            <span className="ml-2">{selectedProject.title}</span>
          </div>
          <div className="flex items-center">
            <Code size={20} className="mr-3 text-white" />
            <p className="font-semibold">Technology:</p>
            <span className="ml-2">{selectedProject.technology}</span>
          </div>
          <div className="flex items-center">
            <span className="text-white text-lg mr-3">📊</span>
            <p className="font-semibold">Status:</p>
            <span className="ml-2">{selectedProject.status}</span>
          </div>

          {selectedProject.status === "Rejected" &&
            selectedProject.rejectionReason && (
              <div>
                <p className="font-semibold mb-1">Rejection Reason:</p>
                <p className="text-lg bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                  {selectedProject.rejectionReason}
                </p>
              </div>
            )}

          <div>
            <p className="font-semibold mb-1">Description:</p>
            <p className="text-lg">{selectedProject.description}</p>
          </div>

          {selectedProject.proposalPdf && (
            <div>
              <p className="font-semibold mb-2">Project Proposal:</p>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    window.open(selectedProject.proposalPdf, "_blank")
                  }
                  className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
                >
                  <FileText size={18} className="mr-2" /> View PDF
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = selectedProject.proposalPdf;
                    link.download = `${selectedProject.title.replace(
                      /\s+/g,
                      "_"
                    )}_proposal.pdf`;
                    link.click();
                  }}
                  className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
                >
                  <Download size={18} className="mr-2" /> Download PDF
                </button>
              </div>
            </div>
          )}

          {selectedProject.members &&
            selectedProject.members.length >= 3 &&
            selectedProject.members.length <= 4 && (
              <div>
                <p className="font-semibold mb-2">Team Members:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white/10 p-3 rounded-lg border border-white/20"
                    >
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="text-sm text-white/70">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => handleRejectProject(selectedProject)}
            className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <X size={18} className="mr-2" /> Reject
          </button>
          <button
            onClick={() => handleApproveProject(selectedProject)}
            className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <CheckCircle size={18} className="mr-2" /> Approve
          </button>
          <button
            onClick={() => openEditModal(selectedProject)}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <Edit size={18} className="mr-2" /> Edit Project Details
          </button>
        </div>
      </div>
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-center">
        <FilterDropdown
          title="Status"
          options={statusOptions}
          selected={statusFilter}
          onSelect={setStatusFilter}
          className="w-40"
        />
        <FilterDropdown
          title="Technology"
          options={techOptions}
          selected={techFilter}
          onSelect={setTechFilter}
          className="w-40"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => handleViewDetails(project)}
              className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 flex flex-col justify-between cursor-pointer hover:scale-[1.03] transition-all duration-200"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div>
                <div className="flex items-center text-xl font-bold text-white mb-2">
                  <Briefcase size={24} className="mr-3 text-white" />
                  <span>{project.title}</span>
                </div>
                <div className="space-y-2 text-white/90">
                  <div className="flex items-center">
                    <Code size={20} className="mr-3 text-white" />
                    <p className="font-semibold">Technology:</p>
                    <span className="ml-2">{project.technology}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white text-lg mr-3">📊</span>
                    <p className="font-semibold">Status:</p>
                    <span className="ml-2">{project.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white/70 text-center col-span-full py-8">
            No projects found.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <ChevronLeft size={18} className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            Project <span className="text-teal-400">Approvals</span>
          </h1>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {loading && <p className="text-white/80 text-center">Loading...</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-teal-400 font-semibold px-6 py-3 rounded-lg shadow-glow border border-white/30 z-50 animate-fade-in-down">
            {successMessage}
          </div>
        )}

        {selectedProject ? renderDetailsView() : renderListView()}

        {/* Edit Project Modal (Limited for Guides) */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 w-full max-w-md relative">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-white hover:text-teal-400 transition duration-200"
              >
                <X size={24} className="text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Edit Project Details
              </h2>

              {/* Project Details Section - Read Only */}
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Project Details
                </h3>
                <div className="space-y-3 text-white/90">
                  <div className="flex items-center">
                    <Briefcase size={18} className="mr-3 text-white" />
                    <p className="font-semibold">Title:</p>
                    <span className="ml-2">{editProject.title}</span>
                  </div>
                  <div className="flex items-center">
                    <Code size={18} className="mr-3 text-white" />
                    <p className="font-semibold">Technology:</p>
                    <span className="ml-2">{editProject.technology}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white text-base mr-3">📊</span>
                    <p className="font-semibold">Status:</p>
                    <span className="ml-2">{editProject.status}</span>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">Description:</p>
                    <p className="text-sm bg-white/5 p-2 rounded">
                      {editProject.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-lg font-semibold text-white mb-2"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={editProject.title}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <label
                    htmlFor="technology"
                    className="block text-lg font-semibold text-white mb-2"
                  >
                    Technology
                  </label>
                  <select
                    id="technology"
                    name="technology"
                    value={editProject.technology}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
                  >
                    {availableTechnologies.map((tech) => (
                      <option
                        key={tech}
                        value={tech}
                        className="bg-gray-800 text-white"
                      >
                        {tech}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-lg font-semibold text-white mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editProject.description}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
                    placeholder="Enter project description"
                    rows="4"
                  />
                </div>
                <div className="text-sm text-white/70">
                  <p>Note: Status can only be modified by administrators.</p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex items-center bg-gray-600/80 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 border border-white/30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 border border-white/30"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 w-full max-w-md relative">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setProjectToReject(null);
                }}
                className="absolute top-4 right-4 text-white hover:text-teal-400 transition duration-200"
              >
                <X size={24} className="text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Reject Project
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="rejectionReason"
                    className="block text-lg font-semibold text-white mb-2"
                  >
                    Reason for Rejection
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
                    placeholder="Provide detailed reason for rejection..."
                    rows="4"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setProjectToReject(null);
                  }}
                  className="flex items-center bg-gray-600/80 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 border border-white/30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={!rejectionReason.trim()}
                  className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectApproval;
