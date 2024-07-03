import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HostelFee } from "../models/hostelFee.model.js";
const createHostelFee = asyncHandler(async (req, res) => {
  const {
    roomNumber,
    blockNumber,
    maintenanceCharge,
    parkingCharge,
    roomWaterCharge,
    roomCharge,
  } = req.body;
  if (
    [
      roomCharge,
      roomNumber,
      blockNumber,
      maintenanceCharge,
      parkingCharge,
      roomWaterCharge,
    ].every((field) => field.toString().trim() === "")
  ) {
    throw new ApiError(400, "All the fields are required!!!");
  }
  const existedHostelFee = await HostelFee.findOne({
    $and: [{ roomNumber }, { blockNumber }],
  });
  if (existedHostelFee) {
    throw new ApiError(
      400,
      "Fee is already allocated for this roomNumber and blockNumber"
    );
  }
  const hostelFee = await HostelFee.create({
    roomNumber,
    blockNumber,
    maintenanceCharge,
    parkingCharge,
    roomCharge,
    roomWaterCharge,
  });
  if (!hostelFee) {
    throw new ApiError(400, "Failed to create hostelFee!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, hostelFee, "Successfully created HostelFee!!!"));
});
export { createHostelFee };
