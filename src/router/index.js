import Vue from 'vue'
import Router from 'vue-router'
// import reduceRoutes from './reduce'
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        routeName: 'home',
        title: '首页'
      },
      component: () => import('../views/Home.vue')
    },
    // ...reduceRoutes
  ]
});

export default router
