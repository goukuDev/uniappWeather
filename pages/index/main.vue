<template>
	<div class="index">
		<div class="indexbox">
			<div class="localtion">
				<div 
				v-if='!!region'
				@click='opendrawer' 
				style='height:100%;display: flex;justify-content: center;align-items: center;'>
					<icon type="search" size="18" color='#666' style="height:20px;"></icon>
					{{region}}
				</div>
				<uni-drawer ref="unidrawer">
					<div style='height:40px;background:#333;'>
						<div  style='height: 40px;width: calc(100% - 40px);float: left;text-align: left;color:#fff;font-size:15px;text-indent:10px;'>搜索城市</div>
						<icon type="search" size="20" color='#fff' style="float: right;width: 40px;height:30px;padding-top: 10px;" @click="tocitys"></icon>
					</div>
					<scroll-view style='height:calc(100% - 40px)' scroll-y> 
							<uni-swipe-action>
								<uni-swipe-action-item 
								:right-options="options" 
								v-for="(item,index) in cityhistory" 
								:key='index'
								@click='bindClick($event,item)'
								>
									<view style="display: flex;width: 100%;height: 50px;line-height: 50px;border-bottom: 1px solid #ccc;" @click.stop="closedrawer(item.data.city,item._id)">
										<div style='flex:70%;text-align:left;text-indent:10px;font-size:15px;'>{{item.data.city.split(',')[item.data.city.split(',').length-1]}}</div>
										<div style='flex:30%;text-align:left;font-size:15px;'>
											{{item.data.temp}}℃
											<image :src="'/static/weathercn/'+item.data.img+'.png'" mode="" style="width: 25px;height: 25px;margin-top: 10px; float: right;"></image>
										</div>
									</view>
								</uni-swipe-action-item>
							</uni-swipe-action>
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
import {mapState,mapMutations} from 'vuex';
import {uniDrawer,uniSwipeAction,uniSwipeActionItem} from "@dcloudio/uni-ui";
//初始化数据库
wx.cloud.init();
const db = wx.cloud.database({});
const citylist = db.collection('citylist');
export default {
	data () {
		return {
			lifeindex:null,
			result:null,
			listdata:null,
			region:null,
			twodateweather:[],
			// 今天天气信息
			dateweather:{},
			// 15天天气
			forecastlist:[],
			// 24小时天气
			hourlist:[],
			options: [
				{
					text: '取消',
					style: {
						backgroundColor: '#007aff'
					}
				}, 
				{
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				},
			],
			cityhistory:null,
			weathermsg:true
		}
	},
	components:{
	  uniDrawer,uniSwipeAction,uniSwipeActionItem
	},
	computed:{
	  ...mapState({
		  choosecity:state=>state.index.choosecity
	  })
	},
	onLoad(){
		wx.showLoading({
		  title: '加载中',
		})
	},
	onShow() {
		if(!!this.choosecity){
			this.region = this.choosecity.province;
			this.getweather(this.choosecity.province)
		}else{
			this.GetLocation();
		}
		wx.showShareMenu({
			withShareTicket:true,
			menus:['shareAppMessage','shareTimeline']
		})
	},
	onPullDownRefresh () {
		this.GetLocation();
	},
	onHide(){
		//切换到别的tab页面时候，地址要默认显示设备所在地址
		this.clearChooseCity();
	},
	methods: {
		...mapMutations(['SETCHOOSECITY']),
		clearChooseCity(){
			this.SETCHOOSECITY('')
		},
		//初始化时加载查询过的历史数据
		getlinelist(){
			linelist.get({
				success:res=>{
					this.checkpoint = res.data;
				}
			})
		},  
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
					this.qqmapsdk.reverseGeocoder({
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
				this.result =  res.data.result;
				this.lifeindex = this.result.index;
				this.twodateweather= this.result.daily.slice(0,2)
				this.dateweather={
				  current_temperature: this.result.temp,
				  current_condition: this.result.weather,
				  wind_direction: this.result.winddirect,
				  wind_level: this.result.windpower,
				  quality_level: this.result.aqi.quality,
				  aqi: this.result.aqi.aqi,
				  background:this.result.aqi.aqiinfo.color,
				  humidity:this.result.humidity,
				  img:this.result.img
				},
				this.forecastlist = this.result.daily;
				this.hourlist = this.result.hourly.map(o=>Object.assign({},{'condition': o.weather,'hour':o.time,'temperature':o.temp}))
				wx.stopPullDownRefresh();
				//储存城市天气历史记录
				this.listdata = {city:position,temp:this.result.temp,img:this.result.img};
				citylist.get({
					success:res=>{
						// 没有历史结果就保存,有历史结果就更新
						if(!res.data.map(o=>o.data).some(o=>o.city==this.listdata.city)){
							citylist.add({
								data:{
									data:this.listdata
								},
								success: function(res) {
									console.log(res._id)
								}
							})
						}
						if(!!id && !(!res.data.map(o=>o.data).some(o=>o.city==this.listdata.city))){
							citylist.doc(id).update({
								data:{
									data:this.listdata
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
				url:`../../pages/index/components/weatherdetail/main?data=${JSON.stringify(this.forecastlist)}&lifeindex=${JSON.stringify(this.lifeindex)}&index=${index}`
			})
		},
		totodydetail(){
			let data = {
				weather:this.result.weather,
				winddirect:this.result.winddirect,
				windpower:this.result.windpower,
				temp:this.result.temp,
				pressure:this.result.pressure,
				humidity:this.result.humidity,
				quality:this.result.aqi.quality,
				ipm2_5:this.result.aqi.ipm2_5,
				aqi:this.result.index[0].detail,
				img:this.result.img
			}
			wx.navigateTo({
				url:`../../pages/index/components/todydetail/main?data=${JSON.stringify(data)}`
			})
		},
		tocitys(){
			wx.navigateTo({
				url:'../../pages/index/components/selectcitys/main'
			})
			setTimeout(()=>{
				this.$refs.unidrawer.close();
			},1000)
		},
		bindClick({content},{_id}){
			if(content.text != '删除') return;
			citylist.doc(_id).remove({
				success: (res) => {
					citylist.get({
						success:res=>{
							this.cityhistory = res.data;
						}
					})
				}
			})
		},
		closedrawer(data,id){
			this.getweather(data,id);
			this.region = data;
			this.$refs.unidrawer.close();
		},
		opendrawer(){
			this.$refs.unidrawer.open();
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