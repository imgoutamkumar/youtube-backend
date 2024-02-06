const mongoose = require("mongoose");
const constant = require("../constants");

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${constant.DB_NAME}?retryWrites=true&w=majority`
    );
    console.log(`mongodb connected ${connectionInstance}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connectDB };
