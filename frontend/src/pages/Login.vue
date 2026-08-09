<template>
  <q-page class="trame-login-page">
    <section class="trame-login-story">
      <div class="story-grid" aria-hidden="true"></div>
      <div class="story-content">
        <div class="story-kicker">ATELIER NUMÉRIQUE / 01</div>
        <h1>Donnez une forme<br><em>juste</em> à vos idées.</h1>
        <p>Composez une page, observez-la prendre vie, puis exportez un site statique prêt à publier.</p>
        <div class="story-preview" aria-hidden="true">
          <div class="story-window-bar"><span></span><span></span><span></span></div>
          <div class="story-layout"><b>TRAME</b><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="story-foot">COMPOSER · PRÉVISUALISER · PUBLIER</div>
    </section>

    <section class="trame-login-panel">
      <div class="login-form-wrap">
        <div class="login-brand">
          <span class="trame-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <strong>TRAME</strong>
        </div>
        <div class="login-heading">
          <span>ESPACE DE CRÉATION</span>
          <h2>Bon retour à l’atelier.</h2>
          <p>Connectez-vous pour retrouver vos projets.</p>
        </div>
        <q-form @submit.prevent="submit" class="login-form">
          <q-input v-model.trim="email" type="email" label="Adresse email" autocomplete="username" outlined required />
          <q-input v-model="password" :type="showPassword ? 'text' : 'password'" label="Mot de passe" autocomplete="current-password" outlined required>
            <template #append>
              <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword" />
            </template>
          </q-input>
          <q-banner v-if="error" class="trame-error-banner">{{ error }}</q-banner>
          <q-btn type="submit" color="primary" no-caps label="Entrer dans l’atelier" :loading="loading" class="trame-primary-btn full-width" icon-right="arrow_forward" />
        </q-form>
        <div class="login-security"><q-icon name="verified_user" /> Session sécurisée · données isolées par utilisateur</div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const route = useRoute()
const router = useRouter()
const { login } = useAuth()

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
