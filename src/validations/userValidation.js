import Joi from "joi";

const addressSchema = Joi.object({
  country: Joi.string().required().messages({
    "any.required": "Country is required",
  }),
  state: Joi.string().required().messages({
    "any.required": "State is required",
  }),
  city: Joi.string().allow("").optional(),
  pincode: Joi.string().allow("").optional(),
  locality: Joi.string().allow("").optional(),
});

export const createUserSchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().required().email().messages({
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),
  mobile: Joi.string().required().messages({
    "any.required": "Mobile number is required",
  }),
  country_code: Joi.string(),
  i_am: Joi.string().required().valid("Male", "Female", "Other").messages({
    "any.only": "Gender must be either Male, Female, or Other",
    "any.required": "Gender is required",
  }),
  interested_in: Joi.string()
    .required()
    .valid("Male", "Female", "Both")
    .messages({
      "any.only": "Interest must be either Male, Female, or Both",
      "any.required": "Interest preference is required",
    }),
  age: Joi.number().required().min(18).max(120).messages({
    "number.min": "Age must be at least 18",
    "number.max": "Age cannot exceed 120",
    "any.required": "Age is required",
  }),
  about: Joi.string().max(500).allow("").messages({
    "string.max": "About section cannot exceed 500 characters",
  }),
  likes: Joi.array().items(Joi.string()),
  interests: Joi.array().items(Joi.string()),
  hobbies: Joi.array().items(Joi.string()),
  skin_color: Joi.string().allow(""),
  height: Joi.number().min(100).max(250).messages({
    "number.min": "Height must be at least 100 cm",
    "number.max": "Height cannot exceed 250 cm",
  }),
  weight: Joi.number().min(30).max(200).messages({
    "number.min": "Weight must be at least 30 kg",
    "number.max": "Weight cannot exceed 200 kg",
  }),
  address: addressSchema,
  profession: Joi.string().allow(""),
  marital_status: Joi.string()
    .valid("married", "unmarried", "widow", null)
    .allow(null),
  category: Joi.string()
    .valid("Casual Dating", "Serious Relationship", "Friendship")
    .default("Casual Dating")
    .messages({
      "any.only": "Invalid category selected",
    }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  email: Joi.string().email().messages({
    "string.email": "Please enter a valid email",
  }),
  mobile: Joi.string().required().messages({
    "any.required": "Mobile number is required",
  }),
  country_code: Joi.string(),
  i_am: Joi.string().valid("Male", "Female", "Other").messages({
    "any.only": "Gender must be either Male, Female, or Other",
  }),
  interested_in: Joi.string().valid("Male", "Female", "Both").messages({
    "any.only": "Interest must be either Male, Female, or Both",
  }),
  age: Joi.number().min(18).max(120).messages({
    "number.min": "Age must be at least 18",
    "number.max": "Age cannot exceed 120",
  }),
  about: Joi.string().max(500).allow("").messages({
    "string.max": "About section cannot exceed 500 characters",
  }),
  likes: Joi.array().items(Joi.string()),
  interests: Joi.array(),
  hobbies: Joi.array().items(Joi.string()),
  skin_color: Joi.string().allow(""),
  height: Joi.number().min(100).max(250).messages({
    "number.min": "Height must be at least 100 cm",
    "number.max": "Height cannot exceed 250 cm",
  }),
  weight: Joi.number().min(30).max(200).messages({
    "number.min": "Weight must be at least 30 kg",
    "number.max": "Weight cannot exceed 200 kg",
  }),
  address: addressSchema,
  profession: Joi.string().allow(""),
  marital_status: Joi.string()
    .valid("married", "unmarried", "widow", null)
    .allow(null),
  category: Joi.string()
    .valid("Casual Dating", "Serious Relationship", "Friendship")
    .messages({
      "any.only": "Invalid category selected",
    }),
})
  .min(1)
  .unknown(true);

// middleware to handle json data
export const parseJsonFields = (fields) => (req, res, next) => {
  fields.forEach((field) => {
    if (req.body[field]) {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        // Leave it as-is or handle error gracefully
      }
    }
  });
  next();
};
