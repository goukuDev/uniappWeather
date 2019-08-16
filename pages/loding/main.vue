<template>
	<div class="loding">
		<div class="box">
			<input type="text" v-model="phone" placeholder="用户名/手机号">
			<input type="password" v-model="password" placeholder="密码">
			<div @click='findpassword'>重置密码</div>
			<button class="lodingbutton" @click="loding">登录</button>
			<button class="registerbutton" @click='register'>注册</button>
		</div>
		<uni-popup ref="popupmsg" type="center" class='popupmsg'>{{msg}}</uni-popup>
	</div>
</template>

<script>
	//初始化数据库
	let listdata;
	wx.cloud.init();
	const db = wx.cloud.database({});
	const account = db.collection('account');
	const userInfo = db.collection('userInfo');
	import {uniPopup} from "@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue";
	export default{
		data(){
			return{
				phone:'',
				password:'',
				msg:'',
				canloding:true,
				userInfo:null,
			}
		},
		components:{
			uniPopup
		},
		onShow() {
			//查看微信是否授权
			wx.getSetting({
			  success: (res)=>{
				if (res.authSetting['scope.userInfo']) {
					wx.getUserInfo({
						success: (res)=> {
							this.userInfo = res.userInfo;
						}
					})
				}
			  }
			})
		},
		methods:{
			findpassword(){
				wx.navigateTo({
					url:'../changepassword/main'
				})
			},
			loding(){
				if(this.phone==''){
					this.msg = '请输入手机号'
					this.$refs.popupmsg.open();
					setTimeout(()=>{
						this.$refs.popupmsg.close();
					},1000);
					return;
				}else if(!(/^1[3456789]\d{9}$/.test(this.phone))){
					this.msg = '手机号有误,请重新填写'
					this.$refs.popupmsg.open();
					setTimeout(()=>{
						this.$refs.popupmsg.close();
					},1000);
					return;
				}
				else if(this.password==''){
					this.msg = '请输入密码'
					this.$refs.popupmsg.open();
					setTimeout(()=>{
						this.$refs.popupmsg.close();
					},1000);
					return;
				}else{
					account.get({
					    success:res=>{
							// 手机号码还未注册
					        if(!res.data.map(o=>o.data).map(o=>o.phone).includes(this.phone)){
								wx.showModal({
									title: '提示',
									content: '当前手机号还未注册,请先注',
									showCancel: true,//是否显示取消按钮
									cancelColor:'skyblue',//取消文字的颜色
									success: (res)=> {
										if (!res.cancel) {
											this.register(this.phone);
										}
									}
								})
					        }else if(res.data.map(o=>o.data).map(o=>o.phone).includes(this.phone) && res.data.map(o=>o.data).filter(o=>o.phone==this.phone)[0].password!=this.password){
								this.msg = '密码错误，请重新输入'
								this.$refs.popupmsg.open();
								setTimeout(()=>{
									this.$refs.popupmsg.close();
								},1500);
							}else{
								//登录成功后在本地储存用户信息
								let lodingdata = res.data.map(o=>o.data).filter(o=>o.phone==this.phone)[0];
								wx.setStorage({
									key:'logingmsg',
									data:JSON.stringify(lodingdata)
								})
								//登录成功后在数据库里加用户信息
								let registerdata = this.userInfo;
								userInfo.get({
								    success:res=>{
								        if(!res.data.map(o=>o.data).some(o=>o.nickName==registerdata.nickName)){
								            userInfo.add({
								                data:{
								                    data:registerdata
								                },
								                success:(res)=> {
													console.log(res._id)
								                }
								            })
								        }
								    }
								});
								this.msg = '登录成功'
								this.$refs.popupmsg.open();
								setTimeout(()=>{
									this.$refs.popupmsg.close();
									wx.navigateBack({
										delta:1,
									})
								},1000);
							}
					    }
					})
				}
			},
			register(data){
				wx.navigateTo({
					url:'../register/main?phone='+data
				});
			}
		}
	}
</script>

<style>
	@import './index.css';
</style>
