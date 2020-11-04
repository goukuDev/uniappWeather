<template>
    <div class="line">
        <cover-view class="play">
			<cover-view class='fromto'>
				<cover-view @click='fromToLocation'>{{mypoint}}</cover-view>
				<cover-view @click='toToLocation'>{{topoint}}</cover-view>
			</cover-view>
			<cover-view class="linetype">
				<cover-view v-for="(item,index) in lineType" :key="index" @click="checklinetype(item.type)" :class="{active:chooseLineType==item.type}">{{item.name}}</cover-view>
			</cover-view>
        </cover-view>
        <map 
        id="map" 
        :longitude="localtion.longitude" 
        :latitude="localtion.latitude" 
        :scale="scale" 
        :markers="markers" 
        :polyline='polyline'
        show-location
        include-points
        style="width: 100%; flex:1;">
        </map>
        <div class="bottom">
            <!-- 公交路线 -->
            <swiper display-multiple-items="1" current='0' duration="500" v-if="transit" indicator-dots circular @change="checkout($event)">
                <block v-for="(item,index) in transit" :key="index">
                    <swiper-item> 
                        <div style="width:calc(80% - 10px);margin-left:10px;">
                            <div class="time">{{item.distance}}   {{item.duration}}</div>
                        </div>
                        <div style="width:20%;line-height:80px;text-align:center;font-size:18px;color:blue;" @click="tolinedetail(item)">详情</div>
                    </swiper-item>
                </block>
            </swiper>
            <!-- 其他路线 -->
            <div v-if="showbottom">
                <div style="width:calc(80% - 10px);margin-left:10px;float:left" v-if="noway">
                    <div class="time">{{showbottom.distance}}   {{showbottom.duration}}</div>
                    <div class="money" v-if="showbottom.taxi_fare">打车约{{showbottom.taxi_fare.fare}}元</div>
                </div>
                <div v-if="noway" style="width:20%;line-height:80px;text-align:center;font-size:18px;color:blue;float:left" @click="tolinedetail(showbottom)">详情</div>
                <div v-else style="height:100%;line-height:80px;text-align:center;font-size:18px;font-weight:600">路程太远,请选择其他交通工具</div>
            </div>
        </div>
    </div>
