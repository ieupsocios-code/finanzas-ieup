import { createClient } from '@supabase/supabase-js';

// Reemplazar con tus credenciales de Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'tu-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sistema de sincronización offline
class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue();
    this.isOnline = navigator.onLine;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  loadQueue() {
    try {
      return JSON.parse(localStorage.getItem('offlineQueue')) || [];
    } catch {
      return [];
    }
  }

  saveQueue() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  }

  add(operation) {
    operation.timestamp = new Date().toISOString();
    operation.id = `${Date.now()}-${Math.random()}`;
    this.queue.push(operation);
    this.saveQueue();
    return operation.id;
  }

  async syncQueue() {
    if (!this.isOnline || this.queue.length === 0) return;

    const toRemove = [];
    for (const operation of this.queue) {
      try {
        if (operation.type === 'insert') {
          await supabase.from(operation.table).insert(operation.data);
          toRemove.push(operation.id);
        } else if (operation.type === 'update') {
          await supabase
            .from(operation.table)
            .update(operation.data)
            .eq('id', operation.id);
          toRemove.push(operation.id);
        } else if (operation.type === 'delete') {
          await supabase.from(operation.table).delete().eq('id', operation.id);
          toRemove.push(operation.id);
        }
      } catch (error) {
        console.error('Error syncing operation:', error);
      }
    }

    this.queue = this.queue.filter(op => !toRemove.includes(op.id));
    this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueue();
