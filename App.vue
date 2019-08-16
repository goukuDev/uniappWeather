<script>
import vuex from './static/js/store.js';
export default {
	onLaunch () {
		if (wx.canIUse('getUpdateManager')) {
			const updateManager = wx.getUpdateManager()
			updateManager.onCheckForUpdate(function (res) {
				// 请求完新版本信息的回调
				if (res.hasUpdate) {
				  updateManager.onUpdateReady(function () {
					wx.showModal({
					  title: '更新提示',
					  content: '新版本已经准备好，是否重启应用？',
					  success: function (res) {
						// res: {errMsg: "showModal: ok", cancel: false, confirm: true}
						if (res.confirm) {
						  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						  updateManager.applyUpdate()
						}
					  }
					})
				  })
				  updateManager.onUpdateFailed(function () {
					// 新的版本下载失败
					wx.showModal({
					  title: '已经有新版本了哟~',
					  content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
					})
				  })
				}
			})
		}else {
			wx.showModal({
				title: '提示',
				content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
			})
		}
	},
}
</script>

<style>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
}
page{
  width:100%;
  height:100%;
}
/* this rule will be remove */
* {
  transition: width 2s;
  -moz-transition: width 2s;
  -webkit-transition: width 2s;
  -o-transition: width 2s;
}
</style>
