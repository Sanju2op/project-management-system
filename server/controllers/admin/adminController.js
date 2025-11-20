// server/controllers/admin/adminController.js
// import sendEmail from "../../services/emailService.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { sendEmail } from "../../services/emailService.js";
import Admin from "../../models/admin.js";
import Guide from "../../models/guide.js";
import Group from "../../models/group.js";
import Division from "../../models/division.js";
import Student from "../../models/student.js";
import EvaluationParameter from "../../models/evaluationParameter.js";
import CourseAnnouncement from "../../models/courseAnnouncement.js";
import ExamSchedule from "../../models/examSchedule.js";
import GuideAnnouncement from "../../models/guideAnnouncement.js";
import ProjectEvaluation from "../../models/projectEvaluation.js";
import SystemSetting from "../../models/SystemSetting.js";

const generateToken = (id) => {
  return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin registration (optional for first seed)
export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ email, password });

    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// OTP Generations & Change Password

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Forgot Password - send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await admin.save();

    await sendEmail(admin.email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Reset Password with OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = newPassword;
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select(
      "-password -otp -otpExpiry"
    );
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is already taken by another admin
    if (email) {
      const existingAdmin = await Admin.findOne({
        email,
        _id: { $ne: req.admin.id },
      });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save();

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Change Password (while logged in)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await admin.matchPassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find().select("-password -otp -otpExpiry");
    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (error) {
    console.error("Error fetching guides:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch guides",
    });
  }
};

export const createGuide = async (req, res) => {
  try {
    const { name, expertise, email, phone, password } = req.body;

    if (!name || !expertise || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Check if guide already exists
    const existingGuide = await Guide.findOne({ email });
    if (existingGuide) {
      return res.status(409).json({
        success: false,
        message: "Guide already exists with this email",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newGuide = await Guide.create({
      name,
      expertise,
      email,
      phone: phone || null,
      password: hashedPassword,
      status: "approved",
    });

    // Send welcome email with credentials
    try {
      await sendEmail({
        to: newGuide.email,
        type: "GUIDE_CREDENTIALS",
        data: {
          name: newGuide.name,
          email: newGuide.email,
          tempPassword: password,
        },
      });
    } catch (emailErr) {
      console.error("⚠️ Failed to send guide credentials:", emailErr.message);
      // You could optionally notify admin here
    }

    res.status(201).json({
      success: true,
      message: "Guide created successfully",
      data: {
        id: newGuide._id,
        name: newGuide.name,
        email: newGuide.email,
        expertise: newGuide.expertise,
      },
    });
  } catch (error) {
    console.error("❌ Error creating guide:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create guide",
    });
  }
};

export const updateGuideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Validate input
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'",
      });
    }

    // ✅ Find guide
    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    // ✅ Update status
    guide.status = status;
    await guide.save();

    // ✅ (Optional) Send email notification
    try {
      if (status === "approved") {
        await sendEmail({
          to: guide.email,
          type: "GUIDE_APPROVED",
          data: { name: guide.name },
        });
      } else if (status === "rejected") {
        await sendEmail({
          to: guide.email,
          type: "GUIDE_REJECTED",
          data: {
            name: guide.name,
            reason: "Admin's Decision",
          },
        });
      }
    } catch (emailErr) {
      console.error("⚠️ Failed to send status update email:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Guide status updated to '${status}'`,
      data: {
        id: guide._id,
        name: guide.name,
        email: guide.email,
        status: guide.status,
      },
    });
  } catch (error) {
    console.error("❌ Error updating guide status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update guide status",
    });
  }
};

/**
 * @desc   Update a guide's details (Admin only)
 * @route  PUT /api/admin/update-guide/:id
 * @access Private (Admin)
 */
export const updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, expertise, email, phone, isActive } = req.body;

    // 1️⃣ Find guide
    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // 2️⃣ Update fields (only if provided)
    if (name) guide.name = name;
    if (expertise) guide.expertise = expertise;
    if (email) guide.email = email;
    if (phone !== undefined) guide.phone = phone;
    if (isActive !== undefined) guide.isActive = isActive;

    // 3️⃣ Save updated guide
    const updatedGuide = await guide.save();

    res.status(200).json({
      message: "Guide updated successfully",
      guide: updatedGuide,
    });
  } catch (error) {
    console.error("❌ Error updating guide:", error);
    res.status(500).json({ message: "Server error while updating guide" });
  }
};

// Get Active Status guides
export const getActiveGuides = async (req, res) => {
  try {
    const guides = await Guide.find({
      status: "approved",
      isActive: true,
    }).select("-password -otp -otpExpiry"); // exclude sensitive fields

    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (err) {
    console.error("❌ Error fetching active guides:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching active guides",
    });
  }
};

/**
 * GET /api/admin/get-groups?year=2025&course=BCA
 * Fetch groups filtered by year and/or course (optional)
 */
export const getGroupsByYearOrCourse = async (req, res) => {
  try {
    const { year, course } = req.query;

    // Step 1: Filter by year if provided
    const matchStage = {};
    if (year) matchStage.year = Number(year);

    // Step 2: Aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "students",
          localField: "students",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $lookup: {
          from: "guides",
          localField: "guide",
          foreignField: "_id",
          as: "guide",
        },
      },
      { $unwind: { path: "$guide", preserveNullAndEmptyArrays: true } },
    ];

    // Step 3: Filter by course if provided (course prefix in enrollment number)
    if (course) {
      pipeline.push({
        $match: {
          "members.enrollmentNumber": { $regex: `^${course}`, $options: "i" },
        },
      });
    }

    const groups = await Group.aggregate(pipeline);

    // Step 4: Format response for frontend
    const formattedGroups = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      year: g.year,
      projectTitle: g.projectTitle,
      projectDescription: g.projectDescription,
      projectTechnology: g.projectTechnology,
      status: g.status,
      guide: g.guide
        ? {
            _id: g.guide._id,
            name: g.guide.name,
            email: g.guide.email,
            expertise: g.guide.expertise,
            phone: g.guide.phone,
          }
        : null,
      members:
        g.members?.map((m) => ({
          name: m.name || "N/A",
          enrollment: m.enrollmentNumber || m.enrollment || "N/A",
          className: m.className || "N/A",
        })) || [],
    }));

    res.status(200).json({
      success: true,
      count: formattedGroups.length,
      data: formattedGroups,
    });
  } catch (err) {
    console.error("❌ Error fetching groups:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching groups",
    });
  }
};

