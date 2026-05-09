const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      return next(new ApiError(400, 'Validation error', errors));
    }

    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;
    
    // For backward compatibility with existing controllers that expect req.validated to be the body
    req.validated = result.data.body || result.data.query || result.data.params || result.data;

    next();
  } catch (error) {
    next(new ApiError(400, 'Validation failed'));
  }
};

module.exports = validate;
