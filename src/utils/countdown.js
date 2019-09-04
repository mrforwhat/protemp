export default class CountDown{
  constructor($vm,options,callback) {
     this.$vm = $vm
     this.times = options.times
     this.expireTime = options.expireTime
     this.timer = null
     this.callback = callback
  }
  init() {
    let self = this
    if(this.timer) {
      clearInterval(this.timer)
    }else {
      this.timer = setInterval(function() {
        let times = new Date(self.expireTime).getTime() - Date.now();
        if (times < 0) {
          self.times = '订单已超时'
          clearInterval(self.timer)
          self.callback && self.callback(self.times)
          return
        }
        let s = parseInt(times / 1000 % 60)
        let m = parseInt(times / 1000 / 60 % 60)
        let h = parseInt(times / 1000 / 60 / 60 % 24)
        h = self.formatTime(h)
        m = self.formatTime(m)
        s = self.formatTime(s)
        self.$vm.$data.times = `${h}:${m}:${s}`
      },1000)
    }
  }
  desctroy(){
    if(this.timer) {
      clearInterval(this.timer)
    }
  }
  formatTime(flag) {
    return flag < 10 ? '0' + flag : flag
  }
}