/**
 * GET /api/admin/get-divisions
 * Fetch all divisions (with optional filters)
 */
export const getDivisions = async (req, res) => {
  try {
    const { course, year, status } = req.query;

    // Build filter dynamically
    const filter = {};
    if (course) filter.course = course;
    if (year) filter.year = Number(year);
    if (status) filter.status = status;

    const divisions = await Division.find(filter)
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      count: divisions.length,
      data: divisions,
    });
  } catch (err) {
    console.error("❌ Error fetching divisions:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching divisions",
    });
  }
};

/**
 * GET /api/admin/get-group/:id
 * Fetch detailed group info by ID
 */
// controllers/admin/adminController.js → getGroupById

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate("guide", "name email expertise phone")
      .populate("division", "course semester year status")
      // YE LINE ADD KAR DE — YE HI TERA FIX HAI
      .populate({
        path: "membersSnapshot",
        populate: {
          path: "studentRef",
          select: "name enrollmentNumber _id",
        },
      })
      .populate("students", "name enrollmentNumber") // fallback
      .exec();

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // membersSnapshot se members bana
    const members =
      group.membersSnapshot.length > 0
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

    const responseData = {
      ...group.toObject(),
      members, // ye hi frontend me jaayega
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (err) {
    console.error("Error fetching group details:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admin/get-available-students
 * Fetch all students who are not currently part of any group
 */
export const getAvailableStudents = async (req, res) => {
  try {
    // Step 1: Find all student IDs already assigned to groups
    const groupedStudents = await Group.find({}, "students").lean();
    const assignedStudentIds = groupedStudents.flatMap((g) => g.students);

    // Step 2: Query students not in that list
    const availableStudents = await Student.find({
      _id: { $nin: assignedStudentIds },
    })
      .populate("division", "course semester year status")
      .select("name enrollmentNumber division isRegistered")
      .exec();

    res.status(200).json({
      success: true,
      count: availableStudents.length,
      data: availableStudents,
    });
  } catch (err) {
    console.error("❌ Error fetching available students:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching available students",
    });
  }
};

/**
 * GET /api/admin/get-students-by-group/:id
 * Fetch all students in a specific group
 */
export const getStudentsByGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the group and populate students
    const group = await Group.findById(id)
      .populate("students", "name enrollmentNumber division isRegistered")
      .populate("division", "course semester year")
      .exec();

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      groupId: group._id,
      groupName: group.name,
      division: group.division,
      studentCount: group.students.length,
      students: group.students,
    });
  } catch (err) {
    console.error("❌ Error fetching students by group:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching students by group",
    });
  }
};

/**
 * DELETE /api/admin/delete-group/:id
 * Delete a group
 */
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting group:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting group",
    });
  }
};

// GET /api/admin/groups/:id/students/available (group-specific, filtered by division)
export const getAvailableStudentsForGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find the group with its division populated
    const group = await Group.findById(id).populate("division");
    if (!group || !group.division) {
      return res.status(404).json({
        success: false,
        message: "Group or division not found",
      });
    }

    const { course, semester, year } = group.division;

    // 2️⃣ Find all groups in the same division
    const groupsInSameDivision = await Group.find({
      division: group.division._id,
    }).select("students");

    // 3️⃣ Collect student IDs already assigned
    const assignedIds = groupsInSameDivision.flatMap((g) =>
      g.students.map((s) => s.toString())
    );

    // 4️⃣ Fetch unassigned students from this same division
    const availableStudents = await Student.find({
      _id: { $nin: assignedIds },
      division: group.division._id,
    })
      .populate("division", "course semester year")
      .select("name enrollmentNumber division");

    res.status(200).json({
      success: true,
      count: availableStudents.length,
      data: availableStudents.map((s) => ({
        _id: s._id,
        name: s.name,
        enrollmentNumber: s.enrollmentNumber,
        className: `${course} ${semester}`,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching available students:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching available students",
    });
  }
};

// GET /api/admin/get-groups (with course, semester, year filters)
export const getGroups = async (req, res) => {
  try {
    const { course, semester, year } = req.query;

    // ------------------------------
    // BUILD FILTER FOR GROUPS
    // ------------------------------
    const filter = {};
    if (year) filter.year = Number(year);

    // Division-based filters (course + semester)
    const divisionFilter = {};
    if (course) divisionFilter.course = course;
    if (semester) divisionFilter.semester = Number(semester);

    // Fetch divisions if course/semester filter exists
    let divisionIds = null;
    if (course || semester) {
      const divisions = await Division.find(divisionFilter).select("_id");
      divisionIds = divisions.map((d) => d._id);
      filter.division = { $in: divisionIds };
    }

    // ------------------------------
    // FETCH GROUPS WITH POPULATES
    // ------------------------------
    const groups = await Group.find(filter)
      .populate("guide", "name email expertise phone")
      .populate("division", "course semester year")
      .populate("students", "name enrollmentNumber division")
      .exec();

    // ------------------------------
    // FORMAT RESPONSE
    // ------------------------------
    const formattedGroups = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      year: g.year,
      projectTitle: g.projectTitle,
      projectDescription: g.projectDescription,
      projectTechnology: g.projectTechnology,
      status: g.status,

      guide: g.guide
        ? {
            _id: g.guide._id,
            name: g.guide.name,
            email: g.guide.email,
            expertise: g.guide.expertise,
            phone: g.guide.phone,
          }
        : null,

      // MEMBERS
      members:
        g.membersSnapshot.length > 0
          ? g.membersSnapshot.map((m) => ({
              name: m.name,
              enrollment: m.enrollmentNumber,
              className: `${m.divisionCourse} ${m.divisionSemester}`,
            }))
          : g.students.map((s) => ({
              name: s.name,
              enrollment: s.enrollmentNumber,
              className: `${s.division?.course || ""} ${
                s.division?.semester || ""
              }`,
            })),

      // DIVISION INCLUDED HERE
      division: g.division
        ? {
            _id: g.division._id,
            course: g.division.course,
            semester: g.division.semester,
            year: g.division.year,
          }
        : null,
    }));

    // ------------------------------
    // FINAL RESPONSE
    // ------------------------------
    res.status(200).json({
      success: true,
      count: formattedGroups.length,
      data: formattedGroups,
    });
  } catch (err) {
    console.error("❌ Error fetching groups:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching groups" });
  }
};

