import { Request, Response } from "express";
import { pool } from "../db";
import dayjs from "dayjs";


// CREATE CONTACT
const createContact = async (req: Request, res: Response):Promise<void> => {
  // Note: It's better to get user_id from a decoded JWT token in middleware for security
  try {
    let { name, email, phone, birthday, anniversary } = req.body;
    const user_id = req.query.user_id;

    if (!user_id || !name) {
      res.status(400).json({ message: "User ID and contact name are required." });
      return;
    }

    // Ensure empty strings are stored as NULL
    birthday = birthday || null;
    anniversary = anniversary || null;

    const [result] = await pool.execute(
      "INSERT INTO contacts (name, email, phone, birthday, anniversary, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone, birthday, anniversary, user_id]
    );

    res.status(201).json({
      id: (result as any).insertId,
      name,
      email,
      phone,
      birthday,
      anniversary,
      user_id,
    }); 
  } catch (err) {
    console.error("Error creating contact:", err);
    res.status(500).json({ message: "Error creating contact", error: err });
  }
};

// GET ALL CONTACTS
const getContacts = async (req: Request, res: Response):Promise<void>  => {
  try {
    const userId = req.query.user_id; // Changed from 'id' to 'user_id' for consistency
    if (!userId) {
      res.status(400).json({ message: "User ID is required in query" });
      return;
    }

    const [rows] = await pool.execute(
      "SELECT * FROM contacts WHERE user_id = ? ORDER BY name ASC",
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ message: "Error fetching contacts", error: err });
  }
};
const editContact = async (req: Request, res: Response):Promise<void> => {
  try {
    const { id } = req.params; // Get ID from URL parameter
    const { name, email, phone, birthday, anniversary } = req.body;
    const user_id = req.query.user_id;

    if (!id || !user_id) {
      res.status(400).json({ message: "Contact ID and User ID are required." });
      return;
    }

    // Build the update query dynamically to only change provided fields
    const fieldsToUpdate: { [key: string]: any } = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (email !== undefined) fieldsToUpdate.email = email;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (birthday !== undefined) fieldsToUpdate.birthday = birthday || null;
    if (anniversary !== undefined) fieldsToUpdate.anniversary = anniversary || null;

    const fieldNames = Object.keys(fieldsToUpdate);
    if (fieldNames.length === 0) {
      res.status(400).json({ message: "No fields to update." });
      return;
    }

    const setClause = fieldNames.map(field => `${field} = ?`).join(', ');
    const [result] = await pool.execute(
      `UPDATE contacts SET ${setClause} WHERE id = ? AND user_id = ?`,
      [...Object.values(fieldsToUpdate), id, user_id]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: "Contact not found or you do not have permission to edit it." });
      return;
    }

    // Fetch the complete, updated contact from the database to ensure a consistent response
    const [updatedRows] = await pool.execute("SELECT * FROM contacts WHERE id = ?", [id]);
    const updatedContact = (updatedRows as any)[0];

    res.status(200).json(updatedContact);
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(500).json({ message: "Error updating contact", error: err });
  }
};
const deleteContact = async (req: Request, res: Response):Promise<void> => {
  try { 
    const contactId = req.params.id;
    const userId = req.query.user_id; // Security: Ensure user can only delete their own contact

    if (!contactId || !userId) {
      res.status(400).json({ message: "Contact ID and User ID are required" });
      return;
    }

    // Security: Added user_id to the WHERE clause
    const [result] = await pool.execute(
      "DELETE FROM contacts WHERE id = ? AND user_id = ?",
      [contactId, userId]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Error deleting contact", error: err });  
  }
};

export const loadEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const [rows]: any = await pool.execute(
      `SELECT 
         id,
         name,
         birthday,
         anniversary
       FROM contacts
       WHERE user_id = ?`,
      [userId]
    );

    const today = dayjs();
    const contactEvents = [];

    for (const row of rows) {
      if (row.birthday) {
        const birthdayThisYear = dayjs(row.birthday).year(today.year());
        contactEvents.push({
          title: `Birthday: ${row.name}`,
          date: birthdayThisYear.format("YYYY-MM-DD"),
          description: `Birthday of ${row.name}`,
        });
      }

      if (row.anniversary) {
        const anniversaryThisYear = dayjs(row.anniversary).year(today.year());
        contactEvents.push({
          title: `Anniversary: ${row.name}`,
          date: anniversaryThisYear.format("YYYY-MM-DD"),
          description: `Anniversary of ${row.name}`,
        });
      }
    }

    contactEvents.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
    res.status(200).json(contactEvents);
  } catch (err) {
    console.error("Error loading contact events:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};



export default { createContact, getContacts, editContact, deleteContact,loadEvents };
