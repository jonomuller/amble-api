const jwt = require('jsonwebtoken'),
      config = require('../config/config'),
      passport = require('passport'),
      User = require('../models/user'),
      helper = require('./helper');

function returnWithJWT(user, status, res) {
  token = jwt.sign(user, config.jwtSecret);
  res.status(status).json({
    success: true,
    user: user,
    jwt: token
  });
}

function registerError(field, res) {
  return res.status(400).json({
      success: false,
      error: `A user with that ${field} already exists.`
    });
}

module.exports.login = function(req, res, next) {
  passport.authenticate('local', config.jwtSession, function(error, user, info) {
    if (error) return next(error);
    if (!user) return res.status(401).json({
                        success: false,
                        error: info.message
                      })

    user.deviceToken = req.body.deviceToken;

    user.save(function(error) {
      if (error) return helper.mongooseValidationError(error, res);
      returnWithJWT(user, 200, res);
    });
  })(req, res, next);
};

module.exports.register = function(req, res, next) {
  var username = req.body.username,
      email = req.body.email;

  User.findOne({username: username}, function(error, foundUsername) {
    if (error) return helper.mongooseValidationError(error, res);
    if (foundUsername) return registerError('username', res);

    User.findOne({email: email}, function(error, foundEmail) {
      if (error) return helper.mongooseValidationError(error, res);
      if (foundEmail) return registerError('email address', res);

      var user = User({
        username: username,
        email: email,
        password: req.body.password,
        name: {
          firstName: req.body.firstName,
          lastName: req.body.lastName
        },
        deviceToken: req.body.deviceToken
      });

      user.save(function(error) {
        if (error) return helper.mongooseValidationError(error, res);
        returnWithJWT(user, 201, res);
      });
    });
  });
}