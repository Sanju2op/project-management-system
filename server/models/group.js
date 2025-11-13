import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      trim: true,
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
    },
    projectTitle: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    projectDescription: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    projectTechnology: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    // Optional link to an uploaded or external proposal PDF
    proposalPdf: {
      type: String,
      trim: true,
    },
    // Separate approval lifecycle for proposals handled by guides
    projectApprovalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
      max: 2035,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    membersSnapshot: [
      {
        studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        enrollmentNumber: String,
        name: String,
        joinedAt: { type: Date, default: Date.now },
        divisionCourse: String,
        divisionSemester: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
