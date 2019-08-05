<template>
  <div class="index">
    <div class="indexbox">
      <div class="localtion">
        <picker class="auth-pick-tip" mode="region" :value="region" @change="regionPick">
          {{region[2]}}
        </picker>
      </div>
      <div class='data_weather' @click="totodydetail">
        <div class='now_weather' v-if="Object.values(dateweather).length">
          <div class='temperature'>{{dateweather.current_temperature}}℃</div>
          <div class='wind'>{{dateweather.wind_direction}} {{dateweather.wind_level}} 湿度:{{dateweather.humidity}}%</div>
        </div>
        <div class='condition' v-if="Object.values(dateweather).length">{{dateweather.current_condition}}</div>
        <div class="quality" v-if="Object.values(dateweather).length" :style="'background:'+dateweather.background">{{dateweather.quality_level}}    {{dateweather.aqi}}</div>
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
      <!-- 15天天气 -->
      <div class='halfmonth' v-if="forecastlist.length">
        <swiper display-multiple-items="4" duration="500">
          <block v-for="(item,index) in forecastlist" :key="index">
            <swiper-item @click="gotodetail(index)">
                <div>{{item.week}}</div>
                <div>{{item.date}}</div>
                <div>{{item.day.weather==item.night.weather? item.day.weather:item.day.weather+'转'+item.night.weather}}</div>
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
  onLoad(){
    this.getUserLocation();
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
    this.getUserLocation();
    wx.showLoading({
      title: '加载中',
    })
  },
  methods: {
    getUserLocation: function () {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
            wx.showModal({
              title: '请求授权当前位置',
              content: '需要获取您的地理位置，请确认授权',
              success: (res) => {
                if (res.cancel) {
                  wx.showToast({
                    title: '拒绝授权',
                    icon: 'none',
                    duration: 1000
                  })
                } else if (res.confirm) {
                  wx.openSetting({
                    success: (data) => {
                      console.log(data)
                      if (data.authSetting["scope.userLocation"] == true) {
                        wx.showToast({
                          title: '授权成功',
                          icon: 'success',
                          duration: 1000
                        })
                        //再次授权，调用wx.getLocation的API
                        this.getLocation();
                      } else {
                        wx.showToast({
                          title: '授权失败',
                          icon: 'none',
                          duration: 1000
                        })
                      }
                    }
                  })
                }
              }
            })
          } else if (res.authSetting['scope.userLocation'] == undefined) {
            //调用wx.getLocation的API
            this.getLocation();
          }
          else {
            //调用wx.getLocation的API
            this.getLocation();
          }
        }
      })
    },
    // 微信获得经纬度
    getLocation: function () {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          var latitude = res.latitude
          var longitude = res.longitude
          var speed = res.speed
          var accuracy = res.accuracy;
          this.getLocal(latitude, longitude)
        },
        fail: function (res) {
          console.log('fail' + JSON.stringify(res))
        },
        altitude:true
      })
    },
    // 获取当前地理位置
    getLocal: function (latitude, longitude) {
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: latitude,
          longitude: longitude
        },
        success: (res) =>{
          this.region = [res.result.address_component.province, res.result.address_component.city, res.result.address_component.district];
          this.getweather(this.region);
        },
        fail:  (res) => {
          console.log(res);
        }
      });
    },
    getweather(position){
      request('https://jisutqybmf.market.alicloudapi.com/weather/query?city='+position[2],{'Authorization':'APPCODE def0b8f2c0304cb59b0a7cdaa24dd000' })
      .then(res=>{
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
          humidity:result.humidity
        },
        this.forecastlist = result.daily;
        this.hourlist = result.hourly.map(o=>Object.assign({},{'condition': o.weather,'hour':o.time,'temperature':o.temp}))
        setTimeout(()=>{
          wx.stopPullDownRefresh();
          wx.hideLoading();
        },2000);
      })
    },
    regionPick: function (e) {
      this.region = e.mp.detail.value;
      this.getweather(e.mp.detail.value)
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
        aqi:result.index[0].detail
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
