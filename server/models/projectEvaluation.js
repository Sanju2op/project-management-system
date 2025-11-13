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
    evaluations: [
      {
        parameterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EvaluationParameter",
          required: true,
        },
        marks: {
          type: Number,
          min: 0,
          required: true,
        },
      },
    ],
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

projectEvaluationSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("ProjectEvaluation", projectEvaluationSchema);
