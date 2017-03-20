var should = require('should');
var sinon = require ('sinon');
var downloader = require('../../../api/helpers/downloader');
var store = require('../../../api/helpers/store');
var os = require('os');
var http = require('http');
var fs = require('fs');

describe('helpers', function() {

  describe('downloader', function() {

    describe('start_download', function() {

      beforeEach(function(){
        store.reset();
        var test_data = [
          { id:'1', name:'file1', download_url: 'http://myserver/file1', status:'READY_FOR_DOWNLOAD'},
        ];
        store.set_items(test_data);
        sinon.stub(downloader,"download");
      });

      afterEach(function(){
        sinon.restore(downloader,"download");
      });

      it('should call download', function(){
        downloader.set_gribs_directory('/var/gribs/data')
        downloader.start_download('1');
        sinon.assert.calledWith(downloader.download,'http://myserver/file1','/var/gribs/data/grib-1.grib2');
      });

      it('should update status of grib_file when download is started', function() {
        downloader.start_download('1');
        store.get('1').status.should.eql('DOWNLOAD_IN_PROGRESS')
      });

      it('should update status of grib file when download is completed', function() {
        sinon.restore(downloader,"download");
        sinon.stub(downloader,"download", function(file,url,callback){
          if(callback) callback();
        });
        downloader.start_download('1');
        store.get('1').status.should.eql('DOWNLOAD_COMPLETED')
      });

    })

    describe('download', function() {

      var test_file;
      var server;

      beforeEach(function() {
        // Generate name of temporary test file
        test_file = os.tmpdir() + "/grib"+Date.now()+".test";
        // Start a simple http server that 
        server = http.createServer(function(req,res) {
          res.end("grib data");
        });
        server.listen(10200);
      });

      afterEach(function() {
        // Delete temporary test file
        fs.unlinkSync(test_file);
        // Stop test server
        server.close();
      });

      it('should donwload the file and call the callback', function(done) {
          downloader.download("http://localhost:10200",test_file, function() {
            var file_content = fs.readFileSync(test_file, 'utf8');
            file_content.should.eql("grib data");
            done();
          })
      });
    });

  })

});
