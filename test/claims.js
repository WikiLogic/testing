// Testing the Claims route
// Have the API running, this will test it!

var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api');
var async = require('async');
var credentials;
try {
  credentials = require('../api-credentials.json');
} catch(err) {
  throw 'You need to create a api-credentials.json file in the root of this testing repo, rename api-credentials-example.json and add your api login';
}

describe('Testing the /claims route', function() {
  let JWT = '';
  let testClaim = {};

  
  //be sure to be logged in
  it('The log in credentials you passed in should log us in', function(done) {
    console.log(' ----- credentials', JSON.stringify(credentials));
    api.post('/login')
    .send({ username: credentials.username, password: credentials.password })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
      JWT = `JWT ${response.body.data.token}`;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  //Create a claim
  it('Posting claim data to /claims should create a new claim', function(done) {
    api.post('/claims')
    .send({ text: 'MochaTest', probability: '55' })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then(response => {
      
      assert(response.body.data.claim.text == 'MochaTest', 'Returned new claim should have the text we set');
      assert(response.body.data.claim.probability == '55', 'Returned new claim should have the initial probability we set');
      assert.exists(response.body.data.claim.id, 'Returned new claim should have an .id');

      testClaim = response.body.data.claim;
      
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  //Create a claim with the same text - should fail
  it('Posting claim with duplicate text should fail', function(done) {
    api.post('/claims')
    .send({ text: 'MochaTest', probability: '55' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });

  //get the claim we just created
  it('Should return ', function(done) {
    api.get(`/claims/${testClaim.id}`)
    .set('Accept', 'application/json')
    .expect(200)
    .then(response => {
      
      assert(response.body.data.claim.text == testClaim.text, 'Returned claim should have the text we\'re expecting');
      assert(response.body.data.claim.probability == testClaim.probability, 'Returned claim should still have the initial probability we set');
      assert(response.body.data.claim.id == testClaim.id, 'Returned claim should have the id we\'re expecting');
      
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });;
  });

  //Edit the claim we just created

  //Delete the claim we just created

});
