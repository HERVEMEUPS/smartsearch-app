const { validationResult } = require('express-validator');

/**
 * Middleware de validation des résultats express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Erreur de validation",
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

/**
 * Validation des champs requis simple
 */
const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Champs manquants",
        missingFields: missing
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateFields
};
