const express = require("express");
const dotenv = require("dotenv").config({ path: "./.env" });
const DB = require("./db/index");
const app = require("./app");

DB.connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    xonsole.log("mongodb connection failed !!!", error);
  });
