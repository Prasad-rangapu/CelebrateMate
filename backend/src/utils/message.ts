// utils/sms.ts
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendSMS = async (to: string, message: string): Promise<void> => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: to,
    });
    console.log(`✅ SMS sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send SMS to ${to}`, err);
  }
};
