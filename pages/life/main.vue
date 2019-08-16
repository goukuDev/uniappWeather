<template>
  <div class="life">
    <cover-view class="play">
      <cover-view @click="tolifedetail" class="inputbox">{{coverview || '地址、公交查询'}}</cover-view>
	  <cover-view v-if="coverview" @click="deletebox" class="deletebox">X</cover-view>
    </cover-view>
    <map 
      id="map" 
      :longitude="localtion.longitude" 
      :latitude="localtion.latitude" 
      scale="14" 
      :markers="markers" 
      show-location
      enable-rotate
      style="width: 100%; height:100%;">
    </map>
    <cover-view class="bottom" v-if="showbottom">
      <cover-view class="title">{{chooseitem.title}}</cover-view>
      <cover-view class="address">{{chooseitem.address}}</cover-view>
      <cover-view @click="showlinedetail(chooseitem.location)" class="line">路线</cover-view>
    </cover-view>
	<uni-popup ref="popup" type="center">登录后才能使用</uni-popup>
  </div>
</template>

<script>
import qqMap from '../../static/js/qqmap-wx-jssdk.js';
const qqmapsdk = new qqMap({
        key: 'N6JBZ-PVUCV-KJVPE-UYY2R-LZDHZ-DBFKL' //自己的key秘钥 http://lbs.qq.com/console/mykey.html 在这个网址申请
      });
import vuex from '../../static/js/store.js';
import {uniPopup} from "@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue"
let region;
let nowpoint;
let address;
export default {
  data () {
    return {
      coverview:'',
      markers : [{
        iconPath: "/static/images/location.png",
        id: 0,
        width: 50,
        height: 50
      }],
      localtion:{},
      showbottom:false,
      chooseitem:null,
      polyline: [{
        points:[
          {
            longitude:'',
            latitude: ''
          },
          {
            longitude:'',
            latitude:''
          }
        ],
        color: '#3CB371',
        width: 6
      }],
	  checkSession:false,
    }
  },
  components:{
	  uniPopup
  },
  onLoad(){
    this.getLocation();
	wx.showLoading({
		title:"加载中"
	})
  },
  methods:{
    //获得微信经纬度
    getLocation: function () {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.getLocal(res.latitude,res.longitude)
        },
        fail: function (res) {
          console.log('fail' + JSON.stringify(res))
        },
        altitude:true
      })
    },
    //获得地址
    getLocal: function (latitude, longitude) {
      qqmapsdk.reverseGeocoder({
        success: (res) =>{
		  wx.hideLoading();
		  address = res.result.address;
          nowpoint = {
            latitude:latitude,
            longitude:longitude
          }
          region = res.result.address_component.city;
          //初始化时候显示当前所在位置
          this.markers = [{
            latitude:latitude,
            longitude:longitude,
          }];
          this.localtion = {
            latitude:latitude,
            longitude:longitude
          }
        },
        fail:  (res) => {
          console.log(res);
        }
      });
    },
    tolifedetail(){
      wx.navigateTo({
        url:'../../life/searchline/main?city='+region+'&value='+this.coverview,
      })
    },
    //显示不同类型的路线图
    showlinedetail(to){
		if(!!this.checkSession && !!wx.getStorageSync('logingmsg')){
			wx.navigateTo({
			  url:'../../life/line/main?localtion='+JSON.stringify(nowpoint)+'&to='+JSON.stringify(to)+'&mypoint='+address+'&topoint='+this.coverview,
			})
		}else{
			this.$refs.popup.open();
			setTimeout(()=>{
				this.$refs.popup.close();
			},1000);
		}
    },
    deletebox(){
      this.showbottom = false;
      this.coverview = '';
      this.markers = [{
        iconPath:''
      }];
      vuex.state.choosepoint = {};
    },
    //回到原点
    goback(){
      this.markers = [{
        latitude:nowpoint.latitude,
        longitude:nowpoint.longitude,
      }];
      this.localtion = {
        latitude:nowpoint.latitude,
        longitude:nowpoint.longitude
      }
    },
  },
  onShow(){
    //每次显示当前页面时候判断是否有选择的地址要显示，有就显示其所在位置
    if(!!Object.values(vuex.state.choosepoint).length){
      this.coverview = vuex.state.choosepoint.title;
      this.localtion = {
        latitude:vuex.state.choosepoint.location.lat,
        longitude:vuex.state.choosepoint.location.lng
      };
      this.markers = [{
        latitude: vuex.state.choosepoint.location.lat,
        longitude: vuex.state.choosepoint.location.lng
      }];
      this.chooseitem = vuex.state.choosepoint;
      this.showbottom = !vuex.state.choosepoint.category.includes('公交线路');
    }
	wx.getSetting({
	  success: (res)=>{
		if (res.authSetting['scope.userInfo']) {
			this.checkSession = true;
		}else{
			this.checkSession = false;
		}
	  }
	})
  },
  onHide(){
    //切换到别的tab页面时候，当前页面的信息要清空，地址要默认显示设备所在地址
    Object.assign(this, this.$options.data());
    // this.getLocation();
    // vuex.state.choosepoint = {};
  }
}
</script>

<style scoped>
  @import './index.css';
</style>
<style>
	.uni-popup .uni-popup__wrapper.uni-custom.center .uni-popup__wrapper-box{
		width:150px;
		height:30px;
		font-size:15px;
		border-radius:3px;
		line-height:30px;
		text-align:center;
		color:#fff;
		background:#333;
		padding: 0;
	}
</style>