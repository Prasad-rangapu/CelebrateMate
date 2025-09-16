import { Request, Response } from "express";
import { sendEmail } from "../utils/email";
import { sendSMS } from "../utils/message";
import { getUpcomingEventsWithReminders, getTodaysContactEvents } from "../models/event.service";
import dayjs from "dayjs";
import { sendTelegramMessage } from "../utils/telegram";

// 📞 Utility to format phone number
const formatPhone = (phone: string): string => {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed;
  if (/^\d{10}$/.test(trimmed)) return '+91' + trimmed;
  return ''; // Invalid format fallback
};

// 📦 Utility to safely parse JSON array from DB
const parseNotificationType = (type: any): string[] => {
  if (Array.isArray(type)) return type;
  try {
    const parsed = JSON.parse(type);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Handles sending reminders (e.g., 1 day before)
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

      const notificationMethods = parseNotificationType(event.notification_type);

      try {
        // ✉️ Email
        if (event.email && notificationMethods.includes("Email")) {
          await sendEmail(
            event.user_email,
            `📅 Reminder: ${event.title} is in ${reminderDays} day(s)`,
            emailContent
          );
          console.log(`✅ Email sent to ${event.user_email}`);
          successCount++;
        }

        // 📱 SMS
        if (event.user_phone && notificationMethods.includes("SMS")) {
          const formattedPhone = formatPhone(event.user_phone);
          if (formattedPhone) {
            await sendSMS(formattedPhone, messageText);
            console.log(`✅ SMS sent to ${formattedPhone}`);
            successCount++;
          } else {
            console.warn(`⚠️ Invalid phone number for user: ${event.user_phone}`);
            failCount++;
          }
        }

        // ✈️ Telegram
        if (event.telegram_id && notificationMethods.includes("Telegram")) {
          await sendTelegramMessage(event.telegram_id, messageText);
          console.log(`✅ Telegram reminder sent to user ${event.telegram_id}`);
          successCount++;
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

// Handles sending automated messages at midnight on the event day
export const sendAutoMessages = async (req?: Request, res?: Response): Promise<void> => {
  try {
    const events = await getTodaysContactEvents();

    let successCount = 0;
    let failCount = 0;

    for (const event of events) {
      // Personalize message
      let messageText = event.auto_message_text.replace('{name}', event.contact_name);

      // If the default message is used, make it anniversary-friendly
      if (event.type === 'Anniversary' && event.auto_message_text.toLowerCase().includes('birthday')) {
        messageText = `Happy Anniversary, ${event.contact_name}!`;
      }

      // Append the sender's name
      const finalMessage = `${messageText} - from ${event.user_name}`;
      const emailContent = `<p>${finalMessage}</p>`;
      const subject = `Happy ${event.type}!`;

      const notificationMethods = parseNotificationType(event.auto_notification_methods);

      try {
        // ✉️ Email
        if (event.contact_email && notificationMethods.includes("Email")) {
          await sendEmail(
            event.contact_email,
            subject,
            emailContent
          );
          console.log(`✅ Auto-Email sent to ${event.contact_email}`);
          successCount++;
        }

        // 📱 SMS
        if (event.contact_phone && notificationMethods.includes("SMS")) {
          const formattedPhone = formatPhone(event.contact_phone);
          if (formattedPhone) {
            await sendSMS(formattedPhone, finalMessage);
            console.log(`✅ Auto-SMS sent to ${formattedPhone}`);
            successCount++;
          }
        }

      } catch (err) {
        console.error(`❌ Failed to send auto-notification for "${event.title}" to ${event.contact_name}`, err);
        failCount++;
      }
    }

    console.log(`📬 Auto-Message Summary: Sent ${successCount}, Failed ${failCount}`);

    if (res) {
      res.status(200).json({ message: "Auto-messages processed", sent: successCount, failed: failCount });
    }
  } catch (error) {
    console.error("🚨 Error sending auto-messages:", error);
  }
};

export const sendRemindersHandler = async (req: Request, res: Response): Promise<void> => {
  await sendReminders(req, res);
};
