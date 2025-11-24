import mongoose from "mongoose";
import EvaluationParameter from "../models/evaluationParameter.js";
import Group from "../models/group.js";
import ProjectEvaluation from "../models/projectEvaluation.js";

export const getEvaluationParameters = async (_req, res) => {
  try {
    const params = await EvaluationParameter.find().sort({ order: 1 });
    res.json({ success: true, data: params });
  } catch (error) {
    console.error("getEvaluationParameters error:", error);
    res.status(500).json({ message: "Failed to load parameters" });
  }
};

export const getProjectEvaluationById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("students", "name enrollmentNumber _id")
      .populate({
        path: "membersSnapshot",
        populate: { path: "studentRef", select: "name enrollmentNumber _id" },
      })
      .select(
        "projectTitle projectTechnology status students membersSnapshot guide"
      )
      .lean();

    if (!group)
      return res.status(404).json({ success: false, message: "Group not found" });

    const students =
      Array.isArray(group.membersSnapshot) && group.membersSnapshot.length > 0
        ? group.membersSnapshot.map((m) => ({
            _id: m.studentRef?._id || m.studentRef,
            name: m.studentRef?.name || m.name || "Unknown",
            enrollmentNumber:
              m.studentRef?.enrollmentNumber || m.enrollmentNumber || "N/A",
          }))
        : (group.students || []).map((s) => ({
            _id: s._id,
            name: s.name,
            enrollmentNumber: s.enrollmentNumber,
          }));

    const evaluations = await ProjectEvaluation.find({ projectId: groupId })
      .populate("studentId", "name enrollmentNumber")
      .populate("evaluations.parameterId", "name")
      .lean();

    res.json({
      success: true,
      data: {
        ...group,
        students,
        evaluations,
      },
    });
  } catch (error) {
    console.error("getProjectEvaluationById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const saveAllProjectEvaluations = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { evaluations } = req.body;

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      return res.status(400).json({ message: "No evaluations provided" });
    }

    const evaluatorId =
      (req.admin && req.admin._id) || (req.guide && req.guide._id) || null;

    if (!evaluatorId) {
      return res
        .status(401)
        .json({ message: "Not authorized to submit evaluations" });
    }

    const grouped = evaluations.reduce((acc, e) => {
      if (!acc[e.student]) acc[e.student] = [];
      acc[e.student].push({
        parameterId: new mongoose.Types.ObjectId(e.parameter),
        marks: Number(e.marks),
      });
      return acc;
    }, {});

    const upsertOps = Object.entries(grouped).map(([studentId, evals]) =>
      ProjectEvaluation.findOneAndUpdate(
        {
          projectId: new mongoose.Types.ObjectId(groupId),
          studentId: new mongoose.Types.ObjectId(studentId),
        },
        {
          $set: {
            evaluations: evals,
            evaluatedBy: new mongoose.Types.ObjectId(evaluatorId),
          },
          $setOnInsert: {
            projectId: new mongoose.Types.ObjectId(groupId),
            studentId: new mongoose.Types.ObjectId(studentId),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );

    await Promise.all(upsertOps);
    await Group.findByIdAndUpdate(groupId, { status: "Completed" });

    res.json({
      success: true,
      message: "All evaluations saved successfully!",
    });
  } catch (error) {
    console.error("Error saving project evaluations:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getAllProjectEvaluations = async (_req, res) => {
  try {
    const evaluations = await ProjectEvaluation.find({})
      .populate("projectId", "name projectTitle projectTechnology")
      .populate("studentId", "name enrollmentNumber")
      .populate("evaluations.parameterId", "name")
      .lean();

    res.json({ success: true, data: evaluations });
  } catch (error) {
    console.error("getAllProjectEvaluations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch evaluations" });
  }
};
