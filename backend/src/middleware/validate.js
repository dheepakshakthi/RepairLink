const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  try {
    if (!schema || typeof schema.safeParse !== "function") {
      return next(
        new ApiError(500, "Internal Server Error: Invalid validation schema"),
      );
    }

    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      const errors = issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return next(new ApiError(400, "Validation error", errors));
    }

    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;

    // For backward compatibility with existing controllers that expect req.validated to be the body
    req.validated =
      result.data.body ||
      result.data.query ||
      result.data.params ||
      result.data;

    next();
  } catch (error) {
    console.error("Validation middleware error:", error);
    next(new ApiError(400, "Validation failed"));
  }
};

module.exports = validate;
