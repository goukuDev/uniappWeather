<template>
  <div class="counter">
    <swiper class="topswiper" :display-multiple-items="displaymultipleitems" interval="5000" duration="5000" :current='(clickindex<sevendayweather.length-displaymultipleitems)? clickindex:sevendayweather.length-displaymultipleitems'>
      <block v-for="(item,index) in sevendayweather" :key="index">
        <swiper-item @click="addclickindex(index)" :class="index==clickindex? 'clickindex':''">
            <div>{{item.week}}</div>
            <div>{{item.date}}</div>
        </swiper-item>
      </block>
    </swiper>
	<swiper class="bottomswiper" display-multiple-items="1" interval="500" duration="500" @change='test($event)' :current='clickindex'>
	  <block v-for="(item,index) in number" :key="index">
	    <swiper-item v-if='!!sevendayweather.length'>
	          <div class='advise'>{{dayindex[clickindex].detail}}</div>
	          <h1 class='type'>
	        	  白天
	        	  <image style='position: absolute;top:5px;left:60px;width:50px;height:50px;' :src="'/static/weathercn/'+sevendayweather[clickindex].day.img+'.png'"/>
	          </h1>
	          <div class="weather">
	            <div>{{sevendayweather[clickindex].day.weather}}</div>
	            <div>日出:{{sevendayweather[clickindex].sunrise}}</div>
	            <div>温度</div>
	            <div>{{sevendayweather[clickindex].day.temphigh}}℃</div>
	            <div>风力</div>
	            <div>{{sevendayweather[clickindex].day.windpower}}</div>
	          </div>
	          <h1 class='type'>
	        	  夜晚
	        	  <image style='position: absolute;top:5px;left:60px;width:50px;height:50px;' :src="'/static/weathercn/'+sevendayweather[clickindex].night.img+'.png'"/>
	          </h1>
	          <div class="weather">
	            <div>{{sevendayweather[clickindex].night.weather}}</div>
	            <div>日落:{{sevendayweather[clickindex].sunset}}</div>
	            <div>温度</div>
	            <div>{{sevendayweather[clickindex].night.templow}}℃</div>
	            <div>风力</div>
	            <div>{{sevendayweather[clickindex].night.windpower}}</div>
	          </div>
	    </swiper-item>
	  </block>
	</swiper>
  </div>
</template>

<script>
export default {
  data(){
    return{
	  number:[0,1,2,3,4,5,6],
      sevendayweather:[],
      clickindex:null,
      displaymultipleitems:'4',
	  dayindex:'',
    }
  },
  onShow() {
  	wx.showShareMenu({
  		withShareTicket:true,
  		menus:['shareAppMessage','shareTimeline']
  	})
  },
  onLoad(options) {
	this.clickindex  = options.index;
	this.sevendayweather = JSON.parse(options.data);
	this.dayindex = JSON.parse(options.lifeindex);
  },
  methods:{
	  addclickindex(index){
		  this.clickindex = '';
		  this.clickindex = index;
	  },
	  test(ev){
		  this.clickindex = ev.target.current;
	  }
  },
}
</script>

<style lang="scss" scoped>
  @import './index.scss';
</style>
