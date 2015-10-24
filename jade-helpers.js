
var jade = require('jade');
var path = require('path');
var _ = require('lodash');
var moment =  require('moment');


module.exports = function(sails) {
  if(!sails) return 'No sails reference specified';

  var enumAsOptions = function (values) {
    return _.map(values, function (item){
      return {value:item, name:item};
    });
  };
  var modelsAsOptions = function (models) {
    return _.map(models, function (item){
      return {value:item.id, name:item.name};
    });
  };

  return {
    list: {
      item: function(value, attrName, attrs){
        if(attrs.type == 'datetime' || attrs.type == 'date'){
          return moment(value).format('DD/MM/YYYY:hh-mm a');
        } else if(attrs.model){
          return (value && value.name) ? value.name : '';
        } else if(attrs.collection){
          return (value.length) ? value.length : 0;
        } else {
          return value;
        }
      }
    },
    form: {
      getControl : function(name, attr){
        var jadeFormPartials = jade.compileFile(path.join(__dirname, 'partials/forms.jade'));
        if(attr.type == 'string'){
          if(attr.enum){
            return jadeFormPartials({
              element: 'select',
              name: name,
              attr: attr,
              options: enumAsOptions(attr.enum)
            });
          } else {
            return jadeFormPartials({
              element: 'input',
              name: name,
              attr: attr
            });
          }

        } else if((attr.type == 'integer' || attr.type == 'float') && !attr.model) {
          return jadeFormPartials({
            element: 'input',
            type: 'number',
            name: name,
            attr: attr
          });

        } else if(attr.type == 'integer' && attr.model) {
          var p = Promise.defer();
          if(sails.models[attr.model]){
            sails.models[attr.model].find().exec(function(err, models){
              if(err) return p.resolve('error on model');
              p.resolve(jadeFormPartials({
                element: 'select',
                name: name,
                options: modelsAsOptions(models)
              }));
            });
          }else {
            return p.resolve('No model found for ' + attr.model);
          }
          return p.promise;
        }
      }
    }
  };
};
