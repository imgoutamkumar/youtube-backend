const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");
const { verifyJWT } = require("../middlewares/auth.middleware");
//router.post("/register", userController.registerUser);

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userController.registerUser
);

router.route("/login").post(userController.loginUser);

router.route("/logout").post(verifyJWT, userController.logoutUser);
router.route("/refresh-token").post(userController.refreshAccessToken);
module.exports = router;
