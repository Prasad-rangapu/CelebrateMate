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
  telegram_id: string | null;
  notification_type: string;
}

interface AutoMessageEvent {
  title: string;
  type: 'Birthday' | 'Anniversary';
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  user_email: string;
  user_name: string;
  user_phone: string;
  telegram_id: string | null; // Corrected field name
  auto_message_text: string;
  auto_notification_methods: string[];
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
        CAST(SUBSTRING_INDEX(us.reminder, ' ', 1) AS UNSIGNED) AS reminder,
        us.notification_type,
        us.telegram_id
      FROM events e
      JOIN users u ON e.userId = u.id
      JOIN user_settings us ON u.id = us.user_id
      WHERE 
        e.date >= CURDATE() AND
        DATEDIFF(e.date, CURDATE()) = CAST(SUBSTRING_INDEX(us.reminder, ' ', 1) AS UNSIGNED)`
    );

    const [contactRows] = await pool.query(
      `SELECT 
        CONCAT(c.name, "'s Birthday") AS title,
        STR_TO_DATE(
          CONCAT(
            YEAR(CURDATE()) + IF(DATE_FORMAT(c.birthday, '%m-%d') < DATE_FORMAT(CURDATE(), '%m-%d'), 1, 0),
            '-', DATE_FORMAT(c.birthday, '%m-%d')),
          '%Y-%m-%d') AS date,
        'Birthday reminder' AS description,
        c.email AS email,
        u.phone AS phone,
        u.email AS user_email,
        u.phone AS user_phone,
        CAST(SUBSTRING_INDEX(us.reminder, ' ', 1) AS UNSIGNED) AS reminder,
        us.notification_type,
        us.telegram_id
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      JOIN user_settings us ON u.id = us.user_id
      WHERE c.birthday IS NOT NULL
        AND DATEDIFF(
          STR_TO_DATE(
            CONCAT(
              YEAR(CURDATE()) + IF(DATE_FORMAT(c.birthday, '%m-%d') < DATE_FORMAT(CURDATE(), '%m-%d'), 1, 0),
              '-', DATE_FORMAT(c.birthday, '%m-%d')),
            '%Y-%m-%d'),
          CURDATE()
        ) = CAST(SUBSTRING_INDEX(us.reminder, ' ', 1) AS UNSIGNED)

      UNION ALL

      SELECT 
        CONCAT(c.name, "'s Anniversary") AS title,
        STR_TO_DATE(
          CONCAT(
            YEAR(CURDATE()) + IF(DATE_FORMAT(c.anniversary, '%m-%d') < DATE_FORMAT(CURDATE(), '%m-%d'), 1, 0),
            '-', DATE_FORMAT(c.anniversary, '%m-%d')),
          '%Y-%m-%d') AS date,
        'Anniversary reminder' AS description,
        c.email AS email,
        u.phone AS phone,
        u.email AS user_email,
        u.phone AS user_phone,
        CAST(SUBSTRING_INDEX(us.reminder, ' ', 1) AS UNSIGNED) AS reminder,
        us.notification_type,
        us.telegram_id
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      JOIN user_settings us ON u.id = us.user_id
      WHERE c.anniversary IS NOT NULL
        AND DATEDIFF(
          STR_TO_DATE(
            CONCAT(
              YEAR(CURDATE()) + IF(DATE_FORMAT(c.anniversary, '%m-%d') < DATE_FORMAT(CURDATE(), '%m-%d'), 1, 0),
              '-', DATE_FORMAT(c.anniversary, '%m-%d')),
            '%Y-%m-%d'),
          CURDATE()
        ) = CAST(SUBSTRING_INDEX(us.reminder, ' ', 1) AS UNSIGNED)`
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

export const getTodaysContactEvents = async (): Promise<AutoMessageEvent[]> => {
  try {
    // This query now gets settings directly from the `users` table.
    const [rows] = await pool.query(
      `
      -- Birthdays
      SELECT 
        CONCAT(c.name, "'s Birthday") AS title,
        'Birthday' as type,
        c.name AS contact_name,
        c.email AS contact_email,
        c.phone AS contact_phone,
        u.email AS user_email,
        u.name AS user_name,
        u.phone AS user_phone,
        us.telegram_id,
        us.auto_message_text,
        us.auto_notification_methods
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      JOIN user_settings us ON u.id = us.user_id
      WHERE us.auto_send_at_midnight = 1
        AND c.birthday IS NOT NULL
        AND DATE_FORMAT(c.birthday, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')

      UNION ALL

      -- Anniversaries
      SELECT 
        CONCAT(c.name, "'s Anniversary") AS title,
        'Anniversary' as type,
        c.name AS contact_name,
        c.email AS contact_email,
        c.phone AS contact_phone,
        u.email AS user_email,
        u.name AS user_name,
        u.phone AS user_phone,
        us.telegram_id,
        us.auto_message_text,
        us.auto_notification_methods
      FROM contacts c
      JOIN users u ON c.user_id = u.id
      JOIN user_settings us ON u.id = us.user_id
      WHERE us.auto_send_at_midnight = 1
        AND c.anniversary IS NOT NULL
        AND DATE_FORMAT(c.anniversary, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
        
      `
    );
    return rows as AutoMessageEvent[];
  } catch (error) {
    console.error("❌ Error fetching today's contact events for auto-messaging:", error);
    throw new Error("Could not fetch today's contact events.");
  }
};

