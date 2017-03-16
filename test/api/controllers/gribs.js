var should = require('should');
var request = require('supertest');
var sinon = require ('sinon');
var server = require('../../../app');
var async = require('async');
var gribs_controller = require('../../../api/controllers/gribs');
var downloader = require('../../../api/helpers/downloader')
var store = require('../../../api/helpers/store')

describe('controllers', function() {

  beforeEach( function() {
        sinon.stub(downloader,"start_download");
  });
  afterEach( function() {
        sinon.restore(downloader,"start_download");
  });

  describe('get_gribs', function() {

    describe('GET /gribs', function() {


      it('should return empty array when no data are available', function(done) {

        store.reset();

        request(server)
          .get('/gribs')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql([]);

            done();
          });
      });

      it('should return data when available', function(done) {

        var test_data = [
          { id:'1', name:'file1', download_url: 'http://myserver/file1', status:'READY_FOR_DOWNLOAD'},
          { id:'2', name:'file2', download_url: 'http://myserver/file2', status:'READY_FOR_DOWNLOAD'},
          { id:'3', name:'file3', download_url: 'http://myserver/file3', status:'READY_FOR_DOWNLOAD'}
        ];
        store.set_items(test_data);

        request(server)
          .get('/gribs')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.eql(test_data);
            done();
          });
      });

      it('should return items that only match name parameter when provided', function(done) {

        var test_data = [
          { id:'1', name:'file1', download_url: 'http://myserver/file1', status:'READY_FOR_DOWNLOAD'},
          { id:'2', name:'file2', download_url: 'http://myserver/file2', status:'READY_FOR_DOWNLOAD'},
          { id:'3', name:'file3', download_url: 'http://myserver/file3', status:'READY_FOR_DOWNLOAD'}
        ];
        store.set_items(test_data);

//        console.log(store.get_all());
        request(server)
          .get('/gribs')
          .query({ name: 'file2'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.containEql(test_data[1]);

            done();
          });
      });

    });

  });

  describe('create_grib', function() {

    describe('POST /gribs', function() {

      it('should return 201', function(done) {

        request(server)
          .post('/gribs')
          .send({ name: 'aGribFileName', download_url : 'http://xxx'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201)
          .end(function(err, res) {
            should.not.exist(err);
            done();
          });
      });

      it('should return a grib object with provided name and download_url', function(done) {

        request(server)
          .post('/gribs')
          .send({ name: 'aGribFileName', download_url : 'http://xxx'})
          .set('Accept', 'application/json')
          .expect(201)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.name.should.eql('aGribFileName');
            res.body.download_url.should.eql('http://xxx');
            done();
          });
      });

      it('should return a grib object with status READY_FOR_DOWNLOAD', function(done) {

        request(server)
          .post('/gribs')
          .send({ name: 'aGribFileName', download_url : 'http://xxx'})
          .set('Accept', 'application/json')
          .expect(201)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.status.should.eql('READY_FOR_DOWNLOAD');
            done();
          });
      });

      it('should generate a new ID for each request', function(done) {

        // POST /grib request
        var post_grib = function(callback) {
          request(server)
            .post('/gribs')
            .send({ name: 'aGribFileName', download_url : 'http://xxx'})
            .set('Accept', 'application/json')
            .expect(201)
            .end(function(err, res) {
              if(err) callback(err);
              callback(null,res.body);
            });
        };

        // use async to run 2 POST /grib requests and check result
        async.parallel([post_grib,post_grib],
          // check results
          function(err,results) {
            should.not.exist(err);
            var id1 = results[0].id
            var id2 = results[1].id
            id1.should.not.eql(id2);
            done();
          });
      });

      it('should provide a Location header', function(done) {

        request(server)
          .post('/gribs')
          .send({ name: 'aGribFileName', download_url : 'http://xxx'})
          .set('Accept', 'application/json')
          .expect(201)
          .expect('Location',/^\/gribs\/\w*$/) // Location /gribs/id
          .end(function(err, res) {
            should.not.exist(err);
            res.body.status.should.eql('READY_FOR_DOWNLOAD');
            done();
          });
      });

      it('should start download', function(done) {
        request(server)
          .post('/gribs')
          .send({ name: 'aGribFileName', download_url : 'http://xxx'})
          .set('Accept', 'application/json')
          .expect(201)
          .end(function(err, res) {
            should.not.exist(err);
            var id = res.body.id;
            sinon.assert.calledWith(downloader.start_download,id,'http://xxx');
            done();
          });
      });


    });

  });

  describe('get_grib', function() {

    describe('GET /gribs/{id}', function() {

      it('should return 404 when resource does not exist', function(done) {
          request(server)
            .get('/gribs/invalid_id')
            .set('Accept', 'application/json')
            .expect(404)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.message.should.match(/not found/);
              done();
            });
      });

      it('should return resource when it exists', function(done) {
        var test_data = [
          { id:'1', name:'file1', download_url: 'http://myserver/file1', status:'READY_FOR_DOWNLOAD'},
          { id:'2', name:'file2', download_url: 'http://myserver/file2', status:'READY_FOR_DOWNLOAD'},
          { id:'3', name:'file3', download_url: 'http://myserver/file3', status:'READY_FOR_DOWNLOAD'}
        ];
        store.set_items(test_data);

          request(server)
            .get('/gribs/2')
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.should.eql(test_data[1]);
              done();
            });
      });

      it('should retrieve resource using Location returned by POST request', function(done) {

        var grib_location;

        var post_request = function(callback) {
          request(server)
            .post('/gribs')
            .send({ name: 'aGribFileName', download_url : 'http://xxx'})
            .set('Accept', 'application/json')
            .expect(201)
            .expect('Location',/gribs/) // Location /gribs/id
            .end(function(err, res) {
              if(err) callback(err);
              grib_location = res.headers['location']
              callback(null,res.body);
            });
        };
        var get_request = function(callback) {
          request(server)
            .get(grib_location)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if(err) callback(err);
              callback(null,res.body);
            });
        };
        async.series([post_request,get_request],
          function(err,results) {
            should.not.exist(err)
            results[0].should.eql(results[1]);
            done();
          })
      });

    })

  })

});
