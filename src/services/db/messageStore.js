import { openDB } from 'idb';

const DB_NAME = 'studymate-messages';
const DB_VERSION = 2;
const STORE_NAME = 'messages';

class MessageStore {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        async upgrade(db, oldVersion, newVersion, tx) {
          console.log(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}...`);

          let store;
          if (oldVersion < 1) {
            // Initial creation of the database
            store = db.createObjectStore(STORE_NAME, {
              keyPath: '_id'
            });
          } else {
            // Store should already exist, get it from the transaction
            store = tx.objectStore(STORE_NAME);
          }

          if (oldVersion < 1 || !store.indexNames.contains('conversationId')) {
            console.log("Creating 'conversationId' index.");
            store.createIndex('conversationId', 'conversationId', { unique: false });
          }

          if (oldVersion < 1 || !store.indexNames.contains('pending')) {
            console.log("Creating 'pending' index.");
            store.createIndex('pending', 'pending', { unique: false });
          }

          if (oldVersion > 0 && oldVersion < 2) {
            // Migration logic from v1 to v2: Ensure 'pending' field is boolean
            console.log("Running migration to v2: Ensuring 'pending' field is boolean for all messages.");
            let cursor = await store.openCursor();
            let updatesCount = 0;
            while (cursor) {
              const value = { ...cursor.value };
              if (typeof value.pending !== 'boolean') {
                console.log(`Migrating message ID ${value._id}: 'pending' was ${typeof value.pending} (${value.pending}), converting to boolean.`);
                value.pending = !!value.pending; // Coerce to boolean
                await cursor.update(value);
                updatesCount++;
              }
              cursor = await cursor.continue();
            }
            console.log(`Migration to v2 completed. Updated ${updatesCount} messages.`);
          }
          console.log("IndexedDB upgrade process finished.");
        },
      });
      console.log("IndexedDB initialized successfully.");
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  async addMessage(message) {
    if (!this.db) await this.initDB();
    try {
      const messageToAdd = {
        ...message,
        _id: message._id || `local-${Date.now()}`,
        timestamp: message.timestamp || new Date().toISOString(),
        pending: typeof message.pending === 'boolean' ? message.pending : (message.pending === undefined ? false : !!message.pending),
      };
      await this.db.add(STORE_NAME, messageToAdd);
    } catch (error) {
      console.error('Error adding message to IndexedDB:', error);
      if (error.name === 'ConstraintError') {
        console.warn(`Message with _id ${message._id || 'new local'} likely already exists. Attempting update instead or handle as needed.`);
      }
    }
  }

  async updateMessage(messageId, updates) {
    if (!this.db) await this.initDB();
    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const message = await store.get(messageId);
      if (message) {
        const updatesToApply = { ...updates };
        if (updatesToApply.hasOwnProperty('pending') && typeof updatesToApply.pending !== 'boolean') {
          updatesToApply.pending = !!updatesToApply.pending;
        }
        await store.put({
          ...message,
          ...updatesToApply,
          _id: messageId,
        });
      }
      await tx.done;
    } catch (error) {
      console.error('Error updating message in IndexedDB:', error);
    }
  }

  async getMessagesByConversation(conversationId) {
    if (!this.db) await this.initDB();
    try {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const index = tx.store.index('conversationId');
      return await index.getAll(conversationId);
    } catch (error) {
      console.error('Error getting messages by conversation from IndexedDB:', error);
      return [];
    }
  }

  async getPendingMessages() {
    if (!this.db) await this.initDB();
    try {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const index = tx.store.index('pending');
      return await index.getAll(true);
    } catch (error) {
      console.error('Error getting pending messages from IndexedDB:', error);
      return [];
    }
  }

  async deleteMessage(messageId) {
    if (!this.db) await this.initDB();
    try {
      await this.db.delete(STORE_NAME, messageId);
    } catch (error) {
      console.error('Error deleting message from IndexedDB:', error);
    }
  }

  async clearConversation(conversationId) {
    if (!this.db) await this.initDB();
    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const index = tx.store.index('conversationId');
      const messages = await index.getAllKeys(conversationId);
      await Promise.all(messages.map(key => tx.store.delete(key)));
      await tx.done;
    } catch (error) {
      console.error('Error clearing conversation from IndexedDB:', error);
    }
  }
}

export const messageStore = new MessageStore();
export default messageStore; 