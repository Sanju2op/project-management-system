// models/ProjectEvaluation.js
import mongoose from "mongoose";

const projectEvaluationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    parameterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationParameter",
      required: true,
    },
    givenMarks: {
      type: Number,
      min: 0,
      default: null,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Ensure no duplicate evaluations per student per parameter per group
projectEvaluationSchema.index(
  { projectId: 1, studentId: 1, parameterId: 1 },
  { unique: true }
);

export default mongoose.model("ProjectEvaluation", projectEvaluationSchema);
