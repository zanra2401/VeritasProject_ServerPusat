'use strict';
require('dotenv').config();

const { LembagaPeradilan } = require(__dirname + '/../../models');

const apiKeyMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: true,
      message: 'API Key is required',
    });
  }

  try {
    if (apiKey !== process.env.API_KEY_PUSAT) {
      return res.status(403).json({
        error: true,
        message: 'Invalid API Key',
      });
    }

    next();
  } catch (error) {
    console.error('API Key Middleware Error:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error during API key validation',
    });
  }
};

module.exports = apiKeyMiddleware;
