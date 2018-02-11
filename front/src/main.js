import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueChatScroll from 'vue-chat-scroll';
import socketio from 'socket.io-client';
import VueSocketIO from 'vue-socket.io';
import moment from "moment";
import VueMomentJS from "vue-momentjs";

import store from '../store/store';
import App from './App';

const SocketInstance = socketio('http://localhost:5000');

Vue.use(VueSocketIO, SocketInstance);
Vue.use(VueMomentJS, moment);

Vue.use(VueAxios, axios);
Vue.use(VueChatScroll);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>',
});
