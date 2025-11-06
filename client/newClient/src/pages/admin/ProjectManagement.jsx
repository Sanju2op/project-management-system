import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Briefcase,
  Code,
  Users,
  Trash2,
  Edit,
  X,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  projectEvaluationAPI,
  evaluationParameterAPI,
  groupAPI,
} from "../../services/api";

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
                    ? "bg-accent-teal font-bold"
                    : "hover:bg-accent-teal/30"
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

function ProjectManagement() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [groups] = useState([]);
  const [projectEvaluations, setProjectEvaluations] = useState([]);
  const [localMarks, setLocalMarks] = useState({});

  // State for UI
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Filter options
  const statusOptions = ["All", "Not Started", "In Progress", "Completed"];
  const techOptions = [
    "All",
    ...new Set(
      projects.map((project) => project.projectTechnology || project.technology)
    ),
  ];
  const courseOptions = ["All", "MCA", "BCA", "B.Tech", "M.Tech"];
  const yearOptions = ["All", "2023", "2024", "2025"];

  // Fetch data on mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, paramsRes, evalsRes] = await Promise.all([
          groupAPI.getAll({
            course: courseFilter === "All" ? undefined : courseFilter,
            year: yearFilter === "All" ? undefined : yearFilter,
          }),
          evaluationParameterAPI.getAll(),
          projectEvaluationAPI.getAll(),
        ]);
        setProjects(groupsRes.data.data);
        setEvaluationParameters(paramsRes.data.data);
        setProjectEvaluations(evalsRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseFilter, yearFilter]);

  // Filter projects based on selected filters
  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === "All" || project.status === statusFilter;
    const matchesTech =
      techFilter === "All" ||
      (project.projectTechnology || project.technology) === techFilter;
    return matchesStatus && matchesTech;
  });

  // Calculate progress based on completed evaluations
  const calculateProgress = (projectId) => {
    const projectEvals = projectEvaluations.filter(
      (evaluation) => evaluation.projectId === projectId
    );
    const totalParams = evaluationParameters.length;
    const completedCount = projectEvals.filter(
      (evaluation) => evaluation.givenMarks !== null
    ).length;
    return totalParams > 0
      ? Math.round((completedCount / totalParams) * 100)
      : 0;
  };

  // Get evaluation icons for progress display
  const getEvaluationIcons = (projectId) => {
    const projectEvals = projectEvaluations.filter(
      (evaluation) => evaluation.projectId === projectId
    );
    const progress = calculateProgress(projectId);
    return (
      <div className="flex items-center gap-2">
        {evaluationParameters.map((param) => {
          const evaluation = projectEvals.find(
            (e) => e.parameterId._id === param._id
          );
          const isCompleted = evaluation && evaluation.givenMarks !== null;
          return (
            <CheckCircle
              key={param._id}
              size={20}
              className={isCompleted ? "text-accent-teal" : "text-white/50"}
              title={
                isCompleted
                  ? `${param.name} completed`
                  : `${param.name} not completed`
              }
            />
          );
        })}
        <span className="text-white/80 text-sm">({progress}%)</span>
      </div>
    );
  };

  // Handle evaluation update
  const handleEvaluationUpdate = async (projectId, parameterId, givenMarks) => {
    try {
      await projectEvaluationAPI.update(projectId, parameterId, {
        givenMarks: givenMarks === "" ? null : parseInt(givenMarks),
      });
      // Refetch evaluations for the project
      const res = await projectEvaluationAPI.getByProject(projectId);
      setProjectEvaluations((prev) =>
        prev.filter((e) => e.projectId !== projectId).concat(res.data)
      );
      setSuccessMessage("Evaluation updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating evaluation:", error);
    }
  };

  // Handle save all evaluations
  const handleSaveEvaluations = async () => {
    try {
      const updates = Object.entries(localMarks).map(async ([key, value]) => {
        if (value !== "") {
          const [projectId, parameterId] = key.split("_");
          await projectEvaluationAPI.update(projectId, parameterId, {
            givenMarks: parseInt(value),
          });
        }
      });
      await Promise.all(updates);
      // Refetch evaluations for the project
      const res = await projectEvaluationAPI.getByProject(selectedGroup._id);
      setProjectEvaluations((prev) =>
        prev.filter((e) => e.projectId !== selectedGroup._id).concat(res.data)
      );
      // Update localMarks with the saved values
      const marks = {};
      res.data.data.forEach((e) => {
        marks[`${selectedGroup._id}_${e.parameterId._id}`] = e.givenMarks || "";
      });
      setLocalMarks(marks);
      setSuccessMessage("All evaluations saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving evaluations:", error);
    }
  };

  // Get total marks for a project
  const getTotalMarks = (projectId) => {
    let totalGiven = 0;
    let totalPossible = 0;
    evaluationParameters.forEach((param) => {
      totalPossible += param.marks;
      const evaluation = projectEvaluations.find(
        (e) => e.projectId === projectId && e.parameterId._id === param._id
      );
      if (evaluation && evaluation.givenMarks !== null) {
        totalGiven += evaluation.givenMarks;
      }
    });
    return { given: totalGiven, total: totalPossible };
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  // Handle view details
  const handleViewDetails = async (group) => {
    setSelectedGroup(group);
    try {
      const res = await projectEvaluationAPI.getByProject(group._id);
      setProjectEvaluations((prev) =>
        prev.filter((e) => e.projectId !== group._id).concat(res.data)
      );
      // Initialize local marks
      const marks = {};
      res.data.data.forEach((e) => {
        marks[`${group._id}_${e.parameterId._id}`] = e.givenMarks || "";
      });
      setLocalMarks(marks);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  // Open edit modal (only for existing projects)
  const openAddEditModal = (project) => {
    setEditProject({
      ...project,
      title: project.projectTitle || project.title || "",
      description: project.projectDescription || project.description || "",
      technology: project.projectTechnology || project.technology || "",
    });
    setShowAddEditModal(true);
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditProject((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save project (edit only)
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
    try {
      const payload = {
        projectTitle: editProject.title,
        projectDescription: editProject.description,
        projectTechnology: editProject.technology,
        status: editProject.status,
      };
      await groupAPI.update(editProject._id, payload);
      setProjects(
        projects.map((p) =>
          p._id === editProject._id ? { ...p, ...payload } : p
        )
      );
      setSelectedGroup((prev) =>
        prev && prev._id === editProject._id ? { ...prev, ...payload } : prev
      );
      setSuccessMessage(`Project "${editProject.title}" updated successfully!`);
      setShowAddEditModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    try {
      await groupAPI.delete(selectedGroup._id);
      setProjects(projects.filter((p) => p._id !== selectedGroup._id));
      setSelectedGroup(null);
      setShowDeleteModal(false);
      setSuccessMessage(
        `Project "${
          selectedGroup.projectTitle || selectedGroup.title
        }" deleted successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Render detailed view
  const renderDetailsView = () => (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBackToList}
          className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
        >
          <ChevronLeft size={20} className="mr-2 text-white" /> Back to Projects
        </button>
        {/* Changed the main title to display the assigned group name */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center">
          {selectedGroup.groupId?.name || "Unassigned"}
        </h1>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center bg-red-500/80 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
        >
          <Trash2 size={20} className="mr-2 text-white" /> Delete Project
        </button>
      </div>

      <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30">
        <h2 className="text-2xl font-bold text-white mb-4">Project Details</h2>
        <div className="space-y-4 text-white/90">
          <div className="flex items-center">
            <Briefcase size={20} className="mr-3 text-white" />
            <p className="font-semibold">Title:</p>
            <span className="ml-2">
              {selectedGroup.projectTitle || selectedGroup.title}
            </span>
          </div>
          <div className="flex items-center">
            <Code size={20} className="mr-3 text-white" />
            <p className="font-semibold">Technology:</p>
            <span className="ml-2">
              {selectedGroup.projectTechnology || selectedGroup.technology}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-white text-lg mr-3">📊</span>
            <p className="font-semibold">Status:</p>
            <span className="ml-2">{selectedGroup.status}</span>
          </div>
          <div className="flex items-center">
            <span className="text-white text-lg mr-3">📈</span>
            <p className="font-semibold">Progress:</p>
            <div className="ml-2">{getEvaluationIcons(selectedGroup._id)}</div>
          </div>
          <div>
            <p className="font-semibold mb-1">Description:</p>
            <p className="text-lg">
              {selectedGroup.projectDescription || selectedGroup.description}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <CheckCircle size={20} className="mr-3 text-white" /> Evaluations
          </h2>
          {evaluationParameters.length > 0 ? (
            <div className="space-y-4">
              {evaluationParameters.map((param) => {
                const evaluation = projectEvaluations.find(
                  (e) =>
                    e.projectId === selectedGroup._id &&
                    e.parameterId._id === param._id
                );
                const key = `${selectedGroup._id}_${param._id}`;
                const localValue = localMarks[key] || "";
                return (
                  <div
                    key={param._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={param.marks}
                        value={localValue}
                        onChange={(e) =>
                          setLocalMarks((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder="Enter marks"
                        className="w-20 p-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                      />
                      <button
                        onClick={() => {
                          setLocalMarks((prev) => ({
                            ...prev,
                            [key]: "",
                          }));
                          handleEvaluationUpdate(
                            selectedGroup._id,
                            param._id,
                            ""
                          );
                        }}
                        className="text-red-400 hover:text-red-300 transition duration-200"
                        title="Clear marks"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex-1 ml-3">
                      <p className="text-lg font-semibold text-white">
                        {param.name}
                      </p>
                      <p className="text-sm text-white/80">
                        {param.description}
                      </p>
                      <p className="text-sm text-white/60">
                        Total Marks: {param.marks}
                      </p>
                      {evaluation && evaluation.evaluatedBy && (
                        <p className="text-sm text-white/50">
                          Evaluated by: {evaluation.evaluatedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/70">No evaluation parameters defined.</p>
          )}
          <div className="mt-4 text-white font-semibold">
            Total Marks: {getTotalMarks(selectedGroup._id).given} /{" "}
            {getTotalMarks(selectedGroup._id).total}
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleSaveEvaluations}
            className="flex items-center bg-green-500/80 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-green-600 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
          >
            <CheckCircle size={20} className="mr-2 text-white" /> Save
            Evaluations
          </button>
          <button
            onClick={() => openAddEditModal(selectedGroup)}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
          >
            <Edit size={20} className="mr-2 text-white" /> Edit Project
          </button>
        </div>
      </div>
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
        >
          <ChevronLeft size={20} className="mr-2 text-white" /> Back to
          Dashboard
        </button>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center">
          Manage <span className="text-accent-teal">Projects</span>
        </h1>
        <div className="w-24"></div> {/* Placeholder to balance layout */}
      </div>

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <FilterDropdown
          title="Course"
          options={courseOptions}
          selected={courseFilter}
          onSelect={setCourseFilter}
        />
        <FilterDropdown
          title="Year"
          options={yearOptions}
          selected={yearFilter}
          onSelect={setYearFilter}
        />
        <FilterDropdown
          title="Status"
          options={statusOptions}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
        <FilterDropdown
          title="Technology"
          options={techOptions}
          selected={techFilter}
          onSelect={setTechFilter}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <div
              key={project._id}
              onClick={() => handleViewDetails(project)}
              className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 flex flex-col justify-between cursor-pointer hover:scale-[1.03] transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div>
                <div className="flex items-center text-xl font-bold text-white mb-2">
                  <Briefcase size={24} className="mr-3 text-white" />
                  <span>{project.projectTitle || project.title}</span>
                </div>
                <div className="space-y-2 text-white/90">
                  <div className="flex items-center">
                    <Code size={20} className="mr-3 text-white" />
                    <p className="font-semibold">Technology:</p>
                    <span className="ml-2">
                      {project.projectTechnology || project.technology}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white text-lg mr-3">📊</span>
                    <p className="font-semibold">Status:</p>
                    <span className="ml-2">{project.status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white text-lg mr-3">📈</span>
                    <p className="font-semibold">Progress:</p>
                    <div className="ml-2">
                      {getEvaluationIcons(project._id)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={20} className="mr-3 text-white" />
                    <p className="font-semibold">Marks:</p>
                    <span className="ml-2">
                      {getTotalMarks(project._id).given}/
                      {getTotalMarks(project._id).total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white/70 text-center col-span-full py-8">
            No groups found.
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Remove duplicated broken JSX below; keep a single return tree
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 font-sans">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-accent-teal font-semibold px-6 py-3 rounded-lg shadow-glow border border-white/30 z-50 animate-fade-in-down">
          {successMessage}
        </div>
      )}

      {selectedGroup ? renderDetailsView() : renderListView()}

      {/* Edit Project Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/30 w-full max-w-md relative">
            <button
              onClick={() => setShowAddEditModal(false)}
              className="absolute top-4 right-4 text-white hover:text-accent-teal transition duration-200"
            >
              <X size={24} className="text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Edit Project
            </h2>
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
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter project title"
                />
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
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter project description"
                  rows="4"
                />
              </div>
              <div>
                <label
                  htmlFor="technology"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Technology
                </label>
                <input
                  id="technology"
                  name="technology"
                  type="text"
                  value={editProject.technology}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter technology"
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
                  name="status"
                  value={editProject.status}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300b8d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em",
                  }}
                >
                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                      className="text-white bg-gray-800"
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="groupId"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Assigned Group
                </label>
                <select
                  id="groupId"
                  name="groupId"
                  value={editProject.groupId?._id || editProject.groupId}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300b8d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em",
                  }}
                >
                  <option value="" className="text-white bg-gray-800">
                    Select Group
                  </option>
                  {groups.map((group) => (
                    <option
                      key={group._id}
                      value={group._id}
                      className="text-white bg-gray-800"
                    >
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddEditModal(false)}
                className="flex items-center bg-gray-600/80 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/30 w-full max-w-md relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-white hover:text-accent-teal transition duration-200"
            >
              <X size={24} className="text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Confirm Deletion
            </h2>
            <p className="text-white/90 text-center mb-6">
              Are you sure you want to delete the project{" "}
              <span className="font-semibold text-accent-teal">
                "{selectedGroup.title}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex items-center bg-gray-600/80 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex items-center bg-red-500/80 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;
