<template>
    <transition enter-active-class="slideInRight" leave-active-class="slideOutRight">
        <div class="poi animated" v-show="showSearch">
            <div class="poi-header">
                <div class="poi-city" @click="openCitySelect">
                    {{currentCity}}
                    <i class="iconfont icon-triangle-down"></i>
                </div>
                <input type="text" v-model="keywords" :placeholder="isFrom?'您在哪儿上车':'您要去哪儿'" class="poi-input">
                <div class="poi-cancel" @click="close">取消</div>
            </div>
            <div class="poi-container">
                <div class="poi-content" ref="container">
                    <div class="poi-row" @click="selectPos(homeAddressObj)">
                        <div class="poi-key">
                            <img src="../../../assets/img/car/home.png" alt="">
                        </div>
                        <div class="poi-val">
                            <p class="poi-name">家</p>
                            <p class="poi-address">
                                {{homeAddress|| '详细地址'}}
                            </p>
                        </div>
                        <div class="poi-addon" @click.stop="modAddress(0)">
                            <img src="../../../assets/img/car/edit.png" alt="">
                        </div>
                    </div>
                    <div class="poi-row" @click="selectPos(corpAddressObj)">
                        <div class="poi-key">
                            <img src="../../../assets/img/car/corp.png" alt="">
                        </div>
                        <div class="poi-val">
                            <p class="poi-name">公司</p>
                            <p class="poi-address">
                                {{corpAddress|| '详细地址'}}
                            </p>
                        </div>
                        <div class="poi-addon" @click.stop="modAddress(1)">
                            <img src="../../../assets/img/car/edit.png" alt="">
                        </div>
                    </div>
                    <div v-if="addressList.length">
                        <Loadmore :top-method="loadTop"
                                  :bottom-method="loadBottom"
                                  :bottom-all-loaded="allLoaded"
                                  :autoFill="false"
                                  ref="loadmore">

                            <div class="poi-row"
                                 v-for="(item,index) in addressList" :key="index"
                                 @click="selectPos(item)">
                                <div class="poi-key">
                                    <img src="../../../assets/img/car/address.png" alt="">
                                </div>
                                <div class="poi-val">
                                    <p class="poi-name">{{item.name}}</p>
                                    <p class="poi-address">{{item.Address}}</p>
                                </div>
                            </div>
                        </Loadmore>
                    </div>
                    <div class="empty" v-else>
                        暂未查询到任何地址
                    </div>
                </div>
            </div>
            <citySelect v-model="showCity" @select="selectCity"></citySelect>
            <singleForm v-model="showHomeAddress" @confirmForm="confirmHomeAddress">
                <div class="cell">
                    <div class="cell-row">
                        <div class="cell-key">详细地址</div>
                        <div class="cell-val">
                            <input type="text" placeholder="不能超过50个字符" v-model="tempHomeAddress">
                        </div>
                    </div>
                </div>
            </singleForm>
            <singleForm v-model="showCorpAddress" @confirmForm="confirmCorpAddress">
                <div class="cell">
                    <div class="cell-row">
                        <div class="cell-key">详细地址</div>
                        <div class="cell-val">
                            <input type="text" placeholder="不能超过50个字符" v-model="tempCorpAddress">
                        </div>
                    </div>
                </div>
            </singleForm>
        </div>
    </transition>
</template>

