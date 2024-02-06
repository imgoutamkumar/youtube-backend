const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: Process.env.CLOUDINARY_CLOUD_NAME,
  api_key: Process.env.CLOUDINARY_API_KEY,
  api_secret: Process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const response = await cloudinary.uploader
      .upload(localFilePath, { resource_type: "auto" })
      .then((result) => console.log(result));

    console.log(response.url);
    console.log(response);
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally save temporary file as the operation got failed
    return null;
  }
};

module.exports = { uploadOnCloudinary };
