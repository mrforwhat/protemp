<template>
    <div class="page">
        <div class="page-header">
            <app-header :pageTitle="$route.meta.title"></app-header>
        </div>
        <div class="page-container">详情测试页面</div>
    </div>
</template>

<script>
  export default {
    name: "testDetail",
    components: {
    },
    data() {
      return {
      }
    },

    mounted() {
    },
    methods: {
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
</style>
