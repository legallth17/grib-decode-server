'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var downloader = require('../helpers/downloader');
var store = require('../helpers/store');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  get_gribs: get_gribs,
  get_grib: get_grib,  
  create_grib: create_grib
};

// controller operations

function get_gribs(req, res) {
  var name = req.swagger.params.name.value;
  var grib_files = store.get_all();
  if(name) {
    res.json(grib_files.filter(function(item) {
      return item.name === name;
    }));
  } else {
    res.json(grib_files);
  }
}

function get_grib(req, res) {
  var id = req.swagger.params.id.value;
  var grib_files = store.get_all();
  var grib_file = grib_files[id-1];
  if(grib_file) {
    res.json(grib_file);
  } else {
    res.status(404).json({message:"grib file not found"});
  } 
}

function create_grib(req, res) {
  var body = req.swagger.params.body.value;
  // id is returned
  var grib_file = store.add({
    name: body.name,
    download_url: body.download_url,
    status: 'READY_FOR_DOWNLOAD'
  });
  downloader.start_download(grib_file.id,grib_file.download_url);
  res.status(201).set('Location','/gribs/'+grib_file.id).json(grib_file);
}
