<template>
    <transition enter-active-class="slideInUp" leave-active-class="slideOutDown">
        <div class="passenger animated" v-show="showPassenger">
            <div class="passenger-header">
                <div class="passenger-row">
                    <div class="passenger-key" @click="cancel">
                        取消
                    </div>
                    <div class="passenger-val">更换乘车人</div>
                    <div class="passenger-confirm" @click="confirm">确认</div>
                </div>
            </div>
            <div class="passenger-container" ref="container">
                <div class="passenger-box">
                    <div class="cell">
                        <div class="cell-row cell-row_border">
                            <div class="cell-key">
                                <img src="../../../assets/img/car/person.png" alt="">
                            </div>
                            <div class="cell-val">
                                <input type="text" maxlength="10" v-model="username" placeholder="乘车人姓名">
                            </div>
                        </div>
                        <div class="cell-row">
                            <div class="cell-key">
                                <img src="../../../assets/img/car/tel.png" alt="">
                            </div>
                            <div class="cell-val">
                                <input type="tel" v-model="mobile" maxlength="11" placeholder="乘车人手机号码">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="history" v-if="passengerList.length">
                    <p>历史乘车人</p>
                    <div class="cell-row" v-for="(item,index) in passengerList" :key="index" @click="autoAdd(item)">
                        <div class="cell-key cell-key_auto">{{item.username}}</div>
                        <div class="cell-val">{{item.mobile}}</div>
                    </div>
                </div>

            </div>
        </div>
    </transition>
</template>

<script>
  export default {
    name: "passenger",
    props: {
      value: {
        default: false
      }
    },
    data() {
      return {
        cust: JSON.parse(localStorage.getItem('cust')),
        showPassenger: false,
        username: '',
        mobile: '',
        passengerList: []
      }
    },
    methods: {
      autoAdd(item) {
        this.username = item.username
        this.mobile = item.mobile
      },
      confirm() {
        let passengers = localStorage.getItem('passengerList')
        if (this.username || this.mobile) {
          if (!passengers) {
            localStorage.setItem('passengerList', JSON.stringify([{
              id: Date.now(),
              username: this.username,
              mobile: this.mobile
            }]))
          } else {
            let passengerList = JSON.parse(passengers)
            let repeatPassenger = null
            passengerList.forEach((item) => {
              if (item.username === this.username && item.mobile === this.mobile) {
                repeatPassenger = item
              }
            })
            if (!repeatPassenger) {
              if (passengerList.length < 5) {
                passengerList.push({
                  id: Date.now(),
                  username: this.username,
                  mobile: this.mobile
                })
              }
              if (passengerList.length === 5) {
                passengerList.push({
                  id: Date.now(),
                  username: this.username,
                  mobile: this.mobile
                })
                passengerList.shift()
              }
              localStorage.setItem('passengerList', JSON.stringify(passengerList))
            }
          }
        }

        this.cancel()
        this.$emit('confirmPassenger', {
          username: this.username,
          mobile: this.mobile
        })
      },
      cancel() {
        this.showPassenger = false
      }
    },
    watch: {
      value(val) {
        this.showPassenger = val
        if (val) {
          let passengers = localStorage.getItem('passengerList')
          if (passengers) {
            this.passengerList = JSON.parse(passengers)
          } else if(this.cust){
            this.passengerList.push({
                id: this.cust.id,
                username: '自己',
                mobile: this.cust.tel
            })
          }
        }
      },
      showPassenger(val) {
        this.$emit('input', val)
      },
    }
  }
</script>

<style scoped lang="scss">
    @import '@css/module/cell.scss';

    .tips {
        padding-left: 20px;
        color: #999;
    }

    .cell {
        &-row {
            padding: 12px 30px;
        }

        &-key {
            width: initial;
            margin-right: 20px;

            img {
                width: 54px;
            }
        }
    }

    .history {
        border-top: 2px solid $line-color;
        background: #fff;
        padding-left: 30px;

        p {
            padding: 20px 20px 20px 0;
            color: #999;
        }

        .cell-row {
            padding: 10px 0;
            border-bottom: 2px solid $line-color;

            &:last-child {
                border-bottom: none;
            }
        }
    }

    .passenger {
        position: absolute;
        z-index: 10001;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fff;

        &-header {
        }

        &-container {
            -webkit-overflow-scrolling: touch;
            overflow-y: scroll;
            background: #f2f2f2;
        }

        &-row {
            display: flex;
            align-items: flex-end;
            font-size: 26px;
            padding: 24px 28px;
        }

        &-key {
            margin-right: 20px;
        }

        &-val {
            flex-grow: 1;
            font-size: 32px;
            text-align: center;
        }

        &-confirm {
            color: #f03e3a;
            margin-left: 20px;
        }

        &-box {
            background: #fff;
        }

        input {
            height: 55px;
            line-height: 55px;
            font-size: 30px;
        }

        .icon-arrow-left {
            font-size: 30px;
        }
    }
</style>
