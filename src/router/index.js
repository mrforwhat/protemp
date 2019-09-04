import Vue from 'vue'
import Router from 'vue-router'
// import reduceRoutes from './reduce'
Vue.use(Router)
import reduceRoutes from './reduce'

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'taketaxiHome',
      meta: {
        routeName: 'taketaxiHome',
        title: '出行'
      },
      component: () => import('@/views/taketaxi/home')
    },
    ...reduceRoutes
  ]
});

export default router
