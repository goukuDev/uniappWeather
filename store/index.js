import Vue from 'vue';
import Vuex from 'vuex';
import music from './modules/music.js';
import map from './modules/map.js';
import index from './modules/index.js';
Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
	  index,
	  music,
	  map
  }
})

export default store
