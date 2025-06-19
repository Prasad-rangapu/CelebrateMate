import { pool } from "../db";

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
  reminder?: string;
  notification_type?: string;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
  const user = (rows as User[])[0];
  return user || null;
};

export const createUser = async (user: Omit<User, "id" | "is_verified" | "created_at" | "updated_at">): Promise<User> => {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash, phone, birthday) VALUES (?, ?, ?, ?, ?)",
    [user.name, user.email, user.password_hash, user.phone, user.birthday]
  );

  return {
    id: (result as any).insertId,
    ...user,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const editUser = async (user: Pick<User, "id" | "name" | "email" | "phone" | "birthday">): Promise<User> => {
  await pool.execute(
    "UPDATE users SET name = ?, email = ?, phone = ?, birthday = ? WHERE id = ?",
    [user.name, user.email, user.phone, user.birthday, user.id]
  );
  const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [user.id]);
  return (rows as User[])[0];
};
export const findUserById = async (id: number): Promise<User | null> => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  const user = (rows as User[])[0];
  return user || null;
};
export const editUserReminder = async (id: number, reminder: string, notification_type: string): Promise<User> => {
  await pool.execute(
    "UPDATE users SET reminder = ?, notification_type = ? WHERE id = ?",
    [reminder, notification_type, id]
  );
  const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  return (rows as User[])[0];
};
