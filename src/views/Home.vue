<template>
  <div class="page">
    <app-header :pageTitle="$route.query.title"></app-header>
    <welcome></welcome>
  </div>
</template>

<script>
import welcome from '@/components/welcome'
export default {
  name: 'home',
  components: {
    welcome
  }
}
</script>
<style lang="scss" scoped>
  .page{

  }
</style>
