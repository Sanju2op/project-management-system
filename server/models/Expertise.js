import mongoose from "mongoose";

const expertiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expertise", expertiseSchema);
