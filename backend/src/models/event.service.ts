import { pool } from "../db";

interface ReminderEvent {
  title: string;
  date: string;
  description: string;
  email: string;
  phone: string;
  user_email: string;
  user_phone: string;
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
        u.email AS email, 
        u.phone AS phone,
        u.email AS user_email,
        u.phone AS user_phone,
        CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED) AS reminder,
        u.notification_type
      FROM events e
      JOIN users u ON e.userId = u.id
      WHERE DATEDIFF(e.date, CURDATE()) = CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED)`
    );

    const [contactRows] = await pool.query(
      `SELECT 
        CONCAT(c.name, "'s Birthday") AS title,
        DATE_FORMAT(STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', DATE_FORMAT(c.birthday, '%m-%d')), '%Y-%m-%d'), '%Y-%m-%d') AS date,
        'Birthday reminder' AS description,
        c.email AS email,
        u.phone AS phone,
        u.email AS user_email,
        u.phone AS user_phone,
        CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED) AS reminder,
        u.notification_type
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      WHERE c.birthday IS NOT NULL
      AND DATEDIFF(
        STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', DATE_FORMAT(c.birthday, '%m-%d')), '%Y-%m-%d'),
        CURDATE()
      ) = CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED)

      UNION

      SELECT 
        CONCAT(c.name, "'s Anniversary") AS title,
        DATE_FORMAT(STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', DATE_FORMAT(c.anniversary, '%m-%d')), '%Y-%m-%d') , '%Y-%m-%d') AS date,
        'Anniversary reminder' AS description,
        c.email AS email,
        u.phone AS phone,
        u.email AS user_email,
        u.phone AS user_phone,
        CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED) AS reminder,
        u.notification_type
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      WHERE c.anniversary IS NOT NULL
      AND DATEDIFF(
        STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', DATE_FORMAT(c.anniversary, '%m-%d')), '%Y-%m-%d'),
        CURDATE()
      ) = CAST(SUBSTRING_INDEX(u.reminder, ' ', 1) AS UNSIGNED)`
    );

    return [
      ...(eventRows as ReminderEvent[]),
      ...(contactRows as ReminderEvent[])
    ];
  } catch (error) {
    console.error("❌ Error fetching events with reminders:", error);
    throw new Error("Could not fetch reminder events.");
  }
};
