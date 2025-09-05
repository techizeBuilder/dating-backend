import Joi from 'joi';

const variableSchema = Joi.object({
    name: Joi.string()
        .required()
        .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
        .messages({
            'string.pattern.base': 'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores',
            'any.required': 'Variable name is required'
        }),
    type: Joi.string()
        .valid('string', 'number', 'date', 'boolean')
        .default('string')
        .messages({
            'any.only': 'Variable type must be string, number, date, or boolean'
        })
});

export const createTemplateSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(50)
        .messages({
            'string.min': 'Name must be at least 3 characters long',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
    subject: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Subject must be at least 3 characters long',
            'string.max': 'Subject cannot exceed 100 characters',
            'any.required': 'Subject is required'
        }),
    type: Joi.string()
        .required(),
    description: Joi.string()
        .max(200)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 200 characters'
        }),
    content: Joi.string()
        .required()
        .min(10)
        .messages({
            'string.min': 'Content must be at least 10 characters long',
            'any.required': 'Content is required'
        }),
    variables: Joi.array()
        .items(variableSchema)
        .unique('name')
        .messages({
            'array.unique': 'Variable names must be unique'
        }),
    status: Joi.boolean()
        .messages({
            'boolean.base': 'Status must be either true or false'
        }),

});

export const updateTemplateSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .messages({
            'string.min': 'Name must be at least 3 characters long',
            'string.max': 'Name cannot exceed 50 characters'
        }),
    subject: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Subject must be at least 3 characters long',
            'string.max': 'Subject cannot exceed 100 characters'
        }),
    type: Joi.string()
        .required(),
    description: Joi.string()
        .max(200)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 200 characters'
        }),
    content: Joi.string()
        .min(10)
        .messages({
            'string.min': 'Content must be at least 10 characters long'
        }),
    variables: Joi.array()
        .items(variableSchema)
        .unique('name')
        .messages({
            'array.unique': 'Variable names must be unique'
        }),
    status: Joi.boolean()
        .messages({
            'boolean.base': 'Status must be either true or false'
        }),

}).min(1);