import Joi from 'joi';

export const rateAppSchema = Joi.object({
  rating: Joi.number()
    .required()
    .min(1)
    .max(5)
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  feedback: Joi.string()
    .trim()
    .allow('')
    .max(500)
    .messages({
      'string.max': 'Feedback cannot exceed 500 characters'
    })
});