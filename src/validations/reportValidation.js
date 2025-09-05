import Joi from 'joi';

export const banUserSchema = Joi.object({
    reason: Joi.string()
        .required()
        .messages({
            'any.required': 'Ban reason is required'
        })
});