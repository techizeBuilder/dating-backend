import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          enum: ["Self Soothing", "Social Support"],
        },
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    stage: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
  {
    timestamps: true,
  }
);

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

export default QuizQuestion;
