import { Request, Response } from "express";
import { pool } from "../db";

// CREATE CONTACT
const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );
    res.status(201).json({ id: (result as any).insertId, name, email, phone });
  } catch (err) {
    res.status(400).json({ message: "Error creating contact", error: err });
  }
};

// GET ALL CONTACTS
const getContacts = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM contacts ORDER BY name ASC");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching contacts", error: err });
  }
};

export default { createContact, getContacts };