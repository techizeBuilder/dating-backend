import Payment from '../../models/paymentModel.js';
import User from '../../models/userModel.js';
import SubscriptionPlan from '../../models/subscriptionPlanModel.js';

export const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const totalPayments = await Payment.countDocuments();
        console.log('total payment', totalPayments);
        const totalPages = Math.ceil(totalPayments / per_page);

        const payments = await Payment.find()
            .populate('user_id', 'name email')
            .populate('plan_id', 'name')
            .sort('-createdAt')
            .skip(skip)
            .limit(per_page)
            .lean();
        console.log('payment', payments);
        // const formattedPayments = payments.map(payment => ({
        //     id: payment._id,
        //     user_id: payment.user_id._id,
        //     user_name: payment.user_id.name,
        //     plan_name: payment.plan_id.name,
        //     amount: payment.amount,
        //     payment_method: payment.payment_method,
        //     transaction_id: payment.transaction_id,
        //     payment_response: payment.payment_response,
        //     status: payment.status,
        //     created_at: payment.createdAt
        // }));
        res.status(200).json({
            status: true,
            data: {
                current_page: page,
                total_pages: totalPages,
                total_records: totalPayments,
                payments: payments
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const { amount, status, plan_name } = req.body;

        const payment = await Payment.findById(req.params.payment_id)
            .populate('plan_id');

        if (!payment) {
            return res.status(404).json({
                status: false,
                message: "Payment record not found"
            });
        }

        // Update payment details
        if (amount) payment.amount = amount;
        if (status) payment.status = status;

        // If plan name is provided, update the subscription plan
        if (plan_name) {
            const plan = await SubscriptionPlan.findOne({ name: plan_name });
            if (!plan) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid subscription plan name"
                });
            }
            payment.plan_id = plan._id;
        }

        await payment.save();

        res.status(200).json({
            status: true,
            message: "Payment updated successfully",
            payment: {
                id: payment._id,
                amount: payment.amount,
                status: payment.status
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.payment_id);

        if (!payment) {
            return res.status(404).json({
                status: false,
                message: "Payment record not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Payment record deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};