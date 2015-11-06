# Sails admin panel

[![Join the chat at https://gitter.im/juanpasolano/sails-hook-cms](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/juanpasolano/sails-hook-cms?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
>Beaware: This hook is still in a very early stage and is still in very active development.

## Why

The objective of this sails hook is to provide an easy way to create a simple CMS for your model's collections.  
The hook reads the models schema to build simple CRUD operations and UI CMS.

## Installation
Install using `npm i sails-hook-cms` and then navigate to `http://localhost:1337/admin`

## Routes
This hooks introduces a couple of routes to your application.
- `http://localhost:1337/admin` or home
- `http://localhost:1337/admin/:model` A list of items
- `http://localhost:1337/admin/:model/create` The form to create a new item
- `http://localhost:1337/admin/:model/edit/:modelId` The form to edit an item

## Options
I want this hook to work as plug and play. However if you want more control over the CMS I want to be able to provide those configurations to set things up.
I decided not to make a `config/cms.js` file yet since I think the model declaration could serve better for grain control configuraitons.

Having for example a model Book. We can start to modify how its `/admin/:model` list view renders.
In this case we have overrided the model.name with a label *Libro* and removed the createdAt and updatedAt fields.

```
module.exports = {
  //Setting this variable will tell the gook how to render
  cms: {
    //You can override the model name with label
    label: "Libro", 
    
    //Sometimes you dont want to put your createdAt and updatedAt
    //so we toggle them in the list view
    createdAt:false, 
    updatedAt:false,
    id:true
  },
  attributes: {
    name: 'string',
    description: 'text',
    danum: 'integer',
    dafloat: 'float',
    dadate: 'date',
    dadatetime: 'datetime',
    dabool: 'boolean',
    darray: 'array',
    dajson: 'json'
  }
};
```
## Intentions
I would like to have a minimal API but still have a decent flexibility.  
Any suggestions are welcome on the [issues](https://github.com/juanpasolano/sails-hook-cms/issues) page or in the [gitter chat room](https://gitter.im/juanpasolano/sails-hook-cms). 
