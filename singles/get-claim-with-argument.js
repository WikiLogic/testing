var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api/v1');
var async = require('async');
var credentials;
try {
  credentials = require('../api-credentials.json');
} catch(err) {
  throw 'You need to create a api-credentials.json file in the root of this testing repo, rename api-credentials-example.json and add your api login';
}

describe('Authentication responses', function() {
  let JWT = '';
  let testData = {
    claim1: {
      text: 'ONE_SHOT claim',
      probability: '50'
    },
    claim2: {
      text: 'ONE_SHOT premise',
      probability: '75'
    }
  }
  let apiData = {};

  //be sure to be logged in
  it('Log in', function(done) {
    api.post('/login').send({ username: credentials.username, password: credentials.password })
    .set('Accept', 'application/json').expect('Content-Type', /json/).expect(200)
    .then(response => {
      JWT = `JWT ${response.body.data.token}`;
      done();
    })
  });

  //make the 2 claims
  it('Create Claim', function(done) {
    api.post('/claims').send({ text: testData.claim1.text, probability: testData.claim1.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      apiData.claim1 = response.body.data.claim;
      done();
    })
  });
  it('Create Premise', function(done) {
    api.post('/claims').send({ text: testData.claim2.text, probability: testData.claim2.probability })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      apiData.claim2 = response.body.data.claim;
      done();
    })
  });

  //make the argument that links them
  it('Create Argument', function(done) {
    api.post('/arguments')
    .send({ 
      parentClaimId: apiData.claim1._key,
      type: 'FOR',
      premiseIds: [apiData.claim2._key]
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      //Responce should be an updated claim 1
      assert(apiData.claim1._id == response.body.data.claim._id, 'The returned claim should be an updated claim 1');
      assert(response.body.data.claim.arguments.length == 1, 'the updated claim 1 should now have one argument')
      apiData.claim1 = response.body.data.claim;
      done();
    })
  });

  //get the top claim
  it('Get claim', function(done) {
    api.get(`/claims/${apiData.claim1._key}`)
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id == apiData.claim1._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key == apiData.claim1._key, 'returned claim should have a _key');
      assert(response.body.data.claim.arguments.length == 1, 'Should have the argument' + JSON.stringify(response.body.data.claim, null, 2));
      done();
    })
  });

});