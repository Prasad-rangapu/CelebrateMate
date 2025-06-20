import { Request, Response } from "express";
import { sendEmail } from "../utils/email";
import { sendSMS } from "../utils/message";
import { getUpcomingEventsWithReminders } from "../models/event.service";
import dayjs from "dayjs";

// 📞 Utility to format phone number
const formatPhone = (phone: string): string => {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed;
  if (/^\d{10}$/.test(trimmed)) return '+91' + trimmed;
  return ''; // Invalid format fallback
};

export const sendReminders = async (req?: Request, res?: Response): Promise<void> => {
  try {
    const events = await getUpcomingEventsWithReminders();

    let successCount = 0;
    let failCount = 0;

    for (const event of events) {
      const reminderDays = typeof event.reminder === "string" ? parseInt(event.reminder, 10) : event.reminder;

      const formattedDate = dayjs(event.date).format("DD MMMM YYYY");
      const messageText = `🎉 Reminder: ${event.title} is coming up on ${formattedDate}. ${event.description ? `Details: ${event.description}` : ""}`;
      const emailContent = `
        <h2>🎉 Upcoming Event Reminder</h2>
        <p><strong>Title:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        <p>This is a friendly reminder ${reminderDays} day(s) before the event.</p>
      `;

      try {
        // ✉️ Email
        if (event.email && (event.notification_type === "Email" || event.notification_type === "Both")) {
          await sendEmail(
            event.email,
            `📅 Reminder: ${event.title} is in ${reminderDays} day(s)`,
            emailContent
          );
          console.log(`✅ Email sent to ${event.email}`);
          successCount++;
        }

        // 📱 SMS
        if (event.phone && (event.notification_type === "SMS" || event.notification_type === "Both")) {
          const formattedPhone = formatPhone(event.phone);
          if (formattedPhone) {
            await sendSMS(formattedPhone, messageText);
            console.log(`✅ SMS sent to ${formattedPhone}`);
            successCount++;
          } else {
            console.warn(`⚠️ Invalid phone number: ${event.phone}`);
            failCount++;
          }
        }

        // 🕐 Delay to avoid rate limits (optional)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`❌ Failed to send notification for "${event.title}"`, err);
        failCount++;
      }
    }

    console.log(`📬 Notification Summary: Sent ${successCount}, Failed ${failCount}`);

    if (res) {
      res.status(200).json({ message: "Reminders processed", sent: successCount, failed: failCount });
    }
  } catch (error) {
    console.error("🚨 Error sending reminders:", error);
    if (res) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// For manual test endpoint if needed
export const sendRemindersHandler = async (req: Request, res: Response): Promise<void> => {
  await sendReminders(req, res);
};
