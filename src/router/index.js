import Vue from 'vue'
import Router from 'vue-router'
// import reduceRoutes from './reduce'
Vue.use(Router)
import reduceRoutes from './reduce'

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        title: '首页'
      },
      component: () => import('@/views/Home')
    },
    ...reduceRoutes
  ]
});

export default router
