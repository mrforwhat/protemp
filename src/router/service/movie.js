export default [{
  path: '/movie',
  name: 'movieIndex',
  component: () => import('@/views/movie/root'),
  children: [{
    path: 'home',
    name: 'movieHome',
    meta: {
      needLogin: false,
      title: '兜有电影票'
    },
    component: ()=> import('@/views/movie/home')
  }]
}]
