var should = require('should');
var sinon = require ('sinon');
var downloader = require('../../../api/helpers/downloader');
var store = require('../../../api/helpers/store');

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

      it('should donwload');
      it('should call a callback the file is downloaded');
    });

  })

});
