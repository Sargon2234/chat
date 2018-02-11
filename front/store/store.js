import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    activeUser: {
      name: '',
      history: [],
      availableUsers: [],
    },
  },
});

export default store;