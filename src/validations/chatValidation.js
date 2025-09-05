import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  receiver_id: Joi.string()
    .required()
    .messages({
      'any.required': 'Receiver ID is required'
    }),
  type: Joi.string()
    .valid('text', 'image', 'audio', 'doc')
    .required()
    .messages({
      'any.only': 'Invalid message type',
      'any.required': 'Message type is required'
    }),
  message: Joi.string()
    .when('type', {
      is: 'text',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Message content is required for text messages'
    })
});