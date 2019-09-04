<template>
    <div class="page">
        <div class="page-header">
            <i class="iconfont icon-arrow-left" @click="$router.back()"></i>
            <span class="page-header-title">曹操专车</span>
        </div>
        <div class="page-tab">
            <div class="page-tab-item"
                 v-for="(tab,index) in tabList" :key="index"
                 @click="tabChange(tab)"
                 :class="{'active':tab.id === currentTab.id}">
                {{tab.name}}
            </div>
        </div>
        <div class="page-footer travel">
            <div class="travel-way">
                <div class="travel-way-item"
                     v-for="(way,index) in wayList" :key="index"
                     @click="wayChange(way)"
                     :class="{'active':way.id === currentWay.id}">
                    {{way.name}}
                </div>
            </div>
            <div class="travel-where">
                <div class="travel-row">
                    <input type="text" ref="fromAddress" readonly v-model="from" @click="searchFromAddress">
                </div>
                <div class="travel-row">
                    <input type="text" ref="toAddress" readonly placeholder="您要去哪儿" v-model="to" @click="searchToAddress">
                </div>
            </div>
        </div>
        <div id="mapContainer"></div>
        <custWaiting :showWait="showWait" ref="custWait"></custWaiting>
        <POISearch ref="fromPOI" v-model="showFromPoi" :isFrom="isFrom" @selectAddress="selectFromAddress"></POISearch>
        <POISearch ref="toPOI" v-model="showToPoi" :isFrom="isFrom" @selectAddress="selectToAddress"></POISearch>
    </div>
</template>

