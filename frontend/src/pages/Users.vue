<template>
  <q-page class="trame-users-page">
    <header class="users-heading">
      <div><span>ÉQUIPE & ACCÈS</span><h1>Les membres de l’atelier</h1><p>Gérez les personnes autorisées à créer et administrer les projets.</p></div>
      <q-btn color="primary" no-caps icon="person_add" label="Inviter un membre" class="trame-primary-btn" @click="dialogOpen = true" />
    </header>
    <q-card class="users-card">
      <q-card-section class="row items-center">
        <div>
          <div class="text-h6">Utilisateurs</div>
          <div class="text-subtitle2 text-grey-7">Comptes autorisés à gérer les sites</div>
        </div>
        <q-space />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table :rows="users" :columns="columns" row-key="id" :loading="loading" flat>
          <template #body-cell-role="props">
            <q-td :props="props">
              <q-select
                :model-value="props.row.role"
                :options="roleOptions"
                emit-value
                map-options
                dense
                outlined
                :disable="props.row.id === currentUser?.id"
                @update:model-value="value => updateUser(props.row, { role: value })"
              />
            </q-td>
          </template>
          <template #body-cell-isActive="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.isActive"
                :disable="props.row.id === currentUser?.id"
                @update:model-value="value => updateUser(props.row, { isActive: value })"
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round dense color="primary" icon="password" @click="openPasswordReset(props.row)">
                <q-tooltip>Réinitialiser le mot de passe</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                :disable="props.row.id === currentUser?.id"
                @click="removeUser(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 100%; max-width: 520px">
        <q-form @submit.prevent="createUser">
          <q-card-section>
            <div class="text-h6">Créer un utilisateur</div>
          </q-card-section>
          <q-card-section class="q-gutter-md">
            <q-input v-model.trim="form.name" label="Nom" outlined required />
            <q-input v-model.trim="form.email" type="email" label="Email" outlined required />
            <q-input v-model="form.password" type="password" label="Mot de passe" hint="12 caractères minimum" outlined required />
            <q-select v-model="form.role" :options="roleOptions" emit-value map-options label="Rôle" outlined />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Annuler" v-close-popup />
            <q-btn type="submit" color="primary" label="Créer" :loading="saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="resetDialogOpen">
      <q-card style="width: 100%; max-width: 480px">
        <q-form @submit.prevent="resetPassword">
          <q-card-section><div class="text-h6">Réinitialiser le mot de passe</div></q-card-section>
          <q-card-section class="q-gutter-md">
            <div>Compte : {{ resetTarget?.name }}</div>
            <q-input v-model="resetPasswordValue" type="password" label="Nouveau mot de passe" hint="12 caractères minimum" outlined required minlength="12" />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Annuler" v-close-popup />
            <q-btn type="submit" color="primary" label="Réinitialiser" :loading="saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from '../composables/useAuth.js'

const $q = useQuasar()
const { apiFetch, user: currentUser } = useAuth()
const users = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const resetDialogOpen = ref(false)
const resetTarget = ref(null)
const resetPasswordValue = ref('')
const roleOptions = [
  { label: 'Utilisateur', value: 'USER' },
  { label: 'Administrateur', value: 'ADMIN' }
]
const columns = [
  { name: 'name', label: 'Nom', field: 'name', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'role', label: 'Rôle', field: 'role', align: 'left', style: 'width: 190px' },
  { name: 'isActive', label: 'Actif', field: 'isActive', align: 'center', style: 'width: 90px' },
  { name: 'actions', label: '', align: 'right', style: 'width: 110px' }
]
const form = reactive({ name: '', email: '', password: '', role: 'USER' })

async function responseError(response) {
  const data = await response.json().catch(() => null)
  if (Array.isArray(data?.error)) return data.error[0]?.message || 'Requête invalide'
  return data?.error || `Erreur HTTP ${response.status}`
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await apiFetch('/users')
    if (!response.ok) throw new Error(await responseError(response))
    users.value = await response.json()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    loading.value = false
  }
}

async function createUser() {
  saving.value = true
  try {
    const response = await apiFetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!response.ok) throw new Error(await responseError(response))
    dialogOpen.value = false
    Object.assign(form, { name: '', email: '', password: '', role: 'USER' })
    await loadUsers()
    $q.notify({ type: 'positive', message: 'Utilisateur créé' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    saving.value = false
  }
}

async function updateUser(row, changes) {
  try {
    const response = await apiFetch(`/users/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes)
    })
    if (!response.ok) throw new Error(await responseError(response))
    Object.assign(row, await response.json())
    $q.notify({ type: 'positive', message: 'Utilisateur mis à jour' })
  } catch (error) {
    await loadUsers()
    $q.notify({ type: 'negative', message: error.message })
  }
}

async function removeUser(row) {
  if (!confirm(`Supprimer le compte de ${row.name} ? Ses sites resteront accessibles aux administrateurs.`)) return
  try {
    const response = await apiFetch(`/users/${row.id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(await responseError(response))
    await loadUsers()
    $q.notify({ type: 'positive', message: 'Utilisateur supprimé' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  }
}

function openPasswordReset(row) {
  resetTarget.value = row
  resetPasswordValue.value = ''
  resetDialogOpen.value = true
}

async function resetPassword() {
  saving.value = true
  try {
    const response = await apiFetch(`/users/${resetTarget.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPasswordValue.value })
    })
    if (!response.ok) throw new Error(await responseError(response))
    resetDialogOpen.value = false
    $q.notify({ type: 'positive', message: 'Mot de passe réinitialisé ; les sessions du compte ont été fermées' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    saving.value = false
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.trame-users-page { padding: clamp(30px, 5vw, 70px); max-width: 1400px; margin: 0 auto; }
.users-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; padding-bottom: 28px; margin-bottom: 34px; border-bottom: 1px solid var(--trame-ink); }.users-heading span { color: var(--trame-red); font: 750 10px "IBM Plex Mono", monospace; letter-spacing: .15em; }.users-heading h1 { margin: 12px 0 10px; font: 750 clamp(38px, 6vw, 66px)/.95 Georgia, serif; letter-spacing: -.045em; }.users-heading p { margin: 0; color: var(--trame-muted); }
.users-card { border: 1px solid var(--trame-ink); background: var(--trame-paper-light); }.users-card :deep(.q-table__container), .users-card :deep(table) { background: var(--trame-paper-light); }.users-card :deep(th) { color: var(--trame-muted); font: 700 10px "IBM Plex Mono", monospace; text-transform: uppercase; letter-spacing: .1em; }
@media(max-width:700px){.users-heading{align-items:flex-start;flex-direction:column}.users-heading .q-btn{width:100%}}
</style>
