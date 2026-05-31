require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}`);
        console.log("MongoDB Connected");
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = connectDB;