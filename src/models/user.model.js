import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    avatar: {
      url: {
        type: String, // cloudinary url
        required: true,
      },

      public_id: {
        type: String,
        required: true,
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    blockNumber: {
      type: String,
      enum: ["A", "B", "C", "D"],

      required: true,
    },
    roomNumber: {
      type: Number,
      required: true,
      min: 8,
      max: 15,
    },
    role: {
      type: String,
      enum: ["Normal", "Admin"],
      default: "Normal",
    },
    accessToken: {
      type: String,
    },
    currentOccupant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChangeRoom",
      default: null,
    },
    resetPasswordToken:{
      type:String
    },
    resetPasswordExpires:{
      type:Date
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorreect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
