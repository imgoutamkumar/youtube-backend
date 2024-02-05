const express = require("express");
const dotenv = require("dotenv").config();
const DB = require("./db/index");

DB.connectDB();
