import { Router } from "express";
import ContactsController from "../controller/contactsController";

const router = Router();

// POST contact (user_id should be in query params)
router.post("/", ContactsController.createContact);

// GET contacts by user ID from query: /api/contacts?user_id=
router.get("/", ContactsController.getContacts);

// PUT contact (user_id should be in query params)
router.put("/:id", ContactsController.editContact);

// DELETE contact by ID from params: /api/contacts/:id?user_id=
router.delete("/:id", ContactsController.deleteContact);

// ✅ GET contact events (birthday/anniversary) by user ID: /api/contacts/events/:id
router.get("/events/:id", ContactsController.loadEvents);

export default router;
