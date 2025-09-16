import { pool } from "../db";

export interface UserSettings {
  id?: number;
  user_id: number;
  reminder: string;
  notification_type: string[];
  auto_send_at_midnight: boolean;
  auto_message_text: string;
  auto_notification_methods: string[];
  telegram_id?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  birthday: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  settings?: UserSettings;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.execute(
    `SELECT u.*, us.reminder, us.notification_type, us.auto_send_at_midnight, us.auto_message_text, us.auto_notification_methods, us.telegram_id 
     FROM users u 
     LEFT JOIN user_settings us ON u.id = us.user_id 
     WHERE u.email = ?`,
    [email]
  );
  const user = (rows as User[])[0];
  return user || null;
};

export const createUser = async (user: Omit<User, "id" | "is_verified" | "created_at" | "updated_at">): Promise<User> => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password_hash, phone, birthday) VALUES (?, ?, ?, ?, ?)",
      [user.name, user.email, user.password_hash, user.phone, user.birthday]
    );
    const userId = (result as any).insertId;

    await connection.execute(
      "INSERT INTO user_settings (user_id, auto_message_text) VALUES (?, ?)",
      [userId, `Happy Birthday {name}!`]
    );

    await connection.commit();

    return {
      id: userId,
      ...user,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const editUser = async (user: Pick<User, "id" | "name" | "email" | "phone" | "birthday">): Promise<User> => {
  // Ensure user_settings entry exists for this user
  await pool.execute(
    `INSERT INTO user_settings (user_id, auto_message_text) 
     VALUES (?, ?) 
     ON DUPLICATE KEY UPDATE user_id=user_id`, // This does nothing if the row already exists
    [user.id, `Happy Birthday {name}!`]
  );

  await pool.execute(
    "UPDATE users SET name = ?, email = ?, phone = ?, birthday = ? WHERE id = ?",
    [user.name, user.email, user.phone, user.birthday, user.id]
  );
  return (await findUserById(user.id))!;
};
export const findUserById = async (id: number): Promise<User | null> => {
  const [rows] = await pool.execute(
    `SELECT u.*, us.reminder, us.notification_type, us.auto_send_at_midnight, us.auto_message_text, us.auto_notification_methods, us.telegram_id 
     FROM users u 
     LEFT JOIN user_settings us ON u.id = us.user_id 
     WHERE u.id = ?`,
    [id]
  );
  const user = (rows as User[])[0];
  return user || null;
};

export const updateUserSettings = async (userId: number, settings: Partial<UserSettings>): Promise<User> => {
  const { reminder, notification_type, auto_send_at_midnight, auto_message_text, auto_notification_methods } = settings;

  // Upsert: Ensure a settings row exists before updating.
  // If the user is an old user without a settings row, this will create one.
  await pool.execute(
    `INSERT INTO user_settings (user_id, auto_message_text) 
     VALUES (?, ?) 
     ON DUPLICATE KEY UPDATE user_id=user_id`, // This does nothing if the row already exists
    [userId, `Happy Birthday {name}!`]
  );

  await pool.execute(
    `UPDATE user_settings SET 
       reminder = ?, 
       notification_type = ?, 
       auto_send_at_midnight = ?, 
       auto_message_text = ?, 
       auto_notification_methods = ?
     WHERE user_id = ?`,
    [reminder, JSON.stringify(notification_type), auto_send_at_midnight, auto_message_text, JSON.stringify(auto_notification_methods), userId]
  );

  const updatedUser = await findUserById(userId);
  if (!updatedUser) {
    throw new Error("User not found after updating settings.");
  }
  return updatedUser;
};
