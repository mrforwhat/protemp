import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store'
import Fastclick from 'fastclick'
import request from '@/utils/request.js'

// require styles
import 'lib-flexible/flexible'
import '@css/normalize.css'
import '@css/common.scss'
import '@css/variables.scss'

import appHeader from '@/components/appHeader'

// common component
// mand-mobile通过babel-plugin-import引入，toast按需引入
import {Toast} from 'mand-mobile'
Vue.component('appHeader', appHeader)
Vue.prototype.$toast = Toast
Vue.prototype.$openLoading = function () {
  this.$store.commit('setLoadingState', true)
}
Vue.prototype.$closeLoading = function () {
  this.$store.commit('setLoadingState', false)
}

// config
Fastclick.attach(document.body)
Vue.config.productionTip = false
Vue.use(request)

// compatibility
// 解决ios input点击多次
Fastclick.prototype.focus = function (targetElement) {
  var length;
  var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;
  var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
  // Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
  if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
    length = targetElement.value.length;
    targetElement.focus();
    targetElement.setSelectionRange(length, length);
  } else {
    targetElement.focus();
  }
}

console.log(process.env)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
