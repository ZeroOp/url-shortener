import axios from 'axios';

class IdGeneratorService {
  private currentId: number = 0;
  private maxId: number = 0;
  private isFetching: boolean = false; // Flag to prevent redundant background calls
  private readonly MIN_OFFSET = 14776336;
  private readonly SHUFFLED_BASE62 = "w5N9pG2zL7mX1rQ8vV4bS6nJ3kH0tY5uI1oP9aD2sF8gJ3hK6lZ7xC0mB4nM";
  private readonly COUNTER_URL = process.env.COUNTER_SERVICE_URL;

  async getNextShortCode(): Promise<string> {
    // 1. PROACTIVE PREFETCH: 
    // If we're halfway through the batch and NOT already fetching, trigger a background load.
    if (!this.isFetching && (this.maxId - this.currentId <= 1500) && this.maxId !== 0) {
      console.log('[IdGenerator] Threshold reached. Prefetching next batch in background...');
      // We do NOT 'await' here. Let it run in the background.
      this.fetchNewRange(); 
    }

    // 2. EMERGENCY WAIT: 
    // If for some reason we actually run out before the prefetch finishes, we MUST wait.
    if (this.currentId >= this.maxId) {
      console.warn('[IdGenerator] Emergency! IDs exhausted. Waiting for fetch...');
      await this.fetchNewRange();
    }

    const id = this.currentId++;
    return this.encode(id + this.MIN_OFFSET);
  }

  private async fetchNewRange() {
    if (this.isFetching) return;
    
    this.isFetching = true;
    try {
      const response = await axios.post(`${this.COUNTER_URL}/api/id-gen/next-range`);
      
      // Update maxId to the new upper limit. 
      // We don't touch currentId if it's already running, 
      // unless it's the very first time (startup).
      if (this.maxId === 0) {
        this.currentId = response.data.start;
      }
      
      this.maxId = response.data.end;
      console.log(`[IdGenerator] Batch acquired. New MaxID: ${this.maxId}`);
    } catch (err) {
      console.error('[IdGenerator] Background fetch failed:', err);
    } finally {
      this.isFetching = false;
    }
  }

  private encode(num: number): string {
    if (num === 0) return this.SHUFFLED_BASE62[0];
    let encoded = "";
    while (num > 0) {
      encoded = this.SHUFFLED_BASE62[num % 62] + encoded;
      num = Math.floor(num / 62);
    }
    return encoded;
  }
}

export const idGenerator = new IdGeneratorService();