const cons = require('consolidate');
const express = require('express');
const fs = require('fs');
const path = require('path');
const phantom = require('phantom');
const States = require('./States');
const tmp = require('tmp');

const app = express();
let Phantom = null;

const staticFilePath = path.normalize(__dirname + '/../public/');
console.log(`Listening for static files at ${staticFilePath}`);
app.use(express.static(staticFilePath));
app.engine('mustache', cons.mustache);
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

function generateTempFile() {
  return new Promise((resolve, reject) => {
    tmp.file((err, path, fd, cleanupCallback) => {
      return (err) ? reject(err) : resolve({
        path: path,
        fd: fd,
        cleanupCallback: cleanupCallback
      });
    });
  });
}

app.post('/agree', (req, res) => {
  res.send('Hi there!');
});

app.get('/render', (req, res) => {
  res.render('basic', {
    name: {
      first: 'Ricky',
      last: 'Hussmann'
    },
    address: {
      line1: 'Line 1',
      line2: 'Line 2',
      city: 'Morgantown',
      zip: '26501'
    },
    states: JSON.parse(States.states())
  });
});

app.get('/testing', (req, res) => {
  console.log('Received request');
  const filename = null;
  let pageObject = null;
  let cleanupCallback = null;

  res.header('Content-disposition', 'inline; filename=agreement.pdf');
  res.header('Content-type', 'application/pdf');

  Phantom.createPage().then((page) => {
    console.log('Created page');
    pageObject = page;
    return page.property('viewportSize', {width:1280, height:1024});
  }).then((status) => {
    return pageObject.property('paperSize', {width: '8.5in', height:'11in'});
  }).then((status) => {
      return pageObject.open('https://www.google.com');
  }).then(() => {
    return generateTempFile();
  }).then((tempFile) => {
    console.log('Fetched google');
    cleanupCallback = tempFile.cleanupCallback;
    filename = tempfile.path;
    return pageObject.render(filename);
  }).then(() => {
    console.log('Rendered to file');
    const readStream = fs.createReadStream(filename);
    readStream.on('end', () => {
      console.log(`Removing ${filename}`);
      cleanupCallback();
    });
    readStream.pipe(res);
  }).catch((err) => {
    console.log('Error in the process', err);
    res.status(500).send('There was an error processing your request:' + err);

    // Cleanup temp file if necessary
    if (cleanupCallback) cleanupCallback();
  });
});


app.launch = (cb) => {
  const PORT = 3000;
  console.log('Starting a phantom process');
  phantom.create().then((ph) => {
    Phantom = ph;
    app.myAppServer = app.listen(PORT, () => {
      console.log(`App listening on ${PORT}`);
      (cb) ? cb() : null;
    });
  });
};

app.terminate = () => {
  app.myAppServer.close();
  Phantom.exit();
};

module.exports = app;
