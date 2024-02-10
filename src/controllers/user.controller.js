const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { uploadOnCloudinary } = require("../utils/fileUpload");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ ValidateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (fullName === "") {
    throw new ApiError(400, "Full name is required");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatarLocalPath = await req.files?.avatar[0]?.path;
  //const coverImageLocalPath = await req.files?.coverImage[0]?.path;
  const coverImageLocalPath = await (Array.isArray(req.files.coverImage) &&
  req.files.coverImage.length > 0
    ? req.files.coverImage[0].path
    : "");

  /*   console.log("req.files.avatar:", req.files.avatar);
  console.log("avatarLocalPath : ", avatarLocalPath); */

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("avatar : ", avatar);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar,
    coverImage: coverImage || "",
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req.bpdy => data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie

  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(400, "user does not exist");
  }

  const isPasswordvalid = await user.isPasswordCorrect(password);
  if (!isPasswordvalid) {
    throw new ApiError(401, "password is invalid");
  }
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedinUser, accessToken, refreshToken },
        "user loggedIn successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log("req.user : ", req.user);
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "userloggedOut successfuly"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedIncomingRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log(decodedIncomingRefreshToken);
    const user = await User.findById(decodedIncomingRefreshToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message,
      "something went wrong while creating new refresh token"
    );
  }
});

module.exports = { registerUser, loginUser, logoutUser, refreshAccessToken };
