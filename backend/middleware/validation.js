import { body, param, validationResult } from 'express-validator';
import { checkOwnership } from './rbac.js';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['customer', 'merchant']).withMessage('Role must be either customer or merchant'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Menu validation rules
export const validateCreateMenu = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number')
    .toFloat(),
  body('image')
    .optional()
    .trim()
    .isURL().withMessage('Image must be a valid URL'),
  handleValidationErrors,
];

export const validateUpdateMenu = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number')
    .toFloat(),
  body('image')
    .optional()
    .trim()
    .isURL().withMessage('Image must be a valid URL'),
  handleValidationErrors,
];

// Order validation rules
export const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
  body('items.*.menuId')
    .isInt({ min: 1 }).withMessage('Each item must have a valid menuId'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Each item must have a quantity of at least 1'),
  handleValidationErrors,
];

export const validateUpdateOrderStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'preparing', 'ready', 'delivered', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors,
];

// Cart validation rules
export const validateAddToCart = [
  body('menuId')
    .isInt({ min: 1 }).withMessage('Valid menuId is required'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors,
];

export const validateUpdateCart = [
  body('menuId')
    .isInt({ min: 1 }).withMessage('Valid menuId is required'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors,
];

// Param validation
export const validateIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID parameter'),
  handleValidationErrors,
];

