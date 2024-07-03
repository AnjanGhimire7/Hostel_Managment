import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Issue } from "../models/issue.model.js";
import { User } from "../models/user.model.js";

const registerIssue = asyncHandler(async (req, res) => {
  const {
    roomNumber,
    blockNumber,
    emailId,
    phoneNumber,
    issueFacing,
    comment,
  } = req.body;

  if (
    [
      blockNumber,
      emailId,
      phoneNumber.toString(),
      roomNumber.toString(),
      issueFacing,
      comment,
    ].every((fields) => fields?.trim() === "")
  ) {
    throw new ApiError(400, "All the fiels are required!!!");
  }

  const user = await User.findById(req.validUser?._id);
  if (roomNumber !== user.roomNumber) {
    throw new ApiError(
      400,
      "Room Number doesn't match with roomNumber while registering!!! "
    );
  }
  if (blockNumber !== user.blockNumber) {
    throw new ApiError(
      400,
      "Block Number doesn't match with blockNumber while registering!!! "
    );
  }
  if (emailId !== user.email) {
    throw new ApiError(
      400,
      "Email doesn't match with email while registering!!! "
    );
  }
  if (phoneNumber !== user.phoneNumber) {
    throw new ApiError(
      400,
      "PhoneNumber doesn't match with phoneNumber while registering!!! "
    );
  }

  const createIssue = await Issue.create({
    roomNumber,
    blockNumber,
    emailId,
    phoneNumber,
    issueFacing,
    comment,
  });
  if (!createIssue) {
    throw new ApiError(400, "Failed to create issue!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createIssue, "Successfuly creating issue!!!"));
});

const getAllIssues = asyncHandler(async (req, res) => {
  const { page = 1, limit = 2 } = req.query;

  const pageLimit = parseInt(limit);
  const newpage = parseInt(page);
  const pageSkip = (newpage - 1) * pageLimit;

  const user = await User.findById(req.validUser?._id);

  const issueAggregate = await Issue.aggregate([
    {
      $match: {
        roomNumber: user.roomNumber,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: pageLimit,
    },
    {
      $skip: pageSkip,
    },
  ]);

  console.log(issueAggregate);

  return res
    .status(200)
    .json(
      new ApiResponse(200, issueAggregate, "All issues fetched successfully")
    );
});
export { registerIssue, getAllIssues };
