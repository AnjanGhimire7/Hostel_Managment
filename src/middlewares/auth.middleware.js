import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
const jwtAuth = asyncHandler(async (req, _, next) => {
  const incomingToken =
    req.cookies?.accessToken ||
    req.header["authorization"]?.split("Bearer ")[1];
  if (!incomingToken) {
    throw new ApiError(401, "unauthorized user!!!");
  }
  const decodedToken = await jwt.verify(
    incomingToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!decodedToken) {
    throw new ApiError(401, "invalid token!!!");
  }

  const validUser = await User.findById(decodedToken?._id).select(
    "-password -accessToken"
  );
  req.validUser = validUser;
  next();
});

//This middleware is responsible for validating multiple user role permissions at a time.
export const verifyPermission = (roles = []) =>
  asyncHandler(async (req, _, next) => {
    if (!req.validUser?._id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (roles.includes(req.validUser?.role)) {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
  });

export { jwtAuth };
