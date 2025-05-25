import { openDB, DBSchema } from 'idb';
import { getSupabaseClient } from './supabase';

interface PriceEntry {
  id?: string;
  user_id: string;
  product_id: string;
  supplier_id: string;
  price: number;
  quantity: number;
  notes: string;
  entry_date: string;
  created_at?: string;
  synced?: boolean;
}

interface OfflineDB extends DBSchema {
  'price-entries': {
    key: string;
    value: PriceEntry;
    indexes: { 'by-sync': boolean };
  };
}

const DB_NAME = 'borabuy-offline';
const STORE_NAME = 'price-entries';

export const initDB = async () => {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('by-sync', 'synced');
    },
  });
};

export const addOfflinePriceEntry = async (entry: PriceEntry) => {
  const db = await initDB();
  entry.synced = false;
  entry.created_at = new Date().toISOString();
  return db.add(STORE_NAME, entry);
};

export const getUnsynedEntries = async () => {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, 'by-sync', false);
};

export const markEntrySynced = async (id: string) => {
  const db = await initDB();
  const entry = await db.get(STORE_NAME, id);
  if (entry) {
    entry.synced = true;
    await db.put(STORE_NAME, entry);
  }
};

export const syncOfflineData = async () => {
  if (!navigator.onLine) return;

  const unsynedEntries = await getUnsynedEntries();
  if (unsynedEntries.length === 0) return;

  const supabase = getSupabaseClient();

  for (const entry of unsynedEntries) {
    try {
      const { error } = await supabase
        .from('price_entries')
        .insert({
          user_id: entry.user_id,
          product_id: entry.product_id,
          supplier_id: entry.supplier_id,
          price: entry.price,
          quantity: entry.quantity,
          notes: entry.notes,
          entry_date: entry.entry_date,
          created_at: entry.created_at,
        });

      if (!error && entry.id) {
        await markEntrySynced(entry.id);
      }
    } catch (error) {
      console.error('Error syncing entry:', error);
    }
  }
};

export const setupOfflineSync = () => {
  // Attempt to sync when coming back online
  window.addEventListener('online', () => {
    syncOfflineData();
  });

  // Periodic sync attempt every 5 minutes if online
  setInterval(() => {
    if (navigator.onLine) {
      syncOfflineData();
    }
  }, 5 * 60 * 1000);
};

export const isOnline = () => navigator.onLine; 