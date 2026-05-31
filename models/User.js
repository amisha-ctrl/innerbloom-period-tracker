const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    name: {
        type: String,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    location: {
        area: String,
        state: String,
        postal: String,
        country: String,
        latitude: Number,
        longitude: Number
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    }
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
})

module.exports = model("User", userSchema);