</template>
<script>
let from;
let to;
export default {
    data(){
        return{
            lineType:[
                {
                    type:'driving',
                    name:'驾车'
                },
                {
                    type:'transit',
                    name:'公交'
                },
                {
                    type:'bicycling',
                    name:'骑行'
                },
                {
                    type:'walking',
                    name:'步行'
                }
            ],
            chooseLineType:'driving',
            markers : [{
                iconPath: "/static/images/location.png",
                id: 0,
                width: 50,
                height: 50
            }],
            localtion:{},
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
            showbottom:null,
            scale:'14',
            transit:null,
            noway:true,
			mypoint:'',
			topoint:''
        }
    },
    onLoad(options){
        from = JSON.parse(options.localtion);
        to = JSON.parse(options.to);
        this.localtion = {
            latitude:from.latitude,
            longitude:from.longitude
        }
        this.markers = {
            latitude:from.latitude,
            longitude:from.longitude
        }
        //默认显示方式为驾车
        this.getline(from,to,this.chooseLineType)
		this.mypoint = options.mypoint;
		this.topoint = options.topoint;
    },
    methods:{
		//出发地选点
		fromToLocation: function () {
		   wx.chooseLocation({
		      success: res => {
				 let fromLocation = {
									   title: res.name,
									   address:res.address,
									   category:'地名地址:行政地名',
									   latitude:res.latitude,
									   longitude:res.longitude
									};
		         this.mypoint = res.name;
				 from = fromLocation;
				 this.getline(from,to,this.chooseLineType);
		      },
		      fail: function (err) {
		         console.log(err)
		      },
			  altitude:true
		   });
		},
		//目的地选点
		toToLocation: function () {
		   wx.chooseLocation({
		      success: res => {
				 let toLocation = {
								   title: res.name,
								   address:res.address,
								   category:'地名地址:行政地名',
								   lat:res.latitude,
								   lng:res.longitude
								};
		         this.topoint = res.name;
				 to = toLocation;
				 this.getline(from,to,this.chooseLineType);
		      },
		      fail: function (err) {
		         console.log(err)
		      },
			  altitude:true
		   });
		},
        checkout(e){
            var ret = this.transit[e.target.current];
            var count = ret.steps.length;
            var pl = [];
            var coors = [];
            //获取各个步骤的polyline
            for(var i = 0; i < count; i++) {
                if (ret.steps[i].mode == 'WALKING' && ret.steps[i].polyline) {
                    coors.push(ret.steps[i].polyline);
                }
                if (ret.steps[i].mode == 'TRANSIT' && ret.steps[i].lines[0].polyline) {
                    coors.push(ret.steps[i].lines[0].polyline);
                }
            }       
            //坐标解压（返回的点串坐标，通过前向差分进行压缩）
            var kr = 1000000;
            for (var i = 0 ; i < coors.length; i++){
                for (var j = 2; j < coors[i].length; j++) {
                    coors[i][j] = Number(coors[i][j - 2]) + Number(coors[i][j]) / kr;
                }
            }
            //定义新数组，将coors中的数组合并为一个数组
            var coorsArr = [];
            for (var i = 0 ; i < coors.length; i ++){
                coorsArr = coorsArr.concat(coors[i]);
            }
            //将解压后的坐标放入点串数组pl中
            for (var i = 0; i < coorsArr.length; i += 2) {
                pl.push({ latitude: coorsArr[i], longitude: coorsArr[i + 1] })
            }
            this.localtion = {
                latitude:pl[0].latitude,
                longitude:pl[0].longitude
            }
            this.polyline = [{
                points: pl,
                color: '#3CB371',
                width: 6
            }]
        },
        getline(from,to,type){
            this.qqmapsdk.direction({
                mode: type,
                from: { latitude: from.latitude,longitude: from.longitude},
                to:{ latitude: to.lat,longitude: to.lng},
                success: res => {
                //路径规划完成后显示时长、距离等
                this.scale = 12;
                if(type == 'transit'){
                    this.transit = res.result.routes
                    &&
                    res.result.routes.map(o=>Object.assign({},o,{
                        distance:o.distance>999? (o.distance/1000).toFixed(2)+'千米':o.distance+'米',
                        duration:o.duration>59? parseInt(o.duration/60)+'小时'+(o.duration%60)+'分':o.duration+'分'
                    }))
                    this.showbottom = null;
                    var ret = res.result.routes[0];
                    var count = ret.steps.length;
                    var pl = [];
                    var coors = [];
                    //获取各个步骤的polyline
                    for(var i = 0; i < count; i++) {
                        if (ret.steps[i].mode == 'WALKING' && ret.steps[i].polyline) {
                            coors.push(ret.steps[i].polyline);
                        }
                        if (ret.steps[i].mode == 'TRANSIT' && ret.steps[i].lines[0].polyline) {
                            coors.push(ret.steps[i].lines[0].polyline);
                        }
                    }       
                    //坐标解压（返回的点串坐标，通过前向差分进行压缩）
                    var kr = 1000000;
                    for (var i = 0 ; i < coors.length; i++){
                        for (var j = 2; j < coors[i].length; j++) {
                            coors[i][j] = Number(coors[i][j - 2]) + Number(coors[i][j]) / kr;
                        }
                    }
                    //定义新数组，将coors中的数组合并为一个数组
                    var coorsArr = [];
                    for (var i = 0 ; i < coors.length; i ++){
                        coorsArr = coorsArr.concat(coors[i]);
                    }
                    //将解压后的坐标放入点串数组pl中
                    for (var i = 0; i < coorsArr.length; i += 2) {
                        pl.push({ latitude: coorsArr[i], longitude: coorsArr[i + 1] })
                    }
                }else{
                    this.showbottom = res.result.routes[0] 
                    && 
                    Object.assign({},res.result.routes[0],{
                        distance:res.result.routes[0].distance>999? (res.result.routes[0].distance/1000).toFixed(2)+'千米':res.result.routes[0].distance+'米',
                        duration:res.result.routes[0].duration>59? parseInt(res.result.routes[0].duration/60)+'小时'+(res.result.routes[0].duration%60)+'分':res.result.routes[0].duration+'分'
                        })
                    this.transit = null;
                    var ret = res;
                    var coors = ret.result.routes[0].polyline, pl = [];
                    //坐标解压（返回的点串坐标，通过前向差分进行压缩）
                    var kr = 1000000;
                    for (var i = 2; i < coors.length; i++) {
                        coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
                    }
                    //将解压后的坐标放入点串数组pl中
                    for (var i = 0; i < coors.length; i += 2) {
                        pl.push({ latitude: coors[i], longitude: coors[i + 1] })
                    }
                }
                //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
                this.localtion = {
                    latitude:pl[0].latitude,
                    longitude:pl[0].longitude
                }
                if((type == 'walking' && res.result.routes[0].distance>80000) || (type == 'bicycling' && res.result.routes[0].distance>150000)){
                    this.polyline = [{
                        points:[],
                        color:'',
                        width:''
                    }]
                    this.noway = false;
                }else{
                    this.polyline = [{
                        points: pl,
                        color: '#3CB371',
                        width: 6
                    }]
                    this.noway = true;
                }
                },
                fail: function (error) {
                    console.error(error);
                },
                altitude:true
            })
        },
        checklinetype(type){
            this.chooseLineType=type;
            this.getline(from,to,type)
        },
        onUnload(){
            Object.assign(this, this.$options.data())
        },
        tolinedetail(data){
            wx.navigateTo({
                url:'../../pages/linedetail/main?data='+JSON.stringify(data),
            })
        },
    }
}
</script>
<style scoped>
    @import './index.css';
</style>
