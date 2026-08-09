import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import { loadSession } from '../composables/useAuth.js'

const routes = [
    { path: '/login', name: 'Login', component: () => import('../pages/Login.vue'), meta: { public: true } },
    { path: '/', name: 'Home', component: Home },
    { path: '/users', name: 'Users', component: () => import('../pages/Users.vue'), meta: { admin: true } },
    { path: '/editor', name: 'Editor', component: () => import('../pages/Editor.vue') },
    { path: '/editor/:id', name: 'EditorEdit', component: () => import('../pages/Editor.vue') },
    { path: '/preview/:id', name: 'Preview', component: () => import('../pages/Preview.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async to => {
    let user = null
    try { user = await loadSession() } catch { user = null }
    if (to.meta.public) return user ? { name: 'Home' } : true
    if (!user) return { name: 'Login', query: { redirect: to.fullPath } }
    if (to.meta.admin && user.role !== 'ADMIN') return { name: 'Home' }
    return true
})

export default router
