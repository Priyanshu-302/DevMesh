const mongoose = require("mongoose");

const agentLogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

agentLogSchema.index({ task: 1, timestamp: 1 });

module.exports = mongoose.model("AgentLog", agentLogSchema);