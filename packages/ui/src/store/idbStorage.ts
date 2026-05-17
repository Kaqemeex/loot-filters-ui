import { createIndexedDBStorage } from 'zustand-indexeddb'

export const idbStorage = createIndexedDBStorage('loot-filters', 'store')
