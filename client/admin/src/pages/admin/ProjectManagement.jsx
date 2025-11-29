// ProjectManagement.jsx — FINAL VERSION WITH PDF
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  Trash2,
  Save,
  CheckCircle,
  ChevronDown,
  List,
  Download,
  X,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  projectEvaluationAPI,
  evaluationParameterAPI,
  groupAPI,
} from "../../services/api";

import { generateGroupEvaluationsPDF } from "../../utils/pdf/groupEvaluationPdf";

import { generateBlankEvaluationPDF } from "../../utils/pdf/generateBlankEvaluationPDF";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- FilterDropdown (unchanged) ---
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

  // Core Data
  const [projects, setProjects] = useState([]);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [allEvaluations, setAllEvaluations] = useState([]); // NEW
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [marksData, setMarksData] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Add these states at the top (with other useState)
  const [showBlankPdfModal, setShowBlankPdfModal] = useState(false);
  const [columnCount, setColumnCount] = useState(4);
  const [columnNames, setColumnNames] = useState(["", "", "", ""]); // ← NO <string[]>
  // Filters
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");

  const courseOptions = useMemo(() => {
    const set = new Set(["All"]);
    projects.forEach((p) => {
      if (p.division?.course && p.division?.semester) {
        set.add(`${p.division.course} ${p.division.semester}`);
      }
    });
    return Array.from(set);
  }, [projects]);
  const yearOptions = useMemo(() => {
    const years = new Set(["All"]);

    projects.forEach((p) => {
      if (p.year) years.add(p.year);
    });

    return Array.from(years);
  }, [projects]);
  const statusOptions = useMemo(() => {
    const statuses = new Set(["All"]);

    projects.forEach((p) => {
      if (p.status) statuses.add(p.status);
    });

    return Array.from(statuses);
  }, [projects]);
  // --- Fetch Groups + Parameters ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsRes, paramsRes] = await Promise.all([
          groupAPI.getAll(), // Remove filters from API call
          evaluationParameterAPI.getAll(),
        ]);

        const groups = groupsRes.data.data || [];
        setProjects(groups);
        const sortedParams = [...(paramsRes.data.data || [])].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setEvaluationParameters(sortedParams);
      } catch (err) {
        toast.error("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Remove courseFilter & yearFilter from dependency array

  // --- Fetch ALL Evaluations (for PDF) ---
  // ---- inside the useEffect that fetches ALL evaluations ----
  // 1. Add state for allEvaluations (if not already there)
  // 2. Fetch all evaluations (once)
  // 1. State

  // 2. Fetch all evaluations (once)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await projectEvaluationAPI.getAllEvaluations();
        setAllEvaluations(data);
      } catch (err) {
        console.error("Failed to load all evaluations", err);
      }
    };
    fetchAll();
  }, []);

  // 3. Build map: enrollment → marks (fallback to _id)
  const evaluationsMap = useMemo(() => {
    const byEnrollment = {};
    const byId = {};

    allEvaluations.forEach((ev) => {
      const groupId = ev.projectId?._id || ev.projectId;
      const studentId = ev.studentId?._id || ev.studentId;
      const enrollment = ev.studentId?.enrollmentNumber || studentId;

      if (!byId[groupId]) byId[groupId] = {};
      if (!byEnrollment[groupId]) byEnrollment[groupId] = {};

      const marksObj = {};
      (ev.evaluations || []).forEach(({ parameterId, marks }) => {
        const paramId = parameterId?._id || parameterId;
        marksObj[paramId] = marks;
      });

      byId[groupId][studentId] = marksObj;
      byEnrollment[groupId][enrollment] = marksObj;
    });

    return { byId, byEnrollment };
  }, [allEvaluations]);

  // ---- build the map (useMemo) ----
  // ──────────────────────────────────────────────────────────────
  //  Replace ONLY this block (around line 140) in ProjectManagement.jsx
  // ──────────────────────────────────────────────────────────────

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
                _id: m.studentRef?._id || m._id,
                name: m.studentRef?.name || m.name || "Unknown",
                enrollmentNumber: m.studentRef?.enrollmentNumber || "N/A",
              })) || [],
        });
        const marks = {};
        (groupData.evaluations || []).forEach((evDoc) => {
          const studentId =
            typeof evDoc.studentId === "object"
              ? evDoc.studentId._id
              : evDoc.studentId;

          evDoc.evaluations.forEach(({ parameterId, marks: m }) => {
            const paramId =
              typeof parameterId === "object" ? parameterId._id : parameterId;
            marks[`${studentId}_${paramId}`] = m;
          });
        });
        setMarksData(marks);
      } catch (err) {
        toast.error("Failed to load group details");
        console.error(err);
      }
    };

    fetchGroupDetails();
  }, [selectedGroup?._id]);

  // --- Handle Mark Change ---
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

  // Add this function to handle column name change
  const handleColumnNameChange = (index, value) => {
    const newNames = [...columnNames];
    newNames[index] = value;
    setColumnNames(newNames);
  };

  const handleColumnCountChange = (count) => {
    setColumnCount(count);
    setColumnNames(Array(count).fill(""));
  };

  // --- Save All ---
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
      toast.success("All marks saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // --- Grand Total ---
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

  // --- Tech Filter ---
  const techOptions = [
    "All",
    ...new Set(projects.map((p) => p.projectTechnology).filter(Boolean)),
  ];
  const filteredProjects = projects.filter((p) => {
    const tech = p.projectTechnology || "";

    // Split selected courseFilter into course + semester
    let selectedCourse = "";
    let selectedSemester = "";
    if (courseFilter !== "All") {
      const parts = courseFilter.split(" ");
      selectedCourse = parts[0];
      selectedSemester = parts[1];
    }

    const courseMatch =
      courseFilter === "All" ||
      (p.division?.course === selectedCourse &&
        String(p.division?.semester) === selectedSemester);

    return (
      courseMatch &&
      (statusFilter === "All" || p.status === statusFilter) &&
      (techFilter === "All" || tech === techFilter)
    );
  });

  // --- Handlers ---
  const handleViewDetails = (group) => setSelectedGroup(group);

  // --- PDF Generation ---
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleGenerateGroupPdf = async () => {
    if (!filteredProjects.length || !evaluationParameters.length) {
      toast.error("No data to export");
      return;
    }

    setPdfLoading(true);
    try {
      generateGroupEvaluationsPDF({
        groups: filteredProjects.map((g) => ({
          ...g,
          courseSemester: `${g.division?.course || "N/A"} ${
            g.division?.semester || ""
          }`,
          students:
            g.students ||
            g.membersSnapshot?.map((m) => ({
              _id: m.studentRef?._id || m._id,
              name: m.studentRef?.name || m.name || "Unknown",
              enrollmentNumber: m.studentRef?.enrollmentNumber || "N/A",
            })) ||
            [],
        })),
        parameters: evaluationParameters,
        evaluationsMap,
      });

      toast.success("PDF Generated!");
    } catch (err) {
      toast.error("PDF generation failed");
      console.error(err);
    } finally {
      setPdfLoading(false);
      setShowPdfModal(false);
    }
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-3xl text-white animate-pulse">
        Loading Projects...
      </div>
    );
  }

  // --- Helper Components ---
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

  // --- RENDER ---
  const renderDetailsView = () => (
    <div className="w-full max-w-7xl mx-auto py-12">
      <ToastContainer position="top-right" theme="dark" />

      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/30 mb-10 shadow-2xl shadow-indigo-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-lg font-medium">
          <InfoPill label="Title" value={selectedGroup.projectTitle} />
          <InfoPill
            label="Technology"
            value={selectedGroup.projectTechnology}
          />
          <InfoPill label="Status" value={selectedGroup.status} highlight />
          <InfoPill
            label="Students"
            value={selectedGroup.students?.length || 0}
          />
        </div>
      </div>

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
            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/30 text-center shadow-inner shadow-black/30">
              <p className="text-white/70 text-sm font-medium">Grand Total</p>
              <p className="text-2xl font-extrabold text-accent-teal">
                {grandTotal.given} / {grandTotal.total}
              </p>
            </div>
            <button
              onClick={handleSaveAllEvaluations}
              disabled={saving}
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold text-lg py-3 px-8 rounded-xl hover:scale-[1.05] transition shadow-green-500/70 shadow-2xl disabled:opacity-60"
            >
              <Save size={24} /> SAVE ALL
            </button>
          </div>
        </div>

        {selectedGroup.students?.length > 0 ? (
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
                        <p className="text-white">
                          {student.name || "Unknown"}
                        </p>
                        <p className="text-xs text-white/60 font-normal">
                          {student.enrollmentNumber || "N/A"}
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

  const renderListView = () => (
    <div className="w-full max-w-7xl mx-auto py-12">
      <div className="flex justify-between items-center mb-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center bg-gray-700/80 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 hover:scale-[1.02] transition shadow-lg"
        >
          <ChevronLeft size={24} className="mr-2" /> Dashboard
        </button>
        <h1 className="text-5xl font-extrabold text-white">
          Manage <span className="text-accent-teal">Projects</span>
        </h1>
        <button
          onClick={() => setShowPdfModal(true)}
          disabled={pdfLoading}
          // Enhanced Classes for Dark/Blue Theme
          className={`
    flex items-center justify-center gap-2 
    px-6 py-3 text-lg font-extrabold text-white rounded-xl 
    bg-gradient-to-r from-teal-500 to-cyan-600 
    hover:from-teal-400 hover:to-cyan-500
    shadow-2xl shadow-cyan-500/60 
    transition-all duration-300 transform 
    hover:scale-[1.05] relative z-[9999]
    ${pdfLoading ? "opacity-70 cursor-not-allowed animate-pulse" : ""}
  `}
        >
          {/* Assumes Download icon is imported (Fixes 'X not defined' style issues) */}
          {pdfLoading ? (
            <>
              {/* If you have a spinner component, use it here, e.g., <Spinner /> */}
              <span className="animate-pulse">Generating…</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Create PDF</span>
            </>
          )}
        </button>
        <div className="w-32"></div>
      </div>

      <div className="flex flex-wrap gap-5 mb-12 justify-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl relative z-10">
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

      {showPdfModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/80 p-6 rounded-xl text-white w-96 shadow-xl border border-teal-500/50 relative">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-teal-400 transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-center text-teal-400">
              Export Options
            </h2>

            {/* Filled PDF */}
            <button
              onClick={handleGenerateGroupPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg mb-3 font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90 transition shadow-md shadow-cyan-500/40"
            >
              <Download size={20} /> Filled Evaluation PDF
            </button>

            {/* Blank PDF */}
            <button
              onClick={() => {
                setShowPdfModal(false);
                setShowBlankPdfModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg mb-3 font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition shadow-md shadow-purple-500/40"
            >
              <FileText size={20} /> Blank Evaluation Sheet
            </button>

            <button
              onClick={() => setShowPdfModal(false)}
              className="w-full bg-gray-700 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Blank Evaluation Sheet Modal */}
      {showBlankPdfModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 p-6 rounded-xl text-white w-full max-w-lg shadow-2xl border border-purple-500/50">
            <button
              onClick={() => setShowBlankPdfModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-pink-400 transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-center text-purple-400">
              Blank Evaluation Sheet
            </h2>

            {/* Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Number of Parameters
              </label>
              <select
                value={columnCount}
                onChange={(e) =>
                  handleColumnCountChange(Number(e.target.value))
                }
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-400 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Parameters
                  </option>
                ))}
              </select>
            </div>

            {/* Text Fields */}
            {Array.from({ length: columnCount }, (_, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Parameter ${i + 1}`}
                value={columnNames[i]}
                onChange={(e) => handleColumnNameChange(i, e.target.value)}
                className="w-full p-2 mb-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-400 outline-none"
              />
            ))}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  generateBlankEvaluationPDF({
                    groups: filteredProjects, // use filteredProjects here
                    parameters: columnNames.filter((n) => n.trim()),
                  });
                  setShowBlankPdfModal(false);
                }}
                disabled={columnNames.some((n) => !n.trim())}
                className="flex-1 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition disabled:opacity-50"
              >
                Create PDF
              </button>

              <button
                onClick={() => setShowBlankPdfModal(false)}
                className="flex-1 bg-gray-700 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleViewDetails(project)}
              className="group bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/30 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-cyan-400/50 hover:border-cyan-400 hover:scale-[1.05] transform flex flex-col h-full"
            >
              <h3 className="text-2xl font-extrabold text-accent-teal mb-4 group-hover:text-cyan-400 transition">
                {project.projectTitle}
              </h3>

              <ProjectInfoItem
                label="Course / Semester"
                value={`${project.division?.course || "N/A"} ${
                  project.division?.semester || ""
                }`}
              />

              <div className="space-y-3 text-white/90 font-medium mt-4">
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
                  label="Students"
                  value={project.members?.length || 0}
                />
              </div>

              <button className="mt-auto flex items-center justify-center w-full bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-3 rounded-xl font-extrabold group-hover:from-cyan-400 group-hover:to-teal-400 transition transform hover:scale-[1.02] shadow-lg">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-teal-950 text-white font-sans px-4 sm:px-6 lg:px-8">
      {selectedGroup ? renderDetailsView() : renderListView()}
    </div>
  );
}

export default ProjectManagement;
