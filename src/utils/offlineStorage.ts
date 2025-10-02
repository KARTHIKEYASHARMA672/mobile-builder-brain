// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = 'StudyBuddyDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('questions')) {
          const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
          questionStore.createIndex('userId', 'user_id');
          questionStore.createIndex('subject', 'subject');
          questionStore.createIndex('createdAt', 'created_at');
        }
        
        if (!db.objectStoreNames.contains('generatedContent')) {
          const contentStore = db.createObjectStore('generatedContent', { keyPath: 'id' });
          contentStore.createIndex('questionId', 'question_id');
          contentStore.createIndex('contentType', 'content_type');
        }
        
        if (!db.objectStoreNames.contains('quizzes')) {
          const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
          quizStore.createIndex('userId', 'user_id');
          quizStore.createIndex('questionId', 'question_id');
        }
        
        if (!db.objectStoreNames.contains('quizAttempts')) {
          const attemptStore = db.createObjectStore('quizAttempts', { keyPath: 'id' });
          attemptStore.createIndex('userId', 'user_id');
          attemptStore.createIndex('quizId', 'quiz_id');
        }
        
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: ['user_id', 'question_id'] });
        }
        
        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Questions
  async saveQuestion(question: any): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['questions'], 'readwrite');
    const store = transaction.objectStore('questions');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...question,
        offline: true,
        syncPending: true
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getQuestions(userId: string): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['questions'], 'readonly');
    const store = transaction.objectStore('questions');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getQuestionById(id: string): Promise<any | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['questions'], 'readonly');
    const store = transaction.objectStore('questions');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // Generated Content
  async saveContent(content: any): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['generatedContent'], 'readwrite');
    const store = transaction.objectStore('generatedContent');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...content,
        offline: true
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getContentForQuestion(questionId: string): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['generatedContent'], 'readonly');
    const store = transaction.objectStore('generatedContent');
    const index = store.index('questionId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(questionId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Quizzes
  async saveQuiz(quiz: any): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['quizzes'], 'readwrite');
    const store = transaction.objectStore('quizzes');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...quiz,
        offline: true
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getQuizzes(userId: string): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['quizzes'], 'readonly');
    const store = transaction.objectStore('quizzes');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Quiz Attempts
  async saveQuizAttempt(attempt: any): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['quizAttempts'], 'readwrite');
    const store = transaction.objectStore('quizAttempts');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...attempt,
        offline: true,
        syncPending: true
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getQuizAttempts(userId: string): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['quizAttempts'], 'readonly');
    const store = transaction.objectStore('quizAttempts');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Favorites
  async saveFavorite(favorite: any): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');
    
    return new Promise((resolve, reject) => {
      const request = store.put(favorite);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getFavorites(userId: string): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['favorites'], 'readonly');
    const store = transaction.objectStore('favorites');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const favorites = request.result.filter(fav => fav.user_id === userId);
        resolve(favorites);
      };
    });
  }

  async removeFavorite(userId: string, questionId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');
    
    return new Promise((resolve, reject) => {
      const request = store.delete([userId, questionId]);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Sync Management
  async addPendingSync(action: string, data: any): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    return new Promise((resolve, reject) => {
      const request = store.add({
        action,
        data,
        timestamp: Date.now()
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPendingSync(): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removePendingSync(id: number): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const storeNames = ['questions', 'generatedContent', 'quizzes', 'quizAttempts', 'favorites', 'pendingSync'];
    
    const transaction = db.transaction(storeNames, 'readwrite');
    
    return Promise.all(
      storeNames.map(storeName => {
        return new Promise<void>((resolve, reject) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      })
    ).then(() => {});
  }
}

export const offlineStorage = new OfflineStorage();

// Utility functions for offline detection and sync
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const registerOnlineListener = (callback: () => void): void => {
  window.addEventListener('online', callback);
};

export const registerOfflineListener = (callback: () => void): void => {
  window.addEventListener('offline', callback);
};

// Background sync registration
export const registerBackgroundSync = async (tag: string): Promise<void> => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const syncManager = (registration as any).sync;
      if (syncManager) {
        await syncManager.register(tag);
      }
    } catch (error) {
      // Background sync not available
    }
  }
};