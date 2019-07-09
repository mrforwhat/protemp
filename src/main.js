import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store'
import Fastclick from 'fastclick'
import 'lib-flexible/flexible'
import '@css/variables.scss'
Fastclick.attach(document.body)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
