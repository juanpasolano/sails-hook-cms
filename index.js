
var jade = require('jade');
var jadeAsync = require('jade-async');
var _ = require('lodash');
var path = require('path');
var util = require('util');

var jadeHelpers = require('./jade-helpers.js');

module.exports = function (sails) {

  var jadeLocals = {};
  var extendJadeLocals = function (locals){
    return _.assign(jadeLocals, locals);
  };
  return {
    initialize: function(cb) {
      console.log('admin-hook:initialize');
      jadeLocals.sails = sails;
      jadeLocals.helpers = jadeHelpers(sails);
      return cb();
    },
    routes: {
      after: {


        'GET /admin': function (req, res, next) {
          var jadeFn = jade.compileFile(path.join(__dirname, 'views/home.jade'));
          var html = jadeFn(extendJadeLocals({}));
          return res.send(html);
        },


        'GET /admin/:model': function (req, res, next) {
          if(req.params.model && sails.models[req.params.model]){
            var modelSchema = sails.models[req.params.model]._attributes;
            // console.log(sails.models[req.params.model]._attributes);
            // console.log('------');
            // console.log(sails.models[req.params.model]._validator.validations);
            // console.log(sails.models[req.params.model].waterline.collections[req.params.model]._attributes);
            // console.log(modelSchema.waterline.collections[req.params.model]._validator);
            // console.log(util.inspect(modelSchema.waterline.collections[req.params.model], {showHidden: true, depth: null}));

            //Find all models
            sails.models[req.params.model].find().populateAll().exec(function(err, models){
              if(err) return res.negotiate(err);
              var jadeFn = jade.compileFile(path.join(__dirname, 'views/model.index.jade'));
              var html = jadeFn(extendJadeLocals({
                modelName: req.params.model,
                modelSchema: modelSchema,
                models: models
              }));
              return res.send(html);
            });

          } else {
            return next();
          }
        },


        'GET /admin/:model/create': function(req, res, next){
          if(req.params.model && sails.models[req.params.model]){

            var modelSchema = _.clone(sails.models[req.params.model]._attributes);
            delete modelSchema.id;
            delete modelSchema.createdAt;
            delete modelSchema.updatedAt;

            //Using the sync methods
            // var jadeFn = jade.compileFile(path.join(__dirname, 'views/model.create.jade'));
            // var html = jadeFn(extendJadeLocals({
            //   modelName: req.params.model,
            //   modelSchema: modelSchema
            // }));
            // return res.send(html);

            //Using the async thing
            var jadeFn = jadeAsync.compileFile(path.join(__dirname, 'views/model.create.jade'));
            jadeFn(extendJadeLocals({
              modelName: req.params.model,
              modelSchema: modelSchema
            })).done(function (html) {
              return res.send(html);
            });
          } else {
            return next();
          }
        },

        'POST /admin/:model/store': function(req, res, next){
          if(req.params.model && sails.models[req.params.model]){
            req.body = _.pick(req.body, _.identity); //Cleans req.body from empty attrs or _.omit(sourceObj, _.isUndefined) <- allows false, null, 0
            sails.models[req.params.model].create(req.body).exec(function(err, model){
              if(err) return res.negotiate(err);
              return res.redirect('/admin/' + req.params.model);
            });
          } else {
            return next();
          }
        },


        'GET /admin/:model/delete/:modelId': function(req, res, next){
          if(req.params.modelId && req.params.model && sails.models[req.params.model]){

            //FindOne model
            sails.models[req.params.model]
            .destroy(parseInt(req.params.modelId, 10))
            .exec(function(err, model){
              if(err) return res.negotiate(err);
              return res.redirect('/admin/' + req.params.model);
            });
          } else {
            return next();
          }
        }

      }
    }
  };
};
