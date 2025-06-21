import { Request, Response } from "express";
import { pool } from "../db";
import dayjs from "dayjs";


// CREATE CONTACT
const createContact = async (req: Request, res: Response):Promise<void> => {
  try {
    var { name, email, phone, birthday, anniversary } = req.body;
    const user_id = req.query.user_id;
if(!birthday) {
  birthday = null;}
if(!anniversary) {
  anniversary = null;}  
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
    res.status(400).json({ message: "Error creating contact", error: err });
  }
};

// GET ALL CONTACTS
const getContacts = async (req: Request, res: Response):Promise<void>  => {
  try {
    const userId = req.query.id;
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
    res.status(500).json({ message: "Error fetching contacts", error: err });
  }
};
const editContact = async (req: Request, res: Response):Promise<void> => {
  try {
    const { id, name, email, phone, birthday, anniversary } = req.body;
    const user_id = req.query.user_id;

    if (!id || !user_id) {
      res.status(400).json({ message: "Contact ID and User ID are required" });
      return;
    }

    await pool.execute(
      "UPDATE contacts SET name = ?, email = ?, phone = ?, birthday = ?, anniversary = ? WHERE id = ? AND user_id = ?",
      [name, email, phone, birthday, anniversary, id, user_id]
    );

    res.status(200).json({ message: "Contact updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating contact", error: err });
  }
};
const deleteContact = async (req: Request, res: Response):Promise<void> => {
  try { 
    const contactId = req.params.id;
    

    if (!contactId) {
      res.status(400).json({ message: "Contact ID and User ID are required" });
      return;
    }

    const [result] = await pool.execute(
      "DELETE FROM contacts WHERE id = ?",
      [contactId]
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
