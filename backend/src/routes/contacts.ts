import { Router } from "express";
import ContactsController from "../controller/contactsController";

const router = Router();

// POST contact (user_id should be in req.body)
router.post("/", ContactsController.createContact);

// GET contacts by user ID from query: /api/contacts?id
router.get("/", ContactsController.getContacts);

// PUT contact (user_id should be in req.body)
router.put("/", ContactsController.editContact);

// DELETE contact by ID from params: /api/contacts/:id
router.delete("/:id", ContactsController.deleteContact);

// ✅ GET contact events (birthday/anniversary) by user ID: /api/contacts/events/:id
router.get("/events/:id", ContactsController.loadEvents);

export default router;
