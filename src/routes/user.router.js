const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");

//router.post("/register", userController.registerUser);
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userController.registerUser
);
module.exports = router;
