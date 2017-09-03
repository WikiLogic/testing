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
  // log in with no username - returns credential error
  it('Login request with empty params should return 400 Bad Request error', function(done) {
    api.post('/login')
    .send({ username: '', password: '' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(400, done);
    // .then(response => {
    //   assert(response.body.errors[0].title, 'lorem ipsum')
    //   done();
    // })
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
    .expect(200, done)
    .then(response => {
      assert(response.body.data.user.username, 'test')
      done();
    });
  });

  // log out without passing the jwt - shoul not have logged out the user

  // log out with the jwt - should log you out

  // sign up with test username - sign up error, username already exists (possibly do this with controversial words...?)

  // sign up with test email - sign up error, email already exists

  // retrieve password... ??? test needs to recieve email somehow

  // delete test user - 401 unauthorized (we're not logged in)

  // test user login, correct username, wrong password - credential error

  // test user login correct username, correct password - logged in!

  // test user login again... ???

  // delete test user - logs you out

  // login with test user - returns credential error
  it('Should return ', function(done) {
    api.post('/login')
    .send({ username: 'nobody', password: 'bleep' })
    .set('Accept', 'application/json')
    .expect(200, done);
  });
});