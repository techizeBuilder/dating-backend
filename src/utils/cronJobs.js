import cron from "node-cron";
import UserSubscription from "../models/userSubscriptionModel.js";

export const autoExpireSubscriptions = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running subscription expiry check...");

    const now = new Date();
    // its fine
    try {
      const result = await UserSubscription.updateMany(
        {
          end_date: { $lt: now },
          status: "active",
        },
        { $set: { status: "expired" } }
      );

      console.log(
        `✅ Updated ${result.modifiedCount} subscriptions to expired.`
      );
    } catch (err) {
      console.error("❌ Error updating subscriptions:", err.message);
    }
  });
};
