import { Queue, Worker, QueueOptions, Job } from 'bullmq';
import Redis from 'ioredis';

export interface CrawlJobData {
  libraryId: string;
  libraryName: string;
  fullName: string; // org/project
  version: string;
  repositoryUrl: string;
  crawlType: 'github' | 'docs-site' | 'full';
  metadata?: Record<string, unknown>;
}

export interface CrawlJobResult {
  jobId: string;
  libraryId: string;
  status: 'completed' | 'failed';
  pagesCrawled: number;
  pagesIndexed: number;
  error?: string;
  duration: number;
  timestamp: Date;
}

/**
 * BullMQ Job Queue Manager
 * Manages crawler job scheduling, processing, and monitoring
 */
export class JobQueueManager {
  private queue!: Queue<CrawlJobData>;
  private redis: Redis;
  private workers: Map<string, Worker> = new Map();

  constructor(
    private redisHost: string = 'localhost',
    private redisPort: number = 6379,
  ) {
    this.redis = new Redis({
      host: this.redisHost,
      port: this.redisPort,
      db: 2, // Use DB 2 for queue
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null,
    });
  }

  /**
   * Initialize the job queue
   */
  async initialize(): Promise<void> {
    const queueOptions: QueueOptions = {
      connection: {
        host: this.redisHost,
        port: this.redisPort,
        db: 2,
      },
    };

    this.queue = new Queue<CrawlJobData>('crawler:jobs', queueOptions);

    this.queue.on('error', (err) => {
      console.error('[JobQueue] Queue error:', err.message);
    });

    console.log('[JobQueue] Initialized with BullMQ');
  }

  /**
   * Add a crawl job to the queue
   */
  async addJob(data: CrawlJobData, options?: { priority?: number; delay?: number }): Promise<Job<CrawlJobData>> {
    if (!this.queue) {
      throw new Error('Queue not initialized. Call initialize() first.');
    }

    const job = await this.queue.add('crawl', data, {
      priority: options?.priority || 10,
      delay: options?.delay || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false, // Keep job history
      removeOnFail: false,
    });

    console.log(`[JobQueue] Added job ${job.id} for ${data.libraryName}`);
    return job;
  }

  /**
   * Register a job processor worker
   */
  registerWorker(
    processorName: string,
    processor: (job: Job<CrawlJobData>) => Promise<CrawlJobResult>,
  ): Worker<CrawlJobData> {
    if (this.workers.has(processorName)) {
      throw new Error(`Worker "${processorName}" already registered`);
    }

    const worker = new Worker<CrawlJobData>(
      'crawler:jobs',
      async (job) => {
        const startTime = Date.now();
        try {
          console.log(`[Worker] Processing job ${job.id}: ${job.data.libraryName}`);
          const result = await processor(job);
          const duration = Date.now() - startTime;
          console.log(`[Worker] Completed job ${job.id} in ${duration}ms`);
          return { ...result, duration };
        } catch (error: any) {
          const duration = Date.now() - startTime;
          console.error(`[Worker] Job ${job.id} failed:`, error?.message || 'Unknown error');
          throw error;
        }
      },
      {
        connection: {
          host: this.redisHost,
          port: this.redisPort,
          db: 2,
        },
        concurrency: 3, // Process 3 jobs in parallel
      },
    );

    worker.on('completed', (job, returnvalue) => {
      console.log(`[Worker] Job ${job.id} completed:`, returnvalue);
    });

    worker.on('failed', (job, err) => {
      if (job) {
        console.error(`[Worker] Job ${job.id} failed:`, err?.message || 'Unknown error');
      }
    });

    this.workers.set(processorName, worker);
    console.log(`[JobQueue] Registered worker: ${processorName}`);
    return worker;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<{ state: string; progress: number; data: CrawlJobData } | null> {
    if (!this.queue) return null;

    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    return {
      state: await job.getState(),
      progress: (job.progress && typeof job.progress === 'function' ? job.progress() : job.progress) || 0,
      data: job.data,
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    if (!this.queue) {
      return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Clean up old jobs
   */
  async cleanupOldJobs(olderThanMs: number = 86400000): Promise<number> {
    if (!this.queue) return 0;

    const removed = await this.queue.clean(olderThanMs, 1000);
    console.log(`[JobQueue] Cleaned up ${removed.length} old jobs`);
    return removed.length;
  }

  /**
   * Shutdown the queue and workers
   */
  async shutdown(): Promise<void> {
    for (const [name, worker] of this.workers.entries()) {
      await worker.close();
      console.log(`[JobQueue] Closed worker: ${name}`);
    }

    if (this.queue) {
      await this.queue.close();
      console.log('[JobQueue] Closed queue');
    }

    await this.redis.quit();
    console.log('[JobQueue] Disconnected from Redis');
  }
}
