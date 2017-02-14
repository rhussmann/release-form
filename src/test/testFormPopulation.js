const fs = require('fs');
const path = require('path');
const should = require('chai').should();
const mustache = require('mustache');

var states = '[{"name":"N/A","abbr":""},{"name":"Alaska","abbr":"AK"},{"name":"Alabama","abbr":"AL"},{"name":"Arkansas","abbr":"AR"},{"name":"Arizona","abbr":"AZ"},{"name":"California","abbr":"CA"},{"name":"Colorado","abbr":"CO"},{"name":"Connecticut","abbr":"CT"},{"name":"District of Columbia","abbr":"DC"},{"name":"Delaware","abbr":"DE"},{"name":"Florida","abbr":"FL"},{"name":"Georgia","abbr":"GA"},{"name":"Hawaii","abbr":"HI"},{"name":"Iowa","abbr":"IA"},{"name":"Idaho","abbr":"ID"},{"name":"Illinois","abbr":"IL"},{"name":"Indiana","abbr":"IN"},{"name":"Kansas","abbr":"KS"},{"name":"Kentucky","abbr":"KY"},{"name":"Louisiana","abbr":"LA"},{"name":"Massachusetts","abbr":"MA"},{"name":"Maryland","abbr":"MD"},{"name":"Maine","abbr":"ME"},{"name":"Michigan","abbr":"MI"},{"name":"Minnesota","abbr":"MN"},{"name":"Missouri","abbr":"MO"},{"name":"Mississippi","abbr":"MS"},{"name":"Montana","abbr":"MT"},{"name":"North Carolina","abbr":"NC"},{"name":"North Dakota","abbr":"ND"},{"name":"Nebraska","abbr":"NE"},{"name":"New Hampshire","abbr":"NH"},{"name":"New Jersey","abbr":"NJ"},{"name":"New Mexico","abbr":"NM"},{"name":"Nevada","abbr":"NV"},{"name":"New York","abbr":"NY"},{"name":"Ohio","abbr":"OH"},{"name":"Oklahoma","abbr":"OK"},{"name":"Oregon","abbr":"OR"},{"name":"Pennsylvania","abbr":"PA"},{"name":"Puerto Rico","abbr":"PR"},{"name":"Rhode Island","abbr":"RI"},{"name":"South Carolina","abbr":"SC"},{"name":"South Dakota","abbr":"SD"},{"name":"Tennessee","abbr":"TN"},{"name":"Texas","abbr":"TX"},{"name":"Utah","abbr":"UT"},{"name":"Virginia","abbr":"VA"},{"name":"Vermont","abbr":"VT"},{"name":"Washington","abbr":"WA"},{"name":"Wisconsin","abbr":"WI"},{"name":"West Virginia","abbr":"WV"},{"name":"Wyoming","abbr":"WY"}]';

function loadTemplate(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.normalize(__dirname + `/../views/${fileName}`), 'utf-8', (err, data) => {
      return (err) ? reject(err) : resolve(data);
    });
  });
}

function renderTemplate(html) {
  return new Promise((resolve, reject) => {
    const jsdom = require('jsdom');
    jsdom.env({
      html: html,
      scripts: [
        path.normalize(__dirname + '/../../public/script/signature_pad.js'),
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js',
        path.normalize(__dirname + '/../../public/script/form.js')
      ],
      features: {
        FetchExternalResources: ['script'],
        ProcessExternalResources: ['script']
      },
      done: (errors, window) => {
        return (errors) ? reject(errors) : resolve(window);
      }
    });
  });
}

suite('Boudoir agreement form population', () => {
  test('renders with pre-populated data', (done) => {
    const selval = 'AL';
    const model = {
      name: {
        first: 'John',
        last: 'Smith'
      },
      address: {
        line1: '123 Main St.',
        line2: 'Unit 3',
        city: 'Smallville',
        state: 'AL',
        zip: '12345'
      },
      contact: {
        phone: '123-456-7890',
        email: 'john.smith@example.org'
      },
      usage: {
        any: { facebook: true, blog: true, other: true },
        ambiguous: { facebook: true, blog: true, other: true }
      },
      release: {
        publications: { none: true, printOnly: false },
        permissions: { advertising: true, print: true, publication: true }
      },
      states: JSON.parse(states),
      selected: function() {
        return (this.abbr === selval) ? 'selected' : '';
      }
    };

    loadTemplate('basic.mustache').then((templateString) => {
      const html = mustache.render(templateString, model);
      return renderTemplate(html);
    }).then((window) => {
      const $ = window.$;

      $('#first-name').prop('value')
        .should.equal(model.name.first);
      $('#last-name').prop('value')
        .should.equal(model.name.last);

      $('input[name="address-1"]').val()
        .should.equal(model.address.line1);
      $('input[name="address-2"]').val()
        .should.equal(model.address.line2);
      $('input[name="city"]').val()
        .should.equal(model.address.city);
      $('select[name="state"]').val()
        .should.equal(model.address.state);
      $('input[name="zip"]').val()
        .should.equal(model.address.zip);

      $('input[name="phone"]').val()
        .should.equal(model.contact.phone);
      $('input[name="email"]').val()
        .should.equal(model.contact.email);

      $('input[name="facebook-photos"]').prop('checked')
        .should.equal(model.usage.any.facebook);
      $('input[name="blog-photos"]').prop('checked')
        .should.equal(model.usage.any.blog);
      $('input[name="other-photos"]').prop('checked')
        .should.equal(model.usage.any.other);

      done();
    }).catch((err) => {
      done(err);
    });
  }).timeout(3000);
});
