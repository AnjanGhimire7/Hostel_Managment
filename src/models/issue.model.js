import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    issueFacing: {
      type: String,
      enum: [
        "Bathroom",
        "Bedroom",
        "Electricity",
        "Furniture",
        "MeshFood",
        "Water",
      ],
      default: "Bathroom",
    },
    comment: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: Number,
      required: true,
      min: 8,
      max: 15,
    },
    blockNumber: {
      type: String,
      enum: ["A", "B", "C", "D"],

      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Issue = mongoose.model("Issue", issueSchema);
