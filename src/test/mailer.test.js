const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should;

chai.use(chaiAsPromised);
should();

const Mailer = require('../mailer');

suite('The mailer',() => {
  test('can send an email', (done) => {
    const mailerConfig = {
      username: 'ricky.hussmann@gmail.com',
      password: 'superpass'
    };
    const mailer = new Mailer(mailerConfig);

    const message = {
      to: 'ricky.hussmann@gmail.com',
      subject: 'This is a test',
      message: 'This is the test message content.'
    };

    mailer.sendMessage(message).should.be.fulfilled.notify(done);
  });
});
