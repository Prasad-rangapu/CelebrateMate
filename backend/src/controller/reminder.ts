import { Request, Response } from "express";
import { sendEmail } from "../utils/email";
import { getUpcomingEventsWithReminders } from "../models/event.service";
import dayjs from "dayjs";

export const sendReminderEmails = async (req?: Request, res?: Response): Promise<void> => {
  try {
    const events = await getUpcomingEventsWithReminders();

    let successCount = 0;
    let failCount = 0;

    for (const event of events) {
      const reminderDays = typeof event.reminder === "string" ? parseInt(event.reminder, 10) : event.reminder;

      const emailContent = `
        <h2>🎉 Upcoming Event Reminder</h2>
        <p><strong>Title:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${dayjs(event.date).format("DD MMMM YYYY")}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        <p>This is a friendly reminder ${reminderDays} day(s) before the event.</p>
      `;

      if (event.email) {
        try {
          await sendEmail(
            event.email,
            `📅 Reminder: ${event.title} is in ${reminderDays} day(s)`,
            emailContent
          );
          console.log(`✅ Email sent to ${event.email}`);
          successCount++;
        } catch (emailErr) {
          if (emailErr && typeof emailErr === "object" && "message" in emailErr) {
            console.error(`❌ Failed to send email to ${event.email}:`, (emailErr as { message: string }).message);
          } else {
            console.error(`❌ Failed to send email to ${event.email}:`, emailErr);
          }
          failCount++;
        }

        // Add delay to avoid rate limits (optional but recommended for Gmail)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📬 Email Summary: Sent ${successCount}, Failed ${failCount}`);

    if (res) {
      res.status(200).json({ message: "Reminder emails processed", sent: successCount, failed: failCount });
    }
  } catch (error) {
    console.error("🚨 Error sending reminder emails:", error);
    if (res) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