// Fix: PUT /api/admin/update-group/:id (handle guide change and members add/remove properly)
// ✅ PUT /api/admin/update-group/:id
// Add or remove students from group, and update membersSnapshot
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { guideId, addStudentIds = [], removeStudentId } = req.body;

    // 1️⃣ Find the group and populate related data
    const group = await Group.findById(id)
      .populate("students", "name enrollmentNumber division")
      .populate("division", "course semester year");

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // 2️⃣ Handle guide change
    if (guideId) {
      group.guide = guideId;
    }

    // 3️⃣ Handle adding new students
    // 3️⃣ Handle adding new students
    if (Array.isArray(addStudentIds) && addStudentIds.length > 0) {
      const currentIds = group.students.map((s) => s._id.toString());
      const uniqueNewIds = addStudentIds.filter(
        (id) => !currentIds.includes(id)
      );

      const newStudents = await Student.find({
        _id: { $in: uniqueNewIds },
      }).populate("division", "course semester");

      const currentCount = group.students.length;
      const totalAfterAdd = currentCount + newStudents.length;

      // ✅ Default max = 4
      if (totalAfterAdd > 4) {
        // allow admin override up to 5
        if (totalAfterAdd > 5) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot exceed 5 members total. (4 normal + 1 admin override)",
          });
        } else {
          console.log(
            "⚠️ Admin override: Adding 5th member to group:",
            group.name
          );
        }
      }

      // Add to group
      group.students.push(...newStudents.map((s) => s._id));

      // Add to membersSnapshot, marking 5th as override
      group.membersSnapshot.push(
        ...newStudents.map((s, idx) => ({
          studentRef: s._id,
          enrollmentNumber: s.enrollmentNumber,
          name: s.name,
          joinedAt: new Date(),
          divisionCourse: s.division.course,
          divisionSemester: s.division.semester,
          override: totalAfterAdd > 4 ? true : false, // ⚠️ mark as override
        }))
      );
    }

    // 4️⃣ Handle removing a student

    // 4️⃣ Handle removing a student (handles ObjectId, object, or string)
    if (removeStudentId) {
      const removeIdStr = removeStudentId.toString();
      console.log("🧾 Removing student ID:", removeIdStr);

      // 🔸 Normalize IDs before filtering
      const normalizeId = (id) => {
        if (!id) return null;
        if (typeof id === "string") return id;
        if (id._id) return id._id.toString();
        return id.toString();
      };

      // 🔹 Filter from students array
      const beforeStudents = group.students.length;
      group.students = group.students.filter(
        (sid) => normalizeId(sid) !== removeIdStr
      );
      console.log(
        "📉 Students reduced:",
        beforeStudents,
        "→",
        group.students.length
      );

      // 🔹 Filter from membersSnapshot
      const beforeSnapshot = group.membersSnapshot.length;
      group.membersSnapshot = group.membersSnapshot.filter(
        (m) => normalizeId(m.studentRef) !== removeIdStr
      );
      console.log(
        "📉 Snapshot reduced:",
        beforeSnapshot,
        "→",
        group.membersSnapshot.length
      );

      // 🔹 Unlink student record
      await Student.findByIdAndUpdate(removeStudentId, { group: null });
    }

    // 5️⃣ Save changes
    await group.save();
    await group.populate("guide", "name email expertise phone");
    await group.populate("students", "name enrollmentNumber division");

    // 6️⃣ Return updated group data
    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: {
        _id: group._id,
        name: group.name,
        guide: group.guide,
        year: group.year,
        projectTitle: group.projectTitle,
        members: group.students.map((s) => ({
          _id: s._id,
          name: s.name,
          enrollment: s.enrollmentNumber,
          className: `${s.division.course} ${s.division.semester}`,
        })),
      },
    });
  } catch (err) {
    console.error("❌ Error updating group:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating group",
    });
  }
};

/**
 * @route   GET /api/admin/get-evaluation-params
 * @desc    Fetch all evaluation parameters
 * @access  Private (Admin only)
 */
export const getEvaluationParams = async (req, res) => {
  try {
    const params = await EvaluationParameter.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: params.length,
      data: params,
    });
  } catch (error) {
    console.error("❌ Error fetching evaluation parameters:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching evaluation parameters",
    });
  }
};

/**
 * @route   PUT /api/admin/update-evaluation-param/:id
 * @desc    Update an existing evaluation parameter
 * @access  Private (Admin only)
 */
export const updateEvaluationParam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, marks } = req.body;

    // Validate basic fields
    if (!name || !description || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, marks) are required.",
      });
    }

    const updatedParam = await EvaluationParameter.findByIdAndUpdate(
      id,
      { name, description, marks },
      { new: true, runValidators: true }
    );

    if (!updatedParam) {
      return res.status(404).json({
        success: false,
        message: "Evaluation parameter not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Evaluation parameter updated successfully.",
      data: updatedParam,
    });
  } catch (error) {
    console.error("❌ Error updating evaluation parameter:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating evaluation parameter.",
    });
  }
};

