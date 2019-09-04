<template>
    <div>
        <router-view></router-view>
    </div>
</template>

<script>

  export default {
    name: "root",
    created() {
      this.$store.commit('setBodyTouchMove',true)
    },
    destroyed() {
      this.$store.commit('setBodyTouchMove',false)
    },
  }
</script>

<style scoped>

</style>
