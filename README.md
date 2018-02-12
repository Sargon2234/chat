# Chat application
### Description:
Chat application with both: frontend and backend.

Tech stack:

- Backend:
    - Node.js,
    - Express,
    - MongoDB with Mongoose,
    - Socket.io,
    
    
- Frontend:
    - Vue.js,
    - Vuex,
    - Vue router,
    - Axios,
    - Socket.io,
    - CSS grid,
    - Webpack
    - etc. which comes with [vue-cli](https://www.npmjs.com/package/vue-cli)
    

### Installation:

- `git clone https://github.com/Sargon2234/chat chat`,
- `cd chat`,
- Create `config.json` file in root and fill it with your credentials, just like in `config.example.json`,
- Start mongodb,
- `cd back`
- `npm i`,
- In back folder run script to populate database with bots and test users: `node Models/populate/user.js`,
- start server with `pm2 start server.js`
- go to [site](http://localhost:5000) and start chatting.



### Additional notes:

- Folders back and front were separated for possibility to develop in separate projects and handle them as git submodules.