<template>
	<div class="hotcities">
		<div class="top">
			<div class='search'>
				<input
				class="input_bottom" 
				type="text"  
				placeholder="输入城市全名,如:杭州市" 
				v-model="city"
				@focus="showcitylist=false" 
				@blur="showcitylist=true" 
				@input="checkcity"
				/>
			</div>
		</div>
		<div class="bottom" v-if='showcitylist && !city'>
			<div class='hottitle'>热门城市</div>
			<div class='hotbox'>
				<li v-for='(item,index) in hotcities' :key='index' @click='toindex(item)'>
					<span>{{item.city}}</span>
				</li>
			</div>
		</div>
		<div class="citys" v-else>
			<div class="citylist" v-if='!!checkcitylist'>
				<li v-for='(item,index) in checkcitylist' :key='index' @click='toindex(item)'>{{item.province}}</li>
			</div>
			<div class='nonecity' v-if='!checkcitylist && city!=""'>
				没有发现该城市
			</div>
			<div class='normal' v-if='!checkcitylist && city==""'>
				搜索想查看的城市
			</div>
		</div>
	</div>
</template>

<script>
	import {request} from 'utils';
	import {mapMutations} from 'vuex';
	export default{
		data(){
			return{
				city:'',
				showcitylist:true,
				hotcities:[
					{
						province:'北京市',
						city:'北京市'
					},
					{
						province:'上海市',
						city:'上海市'
					},
					{
						province:'广东省,广州市',
						city:'广州市'
					},
					{
						province:'广东省,深圳市',
						city:'深圳市'
					},
					{
						province:'浙江省,杭州市',
						city:'杭州市'
					},
					{
						province:'四川省,成都市',
						city:'成都市'
					},
					{
						province:'河南省,郑州市',
						city:'郑州市'
					},
					{
						province:'湖北省,武汉市',
						city:'武汉市'
					},
					{
						province:'重庆市',
						city:'重庆市'
					},
					{
						province:'江苏省,苏州市',
						city:'苏州市'
					},
					{
						province:'江苏省,无锡市',
						city:'无锡市'
					},
					{
						province:'湖南省,长沙市',
						city:'长沙市'
					},
					{
						province:'辽宁省,沈阳市',
						city:'沈阳市'
					},
					{
						province:'陕西省,西安市',
						city:'西安市'
					},
					{
						province:'山东省,青岛市',
						city:'青岛市'
					},
					{
						province:'福建省,厦门市',
						city:'厦门市'
					},
					{
						province:'天津市',
						city:'天津市'
					},
					{
						province:'西藏自治区,拉萨市',
						city:'拉萨市'
					},
				],
				checkcitylist:null,
				timeout:null
			}
		},
		onShow() {
			wx.showShareMenu({
				withShareTicket:true,
				menus:['shareAppMessage','shareTimeline']
			})
		},
		methods:{
			...mapMutations(['SETCHOOSECITY']),
			/**
			 * debounce: 防抖处理函数
			 * func: 函数
			 * wait: 延迟时间
			 */
			debounce (func, wait) {
			  if (this.timeout) clearTimeout(this.timeout)
			  this.timeout = setTimeout(() => {
				func()
			  }, wait)
			},
			checkcity(){
				this.debounce(this.search, 1000);
			},
			search(){
				if(!!this.city){
					request(`https://ali-city.showapi.com/areaName?&areaName=${this.city}`,{'Authorization':'APPCODE def0b8f2c0304cb59b0a7cdaa24dd000'})
					.then(res=>{
						if(res.statusCode === 200){
							this.checkcitylist = res.data.showapi_res_body.data
							.filter(o=>
							!(o.areaName.endsWith('乡') || 
							o.areaName.endsWith('镇') || 
							o.areaName.endsWith('街道') || 
							o.areaName.includes('村') ||
							o.areaName.includes('村民') ||
							o.areaName.includes('委会') || 
							o.areaName.includes('社区') ||
							o.areaName.includes('居委会') ||
							o.areaName.includes('居民') ||
							o.areaName.includes('场') ||
							o.areaName.includes('开发') ||
							o.areaName.includes('工业')
							))
							.map(o=>Object.assign({},{province:o.wholeName? o.wholeName.split('中国,')[1]:o.areaName,city:o.areaName}));
						}else{
							this.checkcitylist = null;
						}
					})
				}else{
					this.checkcitylist = null; 
					this.showcitylist = true;
				}
			},
			toindex(point){
				wx.navigateBack({
					delta:1
				});
				this.SETCHOOSECITY(point);
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import './index.scss';
</style>
