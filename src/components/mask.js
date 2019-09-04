export default class Mask{
  constructor(options) {
    this.mask = document.createElement('div')
    this.mask.setAttribute('class','custMask')
    if(options.transparent) {
      this.mask.classList.add('transparent')
    }
  }
  show() {
    if(this.mask) {
      document.body.appendChild(this.mask)
    }
  }
  hide() {
    if(this.mask) {
      document.body.removeChild(this.mask)
    }
  }
}

