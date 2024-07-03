import mongoose from "mongoose";
const roomChangeSchema = new mongoose.Schema(
  {
    requestRoomNumber: {
      type: Number,
      required: true,
      min: 8,
      max: 30,
    },
    requestblockNumber: {
      type: String,
      enum: ["A", "B", "C", "D"],

      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ChangeRoom = mongoose.model("ChangeRoom", roomChangeSchema);