/**
 * @route   POST /api/admin/add-evaluation-param
 * @desc    Add a new evaluation parameter
 * @access  Private (Admin only)
 */
export const addEvaluationParam = async (req, res) => {
  try {
    const { name, description, marks } = req.body;

    // Validate fields
    if (!name || !description || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, marks) are required.",
      });
    }

    // Create new evaluation parameter
    const newParam = new EvaluationParameter({
      name,
      description,
      marks,
    });

    await newParam.save();

    res.status(201).json({
      success: true,
      message: "Evaluation parameter added successfully.",
      data: newParam,
    });
  } catch (error) {
    console.error("❌ Error adding evaluation parameter:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding evaluation parameter.",
    });
  }
};

/**
 * @route   DELETE /api/admin/delete-evaluation-param/:id
 * @desc    Delete an evaluation parameter by ID
 * @access  Private (Admin only)
 */
export const deleteEvaluationParam = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID is required.",
      });
    }

    const deletedParam = await EvaluationParameter.findByIdAndDelete(id);

    if (!deletedParam) {
      return res.status(404).json({
        success: false,
        message: "Evaluation parameter not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Evaluation parameter '${deletedParam.name}' deleted successfully.`,
      data: deletedParam,
    });
  } catch (error) {
    console.error("❌ Error deleting evaluation parameter:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting evaluation parameter.",
    });
  }
};

/**
 * @desc   Get all student enrollment numbers (and optionally other info)
 * @route  GET /api/admin/get-student-enrollments
 * @access Private (Admin)
 */
export const getStudentEnrollments = async (req, res) => {
  try {
    // Fetch all students (you can filter here if needed later)
    const students = await Student.find(
      {},
      "enrollmentNumber name division group isRegistered"
    ).populate("division", "course semester year");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    console.error("❌ Error fetching student enrollments:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student enrollments",
    });
  }
};

/**
 * @desc   Update division status (active/inactive)
 * @route  PATCH /api/admin/update-division-status/:id
 * @access Private (Admin)
 */
export const updateDivisionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const { status } = req.body;

    // Validate status
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'active' or 'inactive'.",
      });
    }

    const updatedDivision = await Division.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedDivision) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Division status updated to '${status}' successfully`,
      data: updatedDivision,
    });
  } catch (err) {
    console.error("❌ Error updating division status:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating division status",
    });
  }
};

/**
 * @desc    Add a new Division
 * @route   POST /api/admin/add-division
 * @access  Private (Admin)
 */
export const addDivision = async (req, res) => {
  try {
    const { course, semester, year, status } = req.body;

    // Validate required fields
    if (!course || !semester || !year) {
      return res.status(400).json({
        success: false,
        message: "Course, semester, and year are required",
      });
    }

    // Optional: validate status
    const validStatuses = ["active", "inactive"];
    const divisionStatus = status?.toLowerCase() || "active";
    if (!validStatuses.includes(divisionStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'inactive'.",
      });
    }

    // Create Division
    const newDivision = await Division.create({
      course,
      semester,
      year,
      status: divisionStatus,
    });

    res.status(201).json({
      success: true,
      message: "Division added successfully",
      data: newDivision,
    });
  } catch (err) {
    console.error("❌ Error adding division:", err.message);

    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Division with same course, semester, and year already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while adding division",
    });
  }
};

/**
 * @desc    Delete a division by ID
 * @route   DELETE /api/admin/delete-division/:id
 * @access  Private (Admin)
 */
export const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDivision = await Division.findByIdAndDelete(id);

    if (!deletedDivision) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Division deleted successfully",
      data: deletedDivision,
    });
  } catch (err) {
    console.error("❌ Error deleting division:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting division",
    });
  }
};

/**
 * @desc    Generate student enrollments for a division
 * @route   POST /api/admin/generate-enrollments
 * @access  Private (Admin)
 */
export const generateEnrollments = async (req, res) => {
  try {
    const { divisionId, start, end } = req.body;

    // 1️⃣ Validate payload
    if (!divisionId || start == null || end == null) {
      return res.status(400).json({
        success: false,
        message: "divisionId, start, and end are required",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start value must be less than end value",
      });
    }

    // 2️⃣ Check division existence
    const division = await Division.findById(divisionId);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    // 3️⃣ Generate enrollment numbers
    const generatedStudents = [];
    const skippedEnrollments = [];

    for (let i = start; i <= end; i++) {
      const rollStr = String(i).padStart(3, "0");
      const enrollmentNumber = `${division.course}${division.year}${division.semester}${rollStr}`;

      // Check if enrollment already exists
      const exists = await Student.findOne({ enrollmentNumber });
      if (exists) {
        skippedEnrollments.push(enrollmentNumber);
        continue;
      }

      generatedStudents.push({
        enrollmentNumber,
        name: `Student ${rollStr}`,
        division: division._id,
        isRegistered: false,
      });
    }

    // 4️⃣ Bulk insert
    if (generatedStudents.length > 0) {
      await Student.insertMany(generatedStudents);
    }

    // 5️⃣ Respond
    res.status(201).json({
      success: true,
      message: `Generated ${generatedStudents.length} enrollments successfully`,
      created: generatedStudents.length,
      skipped: skippedEnrollments.length,
      skippedEnrollments,
    });
  } catch (err) {
    console.error("❌ Error generating enrollments:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while generating enrollments",
    });
  }
};

/**
 * @desc   Get all enrollments (students) for a specific division
 * @route  GET /api/admin/get-enrollment-by-division/:id
 * @access Private (Admin)
 */
export const getEnrollmentsByDivision = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate Division ID
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    const students = await Student.find({ division: id })
      .populate("division", "course semester year status")
      .select("enrollmentNumber name email phone isRegistered createdAt")
      .lean(); // convert mongoose docs to plain objects for easy mapping

    // 🧠 Format enrollmentNumber here
    const formattedStudents = students.map((student) => ({
      enrollmentNumber: student.enrollmentNumber.replace(/-/g, ""), // remove all "-"
      name: student.name,
      email: student.email,
      phone: student.phone,
      status: student.isRegistered,
      createdAt: student.createdAt,
    }));

    // 3️⃣ Return results
    res.status(200).json({
      success: true,
      count: formattedStudents.length,
      division: {
        id: division._id,
        course: division.course,
        semester: division.semester,
        year: division.year,
      },
      data: formattedStudents,
    });
  } catch (err) {
    console.error("❌ Error fetching enrollments by division:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrollments",
    });
  }
};

/**
 * @desc   Remove a student by ID
 * @route  DELETE /api/admin/remove-student/:id
 * @access Private (Admin)
 */
export const removeStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // 2️⃣ Check if student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 3️⃣ Delete the student
    await Student.findByIdAndDelete(id);

    // 4️⃣ Respond
    res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.enrollmentNumber}) removed successfully`,
    });
  } catch (err) {
    console.error("❌ Error removing student:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while removing student",
    });
  }
};

