var should = require('should');
var sinon = require ('sinon');
var store = require('../../../api/helpers/store');

describe('helpers', function() {

  describe('store', function() {

    describe('get_all', function() {


      it('should return empty array when no data are available', function() {
        store.reset();
        store.get_all().should.eql([]);
      });


    })

  })

});
