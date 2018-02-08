'use strict';

const mongoose = require('mongoose'),
  config = require('../../../config'),
  UserModel = require('../User');

const defaultUserData = [
  {
    name: 'Echo bot',
    avatar: '/static/img/avatars/bot1.png',
    history: [],
    isActive: true,
    type: 'bot',
    behavior: 'echo',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sapien purus, tempor vel aliquam sed, congue in nisl. Maecenas molestie nibh id massa consequat ullamcorper. Integer maximus lorem odio, viverra varius tortor facilisis ac.',
  },
  {
    name: 'Reverse bot',
    avatar: '/static/img/avatars/bot2.png',
    history: [],
    isActive: true,
    type: 'bot',
    behavior: 'reverse',
    description: 'Aliquam mattis tincidunt urna, a pretium ex placerat pulvinar. Maecenas eget bibendum enim, eu lobortis libero. Sed imperdiet neque a porta rutrum. Nam malesuada nisl eu sem lacinia ultricies.',
  },
  {
    name: 'Spam bot',
    avatar: '/static/img/avatars/bot3.png',
    history: [],
    isActive: true,
    type: 'bot',
    behavior: 'reverse',
    description: 'Aenean eu dictum diam. Nunc in sapien ac ligula vulputate dignissim. Suspendisse ornare nisi sapien.',
  },
  {
    name: 'Ignore bot',
    avatar: '/static/img/avatars/bot4.png',
    history: [],
    isActive: true,
    type: 'bot',
    behavior: 'ignore',
    description: 'Donec accumsan, magna sed finibus auctor, nisl ligula viverra sapien, a pretium enim tortor vel dui. Sed vitae justo sollicitudin, mattis nibh vel, venenatis est. Aenean ut vulputate eros. In eget libero a quam mattis pretium in a enim. Sed mi augue, convallis in varius quis, aliquam sit amet turpis.',
  },
  {
    name: 'User 1',
    avatar: '/static/img/avatars/user1.png',
    history: [],
    isActive: false,
    type: 'user',
    behavior: null,
    description: 'I\'m user 1.',
  },
  {
    name: 'User 2',
    avatar: '/static/img/avatars/user2.png',
    history: [],
    isActive: false,
    type: 'user',
    behavior: null,
    description: 'I\'m user 2.',
  },
];

const populateUsers = async (db) => {
  const userModel = db.model('User');
  
  try {
    await userModel.insertMany(defaultUserData);
    return true;
  } catch (err) {
    console.error('Not populated.', err.message);
    return false;
  }
};

mongoose.Promise = Promise;
const mongoURI = `mongodb://${config.db.mongo.user}:${config.db.mongo.password}@${config.db.mongo.host}:${config.db.mongo.port}/${config.db.mongo.name}?authSource=admin`;

(async () => {
  const db = await mongoose.connect(mongoURI);
  UserModel(db);
  
  try {
    await populateUsers(db);
    console.log('DB successfully populated.');
  } catch (e) {
    console.error('Error while populating', e.message);
  } finally {
    mongoose.connection.close();
  }
})();