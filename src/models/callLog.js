import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  wasFreeCall: { type: Boolean, default: false },
});

const CallLog = mongoose.model("CallLog", callLogSchema);
export default CallLog;
