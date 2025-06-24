const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models');
const config = require('../config/config');

/**
 * Middleware to protect routes - validates JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Find user by ID from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      if (!req.user.isActive) {
        res.status(401);
        throw new Error('User account is inactive');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Middleware to check if user has admin role
 */
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
});

/**
 * Middleware to check if user has staff or admin role
 */
const staff = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as staff');
  }
});

/**
 * Middleware to check if user is accessing their own resource
 */
const ownerOrAdmin = asyncHandler(async (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (
    req.user &&
    (req.user.id === resourceUserId || req.user.role === 'admin')
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }
});

module.exports = { protect, admin, staff, ownerOrAdmin };