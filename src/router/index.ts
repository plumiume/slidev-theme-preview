import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Slidev Theme Gallery' }
  },
  {
    path: '/preview/:themeName',
    name: 'preview',
    component: () => import('@/views/PreviewView.vue'),
    meta: { title: 'Preview' }
  },
  {
    path: '/detail/:themeName',
    name: 'detail',
    component: () => import('@/views/DetailView.vue'),
    meta: { title: 'Theme Detail' }
  },
  {
    path: '/submit',
    name: 'submit',
    component: () => import('@/views/SubmitView.vue'),
    meta: { title: 'Submit Your Theme' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  const baseTitle = 'Slidev Theme Preview'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
  next()
})

export default router
