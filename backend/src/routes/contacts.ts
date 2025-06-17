import { Router } from "express";
import ContactsController from "../controller/contactsController";

const router = Router();

router.post("/", ContactsController.createContact);
router.get("/", ContactsController.getContacts);

export default router;