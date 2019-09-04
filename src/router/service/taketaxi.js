import request from '@/utils/request'

export default [{
  path: '/taketaxi',
  name: 'taketaxiIndex',
  component: () => import('@/views/taketaxi/root'),

  children: [{
    path: 'home',
    name: 'taketaxiHome',
    meta: {
      title: '出行',
      needLogin: true
    },
    component: () => import('@/views/taketaxi/home'),
    beforeEnter: (to, from, next) => {
      getIsCurrentOrder(next)
    }
  }, {
    path: 'order',
    name: 'taketaxiOrder',
    meta: {
      title: '出行',
      needLogin: true
    },
    component: () => import('@/views/taketaxi/order'),
    beforeEnter: (to, from, next) => {
      getIsCurrentOrder(next)
    },
  }, {
    path: 'track',
    name: 'taketaxiTrack',
    meta: {
      title: '出行',
      needLogin: true
    },
    component: () => import('@/views/taketaxi/track')
  }]
}]

// 查询当前是否存在订单
export function getIsCurrentOrder(next) {
  // 如果当前有订单
  request.get('/api/unfinished/order/get').then((res) => {
    if (res.status === 200 && res.payload.existFlag) {
      next({
        name: 'taketaxiTrack',
        query: {
          orderNo: res.payload.detail.caocaoOrderId
        }
      })
    } else {
      next()
    }
  }, (err) => {
    console.log(err)
    next()
  })
}
