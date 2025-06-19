import 'dotenv/config';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cron from "node-cron";

import eventRoutes from './routes/events';
import userRoutes from "./routes/users";
import contactRoutes from './routes/contacts';
import { sendReminderEmails } from './controller/reminder'; // ✅ Import your reminder controller

const app = express();

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json());

// API Routes
app.use('/api/events', eventRoutes);
app.use("/api/users", userRoutes);
app.use('/api/contacts', contactRoutes);

// ✅ Cron job to send reminder emails every day at 20:36 IST
cron.schedule("36 20 * * *", async () => {
  console.log("⏰ Running daily reminder email job...");
  await sendReminderEmails();
},
{ 
  timezone: "Asia/Kolkata", // Adjust to your timezone
  // runOnInit: true // Optional: run immediately on startup
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
