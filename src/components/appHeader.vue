<template>
    <div class="appHeader" :class="[skin,showBorder?'showBorder':'']" >
        <div class="appHeader-action" @click="goBack" v-show="showBack">
            <i class="iconfont icon-arrow-left"></i>
            <span>返回</span>
        </div>
        {{pageTitle}}
        <slot name="custActionRight"></slot>
    </div>
</template>

<script>
  export default {
    name: "appHeader",
    props: {
      pageTitle: {
        type: String,
        default: '兜有'
      },
      backRoute: {
        type: String,
        default: ''
      },
      skin: {
        type: String,
        default: ''
      },
      showBorder: {
        type: Boolean,
        default: true
      },
      showBack: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      goBack() {
        if(this.backRoute) {
          this.$router.replace({
            name: this.backRoute
          })
        }else {
          this.$router.back()
        }
      }
    }
  }
</script>

<style scoped lang="scss">
    .appHeader{
        background: #f03e3a;
        height: 96px;
        line-height: 96px;
        padding: 0 26px;
        position: relative;
        text-align: center;
        font-size: 36px;
        color: #fff;
        &.showBorder{
            border-bottom: 2px solid #ebebeb;
        }
        &.danger{
            background: #f03e3a;
        }
        &.danger-deep{
            background: #fa3030;
        }
        &.white{
            background: #fff;
            color: #222;
            span {
                color: #222;
            }
            i {
                color: #222;
            }
        }
        &-action{
            position: absolute;
            left: 26px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 30px;
            color: #fff;
        }
    }

    i{
        font-size: 30px;
    }
</style>
