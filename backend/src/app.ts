import 'dotenv/config';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cron from "node-cron";

import eventRoutes from './routes/events';
import userRoutes from "./routes/users";
import contactRoutes from './routes/contacts';
import { sendReminders } from './controller/reminder'; // ✅ Combined controller for email + SMS

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173'], // Update this for deployment
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);

// ⏰ Cron job to send reminders daily at 6:45 PM IST
cron.schedule("45 18 * * *", async () => {
  console.log("⏰ Running daily reminder job (email + SMS)...");
  await sendReminders();
}, {
  timezone: "Asia/Kolkata",
  // runOnInit: true // 🔧 Uncomment for testing on server startup
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