<script>
  import axios from 'axios'
  import {debounce} from "@/utils/debounce";
  import {Loadmore} from 'mint-ui'
  import citySelect from '@/components/service/citySelect/index'
  import singleForm from '@/components/service/singleForm/index'

  export default {
    name: "POISearch",
    props: {
      value: {
        default: false
      },
      isFrom: {
        type: Boolean,
        default: true
      }
    },
    components: {
      Loadmore,
      citySelect,
      singleForm
    },
    data() {
      return {
        showSearch: false,
        showCity: false,
        keywords: '',
        allLoaded: false,
        page: 1,
        currentCity: '杭州市',
        city: {
          name: '杭州市',
          code: '330100'
        },
        addressList: [],
        homeAddress: '',
        corpAddress: '',
        tempHomeAddress: '',
        tempCorpAddress: '',
        showHomeAddress: false,
        showCorpAddress: false,
        homeAddressObj: {},
        corpAddressObj: {}
      }
    },
    mounted() {
    },
    methods: {
      modAddress(type) {
        if(type === 0 ) {
          this.showHomeAddress = true
        }else {
          this.showCorpAddress = true
        }
      },
      confirmHomeAddress() {
        this.searchPOI(this.tempHomeAddress,(geocodes)=> {
          this.homeAddressObj = geocodes
          this.homeAddress = this.tempHomeAddress
          this.homeAddressObj.address = this.homeAddress
          localStorage.setItem('homeAddressObj',JSON.stringify(this.homeAddressObj))
        })
      },
      confirmCorpAddress() {
        this.searchPOI(this.tempCorpAddress,(geocodes)=> {
          console.log(geocodes)
          this.corpAddressObj = geocodes
          this.corpAddress = this.tempCorpAddress
          this.corpAddressObj.address = this.corpAddress
          localStorage.setItem('corpAddressObj',JSON.stringify(this.corpAddressObj))
        })
      },
      searchPOI(place,callback) {
        let instance = axios.create({
          baseURL: ''
        })
        this.$openLoading()
        instance.get('https://restapi.amap.com/v3/geocode/geo', {
          params: {
            key: '3d29aa3e5979a1b555e12d914b2f2812',
            address: `${place}`,
            city: this.currentCity
          }
        }).then((res)=> {
          this.$closeLoading()
          if (res.status === 200 && res.data.status === '1' && res.data.geocodes.length) {
            callback(res.data.geocodes[0])
          }else {
            this.$toast('未查询到该地址')
          }
        })

      },
      setKeywords(keywords) {
        this.keywords = keywords
      },
      selectCity(item) {
        this.currentCity = item.name
      },
      openCitySelect() {
        this.showCity = true
      },
      close() {
        this.showSearch = false
      },
      selectPos(pos) {
        if(!pos.location) {
          return this.$toast('请选择正确的地址')
        }
        this.close()
        this.$emit('selectAddress', pos)
      },
      // 下拉刷新
      async loadTop() {
        this.page = 1;
        this.allLoaded = false;
        this.addressList = [];
        await this.searchBykeyWord();
        if (this.$refs.loadmore) {
          this.$refs.loadmore.onTopLoaded();
        }
        this.$nextTick(() => {
          this.$refs.container.scrollTop = 0;
        })
      },
      // 上拉加载
      loadBottom() {
        this.searchBykeyWord();
      },
      searchBykeyWord() {
        this.page = 1;
        this.allLoaded = false;
        this.addressList = [];
        let instance = axios.create({
          baseURL: ''
        })
        this.$openLoading()
        instance.get('https://restapi.amap.com/v3/place/text', {
          params: {
            key: '3d29aa3e5979a1b555e12d914b2f2812',
            keywords: `${this.keywords}`,
            city: this.currentCity,
            page: this.page,
            offset: 10
          }
        }).then((res) => {
          this.$closeLoading()
          if (res.status === 200 && res.data.status === '1') {
            if (res.data.pois && res.data.pois.length) {
              res.data.pois.forEach((item) => {
                this.addressList.push(item)
              })
              this.page++
            } else {
              this.allLoaded = true;
            }
            if (this.$refs.loadmore) {
              this.$refs.loadmore.onBottomLoaded();
            }
          }
        })
      }
    },
    watch: {
      value(val) {
        this.showSearch = val
        if (val) {
          this.$store.commit('setBodyTouchMove', false)
          let localHomeAddress = JSON.parse(localStorage.getItem('homeAddressObj'))
          let localCorpAddress = JSON.parse(localStorage.getItem('corpAddressObj'))
          if(localHomeAddress) {
            this.homeAddress = localHomeAddress.Address
            this.homeAddressObj = localHomeAddress
          }
          if(localCorpAddress) {
            this.corpAddress = localCorpAddress.Address
            this.corpAddressObj = localCorpAddress
          }
        } else {
          this.$store.commit('setBodyTouchMove', true)
        }
      },
      showSearch(val) {
        this.$emit('input', val)
      },
      keywords() {
        this.page = 1;
        this.allLoaded = false;
        this.addressList = [];
        if (!this._searchBykeyWord) {
          this._searchBykeyWord = debounce(this.searchBykeyWord, 1000)
        }
        this._searchBykeyWord()
      }
    }
  }
</script>

<style scoped lang="scss">
    @import "@css/module/cell.scss";
    .cell{
        &-row{
            border-bottom: 2px solid $line-color;
            &:last-child{
                border-bottom: 2px solid $line-color;
            }
        }
        &-key{
            width: initial;
            margin-right: 20px;
        }
    }
    .poi {
        position: absolute;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        background: $back-color;

        &-header {
            height: 88px;
            line-height: 88px;
            padding: 0 28px;
            position: relative;
            text-align: center;
            font-size: 28px;
            color: #fff;
            display: flex;
            align-items: center;
            background-color: #f03e3a;
        }

        &-city {
            margin-right: 20px;
        }

        &-input {
            border-radius: 2px;
            flex-grow: 1;
            height: 55px;
            line-height: 55px;
            font-size: 26px;
            padding: 0 20px;
            border-left: 2px solid $line-color;
            border-right: 2px solid $line-color;
        }

        &-cancel {
            margin-left: 20px;
        }

        &-container {
            position: absolute;
            z-index: 10000;
            top: 96px;
            bottom: 0;
            left: 0;
            right: 0;
            background: #f2f2f2;
        }

        &-content {
            margin: 14px;
            background: #fff;
            box-shadow: 0 4px 10px 0 rgba(218, 226, 231, 0.23);
            border-radius: 8px;
            position: relative;
            min-height: 200px;
            max-height: calc(100% - 88px);
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
        }


        &-row {
            display: flex;
            align-items: center;
            padding: 30px 25px;
            border-bottom: 2px solid $line-color;

            img {
                width: 36px;
                height: 36px;
            }
        }

        &-key {
            margin-right: 20px;

            .icon-loc {
                font-size: 30px;
            }
        }

        &-val {
            flex-grow: 1;
        }

        &-name {
            font-size: 28px;
        }

        &-address {
            font-size: 26px;
            color: #c4c2c2;
        }
    }
    input{
        height: 55px;
        line-height: 55px;
        font-size: 30px;
    }
</style>
