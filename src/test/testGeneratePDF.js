const expect = require('chai').expect;
const should = require('chai').should();
const request = require('request');

const app = require('../app');

suite('The form webapp', () => {
  let port;

  test('renders a sample PDF', (done) => {
    let name = {
      first: 'Ricky',
      last: 'Hussmann'
    };

    const options = {
      method: 'POST',
      uri: `http://localhost:${port}/target`,
      body: {
        name: name
      },
      json: true
    };

    request(options, (err, response) => {
      expect(err).to.be.null;
      response.statusCode.should.equal(200);
      response.body.should.have.length.above(0);
      done(err);
    });
  }).timeout(5000);

  setup((done) => {
    app.launchOnRandomPort((appPort) => {
      port = appPort;
      done();
    });
  });

  teardown(() => { app.terminate(); });
});
