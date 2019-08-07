<template>
  <div class="index">
    <div class="indexbox">
      <div class="localtion">
        <picker class="auth-pick-tip" mode="region" :value="region" @change="regionPick">
          {{region | showcity(region)}}
        </picker>
      </div>
      <div class='data_weather'  v-if="!!Object.values(dateweather).length" @click="totodydetail">
        <div class='now_weather'>
          <div class='temperature'>{{dateweather.current_temperature}}℃</div>
          <div class='wind'>{{dateweather.wind_direction}} {{dateweather.wind_level}} 湿度:{{dateweather.humidity}}%</div>
        </div>
        <div class='condition'>{{dateweather.current_condition}}</div>
        <div class="quality" :style="'background:'+dateweather.background">{{dateweather.quality_level}}    {{dateweather.aqi}}</div>
		<image style='width:80px;height:70px;' :src="'/static/weathercn/'+dateweather.img+'.png'"/>
      </div>
      <!-- 今明两天天气 -->
      <div class='tomorrow_weather' v-if="twodateweather.length">
        <swiper display-multiple-items="1" duration="500" :circular='true'>
          <block v-for="(item,index) in twodateweather" :key="index">
            <swiper-item>
                <div>{{item.week}}</div>
                <div>{{item.day.weather==item.night.weather? item.day.weather:item.day.weather+'转'+item.night.weather}}</div>
                <div>{{item.night.templow}}/{{item.day.temphigh}}℃</div>
                <div>{{item.day.winddirect=='持续无风向'? '微风':item.day.winddirect}}</div>
            </swiper-item>
          </block>
        </swiper>
      </div>
      <!-- 一周天气 -->
      <div class='halfmonth' v-if="forecastlist.length">
        <swiper display-multiple-items="3" duration="500">
          <block v-for="(item,index) in forecastlist" :key="index">
            <swiper-item @click="gotodetail(index)">
                <div>{{item.week}}</div>
                <div>{{item.date}}</div>
                <div style='font-size:13px;'>{{item.day.weather==item.night.weather? item.day.weather:item.day.weather+'转'+item.night.weather}}</div>
                <div>{{item.night.templow}}</div>
                <div>{{item.day.temphigh}}</div>
                <div>{{item.day.winddirect=='持续无风向'? '微风':item.day.winddirect}}</div>
                <div>{{item.day.windpower==item.night.windpower? item.day.windpower:item.day.windpower+'转'+item.night.windpower}}</div>
            </swiper-item>
          </block>
        </swiper>
      </div>
      <!-- 24小时天气 -->
      <div class="hour" v-if="hourlist.length">
        <swiper display-multiple-items="6" interval="500" duration="500">
          <block v-for="(item,index) in hourlist" :key="index">
            <swiper-item>
              <div>{{item.condition}}</div>
              <div>{{item.temperature}}</div>
              <div>{{item.hour}}</div>
            </swiper-item>
          </block>
        </swiper>
      </div>
    </div>
  </div>
</template>

<script>
import {request} from 'utils';
import qqMap from '../../static/js/qqmap-wx-jssdk.js';
const qqmapsdk = new qqMap({
        key: 'N6JBZ-PVUCV-KJVPE-UYY2R-LZDHZ-DBFKL' //自己的key秘钥 http://lbs.qq.com/console/mykey.html 在这个网址申请
      });
