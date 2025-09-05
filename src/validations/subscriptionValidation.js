import Joi from 'joi';

export const createSubscriptionPlanSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters and spaces.',
      'string.empty': 'Name is required.',
      'string.min': 'Name must be at least 3 characters long.',
      'string.max': 'Name must be less than or equal to 100 characters.'
    }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number.',
    'number.min': 'Price must be at least 0.',
    'any.required': 'Price is required.'
  }),

  duration_days: Joi.number().min(1).required().messages({
    'number.base': 'Duration must be a number.',
    'number.min': 'Duration must be at least 1 day.',
    'any.required': 'Duration is required.'
  }),

  features: Joi.array()
    .items(
      Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-Z0-9\s\-_,\.]+$/)
        .required()
        .messages({
          'string.base': 'Each feature must be a string.',
          'string.min': 'Feature must be at least 2 characters.',
          'string.max': 'Feature must be at most 100 characters.',
          'string.pattern.base': 'Feature may only contain letters, numbers, and basic punctuation.'
        })
    )
    .min(1)
    .messages({
      'array.base': 'Features must be an array.',
      'array.min': 'At least one feature is required.'
    }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  isPopular: Joi.boolean().default(false),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description must be at most 500 characters.'
  })
});
export const updateSubscriptionPlanSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters and spaces.',
      'string.empty': 'Name is required.',
      'string.min': 'Name must be at least 3 characters long.',
      'string.max': 'Name must be less than or equal to 100 characters.'
    }),
  price: Joi.number().min(0),
  duration_days: Joi.number().min(1),
  features: Joi.array().items(Joi.string()),
  status: Joi.string().valid('active', 'inactive'),
  isPopular: Joi.boolean(),
  description: Joi.string()
}).min(1);


export const updatePlanStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'inactive')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be either active or inactive'
    })
});

export const purchaseSubscriptionSchema = Joi.object({
  plan_id: Joi.string().required(),
  payment_method: Joi.string().required(),
  transaction_id: Joi.string().required(),
  amount: Joi.number().min(0).required()
});