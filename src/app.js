const cons = require('consolidate');
const express = require('express');
const fs = require('fs');
const path = require('path');
const phantom = require('phantom');
const States = require('./States');

const app = express();
let Phantom = null;

const staticFilePath = path.normalize(__dirname + '/../public/');
console.log(`Listening for static files at ${staticFilePath}`);
app.use(express.static(staticFilePath));
app.engine('mustache', cons.mustache);
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

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
  const filename = 'agree.pdf';
  let pageObject = null;
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
  }).then((status) => {
    console.log('Fetched google');
    return pageObject.render(filename);
  }).then(() => {
    console.log('Rendered to file');
    fs.createReadStream(filename).pipe(res);
  }).catch((err) => {
    console.log('Error in the process', err);
    res.status(500).send('There was an error processing your request:' + err);
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
};

module.exports = app;
