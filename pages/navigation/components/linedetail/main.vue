<template>
    <div class="linedetail">
        <!-- 非公交路线详情 -->
        <ul v-if="lineresult.mode" class="linelist">
            <li v-for="(item,index) in lineresult.steps" :key="index">{{item.instruction}}</li>
        </ul>
        <!-- 市内公交路线详情 -->
        <div class="transit" v-if="!lineresult.mode  && lineresult.steps[0].mode!='TRANSIT_FOLDER'">
            <div v-for="(item,index) in lineresult.steps" :key="index" style="margin-bottom:10px;">
                <div v-if="item.mode == 'WALKING' && item.steps" class="walking">
                    <li v-for="(o,key) in item.steps" :key="key">{{o.instruction}}</li>
                </div>
                <div v-if="item.mode == 'WALKING' && !item.steps" class="walktrans">
                    向{{item.direction}}  {{item.distance}}米
                </div>
                <div v-if="item.mode == 'TRANSIT'" class="transit">
                    <div class="title">{{item.lines[0].title}}  上车站:{{item.lines[0].geton.title}}    下车站:{{item.lines[0].getoff.title}}  途径{{item.lines[0].station_count}}站</div>
                    <swiper style="height:120px;" :display-multiple-items="item.lines[0].stations.length>4? 4:item.lines[0].stations.length" current='0' duration="500">
                        <block v-for="(a,data) in item.lines[0].stations" :key="data">
                            <swiper-item> 
                                <div class="time" style="line-height:120px;text-align:center;font-size:18px;">{{a.title}}</div>
                            </swiper-item>
                        </block>
                    </swiper>
                </div>
            </div>
        </div>
        <!-- 跨城公交路线详情 -->
        <div  v-if="!lineresult.mode  && lineresult.steps[0].mode=='TRANSIT_FOLDER'" style="height:120px;line-height:120px;text-align:center;font-size:18px;">
            暂不支持跨城际公交
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return{
            lineresult:null,
        }
    },
    onLoad(options){
        this.lineresult  = JSON.parse(options.data)
    },
    methods:{

    }
}
</script>
<style lang="scss" scoped>
    @import './index.scss';
</style>

