<template>
    <div class="todydetail">
        <div class="top">
            <div>{{aqi.temp}}℃{{aqi.weather}}</div>
            <div>{{aqi.aqi}}</div>
        </div>
        <div class="bottom">
            <div><span>{{aqi.temp}}℃</span><span>温度</span></div>
            <div><span>{{aqi.ipm2_5}}</span><span>pm2.5</span></div>
            <div><span>{{aqi.quality}}</span><span>空气质量</span></div>
            <div><span>{{aqi.pressure}}hPa</span><span>压强</span></div>
            <div><span>{{aqi.humidity}}%</span><span>湿度</span></div>
            <div><span>{{aqi.windpower}}</span><span>{{aqi.winddirect}}</span></div>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return{
            aqi:{},
        }
    },
    onLoad(options){
        this.aqi  = JSON.parse(options.data);
    }
}
</script>
<style scoped>
    @import './index.css';
</style>
