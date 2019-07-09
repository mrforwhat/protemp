<template>
    <div id="app">
        <router-view/>
    </div>
</template>
<script>
  export default {
    created() {
      // 解决微信浏览器键盘弹回后页面被顶上去问题
      document.addEventListener("focusout", () => {
        document.body.scrollTop = document.body.scrollHeight;
      })
    }
  }
</script>
<style lang="scss" scoped>

</style>
