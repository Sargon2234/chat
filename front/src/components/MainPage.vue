<template>
    <div class="main-page">
        <div id="chat-window">
            <div id="message">
                <div id="contact-data">
                    <div id="avatar">
                        <img :src="'http://localhost:5000' + currentChat.avatar" :alt="currentChat.name">
                    </div>
                    <div id="description">
                        <div>
                            <h2 id="name">{{ currentChat.name }}</h2>
                            <p id="text">
                                {{ currentChat.description }}
                            </p>
                        </div>
                    </div>
                </div>
                <div id="chat">
                    <ul v-chat-scroll="{always: false}" class="messages">
                        <li v-for="message in filterHistory" class="message">
                            <div :class="['speech-bubble', message.sender !== $store.state.activeUser.name ? 'incoming' : 'outgoing']">
                                <div class="message-header">
                                    <span>{{ message.sender }}</span> <span>{{ message.time }}</span>
                                </div>
                                <div class="message-body">
                                    <p>{{ message.message }}</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div id="write-message">
                    <p v-show="isTyping">
                        <span>{{ currentChat.name }} is typing...</span>
                    </p>
                    <div>
                        <input type="text" placeholder="Start chatting!" v-model="currentChat.userMessage"
                               class="interact" @keyup.13="sendMessage">
                        <button type="button" id="send-button" @click="sendMessage">Send message</button>
                    </div>
                </div>
            </div>
            <div id="choose-partner">
                <div id="navigation">
                    <button type="button" :class="{active: activeTab === 'online'}" @click="setActiveTab('online')">
                        Online
                    </button>
                    <button type="button" :class="{active: activeTab === 'all'}" @click="setActiveTab('all')">All
                    </button>
                </div>
                <div id="contact-list">
                    <ul>
                        <li v-for="user in filteredUsers" @click="setActiveUser(user.name)">
                            <div :class="['user-card', {'active-chat': currentChat.name === user.name}]">
                                <div class="image-holder">
                                    <img :src="user.avatar" :alt="user.name">
                                </div>
                                <div class="card-info">
                                    <h4>{{ user.name }}</h4>
                                    <p v-if="user.lastMessage">{{ user.lastMessage | shortText }}</p>
                                </div>
                                <div :class="['status-circle', user.isActive ? 'online' : 'offline']"></div>
                                <div class="unread-message" v-show="user.unreadMessagesNum > 0">
                                    {{ user.unreadMessagesNum }}
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div id="search">
                    <input type="text" id="search-form" placeholder="Search..." class="interact"
                           v-model="searchUserName">
                </div>
            </div>
        </div>
        <div class="popup" v-show="isError">
            <div class="popup-data">
                <span class="fa fa-times" aria-hidden="true" @click="closePopup('error')">x</span>

                <div class="popup-header">
                    <h3 class="is-center">Error</h3>
                    <p>{{ popups.error.message }}</p>
                </div>
                <div class="popup-footer">
                    <button class="close-button" type="button"
                            @click="closePopup('error')">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'main-page',
    data() {
      return {
        currentChat: {
          typing: false,
          name: 'Reverse bot',
          avatar: '/static/img/avatars/bot1.png',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          userMessage: '',
        },
        popups: {
          error: {
            active: false,
            message: 'Something went wrong. Please try again later.',
          },
        },
        activeTab: 'online',
        searchUserName: '',
      };
    },
    methods: {
      setActiveTab(name) {
        this.activeTab = name;
      },
      setActiveUser(userName) {
        this.scrollToEnd();
        const selectedUser = this.$store.state.activeUser.availableUsers.filter(user => user.name === userName);

        if (selectedUser) {
          this.currentChat.name = userName;
          this.currentChat.description = selectedUser[0].description;
          this.currentChat.avatar = selectedUser[0].avatar;
          this.userMessage = '';
          this.currentChat.typing = false;

          this.$store.state.activeUser.availableUsers.forEach(user => {
            if (user.unreadMessagesNum) {
              user.unreadMessagesNum = 0;
              return;
            }
          });
        }
      },
      sendMessage() {
        // Check if message is empty
        if (!this.currentChat.userMessage.length) {
          return;
        }
        //  Check if message contains only spaces.
        if (!this.currentChat.userMessage.replace(/\s/g, '').length) {
          return;
        }

        // Send to server
        this.$socket.emit('message', JSON.stringify({
          sender: this.$store.state.activeUser.name,
          recipient: this.currentChat.name,
          message: this.currentChat.userMessage,
          time: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        }));

        // Add to current messages list.
        this.$store.state.activeUser.history.push({
          sender: this.$store.state.activeUser.name,
          recipient: this.currentChat.name,
          message: this.currentChat.userMessage,
          time: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        });

        this.currentChat.userMessage = '';
      },
      closePopup(which) {
        this.popups[which].active = false;
      },
      scrollToEnd: function () {
        setTimeout(() => {
          const container = document.querySelector('#chat');
          container.scrollTop = container.scrollHeight;
        }, 0);
      },
    },
    computed: {
      isTyping() {
        return this.currentChat.typing;
      },
      filteredUsers() {
        return this.$store.state.activeUser.availableUsers.filter(user => {
          if (this.activeTab === 'online') {
            return user.isActive && user.name.toLowerCase().includes(this.searchUserName.toLowerCase());
          }
          return user.name.toLowerCase().includes(this.searchUserName.toLowerCase());
        });
      },
      filterHistory() {
        return this.$store.state.activeUser.history.filter(event => {
          return event.sender === this.currentChat.name || event.recipient === this.currentChat.name;
        });
      },
      isError() {
        return this.popups.error.active;
      }
    },
    created() {
      this.$socket.emit('initial');

      this.$socket.on('initial_response', (msg) => {
        const receivedData = JSON.parse(msg);

        if (receivedData.availableUser) {
          if (!this.$store.state.activeUser.name) {
            this.$store.state.activeUser.name = receivedData.availableUser.name;
            this.$store.state.activeUser.history = receivedData.availableUser.history;
            this.scrollToEnd();
          }
          this.$store.state.activeUser.availableUsers = receivedData.allUsers;
        }
      });

      this.$socket.on('usersChange', (msg) => {
        this.$store.state.activeUser.availableUsers = JSON.parse(msg).allUsers;
      });

      this.$socket.on('message_response', (msg) => {
        this.currentChat.typing = false;
        this.scrollToEnd();

        const receivedData = JSON.parse(msg);

        // If message received in another chat, we need to notify user about it.
        if (receivedData.sender !== this.currentChat.name) {
          this.$store.state.activeUser.availableUsers.forEach(user => {
            if (user.name === receivedData.sender) {
              user.lastMessage = receivedData.message;
              user.unreadMessagesNum ? user.unreadMessagesNum += 1 : user.unreadMessagesNum = 1;
            }
          });
        }

        // Save incoming message to history for this user.
        this.$store.state.activeUser.history.push({
          sender: receivedData.sender,
          recipient: receivedData.recipient,
          message: receivedData.message,
          time: receivedData.time,
        });
      });

      this.$socket.on('typing', () => {
        this.currentChat.typing = true;
      });

      this.$socket.on('error', (msg) => {
        this.currentChat.typing = false;
        this.popups.error.active = true;
        this.popups.error.message = JSON.stringify(msg).message;
      });
    },
    filters: {
      shortText: function (text) {
        if (text.length > 65) {
          return text.slice(0, 65) + '...';
        }
        return text;
      }
    }
  };
