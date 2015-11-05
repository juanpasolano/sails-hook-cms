
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
      console.log('sails-hook-cms:initialize');
      jadeLocals.sails = sails;
      jadeLocals.helpers = jadeHelpers(sails);
      jadeLocals._ = _;
      //This adds the validation function cms as [model].type = cms = function(){}
      //This is to prevent
      for (var key in sails.models) {
        if (sails.models.hasOwnProperty(key)) {
          if(!sails.models[key].types) sails.models[key].types = {};
          sails.models[key].types.cms= function(){
            return true;
          };
        }
      }
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
            model = sails.models[req.params.model];
            var modelSchema = model._attributes;
            //Find all models
            model.find().populateAll().exec(function(err, models){
              if(err) return res.negotiate(err);
              var jadeFn = jade.compileFile(path.join(__dirname, 'views/model.index.jade'));
              var html = jadeFn(extendJadeLocals({
                modelName: req.params.model,
                modelSchema: modelSchema,
                cms: model.cms || {},
                models: models
              }));
              return res.ok(html);
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

        'GET /admin/:model/edit/:modelId': function(req, res, next){
          if(req.params.modelId && req.params.model && sails.models[req.params.model]){

            var modelSchema = _.clone(sails.models[req.params.model]._attributes);
            delete modelSchema.id;
            delete modelSchema.createdAt;
            delete modelSchema.updatedAt;

            //FindOne model
            sails.models[req.params.model]
            .findOne(req.params.modelId)
            .exec(function(err, model){
              if(err) return res.negotiate(err);
              var jadeFn = jadeAsync.compileFile(path.join(__dirname, 'views/model.edit.jade'));
              jadeFn(extendJadeLocals({
                modelName: req.params.model,
                modelSchema: modelSchema,
                model:model
              })).done(function (html) {
                return res.send(html);
              });
            });
          } else {
            return next();
          }
        },

        'POST /admin/:model/store': function(req, res, next){
          console.log(req.body);
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
        'POST /admin/:model/update/:modelId': function(req, res, next){
          console.log(req.body);
          if(req.params.model && sails.models[req.params.model]){
            req.body = _.pick(req.body, _.identity); //Cleans req.body from empty attrs or _.omit(sourceObj, _.isUndefined) <- allows false, null, 0
            sails.models[req.params.model].update(req.params.modelId, req.body).exec(function(err, model){
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
