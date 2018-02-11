const moment = require('moment');

const Handler = {
  ignore: (message) => {
    // Incoming message already saved, so we can just ignore.
    return;
  },
  reverse: (message, socket, UserModel) => {
    // Incoming message already saved.
    // Notify user that bot is typing.
    socket.emit('typing');
    
    // Reverse bot should respond with 3s delay, so we use timeout.
    setTimeout(() => {
      const dataToSend = {
        sender: 'Reverse bot',
        recipient: socket.user_name,
        // To reverse message we could use more advanced methods with reduce, for example. But really there is no need.
        // We have to convert message to string and then reverse.
        message: message.toString().split('').reverse().join(''),
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
      
      // Save prepared to send message into DB.
      UserModel.findOneAndUpdate({ _id: socket.user_id }, { $push: { history: dataToSend } }).then(() => {
        //  If successfully saved, we can notify user.
        socket.emit('message_response', JSON.stringify(dataToSend));
      }).catch((err) => {
        //  If error, notify about error.
        console.error({ where: 'Bots.reverseBot', message: err.message });
        socket.emit('error', JSON.stringify({ message: 'Bot can not answer.' }));
      });
    }, 3000);
  },
  echo: async (message, socket, UserModel) => {
    // Incoming message saved so we have to save response, which is the same.
    const dataToSend = {
      sender: 'Echo bot',
      recipient: socket.user_name,
      message,
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    
    try {
      await UserModel.findOneAndUpdate({ _id: socket.user_id }, { $push: { history: dataToSend } });
      socket.emit('message_response', JSON.stringify(dataToSend));
    } catch (err) {
      console.error({ where: 'Bots.echoBot', message: err.message });
      socket.emit('error', JSON.stringify({ message: 'Bot can not answer.' }));
    }
  },
  spam: (message) => {
    // Message already saved, so we can ignore any incoming data.
    return;
  }
};

const spamNotifier = (socket, UserModel) => {
  // We have to send messages only when user is connected.
  // We'll use named timeout for further restarts and clear.
  let timer = setTimeout(function tick() {
    const messageText = generateSpamMessage();
    
    const message = {
      sender: 'Spam bot',
      recipient: socket.user_name,
      message: messageText,
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    
    // If there is no listener, remove timeout to prevent memory leak.
    if (!socket.connected) {
      clearTimeout(timer);
      return;
    }
    
    // Save message to history.
    UserModel.findOneAndUpdate({ _id: socket.user_id }, { $push: { history: message } })
      .then(() => {
        // Notify user only if message was saved.
        socket.emit('message_response', JSON.stringify(message));
        // And restart timeout with random wait.
        timer = setTimeout(tick, generateRandomTime(10, 120));
      })
      .catch((err) => {
        // Error in message store process. We have nothing to send. Just log error
        console.error({ where: 'Bots.spamNotifier -> saveMessage', message: err.message });
        // And start new timeout
        timer = setTimeout(tick, generateRandomTime(10, 120));
      });
    
  }, generateRandomTime(10, 120));
};

const handleMessage = async (socketData, messageData, clientsPool, UserModel) => {
  // This is our message entry.
  
  const dataToSave = {
    sender: socketData.user_name,
    recipient: messageData.recipient,
    message: messageData.message,
    time: messageData.time,
  };
  
  try {
    // Save received message to current user history.
    await UserModel.findOneAndUpdate({ _id: socketData.user_id }, { $push: { history: dataToSave } });
  } catch (err) {
    console.error({ where: 'Bots.handleMessage -> saveIncomingMessage.', message: err.message });
    // If error occurred we have nothing to provide for user.
    return;
  }
  
  let recipientData;
  // Now we have to choose one option: to notify user or put bot handler.
  try {
    recipientData = await UserModel.findOne({ name: messageData.recipient }, 'name type behavior isActive');
  } catch (err) {
    // There is no recipient. Means, no user.
    console.error({ where: 'Bots.handleMessage -> findRecipientData', message: err.message });
    socketData.emit('error', JSON.stringify({ message: 'There is no user with provided credentials.' }));
    return;
  }
  
  // If this is user, we have to save this message to his/her history and notify.
  if (recipientData.type === 'user') {
    // Saving to recipient history.
    await UserModel.findOneAndUpdate({ name: recipientData.name }, { $push: { history: dataToSave } });
    
    // Check if user active.
    // If user is not active we can skip notification.
    if (recipientData.isActive) {
      // Check clients pool to find socket associated with this user.
      for (let client of clientsPool) {
        if (client.user_name === recipientData.name) {
          // Emit event and exit from loop, because there is unique user name.
          client.emit('message_response', JSON.stringify(dataToSave));
          break;
        }
      }
      return;
    }
    return;
  }
  
  // If recipient is bot, we have to handle message.
  try {
    await Handler[recipientData.behavior](messageData.message, socketData, UserModel);
  } catch (err) {
    console.error({ where: 'Bots.responseToMessage', message: err.message });
    //  This error occurred if there is no bot to handle message.
    socketData.emit('error', JSON.stringify({message: 'There is no bot to answer you.'}));
  }
};

const generateSpamMessage = () => {
  // Simple function to generate random text for spam bot.
  const words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit.', 'Vestibulum', 'dapibus', 'vestibulum', 'blandit.', 'Nulla', 'ut', 'hendrerit', 'ante.', 'Aliquam', 'mauris', 'velit,', 'venenatis', 'ut', 'tincidunt', 'vehicula,', 'vulputate', 'varius', 'sem.', 'Pellentesque', 'venenatis', 'commodo', 'lorem', 'ut', 'posuere.', 'Morbi', 'mauris', 'urna,', 'placerat', 'id', 'nibh', 'pharetra,', 'vulputate', 'elementum', 'dolor.', 'Quisque', 'at', 'tristique', 'orci.', 'In', 'hac', 'habitasse', 'platea', 'dictumst.', 'Integer', 'pulvinar', 'porta', 'tincidunt.'];
  
  return words[Math.floor(Math.random() * words.length)] + ' ' + words[Math.floor(Math.random() * words.length)] + ' ' + words[Math.floor(Math.random() * words.length)];
};

const generateRandomTime = (min, max) => {
  return (Math.floor(Math.random() * max) + min) * 1000;
};


module.exports = { handleMessage, spamNotifier };