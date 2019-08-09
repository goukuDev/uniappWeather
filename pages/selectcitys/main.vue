<template>
	<div class="hotcities">
		<div class="top">
			<input class="input_bottom" type="text" name="" placeholder="输入城市名称" v-model="city" @focus="showcitylist=false" @blur="showcitylist=true;checkcitylist=[]" @change="checkcity">
		</div>
		<div class="bottom" v-if='showcitylist && !city'>
			<div class='hottitle'>热门城市</div>
			<div class='hotbox'>
				<li v-for='(item,index) in hotcities' :key='index' @click='toindex(item)'>
					<span>{{item}}</span>
				</li>
			</div>
		</div>
		<div class="citys" v-else>
			<div class="citylist" v-if='checkcitylist.length'>
				<li v-for='(item,index) in checkcitylist' :key='index'>{{item.wholeName.split('中国,')[1]}}</li>
			</div>
			<div class='nonecity' v-if='!checkcitylist.length && city!=""'>
				没有发现该城市
			</div>
			<div class='normal' v-if='!checkcitylist.length && city==""'>
				搜索想查看的城市
			</div>
		</div>
	</div>
</template>

<script>
	import {request} from 'utils';
	export default{
		data(){
			return{
				city:'',
				showcitylist:true,
				hotcities:['北京','上海','广州','深圳','杭州','成都','郑州','武汉','重庆','苏州','无锡','长沙','沈阳','西安','青岛','昆明','厦门','天津','拉萨'],
				checkcitylist:[],
			}
		},
		methods:{
			checkcity(){
				if(this.city==''){
					return;
				}else{
					request('https://ali-city.showapi.com/areaName?&areaName='+this.city+'&&maxSize=20',{'Authorization':'APPCODE def0b8f2c0304cb59b0a7cdaa24dd000'})
					.then(res=>{
						if(res.statusCode == 200){
							this.checkcitylist = res.data.showapi_res_body.data.filter(o=>!(o.areaName.endsWith('乡') || o.areaName.endsWith('镇') || o.areaName.endsWith('街道')));
						}else{
							this.checkcitylist =[];
						}
					})
				}
			},
			toindex(point){
				wx.navigateBack({
					delta:1
				})
			}
		}
	}
</script>

<style>
	@import './index.css';
</style>
