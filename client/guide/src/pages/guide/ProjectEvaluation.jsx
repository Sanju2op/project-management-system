// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Edit3,
} from "lucide-react";
import { guidePanelAPI } from "../../services/api";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultToastOptions = { position: "top-right", theme: "dark" };

// --- NEW HELPER FUNCTIONS FOR CONSISTENT ID HANDLING ---
const getStudentId = (member) => member?._id || member?.id;
const getCriteriaId = (criteria) => criteria?._id || criteria?.id;
const createEvaluationKey = (student, criteria) =>
  `${getStudentId(student)}_${getCriteriaId(criteria)}`;
// --------------------------------------------------------

export default function ProjectEvaluation() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evaluationForm, setEvaluationForm] = useState({});
  const [evaluationCriteria, setEvaluationCriteria] = useState([]);

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectData = await guidePanelAPI.getProjects();
        setProjects(projectData || []);
      } catch (err) {
        console.error("Error loading projects:", err);
        setError("Failed to load projects data");
        // Fallback to empty array if API fails
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Load evaluation criteria on component mount
  useEffect(() => {
    const loadEvaluationCriteria = async () => {
      try {
        const response = await guidePanelAPI.getEvaluationParameters();
        setEvaluationCriteria(response || []);
      } catch (error) {
        console.error("Failed to load evaluation parameters:", error);
      }
    };
    loadEvaluationCriteria();
  }, []);

  const submitEvaluation = async () => {
    if (!selectedProject) {
      toast.warning("Select a project first!", defaultToastOptions);
      return;
    }

    const groupId = selectedProject._id || selectedProject.id;
    if (!groupId) {
      toast.error("Invalid project ID", defaultToastOptions);
      return;
    }

    const evaluations = [];

    // UPDATED: Use helper functions for consistent IDs
    selectedProject.members.forEach((member) => {
      const studentId = getStudentId(member);
      if (!studentId) return;

      evaluationCriteria.forEach((param) => {
        const paramId = getCriteriaId(param);
        if (!paramId) return;

        const key = createEvaluationKey(member, param); // Consistent Key
        const marks = Number(evaluationForm[key] || 0);
        evaluations.push({ student: studentId, parameter: paramId, marks });
      });
    });

    if (!evaluations.length) {
      toast.warning("No evaluation data to save", defaultToastOptions);
      return;
    }

    try {
      await guidePanelAPI.saveEvaluation(groupId, evaluations);
      toast.success("Evaluation saved successfully!", defaultToastOptions);
    } catch (err) {
      console.error("❌ Error submitting evaluation:", err);
      toast.error("Failed to save evaluation", defaultToastOptions);
    }
  };
  const downloadDocument = (documentName) => {
    alert(`Downloading ${documentName}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/30 text-green-300";
      case "Under Review":
        return "bg-orange-500/30 text-orange-300";
      case "Pending Evaluation":
        return "bg-blue-500/30 text-blue-300";
      default:
        return "bg-gray-500/30 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <ToastContainer {...defaultToastOptions} />
      {/* Header */}
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/guide/dashboard")}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <ChevronLeft size={18} className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            Project <span className="text-teal-400">Evaluation</span>
          </h1>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Project List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-glow">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FileText size={24} className="text-teal-400 mr-3" />
                Projects to Evaluate
              </h2>

              <div className="space-y-3">
                {projects.map((project) => (
                  // ... (inside the project list map)
                  <div
                    key={project._id || project.id}
                    onClick={async () => {
                      // 🧩 Normalize members (ensures _id + name always exist)
                      const normalizedMembers = project.members.map((m) =>
                        typeof m === "object"
                          ? { _id: m._id || m.id, name: m.name }
                          : { _id: m, name: m }
                      );

                      setSelectedProject({
                        ...project,
                        members: normalizedMembers,
                      });

                      try {
                        // 🔍 Fetch evaluation data for this group/project
                        const res = await guidePanelAPI.getEvaluationByGroup(
                          project._id || project.id
                        );

                        // ✅ Safely handle both API response shapes
                        const evaluationsData =
                          res?.data?.data?.evaluations ||
                          res?.evaluations ||
                          [];

                        console.log("📦 Evaluations fetched:", evaluationsData);

                        if (
                          !Array.isArray(evaluationsData) ||
                          evaluationsData.length === 0
                        ) {
                          toast.info(
                            "No previous evaluations found",
                            defaultToastOptions
                          );
                          setEvaluationForm({});
                          return;
                        }

                        // 🧠 CRITICAL FIX: Map API response into your formState
                        const formState = {};

                        // Loop over the top-level array (which contains one object per student)
                        evaluationsData.forEach((studentEvaluation) => {
                          // 1. Get the ID for the student
                          // The studentId field is likely a populated object, so we check studentId._id first.
                          // If the field is just the string ID, we use it directly.
                          const studentId =
                            studentEvaluation.studentId?._id ||
                            studentEvaluation.studentId;

                          if (!studentId) {
                            console.warn(
                              "Skipping evaluation due to missing Student ID",
                              studentEvaluation
                            );
                            return;
                          }

                          // 2. Loop over the nested evaluations array
                          const evaluationItems =
                            studentEvaluation.evaluations || [];
                          if (Array.isArray(evaluationItems)) {
                            evaluationItems.forEach((evaluationItem) => {
                              // 3. Get the ID for the parameter (criteria)
                              // The parameterId field is likely a populated object.
                              const paramId =
                                evaluationItem.parameterId?._id ||
                                evaluationItem.parameterId;

                              if (!paramId) {
                                console.warn(
                                  "Skipping evaluation item due to missing Parameter ID",
                                  evaluationItem
                                );
                                return;
                              }

                              // 4. Construct the consistent key (e.g., "stdID_paramID")
                              const key = `${studentId}_${paramId}`;

                              // 5. Store the marks, ensuring an empty string if marks is null/undefined
                              formState[key] = evaluationItem.marks ?? "";
                            });
                          }
                        });

                        console.log("✅ Final formState:", formState);
                        setEvaluationForm(formState);

                        toast.success(
                          "Previous evaluations loaded",
                          defaultToastOptions
                        );
                      } catch (err) {
                        console.error("❌ Error fetching evaluations:", err);
                        toast.error(
                          "Failed to load evaluations",
                          defaultToastOptions
                        );
                      }
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                      selectedProject?._id === (project._id || project.id)
                        ? "border-teal-400 bg-teal-500/20"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">
                        {project.groupName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="text-white/80 text-sm mb-2">
                      {project.projectTitle}
                    </p>
                    <p className="text-white/60 text-xs mb-2">
                      {project.technology}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">
                        Submitted: {project.submittedDate}
                      </span>
                      <span className="text-white/50">{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Evaluation Form */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-glow">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedProject.projectTitle}
                    </h2>
                    <p className="text-white/70">
                      Group: {selectedProject.groupName}
                    </p>
                    <p className="text-white/70">
                      Technology: {selectedProject.technology}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-white/60 text-sm">
                      Submitted: {selectedProject.submittedDate}
                    </p>
                    <p className="text-white/60 text-sm">
                      Last Evaluation: {selectedProject.lastEvaluation}
                    </p>
                  </div>
                </div>

                {/* Project Documents */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Project Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.documents.map((doc, index) => (
                      <div
                        key={`${doc}-${index}`}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-teal-400" />
                          <span className="text-white/80 text-sm">{doc}</span>
                        </div>
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="p-1 bg-white/10 text-white rounded hover:bg-white/20 transition"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Members */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Group Members
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.members.map((member, index) => (
                      <span
                        key={`${member._id || index}`}
                        className="px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20"
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Evaluation Criteria
                  </h3>
                  <div className="space-y-6">
                    {evaluationCriteria.map((criteria) => (
                      <div
                        key={criteria._id || criteria.id}
                        className="bg-white/10 p-4 rounded-2xl"
                      >
                        <h4 className="text-white font-semibold mb-3">
                          {criteria.name} (Max: {criteria.marks})
                        </h4>

                        {selectedProject.members.map((member) => (
                          <div
                            key={createEvaluationKey(member, criteria)}
                            className="flex justify-between items-center mb-2"
                          >
                            <span className="text-white/80">
                              {member.name || member}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={criteria.marks}
                              // UPDATED: Use helper function for value lookup
                              value={
                                evaluationForm[
                                  createEvaluationKey(member, criteria)
                                ] ?? ""
                              }
                              // UPDATED: Use helper function for onChange key setting
                              onChange={(e) =>
                                setEvaluationForm((prev) => ({
                                  ...prev,
                                  [createEvaluationKey(member, criteria)]:
                                    e.target.value,
                                }))
                              }
                              className="w-20 text-center rounded-md bg-white/20 text-white border border-white/30"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={submitEvaluation}
                    className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition flex-1"
                  >
                    Submit Evaluation
                  </button>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="bg-white/10 text-white py-3 px-6 rounded-lg border border-white/30 hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-md p-12 rounded-3xl border border-white/30 shadow-glow flex items-center justify-center">
                <div className="text-center">
                  <FileText size={64} className="text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a Project
                  </h3>
                  <p className="text-white/60">
                    Choose a project from the list to start evaluation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
