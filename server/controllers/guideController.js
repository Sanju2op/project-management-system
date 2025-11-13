import jwt from "jsonwebtoken";
import Guide from "../models/guide.js";
import Group from "../models/group.js";
import Student from "../models/student.js";
import GuideAnnouncement from "../models/guideAnnouncement.js";
import EvaluationParameter from "../models/evaluationParameter.js";
// import CourseAnnouncement from "../models/courseAnnouncement.js";
// import ExamSchedule from "../models/examSchedule.js";

/**
 * @desc    Register a new guide
 * @route   POST /api/auth/guide/register
 * @access  Public
 */
export const registerGuide = async (req, res) => {
  try {
    const { name, email, password, expertise, phone } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // 2️⃣ Check for duplicate email
    const existingGuide = await Guide.findOne({
      email,
    });
    if (existingGuide) {
      return res.status(400).json({
        success: false,
        message: "Guide with this email already exists.",
      });
    }

    // 3️⃣ Create guide
    const newGuide = await Guide.create({
      name,
      email,
      password,
      expertise,
      phone,
    });
    try {
      await Notification.create({
        type: "guide",
        message: `New guide "${newGuide.name}" registered.`,
        isRead: false,
      });
    } catch (notifErr) {
      console.warn(
        "Failed to create notification for guide registration:",
        notifErr.message
      );
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign({ id: newGuide._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5️⃣ Respond with guide details
    res.status(201).json({
      success: true,
      message: "Guide registered successfully.",
      data: {
        token,
        data: {
          id: newGuide._id,
          name: newGuide.name,
          email: newGuide.email,
          expertise: newGuide.expertise,
          phone: newGuide.phone,
          status: newGuide.status,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error registering guide:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during guide registration.",
    });
  }
};

/**
 * @desc    Guide login
 * @route   POST /api/auth/guide/login
 * @access  Public
 */
export const loginGuide = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // 2️⃣ Find guide by email
    const guide = await Guide.findOne({ email });
    if (!guide) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3️⃣ Verify password
    const isMatch = await guide.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign({ id: guide._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5️⃣ Respond with guide info + token
    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        data: {
          id: guide._id,
          name: guide.name,
          email: guide.email,
          expertise: guide.expertise,
          phone: guide.phone,
          status: guide.status,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error logging in guide:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during guide login.",
    });
  }
};

/**
 * @desc    Get current authenticated guide profile
 * @route   GET /api/auth/guide/me
 * @access  Private (Guide)
 */
export const getAuthenticatedGuide = async (req, res) => {
  try {
    // `protectGuide` sets req.guide
    if (!req.guide) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const guide = await Guide.findById(req.guide._id).select("-password");
    if (!guide) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    res.status(200).json({
      data: {
        id: guide._id,
        name: guide.name,
        email: guide.email,
        expertise: guide.expertise,
        phone: guide.phone,
        status: guide.status,
      },
    });
  } catch (error) {
    console.error("Error getting authenticated guide:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Update current authenticated guide profile
 * @route   PUT /api/auth/guide/me
 * @access  Private (Guide)
 */
export const updateAuthenticatedGuide = async (req, res) => {
  try {
    if (!req.guide) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updates = req.body || {};
    const updatedGuide = await Guide.findByIdAndUpdate(
      req.guide._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedGuide) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    res.status(200).json({
      data: {
        id: updatedGuide._id,
        name: updatedGuide.name,
        email: updatedGuide.email,
        employeeId: updatedGuide.employeeId,
        department: updatedGuide.department,
        designation: updatedGuide.designation,
        expertise: updatedGuide.expertise,
        phone: updatedGuide.phone,
        status: updatedGuide.status,
      },
    });
  } catch (error) {
    console.error("Error updating authenticated guide:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Change guide password
 * @route   PUT /api/auth/guide/change-password
 * @access  Private (Guide)
 */
export const changeGuidePassword = async (req, res) => {
  try {
    if (!req.guide) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const guide = await Guide.findById(req.guide._id);
    if (!guide) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    const isMatch = await guide.matchPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    guide.password = newPassword;
    await guide.save();

    res
      .status(200)
      .json({ data: { message: "Password changed successfully" } });
  } catch (error) {
    console.error("Error changing guide password:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get guide profile by ID
 * @route   GET /api/guides/:id/profile
 * @access  Private (JWT)
 */
export const getGuideProfileById = async (req, res) => {
  try {
    const guideId = req.params.id;

    // Fetch guide by ID from DB, exclude password
    const guide = await Guide.findById(guideId).select("-password");

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    // Respond with structure expected by frontend
    res.status(200).json({
      data: {
        id: guide._id,
        name: guide.name,
        email: guide.email,
        employeeId: guide.employeeId,
        department: guide.department,
        designation: guide.designation,
        expertise: guide.expertise,
        phone: guide.phone,
        status: guide.status,
      },
    });
  } catch (error) {
    console.error("Error fetching guide profile:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Update guide profile by ID
 * @route   PUT /api/guides/:id/profile
 * @access  Private (JWT)
 */
export const updateGuideProfile = async (req, res) => {
  try {
    const guideId = req.params.id;
    const updates = req.body;

    // Simple validation (can be expanded)
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    // Find the guide and update their profile.
    // Use { new: true } to return the updated document.
    const updatedGuide = await Guide.findByIdAndUpdate(
      guideId,
      { $set: updates },
      { new: true, runValidators: true } // runValidators ensures model schema validation applies
    ).select("-password"); // Exclude password from the response

    if (!updatedGuide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    // Respond with the updated structure expected by the frontend
    res.status(200).json({
      data: {
        id: updatedGuide._id,
        name: updatedGuide.name,
        email: updatedGuide.email,
        employeeId: updatedGuide.employeeId,
        department: updatedGuide.department,
        designation: updatedGuide.designation,
        expertise: updatedGuide.expertise,
        phone: updatedGuide.phone,
        status: updatedGuide.status,
      },
    });
  } catch (error) {
    console.error("Error updating guide profile:", error.message);

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get guide dashboard by guide ID
 * @route   GET /api/guides/:id/dashboard
 * @access  Private (JWT)
 */
export const getGuideDashboard = async (req, res) => {
  try {
    const guideId = req.params.id;

    // Check if guide exists
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    // Fetch groups assigned to this guide
    const groups = await Group.find({ guide: guideId })
      .populate("membersSnapshot.studentRef", "name email") // optional: populate student info
      .lean();

    // Construct stats
    const stats = {
      totalGroups: groups.length,
      activeProjects: groups.filter((g) => g.status === "In Progress").length,
      completedProjects: groups.filter((g) => g.status === "Completed").length,
      pendingReviews: groups.filter((g) => g.status === "Pending Review")
        .length,
    };

    // Format groups for frontend
    const formattedGroups = groups.map((g) => ({
      id: g._id,
      groupName: g.name, // match frontend expectation
      projectTitle: g.projectTitle,
      status: g.status,
      progress: g.progress || 0,
      members: g.membersSnapshot.map((m) => m.studentRef?.name || m.name),
      lastUpdate: g.updatedAt ? g.updatedAt.toISOString().split("T")[0] : null,
      nextSeminar: g.nextSeminar
        ? g.nextSeminar.toISOString().split("T")[0]
        : null,
    }));

    res.status(200).json({
      data: {
        groups: formattedGroups,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching guide dashboard:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get all announcements for a guide
 * @route   GET /api/guides/:id/announcements
 * @access  Private (JWT)
 */
export const getGuideAnnouncements = async (req, res) => {
  try {
    const guideId = req.params.id;

    // 1. Fetch guide-specific announcements
    const guideAnnouncements = await GuideAnnouncement.find({
      guides: guideId,
    });

    // 2. Optional: Fetch course announcements if guide teaches any courses
    // Assuming you have guide.courses array or can map guide -> courses
    // const courseAnnouncements = await CourseAnnouncement.find({ courses: { $in: guideCourses } });

    // 3. Optional: Fetch exam schedules if needed
    // const examAnnouncements = await ExamSchedule.find({ course: { $in: guideCourses } });

    // Map GuideAnnouncement to frontend expected format
    const formattedAnnouncements = guideAnnouncements.map((a) => ({
      id: a._id,
      title: a.title,
      content: a.message,
      date: a.date.toISOString().split("T")[0],
      priority: "high", // you can add priority field to schema if needed
    }));

    res.status(200).json({
      data: formattedAnnouncements,
    });
  } catch (error) {
    console.error("Error fetching guide announcements:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get groups for a guide
 * @route   GET /api/guides/:id/groups
 * @access  Private (Guide)
 */
export const getGuideGroups = async (req, res) => {
  try {
    const guideId = req.params.id;

    // Ensure guide exists
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    const groups = await Group.find({ guide: guideId })
      .populate("students", "name email enrollmentNumber")
      .lean();

    const formatted = groups.map((g) => ({
      id: g._id,
      groupName: g.name,
      projectTitle: g.projectTitle || "",
      description: g.projectDescription || "",
      technology: g.projectTechnology || "",
      year: g.year,
      course:
        (Array.isArray(g.membersSnapshot) &&
          g.membersSnapshot[0]?.divisionCourse) ||
        null,
      maxMembers: g.membersSnapshot?.length || 0,
      currentMembers: (g.students || []).length,
      status: g.status,
      startDate: g.createdAt?.toISOString?.().split("T")[0] || null,
      endDate: g.updatedAt?.toISOString?.().split("T")[0] || null,
      members: (g.students || []).map((s) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        enrollmentNumber: s.enrollmentNumber,
      })),
    }));

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Error fetching guide groups:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Create a new group under a guide
 * @route   POST /api/guides/:id/groups
 * @access  Private (Guide)
 */
export const createGroupForGuide = async (req, res) => {
  try {
    const guideId = req.params.id;
    const { groupName, projectTitle, description, maxMembers, year } =
      req.body || {};

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    const created = await Group.create({
      name: groupName,
      guide: guideId,
      projectTitle: projectTitle || "",
      projectDescription: description || "",
      year: year || new Date().getFullYear(),
      status: "In Progress",
    });

    const data = {
      id: created._id,
      groupName: created.name,
      projectTitle: created.projectTitle,
      description: created.projectDescription,
      maxMembers: maxMembers || 0,
      currentMembers: 0,
      status: created.status,
      startDate: created.createdAt?.toISOString?.().split("T")[0] || null,
      members: [],
    };

    res.status(201).json({ data });
  } catch (error) {
    console.error("Error creating group:", error.message);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Group name must be unique" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get a single group under a guide
 * @route   GET /api/guides/:id/groups/:groupId
 * @access  Private (Guide)
 */
export const getGroupByIdForGuide = async (req, res) => {
  try {
    const { id: guideId, groupId } = req.params;

    const group = await Group.findOne({ _id: groupId, guide: guideId })
      .populate("students", "name email enrollmentNumber")
      .lean();
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const data = {
      id: group._id,
      groupName: group.name,
      projectTitle: group.projectTitle || "",
      description: group.projectDescription || "",
      technology: group.projectTechnology || "",
      year: group.year,
      course:
        (Array.isArray(group.membersSnapshot) &&
          group.membersSnapshot[0]?.divisionCourse) ||
        null,
      maxMembers: group.membersSnapshot?.length || 0,
      currentMembers: (group.students || []).length,
      status: group.status,
      startDate: group.createdAt?.toISOString?.().split("T")[0] || null,
      endDate: group.updatedAt?.toISOString?.().split("T")[0] || null,
      members: (group.students || []).map((s) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        enrollmentNumber: s.enrollmentNumber,
      })),
    };

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching group by id:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Update a group under a guide
 * @route   PUT /api/guides/:id/groups/:groupId
 * @access  Private (Guide)
 */
export const updateGroupForGuide = async (req, res) => {
  try {
    const { id: guideId, groupId } = req.params;
    const updates = {};
    const { groupName, projectTitle, description, status } = req.body || {};

    if (groupName !== undefined) updates.name = groupName;
    if (projectTitle !== undefined) updates.projectTitle = projectTitle;
    if (description !== undefined) updates.projectDescription = description;
    if (status !== undefined) updates.status = status;

    const updated = await Group.findOneAndUpdate(
      { _id: groupId, guide: guideId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const data = {
      id: updated._id,
      groupName: updated.name,
      projectTitle: updated.projectTitle || "",
      description: updated.projectDescription || "",
      maxMembers: updated.membersSnapshot?.length || 0,
      currentMembers: (updated.students || []).length,
      status: updated.status,
      startDate: updated.createdAt?.toISOString?.().split("T")[0] || null,
      endDate: updated.updatedAt?.toISOString?.().split("T")[0] || null,
      members: [],
    };

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error updating group:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Delete a group under a guide
 * @route   DELETE /api/guides/:id/groups/:groupId
 * @access  Private (Guide)
 */
export const deleteGroupForGuide = async (req, res) => {
  try {
    const { id: guideId, groupId } = req.params;
    const deleted = await Group.findOneAndDelete({
      _id: groupId,
      guide: guideId,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }
    res.status(200).json({ data: { message: "Group deleted successfully" } });
  } catch (error) {
    console.error("Error deleting group:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// The logic for listing groups and getting a group by ID is already in guideController.js,
// but the guidePanelRoutes re-used them by setting req.params.id.
// We'll create wrapper functions here for clarity in the routes file.

/**
 * GET /api/guide-panel/groups - list groups for current guide
 */
// ----------------------------------------------------------------------
// List all groups for the logged-in guide (with member IDs populated)
// ----------------------------------------------------------------------
export const listGuidePanelGroups = async (req, res) => {
  try {
    const guideId = req.guide._id.toString();

    const groups = await Group.find({ guide: guideId })
      .populate({
        path: "students",
        select: "_id name email enrollmentNumber phone",
        model: Student,
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error listing guide-panel groups:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while listing groups.",
    });
  }
};

/**
 * GET /api/guide-panel/groups/:groupId - group details for current guide
 */
// ----------------------------------------------------------------------
// Get full details of one group (with member IDs populated)
// ----------------------------------------------------------------------

// ✅ FINAL FIX: Always populate `students` properly with real MongoDB IDs
export const getGuidePanelGroupDetails = async (req, res) => {
  try {
    const guideId = req.guide._id.toString();

    const group = await Group.findOne({ guide: guideId })
      .populate({
        path: "students",
        model: Student,
        select: "_id name email enrollmentNumber phone",
      })
      .lean();

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "No group found for this guide.",
      });
    }

    // ✅ For frontend consistency
    group.members = group.students?.map((student) => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      enrollmentNumber: student.enrollmentNumber,
      phone: student.phone,
    }));

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error getting guide-panel group details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching group details.",
    });
  }
};

/**
 * PUT /api/guide-panel/groups/:groupId/details - update project details and members
 */
export const updateGroupDetailsAndMembers = async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { groupId } = req.params;
    const {
      projectTitle,
      projectDescription,
      year,
      technology,
      members = [], // array of student ids
      proposalPdf,
    } = req.body || {};

    const group = await Group.findOne({ _id: groupId, guide: guideId });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // --- START: Corrected Member Update Logic ---
    if (Array.isArray(members)) {
      // 1. Member Count Validation
      if (members.length < 3 || members.length > 4) {
        return res
          .status(400)
          .json({ success: false, message: "Group must have 3-4 members" });
      }

      // 2. Validate all students exist and fetch their current group status
      const students = await Student.find({ _id: { $in: members } });
      if (students.length !== members.length) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid student list" });
      }

      // 3. **CRITICAL FIX**: Ensure students are not assigned to *another* group.
      // Filter for students whose 'group' field is set, AND that group ID is NOT the current group ID.
      const conflicting = students.filter(
        (s) => s.group && s.group.toString() !== group._id.toString()
      );

      if (conflicting.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some students are already assigned to another group",
        });
      }

      // 4. Detach current students previously in this group but not in new list
      await Student.updateMany(
        { group: group._id, _id: { $nin: members } },
        { $set: { group: null } }
      );

      // 5. Attach new/existing students to this group (safe because conflicts were checked)
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
    // --- END: Corrected Member Update Logic ---

    // Update Project Details (regardless of member changes)
    if (projectTitle !== undefined) group.projectTitle = projectTitle;
    if (projectDescription !== undefined)
      group.projectDescription = projectDescription;
    if (technology !== undefined) group.projectTechnology = technology;
    if (year !== undefined) group.year = year;
    if (proposalPdf !== undefined) group.proposalPdf = proposalPdf;

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
        proposalPdf: populated.proposalPdf || null,
        projectApprovalStatus: populated.projectApprovalStatus,
        rejectionReason: populated.rejectionReason || null,
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
};

/**
 * @desc    List project proposals assigned to the current guide
 *          Mirrors groups but surfaces proposal/approval fields prominently
 * @route   GET /api/guide-panel/project-approvals
 * @access  Private (Guide)
 */
export const listProjectApprovalsForGuide = async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const groups = await Group.find({ guide: guideId })
      .populate("students", "name email enrollmentNumber")
      .lean();

    const data = groups.map((g) => ({
      id: g._id,
      title: g.projectTitle || "",
      description: g.projectDescription || "",
      technology: g.projectTechnology || "",
      status: g.status,
      projectApprovalStatus: g.projectApprovalStatus,
      rejectionReason: g.rejectionReason || null,
      assignedGroup: g.name,
      proposalPdf: g.proposalPdf || null,
      members: (g.students || []).map((s) => ({
        id: s._id,
        name: s.name,
        role: "Member",
      })),
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error listing project approvals:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Approve a project's proposal
 * @route   PUT /api/guide-panel/project-approvals/:groupId/approve
 * @access  Private (Guide)
 */
export const approveProjectProposal = async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { groupId } = req.params;
    const group = await Group.findOne({ _id: groupId, guide: guideId });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }
    group.projectApprovalStatus = "Approved";
    group.rejectionReason = undefined;
    await group.save();
    return res.status(200).json({
      data: {
        id: group._id,
        projectApprovalStatus: group.projectApprovalStatus,
      },
    });
  } catch (error) {
    console.error("Error approving project:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Reject a project's proposal with reason
 * @route   PUT /api/guide-panel/project-approvals/:groupId/reject
 * @access  Private (Guide)
 */
export const rejectProjectProposal = async (req, res) => {
  try {
    const guideId = req.guide._id.toString();
    const { groupId } = req.params;
    const { reason = "" } = req.body || {};
    if (!reason.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    }
    const group = await Group.findOne({ _id: groupId, guide: guideId });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }
    group.projectApprovalStatus = "Rejected";
    group.rejectionReason = reason;
    await group.save();
    return res.status(200).json({
      data: {
        id: group._id,
        projectApprovalStatus: group.projectApprovalStatus,
        rejectionReason: group.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Error rejecting project:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/guide-panel/students/search?enrollment=123
 */
export const searchStudentsByEnrollment = async (req, res) => {
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
};

/**
 * GET /api/guide-panel/groups/:groupId/available-students
 */
export const getAvailableStudentsForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({ _id: groupId, guide: req.guide._id });
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // Available students are those who are unassigned (group: null) OR already in the current group
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
};
