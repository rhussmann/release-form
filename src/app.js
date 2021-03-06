const bodyParser = require('body-parser');
const cons = require('consolidate');
const express = require('express');
const fs = require('fs');
const logger = require('winston');
const net = require('net');
const path = require('path');
const phantom = require('phantom');
const rp = require('request-promise');
const tmp = require('tmp');

// TODO: Remove this if /render is removed
// and it is not directly used
const mustache = require('mustache');

const States = require('./States');
const Mailer = require('./mailer');
const mailerConfig = require('../config/mailer-config');
const config = require('../config/config');
const mailer = new Mailer({
  user: mailerConfig.username,
  pass: mailerConfig.password
});

const app = express();
let Phantom = null;
let app_port = null;

const TOTAL_ATTEMPTS = 4;
const DELAY_IN_S = 60;
let retriesLeft = TOTAL_ATTEMPTS;
function generateTemplatePromise() {
  return new Promise((resolve, reject) => {
    rp(config.templateUrl)
      .then((data) => {
        console.log("Template fetched successfully!");
        resolve(data);
      }).catch((e) => {
        retriesLeft -= 1;
        console.log(`Error fetching template, ${retriesLeft} retries left`);
        if (retriesLeft < 1) {
          throw e;
        }

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, DELAY_IN_S * 1000);
        }).then(generateTemplatePromise);
      });
  });
}

console.log("Attempting to fetch template.");
let templatePromise = generateTemplatePromise();

// LOGGING
app.use((req, res, next) => {
  let _end = res.end;
  const that = this;

  res.end = function() {
    logger.info(`${req.method} - ${req.path}`);
    _end.apply(this, arguments);
  }

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('mustache', cons.mustache);
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

function generateTempFile() {
  return new Promise((resolve, reject) => {
    tmp.file({postfix: '.pdf', keep: true}, (err, path, fd, cleanupCallback) => {
      return (err) ? reject(err) : resolve({
        path: path,
        fd: fd,
        cleanupCallback: cleanupCallback
      });
    });
  });
}

app.get('/', (req, res) => {
  templatePromise.then((templateString) => {
    res.send(mustache.render(templateString, {states: JSON.parse(States.states())}));
  });
});

app.post('/api/refresh', (req, res) => {
  console.log('Refreshing template promise');
  templatePromise = generateTemplatePromise();
  res.sendStatus(200);
});

app.post('/api/target', (req, res) => {
  let filename = null;
  let pageObject = null;
  let cleanupCallback = null;

  res.header('Content-disposition', 'inline; filename=agreement.pdf');
  res.header('Content-type', 'application/pdf');

  Phantom.createPage().then((page) => {
    pageObject = page;
    return pageObject.property('paperSize', {
      format: 'Letter',
      orientation: 'portrait',
      margin: '0.5in'
    });
  }).then(() => {
    return pageObject.open(config.renderUrl, {
      operation: "POST",
      encoding: "utf8",
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify(req.body)
    });
  }).then(() => {
    return generateTempFile();
  }).then((tempFile) => {
    cleanupCallback = tempFile.cleanupCallback;
    filename = tempFile.path;
    return pageObject.render(filename);
  }).then(() => {
    const readStream = fs.createReadStream(filename);
    readStream.pipe(res);
  }).then(() => {
    const message = {
      to: mailerConfig.recipient,
      subject: `${req.body.name.first || "<first>"} ${req.body.name.last || "<last>"} - Release`,
      message: 'This is the model release',
      attachments: [{
        filename: 'agreement.pdf',
        path: filename
      }]
    };
    return mailer.sendMessage(message);
  }).then(() => {
    // TODO: Should extract cleanup to a function that checks for the existence of
    // the file and the cleanup callback
    if (cleanupCallback) {
      cleanupCallback();
    }
  }).catch((err) => {
    logger.error('Error in the process', err);
    res.status(500).send('There was an error processing your request:' + err);

    // Cleanup temp file if necessary
    if (cleanupCallback) cleanupCallback();
  });
});

app.post('/render', (req, res) => {
  const states = JSON.parse(States.states());
  if (req.body && req.body.address && req.body.address.state) {
    const selectedState = states.filter((s) => s.abbr === req.body.address.state);
    if (selectedState.length) {
      selectedState[0].selected = true;
    }
  }

  req.body.states = states;
  templatePromise.then((templateString) => {
    res.send(mustache.render(templateString, req.body));
  });
});

app.launchOnRandomPort = (cb) => {
  var portrange = 45032;

  function getPort (cb) {
    var port = portrange;
    portrange += 1;

    var server = net.createServer()
    server.listen(port, function (err) {
      server.once('close', function () {
        cb(port);
      })
      server.close();
    });
    server.on('error', function (err) {
      getPort(cb);
    });
  }

  getPort((port) => {
    app.launch(port, cb);
  });
};

app.launch = (port, cb) => {
  app_port = (typeof port === 'number') ? port : 3000;
  phantom.create().then((ph) => {
    Phantom = ph;
    app.myAppServer = app.listen(app_port, () => {
      logger.info(`App listening on ${app_port}`);
      (cb) ? cb(app_port) : null;
    });
  });
};

app.terminate = () => {
  app.myAppServer.close();
  Phantom.exit();
};

module.exports = app;
