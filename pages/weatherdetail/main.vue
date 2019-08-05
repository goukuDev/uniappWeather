<template>
  <div class="counter">
    <swiper :display-multiple-items="displaymultipleitems" interval="5000" duration="5000" :current='(clickindex<sevendayweather.length-displaymultipleitems)? clickindex:sevendayweather.length-displaymultipleitems'>
      <block v-for="(item,index) in sevendayweather" :key="index">
        <swiper-item @click="addclickindex(index)" :class="index==clickindex? 'clickindex':''">
            <div>{{item.week}}</div>
            <div>{{item.date}}</div>
        </swiper-item>
      </block>
    </swiper>
    <div class="weatherdetail">
      {{lifeindex.detail}}
      <div class="weather">
        <div>{{dayaqi.day.weather==dayaqi.night.weather? dayaqi.day.weather:dayaqi.day.weather+'转'+dayaqi.night.weather}}</div>
        <div>日出:{{dayaqi.sunrise}}日落:{{dayaqi.sunset}}</div>
        <div>温度</div>
        <div>{{dayaqi.day.temphigh}}/{{dayaqi.night.templow}}℃</div>
        <div>风力</div>
        <div>{{dayaqi.day.windpower==dayaqi.night.windpower? dayaqi.day.windpower:dayaqi.day.windpower+'转'+dayaqi.night.windpower}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {request} from '../../utils/index.js';
let dayindex;
export default {
  data(){
    return{
      sevendayweather:[],
      clickindex:null,
      displaymultipleitems:'4',
      dayaqi:[],
      lifeindex:''
    }
  },
  onLoad(options) {
	this.clickindex  = options.index;
	this.sevendayweather = JSON.parse(options.data);
	this.dayaqi = this.sevendayweather[this.clickindex];
	dayindex = JSON.parse(options.lifeindex);
	this.lifeindex = dayindex[this.clickindex];
  },
  methods:{
	  addclickindex(index){
		  this.clickindex = index;
	  }
  },
  watch:{
    clickindex(val,oldval){
      this.dayaqi = this.sevendayweather[val];
      this.lifeindex = dayindex[val];
    }
  }
}
</script>

<style scoped>
  @import './index.css';
</style>
