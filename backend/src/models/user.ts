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
