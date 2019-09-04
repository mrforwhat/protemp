import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store'
import Fastclick from 'fastclick'
import request from '@/utils/request.js'
import {Lazyload, Loadmore, Toast} from 'mint-ui'
// require styles
import 'lib-flexible/flexible'
import '@css/normalize.css'
import "mint-ui/lib/style.css"
import '@css/common.scss'
import '@css/variables.scss'
import appHeader from '@/components/appHeader'

Fastclick.attach(document.body)
Vue.config.productionTip = false
Vue.component('appHeader', appHeader)
Vue.use(request)
Vue.use(Lazyload)
Fastclick.attach(document.body)
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
};
Vue.prototype.$toast = function (text, time) {
  Toast({
    message: text,
    duration: time || 2000
  })
}
Vue.prototype.$openLoading = function () {
  this.$store.commit('setLoadingState', true)
}
Vue.prototype.$closeLoading = function () {
  this.$store.commit('setLoadingState', false)
}
Vue.config.productionTip = false
// 重写loadMore,handleTouchEnd方法，解决ios上拉触发点击事件
Loadmore.methods.handleTouchEnd = function handleTouchEnd(event) {
  if (this.direction === 'down' && this.getScrollTop(this.scrollEventTarget) === 0 && this.translate > 0) {
    event.stopPropagation()
    event.preventDefault()
    this.topDropped = true;
    if (this.topStatus === 'drop') {
      this.translate = '50';
      this.topStatus = 'loading';
      this.topMethod();
    } else {
      this.translate = '0';
      this.topStatus = 'pull';
    }
  }
  if (this.direction === 'up' && this.bottomReached && this.translate < 0) {
    event.stopPropagation()
    event.preventDefault()
    this.bottomDropped = true;
    this.bottomReached = false;
    if (this.bottomStatus === 'drop') {
      this.translate = '-50';
      this.bottomStatus = 'loading';
      this.bottomMethod();
    } else {
      this.translate = '0';
      this.bottomStatus = 'pull';
    }
  }
  this.$emit('translate-change', this.translate);
  this.direction = '';
}
console.log(process.env)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
