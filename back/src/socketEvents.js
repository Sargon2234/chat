'use strict';
let clientsPool = [];

const listener = (socket, db, bots) => {
  const UserModel = db.model('User');
  
  socket.on('connection', async (sock) => {
    // Set spam notifier for this user.
    bots.spamNotifier(sock, UserModel);
    
    // On first request to server we have to load all users and get user for client.
    sock.on('initial', async () => {
      try {
        // To make less requests to DB, we request all users.
        // They will be filtered on front side.
        let allUsers = await UserModel.find({}, 'name description avatar type isActive history');
        let availableUser = null;
        
        try {
          // Then we try to find available (is not active) user with type user.
          availableUser = allUsers.filter(user => user.type === 'user' && !user.isActive)[0];
          
          if (availableUser) {
            // If we succeed, we have to update DB to prevent this user second use.
            await UserModel.findOneAndUpdate({ name: availableUser.name }, { isActive: true });
            // And now we can filter all users list to remove selected name.
            allUsers = allUsers.filter(user => user.name !== availableUser.name);
          }
          
          try {
            // Notify all clients that we have new user.
            await usersListUpdate(UserModel);
          } catch (err) {
            console.error({ where: 'socketEvents.clientsNotify', message: err.message });
          }
          
          // We have to save user id and name in it's socket.
          sock.user_id = availableUser._id;
          sock.user_name = availableUser.name;
          
          // We add socket to clients pool for further notification.
          clientsPool.push(sock);
        } catch (err) {
          // If there is no available users, no problem, we just log this event and keep going, but without name and avatar for this user.
          // It means that nobody will see him/her in chat list.
          console.error({ where: 'socketEvents.findAvailableUser', message: err.message });
        }
        
        // Send response to client with found data.
        sock.emit('initial_response', JSON.stringify({ allUsers, availableUser }));
        
      } catch (err) {
        console.error({ where: 'socketEvents.DB', message: err.message });
        sock.emit('error', JSON.stringify({ message: 'Can not receive active users' }));
      }
    });
    
    sock.on('message', async (msg) => {
      let receivedMessage;
      // First, we need to check if message actually json. If don't, we can't handle it.
      try {
        receivedMessage = JSON.parse(msg);
      } catch (err) {
        console.error({ where: 'socketEvents.message', message: err.message });
        return sock.emit('error', JSON.stringify({ message: 'We can\'t read your message. Please try again with another one.' }));
      }
      
      // Then we try to handle message with bots or users.
      try {
        await bots.handleMessage(sock, receivedMessage, clientsPool, UserModel);
      } catch (err) {
        console.error({ where: 'socketEvents.messageHandler', message: err.message });
        sock.emit('error', JSON.stringify({ message: 'Some error during your message processing' }));
      }
    });
    
    sock.on('disconnect', async () => {
      try {
        await UserModel.findOneAndUpdate({ _id: sock.user_id }, { isActive: false });
        // Remove this client from pool.
        clientsPool = clientsPool.filter(client => client.user_id !== sock.user_id);
        // Notify pool.
        await usersListUpdate(UserModel);
      } catch (err) {
        // Even here we can get errors. DB could be disconnected.
        // Mongoose, by default, use query pattern to assure that all messages will be saved, but we have to log this error.
        console.error({ where: 'socketEvents.disconnect', message: err.message });
      }
    });
  });
};

const usersListUpdate = async (UserModel) => {
  // Function to scan clientsPool and notify them with fresh user data.
  if (clientsPool.length) {
    for (let client of clientsPool) {
      const allUsers = await UserModel.find({ name: { $ne: client.user_name } }, 'name description avatar type isActive history');
      client.emit('usersChange', JSON.stringify({ allUsers }));
    }
  }
};

module.exports = { listener };