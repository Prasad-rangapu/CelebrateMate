import { Router, Request, Response } from 'express';
import { pool } from '../db';

// CREATE NOTIFICATION
const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, message, date } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO notifications (user_id, message, date) VALUES (?, ?, ?)",
      [userId, message, date]
    );
    res.status(201).json({ id: (result as any).insertId, userId, message, date });
  } catch (err) {
    res.status(400).json({ message: "Error creating notification", error: err });
  }
};

// GET ALL NOTIFICATIONS FOR A USER
const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.execute(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY date ASC",
      [userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err });
  }
};

// DELETE NOTIFICATION
const deleteNotification = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.execute("DELETE FROM notifications WHERE id = ?", [
      req.params.id,
    ]);
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Error deleting notification", error: err });
  }
};

const router = Router();

router.post('/', createNotification);
router.get('/:userId', getNotifications);
router.delete('/:id', deleteNotification);

export default router;