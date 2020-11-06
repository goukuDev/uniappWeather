// https://vuex.vuejs.org/zh-cn/intro.html
// make sure to call Vue.use(Vuex) if using a module system
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    choosecity:'',//选择城市
	choosepoint:{},//地图上选择城市
	musicdetail:{},//音乐详情数据
  },
  mutations: {
    SETCHOOSECITY:(state,value)=>{
		state.choosecity = value;
	},
	SETCHOOSEPOINT:(state,value)=>{
		state.choosepoint = value;
	},
	SETMUSICDETAIL:(state,value)=>{
		state.musicdetail = value;
	}
  }
})

export default store
