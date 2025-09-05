import twilio from "twilio";

// Twilio config from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// ✅ 1. Real 4-digit OTP Generator
export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates 1000-9999
};

// ✅ 2. Real SMS Sender using Twilio
export const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to,
    });
    console.log(`✅ SMS sent to ${to}. SID: ${result.sid}`);
  } catch (error) {
    console.error("❌ Twilio Error:", error);

    // Twilio error 21608 = “Permission to send an SMS has not been enabled for the region”
    if (
      error.code === 21608 ||
      error.message?.includes("Permission to send an SMS has not been enabled")
    ) {
      throw new Error("SMS delivery is not allowed to this region.");
    }

    // Fallback for any other Twilio failure
    throw new Error("Failed to send SMS. Please try again later.");
  }
};
