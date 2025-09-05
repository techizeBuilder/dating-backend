import Joi from 'joi';

export const updatePaymentSchema = Joi.object({
    amount: Joi.number().min(0),
    status: Joi.string().valid('pending', 'success', 'failed'),
    plan_name: Joi.string()
}).min(1);