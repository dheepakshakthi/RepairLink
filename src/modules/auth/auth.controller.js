const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.validated);
  res.status(201).json(new ApiResponse(201, { user }, 'Registration successful. Please verify your email.'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json(new ApiResponse(200, { user, accessToken }, 'Login successful'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(oldRefreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (req.user) {
    await authService.logout(req.user._id, refreshToken);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, token } = req.query;
  if (!email || !token) {
    return res.status(400).json(new ApiResponse(400, null, 'Email and token are required'));
  }
  await authService.verifyEmail(email, token);
  res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiResponse(400, null, 'Email is required'));
  }
  await authService.forgotPassword(email);
  res.status(200).json(new ApiResponse(200, null, 'Password reset email sent (if account exists)'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json(new ApiResponse(400, null, 'Token and new password are required'));
  }
  await authService.resetPassword(token, newPassword);
  res.status(200).json(new ApiResponse(200, null, 'Password reset successfully'));
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, 'User details retrieved'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.validated);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.validated;
  await authService.changePassword(req.user._id, oldPassword, newPassword);
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword
};
