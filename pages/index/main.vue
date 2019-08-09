<template>
	<div class="index">
		<div class="indexbox">
			<div class="localtion">
				<div v-if='!!region' @click='opendrawer()' style='height:100%;display: flex;justify-content: center;align-items: center;'><icon type="search" size="18" color='#666' style="height:20px;"></icon>{{region}}</div>
				<uni-drawer :visible='showdrawer' @close='showdrawer=false' class='indexdrawer'>
						<div style='height:40px;'>
							<div style='height: 40px;width: calc(100% - 40px);float: left;text-align: left;color:#fff;font-size:15px;text-indent:10px;'>搜索城市</div>
							<icon type="search" size="20" color='#fff' style="float: right;width: 40px;height:30px;padding-top: 10px;" @click="tocitys"></icon>
						</div>
						<scroll-view style='height:calc(100% - 40px)' scroll-y> 
								<view class='cont' v-if="!!cityhistory">
									<view style="font-size:20px;height:45px;border-bottom:1px solid #999;background:#fff;display:flex;" @click="closedrawer(item.data.city,item._id)" v-for="(item,index) in cityhistory" :key='index'>
										<div style='flex:70%;text-align:left;text-indent:10px;font-size:15px;'>{{item.data.city.split(',')[item.data.city.split(',').length-1]}}</div>
										<div style='flex:30%;text-align:left;font-size:15px;'>
											{{item.data.temp}}℃
											<image :src="'/static/weathercn/'+item.data.img+'.png'" mode="" style="width: 45px;height: 45px; float: right;"></image>
										</div>
									</view>
								</view>
						</scroll-view>
				</uni-drawer>
			</div>
			<div class='showrequest' v-if='weathermsg'>
				<div class='data_weather'  v-if="!!Object.values(dateweather).length" @click="totodydetail">
					<div class='now_weather'>
						<div class='temperature'>{{dateweather.current_temperature}}℃</div>
						<div class='wind'>{{dateweather.wind_direction}} {{dateweather.wind_level}} 湿度:{{dateweather.humidity}}%</div>
					</div>
					<div class='condition'>{{dateweather.current_condition}}</div>
					<div class="quality" :style="'background:'+dateweather.background">{{dateweather.quality_level}}    {{dateweather.aqi}}</div>
					<image style='width:70px;height:70px;' :src="'/static/weathercn/'+dateweather.img+'.png'"/>
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
			<div class="noweathermsg" style='height: calc(100% - 40px);text-align: center;line-height: 100px;font-size: 18px;' v-else>
				当前城市天气查询失败
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
import uniDrawer from "@dcloudio/uni-ui/lib/uni-drawer/uni-drawer.vue";
import {uniSwipeAction} from "@dcloudio/uni-ui/lib/uni-swipe-action/uni-swipe-action.vue";
let dayaqi;
let lifeindex;
let result;
//初始化数据库
let listdata;
wx.cloud.init();
const db = wx.cloud.database({});
const citylist = db.collection('citylist');
export default {
  data () {
    return {
      region:null,
      twodateweather:[],
      // 今天天气信息
      dateweather:{},
      // 15天天气
      forecastlist:[],
      // 24小时天气
      hourlist:[],
	  showdrawer:false,
	  options: [{
	      text: '取消',
	      style: {
	          backgroundColor: '#007aff'
	      }
	  }, {
	      text: '删除',
	      style: {
	          backgroundColor: '#dd524d'
	      }
	  }],
	  cityhistory:null,
	  weathermsg:true
    }
  },
  components:{
	  uniDrawer,uniSwipeAction
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
	this.GetLocation();
  },
  onShow() {
  	if(!!vuex.state.choosecity){
		this.region = vuex.state.choosecity.province;
		this.getweather(vuex.state.choosecity.province)
	}
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
					   if(res.result.address_component.province==res.result.address_component.city)
					  		this.region = res.result.address_component.province+','+res.result.address_component.district;
					   else
					  		this.region = res.result.address_component.province+','+res.result.address_component.city+','+res.result.address_component.district;
				    this.getweather(this.region);
				  },
				  fail:  (err) => {
				    console.log(err);
				  }
				});
			}
		});
	},
    getweather(position,id){
		request('https://jisutqybmf.market.alicloudapi.com/weather/query?city='+position.split(',')[position.split(',').length-1],{'Authorization':'APPCODE def0b8f2c0304cb59b0a7cdaa24dd000' })
		.then(res=>{
			if(res.statusCode!=200){
				this.weathermsg = false;
				return
			}
			this.weathermsg = true;
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
			this.forecastlist = result.daily;
			this.hourlist = result.hourly.map(o=>Object.assign({},{'condition': o.weather,'hour':o.time,'temperature':o.temp}))
			wx.stopPullDownRefresh();
			//储存城市天气历史记录
			listdata = {city:position,temp:result.temp,img:result.img};
			citylist.get({
			    success:res=>{
					// 没有历史结果就保存,有历史结果就更新
			        if(!res.data.map(o=>o.data).some(o=>o.city==listdata.city)){
			            citylist.add({
			                data:{
			                    data:listdata
			                },
			                success: function(res) {
			                    console.log(res._id)
			                }
			            })
			        }
					if(!!id && !(!res.data.map(o=>o.data).some(o=>o.city==listdata.city))){
						citylist.doc(id).update({
							data:{
							    data:listdata
							},
							success:res=>{
								console.log(res_id)
							}
						})
					}
			    }
			})
		})
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
    },
	tocitys(){
		wx.navigateTo({
			url:'../../pages/selectcitys/main'
		})
		setTimeout(()=>{
			this.showdrawer = false;
		},1000)
	},
	closedrawer(data,id){
		this.getweather(data,id);
		this.region = data;
		this.showdrawer = false;
	},
	opendrawer(){
		this.showdrawer = true;
		citylist.get({
			success:res=>{
				this.cityhistory = res.data;
			}
		})
	}
  }
}
</script>
<style scoped>
  @import 'index.css';
</style>
<style>
	.localtion .indexdrawer .uni-drawer .uni-drawer__content{
		background:#333;
		width: 70%;
	}
</style>
