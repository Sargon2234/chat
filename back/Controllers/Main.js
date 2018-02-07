'use strict';

const getClients = async (req, res, db) => {
  // We check if request have parameter for clients type online or all. If there is no value, assume request is for all.
  const selectedType = req.params.type || 'all';
  
  const UserModel = db.model('User');
  
  let requestedUsers;
  if (selectedType === 'online') {
    try {
      const foundActiveUsers = await UserModel.getActive();
      if (foundActiveUsers.length === 0) {
        //  There is no active users.
        return res.json({ status: 'error', message: 'Can\'t find active users' });
      }
      
    } catch (err) {
      // If some error occurred we write it to stderr and send to client soft error.
      console.error({ where: 'MainController, getClient', message: err.message });
      return res.json({ status: 'error', message: 'Some error, please try again later.' });
    }
  }
};

module.exports = { getClients };