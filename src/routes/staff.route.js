import { Router } from "express";
import {
  registerStaff,
  deleteStaff,
  getStaffById,
} from "../controllers/staff.controller.js";
import { verifyPermission, jwtAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router
  .route("/registerStaff")
  .post(jwtAuth, verifyPermission(["Admin"]), registerStaff);
router
  .route("/deletestaff/:staffId")
  .delete(jwtAuth, verifyPermission(["Admin"]), deleteStaff);
router
  .route("/getStaff/:staffId")
  .get(jwtAuth, verifyPermission(["Admin"]), getStaffById);
export default router;
