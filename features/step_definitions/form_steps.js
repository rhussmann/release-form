const chai = require('chai');
const seleniumWebdriver = require('selenium-webdriver');
const {defineSupportCode} = require('cucumber');

const By = seleniumWebdriver.By;
chai.should();

const app = require('../../src/app');

defineSupportCode(function({Given, When, Then, Before, After}) {
  Before((scenarioResult, callback) => {
    app.launch(() => {
      callback();
    });
  });

  After(() => {
    app.terminate();
  });

  Given('I am on the form webpage', function () {
    const driver = this.driver;
    driver.get('http://localhost:3000/');
  });

  When('I enter my data and click {stringInDoubleQuotes}', function (buttonName) {
    return this.driver.findElement(By.id('submit-button')).then((button) => {
      return button.click();
    });
  });

  // When fetching our PDF in Chrome, the page source will have an element
  // in the body named <embed> with an attribute of type="application/pdf"
  //
  // That is how to detect for a PDF (not cross-browser compatible)
  Then('I am presented with a PDF version of my form', function (callback) {

    const driver = this.driver;
    driver.findElement(By.id('plugin')).then((element) => {
      return element.getAttribute('type');
    }).then((typeValue) => {
      typeValue.should.equal('application/pdf');
      app.terminate();
      callback();
    });
  });

});
