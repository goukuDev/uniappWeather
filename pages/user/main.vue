<template>
	<div class="user">
		<div class="top">
			<button :open-type='ifgetUserInfo? "":"getUserInfo"' @getuserinfo="loding" v-if="!showuserinfo && !ifgetUserInfo">登录/注册</button>
			<button @click="loding" v-if="ifgetUserInfo && !showuserinfo">登录/注册</button>
			<div v-if='showuserinfo' class='usermsg'>
				<div class="userimg">
					<img :src="usermsg.avatarUrl" alt="">
					<div class="phone">
						<div>{{usermsg.nickName}}</div>
						<div>{{logingmsg | changephone}}</div>
					</div>
				</div>
			</div>
		</div>
		<div class="bottom">
			<div>地址管理</div>
			<div>设置</div>
			<div>联系我们</div>
		</div>
	</div>
</template>

<script>
	//初始化数据库
	wx.cloud.init();
	const db = wx.cloud.database({});
	const userInfo = db.collection('userInfo');
	export default{
		data(){
			return{
				usermsg:null,
				ifgetUserInfo:false,
				showuserinfo:false,
				logingmsg:null
			}
		},
		onShow() {
			//查看是否授权
			wx.getSetting({
			  success: (res)=>{
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，就不用显示授权框
					this.ifgetUserInfo = true;
					wx.getUserInfo({
						success: (res)=> {
							//已经授权就可以直接拿到用户信息
							this.usermsg = res.userInfo;
							userInfo.get({
								success:res=>{
									if(
										!!wx.getStorageSync('logingmsg') && 
										res.data.map(o=>o.data).map(o=>o.city).includes(this.usermsg.city) && 
										res.data.map(o=>o.data).map(o=>o.nickName).includes(this.usermsg.nickName) && 
										res.data.map(o=>o.data).map(o=>o.province).includes(this.usermsg.province)
									){
										//如果已经登录就显示登录的页面
										this.showuserinfo = true;
										this.logingmsg = JSON.parse(wx.getStorageSync('logingmsg'));
									}
								}
							})
						}
					})
				}else{
					this.ifgetUserInfo = false;
				}
			  }
			})
		},
		filters:{
			changephone(e){
				if(!!e)
					return e.phone.substring(0,3)+"*****"+e.phone.substring(8,11)
			}
		},
		methods:{
			loding(){
				//查看是否授权
				wx.getSetting({
				  success: (res)=>{
					if (res.authSetting['scope.userInfo']) {
						wx.navigateTo({
							url:'../../user/loding/main'
						})
					}
				  }
				})
			}
		}
	}
</script>

<style>
	@import './index.css';
</style>
