const state = {
    choosepoint:{},//地图上选择城市
} 
const mutations = {
    SETCHOOSEPOINT:(state,value)=>{
    	state.choosepoint = value;
    },
}

const actions = {

}

const getters = {

}

export default {
    state,
    mutations,
    actions,
    getters
}