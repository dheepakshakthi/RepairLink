const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Provider = require('../../models/Provider');
const VerificationToken = require('../../models/VerificationToken');
const PasswordResetToken = require('../../models/PasswordResetToken');
const EmailService = require('../../services/EmailService');
const ApiError = require('../../utils/ApiError');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

class AuthService {
  async register(data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: data.password, // Pre-save hook hashes this
      role: data.role,
      phone: data.phone
    });

    if (user.role === 'provider') {
      await Provider.create({
        userId: user._id,
        shopName: 'TBD',
        approvalStatus: 'pending'
      });
    }

    const token = uuidv4();
    const tokenHash = hashToken(token);

    await VerificationToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await EmailService.sendVerificationEmail(user, token);

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.refreshTokens;
    return userObj;
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isVerified) {
      throw new ApiError(403, 'Please verify your email');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account suspended');
    }

    if (user.role === 'provider') {
      const provider = await Provider.findOne({ userId: user._id });
      if (!provider || provider.approvalStatus !== 'approved') {
        throw new ApiError(403, 'Account pending approval');
      }
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const hashedRefresh = hashToken(refreshToken);

    user.refreshTokens.push(hashedRefresh);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift(); // Keep max 5
    }
    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.refreshTokens;

    return { user: userObj, accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new ApiError(401, 'Refresh token not found');
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const hashedOld = hashToken(oldRefreshToken);
    if (!user.refreshTokens.includes(hashedOld)) {
      // Possible token reuse attack, clear all tokens
      user.refreshTokens = [];
      await user.save();
      throw new ApiError(401, 'Invalid refresh token');
    }

    user.refreshTokens = user.refreshTokens.filter(t => t !== hashedOld);

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    const hashedNew = hashToken(newRefreshToken);

    user.refreshTokens.push(hashedNew);
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId, refreshToken) {
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: hashed }
      });
    }
  }

  async verifyEmail(email, token) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isVerified) {
      return true; // Already verified
    }

    const hashed = hashToken(token);
    const verifyDoc = await VerificationToken.findOne({
      userId: user._id,
      tokenHash: hashed,
      expiresAt: { $gt: new Date() }
    });

    if (!verifyDoc) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }

    user.isVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verifyDoc._id });
    return true;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      return; // Do not throw error to avoid email enumeration
    }

    const token = uuidv4();
    const tokenHash = hashToken(token);

    await PasswordResetToken.deleteMany({ userId: user._id }); // invalidate old tokens

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    await EmailService.sendPasswordResetEmail(user, token);
  }

  async resetPassword(token, newPassword) {
    const hashed = hashToken(token);
    const resetDoc = await PasswordResetToken.findOne({
      tokenHash: hashed,
      expiresAt: { $gt: new Date() }
    });

    if (!resetDoc) {
      throw new ApiError(400, 'Invalid or expired password reset token');
    }

    const user = await User.findById(resetDoc.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.passwordHash = newPassword;
    user.refreshTokens = []; // Log out from all devices
    await user.save();

    await PasswordResetToken.deleteOne({ _id: resetDoc._id });
  }

  async updateProfile(userId, data) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshTokens');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Incorrect old password');
    }

    user.passwordHash = newPassword;
    await user.save();
  }
}

module.exports = new AuthService();
