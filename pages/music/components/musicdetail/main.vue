<template>
	<view class="page-body">
		<view class="page-section page-section-gap" style="text-align: center;width: 100%;">
			<audio
			v-if="!!detail"
			id="audio"
			style="text-align: left" 
			:src="`https://music.163.com/song/media/outer/url?id=${detail.src}.mp3`"
			:poster="detail.poster" 
			:name="detail.name" 
			:author="detail.author"
			controls>
			</audio>
		</view>
		<view class="center">
			---暂时没有歌词---
		</view>
		<view></view>
	</view>
</template>

<script>
	import {mapState} from 'vuex';
	
	export default {
		data() {
			return {
				audioCtx:null
			}
		},
		computed:{
			...mapState({
				detail:state=>state.music.musicdetail
			})
		},
		onLoad(){
			this.audioCtx = uni.createInnerAudioContext('audio');
			this.audioCtx.autoplay = true;
		},
		onUnload(){
		    Object.assign(this, this.$options.data())
		}
	}
</script>
<style scoped>
	@import 'index.css';
</style>