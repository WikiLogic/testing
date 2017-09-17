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

// To test this we will need to create a top claim and two argument groups, each with 2 claims within them (for now, more in the future!)
// Top claim
//      against group 1
//          claim against 1
//          claim against 2
//      for group 1
//          claim for 1
//          claim for 2


describe('Testing the /claims route', function() {
  let JWT = '';
  let argTestClaims = {};

  
  //be sure to be logged in
  it('The log in credentials you set should log us in', function(done) {
    api.post('/login').send({ username: credentials.username, password: credentials.password })
    .set('Accept', 'application/json').expect('Content-Type', /json/).expect(200)
    .then(response => {
      JWT = `JWT ${response.body.data.token}`;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  // create the claim off which we're going to start doing argument testing
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST top claim', probability: '50' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      argTestClaims.top = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  // create  claim off which we're going to start doing argument testing
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST claim against 1', probability: '50' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      argTestClaims.against1 = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST claim against 2', probability: '50' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      argTestClaims.against2 = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST claim for 1', probability: '50' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      argTestClaims.for1 = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST claim for 2', probability: '50' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      argTestClaims.for2 = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  // =========================================================== 
  // =========================================================== 
  // Starting the actual argument testing way down here!!!!!!!!!
  // =========================================================== 
  // =========================================================== 

  //invent a new argument and add it to that claim
  it('Posting a new argument to the claim we just created should return that claim with arguments attached', function(done) {
    api.post('/arguments')
    .send({ 
      parentClaimId: argTestClaims.top.id, //pass the id of the first 'top' claim we created above
      type: 'FOR',
      premisIds: [argTestClaims.for1.id, argTestClaims.for2.id], //give the ids of the two 'for' claims we created above
      probability: '50'
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      let hasFor1 = false, hasFor2 = false;
      let returnedArgs = response.body.data.claim.arguments;
      
      assert(response.body.data.claim.id == argTestClaims.top.id, 'The parent claim should be the one returned');
      assert(response.body.data.claim.arguments.length > 0, 'The claim should now have at least 1 argument');

      for (var a = 0; a < returnedArgs.length; a++) {
        for (var c = 0; c < returnedArgs[a].premisIds.length; c++) {
          if (returnedArgs[a].premisIds[c] == argTestClaims.for1.id) {
            hasFor1 = true;
          }
          if (returnedArgs[a].premisIds[c] == argTestClaims.for2.id) {
            hasFor2 = true;
          }
        }
      }

      assert((hasFor1 && hasFor2), 'The claim should have the argument we passed to it');

      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

});
