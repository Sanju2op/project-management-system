import Student from "../models/student.js";
import Division from "../models/division.js";
import Group from "../models/group.js";
import jwt from "jsonwebtoken";
import { notificationAPI } from "../../client/student/src/services/api.js";
import Announcement from "../models/courseAnnouncement.js";
import ExamSchedule from "../models/examSchedule.js";
import Guide from "../models/guide.js";
import GroupChatMessage from "../models/groupChatMessage.js";

// GET /api/student/divisions - list active divisions
export const getActiveDivisions = async (req, res) => {
  try {
    const divisions = await Division.find({ status: "active" })
      .sort({ year: -1, course: 1, semester: 1 })
      .lean();
    res.json(divisions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch divisions" });
  }
};

// GET /api/student/pending-enrollments?divisionId=... - enrollment numbers not registered yet for a division
export const getPendingEnrollments = async (req, res) => {
  try {
    const { divisionId } = req.query;
    if (!divisionId)
      return res.status(400).json({ message: "divisionId is required" });

    const students = await Student.find({
      division: divisionId,
      isRegistered: false,
    })
      .select("enrollmentNumber name")
      .sort({ enrollmentNumber: 1 })
      .lean();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

// POST /api/student/register - body: { divisionId, enrollmentNumber, name, phone, email, password }
export const registerStudent = async (req, res) => {
  try {
    const { divisionId, enrollmentNumber, name, phone, email, password } =
      req.body;
    if (!divisionId || !enrollmentNumber || !name || !password) {
      return res.status(400).json({
        message: "divisionId, enrollmentNumber, name, password are required",
      });
    }

    const division = await Division.findById(divisionId);
    if (!division || division.status !== "active") {
      return res.status(400).json({ message: "Invalid or inactive division" });
    }

    const student = await Student.findOne({
      enrollmentNumber,
      division: divisionId,
    });
    if (!student) {
      return res
        .status(404)
        .json({ message: "Enrollment not found for this division" });
    }

    // Update allowed fields and mark registered
    student.name = name;
    if (phone) student.phone = phone;
    if (email) student.email = email;
    student.password = password; // will be hashed by pre-save hook
    student.isRegistered = true;
    await student.save();

    res.status(200).json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

// POST /api/student/login - body: { enrollmentNumber, password }
export const loginStudent = async (req, res) => {
  try {
    const { enrollmentNumber, password } = req.body;
    if (!enrollmentNumber || !password) {
      return res
        .status(400)
        .json({ message: "Enrollment number and password are required" });
    }

    const student = await Student.findOne({ enrollmentNumber }).populate(
      "division"
    );
    if (!student || !student.isRegistered) {
      return res
        .status(401)
        .json({ message: "Invalid enrollment number or password" });
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid enrollment number or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, role: "student", division: student.division._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      _id: student._id,
      enrollmentNumber: student.enrollmentNumber,
      name: student.name,
      division: student.division,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Get schedules for logged-in student
export const getStudentExamSchedules = async (req, res) => {
  try {
    const studentId = req.student._id;

    // Fetch student with division
    const student = await Student.findById(studentId).populate("division");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const division = student.division;
    if (!division) {
      return res.status(400).json({ message: "Student division not found" });
    }

    // Extract course from division
    const course = division.course; // Example: "MCA", "BCA", "MSCIT"

    // Fetch ONLY this course's exam schedules
    const schedules = await ExamSchedule.find({ course }).sort({ date: 1 });

    return res.json({ schedules });
  } catch (error) {
    console.log("Exam schedule error:", error);
    res.status(500).json({ message: "Failed to fetch exam schedules" });
  }
};
// GET /api/student/check-group - check if student is in any group
export const checkStudentGroup = async (req, res) => {
  try {
    const studentId = req.student._id; // from auth middleware

    const group = await Group.findOne({ students: studentId }).populate(
      "students",
      "enrollmentNumber name"
    );

    if (group) {
      res.json({ inGroup: true, group });
    } else {
      res.json({ inGroup: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to check group status" });
  }
};

// GET /api/student/available-students - get students in same division not in any group
export const getAvailableStudents = async (req, res) => {
  try {
    const studentId = req.student._id; // from auth middleware

    const student = await Student.findById(studentId).populate("division");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Get all students in same division (both registered and not registered)
    const divisionStudents = await Student.find({
      division: student.division._id,
    })
      .select("_id enrollmentNumber name isRegistered")
      .lean();

    // Get students already in groups
    const groupsInDivision = await Group.find({
      division: student.division._id,
    });
    const groupedStudentIds = groupsInDivision.flatMap((group) =>
      group.students.map((id) => id.toString())
    );

    // Filter out students already in groups and the current student
    const availableStudents = divisionStudents.filter(
      (s) =>
        !groupedStudentIds.includes(s._id.toString()) &&
        s._id.toString() !== studentId
    );

    res.json(availableStudents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available students" });
  }
};

// POST /api/student/create-group - create a new group
export const createGroup = async (req, res) => {
  try {
    const studentId = req.student._id; // from auth middleware
    const { project, members } = req.body;

    if (
      !project ||
      !project.name ||
      !project.title ||
      !project.description ||
      !project.technology
    ) {
      return res
        .status(400)
        .json({ message: "All project fields are required" });
    }

    if (!members || members.length < 2 || members.length > 3) {
      return res
        .status(400)
        .json({ message: "Select 2-3 additional students" });
    }

    // Check if student is already in a group
    const existingGroup = await Group.findOne({ students: studentId });
    if (existingGroup) {
      return res.status(400).json({ message: "You are already in a group" });
    }

    // Get student and division
    const student = await Student.findById(studentId).populate("division");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if selected students are available
    const allStudentIds = [studentId, ...members];
    const groups = await Group.find({ students: { $in: allStudentIds } });
    if (groups.length > 0) {
      return res
        .status(400)
        .json({ message: "Some selected students are already in groups" });
    }

    // Create members snapshot
    const allStudents = await Student.find({
      _id: { $in: allStudentIds },
    }).populate("division");
    const membersSnapshot = allStudents.map((s) => ({
      studentRef: s._id,
      enrollmentNumber: s.enrollmentNumber,
      name: s.name,
      divisionCourse: s.division.course,
      divisionSemester: s.division.semester,
    }));

    // Create group
    const group = new Group({
      name: project.name,
      division: student.division._id,
      projectTitle: project.title,
      projectDescription: project.description,
      projectTechnology: project.technology,
      year: student.division.year,
      students: allStudentIds,
      membersSnapshot,
    });

    await group.save();
    try {
      await notificationAPI.create({
        type: "group",
        message: `New group "${group.name}" created.`,
        isRead: false,
      });
    } catch (notifErr) {
      console.warn(
        "Failed to create notification for new group:",
        notifErr.message
      );
    }

    // Populate for response
    await group.populate("students", "enrollmentNumber name");
    await group.populate("division", "course semester year");

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create group", error: error.message });
  }
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

// GET /api/student/profile - get current student profile
export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.student._id; // from auth middleware

    const student = await Student.findById(studentId).populate("division");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      _id: student._id,
      enrollmentNumber: student.enrollmentNumber,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.division
        ? `${student.division.course} - Semester ${student.division.semester}`
        : "N/A",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// GET /api/student/guide-details
export const getAssignedGuide = async (req, res) => {
  try {
    const studentId = req.student._id;

    // Find the student's group
    const group = await Group.findOne({ students: studentId }).populate(
      "guide"
    );

    if (!group) {
      return res.json({ hasGuide: false, guide: null });
    }

    if (!group.guide) {
      return res.json({ hasGuide: false, guide: null });
    }

    const { name, email, phone, expertise } = group.guide;

    return res.json({
      hasGuide: true,
      guide: {
        name,
        email,
        phone,
        expertise,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch guide details" });
  }
};

export const getGroupChatMessages = async (req, res) => {
  try {
    const studentId = req.student._id;

    const group = await Group.findOne({ students: studentId })
      .populate("students", "name enrollmentNumber")
      .lean();

    if (!group) {
      return res.json({
        group: null,
        messages: [],
        currentStudentId: studentId,
      });
    }

    const chatMessages = await GroupChatMessage.find({ group: group._id })
      .populate("sender", "name enrollmentNumber")
      .sort({ createdAt: 1 })
      .lean();

    const normalizedMessages = chatMessages.map((msg) => ({
      id: msg._id,
      content: msg.message,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender?._id?.toString() || null,
        name: msg.sender?.name || "Unknown",
        enrollmentNumber: msg.sender?.enrollmentNumber || "",
      },
    }));

    return res.json({
      group: {
        id: group._id,
        name: group.name,
        members: (group.students || []).map((student) => ({
          id: student._id,
          name: student.name,
          enrollmentNumber: student.enrollmentNumber,
        })),
      },
      messages: normalizedMessages,
      currentStudentId: studentId,
    });
  } catch (error) {
    console.error("Error fetching group chat messages:", error);
    res.status(500).json({ message: "Failed to load chat messages" });
  }
};

export const postGroupChatMessage = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const group = await Group.findOne({ students: studentId });
    if (!group) {
      return res
        .status(400)
        .json({ message: "Join a group to start chatting" });
    }

    const chatMessage = await GroupChatMessage.create({
      group: group._id,
      sender: studentId,
      message: message.trim(),
    });

    await chatMessage.populate("sender", "name enrollmentNumber");

    return res.status(201).json({
      id: chatMessage._id,
      content: chatMessage.message,
      createdAt: chatMessage.createdAt,
      sender: {
        id: chatMessage.sender?._id?.toString() || null,
        name: chatMessage.sender?.name || "Unknown",
        enrollmentNumber: chatMessage.sender?.enrollmentNumber || "",
      },
    });
  } catch (error) {
    console.error("Error sending group chat message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
