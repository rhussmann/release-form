const nodemailer = require('nodemailer');

/** Class for sending email through using GMail **/
class Mailer {

  /**
   * Creates a new mailer
   * @param {Object} mailerConfig - Authentication info for the GMail account
   * @param {string} mailerConfig.user - GMail SMTP username
   * @param {string} mailerConfig.pass - GMail SMTP password
   */
  constructor(mailerConfig) {
    this.user = mailerConfig.user;
    this.transport = new nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailerConfig.user,
        pass: mailerConfig.pass
      }
    });
  }


  /**
   * Sends an email
   * @param {Object} message - Object describing the message
   * @param {string} message.to - Recipient email address
   * @param {string} message.subject - Subject of the email
   * @param {string} message.text - Text of the email
   * @param {Array} message.attachments - an array of objects with properties filename and content (a buffer)
   * @returns {Promise}
   */
  sendMessage(message) {
    message.attachments = message.attachments || [];
    const options = {
      from: this.user,
      to: message.to,
      subject: message.subject,
      text: message.message,
      attachments: []
    };

    for (let i=0; i < message.attachments.length; i++) {
      let attachment = message.attachments[0];
      options.attachments.push(attachment);
    }

    return new Promise((resolve, reject) => {
      this.transport.sendMail(options, (err, info) => {
        return (err) ? reject(err) : resolve();
      });
    });
  }
}

module.exports = Mailer;
