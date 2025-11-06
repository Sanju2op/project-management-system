// ProjectManagement.jsx — MAX UI ENHANCEMENT (ORIGINAL DATA LOGIC PRESERVED, HANDLERS CONFIRMED)
import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Trash2,
  Save,
  CheckCircle,
  ChevronDown,
  List, // Added List icon for project card
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  // ORIGINAL API IMPORTS RESTORED
  projectEvaluationAPI,
  evaluationParameterAPI,
  groupAPI,
} from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Utility Component: FilterDropdown (UI Enhanced) ---

const FilterDropdown = ({ title, options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        // Enhanced button style: Added shadow-xl and hover glow
        className="flex items-center justify-between px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 border border-white/30 backdrop-blur-md w-44 shadow-xl hover:shadow-accent-teal/30 transition duration-300"
      >
        {selected || title}
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-14 left-0 w-48 bg-white/20 backdrop-blur-xl rounded-xl border border-white/40 shadow-2xl z-20">
          <ul className="py-2">
            {options.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer text-white hover:bg-accent-teal/50 transition duration-150 ${
                  selected === opt ? "bg-accent-teal/70 font-bold" : ""
                }`}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

function ProjectManagement() {
  const navigate = useNavigate();
  // DATA LOGIC PRESERVED: Original state initialization
  const [projects, setProjects] = useState([]);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [marksData, setMarksData] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters (ORIGINAL)
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");

  const courseOptions = ["All", "MCA", "BCA", "B.Tech", "M.Tech"];
  const yearOptions = ["All", "2023", "2024", "2025"];
  const statusOptions = ["All", "Not Started", "In Progress", "Completed"];

  // DATA LOGIC PRESERVED: Fetch groups + parameters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsRes, paramsRes] = await Promise.all([
          groupAPI.getAll({
            course: courseFilter === "All" ? undefined : courseFilter,
            year: yearFilter === "All" ? undefined : yearFilter,
          }),
          evaluationParameterAPI.getAll(),
        ]);

        const groups = groupsRes.data.data || [];
        setProjects(groups);
        setEvaluationParameters(paramsRes.data.data || []);
      } catch (err) {
        toast.error("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseFilter, yearFilter]);

  // DATA LOGIC PRESERVED: Fetch group details
  useEffect(() => {
    if (!selectedGroup?._id) return;

    const fetchGroupDetails = async () => {
      try {
        const res = await projectEvaluationAPI.getByProject(selectedGroup._id);
        const groupData = res.data.data;

        setSelectedGroup({
          ...groupData,
          students: groupData.students?.length
            ? groupData.students
            : groupData.membersSnapshot?.map((m) => ({
                _id: m.studentRef?._id,
                name: m.studentRef?.name || "Unknown",
                enrollmentNumber: m.studentRef?.enrollmentNumber || "N/A",
              })) || [],
        });

        const evaluations = groupData.evaluations || [];
        const marksData = {};

        evaluations.forEach((evDoc) => {
          const studentId =
            typeof evDoc.studentId === "object"
              ? evDoc.studentId._id
              : evDoc.studentId;

          evDoc.evaluations.forEach(({ parameterId, marks }) => {
            const paramId =
              typeof parameterId === "object" ? parameterId._id : parameterId;

            marksData[`${studentId}_${paramId}`] = marks;
          });
        });

        setMarksData(marksData);
      } catch (err) {
        console.error("Failed to fetch group details:", err);
        toast.error("Failed to load group details");
      }
    };

    fetchGroupDetails();
  }, [selectedGroup?._id]);

  // DATA LOGIC PRESERVED: Handle Mark Change
  const handleMarkChange = (studentId, paramId, value) => {
    const numValue = value === "" ? "" : Math.max(0, Number(value));
    const param = evaluationParameters.find((p) => p._id === paramId);
    if (param && numValue > param.marks) {
      toast.error(`Max ${param.marks} marks allowed for ${param.name}!`);
      return;
    }
    setMarksData((prev) => ({
      ...prev,
      [`${studentId}_${paramId}`]: numValue,
    }));
  };

  // DATA LOGIC PRESERVED: Handle Save All Evaluations
  const handleSaveAllEvaluations = async () => {
    if (!selectedGroup?._id) return toast.error("No group selected");

    setSaving(true);
    try {
      const evaluations = selectedGroup.students
        .map((student) => {
          const studentId = student._id.toString();
          return evaluationParameters.map((param) => ({
            student: studentId,
            parameter: param._id,
            marks: Number(marksData[`${studentId}_${param._id}`] || 0),
          }));
        })
        .flat();

      await projectEvaluationAPI.saveAll(selectedGroup._id, evaluations);
      toast.success("All marks saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  // DATA LOGIC PRESERVED: Grand Total Calculation
  const grandTotal = {
    given:
      selectedGroup?.students?.reduce((sum, student) => {
        const studentId = student._id.toString();
        return (
          sum +
          evaluationParameters.reduce((acc, param) => {
            return acc + (Number(marksData[`${studentId}_${param._id}`]) || 0);
          }, 0)
        );
      }, 0) || 0,
    total:
      (selectedGroup?.students?.length || 0) *
      evaluationParameters.reduce((s, p) => s + p.marks, 0),
  };

  // DATA LOGIC PRESERVED: Tech Options and Filtering
  const techOptions = [
    "All",
    ...new Set(projects.map((p) => p.projectTechnology).filter(Boolean)),
  ];
  const filteredProjects = projects.filter((p) => {
    const tech = p.projectTechnology || "";
    return (
      (statusFilter === "All" || p.status === statusFilter) &&
      (techFilter === "All" || tech === techFilter)
    );
  });

  // HANDLERS CONFIRMED TO BE CORRECT
  const handleBack = () => navigate("/admin/dashboard");
  const handleViewDetails = (group) => {
    setSelectedGroup(group);
  };
  const handleBackToList = () => setSelectedGroup(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-3xl text-white animate-pulse">
        Loading Projects...
      </div>
    );
  }

  // --- Helper Components for Cleanliness ---

  const InfoPill = ({ label, value, highlight }) => (
    <div className="flex flex-col">
      <strong className="text-white/70 text-sm">{label}</strong>
      <span
        className={`mt-1 font-bold ${
          highlight ? "text-accent-teal" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );

  const ProjectInfoItem = ({ label, value, status }) => {
    let statusClass = "text-white/80";
    if (status === "Completed") statusClass = "text-green-400";
    else if (status === "In Progress") statusClass = "text-yellow-400";
    else if (status === "Not Started") statusClass = "text-red-400";

    return (
      <p className="flex justify-between">
        <strong className="text-white/70">{label}:</strong>
        <span className={status ? statusClass : "text-white/80"}>{value}</span>
      </p>
    );
  };

  // --- RENDER DETAILS VIEW (UI Enhanced) ---

  const renderDetailsView = () => (
    <div className="w-full max-w-7xl mx-auto py-12">
      <ToastContainer position="top-right" theme="dark" />

      {/* Header and Actions (Stronger Shadows) */}
      <div className="flex justify-between items-center mb-10">
        <button
          // ACTION CONFIRMED: Resets selectedGroup to null
          onClick={handleBackToList}
          className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-3 px-6 rounded-xl font-bold hover:scale-[1.02] transition shadow-2xl shadow-accent-teal/50"
        >
          <ChevronLeft size={24} className="mr-2" /> Back to Projects
        </button>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-white text-center flex-grow">
          <span className="text-accent-teal">{selectedGroup.projectTitle}</span>
        </h1>
        <button
          onClick={() => toast.info("Delete coming soon")}
          className="flex items-center bg-red-600/90 text-white py-3 px-6 rounded-xl font-bold hover:bg-red-700 hover:scale-[1.02] transition shadow-lg"
        >
          <Trash2 size={20} className="mr-2" /> Delete
        </button>
      </div>

      {/* Project Information Card (More prominent glass effect) */}
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/30 mb-10 shadow-2xl shadow-indigo-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-lg font-medium">
          <InfoPill label="Title" value={selectedGroup.projectTitle} />
          <InfoPill
            label="Technology"
            value={selectedGroup.projectTechnology}
          />
          <InfoPill label="Status" value={selectedGroup.status} highlight />
          <InfoPill
            label="Members"
            value={selectedGroup.students?.length || 0}
          />
        </div>
      </div>

      {/* Evaluation Section */}
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-xl">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <h2 className="text-3xl font-extrabold text-white flex items-center">
            <CheckCircle size={32} className="mr-3 text-accent-teal" />
            Evaluation Marks
            {saving && (
              <span className="ml-4 text-yellow-400 animate-pulse text-lg">
                Saving...
              </span>
            )}
          </h2>
          <div className="flex items-center gap-6">
            {/* Grand Total Pill */}
            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/30 text-center shadow-inner shadow-black/30">
              <p className="text-white/70 text-sm font-medium">Grand Total</p>
              <p className="text-2xl font-extrabold text-accent-teal">
                {grandTotal.given} / {grandTotal.total}
              </p>
            </div>
            {/* SAVE ALL Button (Bolder shadow) */}
            <button
              onClick={handleSaveAllEvaluations}
              disabled={saving}
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold text-lg py-3 px-8 rounded-xl hover:scale-[1.05] transition shadow-green-500/70 shadow-2xl disabled:opacity-60"
            >
              <Save size={24} /> SAVE ALL
            </button>
          </div>
        </div>

        {/* Evaluation Table (Compact UI) */}
        {selectedGroup.students && selectedGroup.students.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/20">
            <table className="w-full text-white table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-accent-teal/80 to-cyan-600/80 shadow-lg">
                  <th className="px-6 py-4 text-left font-extrabold text-lg w-1/4 min-w-[200px]">
                    Student Details
                  </th>
                  {evaluationParameters.map((param) => (
                    <th
                      key={param._id}
                      className="px-4 py-4 text-center font-extrabold text-lg"
                    >
                      {param.name}
                      <span className="block text-sm opacity-90 font-medium">
                        (Max {param.marks})
                      </span>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center font-extrabold text-lg bg-teal-600/90 w-1/6 min-w-[120px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.students.map((student, idx) => {
                  const studentId = student._id.toString();
                  const studentName = student.name || "Unknown Student";
                  const enrollment = student.enrollmentNumber || "N/A";

                  const studentTotal = evaluationParameters.reduce(
                    (sum, param) =>
                      sum +
                      (Number(marksData[`${studentId}_${param._id}`]) || 0),
                    0
                  );
                  const maxTotal = evaluationParameters.reduce(
                    (acc, p) => acc + p.marks,
                    0
                  );

                  return (
                    <tr
                      key={studentId}
                      className={`border-t border-white/10 transition duration-150 ${
                        idx % 2 === 0
                          ? "bg-white/5 hover:bg-white/10"
                          : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-base">
                        <p className="text-white">{studentName}</p>
                        <p className="text-xs text-white/60 font-normal">
                          {enrollment}
                        </p>
                      </td>

                      {evaluationParameters.map((param) => {
                        const cellKey = `${studentId}_${param._id}`;
                        const value = marksData[cellKey] ?? "";

                        return (
                          <td key={cellKey} className="px-4 py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={param.marks}
                              value={value}
                              onChange={(e) =>
                                handleMarkChange(
                                  studentId,
                                  param._id,
                                  e.target.value
                                )
                              }
                              // Stronger focus ring for better UX
                              className="w-20 sm:w-24 px-3 py-2 text-base font-semibold text-center rounded-lg bg-white/10 border-2 border-white/40 focus:ring-4 focus:ring-cyan-400 focus:border-cyan-400 transition-all outline-none"
                              placeholder="0"
                            />
                          </td>
                        );
                      })}

                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-gradient-to-r from-accent-teal/90 to-cyan-500/90 text-white font-extrabold text-xl px-4 py-2 rounded-lg shadow-md shadow-black/50">
                          {studentTotal} / {maxTotal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-xl text-white/70 border border-white/10 rounded-xl bg-white/5">
            No students found in this group.
          </div>
        )}
      </div>
    </div>
  );

  // --- RENDER LIST VIEW (UI Enhanced) ---

  const renderListView = () => (
    <div className="w-full max-w-7xl mx-auto py-12">
      <div className="flex justify-between items-center mb-10">
        <button
          // ACTION CONFIRMED: Calls navigate("/admin/dashboard")
          onClick={handleBack}
          className="flex items-center bg-gray-700/80 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 hover:scale-[1.02] transition shadow-lg"
        >
          <ChevronLeft size={24} className="mr-2" /> Dashboard
        </button>
        <h1 className="text-5xl font-extrabold text-white">
          Manage <span className="text-accent-teal">Projects</span>
        </h1>
        <div className="w-32"></div> {/* Spacer */}
      </div>

      {/* Filter Section (Glass Panel style) */}
      <div className="flex flex-wrap gap-5 mb-12 justify-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
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

      {/* Projects Grid (Bolder Hover Effects) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleViewDetails(project)}
              // Enhanced Card Style: more vibrant hover/shadow and scale
              className="group bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/30 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-cyan-400/50 hover:border-cyan-400 hover:scale-[1.05] transform"
            >
              <h3 className="text-2xl font-extrabold text-accent-teal mb-4 group-hover:text-cyan-400 transition">
                {project.projectTitle}
              </h3>
              <div className="space-y-3 text-white/90 font-medium">
                <ProjectInfoItem
                  label="Tech"
                  value={project.projectTechnology || "N/A"}
                />
                <ProjectInfoItem
                  label="Status"
                  value={project.status}
                  status={project.status}
                />
                <ProjectInfoItem
                  label="Members"
                  value={project.students?.length || 0}
                />
              </div>
              {/* Card Button (Vibrant Gradient) */}
              <button className="mt-6 flex items-center justify-center w-full bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-3 rounded-xl font-extrabold group-hover:from-cyan-400 group-hover:to-teal-400 transition transform hover:scale-[1.02] shadow-lg">
                View Evaluation <List size={20} className="ml-2" />
              </button>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 lg:col-span-4 text-center py-20 text-2xl text-white/70">
            No projects found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );

  // --- Final Return ---

  return (
    // Updated background gradient for a deep, tech-inspired look (Black/Indigo/Teal)
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-teal-950 text-white font-sans px-4 sm:px-6 lg:px-8">
      {selectedGroup ? renderDetailsView() : renderListView()}
    </div>
  );
}

export default ProjectManagement;
