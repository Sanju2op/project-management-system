import Expertise from "../models/Expertise.js";

// 🟢 Get all expertise
export const getAllExpertise = async (req, res) => {
  try {
    const expertise = await Expertise.find().sort({ name: 1 });
    res.json({ success: true, count: expertise.length, data: expertise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Add new expertise
export const addExpertise = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Expertise.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Expertise already exists" });
    }

    const newExpertise = new Expertise({ name, description });
    await newExpertise.save();

    res.status(201).json({
      success: true,
      message: "Expertise added successfully",
      data: newExpertise,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Update expertise
export const updateExpertise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    console.log("🛠️ Update Expertise -> ID:", id, "BODY:", req.body);

    const updated = await Expertise.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Expertise not found" });

    res.json({ success: true, message: "Expertise updated", data: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "An expertise with this name already exists" });
    }
    console.error("❌ Error updating expertise:", error);
    res
      .status(500)
      .json({
        message: error.message || "Server error while updating expertise",
      });
  }
};

// 🟢 Delete expertise
export const deleteExpertise = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expertise.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Expertise not found" });

    res.json({ success: true, message: "Expertise deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
