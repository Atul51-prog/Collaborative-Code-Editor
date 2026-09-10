const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authenticate = require('../middleware/authenticate');

require('../db/connec');
const User = require('../models/userSchema');


router.post('/register', async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
        return res.status(422).json({ error: "Please fill all required fields" });
    }

    try {
        const cleanEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: cleanEmail });
        
        if (userExists) {
            return res.status(422).json({ error: "User with same email already exists" });
        }
        const user = new User({ userName: userName.trim(), email: cleanEmail, password });

        const userRegistered = await user.save();

        if (userRegistered) {
            return res.status(201).json({ message: "User registered successfully" });
        }
    } catch (error) {
        console.log("Register error:", error);
        return res.status(500).json({ error: "Registration failed" });
    } 
});

router.post('/login', async (req, res) => {
    const { userName, email, identifier, loginId, password } = req.body;
    const loginIdentifier = (identifier || loginId || userName || email || '').trim();

    if (!loginIdentifier || !password) {
        return res.status(422).json({ error: "Please fill all required fields" });
    }

    try {
        const escaped = loginIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const userExists = await User.findOne({
            $or: [
                { userName: { $regex: new RegExp(`^${escaped}$`, 'i') } },
                { email: { $regex: new RegExp(`^${escaped}$`, 'i') } }
            ]
        });

        if (userExists) {
            const isMatch = await bcrypt.compare(password, userExists.password);
            
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });   
            }

            const token = await userExists.generateAuthToken();

            res.cookie("jwtToken", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            });

            return res.json({
                message: "Logged In successfully",
                token: token,
                user: {
                    _id: userExists._id,
                    userName: userExists.userName,
                    email: userExists.email
                }
            });
        } else {
            return res.status(400).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.log("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    } 
});

router.get('/roomsforuser', authenticate, (req, res) => {
    res.send(req.rootUser);
});

router.get('/logout', (req, res) => {
    res.clearCookie('jwtToken', { path: '/' });
    res.status(200).send("Logged out successfully");
});

router.get('/inaroom', authenticate, (req, res) => {
    res.send(req.rootUser);
});

router.get('/checkforUser', authenticate, (req, res)=>{
    res.status(200).json({
        isuser: "1",
        user: {
            _id: req.rootUser._id,
            userName: req.rootUser.userName,
            email: req.rootUser.email
        }
    });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(422).json({ error: "Please enter your email address" });
        }

        const cleanEmail = email.trim();
        const user = await User.findOne({
            email: { $regex: new RegExp('^' + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
        });

        if (!user) {
            return res.status(404).json({ error: "No account found with this email address" });
        }

        // Generate 6-digit numeric verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.resetPasswordCode = code;
        user.resetPasswordExpires = expires;
        await user.save();

        const { sendPasswordResetCode } = require('../services/emailService');
        const emailResult = await sendPasswordResetCode(user.email, code, user.userName);

        return res.status(200).json({
            message: "Verification code sent to your email",
            email: user.email,
            simulated: emailResult?.simulated || false,
            previewUrl: emailResult?.previewUrl || null,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ error: "Failed to process forgot password request" });
    }
});

router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(422).json({ error: "Email and verification code are required" });
        }

        const cleanEmail = email.trim();
        const cleanCode = code.trim();

        const user = await User.findOne({
            email: { $regex: new RegExp('^' + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
        });

        if (!user || user.resetPasswordCode !== cleanCode) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
        }

        return res.status(200).json({ message: "Verification code is valid" });
    } catch (error) {
        console.error("Verify code error:", error);
        return res.status(500).json({ error: "Failed to verify code" });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(422).json({ error: "Please fill all required fields" });
        }

        if (newPassword.length < 6) {
            return res.status(422).json({ error: "Password must be at least 6 characters long" });
        }

        const cleanEmail = email.trim();
        const cleanCode = code.trim();

        const user = await User.findOne({
            email: { $regex: new RegExp('^' + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
        }

        // Set new password (pre-save hook will hash it with bcrypt)
        user.password = newPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        user.tokens = []; // Invalidate previous session tokens

        await user.save();

        return res.status(200).json({
            message: "Password reset successfully. You can now log in with your new password."
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ error: "Failed to reset password" });
    }
});

module.exports = router;
