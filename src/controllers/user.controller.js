import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Staff } from "../models/staff.model.js";
import { HostelFee } from "../models/hostelFee.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { error, log } from "console";
const generatedAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access token and refresh token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    userName,
    lastName,
    email,
    phoneNumber,
    password,
    roomNumber,
    blockNumber,
    role,
  } = req.body;
  if (
    [
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      roomNumber,
      blockNumber,
    ].every((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All the field are required!!!");
  }
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(400, "User already exists!!!");
  }
  //This is done because there will only be one admin user!!!
  const adminUser = await User.findOne({ role: "Admin" });
  if (role === "Admin" && adminUser) {
    throw new ApiError(403, "User with admin role already exist");
  }
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "No avatarLocalPath!!!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is requird!!!");
  }
  const user = await User.create({
    firstName,
    lastName,
    email,
    userName,
    phoneNumber,
    avatar: {
      url: avatar?.url,
      public_id: avatar?.public_id,
    },
    roomNumber,
    blockNumber,
    password,
    role,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(400, "Failed to created User!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "Successfully created User!!!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!(password && email)) {
    throw new ApiError(403, "Email and password is required !!!");
  }
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new ApiError(403, "user doesn't exist!!!");
  }

  const isPasswordValid = await user.isPasswordCorreect(password);

  if (!isPasswordValid) {
    throw new ApiError(403, "user credinatals incorrect!!!");
  }
  const { accessToken } = await generatedAccessToken(user._id);

  const LogedInUser = await User.findById(user._id).select(
    "-password -accessToken "
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          User: LogedInUser,
          accessToken,
        },
        "User logged In Successfully"
      )
    );
});
const logOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req?.validUser?._id,
    {
      $unset: {
        accessToken: "",
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Logout user successsfully!!!"));
});
const changeAvatar = asyncHandler(async (req, res) => {
  const updateAvatarLocalPath = req.file.path;
  if (!updateAvatarLocalPath) {
    throw new ApiError(400, "avatarlocalpath is required!!!");
  }
  const user = await User.findById(req?.validUser?._id).select(
    "-password -accessToken"
  );
  if (updateAvatarLocalPath) {
    const newAvatarLocalPath = await uploadOnCloudinary(updateAvatarLocalPath);
    if (!newAvatarLocalPath?.url) {
      throw new ApiError(401, "failed to upload newlocalpath!!!");
    }
    const avatarToDelete = user.avatar.public_id;
    await deleteOnCloudinary(avatarToDelete);
    user.avatar = newAvatarLocalPath;
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully updated avatar!!!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if ([firstName, lastName, email].some((fields) => fields === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const updateUser = await User.findByIdAndUpdate(
    req.validUser._id,
    {
      $set: {
        firstName,
        lastName,
        email,
      },
    },
    { new: true }
  ).select("-password -accessToken");
  return res
    .status(200)
    .json(
      new ApiResponse(200, updateUser, "Account details updated successfully")
    );
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(402, "password doesn't match!!!");
  }
  const user = await User.findById(req.validUser?._id);
  const isPasswordCorrect = await user.isPasswordCorreect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Password changed successfully"));
});
const getAllStaff = asyncHandler(async (req, res) => {
  const { page = 1, limit = 2 } = req.query;

  const newPage = parseInt(page);
  const pageLimit = parseInt(limit);
  const pageSkip = (newPage - 1) * pageLimit;
  const user = await User.findById(req.validUser?._id);
  if (!user) {
    throw new ApiError(400, "No user created!!!");
  }
  const staff = await Staff.find()
    .sort({ createdAt: -1 })
    .skip(pageSkip)
    .limit(pageLimit);
  if (!staff) {
    throw new ApiError(400, "failed to get all the staff");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, staff, "Successfully fetching all the staff!!!")
    );
});
const getHostelFee = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;
  if (!isValidObjectId(hostelId)) {
    throw new ApiError(400, "Invalid hostelId");
  }
  const user = await User.findById(req.validUser?._id);
  const hostel = await HostelFee.findById(hostelId);
  if (!hostel) {
    throw new ApiError(400, "no hostel fee!!!");
  }
  if (user.roomNumber.toString() !== hostel.roomNumber.toString()) {
    throw new ApiError(
      400,
      "Fees is not allocated for the given room number!!! "
    );
  }
  const getFee = await HostelFee.find().select("totalCharge");

  return res
    .status(200)
    .json(new ApiResponse(200, getFee, "Successfully fetched Hostel fee!!!"));
});
const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordToken = hashToken;
  user.resetPasswordExpires = Date.now() + 1000 * 10; // for 10 min
  await user.save();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'sheldon.wisoky7@ethereal.email',
        pass: '9pkjXfGzgZUY9rqjWZ'
    }
});
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Password Reset",
    text: "you have requested it because you have requested to reset password!!!",
    html:
      '<p> Please copy the link and <a href="http://localhost:4000/api/v1/users/reset-password?token=' +
      token +
      '"> and reset your password </a>',
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
    }
    return res.status(200).json(new ApiResponse(200, {}, "Email sent!!!"));
  });
});
const restPassword = asyncHandler(async (req, res) => {
  const token = crypto
    .createHash("sha256")
    .update(req.query.token)
    .digest("hex");

  const { newPassword, confirmPassword } = req.body;
  if (!token) {
    throw new ApiError(400, "token didn't recieved");
  }
  const tokenData = await User.findOne({
    resetPasswordToken: token,
  });

  if (!tokenData) {
    throw new ApiError(500, "The token has expired!!!");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      402,
      "newPassword and confirm password doesn't match!!!"
    );
  }
  (tokenData.resetPasswordToken = undefined),
    (tokenData.resetPasswordExpires = undefined);
  (tokenData.password = newPassword),
    await tokenData.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully reset password!!!"));
});
export {
  registerUser,
  loginUser,
  logOut,
  changeAvatar,
  updateAccountDetails,
  changeCurrentPassword,
  getAllStaff,
  getHostelFee,
  forgetPassword,
  restPassword,
};
