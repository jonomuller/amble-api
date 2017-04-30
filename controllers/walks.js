const Walk = require('../models/walk'),
      helper = require('./helper'),
      config = require('../config/config'),
      aws = require('aws-sdk'),
      s3 = new aws.S3();

s3.config.update({
  // signatureVersion: 'v4',
  accessKeyId: config.awsAccessKeyID,
  secretAccessKey: config.awsSecretAccessKey
})

module.exports.create = function(req, res, next) {
  var name = req.body.name;
  var owner = req.body.owner;
  var coordinates = req.body.coordinates;
  var time = req.body.time;
  var distance = req.body.distance;
  var steps = req.body.steps;

  if (coordinates) coordinates = JSON.parse(coordinates);

  var walk = new Walk({
    name,
    owner,
    geometry: {
      type: 'MultiPoint',
      coordinates: coordinates
    },
    time: time,
    distance: distance,
    steps: steps
  });

  walk.save(function(error) {
    if (error) return helper.mongooseValidationError(error, res);
    
    res.status(201).json({
      success: true,
      walk: walk
    });
  });
};

module.exports.uploadMapImage = function(req, res, next) {
  var params = {
    Bucket: config.awsBucket,
    Key: Date.now().toString(),
    ContentType: 'image/jpeg',
    Expires: 60
  }

  s3.getSignedUrl('putObject', params, function(error, url) {
    if (error) return res.status(500).json({
      success: false,
      error: 'Unable to retrieve signed URL for AWS.'
    })

    res.status(200).json({
      success: true,
      url: url
    })
  });
};

module.exports.getWalk = function(req, res, next) {
  var id = req.params.walkID;

  Walk.findById(id, function(error, walk) {
    if (error) return helper.mongooseValidationError(error, res);

    if (!walk) return res.status(404).json({
                        success: false,
                        error: 'No walk with that ID can be found.'
                      })

    return res.status(200).json({
             success: true,
             walk: walk
           });
  });
};