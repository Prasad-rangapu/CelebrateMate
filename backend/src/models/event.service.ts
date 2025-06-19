import { pool } from "../db";

interface ReminderEvent {
  title: string;
  date: string;
  description: string;
  email: string;
  reminder: number;
  notification_type: string;
}

export const getUpcomingEventsWithReminders = async (): Promise<ReminderEvent[]> => {
  try {
    const [eventRows] = await pool.query(
      `SELECT 
        e.title, 
        e.date, 
        e.description, 
        u.email, 
        u.reminder, 
        u.notification_type
      FROM events e
      JOIN users u ON e.userId = u.id
      WHERE DATEDIFF(e.date, CURDATE()) = CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED)`
    );

    const [contactRows] = await pool.query(
      `SELECT 
        CONCAT(c.name, "'s Birthday") AS title,
        c.birthday AS date,
        'Birthday reminder' AS description,
        c.email,
        u.reminder,
        u.notification_type
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      WHERE c.birthday IS NOT NULL
      AND DATEDIFF(c.birthday, CURDATE()) = CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED)
      
      UNION
      
      SELECT 
        CONCAT(c.name, "'s Anniversary") AS title,
        c.anniversary AS date,
        'Anniversary reminder' AS description,
        c.email,
        u.reminder,
        u.notification_type
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      WHERE c.anniversary IS NOT NULL
      AND DATEDIFF(c.anniversary, CURDATE()) = CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED)`
    );

    return [...(eventRows as ReminderEvent[]), ...(contactRows as ReminderEvent[])];
  } catch (error) {
    console.error("Error fetching events with reminders:", error);
    throw new Error("Could not fetch reminder events.");
  }
};
