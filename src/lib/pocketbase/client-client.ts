import PocketBase from 'pocketbase'

export const pbClient = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pbClient.autoCancellation(false)

export default pbClient
