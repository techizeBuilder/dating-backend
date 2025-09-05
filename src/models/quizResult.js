import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  quizSessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: false },
  wrongAnswers: { type: Number, required: false },
  answers: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.QuizResult ||
  mongoose.model("QuizResult", quizResultSchema);
