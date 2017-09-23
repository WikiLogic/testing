// Testing the Claims route
// Have the API running, this will test it!

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
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.top = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  // create  claim off which we're going to start doing argument testing
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST claim against 1', probability: '75' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.against1 = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST claim against 2', probability: '75' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
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
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
      argTestClaims.for1 = response.body.data.claim;
      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });
  it('Creating a new claim for the sake of argument testing, should work', function(done) {
    api.post('/claims').send({ text: 'ARG_TEST claim for 2', probability: '25' })
    .set('Accept', 'application/json').set('Authorization', JWT).expect(200)
    .then((response) => {
      assert(response.body.data.claim._id, 'returned claim should have an _id');
      assert(response.body.data.claim._key, 'returned claim should have a _key');
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
      parentClaimId: argTestClaims.top._key, //pass the id of the first 'top' claim we created above
      type: 'FOR',
      premisIds: [argTestClaims.for1._key, argTestClaims.for2._key] //give the ids of the two 'for' claims we created above
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      let hasForGroup = 0;
      let returnedArgs = response.body.data.claim.arguments;
      argTestClaims.forArg = response.body.data.claim.arguments;
      
      assert(response.body.data.claim._id == argTestClaims.top._id, 'The parent claim should be the one returned');
      assert(returnedArgs.length > 0, 'The claim should now have at least 1 argument');

      for (var a = 0; a < returnedArgs.length; a++) {
        returnedArgs[a]
        assert(returnedArgs[a].probability, 'each argument should have a probability set');
      }


      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });

  //also add the against arguments
  it('Posting a new argument to the claim we just created should return that claim with arguments attached', function(done) {
    api.post('/arguments')
    .send({ 
      parentClaimId: argTestClaims.top._id, //pass the id of the first 'top' claim we created above
      type: 'AGAINST',
      premisIds: [argTestClaims.against1._id, argTestClaims.against2._id] //give the ids of the two 'for' claims we created above
    })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200)
    .then((response) => {
      
      let returnedArgs = response.body.data.claim.arguments;
      argTestClaims.arguments = response.body.data.claim.arguments;
      
      assert(response.body.data.claim._id == argTestClaims.top._id, 'The parent claim should be the one returned');
      assert(response.body.data.claim.arguments.length > 1, 'The claim should now have at least 2 arguments');

      for (var a = 0; a < returnedArgs.length; a++) {
        assert(returnedArgs[a].probability, 'each returned argument should have a probability');
        assert(returnedArgs[a]._id, 'each returned argument should have an _id property');
        assert(returnedArgs[a]._id.indexOf('/') > 0, 'the _id property should match the arango format');
        assert(returnedArgs[a]._key, 'each returned argument should have a _key property');
        assert(returnedArgs[a]._key.indexOf('/') == -1, 'the _key property should match the arango format');
        assert(returnedArgs[a].type, 'each returned argument should have a type property');
        assert(returnedArgs[a].creationDate, 'each returned argument should have a creationDate property');
      }

      done();
    }).catch((err) => {
      console.log("test promise error?", err);
    });
  });


  //test the probability stuff


  //remove the arguments (should also remove the premise links)
  it('Delete for argument', function(done) {
    api.del('/arguments').send({ _id: argTestClaims.arguments[0]._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  
  it('Delete against argument', function(done) {
    api.del('/arguments').send({ _id: argTestClaims.arguments[1]._id })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });

  //remove the claims
  it('Delete top claim', function(done) {
    api.del('/claims').send({ _key: argTestClaims.top._key })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete against 1', function(done) {
    api.del('/claims').send({ _key: argTestClaims.against1._key })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete against 1', function(done) {
    api.del('/claims').send({ _key: argTestClaims.against2._key })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete for 1', function(done) {
    api.del('/claims').send({ _key: argTestClaims.for1._key })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });
  it('Delete for 2', function(done) {
    api.del('/claims').send({ _key: argTestClaims.for2._key })
    .set('Accept', 'application/json').set('Authorization', JWT)
    .expect(200, done);
  });

});
