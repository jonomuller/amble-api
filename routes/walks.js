const express = require('express'),
      walksRouter = express.Router(),
      walks = require('../controllers/walks'),
      passport = require('passport'),
      config = require('../config/config');

var jwtAuth = function(req, res, next) {
  passport.authenticate('jwt', config.jwtSession, function(error, user, info) {
    if (error) return next(error);
    if (!user) return res.status(401).json({
                    success: false,
                    error: info.message
                  })
    next();
  })(req, res, next);
};

walksRouter.post('/create', jwtAuth, walks.create);

module.exports = walksRouter;