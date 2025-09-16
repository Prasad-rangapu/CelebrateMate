import express from "express";
import * as usersController from "../controller/usersController";

const router = express.Router();

router.post("/signup", usersController.signup);
router.post("/login", usersController.login);
router.put("/:id",usersController.editUserById)
router.get("/:id", usersController.getUserById);
router.put("/:id/settings", usersController.settings);

export default router;
