import { Router } from "express";
import * as UsersController from "./user.controller";

const router = Router();

// Example route
router.get("/", UsersController.listUsers);

export default router;