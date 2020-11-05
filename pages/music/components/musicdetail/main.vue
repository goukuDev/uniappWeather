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
	export default {
		data() {
			return {
				detail:null,
				audioCtx:null
			}
		},
		onLoad(){
			this.detail = this.vuex.state.musicdetail;
			this.audioCtx = uni.createInnerAudioContext('audio');
			this.audioCtx.autoplay = true;
		},
		onUnload(){
		    Object.assign(this, this.$options.data())
			this.vuex.state.musicdetail = {};
		}
	}
</script>
<style scoped>
	@import 'index.css';
</style>