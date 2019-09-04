<template>
    <div id="app">
        <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
        <loading ref="custLoading" v-model="showIndicator"></loading>
    </div>
</template>
<script>
  import loading from '@/components/loading/index'
  export default {
    components: {
      loading
    },
    data() {
      return {
        showIndicator: false
      }
    },
    created() {
      // 解决微信浏览器键盘弹回后页面被顶上去问题
      document.addEventListener("focusout", () => {
        document.body.scrollTop = document.body.scrollHeight;
      })
    },
    watch: {
      '$store.state.loadingState': function(val){
        this.showIndicator = val
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
