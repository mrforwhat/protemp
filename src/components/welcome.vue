<template>
    <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
        <div class="welcome animated" v-show="showWelcome">
            <div class="letter">G</div>
            <div class="letter">U</div>
            <div class="letter">I</div>
        </div>
    </transition>

</template>

<script>
  export default {
    name: "welcome",
    data() {
      return {
        showWelcome: true
      }
    },
    mounted() {
      setTimeout(()=>{
        this.showWelcome = false
      },5000)
    }
  }
</script>

<style scoped lang="scss">
    .welcome{
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        background-color:#2d303a;
    }
    .letter {
        animation: bounce 0.75s cubic-bezier(0.05, 0, 0.2, 1) infinite alternate;
        display: inline-block;
        transform: translate3d(0, 0, 0);
        margin-top: 0.5em;
        color: #fff;
        text-shadow: rgba(255, 255, 255, 0.4) 0 0 0.05em;
        font-size: 100px;
    }
    .letter:nth-child(1) {
        animation-delay: 0s;
    }

    .letter:nth-child(2) {
        animation-delay: 0.0833333333s;
    }

    .letter:nth-child(3) {
        animation-delay: 0.1666666667s;
    }

    .bounce {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        color: white;
        height: 100%;
        font: normal bold 6rem "Product Sans", sans-serif;
        white-space: nowrap;
    }
    @keyframes bounce {
        0% {
            transform: translate3d(0, 0, 0);
            text-shadow: rgba(255, 255, 255, 0.4) 0 0 0.05em;
        }

        100% {
            transform: translate3d(0, -1em, 0);
            text-shadow: rgba(255, 255, 255, 0.4) 0 1em 0.35em;
        }
    }
</style>
