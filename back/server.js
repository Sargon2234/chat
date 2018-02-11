'use strict';
// In production we'll have to use secured https module with enabled SSL certificate.
// To provide such behavior we should configure Nginx or use https node module and signed certificates.
const http = require('http'),
  express = require('express'),
  path = require('path'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  socketIO = require('socket.io'),
  port = process.env.port || 5000,
  host = process.env.host || 'localhost',
  routes = require('./Routes/main').routes,
  socketListener = require('./Controllers/socketEvents').listener,
  bots = require('./Controllers/Bots'),
  
  // If we have a lot of models we can define separate file, where we'd import/export our models, but according to current goal
  // there is no need to provide such functionality.
  UserModel = require('./Models/User'),
  
  config = require('../config');

// To fix mongoose deprecation Promise error.
mongoose.Promise = Promise;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// To serve static files for built script.
// In production env we should set up Nginx as reverse proxy for our application.
app.use(express.static(path.resolve(__dirname, '../front/dist')));

const server = http.createServer(app);
const socket = socketIO(server);

// We'll declare mongo connection here to use it in DI with other modules.
// Additional bonus, if we change database, for example to MySQL, we'll change code for connection in one place.
const mongoURI = `mongodb://${config.db.mongo.user}:${config.db.mongo.password}@${config.db.mongo.host}:${config.db.mongo.port}/${config.db.mongo.name}?authSource=admin`;

(async () => {
  const db = await mongoose.connect(mongoURI);
  // Send declared DB to model.
  UserModel(db);
  // We send express app to use it's app.method functionality and db example for operations.
  routes(app);
  
  socketListener(socket, db, bots);
})();

server.listen(port, () => {
  console.log(`Server started on http://${host}:${port}`);
});