<script>
  import custWaiting from "@/components/waiting";
  import POISearch from "@/components/service/POISearch/index";
  import axios from 'axios'
  import {randomNum} from '@/utils/randomNum'


  export default {
    name: "taketaxiHome",
    components: {
      custWaiting,
      POISearch
    },
    data() {
      return {
        tabList: [ {
          name: '新能源',
          id: 2
        }, {
          name: '舒适',
          id: 3
        },{
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
        }
          // , {
          //   name: '接机',
          //   id: 3
          // }, {
          //   name: '送机',
          //   id: 4
          // }
        ],
        currentWay: {
          name: '现在',
          id: 1
        },
        from: '正在获取当前位置',
        fromPos: '',
        toPos: '',
        to: '',
        map: null,
        showWait: false,
        currentPos: {
          lng: '',
          lat: ''
        },
        estimateTime: '',
        centerMarker: null,
        driverMarkers: [],
        stationMarkers: [],
        showFromPoi: false,
        showToPoi: false,
        nearDriverList: [],
        isFrom: true
      }
    },

    mounted() {
      this.$refs.custWait.setTitle("正在定位中，请稍等");
      this.showWait = true;
      this.$refs.custWait.start();
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
        this.getCurrentPos((pos) => {
          if(!pos) {
            this.$refs.custWait.end();
            return
          }
          this.currentPos = {
            lng: pos.lng,
            lat: pos.lat
          }
          let icon = new window.AMap.Icon({
            size: new window.AMap.Size(40, 40),
            image: '//static.lianhaikeji.com/images/20190517/ff68946259ca4956b3ede3c7b4f011f8.png',
            imageSize: new window.AMap.Size(40, 40),
            imageOffset: new window.AMap.Pixel(0, 0)
          })
          // this.initTextMarker('',[this.currentPos.lng, this.currentPos.lat])
          this.setCenterMarker(this.map, icon, [this.currentPos.lng, this.currentPos.lat])
          this.$refs.custWait.end();
        })
      })
      this.bindMoveEvents()
    },
    methods: {
      bindMoveEvents() {
        this.map.on('moveend', this.getCenter)
      },
      offMoveEvents() {
        this.map.off('moveend', this.getCenter)
      },
      // 计算路线，价格
      calculating() {
        if (this.fromPos && this.toPos) {
          this.offMoveEvents()
          this.map.setFitView()
        }
      },
      searchFromAddress() {
        this.$refs.fromAddress.blur()
        this.$refs.fromPOI.setKeywords(this.from)
        this.showFromPoi = true
        this.isFrom = true
      },
      selectFromAddress(pos) {
        let location = pos.location.split(',')
        this.map.setCenter(location)
        this.fromPos = location
        this.calculating()
      },
      searchToAddress() {
        this.$refs.toAddress.blur()
        this.showToPoi = true
        this.isFrom = false
      },
      selectToAddress(pos) {
        let location = pos.location.split(',')
        this.to = pos.address
        this.toPos = location
        this.$store.commit('setCCPos', {
          fromPos: this.fromPos,
          toPos: this.toPos,
          from: this.from,
          to: this.to,
          estimateTime: this.estimateTime
        })

        let carType = this.currentTab.id
        this.$router.push({
          name: 'taketaxiOrder',
          query: {
            carType: carType
          }
        })
      },
      // 查询附近司机
      async getNearDrivers() {
        let rs = await this.$post('/api/caocao/nearby_drivers', {
          longitude: this.currentPos.lng,
          latitude: this.currentPos.lat
        })
        if (rs.status === 200) {
          this.nearDriverList = rs.payload.detail
          this.estimateTime = rs.payload.estimateTime
          if (this.nearDriverList && this.nearDriverList.length) {
            this.centerMarker.setLabel({
              offset: new window.AMap.Pixel(-5, -10),  //设置文本标注偏移量
              content: `<div class="info">${this.estimateTime}分钟后上车</div>`, //设置文本标注内容
              direction: 'top' //设置文本标注方位
            })
          }
          this.map.remove(this.driverMarkers)
          // 循环标记司机
          this.nearDriverList.forEach((item) => {
            let icon = new window.AMap.Icon({
              size: new window.AMap.Size(32, 20),
              image: 'https://static.lianhaikeji.com/images/20190718/8b56855c611d4bb4a9948bf7be746b20.png',
              // image: 'https://webapi.amap.com/images/car.png',
              imageSize: new window.AMap.Size(32, 20),
              imageOffset: new window.AMap.Pixel(0, 0),

            })
            this.setDriverMarker(this.map, icon, [item.longitude, item.latitude])
          })
        } else {
          this.$toast(rs.error)
        }
      },
      // 设置中心点marker
      setCenterMarker(map, icon, pos) {
        let marker = new window.AMap.Marker({
          position: pos,
          icon: icon
        })
        this.centerMarker = marker

        map.add(marker)
      },
      // 司机标记
      setDriverMarker(map, icon, pos) {
        let marker = new window.AMap.Marker({
          position: pos,
          icon: icon,
          autoRotation: true,
          angle: randomNum(1, 361),
        })
        this.driverMarkers.push(marker)
        map.add(marker)
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
      getCenter() {
        let center = this.map.getCenter()
        this.centerMarker.setPosition([center.lng, center.lat])
        this.currentPos = {
          lng: center.lng,
          lat: center.lat
        }
        this.fromPos = [center.lng, center.lat]
        this.getAddressByPos(center)
      },
      getAddressByPos(pos) {
        let instance = axios.create({
          baseURL: ''
        })
        this.from = '正在获取当前位置'
        instance.get('https://restapi.amap.com/v3/geocode/regeo', {
          params: {
            key: '3d29aa3e5979a1b555e12d914b2f2812',
            location: `${pos.lng},${pos.lat}`
          }
        }).then((res) => {
          if (res.status === 200 && res.data.status === '1') {
            this.from = res.data.regeocode.formatted_address
            this.getNearDrivers()
          }
        })
      },
      wayChange(way) {
        if (way.id === 2) {
          return this.$toast('暂未开放，敬请期待')
        }
        this.currentWay = way
      },
      tabChange(tab) {
        this.currentTab = tab
      },
      getCurrentPos(callback) {
        let self = this;
        window.AMap.plugin("AMap.Geolocation", function () {
          let geolocation = new window.AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位，默认:true
            timeout: 10000, // 超过10秒后停止定位，默认：5s
            buttonPosition: "RB", // 定位按钮的停靠位置
            buttonOffset: new window.AMap.Pixel(20, 220), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true // 定位成功后是否自动调整地图视野到定位点
          });
          self.map.addControl(geolocation);
          geolocation.getCurrentPosition(function (status, result) {
            if (status === "complete") {
              // console.table(result.position);
              self.lng = result.position.lng;
              self.lat = result.position.lat;
              callback.call(this, {
                lng: self.lng,
                lat: self.lat
              })
            } else {
              let locationErrCount = 0
              locationErrCount = sessionStorage.getItem('locationErr')
              if (!locationErrCount) {
                sessionStorage.setItem('locationErr', 1)
                location.reload()
              }else {
                sessionStorage.removeItem('locationErr')
                self.$toast("定位获取失败");
                callback(null)
              }
            }
          });
        });
      },
      getCityPos(callback) {
        window.AMap.plugin("AMap.CitySearch", function () {
          let citySearch = new window.AMap.CitySearch()
          citySearch.getLocalCity(function (status, result) {
            if (status === "complete" && result.info === "OK") {
              // 查询成功，result即为当前所在城市信息
              console.log(result.bounds.nc)
              callback.call(this, {
                lng: result.bounds.nc.lng,
                lat: result.bounds.nc.lat
              })
            } else {
              callback(null)
            }
          })
        })
      }
    },

    watch: {}
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

        /deep/ .info {
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 15px;
            background-color: white;
            border-width: 0;
            box-shadow: 0 4px 12px 0 rgba(114, 124, 245, .5);
            text-align: center;
            font-size: 24px;
            color: #ff5d1b;
        }

        /deep/ .amap-marker-label {
            border: none;
            background-color: transparent;
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
            left: 0;
            right: 0;
            top: 88px;
            height: 85px;
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            background: #fff;
            padding: 16px 0;
            &-item {
                text-align: center;
                border-radius: 35px;
                padding: 12px 24px;
                &.active {
                    background: #f03e3a;
                    color: #fff;
                    border-bottom: 2px solid $warning-color;
                }
            }
        }

        &-footer {
            bottom: 0;
            left: 0;
            right: 0;
            background: #fff;
            padding-top: 30px;
            z-index: 1000;
        }
    }

    .travel {
        &-way {
            display: flex;
            padding: 10px 50px 0 50px;

            &-item {
                flex-grow: 1;
                font-size: 28px;
                color: $default-color;
                margin: 0 20px;
                padding: 20px 0;
                border-radius: 40px;
                text-align: center;
                font-family: PingFang-SC-Bold;

                &.active {
                    color: #e90805;
                    border: 2px solid #e90805;
                }
            }
        }

        &-where {
            margin-top: 10px;
            position: relative;

        }

        &-row {
            padding: 36px 60px 36px 120px;
            position: relative;
            border-bottom: 2px solid $line-color;
            &:before {
                content: '';
                position: absolute;
                left: 80px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                background: $success-color;
                border-radius: 50%;
            }

            &:last-child {
                border-bottom: none;
                &:before {
                    background: red;
                }
            }
            input {
                height: 55px;
                line-height: 55px;
                font-size: 30px;
                width: 100%;
            }
        }
    }
</style>
