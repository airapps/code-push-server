var app = require('../../../app');
var request = require('supertest')(app);
var should = require("should");
var security = require('../../../core/utils/security');
var factory = require('../../../core/utils/factory');
var _ = require('lodash');

describe('api/accessKeys/accessKeys.test.js', function() {
  var account = '522539441@qq.com';
  var password = '123456';
  var authToken;
  var friendlyName = 'test';
  var newFriendlyName = 'newtest';
  before(function(done){
    request.post('/auth/login')
    .send({
      account: account,
      password: password
    })
    .end(function(err, res) {
      should.not.exist(err);
      var rs = JSON.parse(res.text);
      rs.should.containEql({status:"OK"});
      authToken = (new Buffer(`auth:${_.get(rs, 'results.tokens')}`)).toString('base64');
      done();
    });
  });

  describe('create accessKeys', function(done) {
    it('should create accessKeys successful', function(done) {
      request.post(`/accessKeys`)
      .set('Authorization', `Basic ${authToken}`)
      .send({createdBy: 'tablee', friendlyName: friendlyName, isSession: false, ttl: 30*24*60*60})
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(200);
        var rs = JSON.parse(res.text);
        rs.should.have.properties('accessKey');
        rs.accessKey.should.have.properties(['name', 'createdTime', 'createdBy',
          'expires', 'isSession', 'description', 'friendlyName']);
        done();
      });
    });

    it('should not create accessKeys successful when friendlyName exist', function(done) {
      request.post(`/accessKeys`)
      .set('Authorization', `Basic ${authToken}`)
      .send({createdBy: 'tablee', friendlyName: friendlyName, isSession: true, ttl: 30*24*60*60})
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(406);
        res.text.should.equal(`The access key "${friendlyName}"  already exists.`);
        done();
      });
    });
  });

  describe('list accessKeys', function(done) {
    it('should list accessKeys successful', function(done) {
      request.get(`/accessKeys`)
      .set('Authorization', `Basic ${authToken}`)
      .send()
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(200);
        var rs = JSON.parse(res.text);
        rs.should.have.properties('accessKeys');
        rs.accessKeys.should.be.an.instanceOf(Array);
        rs.accessKeys.should.matchEach(function(it) {
          return it.should.have.properties(['name', 'createdTime', 'createdBy',
          'expires', 'isSession', 'description', 'friendlyName']);
        });

        done();
      });
    });
  });

  describe('modify accessKeys', function(done) {
    it('should modify accessKeys add ttl successful', function(done) {
      request.patch(`/accessKeys/${encodeURI(friendlyName)}`)
      .set('Authorization', `Basic ${authToken}`)
      .send({ttl: 7*24*60*60*1000})
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(200);
        var rs = JSON.parse(res.text);
        rs.should.have.properties('accessKey');
        rs.accessKey.should.have.properties(['name', 'createdTime', 'createdBy',
          'expires', 'isSession', 'description', 'friendlyName']);
        done();
      });
    });

    it('should modify accessKeys substact ttl successful', function(done) {
      request.patch(`/accessKeys/${encodeURI(friendlyName)}`)
      .set('Authorization', `Basic ${authToken}`)
      .send({ttl: -7*24*60*60*1000})
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(200);
        var rs = JSON.parse(res.text);
        rs.should.have.properties('accessKey');
        rs.accessKey.should.have.properties(['name', 'createdTime', 'createdBy',
          'expires', 'isSession', 'description', 'friendlyName']);
        done();
      });
    });

    it('should not modify accessKeys friendlyName successful when friendlyName exists', function(done) {
      request.patch(`/accessKeys/${encodeURI(friendlyName)}`)
      .set('Authorization', `Basic ${authToken}`)
      .send({friendlyName: friendlyName})
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(406);
        res.text.should.equal(`The access key "${friendlyName}"  already exists.`);
        done();
      });
    });

    it('should not modify accessKeys friendlyName successful when friendlyName invalid', function(done) {
      request.patch(`/accessKeys/${encodeURI(newFriendlyName)}`)
      .set('Authorization', `Basic ${authToken}`)
      .send({friendlyName: newFriendlyName})
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(406);
        res.text.should.equal(`The access key "${newFriendlyName}" does not exist.`);
        done();
      });
    });

    it('should modify accessKeys friendlyName successful', function(done) {
      request.patch(`/accessKeys/${encodeURI(friendlyName)}`)
      .set('Authorization', `Basic ${authToken}`)
      .send({friendlyName: newFriendlyName})
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(200);
        var rs = JSON.parse(res.text);
        rs.should.have.properties('accessKey');
        rs.accessKey.should.have.properties(['name', 'createdTime', 'createdBy',
          'expires', 'isSession', 'description', 'friendlyName']);
        done();
      });
    });
  });

  describe('delete accessKeys', function(done) {
    it('should delete accessKeys successful', function(done) {
      request.delete(`/accessKeys/${encodeURI(newFriendlyName)}`)
      .set('Authorization', `Basic ${authToken}`)
      .send()
      .end(function(err, res) {
        should.not.exist(err);
        res.status.should.equal(200);
        var rs = JSON.parse(res.text);
        rs.should.have.properties('friendlyName');
        done();
      });
    });
  });

});
