const { UserService, SMSService } = require('../services');
const { ResponseHelper, ValidationHelper } = require('../utils');
const db = require('../config/database');

class AuthController {
  static async register(req, res) {
    try {
      const userData = ValidationHelper.sanitizeObject(req.body);
      
      // Validate user data
      const validationErrors = ValidationHelper.validateUserRegistration(userData);
      if (validationErrors.length > 0) {
        return ResponseHelper.validationError(res, 'Validation failed', validationErrors);
      }

      // Check if user already exists
      const existingUser = await UserService.findUserByEmail(userData.email);
      if (existingUser) {
        return ResponseHelper.error(res, 'User with this email already exists', 409);
      }

      const existingPhone = await UserService.findUserByPhone(userData.phone);
      if (existingPhone) {
        return ResponseHelper.error(res, 'User with this phone number already exists', 409);
      }

      // Create user
      const result = await UserService.createUser(userData);
      
      return ResponseHelper.success(res, {
        id: result.id,
        token: result.token,
        name: userData.name,
        email: userData.email
      }, 'User registered successfully', 201);

    } catch (error) {
      console.error('Registration error:', error);
      return ResponseHelper.error(res, 'Registration failed', 500, error);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ResponseHelper.validationError(res, 'Email and password are required');
      }

      // Find user by email
      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return ResponseHelper.error(res, 'Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await UserService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return ResponseHelper.error(res, 'Invalid credentials', 401);
      }

      // Update last login
      await UserService.updateUser(user.id, { last_login: new Date() });

      return ResponseHelper.success(res, {
        id: user.id,
        token: user.token,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        district: user.district
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      return ResponseHelper.error(res, 'Login failed', 500, error);
    }
  }

  static async verifyPhone(req, res) {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return ResponseHelper.validationError(res, 'Phone and verification code are required');
      }

      // Check verification code in database
      const query = 'SELECT * FROM phone_verifications WHERE phone = ? AND code = ? AND expires_at > NOW()';
      db.query(query, [phone, code], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (results.length === 0) {
          return ResponseHelper.error(res, 'Invalid or expired verification code', 400);
        }

        // Delete used verification code
        db.query('DELETE FROM phone_verifications WHERE phone = ? AND code = ?', [phone, code]);

        return ResponseHelper.success(res, null, 'Phone verified successfully');
      });

    } catch (error) {
      console.error('Phone verification error:', error);
      return ResponseHelper.error(res, 'Phone verification failed', 500, error);
    }
  }

  static async sendVerificationCode(req, res) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return ResponseHelper.validationError(res, 'Phone number is required');
      }

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const message = `Your verification code is: ${code}`;

      // Save verification code to database
      const query = `
        INSERT INTO phone_verifications (phone, code, expires_at) 
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
        ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at)
      `;

      db.query(query, [phone, code], async (err) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        try {
          // Send SMS
          await SMSService.sendVerificationCode(phone, message);
          return ResponseHelper.success(res, null, 'Verification code sent successfully');
        } catch (smsError) {
          console.error('SMS error:', smsError);
          return ResponseHelper.error(res, 'Failed to send verification code', 500);
        }
      });

    } catch (error) {
      console.error('Send verification code error:', error);
      return ResponseHelper.error(res, 'Failed to send verification code', 500, error);
    }
  }

  static async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return ResponseHelper.validationError(res, 'Email and new password are required');
      }

      if (!ValidationHelper.validatePassword(newPassword)) {
        return ResponseHelper.validationError(res, 'Password must be at least 6 characters long');
      }

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return ResponseHelper.error(res, 'User not found', 404);
      }

      const hashedPassword = UserService.hashPassword(newPassword);
      await UserService.updateUser(user.id, { password: hashedPassword });

      return ResponseHelper.success(res, null, 'Password reset successfully');

    } catch (error) {
      console.error('Reset password error:', error);
      return ResponseHelper.error(res, 'Password reset failed', 500, error);
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = ValidationHelper.sanitizeObject(req.body);

      // Remove sensitive fields
      delete updateData.password;
      delete updateData.token;

      await UserService.updateUser(userId, updateData);

      return ResponseHelper.success(res, null, 'Profile updated successfully');

    } catch (error) {
      console.error('Update profile error:', error);
      return ResponseHelper.error(res, 'Profile update failed', 500, error);
    }
  }
}

module.exports = AuthController;