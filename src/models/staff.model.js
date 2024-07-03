import mongoose from "mongoose";
import bcrypt from "bcrypt";
const staffSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Staff = mongoose.model("Staff", staffSchema);
