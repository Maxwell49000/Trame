import { createApp } from 'vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import App from './App.vue'
import router from './router'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.prod.css'
import './styles/trame.css'

window.addEventListener('auth:unauthorized', () => {
    if (router.currentRoute.value.name !== 'Login') router.push('/login')
})

createApp(App).use(Quasar, quasarUserOptions).use(router).mount('#app')
