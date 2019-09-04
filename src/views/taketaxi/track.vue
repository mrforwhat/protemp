<template>
    <div class="page">
        <div class="page-header">
            <i class="iconfont icon-arrow-left" @click="$router.back()"></i>
            {{title}}
            <span class="page-header-title"></span>
            <span @click="cancelOrder" v-if="isCancel">取消行程</span>
        </div>
        <!--<div class="page-tab">-->
        <!--<div class="page-tab-item"-->
        <!--v-for="(tab,index) in tabList" :key="index"-->
        <!--@click="tabChange(tab)"-->
        <!--:class="{'active':tab.id === currentTab.id}">-->
        <!--{{tab.name}}-->
        <!--</div>-->
        <!--</div>-->
        <div class="page-footer travel">
            <div class="travel-tips" v-if="driverInfo.name&&showTips">预约成功，司机将在出发前30分钟赶往上车点</div>
            <div class="driver" v-if="driverInfo.name">
                <div class="driver-info">
                    <div class="driver-avatar">
                        <!--<img :src="tempDriverImg" alt="">-->
                        <img :src="driverInfo.avatar" alt="">
                    </div>
                    <div class="driver-basis">
                        <p class="driver-name">{{driverInfo.name}} {{driverInfo.card}}</p>
                        <div class="driver-car">
                            <span>{{driverInfo.color}}</span>
                            <span>{{driverInfo.carType}}</span>
                        </div>
                        <!--<div class="driver-tel">-->
                            <!--<i class="iconfont icon-tel-line"></i>-->
                            <!--<a :href="'tel:' + driverInfo.phone">{{driverInfo.phone}}</a>-->
                        <!--</div>-->
                    </div>
                    <div class="driver-action">
                        <a :href="'tel:' + driverInfo.phone" class="driver-action-item">
                            <img src="../../assets/img/car/tel.png" alt="">
                            <p>打电话</p>
                        </a>
                        <!--<div class="driver-action-item">-->
                            <!--<img src="../../assets/img/car/change.png" alt="">-->
                            <!--<p>更换地址</p>-->
                        <!--</div>-->
                    </div>
                </div>
            </div>
            <div class="travel-status" v-if="startWait">
                <div class="travel-status-name">
                    {{status}}
                    <span v-if="startWait">，您已等待{{waitTime}}</span>
                </div>
            </div>
        </div>
        <div id="mapContainer"></div>
    </div>
</template>

