<template>
    <transition enter-active-class="slideInRight" leave-active-class="slideOutRight">
        <div class="modform animated" v-show="showForm">
            <div class="modform-header">
                <div class="modform-header-action" @click="close">
                    <span>关闭</span>
                </div>
                <div class="modform-sure" @click="save">保存</div>
                {{modTitle}}
            </div>
            <div class="modform-container">
               <slot></slot>
            </div>
        </div>

    </transition>
</template>

<script>
  export default {
    name: "singleForm",
    props: {
      value: {
        default: false
      },
      form: {
        type: Object
      },
      modTitle: {
        default: '修改信息'
      }
    },
    data() {
      return {
        showForm: false,
      }
    },
    methods: {
      close() {
        this.showForm = false
      },
      save () {
        this.close()
        this.$emit('confirmForm')
      }
    },
    watch: {
      value(val) {
        this.showForm = val
      },
      showForm(val) {
        this.$emit('input', val)
      }
    }
  }
</script>

<style scoped lang="scss">
    @import "@css/module/cell.scss";
    .modform {
        overflow: hidden;
        position: absolute;
        z-index: 10001;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        &-header {
            border-bottom: 2px solid #ebebeb;
            background-color: #f03e3a;
            height: 88px;
            line-height: 88px;
            padding: 0 26px;
            position: relative;
            text-align: center;
            font-size: 30px;
            color: #fff;

            &-action {
                position: absolute;
                left: 26px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 30px;
                color: #fff;
            }
        }

        &-sure {
            position: absolute;
            right: 26px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 30px;
            color: #fff;
            line-height: 1;
            padding: 10px 20px;
            border: 2px solid #fff;
            border-radius: 10px;
        }

        &-container {
            left: 0;
            right: 0;
            top: 96px;
            bottom: 0;
            position: absolute;
            z-index: 1;
            overflow: scroll;
            -webkit-overflow-scrolling: touch;
            background: #fff;
        }

        &-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1;
        }
    }
</style>
