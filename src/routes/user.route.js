import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOut,
  updateAccountDetails,
  changeAvatar,
  changeCurrentPassword,
  getAllStaff,
  getHostelFee,
  restPassword,
} from "../controllers/user.controller.js";
import { forgetPassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtAuth } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

router.route("/logout").post(jwtAuth, logOut);
router.route("/forget-Password").post(jwtAuth, forgetPassword);
router.route("/reset-password").patch(jwtAuth, restPassword);

router.route("/avatar").patch(jwtAuth, upload.single("avatar"), changeAvatar);
router.route("/update-account").patch(jwtAuth, updateAccountDetails);
router.route("/changePassword").patch(jwtAuth, changeCurrentPassword);
router.route("/getAllStaff").get(jwtAuth, getAllStaff);
router.route("/gethostelfee/:hostelId").get(jwtAuth, getHostelFee);
export default router;
