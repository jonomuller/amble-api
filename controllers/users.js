const Walk = require('../models/walk'),
      User = require('../models/user'),
      helper = require('./helper');

module.exports.getWalks = function(req, res, next) {
  var id = req.params.userID;

  Walk.find({owner: id}, function(error, walks) {
    if (error) return helper.mongooseValidationError(error, res);

    var walkDetails = [];
    
    walks.forEach(function(walk) {
      walkDetails.push({
        id: walk._id,
        name: walk.name,
        image: walk.image,
        createdAt: walk.createdAt
      });
    });

    return res.status(200).json({
      success: true,
      walks: walkDetails
    });
  });
};

module.exports.search = function(req, res, next) {
  var userInfo = new RegExp('^' + req.params.userInfo + '$', 'i');
  var fullNameTerms = req.params.userInfo.split(' ');
  var names = [];

  for (let key in fullNameTerms) {
    names[key] = new RegExp('^' + fullNameTerms[key] + '$', 'i');
  }

  console.log(userInfo);
  User.find({$or:[{username: userInfo}, {'name.firstName': userInfo}, {'name.lastName': userInfo}, {email: userInfo},
            {$and: [{'name.firstName': names[0]}, {'name.lastName': names[1]}]}]}, function(error, user) {
    if (error) return helper.mongooseValidationError(error, res);

    if (user.length == 0) return res.status(404).json({
                            success: false,
                            error: 'No users could be found.'
                          });

    res.status(200).json({
      success: true,
      user: user
    })
  });
};