import vuex from '../../static/js/store.js';
let dayaqi;
let lifeindex;
let result;
export default {
  data () {
    return {
      region: ['北京市','北京市','东城区'],
      twodateweather:[],
      // 今天天气信息
      dateweather:{},
      // 15天天气
      forecastlist:[],
      // 24小时天气
      hourlist:[]
    }
  },
  filters:{
	  showcity(data){
		  if(data[0]==data[1])
			return data[0]+'    '+data[2];
		  else
			return data[0]+'    '+data[1]+'    '+data[2];
	  }
  },
  onLoad(){
    this.GetLocation();
	wx.showLoading({
	  title: '加载中',
	})
  },
  //转发分享
  onShareAppMessage: function(ops) {
    if (ops.from === "button") {
      // 来自页面内转发按钮
      console.log(ops.target);
    }
    return {
      title: "天气",//这里是定义转发的标题
      path: `pages/index/main`,//这里是定义转发的地址
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
        var shareTickets = res.shareTickets;
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  },
  onPullDownRefresh () {
    // this.getUserLocation();
	this.GetLocation();
  },
  methods: {
	GetLocation(){
		wx.getSetting({
			success:res=>{			
				if (!JSON.stringify(res.authSetting).includes('scope.userLocation')) {  //3.1 每次进入程序判断当前是否获得授权，如果没有就去获得授权，如果获得授权，就直接获取当前地理位置
					this.getAuthorizeInfo()
				}else{
					this.getLocationInfo()
				}
			}
		});
	},
	getAuthorizeInfo(){  //1. uniapp弹窗弹出获取授权（地理，个人微信信息等授权信息）弹窗
		wx.authorize({
			scope: "scope.userLocation",
			success:res=>{ //1.1 允许授权
				this.getLocationInfo();
			},
			fail(){    //1.2 拒绝授权
				console.log("你拒绝了授权，无法获得周边信息")
			}
		})
	},
	getLocationInfo(){  //2. 获取地理位置
		wx.getLocation({
			type: 'wgs84',
			success:data=> {
				qqmapsdk.reverseGeocoder({
				  location: {
				    latitude: data.latitude,
				    longitude: data.longitude
				  },
				  success: (res) =>{
				    this.region = [res.result.address_component.province, res.result.address_component.city, res.result.address_component.district];
				    this.getweather(this.region[2]);
				  },
				  fail:  (err) => {
				    console.log(err);
				  }
				});
			}
		});
	},
    getweather(position){
      request('https://jisutqybmf.market.alicloudapi.com/weather/query?city='+position,{'Authorization':'APPCODE def0b8f2c0304cb59b0a7cdaa24dd000' })
      .then(res=>{
		// if(res=='请求出错'){
		// 	this.getweather(this.region[1])
		// }else{
			wx.hideLoading();
			result =  res.data.result;
			dayaqi = result.aqi;
			lifeindex = result.index;
			this.twodateweather= result.daily.slice(0,2)
			this.dateweather={
			  current_temperature: result.temp,
			  current_condition: result.weather,
			  wind_direction: result.winddirect,
			  wind_level: result.windpower,
			  quality_level: result.aqi.quality,
			  aqi: result.aqi.aqi,
			  background:result.aqi.aqiinfo.color,
			  humidity:result.humidity,
			  img:result.img
			},
			console.log(result)
			this.forecastlist = result.daily;
			this.hourlist = result.hourly.map(o=>Object.assign({},{'condition': o.weather,'hour':o.time,'temperature':o.temp}))
			wx.stopPullDownRefresh();
		// }
      })
    },
    regionPick: function (e) {
      this.region = e.mp.detail.value;
      this.getweather(e.mp.detail.value[1])
    },
    //去到详情页
    gotodetail(index){
      wx.navigateTo({
        url:'../../pages/weatherdetail/main?data='+JSON.stringify(this.forecastlist)+'&lifeindex='+JSON.stringify(lifeindex)+'&index='+index
      })
    },
    totodydetail(){
      let data = {
        weather:result.weather,
        winddirect:result.winddirect,
        windpower:result.windpower,
        temp:result.temp,
        pressure:result.pressure,
        humidity:result.humidity,
        quality:result.aqi.quality,
        ipm2_5:result.aqi.ipm2_5,
        aqi:result.index[0].detail,
		img:result.img
      }
      wx.navigateTo({
        url:'../../pages/todydetail/main?data='+JSON.stringify(data)
      })
    }
  }
}
</script>
<style scoped>
  @import 'index.css';
</style>
