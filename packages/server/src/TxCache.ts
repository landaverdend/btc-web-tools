export interface CacheEntry {
  serializedTx: string;
  txJson: any;
}

export class TxCache {
  private cache = new Map<string, CacheEntry>();
  private insertionOrder: string[] = [];
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  // Core methods
  get(key: string): CacheEntry | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: CacheEntry): void {
    // If key already exists, remove it from insertion order first
    if (this.cache.has(key)) {
      this.removeFromInsertionOrder(key);
    }

    // Check if we need to evict the oldest entry
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    // Add the new entry
    this.cache.set(key, value);
    this.insertionOrder.push(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.insertionOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  // Utility methods
  getMaxSize(): number {
    return this.maxSize;
  }

  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
    // Evict entries if new max size is smaller than current size
    while (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  // Private helper methods
  private evictOldest(): void {
    if (this.insertionOrder.length === 0) return;
    
    const oldestKey = this.insertionOrder.shift()!;
    this.cache.delete(oldestKey);
  }

  private removeFromInsertionOrder(key: string): void {
    const index = this.insertionOrder.indexOf(key);
    if (index > -1) {
      this.insertionOrder.splice(index, 1);
    }
  }
}
