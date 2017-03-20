'use strict';

var store = require('./store');
var http = require('http');
// fs-extra is used instead of fs as it provides usefull helpers to ensure directories exist
var fs = require('fs-extra');

module.exports = {
  start_download: start_download,
  set_gribs_directory: set_gribs_directory,
  download : _download
};

var gribs_directory = '/var/gribs/data';

function start_download(id) {
	var grib = store.get(id);
	if (!grib) throw Error("invalid grib id");
	grib.status = 'DOWNLOAD_IN_PROGRESS';
	store.update(id, grib);
	this.download(grib.download_url, gribs_directory+'/grib-'+id+'.grib2', function() {
		grib.status = 'DOWNLOAD_COMPLETED';
		store.update(grib);
	});
}

function set_gribs_directory(d) {
	gribs_directory = d;
}

function _download(url, dest, callback) {
  fs.ensureFileSync(dest);
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(callback);
    });
  });
}
