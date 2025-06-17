import 'dotenv/config';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import eventRoutes from './routes/events';
import userRoutes from "./routes/users";
import notificationRoutes from "./routes/notifications";
import contactRoutes from './routes/contacts';

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
app.use("/api/notifications", notificationRoutes);
app.use('/api/contacts', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
