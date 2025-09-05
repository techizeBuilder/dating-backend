import SubscriptionPlan from "../models/subscriptionPlanModel.js";
import UserSubscription from "../models/userSubscriptionModel.js";
import paypal from "@paypal/checkout-server-sdk";
import { client } from "../utils/paypal.js";

export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ status: "active" })
      .select("-__v -status")
      .lean();

    res.status(200).json({
      status: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const purchaseSubscription = async (req, res) => {
  try {
    const { plan_id, amount } = req.body;
    const userId = req.user._id;

    console.log("🛒 [PURCHASE SUBSCRIPTION] Called by user:", userId);
    console.log("📦 Requested Plan ID:", plan_id, "💵 Amount:", amount);

    // Step 1: Find the plan
    const plan = await SubscriptionPlan.findOne({
      _id: plan_id,
      status: "active",
    });

    if (!plan) {
      console.log("❌ Plan not found or inactive:", plan_id);
      return res.status(404).json({
        status: false,
        message: "Subscription plan not found",
      });
    }

    console.log(
      "✅ Plan found:",
      plan.name,
      "- Duration (days):",
      plan.duration_days
    );

    // Step 2: Create PayPal payment order
    const orderRequest = new paypal.orders.OrdersCreateRequest();
    orderRequest.prefer("return=representation");

    const formattedAmount = parseFloat(amount).toFixed(2);
    console.log("📤 Creating PayPal order with amount:", formattedAmount);

    orderRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: formattedAmount,
          },
        },
      ],
      application_context: {
        brand_name: "Heart2Get",
        return_url: `https://heart2get-server.onrender.com/api/subscriptions/paypal-success?plan_id=${plan_id}&amount=${amount}&user_id=${userId}`,
        cancel_url: `https://heart2get-server.onrender.com/api/subscriptions/paypal-cancel`,
        user_action: "PAY_NOW",
      },
    });

    const order = await client.execute(orderRequest);
    console.log("✅ PayPal order created:", JSON.stringify(order, null, 2));

    // Step 3: Extract approval URL
    if (order.result.status === "CREATED") {
      const approvalUrl = order.result.links.find(
        (link) => link.rel === "approve"
      )?.href;
      console.log("🔗 Approval URL:", approvalUrl);

      return res.status(200).json({
        status: true,
        message:
          "Payment created successfully. Please complete the payment via PayPal.",
        approvalUrl,
      });
    }

    console.log("❗ Unexpected order status:", order.result.status);
    return res.status(500).json({
      status: false,
      message: "Unable to create PayPal payment order.",
    });
  } catch (error) {
    console.error("💥 Error in purchaseSubscription:", error.message);
    console.error("📛 Full error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const successPayment = async (req, res) => {
  const { token, plan_id, amount, user_id } = req.query;
  console.log(
    "🔁 [SUCCESS PAYMENT] - Called with token:",
    token,
    "plan_id:",
    plan_id,
    "amount:",
    amount
  );

  try {
    // Step 1: Capture the payment from PayPal
    const captureRequest = new paypal.orders.OrdersCaptureRequest(token);
    captureRequest.requestBody({});
    console.log("📤 Sending capture request to PayPal...");

    const captureResponse = await client.execute(captureRequest);
    console.log(
      "✅ PayPal capture response received:",
      JSON.stringify(captureResponse, null, 2)
    );

    const paymentStatus = captureResponse?.result?.status;
    console.log("💳 Payment status:", paymentStatus);

    if (paymentStatus === "COMPLETED") {
      console.log("🎉 Payment COMPLETED. Proceeding with subscription...");

      // Step 2: Find the subscription plan
      const plan = await SubscriptionPlan.findOne({
        _id: plan_id,
        status: "active",
      });
      console.log("📦 Plan lookup result:", plan);

      if (!plan) {
        console.log("❌ Plan not found or inactive.");
        return res.redirect(`https://heart2get.com/payment-failed`);
      }

      // Step 3: Get PayPal user ID (not your internal user ID!)
      const userId = user_id;
      console.log("👤 PayPal Payer ID:", userId);

      // Step 4: Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);
      console.log("📅 Subscription period:", startDate, "→", endDate);

      // Step 5: Save subscription
      const newSub = await UserSubscription.create({
        user_id: userId,
        plan_id,
        start_date: startDate,
        end_date: endDate,
        payment_method: "paypal",
        transaction_id: captureResponse.result.id,
        amount,
        status: "active",
      });
      console.log("📝 Subscription saved:", newSub);

      // Step 6: Redirect to success page
      return res.redirect(`https://heart2get.com/payment-success`);
    }

    // If not completed (e.g., PENDING, IN_PROGRESS, etc.)
    console.log("❗ Payment not completed. Status:", paymentStatus);
    return res.redirect(`https://heart2get.com/payment-failed`);
  } catch (error) {
    console.error("💥 PayPal capture error:", error.message);
    console.error("📛 Full error object:", error);
    return res.redirect(`https://heart2get.com/payment-failed`);
  }
};

export const getMyActiveSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscriptions = await UserSubscription.find({
      user_id: userId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!subscriptions.length) {
      return res.status(200).json({
        status: true,
        subscriptions: [],
        message: "No active subscriptions found",
      });
    }

    const activeDetails = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await SubscriptionPlan.findById(sub.plan_id); // ✅ FIXED HERE

        const now = new Date();
        const endDate = new Date(sub.end_date);
        const daysRemaining = Math.ceil(
          (endDate - now) / (1000 * 60 * 60 * 24)
        );

        return {
          plan_name: plan?.name || "Unknown Plan",
          plan_id: sub.plan_id,
          price: sub.amount,
          start_date: sub.start_date,
          end_date: sub.end_date,
          days_remaining: Math.max(0, daysRemaining),
          payment_method: sub.payment_method,
          transaction_id: sub.transaction_id,
          features: plan?.features || [],
        };
      })
    );

    res.status(200).json({
      status: true,
      subscriptions: activeDetails,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
