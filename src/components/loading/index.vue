<template>
    <div class="loader" v-show="showIndicator">
        <div class="loader-wrap">
            <div class="loader-atom"></div>
        </div>
        <div class="loader-mask"></div>
    </div>
</template>

<script>
  export default {
    name: "loading",
    props: {
      value: {
        default: false
      }
    },
    data() {
      return {
        showIndicator: false
      }
    },
    methods: {
      open() {
        this.showIndicator = true
      },
      close() {
        this.showIndicator = false
      }
    },
    watch: {
      value(val) {
        this.showIndicator =val
      },
      showIndicator(val) {
        this.$emit('input',val)
      }
    }
  }
</script>

<style scoped lang="scss">
    .loader{
        &-wrap{
            position: fixed;
            z-index: 9998;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            text-align: center;
        }
        &-mask{
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            opacity: 0;
            background: transparent;
        }
    }

    .loader-atom {
        -webkit-transform: rotateZ(45deg);
        transform: rotateZ(45deg);
        -webkit-perspective: 1000px;
        perspective: 1000px;
        border-radius: 50%;
    }

    .loader-atom:before,
    .loader-atom:after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: inherit;
        height: inherit;
        border-radius: 50%;
        -webkit-animation: 1s spin linear infinite;
        animation: 1s spin linear infinite;
    }

    .loader-atom:before {
        -webkit-transform: rotateX(70deg);
        transform: rotateX(70deg);
    }

    .loader-atom:after {
        -webkit-transform: rotateY(70deg);
        transform: rotateY(70deg);
        -webkit-animation-delay: .4s;
        animation-delay: .4s;
    }

    [class*="loader-atom"] {
        display: inline-block;
        width: 100px;
        height: 100px;
        vertical-align: middle;
        pointer-events: none;
        color: $warning-color;
        font-size: 60px;
    }

    @keyframes spin {
        0%, 100% {
            box-shadow: .2em 0px 0 0px currentcolor;
        }
        12% {
            box-shadow: .2em .2em 0 0 currentcolor;
        }
        25% {
            box-shadow: 0 .2em 0 0px currentcolor;
        }
        37% {
            box-shadow: -.2em .2em 0 0 currentcolor;
        }
        50% {
            box-shadow: -.2em 0 0 0 currentcolor;
        }
        62% {
            box-shadow: -.2em -.2em 0 0 currentcolor;
        }
        75% {
            box-shadow: 0px -.2em 0 0 currentcolor;
        }
        87% {
            box-shadow: .2em -.2em 0 0 currentcolor;
        }
    }
</style>
