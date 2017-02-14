var seleniumWebdriver = require('selenium-webdriver');
var {defineSupportCode} = require('cucumber');
const app = require('../../src/app');

defineSupportCode(function({Given, When, Then}) {
  Given('I am on the form webpage', function (callback) {
    // Write code here that turns the phrase above into concrete actions
    const that = this;
    app.launch(() => {
      callback(null, that.driver.get('http://localhost:3000/'));
    });
  });

  When('I enter my data and click {stringInDoubleQuotes}', function (buttonName, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback(null, 'pending');
  });

  Then('I am presented with a PDF version of my form', function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback(null, 'pending');
  });
});
