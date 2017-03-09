var should = require('should');
var request = require('supertest');
var server = require('../../../app');
var async = require('async');

describe('controllers', function() {

  describe('get_gribs', function() {

    describe('GET /gribs', function() {

      it('should return empty array', function(done) {

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

      it('should accept a name parameter', function(done) {

        request(server)
          .get('/gribs')
          .query({ name: 'aName'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql([]);

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
            //res.body.should.eql([]);
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
    });

  });

});
