<template>
	<div class='music'>
		<!-- 左侧显示略缩图、图标 -->
		<uni-list>
		    <uni-list-item 
			:clickable="true"
			@click="onPlay(item)"
			v-for="item in musicList"
			:key="item.id"
			:title="item.name" 
			:note="item.ar.map(o=>o.name).join('、')" 
			:thumb="item.al.picUrl"
		    thumb-size="lg">
			</uni-list-item>
		</uni-list>
	</div>
</template>

<script>
	import musicList from '../../static/js/music.js';
	import {uniList,uniListItem} from '@dcloudio/uni-ui'
	import {mapMutations} from 'vuex';

	export default{
		components:{
			uniList,uniListItem
		},
		data(){
			return{
				musicList,
			}
		},
		methods:{
			...mapMutations(['SETMUSICDETAIL']),
			onPlay(data){
				let params = {
					src:data.id,
					name:data.name,
					poster:data.al.picUrl,
					author:data.ar.map(o=>o.name).join(',')
				}
				this.SETMUSICDETAIL(params);
				wx.navigateTo({
					url:`../../pages/music/components/musicdetail/main`
				})
			}
		}
	}
</script>

<style>
	@import 'index.css';
</style>
