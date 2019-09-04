import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// IOS地图和微信浏览器拖动问题
export function handlerTouchMove(e) {
  e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
}
export default new Vuex.Store({
  state: {
    loadingState: false,
    bodyTouchMove: true,
    ccPos: {} // 曹操专车位置信息
  },
  mutations: {
    // IOS下微信浏览器body是否允许滚动
    setBodyTouchMove(state, enable) {
      state.bodyTouchMove = enable
      if (enable) {
        document.body.addEventListener('touchmove', handlerTouchMove, {passive: false}); //passive 参数不能省略，用来兼容ios和android
      }else {
        document.body.removeEventListener('touchmove', handlerTouchMove, {passive: false}); //passive 参数不能省略，用来兼容ios和android
      }
    },
    setCCPos(state,pos) {
      state.ccPos = pos
    },
    setLoadingState(state,loading) {
      state.loadingState = loading
    }
  }
})
