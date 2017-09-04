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

describe('Authentication responses', function() {
  let JWT = '';

  // log in with no username - returns credential error
  it('Login request with empty params should return 400 Bad Request error', function(done) {
    api.post('/login')
    .send({ username: '', password: '' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(400, done);
  });

  // sign up test user, no password - sign up fail, need password
  it('Signup request with empty params should return 400 Bad Request error', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: '', password: '' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });

  // sign up test user, with password - signs you up! Return user object & token
  it('Signup request with correctly formatted data should return 200, the new user object, and a JWT', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: 'test@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(200)
    .then(response => {
      assert(response.body.data.user.username, 'test');
      JWT = `JWT ${response.body.data.token}`;
      done();
    });
  });


  it('After sign up it should allow you to get the relevant user info', function(done) {
    api.get('/user')
    .set('Accept', 'application/json')
    .set('Authorization', JWT)
    .expect(200)
    .then(response => {
      console.log("response", JSON.stringify(response.body));
      assert(response.body.data.user.username, 'test');
      done();
    });
  });

  // log out without passing the jwt - shoul not have logged out the user

  // log out with the jwt - should log you out

  // sign up with test username - sign up error, username already exists (possibly do this with controversial words...?)
  it('Signup request with a username that is already taken, should return 400 Bad Request error', function(done) {
    api.post('/signup')
    .send({ username: 'test', email: 'test2@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });
  
  // sign up with test email - sign up error, email already exists
  it('Signup request with an email that is already taken, should return 400 Bad Request error', function(done) {
    api.post('/signup')
    .send({ username: 'test2', email: 'test@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(400, done);
  });

  // retrieve password... ??? test needs to recieve email somehow

  // delete test user - 401 unauthorized (we're not logged in)
  it('Delete user without authentication, should return 401 Unauthorized', function(done) {
    api.del('/user')
    .send({ username: 'test', email: 'test2@test.com', password: 'test' })
    .set('Accept', 'application/json')
    .expect(401, done);
  });

  // test user login, correct username, wrong password - credential error
  it('Login request with wrong password should return 401 Unauthorized', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'wrong' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

  // test user login correct username, correct password - logged in!
  it('Login request with correct params should return 200, the user object, and a JWT', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'test' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(response => {
      assert(response.body.data.user.username, 'test');
      JWT = `JWT ${response.body.data.token}`;
      done();
    });
  });

  // test user login again... ???

  // delete test user - logs you out
  it('Delete user with authentication should return 200 and log you out', function(done) {
    api.del('/user')
    .set('Authorization', JWT)
    .set('Accept', 'application/json')
    .send({ username: 'test', email: 'test2@test.com', password: 'test' })
    .expect(200, done);
  });

  // login with test user - returns credential error
  it('Login with the just deleted user should return 401 unauthorized', function(done) {
    api.post('/login')
    .send({ username: 'test', password: 'test' })
    .set('Accept', 'application/json')
    .expect(401, done);
  });
});