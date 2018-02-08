import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    connect: false,
    message: null
  },
  mutations: {
    SOCKET_CONNECT: (state, status) => {
      state.connect = true;
    },
    SOCKET_USER_MESSAGE: (state, message) => {
      state.message = message;
    }
  },
});

export default store;