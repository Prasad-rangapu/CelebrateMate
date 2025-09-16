import 'dotenv/config';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cron from "node-cron";

import eventRoutes from './routes/events';
import userRoutes from "./routes/users";
import contactRoutes from './routes/contacts';
import { sendReminders, sendAutoMessages } from './controller/reminder'; 

const app = express();
app.use(cors({
  origin: ['http://localhost:5173'], 
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.json());
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);

// ⏰ Cron job to send reminders (to the user) daily at 9:00 AM IST
cron.schedule("00 09 * * *", async () => {
  console.log("⏰ Running daily reminder job...");
  await sendReminders();
}, {
  timezone: "Asia/Kolkata",
});

// ⏰ Cron job to send automated messages (to contacts) at midnight IST
cron.schedule("00 00 * * *", async () => {
  console.log("🎂 Running midnight auto-message job...");
  await sendAutoMessages();
}, {
  timezone: "Asia/Kolkata",
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
