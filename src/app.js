import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//importing route
import userRouter from "./routes/user.route.js";
import staffRouter from "./routes/staff.route.js";
import issueRouter from "./routes/issue.route.js";
import hosteFeeRouter from "./routes/hostelFee.route.js";
import changeRoomRouter from "./routes/roomChange.route.js";
//declaring routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/staffs", staffRouter);
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/hostelFees", hosteFeeRouter);
app.use("/api/v1/changeRoom", changeRoomRouter);
export { app };
