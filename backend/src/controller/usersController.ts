import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, editUser, findUserById, updateUserSettings } from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, birthday } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      name,
      email,
      password_hash: hashedPassword,
      phone,
      birthday,
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

    // Fetch the full user object with settings to ensure a complete response
    const fullUser = await findUserById(newUser.id);
    const { password_hash, ...userResponse } = fullUser!;

    res.status(201).json({ token, user: userResponse });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    // Fetch the full user object with settings to ensure a complete response
    const fullUser = await findUserById(user.id);
    const { password_hash, ...userResponse } = fullUser!;

    res.json({ token, user: userResponse });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editUserById = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, birthday } = req.body;
  const userId = req.params.id || req.body.id;

  try {
    const updatedUser = await editUser({
      id: Number(userId),
      name,
      email,
      phone,
      birthday,
    });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id);

  if (!userId || isNaN(userId)) {
    res.status(400).json({ message: "A valid User ID is required" });
    return;
  }

  try {
    // findUserById will now return all fields from the users table
    const user = await findUserById(userId);
  
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // IMPORTANT: Never send the password hash to the client.
    const { password_hash, ...userResponse } = user as any;

    // Ensure settings fields are not null and have the correct type for older users
    userResponse.reminder = userResponse.reminder ?? '1 day';
    userResponse.notification_type = userResponse.notification_type ?? '["Email"]';
    userResponse.auto_send_at_midnight = Number(userResponse.auto_send_at_midnight ?? 0);
    userResponse.auto_message_text = userResponse.auto_message_text ?? 'Happy Birthday {name}!';
    userResponse.auto_notification_methods = userResponse.auto_notification_methods ?? '["SMS"]';
    userResponse.telegram_id = userResponse.telegram_id ?? null;



    res.status(200).json({ user: userResponse });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const settings = async (req: Request, res: Response): Promise<void> => {
  const {
    reminder,
    notification_type,
    auto_send_at_midnight,
    auto_message_text,
    auto_notification_methods,
  } = req.body;
  const userId = req.params.id;

  if (!userId) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const updatedUser = await updateUserSettings(Number(userId), { reminder, notification_type, auto_send_at_midnight, auto_message_text, auto_notification_methods });
    res.status(200).json({ message: "Settings updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ message: "Error updating settings" });
  }
};
