import EvaluationParameter from "../models/evaluationParameter.js";
import Group from "../models/group.js";
import ProjectEvaluation from "../models/projectEvaluation.js";

// Get all evaluation parameters sorted by order
export const getEvaluationParameters = async (req, res) => {
  try {
    const params = await EvaluationParameter.find().sort({ order: 1 });
    res.json({ success: true, data: params });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get group info and students with nested evaluations populated
export const getProjectEvaluationById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("students", "name enrollmentNumber _id")
      .populate({
        path: "membersSnapshot",
        populate: { path: "studentRef", select: "name enrollmentNumber _id" },
      })
      .select("projectTitle projectTechnology status students membersSnapshot");

    if (!group) return res.status(404).json({ message: "Group not found" });

    const students =
      group.membersSnapshot?.length > 0
        ? group.membersSnapshot.map((m) => ({
            _id: m.studentRef?._id,
            name: m.studentRef?.name || "Unknown",
            enrollmentNumber: m.studentRef?.enrollmentNumber || "N/A",
          }))
        : group.students.map((s) => ({
            _id: s._id,
            name: s.name,
            enrollmentNumber: s.enrollmentNumber,
          }));

    // Fetch nested evaluations with parameter info populated
    const evaluations = await ProjectEvaluation.find({ projectId: groupId })
      .populate("studentId", "name enrollmentNumber")
      .populate("evaluations.parameterId", "name")
      .lean();

    res.json({
      success: true,
      data: {
        ...group.toObject(),
        students,
        evaluations,
      },
    });
  } catch (error) {
    console.error("getProjectEvaluationById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Save nested evaluations grouped by student (upsert)
export const saveAllProjectEvaluations = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { evaluations } = req.body;

    if (!Array.isArray(evaluations) || evaluations.length === 0)
      return res.status(400).json({ message: "No evaluations provided" });

    const grouped = evaluations.reduce((acc, e) => {
      if (!acc[e.student]) acc[e.student] = [];
      acc[e.student].push({ parameterId: e.parameter, marks: Number(e.marks) });
      return acc;
    }, {});

    const upsertOps = Object.entries(grouped).map(([studentId, evals]) =>
      ProjectEvaluation.findOneAndUpdate(
        { projectId: groupId, studentId },
        { $set: { evaluations: evals, evaluatedBy: req.admin._id } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );

    await Promise.all(upsertOps);
    await Group.findByIdAndUpdate(groupId, { status: "Completed" });

    res.json({ success: true, message: "All evaluations saved successfully!" });
  } catch (error) {
    console.error("Error saving project evaluations:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
