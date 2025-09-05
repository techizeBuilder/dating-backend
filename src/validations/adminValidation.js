import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const permissionSchema = Joi.object({
  dashboard: Joi.boolean().default(false),
  users: Joi.boolean().default(false),
  admins: Joi.boolean().default(false),
  content: Joi.boolean().default(false),
  settings: Joi.boolean().default(false),
  reports: Joi.boolean().default(false),
  payments: Joi.boolean().default(false),
  subscriptions: Joi.boolean().default(false),
  questions: Joi.boolean().default(false),
  notifications: Joi.boolean().default(false),
  reported: Joi.boolean().default(false),
  banned: Joi.boolean().default(false),
  interests: Joi.boolean().default(false),
  introscreens: Joi.boolean().default(false),
  logs: Joi.boolean().default(false),
  emailTemplates: Joi.boolean().default(false),
  emailtemplates: Joi.boolean().default(false),
  support: Joi.boolean().default(false),
  profile: Joi.boolean().default(false),
  chats: Joi.boolean().default(false),
  verifications: Joi.boolean().default(false)
}).custom((value, helpers) => {
  // Ensure at least one permission is `true`
  const hasAtLeastOneTrue = Object.values(value).some(v => v === true);
  if (!hasAtLeastOneTrue) {
    return helpers.message('At least one permission must be selected.');
  }
  return value;
});

export const createAdminSchema = Joi.object({
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
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  role: Joi.string().valid('admin', 'moderator', 'supervisor').default('admin'),
  permissions: permissionSchema
});


export const updateAdminSchema = Joi.object({
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
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'moderator', 'supervisor'),
  permissions: permissionSchema
}).min(1);

export const updateAdminStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'inactive')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be either active or inactive'
    })
});

export const assignRoleSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'moderator', 'supervisor')
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Invalid role specified'
    })
});

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  location: Joi.string().required(),
  age: Joi.number().min(18).max(120).required(),
  subscription: Joi.string().valid('free', 'premium').default('free'),
  about_us: Joi.string().allow(''),
  interest: Joi.array().items(Joi.string()),
  profile_image: Joi.string().allow('')
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  mobile: Joi.string(),
  gender: Joi.string().valid('Male', 'Female', 'Other'),
  location: Joi.string(),
  age: Joi.number().min(18).max(120),
  subscription: Joi.string().valid('free', 'premium'),
  about_us: Joi.string().allow(''),
  interest: Joi.array().items(Joi.string()),
  status: Joi.string().valid('active', 'inactive', 'banned'),
  profile_image: Joi.string().allow('')
}).min(1);

export const updateUserStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'inactive', 'banned')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be either active, inactive, or banned'
    })
});