import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueSocketio from 'vue-socket.io';
import socketio from 'socket.io';

import store from '../store/store';
import App from './App';

Vue.use(VueAxios, axios);
Vue.use(VueSocketio, socketio('http://localhost:5000'), store);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>',
});