<script>
  import {MessageBox} from 'mint-ui'

  export default {
    name: "taketaxiTrack",
    components: {
    },
    data() {
      return {
        title: '等待接驾',
        tempDriverImg: '//static.lianhaikeji.com/lib/imgs/default-head.png',
        showDialog: false,
        tabList: [{
          name: '新能源',
          id: 2
        }, {
          name: '舒适',
          id: 3
        }, {
          name: '豪华',
          id: 4
        }, {
          name: '商务',
          id: 5
        }],
        currentTab: {
          name: '新能源',
          id: 2
        },
        wayList: [{
          name: '现在',
          id: 1
        }, {
          name: '预约',
          id: 2
        }, {
          name: '接机',
          id: 3
        }, {
          name: '送机',
          id: 4
        }],
        currentWay: {
          name: '现在',
          id: 1
        },
        fromPos: '',
        toPos: '',
        map: null,
        showWait: false,
        driverMessageBox: false,
        showMessageBox: false,
        stationMarkers: [],
        orderMap: {},
        orderInfo: {},
        driverInfo: {
          name: ''
        },
        estimateTime: '',
        priceKey: '',
        orderNo: '',
        orderTime: '',
        timer: null, // 轮训订单定时器 3s一次
        waitTimer: null, // 等待时间定时器 1s一次
        fitviewTimer: null, // 自适应地图定时器 30s一次
        routeLineTimer: null, // 规划路线定时器 60s 一次
        waitTime: '',
        showTips: false, // 司机接单提示
        startWait: false, // 开始等待叫车
        beginMark: false, // 开始标记起止位置
        driverBeginMove: false, // 司机开始移动
        driverArrived: false,
        countPrice: false, // 开始计价
        positionInfo: {},
        lineArr: [],
        driverBeginPoint: [], // 司机开始点
        driverMarker: null, // 司机标记点
        driving: null, //规划路线实例
        driverRouteLine: null, // 司机拒您的位置路线
        routeLine: null, // 行驶路线
        isCancel: true,
        status: ''
      }
    },
    async mounted() {
      this.lineArr = []
      this.orderNo = this.$route.query.orderNo
      let map = new window.AMap.Map('mapContainer', {
        resizeEnable: true,
        zoom: 20
      });
      window.AMap.plugin(['AMap.Driving', 'AMap.ToolBar'], () => {//异步加载插件
        var toolbar = new window.AMap.ToolBar({
          position: 'RT'
        });
        map.addControl(toolbar);
        //构造路线导航类
        this.driving = new window.AMap.Driving({
          map: this.map
        });
      });
      this.map = map
      this.map.on('complete', () => {

      })
      this.requestOrderByCircle()
      // await this.getEstimatePrice()
      // let style =   {
      //   'padding': '10px 15px',
      //   'margin-bottom': '10px',
      //   'border-radius': '15px',
      //   'background-color': 'white',
      //   'border-width': 0,
      //   'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
      //   'text-align': 'center',
      //   'font-size': '14px',
      //   'color': '#ff5d1b'
      // }
      // this.setTextMarker(this.map, `${this.estimateTime}分钟后上车`, style, this.fromPos)
      // this.setTextMarker(this.map, `约${(this.orderInfo.duration/60).toFixed(1)}分钟到达`, style, this.toPos)
    },
    destroyed() {
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
    methods: {
      async cancelOrder() {
        this.$openLoading()
        let rs = await this.$post('/api/caocao/order/cancel', {
          "orderId": this.orderNo,
          "cancelCode": 1,
          "cancelReason": "行程有变化"
        })
        this.$closeLoading()
        if (rs.status === 200) {
          this.$toast('订单取消成功')
          this.$router.push({
            name: 'taketaxiHome'
          })
        } else {
          this.$toast(rs.error)
        }
      },
      // 绘制司机拒您的位置路线
      drawDriverRoute(route) {
        let path = this.parseRouteToPath(route)

        this.driverRouteLine = new window.AMap.Polyline({
          path: path,
          isOutline: true,
          outlineColor: '#ffeeee',
          borderWeight: 2,
          strokeWeight: 5,
          strokeColor: '#0091ff',
          lineJoin: 'round'
        })

        this.driverRouteLine.setMap(this.map)

        // 调整视野达到最佳显示区域
        this.map.setFitView([...this.stationMarkers, this.driverRouteLine])
      },
      drawRoute(route) {
        let path = this.parseRouteToPath(route)

        this.routeLine = new window.AMap.Polyline({
          path: path,
          isOutline: true,
          outlineColor: '#ffeeee',
          borderWeight: 2,
          strokeWeight: 5,
          strokeColor: '#0091ff',
          lineJoin: 'round'
        })

        this.routeLine.setMap(this.map)

        // 调整视野达到最佳显示区域
        this.map.setFitView([...this.stationMarkers, this.driverMarker, this.routeLine])
      },
      parseRouteToPath(route) {
        let path = []

        for (let i = 0, l = route.steps.length; i < l; i++) {
          let step = route.steps[i]

          for (let j = 0, n = step.path.length; j < n; j++) {
            path.push(step.path[j])
          }
        }

        return path
      },
      requestOrderByCircle() {
        this.getOrderState()
        if (!this.timer) {
          this.timer = setInterval(this.getOrderState, 3000)
        }
      },

      async getOrderState() {
        let rs = await this.$get(`/api/caocao/current/order_state/${this.orderNo}`)
        if (rs.status === 200) {
          console.log(rs)
          this.orderMap = rs.payload
          this.orderInfo = rs.payload.orderInfo
          this.positionInfo = rs.payload.positionInfo
          this.driverInfo = this.orderInfo.driverInfoVo || {name: ''}
          if(this.driverInfo.avatar) {
            if(!/^https:/.test(this.driverInfo.avatar)) {
              // ios https图片才显示
              this.driverInfo.avatar = this.driverInfo.avatar.replace(/http/,'https')
            }
          }
          this.fromPos = this.orderInfo.basicOrderVO.fromLocation
          this.toPos = this.orderInfo.basicOrderVO.toLocation
          this.orderTime = this.orderInfo.basicOrderVO.orderTime.replace(/-/g, '/')
          this.beginMark = true
          switch (this.orderInfo.basicOrderVO.status) {
            // 等待接单
            case 1:
              this.startWait = true
              this.status = '正在为您叫车'
              break;
            // 预约单接单
            case 2:
              this.status = '司机已接单'
              this.isCancel = true
              this.startWait = false
              this.showTips = true
              break;
            // 开始计价
            case 3: {
              this.title = '行程中'
              this.showTips = false
              this.status = '行驶中，正在计价...'
              this.startWait = false
              this.isCancel = false
              let lng = this.positionInfo.data.longitude
              let lat = this.positionInfo.data.latitude
              let driverPos = [lng, lat]
              if (!this.driverMarker) {
                let icon = new window.AMap.Icon({
                  size: new window.AMap.Size(32, 20),
                  // image: 'https://webapi.amap.com/images/car.png',
                  image: 'https://static.lianhaikeji.com/images/20190718/8b56855c611d4bb4a9948bf7be746b20.png',
                  imageSize: new window.AMap.Size(32, 20),
                  imageOffset: new window.AMap.Pixel(0, 0),

                })
                this.driverMarker = new window.AMap.Marker({
                  map: this.map,
                  position: driverPos,
                  icon: icon,
                  offset: new window.AMap.Pixel(-26, -13),
                  autoRotation: true,
                  angle: this.positionInfo.direction,
                });
              }
              if (!this.countPrice) {
                // 根据起终点经纬度规划驾车导航路线
                this.driving.search(driverPos, [this.toPos.lng, this.toPos.lat], (status, result) => {
                  if (status === 'complete') {
                    this.drawRoute(result.routes[0])

                    console.log('绘制驾车路线完成')
                  } else {
                    console.log('获取驾车数据失败：' + result)
                  }
                });
                this.map.setFitView([...this.stationMarkers, this.routeLine]);
                this.countPrice = true
              } else {
                if (this.driverMarker) {
                  this.driverMarker.moveTo(driverPos, 50)
                }
              }
              break;
            }
            // 系统取消
            case 4:
              this.startWait = false
              this.$toast(this.orderInfo.basicOrderVO.revokeReason)
              this.$router.push({
                name: 'taketaxiHome'
              })
              break;
            // 已评价,已评价和结束计费相同处理逻辑
            case 6: {
              this.showTips = false
              this.finishPrice()
              break;
            }
            // 结束计费
            case 7: {
              this.showTips = false
              this.finishPrice()
              break;
            }
            // 司机已接单
            case 9: {
              this.status = '司机已接单'
              this.isCancel = true
              this.startWait = false
              this.showTips = true
              let lng = this.positionInfo.data.longitude
              let lat = this.positionInfo.data.latitude
              let driverPos = [lng, lat]
              if (!this.driverBeginMove) {
                this.driverBeginMove = true
                if (!this.driverMarker) {
                  let icon = new window.AMap.Icon({
                    size: new window.AMap.Size(32, 20),
                    // image: 'https://webapi.amap.com/images/car.png',
                    image: 'https://static.lianhaikeji.com/images/20190718/8b56855c611d4bb4a9948bf7be746b20.png',
                    imageSize: new window.AMap.Size(32, 20),
                    imageOffset: new window.AMap.Pixel(0, 0),

                  })
                  this.driverMarker = new window.AMap.Marker({
                    map: this.map,
                    position: driverPos,
                    icon: icon,
                    offset: new window.AMap.Pixel(-26, -13),
                    autoRotation: true,
                    angle: this.positionInfo.direction,
                  });
                }

                // 根据起终点经纬度规划驾车导航路线
                this.driving.search(driverPos, [this.fromPos.lng, this.fromPos.lat], (status, result) => {
                  // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
                  if (status === 'complete') {
                    this.drawDriverRoute(result.routes[0])
                    console.log('绘制驾车路线完成')
                  } else {
                    console.log('获取驾车数据失败：' + result)
                  }
                });
              } else {
                if (this.driverMarker) {
                  this.driverMarker.moveTo(driverPos, 50)
                }
              }
              break;
            }
            // 司机到达
            case 12: {
              this.showTips = false
              this.status = '司机已到达'
              if (!this.driverMessageBox) {
                MessageBox({
                  title: '提示',
                  message: '司机已到达，请及时上车'
                })
                this.driverMessageBox = true
              }

              if (this.driverRouteLine) {
                this.map.remove(this.driverRouteLine)
              }
              this.driverArrived = true

              console.log('司机已到达')
            }
          }
        } else {
          this.$toast(rs.error)
        }
      },
      // 价格多退少补交互，结束计费和已评价共同处理逻辑
      finishPrice() {
        this.status = '行程已结束'
        this.isCancel = false
        let self = this
        // 订单结束，无需付款
        if (this.orderMap.moneyComplateState === 2) {
          if (!this.showMessageBox) {
            MessageBox({
              title: '行程结束',
              message:
                `<p>本次行程累计消耗积分: ${this.orderMap.realAmount}</p>
                       <p>已预付积分：${this.orderMap.estimateAmount}</p>
                       <p>需付差额：${Number(this.orderMap.estimateAmountDiff) > 0 ? '0' : Math.abs(Number(this.orderMap.estimateAmountDiff))}</p>
                       <p>提示：多付部分将自动退回积分账户</p>`

            }).then(action => {
              console.log(action)

            })
          }
          console.log('行程结束，祝您生活愉快')
        } else {
          // 需要补差价
          if (!this.showMessageBox) {
            MessageBox({
              confirmButtonText: '支付',
              message:
                `
                        <p>行程结束，您需要补：${Math.abs(Number(this.orderMap.estimateAmountDiff))} 积分</p>
                        `,
            }).then(action => {
              console.log(action)
              this.payFee()
              this.showMessageBox = true
            })
          }
          console.log()
        }
        self.showMessageBox = true
        this.clearTimer()
      },
      async payFee() {
        this.$openLoading()
        let rs = await this.$get(`/api/caocao/order/fix_fee/${this.orderNo}`)
        this.$closeLoading()
        if (rs.status === 200) {
          this.$toast('支付成功')
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
      // 起止点标记
      setStationMarker(map, icon, pos) {
        let marker = new window.AMap.Marker({
          position: pos,
          icon: icon
        })
        this.stationMarkers.push(marker)
        map.add(marker)
      },
      wayChange(way) {
        this.currentWay = way
      },
      // tabChange(tab) {
      //   this.currentTab = tab
      // },
      countWaitTime() {
        let self = this
        if (this.waitTimer) {
          clearInterval(this.waitTimer)
        } else {
          this.waitTimer = setInterval(function () {
            let times = new Date(Date.now() - new Date(self.orderTime).getTime());
            let s = parseInt(times / 1000 % 60)
            let m = parseInt(times / 1000 / 60 % 60)
            let h = parseInt(times / 1000 / 60 / 60 % 24)
            h = self.formatTime(h)
            m = self.formatTime(m)
            s = self.formatTime(s)
            self.waitTime = `${h}:${m}:${s}`
          }, 1000)
        }

      },
      formatTime(flag) {
        return flag < 10 ? '0' + flag : flag
      },
      clearTimer() {
        if (this.timer) {
          clearInterval(this.timer)
        }
        if (this.fitviewTimer) {
          clearInterval(this.fitviewTimer)
        }
      }
    },
    watch: {
      // currentTab() {
      //   // this.getEstimatePrice()
      // },
      // 获取到定位，开始标记
      beginMark(val) {
        if (val) {
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
          this.setStationMarker(this.map, startIcon, [this.fromPos.lng, this.fromPos.lat])
          this.setStationMarker(this.map, endIcon, [this.toPos.lng, this.toPos.lat])
          this.map.setFitView()
        }
      },
      startWait(val) {
        if (val) {
          this.countWaitTime()
        } else {
          clearInterval(this.waitTimer)
        }
      },
      countPrice(val) {
        // 开始计价后，30s自适应一次地图
        if (val) {
          if (!this.fitviewTimer) {
            this.fitviewTimer = setInterval(() => {
              this.map.setFitView([...this.stationMarkers, this.driverMarker, this.routeLine]);
            }, 30000)
          }
          if (!this.routeLineTimer) {
            this.routeLineTimer = setInterval(() => {
              let lng = this.positionInfo.data.longitude
              let lat = this.positionInfo.data.latitude
              let driverPos = [lng, lat]
              this.map.remove(this.routeLine)
              this.driving.search(driverPos, [this.toPos.lng, this.toPos.lat], (status, result) => {
                if (status === 'complete') {
                  this.drawRoute(result.routes[0])

                  console.log('绘制驾车路线完成')
                } else {
                  console.log('获取驾车数据失败：' + result)
                }
              });
            }, 60000)
          }
        }
      }
    }
  }
</script>

<style scoped lang="scss">
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
                width: 40px;
                height: 40px;
                line-height: 40px;
                flex: none;
            }

            &-title {
                margin-left: 20px;
                flex-grow: 1;
            }

            &-addon {
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
            z-index: 1000;
        }
    }

    .travel {

        &-tips {
            margin: 21px auto;
            color: #f03e3a;
            font-size: 26px;
            text-align: center;
            width: 694px;
            height: 64px;
            line-height: 64px;
            background-color: #ffffff;
            box-shadow: 0 4px 10px 0 rgba(101, 101, 101, 0.23);
            border-radius: 32px;
        }

        &-type {
            text-align: center;
            font-size: 34px;
        }

        &-change {
            display: flex;
            justify-content: space-between;
            padding: 30px;
            font-size: 30px;
        }

        &-user {
        }

        &-status {
            background: #fff;
            padding: 20px;
            display: flex;
            align-items: center;

            &-name {
                flex-grow: 1;
            }
        }

        &-cancel {
            margin-left: 20px;
        }

        &-action {
            height: 88px;
            margin: 30px auto;
            line-height: 88px;
            text-align: center;
            color: #fff;
            font-size: 34px;
            background-image: linear-gradient(90deg, #fdad23 0%, #fb6026 100%);
            border-radius: 12px;
        }
    }

    .driver {

        &-info {
            display: flex;
            padding: 0 25px;
            background: #fff;
        }

        &-avatar {
            width: 104px;
            height: 104px;

            img {
                width: 100%;
                border-radius: 50%;
                background: $default-color;
            }

            margin-right: 20px;
        }

        &-detail {
            color: #333;
        }

        &-basis {
            flex-grow: 1;
            padding: 36px 0;
        }

        &-name {
            font-size: 28px;
            color: #222;
        }

        &-tel {
            display: flex;
            align-items: center;
            padding-top: 10px;

            .icon-tel-line, a {
                font-size: 28px;
                color: $warning-color;
            }
        }

        &-card {
            padding: 10px 0;
            font-size: 28px;
            color: $warning-color;
        }

        &-car {
            color: #999;

            span {

                margin-top: 18px;
                margin-right: 20px;
                font-size: 26px;
            }
        }

        &-action{
            display: flex;
            &-item{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 140px;
                text-align: center;
                border-left: 2px solid $line-color;
                img{
                    width: 54px;
                    margin-bottom: 20px;
                }
            }
        }

    }
    a{
        color: #222;
    }
</style>
