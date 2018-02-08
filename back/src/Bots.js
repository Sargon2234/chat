const ignoreBot = () => {
  return;
};

const reverseBot = (message) => {
  return new Promise((resolve) => {
    // Reverse bot should respond with 3s delay, so we use promises and timeout.
    setTimeout(() => {
      // We could use more advanced methods with reduce, for example. But really there is no need.
      // We have to convert message to string and then reverse.
      resolve(message.toString().split('').reverse().join());
    }, 3000);
  });
};

const echoBot = (message) => {
  return message;
};

const spamBot = () => {
//  Spam bot should ignore incoming messages and send messages in range 10-120s.
  return new Promise((resolve) => {
    while (true) {
      setTimeout(() => {
        resolve('Spam!');
      }, generateRandomTime());
    }
  });
};

const generateRandomTime = (min, max) => {
  return (Math.floor(Math.random() * max) + min) * 1000;
};

module.exports = { ignoreBot, reverseBot, echoBot, spamBot };