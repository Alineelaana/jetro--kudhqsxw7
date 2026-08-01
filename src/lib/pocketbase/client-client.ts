import PocketBase, { LocalAuthStore } from 'pocketbase'

const pbClient = new PocketBase(import.meta.env.VITE_POCKETBASE_URL, {
  authStore: new LocalAuthStore('pb_client_auth'),
})
pbClient.autoCancellation(false)

export default pbClient
