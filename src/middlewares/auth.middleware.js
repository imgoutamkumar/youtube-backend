const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization").split(" ")[1];
    console.log(req.header("Authorization").split(" ")[1]);

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decodedToken : ", decodedToken);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    console.log("req.user : ", user);
    next();
  } catch (error) {
    throw new ApiError(400, "Something went wrong on decoding access token");
  }
});

module.exports = { verifyJWT };
