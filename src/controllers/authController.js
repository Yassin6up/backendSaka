const User = require('../models/User');
const smsService = require('../services/smsService');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  // Register new user
  static register = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create new user
    const user = await User.create({ name, email, phone, password });

    // Generate verification code
    const verificationCode = smsService.generateVerificationCode();

    // Save verification code to database (you might want to create a separate table for this)
    // For now, we'll just send the SMS
    try {
      await smsService.sendVerificationCode(phone, `رمز التحقق: ${verificationCode}`);
    } catch (error) {
      console.error('Error sending verification SMS:', error);
      // Don't fail registration if SMS fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your phone number.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  });

  // Login user
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    if (!user.verifyPassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture,
        is_verified: user.is_verified
      }
    });
  });

  // Verify phone number
  static verifyPhone = asyncHandler(async (req, res) => {
    const { phone, code } = req.body;

    // In a real implementation, you would verify the code from database
    // For now, we'll just check if it's 6 digits
    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Find user by phone
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user as verified
    await user.update({ is_verified: 1 });

    // Send welcome notification
    try {
      await notificationService.saveNotification(
        user.id,
        'مرحباً بك!',
        'تم التحقق من رقم هاتفك بنجاح. مرحباً بك في تطبيق JBuy!',
        'welcome'
      );
    } catch (error) {
      console.error('Error sending welcome notification:', error);
    }

    res.json({
      success: true,
      message: 'Phone number verified successfully'
    });
  });

  // Reset password
  static resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset code
    const resetCode = smsService.generateVerificationCode();

    // Send reset code via SMS
    try {
      await smsService.sendPasswordResetCode(user.phone, resetCode);
    } catch (error) {
      console.error('Error sending reset SMS:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset code'
      });
    }

    res.json({
      success: true,
      message: 'Reset code sent to your phone number'
    });
  });

  // Update password
  static updatePassword = asyncHandler(async (req, res) => {
    const { userId, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  });

  // Update user profile
  static updateProfile = asyncHandler(async (req, res) => {
    const { userId, name, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    // Check if phone is already taken by another user
    if (phone && phone !== user.phone) {
      const existingUser = await User.findByPhone(phone);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already taken'
        });
      }
    }

    await user.update({ name, email, phone });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture
      }
    });
  });

  // Get user profile
  static getProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const stats = await User.getStats(userId);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture,
        is_verified: user.is_verified,
        created_at: user.created_at,
        stats
      }
    });
  });
}

module.exports = AuthController;