const mongoose = require("mongoose");

const workSpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    codebasePath: {
      type: String,
      default: "",
    },
    ingestionStatus: {
      type: String,
      enum: ["none", "extracted", "ingesting", "completed", "failed"],
      default: "none",
    },
    ingestionError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Workspace", workspaceSchema);
