import mongoose from 'mongoose';

const variableSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['string', 'number', 'date', 'boolean'],
        default: 'string'
    }
}, { _id: false });

const emailTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    variables: [variableSchema],
    status: {
        type: String,
        enum: ['true', 'false'],
        default: 'true'
    }
}, {
    timestamps: true
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;