import Interest from '../../models/interestModel.js';
import InterestCategory from '../../models/interestCategoryModel.js';
import mongoose from 'mongoose';

// Interest Category Controllers
export const createCategory = async (req, res) => {
    try {
        const category = await InterestCategory.create(req.body);

        res.status(201).json({
            status: true,
            message: "Interest category added successfully",
            category: {
                id: category._id,
                name: category.name,
                status: category.status
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error (e.g. name already exists)
            return res.status(409).json({
                status: false,
                message: "Category with this name already exists"
            });
        }
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await InterestCategory.find().lean();

        res.status(200).json({
            status: true,
            categories: categories.map(category => ({
                id: category._id,
                name: category.name,
                description: category.description,
                status: category.status
            }))
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await InterestCategory.findById(req.params.id).lean();

        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            status: true,
            category: {
                id: category._id,
                name: category.name,
                status: category.status
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await InterestCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Interest category updated successfully",
            category: {
                id: category._id,
                name: category.name,
                color: category.color,
                status: category.status
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await InterestCategory.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Category not found"
            });
        }

        // Delete all interests in this category
        await Interest.deleteMany({ category_id: req.params.id });

        res.status(200).json({
            status: true,
            message: "Interest category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// Interest Controllers
export const createInterest = async (req, res) => {
    try {
        const { category_id } = req.body;

        // Verify category exists
        const category = await InterestCategory.findById(category_id);
        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Category not found"
            });
        }

        const interest = await Interest.create(req.body);
        await interest.populate('category_id', 'name');

        res.status(201).json({
            status: true,
            message: "Interest added successfully",
            interest: {
                id: interest._id,
                name: interest.name,
                category: {
                    id: interest.category_id._id,
                    name: interest.category_id.name
                },
                color: interest.color
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                status: false,
                message: "Interest with this name already exists"
            });
        }
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const getAllInterests = async (req, res) => {
    try {
        const interests = await Interest.find()
            .populate('category_id', 'name')
            .lean();

        res.status(200).json({
            status: true,
            interests: interests.map(interest => ({
                id: interest._id,
                name: interest.name,
                color: interest.color,
                category: interest.category_id
                    ? {
                        id: interest.category_id._id,
                        name: interest.category_id.name
                    }
                    : null, // <- safely handle missing category
                status: interest.status
            }))
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getInterestById = async (req, res) => {
    try {
        const interest = await Interest.findById(req.params.id)
            .populate('category_id', 'name')
            .lean();

        if (!interest) {
            return res.status(404).json({
                status: false,
                message: "Interest not found"
            });
        }

        res.status(200).json({
            status: true,
            interest: {
                id: interest._id,
                name: interest.name,
                color: interest.color,
                category: {
                    id: interest.category_id._id,
                    name: interest.category_id.name
                },
                status: interest.status
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const updateInterest = async (req, res) => {
    try {
        const { category_id } = req.body;

        if (category_id) {
            // Verify category exists
            const category = await InterestCategory.findById(category_id);
            if (!category) {
                return res.status(404).json({
                    status: false,
                    message: "Category not found"
                });
            }
        }

        const interest = await Interest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category_id', 'name');

        if (!interest) {
            return res.status(404).json({
                status: false,
                message: "Interest not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Interest updated successfully",
            interest: {
                id: interest._id,
                name: interest.name,
                color: interest.color,
                category: {
                    id: interest.category_id._id,
                    name: interest.category_id.name
                },
                status: interest.status
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const deleteInterest = async (req, res) => {
    try {
        const interest = await Interest.findByIdAndDelete(req.params.id);

        if (!interest) {
            return res.status(404).json({
                status: false,
                message: "Interest not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Interest deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};