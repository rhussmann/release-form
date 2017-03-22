const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const should = chai.should;

const mailerTestConfig = require('../../../config/mailer-test-config');

chai.use(chaiAsPromised);
should();

const Mailer = require('../../mailer');
const mailerConfig = {
  user: mailerTestConfig.username,
  pass: mailerTestConfig.password
};
let mailer = new Mailer(mailerConfig);

suite('The mailer',() => {
  test('can send an email', () => {
    const message = {
      to: 'ricky.hussmann@gmail.com',
      subject: 'This is a test',
      message: 'This is the test message content.'
    };

    return mailer.sendMessage(message);
  }).timeout(5000);

  test('can include an attachment', () => {
    const message = {
      to: 'ricky.hussmann@gmail.com',
      subject: 'This is a test',
      message: 'This is the test message content.',
      attachments: [
        {
          filename: 'bogus.pdf',
          content: fs.readFileSync('./agreement.pdf')
        }
      ]
    };

    return mailer.sendMessage(message);
  }).timeout(5000);
});
