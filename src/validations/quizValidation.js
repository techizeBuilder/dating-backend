import Joi from "joi";

export const createQuestionSchema = Joi.object({
  question: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9\s?'"-]+$/)
    .required()
    .messages({
      "string.pattern.base": "Question must contain only valid characters",
      "string.empty": "Question is required",
    }),

  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required().messages({
          "string.empty": "Option text is required",
        }),
        category: Joi.string()
          .valid("Self Soothing", "Social Support")
          .required()
          .messages({
            "any.only":
              "Category must be either Self Soothing or Social Support",
            "string.empty": "Category is required",
          }),
      })
    )
    .min(2)
    .required(),

  stage: Joi.number().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).required(),
});

export const updateQuestionSchema = Joi.object({
  question: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9\s?'"-]+$/)
    .messages({
      "string.pattern.base": "Question must contain only valid characters",
      "string.empty": "Question is required",
    }),

  options: Joi.array().items(
    Joi.object({
      text: Joi.string().required().messages({
        "string.empty": "Option text is required",
      }),
      category: Joi.string()
        .valid("Self Soothing", "Social Support")
        .required()
        .messages({
          "any.only": "Category must be either Self Soothing or Social Support",
          "string.empty": "Category is required",
        }),
    })
  ),

  status: Joi.string().valid("active", "inactive"),

  stage: Joi.number().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
}).min(1);

export const createCategorySchema = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Name must contain only letters and spaces",
      "string.empty": "Name is required",
    }),
  description: Joi.string(),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Name must contain only letters and spaces",
      "string.empty": "Name is required",
    }),
  description: Joi.string(),
  status: Joi.string().valid("active", "inactive"),
}).min(1);
