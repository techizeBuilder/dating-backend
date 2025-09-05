import Joi from "joi";

export const createStorySchema = Joi.object({
  media_type: Joi.string().valid("image", "video").required().messages({
    "any.only": "Media type must be either image or video",
    "any.required": "Media type is required",
  }),
}).unknown(true);