/**
 * @desc   Remove all students under a specific division
 * @route  DELETE /api/admin/remove-all-students/:id
 * @access Private (Admin)
 */
export const removeAllStudentsByDivision = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid division ID",
      });
    }

    // 2️⃣ Check if division exists
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    // 3️⃣ Count students before deletion
    const count = await Student.countDocuments({ division: id });
    if (count === 0) {
      return res.status(200).json({
        success: true,
        message: "No students found in this division",
        deletedCount: 0,
      });
    }

    // 4️⃣ Delete all students in this division
    const result = await Student.deleteMany({ division: id });

    // 5️⃣ Respond with summary
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} students from division ${division.course}-${division.semester}-${division.year}`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Error removing students by division:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting students",
    });
  }
};

/**
 * @desc   Add a single student enrollment to a division
 * @route  POST /api/admin/add-student-enrollment
 * @access Private (Admin)
 */
export const addStudentEnrollment = async (req, res) => {
  try {
    const { divisionId, enrollmentNumber, name, email, phone, isRegistered } =
      req.body;

    // 1️⃣ Validate input
    if (!divisionId || !enrollmentNumber) {
      return res.status(400).json({
        success: false,
        message: "divisionId, enrollmentNumber, and name are required.",
      });
    }

    // 2️⃣ Validate division existence
    const division = await Division.findById(divisionId);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found.",
      });
    }

    // 3️⃣ Check if enrollment number already exists
    const existingStudent = await Student.findOne({ enrollmentNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number already exists.",
      });
    }

    // 4️⃣ Create new student enrollment
    const student = await Student.create({
      enrollmentNumber,
      name,
      email,
      phone,
      division: divisionId,
      isRegistered: isRegistered || false,
    });

    // 5️⃣ Return success
    res.status(201).json({
      success: true,
      message: "Student enrollment added successfully.",
      data: student,
    });
  } catch (err) {
    console.error("❌ Error adding student enrollment:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding student enrollment.",
    });
  }
};

/**
 * @desc   Get exam schedules for a course
 * @route  GET /api/admin/exam-schedules
 * @access Private (Admin)
 */
export const getExamSchedules = async (req, res) => {
  try {
    const { course } = req.query;

    // If course is "All", fetch all schedules
    const filter = course && course !== "All" ? { course } : {};

    const schedules = await ExamSchedule.find(filter).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (err) {
    console.error("❌ Error fetching exam schedules:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching exam schedules",
    });
  }
};

/**
 * @desc   Get all course announcements
 * @route  GET /api/admin/course-announcements
 * @access Private (Admin)
 */
export const getCourseAnnouncements = async (req, res) => {
  try {
    const announcements = await CourseAnnouncement.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (err) {
    console.error("❌ Error fetching course announcements:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course announcements",
    });
  }
};

/**
 * @desc   Get all guide announcements
 * @route  GET /api/admin/guide-announcements
 * @access Private (Admin)
 */
export const getGuideAnnouncements = async (req, res) => {
  try {
    const announcements = await GuideAnnouncement.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (err) {
    console.error("❌ Error fetching guide announcements:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching guide announcements",
    });
  }
};

/**
 * @desc   Add a new exam schedule
 * @route  POST /api/admin/exam-schedules
 * @access Private (Admin)
 */
export const addExamSchedule = async (req, res) => {
  try {
    const { course, type, description, date, time } = req.body;

    // Validate required fields
    if (!course || !type || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "Course, type, description, and date are required",
      });
    }

    if (!["Exam", "Submission"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'Exam' or 'Submission'",
      });
    }

    const newSchedule = await ExamSchedule.create({
      course,
      type,
      description,
      date,
      time: time || "",
    });

    res.status(201).json({
      success: true,
      message: "Exam schedule created successfully",
      data: newSchedule,
    });
  } catch (err) {
    console.error("❌ Error creating exam schedule:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating exam schedule",
    });
  }
};

/**
 * @desc   Update an existing exam schedule
 * @route  PUT /api/admin/exam-schedules/:id
 * @access Private (Admin)
 */
export const updateExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { course, type, description, date, time } = req.body;

    // Validate required fields
    if (!course || !type || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "Course, type, description, and date are required",
      });
    }

    if (!["Exam", "Submission"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'Exam' or 'Submission'",
      });
    }

    // Find and update
    const updatedSchedule = await ExamSchedule.findByIdAndUpdate(
      id,
      { course, type, description, date, time: time || "" },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exam schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (err) {
    console.error("❌ Error updating exam schedule:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating exam schedule",
    });
  }
};

/**
 * @desc   Delete an exam schedule by ID
 * @route  DELETE /api/admin/exam-schedules/:id
 * @access Private (Admin)
 */
export const deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete
    const deletedSchedule = await ExamSchedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exam schedule deleted successfully",
      data: deletedSchedule,
    });
  } catch (err) {
    console.error("❌ Error deleting exam schedule:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting exam schedule",
    });
  }
};

/**
 * @desc   Add a new course announcement
 * @route  POST /api/admin/course-announcements
 * @access Private (Admin)
 */
export const addCourseAnnouncement = async (req, res) => {
  try {
    const { title, message, date, courses } = req.body;

    // Validate required fields
    if (!title || !message || !date || !courses || !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: "Title, message, date, and courses array are required",
      });
    }

    const newAnnouncement = await CourseAnnouncement.create({
      title,
      message,
      date,
      courses,
    });

    res.status(201).json({
      success: true,
      message: "Course announcement added successfully",
      data: newAnnouncement,
    });
  } catch (err) {
    console.error("❌ Error adding course announcement:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding course announcement",
    });
  }
};

/**
 * @desc   Update a course announcement by ID
 * @route  PUT /api/admin/course-announcements/:id
 * @access Private (Admin)
 */
export const updateCourseAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, date, courses } = req.body;

    // Validate required fields
    if (!title || !message || !date || !courses || !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: "Title, message, date, and courses array are required",
      });
    }

    const updatedAnnouncement = await CourseAnnouncement.findByIdAndUpdate(
      id,
      { title, message, date, courses },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Course announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (err) {
    console.error("❌ Error updating course announcement:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating course announcement",
    });
  }
};

/**
 * @desc   Delete a course announcement by ID
 * @route  DELETE /api/admin/course-announcements/:id
 * @access Private (Admin)
 */
export const deleteCourseAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await CourseAnnouncement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Course announcement not found",
      });
    }

    await announcement.deleteOne(); // Remove the document

    res.status(200).json({
      success: true,
      message: "Course announcement deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting course announcement:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting course announcement",
    });
  }
};

/**
 * @desc   Add a new guide announcement
 * @route  POST /api/admin/guide-announcements
 * @access Private (Admin)
 */
export const addGuideAnnouncement = async (req, res) => {
  try {
    const { title, message, date, guides } = req.body;

    // Validate input
    if (!title || !message || !date || !guides || !Array.isArray(guides)) {
      return res.status(400).json({
        success: false,
        message: "Title, message, date and guides array are required",
      });
    }

    const announcement = await GuideAnnouncement.create({
      title,
      message,
      date,
      guides,
    });

    res.status(201).json({
      success: true,
      message: "Guide announcement added successfully",
      data: announcement,
    });
  } catch (err) {
    console.error("❌ Error adding guide announcement:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding guide announcement",
    });
  }
};

/**
 * @desc   Update a guide announcement by ID
 * @route  PUT /api/admin/guide-announcements/:id
 * @access Private (Admin)
 */
export const updateGuideAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, date, guides } = req.body;

    // Validate input
    if (!title || !message || !date || !guides || !Array.isArray(guides)) {
      return res.status(400).json({
        success: false,
        message: "Title, message, date and guides array are required",
      });
    }

    const updatedAnnouncement = await GuideAnnouncement.findByIdAndUpdate(
      id,
      { title, message, date, guides },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Guide announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Guide announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (err) {
    console.error("❌ Error updating guide announcement:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating guide announcement",
    });
  }
};

// DELETE: Remove a guide by ID
export const deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // Optional: If guides have related data (like groups, projects), handle that here.

    await Guide.findByIdAndDelete(id);

    // 🔔 Create notification for admin dashboard
    try {
      await Notification.create({
        type: "guide",
        message: `Guide "${guide.name}" has been deleted.`,
        isRead: false,
      });
    } catch (notifErr) {
      console.warn("Failed to create notification:", notifErr.message);
    }

    res
      .status(200)
      .json({ success: true, message: "Guide deleted successfully" });
  } catch (error) {
    console.error("Error deleting guide:", error);
    res
      .status(500)
      .json({ message: "Failed to delete guide", error: error.message });
  }
};

/**
 * @desc   Delete a guide announcement by ID
 * @route  DELETE /api/admin/guide-announcements/:id
 * @access Private (Admin)
 */
export const deleteGuideAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Use findByIdAndDelete directly
    const deletedAnnouncement = await GuideAnnouncement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Guide announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Guide announcement deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting guide announcement:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting guide announcement",
    });
  }
};

/**
 * @desc   Get all project evaluations
 * @route  GET /api/admin/get-project-evaluations
 * @access Private (Admin)
 */
export const getProjectEvaluations = async (req, res) => {
  try {
    const evaluations = await ProjectEvaluation.find()
      .populate("projectId", "name projectTitle") // group info
      .populate("parameterId", "name description marks") // parameter info
      .populate("evaluatedBy", "name email") // admin info
      .populate("studentId", "name enrollmentNumber email")

      .exec();

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (err) {
    console.error("❌ Error fetching project evaluations:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching project evaluations",
    });
  }
};

// controllers/admin/adminController.js

// controllers/admin/adminController.js

// controllers/admin/adminController.js

export const updateProjectEvaluation = async (req, res) => {
  try {
    const { groupId, parameterId, studentId } = req.params;
    const { marks } = req.body;

    console.log("SAVE REQUEST:", { groupId, parameterId, studentId, marks });

    const evaluation = await ProjectEvaluation.findOneAndUpdate(
      {
        projectId: groupId,
        studentId: studentId,
        parameterId: parameterId,
      },
      { marks: Number(marks) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate("studentId", "name enrollmentNumber")
      .populate("parameterId", "name marks");

    if (!evaluation) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    console.log("SAVED IN DB:", evaluation);
    res.json({ success: true, data: evaluation });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a group's details (Admin or internal route)
 * @route  PUT /api/groups/:id
 * @access Private
 */
export const updateGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      guide,
      members,
      projectTitle,
      projectDescription,
      projectTechnology,
      status,
    } = req.body;

    // 1️⃣ Find group first
    const group = await Group.findById(id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }

    // 2️⃣ Handle guide change (if provided)
    if (guide && guide.toString() !== group.guide?.toString()) {
      const newGuide = await Guide.findById(guide);
      if (!newGuide || !newGuide.isActive) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive guide.",
        });
      }

      // Remove group from old guide (if exists)
      if (group.guide) {
        await Guide.findByIdAndUpdate(group.guide, {
          $pull: { assignedGroups: group._id },
        });
      }

      // Add group to new guide
      await Guide.findByIdAndUpdate(guide, {
        $addToSet: { assignedGroups: group._id },
      });

      group.guide = guide;
    }

    // 3️⃣ Handle members update (if provided)
    if (members) {
      if (!Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          message: "Members must be an array.",
        });
      }

      if (members.length < 3 || members.length > 4) {
        return res.status(400).json({
          success: false,
          message: "Group must have between 3 and 4 members.",
        });
      }

      const resolvedMembers = [];
      for (const member of members) {
        let enrollmentId;

        if (typeof member === "string") {
          // assume it's an ObjectId
          enrollmentId = member;
        } else if (member.enrollment || member.enrollmentNumber) {
          const enrollmentNum = member.enrollment || member.enrollmentNumber;
          const enrollment = await Student.findOne({
            enrollmentNumber: enrollmentNum,
          });
          if (!enrollment) {
            return res.status(400).json({
              success: false,
              message: `Enrollment ${enrollmentNum} not found.`,
            });
          }
          if (!enrollment.isRegistered) {
            return res.status(400).json({
              success: false,
              message: `Student ${enrollmentNum} is not registered.`,
            });
          }
          enrollmentId = enrollment._id;
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid member format.",
          });
        }

        resolvedMembers.push(enrollmentId);
      }

      // Check duplicates
      if (new Set(resolvedMembers).size !== resolvedMembers.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate members not allowed.",
        });
      }

      group.students = resolvedMembers;
    }

    // 4️⃣ Update other fields if provided
    if (projectTitle) group.projectTitle = projectTitle;
    if (projectDescription) group.projectDescription = projectDescription;
    if (projectTechnology) group.projectTechnology = projectTechnology;
    if (status) group.status = status;

    // 5️⃣ Debug — show division state before save
    console.log("🔍 Division before save:", group.division);

    // 6️⃣ Save safely (skip validation if division missing)
    if (!group.division) {
      console.warn(`⚠️ Group ${id} has no division — skipping validation.`);
      await group.save({ validateBeforeSave: false });
    } else {
      await group.save();
    }

    // 7️⃣ Populate related data for frontend
    await group.populate([
      { path: "guide", select: "name email expertise mobile" },
      { path: "division", select: "course semester year" },
      { path: "students", select: "name enrollmentNumber" },
    ]);

    // 8️⃣ Send success response
    res.status(200).json({
      success: true,
      message: "Group updated successfully.",
      data: group,
    });
  } catch (error) {
    console.error("❌ Error updating group:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating group.",
    });
  }
};

/**
 * @desc   Get all students with optional filters
 * @route  GET /api/admin/students
 * @access Private (Admin)
 */
export const getAllStudents = async (req, res) => {
  try {
    const { search, division, isRegistered, isActive } = req.query;

    // Build filter dynamically
    const filter = {};
    if (division) filter.division = division;
    if (isRegistered !== undefined)
      filter.isRegistered = isRegistered === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";

    let students = await Student.find(filter)
      .populate("division", "course semester year")
      .populate("group", "name projectTitle")
      .select(
        "name enrollmentNumber email phone division group isRegistered isActive"
      )
      .exec();

    // Client-side search if provided (since search is simple)
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchLower) ||
          student.enrollmentNumber?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    console.error("❌ Error fetching students:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching students",
    });
  }
};

/**
 * @desc   Add a new student
 * @route  POST /api/admin/add-student
 * @access Private (Admin)
 */
export const addStudent = async (req, res) => {
  try {
    const { enrollmentNumber, name, email, phone, divisionId } = req.body;

    // Validate required fields
    if (!enrollmentNumber || !name || !email || !divisionId) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number, name, email, and division are required",
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ enrollmentNumber });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this enrollment number already exists",
      });
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Student with this email already exists",
      });
    }

    // Validate division exists
    const division = await Division.findById(divisionId);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    // Create new student
    const newStudent = await Student.create({
      enrollmentNumber,
      name,
      email,
      phone: phone || null,
      division: divisionId,
      isRegistered: false,
    });

    // Populate for response
    await newStudent.populate("division", "course semester year");

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: newStudent,
    });
  } catch (err) {
    console.error("❌ Error adding student:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding student",
    });
  }
};

/**
 * @desc   Get a single student by ID for admin management (view student details)
 * @route  GET /api/admin/students/:id
 * @access Private (Admin)
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate("division", "course semester year")
      .select("name enrollmentNumber email phone division isRegistered")
      .exec();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (err) {
    console.error("❌ Error fetching student:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student",
    });
  }
};

/**
 * @desc   Update a student by ID for admin management (edit student)
 * @route  PUT /api/admin/students/:id
 * @access Private (Admin)
 */
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, isRegistered } = req.body;

    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check for duplicate email if email is being updated
    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another student",
        });
      }
    }

    // Update fields
    if (name) student.name = name;
    if (email !== undefined) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (isRegistered !== undefined) student.isRegistered = isRegistered;

    await student.save();

    // Populate for response
    await student.populate("division", "course semester year");

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (err) {
    console.error("❌ Error updating student:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating student",
    });
  }
};

// ✅ Save all project evaluations for a group
export const saveAllProjectEvaluations = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { evaluations } = req.body;

    if (!Array.isArray(evaluations)) {
      return res.status(400).json({
        success: false,
        message: "Evaluations must be an array",
      });
    }

    // Delete existing evaluations for the group
    await ProjectEvaluation.deleteMany({ projectId: groupId });

    // Insert new evaluations
    if (evaluations.length > 0) {
      const docs = evaluations.map((e) => ({
        projectId: groupId,
        studentId: e.student,
        parameterId: e.parameter,
        givenMarks: Number(e.marks),
        evaluatedBy: req.admin.id, // assuming admin is evaluating
      }));
      await ProjectEvaluation.insertMany(docs);
    }

    res.status(200).json({
      success: true,
      message: "All evaluations saved successfully",
    });
  } catch (err) {
    console.error("❌ Error saving project evaluations:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while saving evaluations",
    });
  }
};

// ✅ Get current limit (helper)
export const getGuideLimit = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ key: "guideLimit" });
    const value = setting ? setting.value : 3; // default = 3
    res.status(200).json({ success: true, limit: value });
  } catch (err) {
    console.error("❌ Error fetching guide limit:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔧 Helper function — no res/status, just returns number
const fetchGuideLimit = async () => {
  const setting = await SystemSetting.findOne({ key: "guideLimit" });
  return setting ? setting.value : 3; // default 3 if not found
};

// ✅ Set or update guide limit
export const setGuideLimit = async (req, res) => {
  try {
    const { limit } = req.body;
    if (!limit || limit < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid limit value" });
    }

    const updated = await SystemSetting.findOneAndUpdate(
      { key: "guideLimit" },
      { value: limit },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Guide limit set to ${limit}`,
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error in setGuideLimit:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ updateGroupGuide controller
export const updateGroupGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { guideId } = req.body;

    if (!guideId) {
      return res
        .status(400)
        .json({ success: false, message: "Guide ID is required." });
    }

    const guideExists = await Guide.findById(guideId);
    if (!guideExists) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found." });
    }

    // ✅ Use helper instead of API function
    const GUIDE_GROUP_LIMIT = await fetchGuideLimit();

    const assignedGroups = await Group.find({ guide: guideId });
    if (assignedGroups.length >= GUIDE_GROUP_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `This guide already has ${GUIDE_GROUP_LIMIT} group(s) assigned.`,
      });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { guide: guideId },
      { new: true, runValidators: true }
    )
      .populate("guide", "name email expertise phone")
      .populate("division", "name")
      .populate("students", "name enrollmentNumber");

    if (!updatedGroup) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }

    res.status(200).json({
      success: true,
      message: "Group guide updated successfully.",
      data: updatedGroup,
    });
  } catch (err) {
    console.error("❌ Error in updateGroupGuide:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating group guide.",
      error: err.message,
    });
  }
};

