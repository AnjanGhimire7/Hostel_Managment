import { Router } from "express";
import { jwtAuth, verifyPermission } from "../middlewares/auth.middleware.js";
import {
  changeRequest,
  adminAcceptOrReject,
} from "../controllers/roomChange.controller.js";

const router = Router();

router.route("/").post(jwtAuth, changeRequest);
router.route("/toggle/:requestId").patch(jwtAuth,verifyPermission(["Admin"]), adminAcceptOrReject);
export default router;
