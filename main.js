import Vue from 'vue'
import App from './App'
import store from 'store/index.js'


import qqMap from './static/js/qqmap-wx-jssdk.js';
const qqmapsdk = new qqMap({
        key: 'N6JBZ-PVUCV-KJVPE-UYY2R-LZDHZ-DBFKL' //自己的key秘钥 http://lbs.qq.com/console/mykey.html 在这个网址申请
      });
Vue.prototype.qqmapsdk = qqmapsdk;


Vue.config.productionTip = false
App.mpType = 'app'


const app = new Vue({
  store,
  render: h => h(App)
})
app.$mount()