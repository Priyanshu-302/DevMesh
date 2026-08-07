const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    requestText: {
      type: String,
      required: [true, "Request prompt/text is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "pending",
    },
    finalCode: {
      type: String,
      default: "",
    },
    testSuite: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
