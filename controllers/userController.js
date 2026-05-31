require("dotenv").config();
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

exports.signup = async (req, res) => {
    try {
        const { name, email, password, location } = req.body;
        if (!name || !email || !password || !location) {
            return res.status(400).json({ message: "Please fill all details" });
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        await User.create({ name, email, password, location });
        res.status(201).json({ message: "Account Created Successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all details" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credential" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credential" });
        }
        const token = await jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: `${process.env.TOKEN_EXPIRES_IN}` }
        )
        res.status(200).json({ message: "Logged In Successfully", token });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json({ user });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: "Account Deleted Successfully." });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.editUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Please fill all details" });
        }
        const existingUser = await User.findOne({ email });
        if (
            existingUser &&
            existingUser._id.toString() !== req.user.id
        ) {

            return res.status(400).json({
                message: "Email already in use."
            });

        }
        await User.findByIdAndUpdate(req.user.id, { name, email });
        res.status(200).json({ message: "Details Updated Successfully" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.refreshLocation = async (req, res) => {
    try {
        const { location } = req.body;
        if (!location) {

            return res.status(400).json({
                message: "Location Access Required."
            });

        }
        const user =
            await User.findByIdAndUpdate(

                req.user.id,

                { location },

                { returnDocument: "after" }

            );

        if (!user) {

            return res.status(404).json({
                message: "User not found."
            });

        }
        res.status(200).json({ message: "Location Updated Successfully.", location: user.location });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.resetLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Please Enter Email Id" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User do not exists" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const transporter = await nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        const resetURL = `${process.env.HOST_LINK}reset-password.html?token=${resetToken}`;

        const info = await transporter.sendMail({
            from: `"Authenticate" <${process.env.SMTP_USER}>`,
            to: `${user.email}`,
            subject: "Reset Password Link",
            html: `
                    <h2>Password Reset</h2>

                    <p>
                        Click below link to reset password:
                    </p>

                    <a href="${resetURL}">
                        Reset Password
                    </a>

                    <p>
                        Link expires in 10 minutes.
                    </p>
                `
        })
        console.log("Message sent: %s", info.messageId);
        res.status(200).json({ message: "Mail Sent to reset Password" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Reset Link Expired" });
        }
        if (!password || !confirmPassword) {
            return res.status(400).json({ message: "Please Enter both the Details" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ message: "Reset Link Expired" });
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await user.save();

        res.status(200).json({ message: "Password Updated Successfully. Please Login." });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}