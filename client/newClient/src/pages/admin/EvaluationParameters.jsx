import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, SlidersHorizontal, Trash2, Edit, X } from "lucide-react";
import { evaluationParameterAPI } from "../../services/api";

function EvaluationParameters() {
  const navigate = useNavigate();

  // State for parameters
  const [parameters, setParameters] = useState([]);

  // State for UI
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editParameter, setEditParameter] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch parameters on mount
  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const response = await evaluationParameterAPI.getAll();
      setParameters(response.data.data);
    } catch {
      setSuccessMessage("Failed to load evaluation parameters!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  // Open add/edit modal
  const openAddEditModal = (parameter = null) => {
    setEditParameter(
      parameter ? { ...parameter } : { name: "", description: "", marks: "" }
    );
    setShowAddEditModal(true);
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditParameter((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save parameter
  const handleSaveParameter = async () => {
    if (
      !editParameter.name ||
      !editParameter.description ||
      !editParameter.marks
    ) {
      setSuccessMessage("Please fill all required fields!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    if (isNaN(editParameter.marks) || editParameter.marks <= 0) {
      setSuccessMessage("Marks must be a positive number!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      if (editParameter._id) {
        // Edit existing parameter
        await evaluationParameterAPI.update(editParameter._id, {
          name: editParameter.name,
          description: editParameter.description,
          marks: parseInt(editParameter.marks),
        });
        setSuccessMessage(
          `Parameter "${editParameter.name}" updated successfully!`
        );
      } else {
        // Add new parameter
        await evaluationParameterAPI.create({
          name: editParameter.name,
          description: editParameter.description,
          marks: parseInt(editParameter.marks),
        });
        setSuccessMessage(
          `Parameter "${editParameter.name}" added successfully!`
        );
      }
      setShowAddEditModal(false);
      fetchParameters(); // Refresh list
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setSuccessMessage(
        error.response?.data?.message || "Failed to save parameter!"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Handle delete parameter
  const handleDeleteParameter = async () => {
    try {
      await evaluationParameterAPI.delete(selectedParameter._id);
      setParameters(parameters.filter((p) => p._id !== selectedParameter._id));
      setShowDeleteModal(false);
      setSuccessMessage(
        `Parameter "${selectedParameter.name}" deleted successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setSuccessMessage("Failed to delete parameter!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
          >
            <ChevronLeft size={20} className="mr-2 text-white" /> Back to
            Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg flex-grow text-center">
            Evaluation <span className="text-accent-teal">Parameters</span>
          </h1>
          <button
            onClick={() => openAddEditModal()}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
          >
            Add Parameter
          </button>
        </div>
      </div>

      {/* Separation Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto mt-6 px-4 sm:px-6">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-accent-teal font-semibold px-6 py-3 rounded-lg shadow-glow border border-white/30 z-50 animate-fade-in-down">
            {successMessage}
          </div>
        )}

        {/* Parameters List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {parameters.length > 0 ? (
            parameters.map((param, index) => (
              <div
                key={param._id}
                className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 flex flex-col justify-between animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div>
                  <div className="flex items-center text-xl font-bold text-white mb-2">
                    <SlidersHorizontal size={24} className="mr-3 text-white" />
                    <span>{param.name}</span>
                  </div>
                  <p className="text-lg text-white/90 mb-2">
                    {param.description}
                  </p>
                  <p className="text-lg text-accent-teal font-semibold">
                    Marks: {param.marks}
                  </p>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => openAddEditModal(param)}
                    className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
                  >
                    <Edit size={20} className="mr-2 text-white" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedParameter(param);
                      setShowDeleteModal(true);
                    }}
                    className="flex items-center bg-red-500/80 text-white py-2 px-4 sm:px-3 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
                  >
                    <Trash2 size={20} className="mr-2 text-white" /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/70 text-center col-span-full py-8">
              No evaluation parameters defined.
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit Parameter Modal */}
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
              {editParameter._id ? "Edit Parameter" : "Add Parameter"}
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Parameter Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={editParameter.name}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter parameter name"
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
                  value={editParameter.description}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter parameter description"
                  rows="4"
                />
              </div>
              <div>
                <label
                  htmlFor="marks"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Marks
                </label>
                <input
                  id="marks"
                  name="marks"
                  type="number"
                  value={editParameter.marks}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter marks"
                  min="1"
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
                onClick={handleSaveParameter}
                className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
              >
                {editParameter._id ? "Save Changes" : "Add Parameter"}
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
              Are you sure you want to delete the parameter{" "}
              <span className="font-semibold text-accent-teal">
                "{selectedParameter.name}"
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
                onClick={handleDeleteParameter}
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

export default EvaluationParameters;
