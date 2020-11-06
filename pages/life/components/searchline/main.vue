<template>
    <div class="searchline">
        <div class="autofocus">
            <input placeholder="地址、公交查询" auto-focus v-model="value" @input="getsuggest(pages)"/>
            <icon type="clear" size="24" color="#ccc" v-if="value" @click="value=''"/>
        </div>
		<div style='height:30px;display:flex;width:90%;margin:0 auto;'>
			<div style='flex: 1;text-align: center;font-size: 16px;line-height: 30px;color: #396DE5;' @click='moveToLocation'><icon type="search" size="15" style="height:30px;" color="#396DE5"></icon>地图选点</div>
		</div>
		<!-- 显示历史结果列表 -->
        <div class="pointhistory" v-if="!!checkpoint && !value">
				<uni-swipe-action style='text-indent:10px;'>
					<uni-swipe-action-item :right-options="options" v-for="(item,index) in checkpoint" :key="item._id" @click="bindClick($event,item._id)">
						<view class='cont' @click.stop="backfill(item.data)">
							<view style="font-size:20px;height:35px;">{{item.data.title}}</view>
							<view style="height:25px;font-size:15px;color:#999;">{{item.data.address}}</view>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
        </div>
		<!-- 显示搜索结果例表 -->
        <div class="lifelist" v-if="!!suggestion.length && value">
            <ul>
                <li v-for="item in suggestion" :key="item.id" @click="backfill(item)" class="lists">
                    <view :id="item.id">{{item.title}}</view>
                    <view>{{item.address}}</view>
                </li>
                <span @click="getsuggest(pages*1+1)">加载更多</span>
            </ul>
        </div>
    </div>
</template>
<script>
import {uniSwipeAction,uniSwipeActionItem} from "@dcloudio/uni-ui";
import {mapMutations} from 'vuex';
let region;
//初始化数据库
let listdata;
wx.cloud.init();
const db = wx.cloud.database({});
const linelist = db.collection('linelist');
export default {
	components:{
		uniSwipeAction,
		uniSwipeActionItem
	},
    data(){
        return{
            suggestion:[],
            value:'',
            pages:1,
            checkpoint:[],
			options: [
				{
					text: '取消',
					style: {
						backgroundColor: '#007aff'
					}
				}, {
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				}
			],
			mobileLocation : {//移动选择位置数据
			   title: '',
			   address:'',
			   category:'地名地址:行政地名',
			   location:{
				   lat:'',
				   lng:''
			   }
			},
			timeout:null
        }
    },
    onLoad(options){
        region = options.city;
        this.value = options.value;
    },
    onUnload(){
        Object.assign(this, this.$options.data())
    },
    onShow(){
        this.getlinelist();
    },
    methods:{
		...mapMutations(['SETCHOOSEPOINT']),
		//初始化时加载查询过的历史数据
		getlinelist(){
		    linelist.get({
		        success:res=>{
		            this.checkpoint = res.data;
		        }
		    })
		},
		/**
		 * debounce: 防抖，防止频繁触发函数
		 * func: 函数
		 * wait: 延迟时间
		 */
		debounce (func, wait) {
		  if (this.timeout) clearTimeout(this.timeout)
		  this.timeout = setTimeout(() => {
			func()
		  }, wait)
		},
		getsuggest(index){
		    if(!this.value) return this.suggestion = [];
			this.pages = index;
			this.debounce(this.search, 600);
		},
		search(){
			//调用关键词提示接口
			this.qqmapsdk.getSuggestion({
			    keyword:this.value, //用户输入的关键词，可设置固定值,如keyword:'KFC'
			    region:region, //设置城市名，限制关键词所示的地域范围，非必填参数
			    page_index:this.pages,
			    page_size:10,
			    success: res => {//搜索成功后的回调
			        this.suggestion.push(...res.data)
			    },
			    fail: function(error) {
			        console.error(error);
			    }
			});
		},
		//移动选点
		moveToLocation: function () {
		   wx.chooseLocation({
		      success: res => {
				 let mobileLocation = {//移动选择位置数据
									   title: res.name,
									   address:res.address,
									   category:'地名地址:行政地名',
									   location:{
										   lat:res.latitude,
										   lng:res.longitude
									   }
									};
		         this.mobileLocation = mobileLocation
				 this.backfill(mobileLocation)
		      },
		      fail: function (err) {
		         console.log(err)
		      }
		   });
		},
		//点击历史数据右边滑出来的按钮
		bindClick({content},id){
			this.checkpoint.filter(o=>o._id!=id);
			if(content.text != '删除') return;
			linelist.doc(id).remove({
			    success: (res) => {
			        this.getlinelist();
			    }
			})
		},
        //数据回填方法
        backfill(item) {
            this.value = item.title;
            //储存搜索历史记录
            listdata = {address:item.address,category:item.category,location:item.location,title:item.title};
            linelist.get({
                success:res=>{
                    if(!res.data.map(o=>o.data).some(o=>o.address==listdata.address && o.title==listdata.title)){
                        linelist.add({
                            data:{
                                data:listdata
                            },
                            success: function(res) {
                                console.log(res._id)
                            }
                        })
                    }
                }
            })
            if(!item.category.includes('公交线路')){
				this.SETCHOOSEPOINT(item);
                wx.navigateBack({
                    delta:1,
                })
            }
        }
    }
}
</script>
<style>
    i-swipeout .swipeout .i-swipeout-item{
        height: 50px !important;
        padding: 0;
    }
</style>

<style scoped>
    @import './index.css';
</style>
