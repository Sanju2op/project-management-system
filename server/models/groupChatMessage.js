import mongoose from "mongoose";

const groupChatMessageSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

groupChatMessageSchema.index({ group: 1, createdAt: 1 });

const GroupChatMessage = mongoose.model(
  "GroupChatMessage",
  groupChatMessageSchema
);

export default GroupChatMessage;

