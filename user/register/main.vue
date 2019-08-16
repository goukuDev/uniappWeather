<template>
	<div class="register">
		<div class="box">
			<input type="text" v-model="name" placeholder="姓名">
			<input type="text" v-model="phone" placeholder="手机号">
			<input type="password" v-model="password" placeholder="登录密码">
			<!-- <div class='checkmsg'>
				<input type="text" placeholder="验证码" v-model="yzmmsg">
				<div>获取验证码</div>
			</div> -->
			<button class="registerbutton" @click="register">注册</button>
		</div>
		<uni-popup ref="popup" type="center">{{msg}}</uni-popup>
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
				name:'',
				phone:'',
				password:'',
				yzmmsg:'',
				msg:''
			}
		},
		components:{
			uniPopup
		},
		onLoad(data) {
			if(!!(/^1[3456789]\d{9}$/.test(data.phone)))
				this.phone = data.phone;
		},
		methods:{
			register(){
				if(this.name==''){
					this.msg = '姓名不能为空'
					this.$refs.popup.open();
					setTimeout(()=>{
						this.$refs.popup.close();
					},1000);
					return;
				}else if(this.phone==''){
					this.msg = '手机号不能为空'
					this.$refs.popup.open();
					setTimeout(()=>{
						this.$refs.popup.close();
					},1000);
					return;
				}else if(!(/^1[3456789]\d{9}$/.test(this.phone))){
					this.msg = '手机号有误,请重新填写'
					this.$refs.popup.open();
					setTimeout(()=>{
						this.$refs.popup.close();
					},1000);
					return;
				}
				else if(this.password==''){
					this.msg = '密码不能为空'
					this.$refs.popup.open();
					setTimeout(()=>{
						this.$refs.popup.close();
					},1000);
					return;
				}else{
					let registerdata = {
						name:this.name,
						phone:this.phone,
						password:this.password
					}
					account.get({
					    success:res=>{
							// 没有历史结果就保存
					        if(!res.data.map(o=>o.data).some(o=>o.phone==registerdata.phone)){
					            account.add({
					                data:{
					                    data:registerdata
					                },
					                success:(res)=> {
										this.msg = '注册完成,请返回登录'
										this.$refs.popup.open();
										setTimeout(()=>{
											this.$refs.popup.close();
											wx.navigateBack({
											  delta: 1
											});
										},1000);
					                }
					            })
					        }else{
								this.msg = '该手机号已经注册过，请直接登录'
								this.$refs.popup.open();
								setTimeout(()=>{
									this.$refs.popup.close();
									wx.navigateBack({
									  delta: 1
									});
								},1500);
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
