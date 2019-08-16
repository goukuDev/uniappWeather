<template>
	<div class="changepassword">
		<div class="box">
			<input type="text" v-model="phone" placeholder="手机号">
			<input type="password" v-model="password" placeholder="输入新密码">
			<input type="password" v-model="submitpassword" placeholder="确认新密码">
			<!-- <div class='checkmsg'>
				<input type="text" placeholder="验证码">
				<div>获取验证码</div>
			</div> -->
			<button class="chengebutton" @click="resetpassword">重置密码</button>
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
	import {uniPopup} from "@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue";
	export default{
		data(){
			return{
				phone:'',
				password:'',
				submitpassword:'',
				msg:''
			}
		},
		components:{
			uniPopup
		},
		methods:{
			resetpassword(){
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
					this.msg = '请输入新密码'
					this.$refs.popupmsg.open();
					setTimeout(()=>{
						this.$refs.popupmsg.close();
					},1000);
					return;
				}else if(this.submitpassword==''){
					this.msg = '请确认新密码'
					this.$refs.popupmsg.open();
					setTimeout(()=>{
						this.$refs.popupmsg.close();
					},1000);
					return;
				}else if(this.submitpassword!=this.password){
					this.msg = '两次密码不一致'
					this.$refs.popupmsg.open();
					setTimeout(()=>{
						this.$refs.popupmsg.close();
					},1000);
					return;
				}else{
					let resetdata = {
						password:this.password,
					}
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
											wx.navigateTo({
												url:'../register/main?phone='+this.phone
											});
										}
									}
								})
					        }else{
								account.doc(res.data.filter(o=>o.data.phone==this.phone)[0]._id).update({
									data:{
										data:resetdata
									},
									success:res=>{
										this.msg = '密码重置完成,请登录'
										this.$refs.popupmsg.open();
										setTimeout(()=>{
											this.$refs.popupmsg.close();
											wx.navigateBack({
												delta:1
											})
										},1000);
									}
								})
							}
					    }
					})
				}
			}
		}
	}
</script>

<style>
	@import './index.css';
</style>
