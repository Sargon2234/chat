'use strict';

const fs = require('fs'),
  path = require('path'),
  MainController = require('../Controllers/Main');

const routes = (app, db) => {
  app.get('/', (req, res) => {
    // We use streams to provide faster functionality.
    // Res -> response in Express allows us to pipe data while sending it to client.
    // Which means we need less server memory.
    const readStream = fs.createReadStream(path.join(__dirname, './dist/index.html'));
    res.pipe(readStream);
  });
  
  app.get('/clients/:type', async (req, res) => {
    await MainController.getClients(req, res, db);
  });
};

module.exports = { routes };