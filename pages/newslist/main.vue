<template>
  <div class="newslist">
    <!-- banner图 -->
    <swiper display-multiple-items="1" duration="500" interval='8000' :autoplay='true' :circular='true' class="banner">
      <block v-for="(item,index) in banner" :key="index">
        <swiper-item>
            <div :style="'background:url('+item.imgsrc+') no-repeat center center;width:100%;height:100%;background-size:100%;'"></div>
            <title>{{item.title}}</title>
        </swiper-item>
      </block>
    </swiper>
    <!-- 详情内容 -->
    <div class="detail">
      <div v-for="(data,key) in newslist" :key="key" class="newslistdetail">
        <div class="left">
          <div class="title">{{data.title}}</div>
          <span style="color:#b4b4b4;font-size:12px;">{{data.source}}</span>
        </div>
        <div class="right" v-if="data.imgsrc" :style="'background:url('+data.imgsrc+') no-repeat center center;border-radius:3px;background-size:130px 80px;'">
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {request} from 'utils';
let type =null;
let pages = 0;
export default {
  data(){
    return{
      newslist:null,
      banner:null
    }
  },
  onLoad(options){
    type = options.type;
    wx.setNavigationBarTitle({
      title:options.item
    })
    this.getnewslist(type,pages)
  },
  onUnload(){
    Object.assign(this, this.$options.data())
  },
  methods:{
    getnewslist(listtype,listpages){
      request('https://3g.163.com/touch/reconstruct/article/list/'+listtype+'/'+pages+'-'+pages*1+10+'.html')
      .then(res=>{
        let data  = '{'+res.data.split('artiList({')[1].split('})')[0]+'}';
        this.newslist = JSON.parse(data)[listtype]
        this.banner = JSON.parse(data)[listtype].slice(0,3)
      })
    }
  }
}
</script>

<style scoped>
  @import './index.css';
</style>
