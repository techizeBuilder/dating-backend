import Joi from 'joi';

export const createInterestSchema = Joi.object({
    name: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.pattern.base': 'Interest name must contain only letters and spaces.',
            'string.empty': 'Interest name is required.',
            'string.min': 'Interest name must be at least 2 characters long.',
            'string.max': 'Interest name must be less than or equal to 100 characters.',
            'any.required': 'Interest name is required.'
        })
});

export const updateInterestSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            'any.required': 'Interest name is required'
        })
});