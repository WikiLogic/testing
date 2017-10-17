var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost/api/v1');
var async = require('async');


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

  //sign up the test user
  it('Signup request should return 200 and the relevant data', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: 'test@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(200)
    .then(response => {

      assert(response.body.data.user.username == 'test', 'The new user should have the username we signed up with');
      var datetime = new Date().toISOString().replace(/T/, ' ').substr(0, 10);
      assert(response.body.data.user.signUpDate == datetime, 'The new user\'s sign up date should be today');

      JWT = `JWT ${response.body.data.token}`;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
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
      parentClaimId: apiData.claim1._id,
      type: 'FOR',
      premiseIds: [apiData.claim2._id]
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