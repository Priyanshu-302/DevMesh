const { errorResponse } = require("../utils/apiResponse");

const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errorDetails = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      return errorResponse(
        res,
        400,
        `Validation failed for request ${source}`,
        errorDetails,
      );
    }

    req[source] = result.data;
    next();
  };
};

module.exports = validateRequest;
