import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Briefcase, Code, Users, Trash2, Edit, X, ChevronDown, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Reusable FilterDropdown component
const FilterDropdown = ({ title, options, selected, onSelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
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
        <ChevronDown size={20} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'} text-white`} />
      </button>
      {isOpen && (
        <div className="absolute top-12 left-0 w-48 bg-white/20 backdrop-blur-md rounded-lg shadow-glow border border-white/30 z-10 transition-all duration-200">
          <ul className="py-2">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-200 text-white ${
                  selected === option ? 'bg-accent-teal font-bold' : 'hover:bg-accent-teal/30'
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

  // Mock project data
  const [projects, setProjects] = useState([
    {
      id: 'p1',
      title: 'E-commerce Platform',
      description: 'A web-based platform for online shopping with secure payment gateways.',
      technology: 'MERN Stack',
      status: 'In Progress',
      assignedGroup: 'Alpha Team'
    },
    {
      id: 'p2',
      title: 'Real-time Chat App',
      description: 'A messaging app with fast and secure communication features.',
      technology: 'Flutter',
      status: 'In Progress',
      assignedGroup: 'Beta Squad'
    },
    {
      id: 'p3',
      title: 'Online Learning System',
      description: 'A platform for students to access courses and track progress.',
      technology: 'PHP / MySQL',
      status: 'Completed',
      assignedGroup: 'Project Phoenix'
    },
    {
      id: 'p4',
      title: 'AI Recommendation System',
      description: 'A system providing personalized recommendations based on user behavior.',
      technology: 'Python / ML',
      status: 'Not Started',
      assignedGroup: 'Quantum Coders'
    }
  ]);

  // Mock evaluation parameters
  const [evaluationParameters] = useState([
    { id: 'param1', name: 'Proposal Quality', description: 'Clarity and feasibility of the project proposal' },
    { id: 'param2', name: 'Code Quality', description: 'Cleanliness, efficiency, and documentation of code' },
    { id: 'param3', name: 'Presentation', description: 'Effectiveness of the project presentation' }
  ]);

  // Mock project evaluations
  const [projectEvaluations, setProjectEvaluations] = useState([
    { projectId: 'p1', parameterId: 'param1', isCompleted: true },
    { projectId: 'p1', parameterId: 'param2', isCompleted: false },
    { projectId: 'p1', parameterId: 'param3', isCompleted: false },
    { projectId: 'p2', parameterId: 'param1', isCompleted: false },
    { projectId: 'p2', parameterId: 'param2', isCompleted: false },
    { projectId: 'p2', parameterId: 'param3', isCompleted: false },
    { projectId: 'p3', parameterId: 'param1', isCompleted: true },
    { projectId: 'p3', parameterId: 'param2', isCompleted: true },
    { projectId: 'p3', parameterId: 'param3', isCompleted: true },
    { projectId: 'p4', parameterId: 'param1', isCompleted: false },
    { projectId: 'p4', parameterId: 'param2', isCompleted: false },
    { projectId: 'p4', parameterId: 'param3', isCompleted: false }
  ]);

  // State for UI
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');

  // Filter options
  const statusOptions = ['All', 'Not Started', 'In Progress', 'Completed'];
  const techOptions = ['All', ...new Set(projects.map(project => project.technology))];

  // Filter projects based on selected filters
  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesTech = techFilter === 'All' || project.technology === techFilter;
    return matchesStatus && matchesTech;
  });

  // Calculate progress based on completed evaluations
  const calculateProgress = (projectId) => {
    const projectEvals = projectEvaluations.filter(evaluation => evaluation.projectId === projectId);
    const completedCount = projectEvals.filter(evaluation => evaluation.isCompleted).length;
    return projectEvals.length > 0 ? Math.round((completedCount / projectEvals.length) * 100) : 0;
  };

  // Get evaluation icons for progress display
  const getEvaluationIcons = (projectId) => {
    const projectEvals = projectEvaluations.filter(evaluation => evaluation.projectId === projectId);
    const progress = calculateProgress(projectId);
    return (
      <div className="flex items-center gap-2">
        {evaluationParameters.map(param => {
          const isCompleted = projectEvals.find(e => e.parameterId === param.id)?.isCompleted || false;
          return (
            <CheckCircle
              key={param.id}
              size={20}
              className={isCompleted ? 'text-accent-teal' : 'text-white/50'}
              title={isCompleted ? `${param.name} completed` : `${param.name} not completed`}
            />
          );
        })}
        <span className="text-white/80 text-sm">({progress}%)</span>
      </div>
    );
  };

  // Handle evaluation toggle
  const handleEvaluationToggle = (projectId, parameterId) => {
    setProjectEvaluations(prev =>
      prev.map(evaluation =>
        evaluation.projectId === projectId && evaluation.parameterId === parameterId
          ? { ...evaluation, isCompleted: !evaluation.isCompleted }
          : evaluation
      )
    );
    setSuccessMessage('Evaluation updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Get completed parameters count for a project
  const getCompletedParametersCount = (projectId) => {
    const projectEvals = projectEvaluations.filter(evaluation => evaluation.projectId === projectId);
    const completedCount = projectEvals.filter(evaluation => evaluation.isCompleted).length;
    return `${completedCount}/${projectEvals.length}`;
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/home');
  };

  // Handle view details
  const handleViewDetails = (project) => {
    setSelectedProject(project);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedProject(null);
  };

  // Open edit modal (only for existing projects)
  const openAddEditModal = (project) => {
    setEditProject({ ...project });
    setShowAddEditModal(true);
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditProject(prev => ({ ...prev, [name]: value }));
  };

  // Handle save project (edit only)
  const handleSaveProject = () => {
    if (!editProject.title || !editProject.description || !editProject.technology) {
      setSuccessMessage('Please fill all required fields!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    // Edit existing project
    setProjects(projects.map(p => (p.id === editProject.id ? { ...editProject } : p)));
    setSelectedProject(editProject);
    setSuccessMessage(`Project "${editProject.title}" updated successfully!`);
    setShowAddEditModal(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle delete project
  const handleDeleteProject = () => {
    setProjects(projects.filter(p => p.id !== selectedProject.id));
    setProjectEvaluations(projectEvaluations.filter(evaluation => evaluation.projectId !== selectedProject.id));
    setSelectedProject(null);
    setShowDeleteModal(false);
    setSuccessMessage(`Project "${selectedProject.title}" deleted successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
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
          {selectedProject.assignedGroup}
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
          <div className="flex items-center">
            <span className="text-white text-lg mr-3">📈</span>
            <p className="font-semibold">Progress:</p>
            <div className="ml-2">
              {getEvaluationIcons(selectedProject.id)}
            </div>
          </div>
          {/* Removed the assigned group details as requested */}
          {/* <div>
            <Users size={20} className="mr-3 text-white" />
            <p className="font-semibold">Assigned Group:</p>
            <span className="ml-2">{selectedProject.assignedGroup || 'Unassigned'}</span>
          </div> */}
          <div>
            <p className="font-semibold mb-1">Description:</p>
            <p className="text-lg">{selectedProject.description}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <CheckCircle size={20} className="mr-3 text-white" /> Evaluations
          </h2>
          {evaluationParameters.length > 0 ? (
            <div className="space-y-4">
              {evaluationParameters.map(param => (
                <div key={param.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={projectEvaluations.find(
                        evaluation => evaluation.projectId === selectedProject.id && evaluation.parameterId === param.id
                      )?.isCompleted || false}
                      onChange={() => handleEvaluationToggle(selectedProject.id, param.id)}
                      className="h-5 w-5 text-accent-teal focus:ring-accent-teal border-white/20 bg-white/10 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-lg font-semibold text-white">{param.name}</p>
                      <p className="text-sm text-white/80">{param.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70">No evaluation parameters defined.</p>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => openAddEditModal(selectedProject)}
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
          <ChevronLeft size={20} className="mr-2 text-white" /> Back to Dashboard
        </button>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center">
          Manage <span className="text-accent-teal">Projects</span>
        </h1>
        <div className="w-24"></div> {/* Placeholder to balance layout */}
      </div>

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
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
              key={project.id}
              onClick={() => handleViewDetails(project)}
              className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 flex flex-col justify-between cursor-pointer hover:scale-[1.03] transition-all duration-200 animate-fade-in-up"
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
                  <div className="flex items-center">
                    <span className="text-white text-lg mr-3">📈</span>
                    <p className="font-semibold">Progress:</p>
                    <div className="ml-2">
                      {getEvaluationIcons(project.id)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={20} className="mr-3 text-white" />
                    <p className="font-semibold">Evaluations:</p>
                    <span className="ml-2">{getCompletedParametersCount(project.id)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white/70 text-center col-span-full py-8">No projects found.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 font-sans">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-accent-teal font-semibold px-6 py-3 rounded-lg shadow-glow border border-white/30 z-50 animate-fade-in-down">
          {successMessage}
        </div>
      )}

      {selectedProject ? renderDetailsView() : renderListView()}

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
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-lg font-semibold text-white mb-2">
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
                <label htmlFor="description" className="block text-lg font-semibold text-white mb-2">
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
                <label htmlFor="technology" className="block text-lg font-semibold text-white mb-2">
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
                <label htmlFor="status" className="block text-lg font-semibold text-white mb-2">
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
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em'
                  }}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status} className="text-white bg-gray-800">{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="assignedGroup" className="block text-lg font-semibold text-white mb-2">
                  Assigned Group
                </label>
                <input
                  id="assignedGroup"
                  name="assignedGroup"
                  type="text"
                  value={editProject.assignedGroup}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter group name (optional)"
                />
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
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Confirm Deletion</h2>
            <p className="text-white/90 text-center mb-6">
              Are you sure you want to delete the project <span className="font-semibold text-accent-teal">"{selectedProject.title}"</span>? This action cannot be undone.
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
