import { Staff } from "../models/staff.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";

const registerStaff = asyncHandler(async (req, res) => {
  const { userName, firstName, lastName, jobRole, phoneNumber, password } =
    req.body;
  if (
    [userName, firstName, lastName, jobRole, phoneNumber, password].every(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All the fields are required!!!");
  }
  const existStaff = await Staff.findOne({
    $or: [{ userName }, { phoneNumber }],
  });
  if (existStaff) {
    throw new ApiError(
      400,
      "Staff already exits with this UserName and phoneNumber!!!"
    );
  }
  const staff = await Staff.create({
    firstName,
    lastName,
    userName,
    jobRole,
    phoneNumber,
    password,
  });

  const createdStaff = await Staff.findById(staff._id).select("-password");
  if (!createdStaff) {
    throw new ApiError(400, "Failed to create staff!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdStaff, "Successfully created Staff!!!"));
});
const getStaffById = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  if (!isValidObjectId(staffId)) {
    throw new ApiError(400, "Invalid staffId!!!");
  }
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(400, "There is no staff created!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, staff, "Successfully fetched staff by id!!!"));
});

const deleteStaff = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  if (!isValidObjectId(staffId)) {
    throw new ApiError(400, "Invalid staffId!!!");
  }
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new ApiError(400, "There is no staff!!!");
  }
  await Staff.findByIdAndDelete(staffId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Deleted Staff successfully!!!"));
});
export { registerStaff, deleteStaff, getStaffById };
