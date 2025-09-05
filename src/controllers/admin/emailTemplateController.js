import EmailTemplate from '../../models/emailTemplateModel.js';

export const createTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.create(req.body);

        res.status(201).json({
            status: true,
            message: "Email template created successfully",
            data: {
                id: template._id,
                name: template.name,
                subject: template.subject,
                type: template.type,
                description: template.description,
                content: template.content,
                variables: template.variables,
                created_at: template.createdAt,
                updated_at: template.updatedAt
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const getAllTemplates = async (req, res) => {
    try {
        const templates = await EmailTemplate.find().lean();

        res.status(200).json({
            status: true,
            data: templates.map(template => ({
                id: template._id,
                name: template.name,
                subject: template.subject,
                type: template.type,
                description: template.description,
                content: template.content,
                variables: template.variables,
                status: template.status,
                created_at: template.createdAt,
                updated_at: template.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getTemplateById = async (req, res) => {
    try {
        const template = await EmailTemplate.findById(req.params.id).lean();

        if (!template) {
            return res.status(404).json({
                status: false,
                message: "Email template not found"
            });
        }

        res.status(200).json({
            status: true,
            data: {
                id: template._id,
                name: template.name,
                subject: template.subject,
                type: template.type,
                description: template.description,
                content: template.content,
                variables: template.variables,
                status: template.status,
                created_at: template.createdAt,
                updated_at: template.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const updateTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({
                status: false,
                message: "Email template not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Email template updated successfully",
            data: {
                id: template._id,
                name: template.name,
                subject: template.subject,
                type: template.type,
                description: template.description,
                content: template.content,
                variables: template.variables,
                status: template.status,
                updated_at: template.updatedAt
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.findByIdAndDelete(req.params.id);

        if (!template) {
            return res.status(404).json({
                status: false,
                message: "Email template not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Email template deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};