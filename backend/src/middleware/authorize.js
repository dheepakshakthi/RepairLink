const ApiError = require('../utils/ApiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: User role not authorized'));
    }
    next();
  };
};

module.exports = authorize;
