<template>
    <div class="wait" v-show="waiting">{{title}}{{dot}}
        <div class="wait-mask"></div>
    </div>
</template>

<script>
import Mask from '@/components/mask'
export default {
  name: "waiting",
  props: {
    showWait: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      waiting: false,
      dotObj: {
        "0": "",
        "1": ".",
        "2": "..",
        "3": "..."
      },
      title: "正在为您评估额度，请稍等",
      dot: "",
      timer: null,
      mask: new Mask({
        transparent: true
      })

    }
  },
  methods: {
    setTitle (title) {
      this.title = title
    },
    start () {
      let count = 1
      this.timer = setInterval(() => {
        this.dot = this.dotObj[count]
        count++
        if (count === 4) {
          count = 0
        }
      }, 1000)
    },
    end () {
      this.waiting = false
      clearInterval(this.timer)
    }
  },
  watch: {
    "showWait" (val) {
      this.waiting = val
    },
    waiting(val) {
      if(val) {
        this.mask.show()
      }else {
        this.mask.hide()
      }
    }
  }
}
</script>

<style scoped lang="scss">
    .wait{
        position: fixed;
        top: 35%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        padding: 10px 20px;
        white-space: nowrap;
        background: rgba(0,0,0,.5);
        border-radius: 8px;
        color: #fff;
    }
</style>
