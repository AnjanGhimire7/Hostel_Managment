import { Router } from "express";
import { jwtAuth, verifyPermission } from "../middlewares/auth.middleware.js";
import { createHostelFee } from "../controllers/hostel.controller.js";
const router = Router();
router.use(jwtAuth);
router
  .route("/createhostelfee")
  .post(verifyPermission(["Admin"]), createHostelFee);
export default router;
