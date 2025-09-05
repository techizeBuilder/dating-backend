import QuizQuestion from "../../models/quizQuestionModel.js";
import QuizCategory from "../../models/quizCategoryModel.js";
import User from "../../models/userModel.js";

export const createQuestion = async (req, res) => {
  try {
    const { question, options, stage } = req.body;

    // Basic presence checks
    if (!question || !Array.isArray(options) || !stage) {
      return res.status(400).json({
        status: false,
        message: "Question, options, and stage are required.",
      });
    }

    // Ensure exactly 4 options
    if (options.length !== 4) {
      return res.status(400).json({
        status: false,
        message: "Exactly 4 options are required.",
      });
    }

    // Count how many options belong to each category
    const categoryCounts = options.reduce(
      (acc, opt) => {
        if (!opt.text || !opt.category) {
          throw new Error("Each option must have text and category.");
        }

        if (
          opt.category !== "Self Soothing" &&
          opt.category !== "Social Support"
        ) {
          throw new Error("Invalid option category provided.");
        }

        acc[opt.category]++;
        return acc;
      },
      { "Self Soothing": 0, "Social Support": 0 }
    );

    // Validate category distribution
    if (
      categoryCounts["Self Soothing"] !== 2 ||
      categoryCounts["Social Support"] !== 2
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Exactly 2 options must be from 'Self Soothing' and 2 from 'Social Support'.",
      });
    }

    // Create question
    const newQuestion = await QuizQuestion.create({
      question,
      options,
      stage,
    });

    return res.status(201).json({
      status: true,
      message: "Question added successfully",
      question: {
        id: newQuestion._id,
        question: newQuestion.question,
        options: newQuestion.options,
        status: newQuestion.status,
        stage: newQuestion.stage,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to create question",
    });
  }
};

// Get all quiz questions
export const getAllQuestions = async (req, res) => {
  try {
    const { stage } = req.query;

    // Build the filter object conditionally
    const filter = {};
    if (stage) {
      filter.stage = Number(stage); // Convert stage to number for querying
    }

    const questions = await QuizQuestion.find(filter)
      .lean()
      .sort({ createdAt: -1 });

    const formattedQuestions = questions.map((q) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      status: q.status,
      stage: q.stage,
    }));

    res.status(200).json({
      status: true,
      questions: formattedQuestions,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get a specific question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await QuizQuestion.findById(req.params.id).lean();

    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      status: true,
      question: {
        id: question._id,
        question: question.question,
        options: question.options,
        status: question.status,
        stage: question.stage,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Update an existing question
export const updateQuestion = async (req, res) => {
  try {
    const { question, options, stage, status } = req.body;

    // Basic presence checks
    if (!question || !Array.isArray(options) || !stage) {
      return res.status(400).json({
        status: false,
        message: "Question, options, and stage are required.",
      });
    }

    // Ensure exactly 4 options
    if (options.length !== 4) {
      return res.status(400).json({
        status: false,
        message: "Exactly 4 options are required.",
      });
    }

    // Count how many options belong to each category
    const categoryCounts = options.reduce(
      (acc, opt) => {
        if (!opt.text || !opt.category) {
          throw new Error("Each option must have text and category.");
        }

        if (
          opt.category !== "Self Soothing" &&
          opt.category !== "Social Support"
        ) {
          throw new Error("Invalid option category provided.");
        }

        acc[opt.category]++;
        return acc;
      },
      { "Self Soothing": 0, "Social Support": 0 }
    );

    if (
      categoryCounts["Self Soothing"] !== 2 ||
      categoryCounts["Social Support"] !== 2
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Exactly 2 options must be from 'Self Soothing' and 2 from 'Social Support'.",
      });
    }

    // Update question
    const updatedQuestion = await QuizQuestion.findByIdAndUpdate(
      req.params.id,
      {
        question,
        options,
        stage,
        status: status || "active",
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Question updated successfully",
      question: {
        id: updatedQuestion._id,
        question: updatedQuestion.question,
        options: updatedQuestion.options,
        status: updatedQuestion.status,
        stage: updatedQuestion.stage,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to update question",
    });
  }
};

// Delete a question by ID
export const deleteQuestion = async (req, res) => {
  try {
    const question = await QuizQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Category Management
export const createCategory = async (req, res) => {
  try {
    const category = await QuizCategory.create(req.body);

    res.status(201).json({
      status: true,
      message: "Category added successfully",
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await QuizCategory.find().lean();

    res.status(200).json({
      status: true,
      categories: categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        description: cat.description,
        status: cat.status,
      })),
    });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern?.name) {
      return res.status(400).json({
        status: false,
        message: "Validation error",
        errors: [
          {
            field: "name",
            message: "Category name already exists",
          },
        ],
      });
    }

    // Joi or Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.entries(error.errors).map(([field, err]) => ({
        field,
        message: err.message,
      }));
      return res.status(400).json({
        status: false,
        message: "Validation error",
        errors,
      });
    }

    // Other errors
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await QuizCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: {
        id: category._id,
        name: category.name,
        description: category.description,
      },
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.name) {
      return res.status(400).json({
        status: false,
        message: "Validation error",
        errors: [
          {
            field: "name",
            message: "Category name already exists",
          },
        ],
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.entries(error.errors).map(([field, err]) => ({
        field,
        message: err.message,
      }));
      return res.status(400).json({
        status: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await QuizCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    // Delete all questions in this category
    await QuizQuestion.deleteMany({ category_id: req.params.id });

    res.status(200).json({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getQuizDashboardStats = async (req, res) => {
  try {
    const totalQuizzes = await QuizQuestion.countDocuments();

    // Calculate average score (dummy data for now)
    const averageScore = 7.4;

    // Calculate completion rate (dummy data for now)
    const completionRate = "82%";

    // Calculate match rate (dummy data for now)
    const matchRate = "64%";

    res.status(200).json({
      status: true,
      data: {
        total_quizzes: totalQuizzes,
        average_score: averageScore,
        completion_rate: completionRate,
        match_rate: matchRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
