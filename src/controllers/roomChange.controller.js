import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ChangeRoom } from "../models/roomChange.model.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

const changeRequest = asyncHandler(async (req, res) => {
  const { requestblockNumber, requestRoomNumber } = req.body;
  if (!(requestRoomNumber && requestblockNumber)) {
    throw new ApiError(400, "All the fields are required!!!");
  }
  const user = await User.findById(req.validUser._id);

  if (
    (requestblockNumber.toString() && requestblockNumber.toString()) ===
    (user.blockNumber.toString() && user.blockNumber.toString())
  ) {
    throw new ApiError(400, "It has same  blockNumber and roomNumber!!");
  }

  if (user.currentOccupant) {
    throw new ApiError(400, "User already has a room assigned!!!");
  }
  const changeRoom = await ChangeRoom.create({
    requestblockNumber,
    requestRoomNumber,
    user: req.validUser?._id,
  });
  user.currentOccupant = changeRoom._id;

  await user.save();

  const createChangeRoom = await ChangeRoom.findById(changeRoom?._id).populate(
    "user"
  );
  if (!createChangeRoom) {
    throw new ApiError(400, "Failed to change the room!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, createChangeRoom, "Successfully Change the room!!!")
    );
});

const adminAcceptOrReject = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!isValidObjectId(requestId)) {
    throw new ApiError(400, "Invalid request Id!!!");
  }
  const changeRequest = await ChangeRoom.findById(requestId);

  changeRequest.status = !changeRequest.status;
  await changeRequest.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: changeRequest.status },
        "Successfully toggle !!!"
      )
    );
});

export { changeRequest, adminAcceptOrReject };
