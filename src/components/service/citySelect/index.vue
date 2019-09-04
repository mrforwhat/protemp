<template>
    <transition enter-active-class="slideInDown" leave-active-class="slideOutUp">
    <div class="citySelect animated" v-show="showCity" @touchend="closePointer">
        <div class="citySelect-header">
            <div class="citySelect-row">
                <div class="citySelect-val">当前定位城市： 杭州市</div>
                <div class="citySelect-cancel" @click="cancel">取消</div>
            </div>
        </div>
        <div class="citySelect-container" ref="container"  >
            <section>
                <div class="sort">热门城市</div>
                <div class="city">
                    <div class="city-name" v-for="(hot,index) in cityJson.hotCities" :key="index" @click="selectItem(hot)">
                        {{hot.name}}
                    </div>
                </div>
            </section>
            <section v-for="(city,key) in cityJson.cities" :key="key">
                <div class="sort" :ref="'city'+key">{{key}}</div>
                <div class="city">
                    <div class="city-name" v-for="(item,i) in city" :key="i" @click="selectItem(item)">
                        {{item.name}}
                    </div>
                </div>
            </section>
        </div>
        <div class="citySelect-word" ref="bar" @touchstart="onTouchStart"  @touchmove.prevent.stop="onLetterTouch">
            <div class="citySelect-word-item"
                 v-for="(word,index) in wordList" :key="index">
                {{word}}
            </div>
            <transition enter-active-class="zoomIn" leave-active-class="zoomOut">
                <div class="citySelect-pointer animated" v-show="showCurrentWord">
                    {{currentWord}}
                </div>
            </transition>
        </div>
    </div>
    </transition>
</template>

<script>
  import  cityJson from '@/city'
  export default {
    name: "citySelectIndex",
    props: {
      value: {
        default: false
      }
    },
    data() {
      return {
        cityJson: cityJson,
        showCity: false,
        offsetY: 0,
        startY: 0,
        letterHeight: 0,
        currentWord: 'A',
        showCurrentWord: false,
        wordList: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
      }
    },
    methods: {
      selectItem(item) {
        this.cancel()
        this.$emit('select', item)
      },
      moveTo(word) {
        console.log(word)
        if(word) {
          this.$refs.container.scrollTop = this.$refs[`city${word}`][0].offsetTop
        }
      },
      onTouchStart() {
        let bar = this.$refs.bar;
        let firstWord = bar.childNodes[0]
        this.startY = bar.offsetTop - bar.offsetHeight / 2 + firstWord.offsetHeight
        this.letterHeight = firstWord.offsetHeight
      },
      onLetterTouch(e) {
        let offsetY = e.touches[0].clientY - this.startY
        let wordIndex = Math.round(offsetY / this.letterHeight)
        if(wordIndex < 0) {
          wordIndex = 0;
        }else if(wordIndex >= 25) {
          wordIndex = 25;
          this.currentWord = String.fromCharCode(65 + wordIndex)
        } else {
          this.offsetY = offsetY;
          this.currentWord = String.fromCharCode(65 + wordIndex)
        }
        this.showCurrentWord = true
        this.moveTo(this.currentWord)
      },
      closePointer() {
        this.showCurrentWord = false
      },
      cancel() {
        this.showCity = false
      }
    },
    watch: {
      value(val) {
        this.showCity = val
      },
      showCity(val) {
        this.$emit('input', val)
      },
    }
  }
</script>

<style scoped lang="scss">

    .citySelect{
        position: absolute;
        z-index: 10001;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fff;
        height: 100%;
        &-header{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        }
        &-container{
            position: absolute;
            top: 92px;
            left: 0;
            right: 0;
            bottom: 0;
            -webkit-overflow-scrolling: touch;
            overflow-y: scroll;
        }
        &-row{
            display: flex;
            font-size: 30px;
            padding: 20px 15px;
        }
        &-val{
            flex-grow: 1;
            border-right: 2px solid $line-color;
        }
        &-cancel {
            margin-left: 20px;
        }
        &-word{
            position: absolute;
            right: 30px;
            top: 50%;
            padding: 10px;
            text-align: center;
            transform: translate(0, -50%);
            font-size: 30px;
            color: #333;
            line-height: 1.2;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 0 3px rgba(0,0,0,0.2);
        }
        &-pointer{
            position: absolute;
            right: 70px;
            top: 0;
            height: 80px;
            line-height: 80px;
            width: 80px;
            text-align: center;
            font-size: 50px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }
    }
    .sort{
        background: #9e9e9e;
        padding: 5px 30px;
        font-size: 28px;
        color: #333;
    }

    .city{
        padding-left: 25px;
        &-name{
            font-size: 28px;
            padding: 20px 0;
            color: #333;
            border-bottom: 2px solid $line-color;
        }

    }
</style>
