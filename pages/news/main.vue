<template>
  <div class="kind">
	<uni-collapse>
		<uni-collapse-item title="分类" :show-animation="true">
			<view style="padding: 30upx;display: flex;flex-wrap: wrap;">
				<div style='width: 25%;height: 50px;text-align: center;line-height:50px;font-size: 18px;' v-for="(item,index) in newslist" :key="index" @click="tonewslist(item.name,item.type)">{{item.name}}</div>
			</view>
		</uni-collapse-item>
	</uni-collapse>
    <div class="kindbox">
      <div v-for="(item,index) in allTopicList" :key="index" class='kindnews' @click="intolist(index)">
        <title style="font-size:20px;font-weight:600;height:50px;display:block;line-height:50px;">{{item[0].category}}</title>
        <div v-for="(data,key) in item" :key="key" class="newslistdetail" v-if="data.title">
          <div class="left">
            <div class="title">{{data.title}}</div>
            <span style="color:#b4b4b4;font-size:12px;">{{data.source}}</span>
          </div>
          <div class="right" v-if="data.picInfo.length">
            <img :src="data.picInfo[0].url" alt="" srcset="" style="width:100%;height:80px;border-radius:3px;"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {request} from 'utils';
import {uniCollapse,uniCollapseItem} from "@dcloudio/uni-ui"
export default {
  data(){
    return{
      newslist:[
        {
          name:"新闻",
          type:"BBM54PGAwangning",
          kind:"toutiao"
        },
        {
          name:"娱乐",
          type:"BA10TA81wangning",
          kind:"ent"
        },
        {
          name:"体育",
          type:"BA8E6OEOwangning",
          kind:"sports"
        },
        {
          name:"财经",
          type:"BA8EE5GMwangning",
          kind:"money"
        },
        {
          name:"军事",
          type:"BAI67OGGwangning",
          kind:"war"
        },
        {
          name:"科技",
          type:"BA8D4A3Rwangning",
          kind:"tech"
        },
        {
          name:"手机",
          type:"BAI6I0O5wangning"
        },
        {
          name:"汽车",
          type:"BA8DOPCSwangning",
          kind:"auto"
        },
        {
          name:"旅游",
          type:"BEO4GINLwangning"
        },
        {
          name:"教育",
          type:"BA8FF5PRwangning",
          
        }
      ],
      allTopicList:null,
    }
  },
  components:{
	  uniCollapse,
	  uniCollapseItem
  },
  onLoad(){
    this.getallTopicList();
  },
  onPullDownRefresh () {
    this.getallTopicList();
    wx.showLoading({
      title: '加载中',
    })
  },
  methods:{
    tonewslist(item,type){
      wx.navigateTo({
        url:'../../pages/newslist/main?type='+type+'&item='+item,
      })
    },
    getallTopicList(){
      request('https://3g.163.com/touch/api/pagedata/index_yaowen?callback=allTopicList')
      .then(res=>{
        let data = '{'+res.data.split('allTopicList({')[1].split('})')[0]+'}';
        this.allTopicList = JSON.parse(data).data;
        setTimeout(()=>{
          wx.stopPullDownRefresh();
          wx.hideLoading();
        },2000);
      })
    },
    intolist(index){
      if(!!this.newslist.filter(o=>o.kind==index).length)
        this.tonewslist(this.newslist.filter(o=>o.kind==index)[0].name,this.newslist.filter(o=>o.kind==index)[0].type)
    }
  }
}
</script>

<style scoped>
  @import './index.css';
</style>
