import PocketBase from 'pocketbase'

const CLIENT_KEY = 'pb_client_auth'

const pbClient = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pbClient.autoCancellation(false)

try {
  const AuthStoreClass = pbClient.authStore.constructor as { new (storageKey?: string): any }
  pbClient.authStore = new AuthStoreClass(CLIENT_KEY)
} catch {
  /* intentionally ignored */
}

export default pbClient
