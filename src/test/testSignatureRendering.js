const app = require('../app');
const jsdom = require('jsdom');
const path = require('path');
const rp = require('request-promise');

function renderHTML(html) {
  return new Promise((resolve, reject) => {
    jsdom.env({
      html: html,
      scripts: [
        path.normalize(__dirname + '/../../public/script/signature_pad.min.js'),
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js',
        path.normalize(__dirname + '/../../public/script/form.js')
      ],
      done: (errors, window) => {
        if (errors) {
          return reject(errors);
        }

        // Wait for jQuery to finish and load
        const $ = window.$;
        $(function() {
          return resolve(window);
        });
      },
      virtualConsole: jsdom.createVirtualConsole().sendTo(console)
    });
  });
}

suite('Rendering of boudoir form', () => {
  let port;
  setup((done) => {
    app.launchOnRandomPort((appPort) => {
      port = appPort;
      done();
    });
  });

  teardown(() => {
    app.terminate();
  });

  test('a signature can be pre-populated', (done) => {
    const smileData = 'data:image/png;base64,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';
    const options = {
      method: 'POST',
      uri: `http://localhost:${port}/render`,
      body: {
        signatureData: smileData
      },
      json: true
    };

    rp(options).then((body) => {
      return renderHTML(body);
    }).then((window) => {
      window.SignatureController.registerImageLoadCallback(function() {
        window.SignatureController.toDataUrl().should.equal(smileData);
      });
      done();
    }).catch((err) => {
      done(err);
    });
  }).timeout(5000);
});
