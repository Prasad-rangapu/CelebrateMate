import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail,editUser ,findUserById,editUserReminder} from "../models/user";

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

    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, birthday: newUser.birthday } });
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

    res.json({ token, user: { id: user.id, name: user.name, email: user.email ,phone: user.phone,birthday: user.birthday } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editUserById = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, birthday } = req.body;
  const userId = req.params.id || req.body.id;

  if (!userId || !name || !email || !phone || !birthday) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

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
  const userId = req.params.id;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    const user = await findUserById(Number(userId));
  
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
user.password_hash =""; // Exclude password hash from response
    user.is_verified = false; // Exclude verification status from response
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};
export const reminder = async (req: Request, res: Response): Promise<void> => {
  const { reminder, notification_type } = req.body;
  const userId = req.params.id;

  if (!userId || !reminder || !notification_type) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const updatedUser = await editUserReminder(Number(userId), reminder, notification_type);
    res.status(200).json({ message: "Reminder updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating reminder:", err);
    res.status(500).json({ message: "Error updating reminder" });
  }
};
