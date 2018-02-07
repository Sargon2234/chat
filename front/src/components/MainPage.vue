<template>
    <div class="main-page">
        <div id="chat-window">
            <div id="message">
                <div id="contact-data">
                    <div id="avatar">
                        <img src="/static/img/patrick.jpg" alt="reverse bot">
                    </div>
                    <div id="description">
                        <h2 id="name">{{ currentBot.name }}</h2>
                        <p id="text">
                            {{ currentBot.description }}
                        </p>
                    </div>
                </div>
                <div id="chat">

                </div>
                <div id="write-message">
                    <input type="text" placeholder="Start chatting!" class="interact">
                    <button type="button" id="send-button">Send message</button>
                </div>
            </div>
            <div id="choose-partner">
                <div id="navigation">
                    <button type="button" class="nav-tab">Online</button>
                    <button type="button" class="nav-tab">All</button>
                </div>
                <div id="contact-list">

                </div>
                <div id="search">
                    <input type="text" id="search-form" placeholder="Search" class="interact">
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
        currentBot: {
          name: 'Reverse bot',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eleifend convallis tellus, ac venenatis odio. Mauris velit enim, accumsan et aliquam at, mattis at elit. Curabitur id metus eget lorem mollis venenatis. Aenean accumsan sapien urna, a venenatis diam fermentum a. Phasellus posuere orci sed enim pulvinar, feugiat dapibus dolor sagittis.',
        }
      };
    },
  };
</script>

<style scoped>
    #chat-window {
        margin: 10px 35px 20px 79px;
        display: grid;
        grid-template-columns: 80% 20%;
    }

    #message {
        display: grid;
        grid-template-rows: 20% 60% 20%;
    }

    #contact-data {
        display: grid;
        grid-template-columns: 18% 82%;
    }

    #avatar > img {
        width: 100%;
        height: 100%;
    }

    #description {
        margin: 5px 5px 20px 5px;
        /*color: #858585;*/
    }
</style>