<template>
  <div class="page">
    <div class="page-header">
      <i class="iconfont icon-arrow-left" @click="$router.back()"></i>
      <span class="page-header-title">确认用车</span>
    </div>
    <transition enter-active-class="slideInUp" leave-active-class="slideOutDown">
      <div class="page-footer travel animated" v-show="showPanel">
        <div class="travel-type">
          <h3>{{carTypeMap[carType]}}</h3>
        </div>
        <div class="grid">
          <div class="grid-row">
            <div class="grid-col">
              <img class="carImg" src="../../assets/img/car/model.png" alt="">
            </div>
            <div class="grid-col">
              <p class="travel-fee">预估费用</p>
              <p class="travel-fee"><span>{{orderInfo.price/100}}</span>积分</p>
            </div>
          </div>
        </div>
        <div class="travel-change" @click="changePassengers">
          <span class="travel-user">更换乘车人</span>
          <i class="iconfont icon-arrow-right"></i>
        </div>
        <div class="travel-action" @click="payOrder">立即叫车</div>
      </div>
    </transition>

    <div id="mapContainer"></div>
    <passenger v-model="showPassenger" @confirmPassenger="confirmPassenger"></passenger>
  </div>
</template>

<script>
  // import axios from 'axios'
  // import {randomNum} from '@/utils/randomNum'
  import passenger from '@/components/service/passenger/index'

  export default {
    name: "taketaxiOrder",
    components: {passenger: passenger},
    data() {
      return {
        cust: JSON.parse(localStorage.getItem('cust')),
        fromPos: '',
        toPos: '',
        map: null,
        showWait: false,
        showPanel: false,
        stationMarkers: [],
        orderInfo: {
          price: 0,
          duration: 0
        },
        estimateTime: '',
        priceKey: '',
        passengerName: '',
        mobile: '',
        showPassenger: false,
        carType: 2,
        carTypeMap: {
          2: '新能源',
          3: '舒适',
          4: '豪华',
          5: '商务'
        }
      }
    },
    async mounted() {
      this.showPanel = true
      this.carType = this.$route.query.carType
      this.passengerName = this.cust.nickName
      this.mobile = this.cust.tel
      let ccPos = this.$store.state.ccPos
      if (!Object.values(ccPos).length) {
        this.$router.push({
          name: "taketaxiHome"
        })
        return
      }
      this.fromPos = ccPos.fromPos
      this.toPos = ccPos.toPos
      this.estimateTime = ccPos.estimateTime
      this.from = ccPos.from
      this.to = ccPos.to
      let map = new window.AMap.Map('mapContainer', {
        resizeEnable: true,
        zoom: 20
      });
      window.AMap.plugin('AMap.ToolBar', function () {//异步加载插件
        var toolbar = new window.AMap.ToolBar({
          position: 'RT'
        });
        map.addControl(toolbar);
      });
      this.map = map
      this.map.on('complete', () => {
        let startIcon = new window.AMap.Icon({
          size: new window.AMap.Size(19, 31),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
          imageSize: new window.AMap.Size(19, 31),
          imageOffset: new window.AMap.Pixel(0, 0)
        })
        let endIcon = new window.AMap.Icon({
          size: new window.AMap.Size(19, 31),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
          imageSize: new window.AMap.Size(19, 31),
          imageOffset: new window.AMap.Pixel(0, 0)
        })
        this.setStationMarker(this.map, startIcon, this.fromPos)
        this.setStationMarker(this.map, endIcon, this.toPos)

        this.map.setFitView()
      })
      await this.getEstimatePrice()
      let style = {
        'padding': '10px 15px',
        'margin-bottom': '10px',
        'border-radius': '15px',
        'background-color': 'white',
        'border-width': 0,
        'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
        'text-align': 'center',
        'font-size': '14px',
        'color': '#ff5d1b'
      }
      if (this.estimateTime) {
        this.setTextMarker(this.map, `${this.estimateTime}分钟后上车`, style, this.fromPos)
      }
      this.setTextMarker(this.map, `约${(this.orderInfo.duration / 60).toFixed(1)}分钟到达`, style, this.toPos)
    },
    methods: {
      confirmPassenger(passenger) {
        if (passenger.username === '自己') {
          this.passengerName = ''
        } else {
          this.passengerName = passenger.username
        }
        this.mobile = passenger.mobile
      },
      changePassengers() {
        this.showPassenger = true
      },
      async payOrder() {
        this.$openLoading()
        let rs = await this.$post('/api/caocao/order', {
          "fromLongitude": this.fromPos[0],
          "fromLatitude": this.fromPos[1],
          "toLongitude": this.toPos[0],
          "toLatitude": this.toPos[1],
          "carType": this.carType,
          "orderType": 1,
          "estimatePriceKey": this.priceKey,
          "startName": this.from,
          "endName": this.to,
          "passengerPhone": this.mobile,
          "passengerName": this.passengerName
        })
        this.$closeLoading()
        if (rs.status === 200) {
          console.log(rs)
          this.$router.push({
            name: 'taketaxiTrack',
            query: {
              orderNo: rs.payload
            }
          })
        } else {
          this.$toast(rs.error)
        }
      },

      setTextMarker(map, text, style, pos) {
        // 创建纯文本标记
        let txt = new window.AMap.Text({
          text: text,
          anchor: 'center', // 设置文本标记锚点
          draggable: true,
          cursor: 'pointer',
          angle: 0,
          style: style,
          position: pos,
          offset: new window.AMap.Pixel(0, -50)
        });

        txt.setMap(map);
      },
      async getEstimatePrice() {
        this.$openLoading()
        let rs = await this.$post('/api/caocao/estimate/price', {
          "fromLatitude": this.fromPos[1],
          "fromLongitude": this.fromPos[0],
          "toLatitude": this.toPos[1],
          "toLongitude": this.toPos[0],
          "carType": this.carType,
          "orderType": 1
        })
        this.$closeLoading()
        if (rs.status === 200) {
          this.orderInfo = rs.payload[0]
          this.priceKey = this.orderInfo.priceKey
        } else {
          this.$toast(rs.error)
        }
      },
      // 起止点标记
      setStationMarker(map, icon, pos) {
        let marker = new window.AMap.Marker({
          position: pos,
          icon: icon
        })
        this.stationMarkers.push(marker)
        map.add(marker)
      }
    },
    watch: {
      showPassenger(val) {
        if (val) {
          this.showPanel = false
        } else {
          this.showPanel = true
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '@css/module/grid.scss';

  .grid-row {
    padding: 27px 0;
    border-bottom: 2px solid $line-color;
  }

  #mapContainer {
    width: 100%;
    height: 100vh;
  }

  .page {
    /deep/ .amap-geolocation-con {
      bottom: 100px;
    }

    &-header {
      top: 0;
      padding: 0 20px;
      height: 88px;
      font-size: 28px;
      color: #fff;
      background: #262626;
      display: flex;
      align-items: center;

      .icon-arrow-left {
        color: #fff;
        display: inline-block;
        font-size: 30px;
        width: 40px;
        height: 40px;
        line-height: 40px;
        flex: none;
      }

      &-title {
        margin-left: 20px;
      }
    }

    &-tab {
      position: absolute;
      z-index: 1;
      left: 150px;
      right: 150px;
      top: 30px;
      height: 100px;
      font-size: 30px;
      display: flex;
      background: #fff;
      border-radius: 55px;
      white-space: nowrap;
      overflow-x: scroll;
      padding: 20px;
      border: 1px solid $default-color;

      &-item {
        line-height: 60px;
        flex-grow: 1;
        margin: 0 15px;

        &.active {
          border-bottom: 2px solid $warning-color;
        }
      }
    }

    &-footer {
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      z-index: 1000;
    }
  }

  .travel {
    &-type {
      text-align: center;
      font-size: 26px;
      color: #222;
      margin-top: 30px;
    }

    &-change {
      text-align: center;
      padding: 30px;
      font-size: 28px;
      color: #f03e3a;
    }

    &-user {
      margin-right: 10px;
    }

    &-fee {
      font-size: 28px;
      color: #222;
      margin-bottom: 20px;

      &:last-child {
        color: #f03e3a;
      }

      span {
        font-size: 48px;
        margin-right: 8px;
      }
    }

    &-action {
      height: 86px;
      line-height: 88px;
      text-align: center;
      color: #fff;
      font-family: PingFang-SC-Bold;
      font-size: 32px;
      background-color: #f03e3a;
    }
  }

  .carImg {
    width: 226px;
    height: 123px;
    margin-left: 150px;
    margin-right: -62px;
  }
</style>
