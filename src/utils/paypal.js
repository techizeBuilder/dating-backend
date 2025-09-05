import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

export { client };
