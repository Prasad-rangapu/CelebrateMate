// filepath: c:\Users\ranga\OneDrive\Desktop\CelebrateMate\CelebrateMate\backend\models\event.ts
import { pool } from "../db";
  

interface Event {
  id?: number;
  title: string;
  date: string;
  description?: string;
  userId: number;
  reminder?: string;
}

// Function to create a new event
const createEvent = async (event: Event) => {
  const { title, date, description=null, userId, reminder=null } = event;
  const [result] = await pool.execute(
    "INSERT INTO events (title, date, description, userId, reminder) VALUES (?, ?, ?, ?, ?)",
    [title, date, description, userId, reminder]
  );
  return { id: (result as any).insertId, title, date, description, userId, reminder };
};

// Function to get all events for a user
const getEventsByUserId = async (userId: number) => {
  const [rows] = await pool.execute(
    "SELECT * FROM events WHERE userId = ? AND DATE(date) >= CURDATE() ORDER BY date ASC",
    [userId]
  );
  return rows;
};

// Function to get an event by its ID
const getEventById = async (id: number) => {
  const [rows] = await pool.execute("SELECT * FROM events WHERE id = ?", [id]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

// Function to update an event
const updateEvent = async (id: number, event: Partial<Event>) => {
  const { title, date, description } = event;
  const [result] = await pool.execute(
    "UPDATE events SET title = ?, date = ?, description = ? WHERE id = ?",
    [title, date, description, id]
  );
  return (result as any).affectedRows > 0;
};

// Function to delete an event
const deleteEvent = async (id: number) => {
  const [result] = await pool.execute("DELETE FROM events WHERE id = ?", [id]);
  return (result as any).affectedRows > 0;
};

export default {
  createEvent,
  getEventsByUserId,
  getEventById,
  updateEvent,
  deleteEvent,
};