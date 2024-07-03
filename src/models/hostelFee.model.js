import mongoose from "mongoose";
const hostelFeeSchema = new mongoose.Schema(
  {
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
    maintenanceCharge: {
      type: Number,
      required: true,
    },
    parkingCharge: {
      type: Number,
      required: true,
    },
    roomWaterCharge: {
      type: Number,
      required: true,
    },
    roomCharge: {
      type: Number,
      required: true,
    },

    totalCharge: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
//Define a pre-save middleware to calculate totalcharge
hostelFeeSchema.pre("save", function (next) {
  this.totalCharge =
    this.maintenanceCharge +
    this.parkingCharge +
    this.roomWaterCharge +
    this.roomCharge;
  next();
});

export const HostelFee = mongoose.model("HostelFee", hostelFeeSchema);