import Notification from "../../models/Notification.js";

// ✅ Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Create notification
export const createNotification = async (req, res) => {
  try {
    const { type, message } = req.body;
    const newNotification = await Notification.create({ type, message });
    res.status(201).json({ success: true, data: newNotification });
  } catch (err) {
    console.error("❌ Error creating notification:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Mark single as read
export const markNotificationAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Mark all as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { isRead: true });
    res.json({ success: true, message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc   Get all project evaluations for a specific group, structured by students and parameters
 * @route  GET /api/admin/groups/:groupId/project-evaluations
 * @access Private (Admin)
 */
export const getGroupProjectEvaluations = async (req, res) => {
  try {
    const { groupId } = req.params;

    // 1️⃣ Find the group and get its students
    const group = await Group.findById(groupId)
      .populate({
        path: "membersSnapshot",
        populate: {
          path: "studentRef",
          select: "name enrollmentNumber _id",
        },
      })
      .populate("students", "name enrollmentNumber _id")
      .select("students membersSnapshot");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Construct students array (from membersSnapshot or students)
    const students =
      group.membersSnapshot && group.membersSnapshot.length > 0
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

    // 2️⃣ Fetch all evaluation parameters
    const parameters = await EvaluationParameter.find().sort({ order: 1 });

    // 3️⃣ Fetch all project evaluations for the group
    const evaluations = await ProjectEvaluation.find({ projectId: groupId })
      .populate("studentId", "name enrollmentNumber")
      .populate("parameterId", "name description marks")
      .populate("evaluatedBy", "name email");

    // 4️⃣ Structure the response: array of students, each with evaluations by parameter
    const studentEvaluations = students.map((student) => {
      const studentEvals = parameters.map((param) => {
        const evalRecord = evaluations.find(
          (e) =>
            e.studentId._id.toString() === student._id.toString() &&
            e.parameterId._id.toString() === param._id.toString()
        );
        return {
          parameter: {
            _id: param._id,
            name: param.name,
            description: param.description,
            marks: param.marks,
          },
          givenMarks: evalRecord ? evalRecord.givenMarks : null,
          evaluatedBy: evalRecord ? evalRecord.evaluatedBy : null,
        };
      });

      return {
        student: {
          _id: student._id,
          name: student.name,
          enrollmentNumber: student.enrollmentNumber,
        },
        evaluations: studentEvals,
      };
    });

    res.status(200).json({
      success: true,
      data: studentEvaluations,
    });
  } catch (err) {
    console.error("❌ Error fetching group project evaluations:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching evaluations",
    });
  }
};

// ✅ GET /api/admin/get-groups-by-guide/:guideId
// Fetch all groups assigned to a specific guide
export const getGroupsByGuide = async (req, res) => {
  try {
    const { guideId } = req.params;

    // Check if the guide exists
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    // Fetch all groups where this guide is assigned
    const groups = await Group.find({ guide: guideId })
      .select("name projectTitle status year")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (err) {
    console.error("❌ Error fetching groups for guide:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching guide groups",
    });
  }
};
