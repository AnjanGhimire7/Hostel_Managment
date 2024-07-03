import { Router } from "express";
import { jwtAuth } from "../middlewares/auth.middleware.js";
import {
  registerIssue,
  getAllIssues,
} from "../controllers/issue.controller.js";

const router = Router();
router.use(jwtAuth);
router.route("/create").post(registerIssue);
router.route("/allissues").get(getAllIssues);

export default router;
