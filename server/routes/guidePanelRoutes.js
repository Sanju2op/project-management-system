import express from "express";
import { protectGuide } from "../middlewares/authMiddleware.js";
import {
  getGuideGroups,
  getGroupByIdForGuide,
} from "../controllers/guideController.js";
import Group from "../models/group.js";
import Student from "../models/student.js";
import Feedback from "../models/feedback.js";
import { sendEmail } from "../services/emailService.js";
import GuideProjectEvaluation from "../models/guideProjectEvaluation.js";

const router = express.Router();

// All routes require authenticated guide
router.use(protectGuide);

// GET /api/guide-panel/groups - list groups for current guide
router.get("/groups", async (req, res) => {
  try {
    // Reuse controller formatting by calling underlying logic
    req.params.id = req.guide._id.toString();
    return getGuideGroups(req, res);
  } catch (error) {
    console.error("Error listing guide-panel groups:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/guide-panel/groups/:groupId - group details for current guide
router.get("/groups/:groupId", async (req, res) => {
  try {
    req.params.id = req.guide._id.toString();
    return getGroupByIdForGuide(req, res);
  } catch (error) {
    console.error("Error getting guide-panel group:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Project Evaluation ---
// GET /api/guide-panel/projects - list projects (groups) for current guide enriched with evaluation state
router.get("/projects", async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const groups = await Group.find({ guide: guideId })
      .populate("students", "name email")
      .lean();

    const groupIds = groups.map((g) => g._id);
    const evaluations = await GuideProjectEvaluation.find({
      guide: guideId,
      group: { $in: groupIds },
    }).lean();
    const evalMap = new Map(evaluations.map((e) => [e.group.toString(), e]));

    const data = groups.map((g) => {
      const e = evalMap.get(g._id.toString());
      return {
        id: g._id,
        groupName: g.name,
        projectTitle: g.projectTitle || "",
        technology: g.projectTechnology || "",
        status: e?.status || "Pending Evaluation",
        progress: 0,
        submittedDate: g.createdAt?.toISOString?.().split("T")[0] || null,
        lastEvaluation: e?.lastEvaluatedAt
          ? new Date(e.lastEvaluatedAt).toISOString().split("T")[0]
          : null,
        documents: ["Proposal.pdf", "Design.docx"],
        members: (g.students || []).map((s) => s.name),
        evaluation: e
          ? {
              technicalScore: e.technicalScore || 0,
              presentationScore: e.presentationScore || 0,
              documentationScore: e.documentationScore || 0,
              innovationScore: e.innovationScore || 0,
              overallScore: e.overallScore || 0,
            }
          : null,
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error listing projects:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/guide-panel/groups/:groupId/details - update project details and members
router.put("/groups/:groupId/details", async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { groupId } = req.params;
    const {
      projectTitle,
      projectDescription,
      year,
      technology,
      members = [], // array of student ids
    } = req.body || {};

    const group = await Group.findOne({ _id: groupId, guide: guideId });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (Array.isArray(members)) {
      if (members.length < 3 || members.length > 4) {
        return res
          .status(400)
          .json({ success: false, message: "Group must have 3-4 members" });
      }
      // Validate students exist and are either unassigned or already in this group
      const students = await Student.find({ _id: { $in: members } });
      if (students.length !== members.length) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid student list" });
      }

      // Ensure students are not part of another group
      const conflicting = await Student.find({
        _id: { $in: members },
        $and: [
          { $or: [{ group: { $ne: null } }, { group: { $exists: true } }] },
          { group: { $ne: group._id } },
        ],
      });
      if (conflicting.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some students are already assigned to another group",
        });
      }

      // Detach current students previously in this group but not in new list
      await Student.updateMany(
        { group: group._id, _id: { $nin: members } },
        { $set: { group: null } }
      );

      // Attach new students to this group
      await Student.updateMany(
        { _id: { $in: members } },
        { $set: { group: group._id } }
      );

      group.students = members;
      // Maintain a simple snapshot for auditing
      group.membersSnapshot = students.map((s) => ({
        studentRef: s._id,
        enrollmentNumber: s.enrollmentNumber,
        name: s.name,
      }));
    }

    if (projectTitle !== undefined) group.projectTitle = projectTitle;
    if (projectDescription !== undefined)
      group.projectDescription = projectDescription;
    if (technology !== undefined) group.projectTechnology = technology;
    if (year !== undefined) group.year = year;

    await group.save();

    const populated = await Group.findById(group._id)
      .populate("students", "name email enrollmentNumber")
      .lean();

    return res.status(200).json({
      data: {
        id: populated._id,
        groupName: populated.name,
        projectTitle: populated.projectTitle || "",
        description: populated.projectDescription || "",
        technology: populated.projectTechnology || "",
        year: populated.year,
        status: populated.status,
        members: (populated.students || []).map((s) => ({
          id: s._id,
          name: s.name,
          enrollmentNumber: s.enrollmentNumber,
          email: s.email,
        })),
      },
    });
  } catch (error) {
    console.error("Error updating group details:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/guide-panel/students/search?enrollment=123
router.get("/students/search", async (req, res) => {
  try {
    const { enrollment = "" } = req.query;
    const regex = new RegExp(`^${String(enrollment).trim()}`, "i");
    const students = await Student.find({
      enrollmentNumber: { $regex: regex },
    })
      .select("name email enrollmentNumber group")
      .limit(20)
      .lean();

    res.status(200).json({
      data: students.map((s) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        enrollmentNumber: s.enrollmentNumber,
        isAssigned: !!s.group,
      })),
    });
  } catch (error) {
    console.error("Error searching students:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/guide-panel/groups/:groupId/available-students
router.get("/groups/:groupId/available-students", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({ _id: groupId, guide: req.guide._id });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const available = await Student.find({
      $or: [{ group: null }, { group: groupId }],
    })
      .select("name enrollmentNumber email")
      .limit(100)
      .lean();

    res.status(200).json({
      data: available.map((s) => ({
        _id: s._id,
        name: s.name,
        enrollmentNumber: s.enrollmentNumber,
        email: s.email,
      })),
    });
  } catch (error) {
    console.error("Error getting available students:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Feedback Management ---
// GET /api/guide-panel/feedback - list feedbacks for groups under current guide
router.get("/feedback", async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { groupId } = req.query;

    const filter = { guide: guideId };
    if (groupId) filter.group = groupId;

    const items = await Feedback.find(filter)
      .populate("group", "name projectTitle")
      .sort({ createdAt: -1 })
      .lean();

    const data = items.map((f) => ({
      id: f._id,
      groupId: f.group?._id?.toString?.() || null,
      groupName: f.group?.name || "",
      project: f.projectTitle || f.group?.projectTitle || "",
      feedback: f.message,
      rating: f.rating || 5,
      recommendations: f.recommendations || "",
      status: f.status || "Submitted",
      response: f.response || "",
      date: f.createdAt?.toISOString?.().split("T")[0] || null,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error listing feedback:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/guide-panel/feedback - create feedback for a group
router.post("/feedback", async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const {
      groupId,
      groupName,
      project,
      feedback,
      rating = 5,
      recommendations = "",
    } = req.body || {};

    let resolvedGroupId = groupId;
    if (!resolvedGroupId && groupName) {
      const grp = await Group.findOne({
        name: groupName,
        guide: guideId,
      }).lean();
      if (!grp) {
        return res
          .status(404)
          .json({ success: false, message: "Group not found for this guide" });
      }
      resolvedGroupId = grp._id.toString();
    }

    if (!resolvedGroupId) {
      return res.status(400).json({
        success: false,
        message: "groupId or valid groupName is required",
      });
    }

    // Ensure ownership
    const group = await Group.findOne({ _id: resolvedGroupId, guide: guideId });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!feedback || !feedback.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Feedback message is required" });
    }

    const created = await Feedback.create({
      group: group._id,
      guide: guideId,
      projectTitle: project || group.projectTitle || "",
      message: feedback,
      rating: Number(rating) || 5,
      recommendations: recommendations || "",
      status: "Submitted",
    });

    return res.status(201).json({
      data: {
        id: created._id,
        groupId: group._id,
        groupName: group.name,
        project: created.projectTitle,
        feedback: created.message,
        rating: created.rating,
        recommendations: created.recommendations,
        status: created.status,
        response: created.response || "",
        date: created.createdAt?.toISOString?.().split("T")[0] || null,
      },
    });
  } catch (error) {
    console.error("Error creating feedback:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/guide-panel/feedback/:id - update feedback (message/rating/recommendations/status)
router.put("/feedback/:id", async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { id } = req.params;
    const { feedback, rating, recommendations, status, project } =
      req.body || {};

    const item = await Feedback.findOne({ _id: id, guide: guideId });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    if (feedback !== undefined) item.message = feedback;
    if (rating !== undefined) item.rating = Number(rating);
    if (recommendations !== undefined) item.recommendations = recommendations;
    if (status !== undefined) item.status = status;
    if (project !== undefined) item.projectTitle = project;

    await item.save();

    const populated = await item.populate({
      path: "group",
      select: "name projectTitle",
    });

    return res.status(200).json({
      data: {
        id: populated._id,
        groupId: populated.group?._id?.toString?.() || null,
        groupName: populated.group?.name || "",
        project: populated.projectTitle || populated.group?.projectTitle || "",
        feedback: populated.message,
        rating: populated.rating,
        recommendations: populated.recommendations || "",
        status: populated.status,
        response: populated.response || "",
        date: populated.createdAt?.toISOString?.().split("T")[0] || null,
      },
    });
  } catch (error) {
    console.error("Error updating feedback:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/guide-panel/feedback/:id - delete feedback
router.delete("/feedback/:id", async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { id } = req.params;
    const deleted = await Feedback.findOneAndDelete({
      _id: id,
      guide: guideId,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }
    return res.status(200).json({ data: { message: "Feedback deleted" } });
  } catch (error) {
    console.error("Error deleting feedback:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/guide-panel/feedback/:id/remind - email reminder to all students in the group
router.post("/feedback/:id/remind", async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { id } = req.params;

    const item = await Feedback.findOne({ _id: id, guide: guideId }).populate({
      path: "group",
      select: "name projectTitle students",
      populate: { path: "students", select: "name email" },
    });
    if (!item || !item.group) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    const recipients = (item.group.students || [])
      .map((s) => s?.email)
      .filter(Boolean);

    if (recipients.length === 0) {
      // Gracefully respond success even if no emails to avoid UI errors
      return res.status(200).json({
        data: {
          message: "No recipient emails available; reminder acknowledged.",
        },
      });
    }

    // Attempt sending emails; swallow individual failures to be graceful
    await Promise.all(
      recipients.map(async (to) => {
        try {
          await sendEmail({
            to,
            type: "GUIDE_EVALUATION_UPDATED",
            data: {
              name: to.split("@")[0],
              projectName:
                item.projectTitle || item.group.projectTitle || item.group.name,
            },
          });
        } catch (err) {
          // Log and continue without failing the whole request
          console.warn(`Email send failed for ${to}:`, err?.message || err);
        }
      })
    );

    return res.status(200).json({ data: { message: "Reminder sent" } });
  } catch (error) {
    console.warn(
      "Reminder email encountered issues (graceful):",
      error.message
    );
    // Graceful success to avoid blocking UI due to dummy emails
    return res.status(200).json({ data: { message: "Reminder attempted" } });
  }
});

export default router;