</script>

<style scoped>
    #chat-window {
        margin: 20px 35px 20px 79px;
        display: grid;
        grid-template-columns: 75% 25%;
    }

    #message {
        display: grid;
        grid-template-rows: 170px 550px;
        position: relative;
        background-color: #add8e6;
    }

    #contact-data {
        display: grid;
        grid-template-columns: 150px 100%;
        background-color: lightsteelblue;
    }

    #avatar > img {
        width: 100%;
        height: 100%;
    }

    #chat {
        background-color: #add8e6;
        max-height: 400px;
        overflow-y: scroll;
        padding-bottom: 20px;
        margin-top: 20px;
    }

    #chat > ul {
        padding-left: 0;
    }

    .speech-bubble {
        position: relative;
        background: #ffffff;
        border-radius: 15px;
        height: 100px;
        max-width: 800px;
        display: grid;
        grid-template-rows: 40px 60px;;
    }

    .speech-bubble.incoming {
        float: left;
        margin: 5px 30px 5px 35px;
    }

    .speech-bubble.outgoing {
        float: right;
        margin: 5px 45px 5px 0;
    }

    .outgoing:after {
        content: '';
        position: absolute;
        right: 0;
        top: 70%;
        width: 0;
        height: 0;
        border: 20px solid transparent;
        border-left-color: #ffffff;
        border-right: 0;
        margin-top: -20px;
        margin-right: -20px;
    }

    .incoming:after {
        content: '';
        position: absolute;
        left: 0;
        top: 70%;
        width: 0;
        height: 0;
        border: 20px solid transparent;
        border-right-color: #ffffff;
        border-left: 0;
        margin-top: -20px;
        margin-left: -20px;
    }

    .outgoing > .message-header {
        background-color: #ffd589;
    }

    .incoming > .message-header {
        background-color: lightsteelblue;
    }

    #chat > ul > li {
        list-style: none;
        margin-top: 10px;
    }

    .message-header {
        display: grid;
        grid-template-columns: 680px 120px;
        padding: 10px 10px 0 5px;
        width: 785px;
        border-top-right-radius: 15px;
        border-top-left-radius: 15px;
    }

    .message-header > span:first-child {
        padding-left: 10px;
        font-weight: bold;
        font-size: 17px;
    }

    .message-header > span:last-child {
        font-size: 10px;
        float: right;
    }

    .message-body > p {
        margin: 15px 20px 0 10px;
    }

    #description > div {
        margin-left: 30px;
        margin-right: 20px;
        font-size: 14px;
    }

    #write-message {
        position: absolute;
        bottom: 25px;
        width: 100%;
        height: 90px;
    }

    #write-message > p {
        text-align: center;
        font-size: 13px;
    }

    #write-message > p > span {
        position: relative;
    }

    #write-message > div {
        position: absolute;
        display: grid;
        grid-template-columns: 33% 33% 33%;
        top: 40px;
        width: 100%;
    }

    #write-message > div > input {
        display: inline-block;
        width: 590px;
        border-radius: 10px;
        padding: 13px 20px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        font-size: 14px;
        grid-column-start: 1;
        grid-column-end: 3;
        margin-left: 20px;
    }

    #write-message > div > button, .close-button {
        display: inline-block;
        float: right;
        border-radius: 10px;
        width: 200px;
        background-color: cornflowerblue;
        color: #ffffff;
        font-size: 15px;
        line-height: 40px;
        vertical-align: middle;
    }

    #write-message > div > button:hover, .close-button:hover {
        cursor: pointer;
        background-color: blue;
    }

    button:focus, #search-form:focus, #write-message > div > input:focus, #write-message > div > button:focus, .close-button:focus {
        outline: none;
    }

    .active-chat {
        background-color: powderblue;
    }

    #choose-partner {
        display: grid;
        grid-template-rows: 40px 680px;
        position: relative;
    }

    #navigation {
        display: grid;
        grid-template-columns: 50% 50%;
    }

    #navigation > button {
        background-color: #add8e6;
        color: darkslategrey;
        cursor: pointer;
    }

    #navigation > button:first-child {
        border-left: none;
    }

    #navigation > button.active {
        border-bottom: none;
        background-color: #ffffff;
    }

    #contact-list {
        background-color: #ffffff;
    }

    #contact-list > ul {
        margin: 0;
        padding: 0;
    }

    #contact-list > ul > li {
        list-style: none;
        height: 70px;
        cursor: pointer;
        margin: 10px;
    }

    #contact-list > ul > li:hover {
        background-color: powderblue;
    }

    .user-card {
        display: grid;
        height: 70px;
        margin: 5px 0 0 10px;
        grid-template-columns: 70px 100%;
        position: relative;
    }

    .image-holder > img {
        width: 100%;
        height: 100%;
        vertical-align: middle;
        line-height: 70px;
    }

    .card-info {
        margin-left: 5px;
    }

    .card-info > p {
        font-size: 12px;
        margin-top: 0;
        margin-bottom: 5px;
    }

    .card-info > h4 {
        margin: 5px 0 0 0;
    }

    .status-circle {
        border-radius: 50%;
        width: 15px;
        height: 15px;
        position: absolute;
        bottom: 2px;
        left: 45px;
    }

    .unread-message {
        border-radius: 50%;
        width: 25px;
        height: 25px;
        position: absolute;
        top: 2px;
        right: 10px;
        background-color: firebrick;
        color: #ffffff;
        text-align: center;
    }

    .online {
        background-color: greenyellow;
    }

    .offline {
        background-color: rgb(169, 169, 169);
    }

    #search-form {
        width: 250px;
        border-radius: 10px;
        padding: 12px 0 12px 10px;
        border: 1px solid rgb(169, 168, 169);
        font-size: 14px;
    }

    #search {
        position: absolute;
        bottom: 25px;
        width: 100%;
        text-align: center;
    }

    .popup {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        background-color: rgba(0, 0, 0, 0.7);
    }

    .popup-data {
        width: 600px;
        height: 400px;
        background-color: #ffffff;
        position: relative;
        margin: 10% auto;
        text-align: center;
    }

    .popup-data > span {
        position: absolute;
        right: 15px;
        top: 7px;
        cursor: pointer;
    }

    .popup-header {
        display: inline-block;
        width: 100%;
        margin-top: 40px;
    }

    .popup-header > h3 {
        font-size: 25px;
    }

    .popup-header > p {
        margin-left: 15px;
        margin-right: 15px;
    }

    .popup-footer {
        position: absolute;
        width: 100%;
        bottom: 20px;
    }

    .close-button {
        float: none;
    }

    @media screen and (min-width: 1740px) {
        #write-message > div > input {
            margin-left: 25%;
        }
    }
</style>