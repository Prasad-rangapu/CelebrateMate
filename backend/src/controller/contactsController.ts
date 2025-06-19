import { Request, Response } from "express";
import { pool } from "../db";

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
// const loadEvents=async (req: Request, res: Response):Promise<void> => {
//   try {
//     const userId = req.query.id;
//     if (!userId) {
//       res.status(400).json({ message: "User ID is required in query" });
//       return;
//     }

//     const [rows] = await pool.execute(
//       "SELECT * FROM contacts WHERE user_id = ? AND (birthday IS NOT NULL OR anniversary IS NOT NULL) ORDER BY birthday, anniversary",
//       [userId]
//     );

//     res.status(200).json(rows);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching events", error: err }); 
//   }
// };
// const loadEvents = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = req.params.id;
//     if (!userId) {
//       res.status(400).json({ message: "User ID is required in URL params" });
//       return;
//     }

//     const [rows] = await pool.execute(
//       `SELECT 
//          id, 
//          CASE 
//            WHEN birthday IS NOT NULL THEN CONCAT('Birthday: ', name)
//            WHEN anniversary IS NOT NULL THEN CONCAT('Anniversary: ', name)
//          END AS title,
//          COALESCE(birthday, anniversary) AS date,
//          '' AS description
//        FROM contacts
//        WHERE user_id = ? AND (birthday IS NOT NULL OR anniversary IS NOT NULL)
//        ORDER BY date`,
//       [userId]
//     );

//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("Error fetching contact events:", err);
//     res.status(500).json({ message: "Error fetching contact events", error: err });
//   }
// };
// export const loadEvents = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = req.params.id;
//     if (!userId) {
//       res.status(400).json({ message: "User ID is required in URL params" });
//       return;
//     }

//     const [rows] = await pool.execute(
//       `
//       SELECT id, CONCAT('Birthday: ', name) AS title, birthday AS date, '' AS description
//       FROM contacts
//       WHERE user_id = ? AND birthday IS NOT NULL

//       UNION ALL

//       SELECT id, CONCAT('Anniversary: ', name) AS title, anniversary AS date, '' AS description
//       FROM contacts
//       WHERE user_id = ? AND anniversary IS NOT NULL

//       ORDER BY date ASC
//       `,
//       [userId, userId]
//     );

//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("Error fetching contact events:", err);
//     res.status(500).json({ message: "Error fetching contact events", error: err });
//   }
// };
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

    const contactEvents = [];

    for (const row of rows) {
      if (row.birthday) {
        contactEvents.push({
          title: `Birthday: ${row.name}`,
          date: row.birthday,
          description: `Birthday of ${row.name}`,
        });
      }
      if (row.anniversary) {
        contactEvents.push({
          title: `Anniversary: ${row.name}`,
          date: row.anniversary,
          description: `Anniversary of ${row.name}`,
        });
      }
    }

    res.status(200).json(contactEvents);
  } catch (err) {
    console.error("Error loading contact events:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export default { createContact, getContacts, editContact, deleteContact,loadEvents };
