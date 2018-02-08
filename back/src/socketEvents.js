'use strict';
const clientsPool = {};

const listener = (socket, db) => {
  const UserModel = db.models('User');
  
  socket.on('connection', async (sock) => {
    console.log('Server received new client');
    // clientsPool
    console.log(sock);
    try {
      const activeUsers = await UserModel.getActive();
      
    } catch (err) {
      console.error({ where: 'socketEvents', message: err.message });
      return socket.emit('error', 'Can\'t receive active users');
    }
    
    socket.emit('userData');
    
    sock.on('message', (msg) => {
      let receivedMessage;
      // First, we need to check if message actually json. If don't, we can't handle it.
      try {
        receivedMessage = JSON.parse(msg);
      } catch (err) {
        console.error('User sent not appropriate message', err.message);
        return socket.emit('error', 'We can\'t read your message. Please try again with another one.');
      }
      
      if (receivedMessage.type === 'message') {
        const messageData = receivedMessage.data;
        // We have to try save message. If this doesn't work, we notify user about that.
        try {
          saveMessageToHistory(messageData);
        } catch (err) {
          console.error({ where: 'socketEvents', message: err.message });
          socket.emit('error', 'Message wasn\'t saved');
        }
        
      } else if (receivedMessage.type === 'requestForUsers') {
      
      } else {
      
      }
    });
    
    sock.on('disconnect', () => {
      console.log('Client disconnected');
      //  TODO: update active;
    });
  });
};

const saveMessageToHistory = (messageData) => {

};

module.exports = { listener };