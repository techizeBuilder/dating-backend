import SubscriptionPlan from '../../models/subscriptionPlanModel.js';
import UserSubscription from '../../models/userSubscriptionModel.js';

export const createSubscriptionPlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.create(req.body);

        res.status(201).json({
            status: true,
            message: "Subscription plan created successfully",
            data: {
                id: plan._id,
                name: plan.name
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const getAllSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find().lean();

        res.status(200).json({
            status: true,
            plans: plans.map(plan => ({
                id: plan._id,
                name: plan.name,
                price: plan.price,
                duration_days: plan.duration_days,
                features: plan.features,
                status: plan.status,
                isPopular: plan.isPopular,
                description: plan.description,
                created_at: plan.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getSubscriptionPlanById = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id).lean();

        if (!plan) {
            return res.status(404).json({
                status: false,
                message: "Subscription plan not found"
            });
        }

        res.status(200).json({
            status: true,
            plan: {
                id: plan._id,
                name: plan.name,
                price: plan.price,
                duration_days: plan.duration_days,
                features: plan.features,
                status: plan.status,
                isPopular: plan.isPopular,
                description: plan.description,
                created_at: plan.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const updateSubscriptionPlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!plan) {
            return res.status(404).json({
                status: false,
                message: "Subscription plan not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Subscription plan updated successfully",
            plan: {
                id: plan._id,
                name: plan.name,
                price: plan.price,
                duration_days: plan.duration_days,
                features: plan.features,
                status: plan.status,
                isPopular: plan.isPopular,
                description: plan.description
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const updatePlanStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const plan = await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!plan) {
            return res.status(404).json({
                status: false,
                message: "Subscription plan not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Plan status updated successfully"
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const expireUserSubscription = async (req, res) => {
    try {
        const subscription = await UserSubscription.findByIdAndUpdate(
            req.params.subscription_id,
            {
                status: 'expired',
                end_date: new Date()
            },
            { new: true }
        );

        if (!subscription) {
            return res.status(404).json({
                status: false,
                message: "Subscription not found"
            });
        }

        // Update user's subscription status
        await User.findByIdAndUpdate(subscription.user_id, {
            subscription: 'free'
        });

        res.status(200).json({
            status: true,
            message: "Subscription marked as expired",
            subscription: {
                id: subscription._id,
                status: subscription.status
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};