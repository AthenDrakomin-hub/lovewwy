import { openDB, IDBPDatabase } from 'idb';
import { MediaFile } from './MediaService';

const DB_NAME = 'MediaManagerDB';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'mediaCache';

interface CacheEntry {
  key: string;  // 添加 key 属性
  data: any;
  timestamp: number;
  expiry: number; // Unix timestamp in milliseconds
}

class CacheService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'key' });
        }
      },
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.dbPromise;
      const cacheEntry = await db.get(OBJECT_STORE_NAME, key);

      if (!cacheEntry) {
        return null;
      }

      // Check if entry is expired
      if (Date.now() > cacheEntry.expiry) {
        await this.delete(key);
        return null;
      }

      return cacheEntry.data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): Promise<void> { // Default 5 minutes
    try {
      const db = await this.dbPromise;
      const cacheEntry: CacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttlMs,
      };

      await db.put(OBJECT_STORE_NAME, cacheEntry);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.delete(OBJECT_STORE_NAME, key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.clear(OBJECT_STORE_NAME);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async getCachedMediaList(prefix: string = ''): Promise<MediaFile[] | null> {
    const cacheKey = `media-list-${prefix}`;
    return this.get<MediaFile[]>(cacheKey);
  }

  async setCachedMediaList(mediaList: MediaFile[], prefix: string = '', ttlMs: number = 5 * 60 * 1000): Promise<void> {
    const cacheKey = `media-list-${prefix}`;
    await this.set(cacheKey, mediaList, ttlMs);
  }
}

const cacheService = new CacheService();
export default cacheService;