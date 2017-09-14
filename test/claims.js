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

  //Create a claim - if the claim already exists the existing one should just be returned but with an error in the errors array
  it('Posting claim data to /claims should return a claim', function(done) {
    api.post('/claims')
    .send({ text: 'MochaTest', probability: '55' })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      assert(response.body.data.claim.text == 'MochaTest', 'Returned new claim should have the text we set');
      assert.exists(response.body.data.claim.id, 'Returned new claim should have an .id');
      testClaim = response.body.data.claim;
      
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  //Create a claim with the same text - should fail
  it('Posting claim with duplicate text should return the existing claim but also an error object', function(done) {
    api.post('/claims')
    .send({ text: 'MochaTest', probability: '55' })
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {

      assert(response.body.data.claim.text == 'MochaTest', 'Returned new claim should have the text we set');
      assert.exists(response.body.data.claim.id, 'Returned new claim should have an .id');
      testClaim = response.body.data.claim;

      assert(response.body.errors.length > 0, 'Trying to create a claim that already exists should prompt an error in the api response');
      done();
    });
  });

  //get the claim we just created
  it('Getting the claim we just created by it\'s id Should return that claim', function(done) {
    api.get(`/claims/${testClaim.id}`)
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      assert(response.body.data.claim.text == testClaim.text, 'Returned claim should have the text we\'re expecting');
      assert(response.body.data.claim.probability == testClaim.probability, 'Returned claim should still have the initial probability we set');
      assert(response.body.data.claim.id == testClaim.id, 'Returned claim should have the id we\'re expecting');
      
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  //Edit the claim we just created

  //Delete the claim we just created

});
