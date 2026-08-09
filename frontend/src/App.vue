<template>
  <q-layout view="lHh Lpr lFf" class="trame-app">
    <q-header class="trame-header">
      <q-toolbar class="trame-toolbar">
        <q-toolbar-title class="trame-brand cursor-pointer" @click="goHome()">
          <span class="trame-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <span>TRAME</span>
          <small class="gt-sm">atelier de pages</small>
        </q-toolbar-title>
        <template v-if="user">
          <q-btn v-if="isAdmin" flat no-caps icon="manage_accounts" label="Équipe" to="/users" class="trame-nav-btn" />
          <div class="trame-user gt-xs"><span>{{ user.name }}</span><small>{{ isAdmin ? 'Administrateur' : 'Créateur' }}</small></div>
          <q-btn flat round icon="password" aria-label="Changer le mot de passe" class="trame-icon-btn" @click="passwordDialog = true">
            <q-tooltip>Changer le mot de passe</q-tooltip>
          </q-btn>
          <q-btn flat round icon="logout" aria-label="Déconnexion" class="trame-icon-btn" @click="handleLogout">
            <q-tooltip>Déconnexion</q-tooltip>
          </q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="passwordDialog">
      <q-card class="trame-dialog" style="width: 100%; max-width: 480px">
        <q-form @submit.prevent="handlePasswordChange">
          <q-card-section><div class="text-h6">Changer mon mot de passe</div></q-card-section>
          <q-card-section class="q-gutter-md">
            <q-input v-model="passwordForm.currentPassword" type="password" label="Mot de passe actuel" outlined required />
            <q-input v-model="passwordForm.newPassword" type="password" label="Nouveau mot de passe" hint="12 caractères minimum" outlined required minlength="12" />
            <q-input v-model="passwordForm.confirmPassword" type="password" label="Confirmer le nouveau mot de passe" outlined required minlength="12" />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Annuler" v-close-popup />
            <q-btn type="submit" color="primary" label="Enregistrer" :loading="passwordSaving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from './composables/useAuth.js'

const router = useRouter()
const $q = useQuasar()
const { user, isAdmin, logout, apiFetch } = useAuth()
const passwordDialog = ref(false)
const passwordSaving = ref(false)
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

function goHome() {
  router.push('/')
}

async function handleLogout() {
  await logout()
  router.push('/login')
}

async function handlePasswordChange() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    return $q.notify({ type: 'negative', message: 'Les nouveaux mots de passe ne correspondent pas' })
  }
  passwordSaving.value = true
  try {
    const response = await apiFetch('/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })
    const data = response.ok ? null : await response.json().catch(() => null)
    if (!response.ok) throw new Error(Array.isArray(data?.error) ? data.error[0]?.message : data?.error || 'Modification impossible')
    Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
    passwordDialog.value = false
    $q.notify({ type: 'positive', message: 'Mot de passe modifié ; les autres sessions ont été fermées' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    passwordSaving.value = false
  }
}
</script>

