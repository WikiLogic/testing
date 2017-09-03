// Testing the API
// Have the API running, this will test it!

var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api');

describe('/test', function() {
  it('Should return ', function(done) {
    api.get('/test')
    .set('Accept', 'application/json')
    .expect(200, done);
  });
});

describe('/login', function() {

  it('Should return ', function(done) {
    api.post('/login')
    .send({ username: 'nobody', password: 'bleep' })
    .set('Accept', 'application/json')
    .expect(200, done);
  });
});