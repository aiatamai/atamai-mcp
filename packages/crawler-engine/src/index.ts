import { JobQueueManager, CrawlJobData } from './queue/job-queue';
import { GitHubCrawler } from './crawlers/github-crawler';
import { DocsScraper } from './crawlers/docs-scraper';
import { MarkdownParser } from './parsers/markdown-parser';
import { CodeExtractor } from './parsers/code-extractor';

/**
 * Crawler Engine Main Entry Point
 * Orchestrates crawling, parsing, and processing of documentation
 */
export class CrawlerEngine {
  private jobQueue: JobQueueManager;
  private githubCrawler: GitHubCrawler;
  private docsScraper: DocsScraper;
  private markdownParser: MarkdownParser;
  private codeExtractor: CodeExtractor;

  constructor(
    private redisHost: string = 'localhost',
    private redisPort: number = 6379,
  ) {
    this.jobQueue = new JobQueueManager(redisHost, redisPort);
    this.githubCrawler = new GitHubCrawler();
    this.docsScraper = new DocsScraper('');
    this.markdownParser = new MarkdownParser();
    this.codeExtractor = new CodeExtractor();
  }

  /**
   * Initialize the crawler engine
   */
  async initialize(): Promise<void> {
    console.log('[CrawlerEngine] Initializing...');
    await this.jobQueue.initialize();
    console.log('[CrawlerEngine] Ready');
  }

  /**
   * Register crawl job processors
   */
  async registerProcessors(): Promise<void> {
    // GitHub crawler processor
    this.jobQueue.registerWorker('github-crawler', async (job) => {
      return this.githubCrawler.processJob(job);
    });

    // Docs scraper processor
    this.jobQueue.registerWorker('docs-scraper', async (job) => {
      return this.docsScraper.processJob(job);
    });

    console.log('[CrawlerEngine] Processors registered');
  }

  /**
   * Queue a library for crawling
   */
  async queueCrawl(data: CrawlJobData, priority: number = 10): Promise<string> {
    const job = await this.jobQueue.addJob(data, { priority });
    return job.id || '';
  }

  /**
   * Get crawl job status
   */
  async getJobStatus(jobId: string) {
    return this.jobQueue.getJobStatus(jobId);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return this.jobQueue.getQueueStats();
  }

  /**
   * Shutdown crawler engine
   */
  async shutdown(): Promise<void> {
    await this.jobQueue.shutdown();
    console.log('[CrawlerEngine] Shut down');
  }
}

// Export types and classes for external use
export { JobQueueManager, CrawlJobData, CrawlJobResult } from './queue/job-queue';
export { GitHubCrawler, ExtractedContent, GitHubFile } from './crawlers/github-crawler';
export { DocsScraper, ScrapedPage } from './crawlers/docs-scraper';
export { MarkdownParser, ParsedMarkdown, ParsedHeading } from './parsers/markdown-parser';
export { CodeExtractor, ExtractedCodeExample, CodeAnalysis } from './parsers/code-extractor';

// Main execution
async function main() {
  const engine = new CrawlerEngine(
    process.env.REDIS_HOST || 'localhost',
    parseInt(process.env.REDIS_PORT || '6379', 10),
  );

  try {
    await engine.initialize();
    await engine.registerProcessors();

    console.log('[CrawlerEngine] Started and ready for jobs');

    // Cleanup old jobs every hour
    setInterval(async () => {
      const removed = await engine.getQueueStats();
      console.log('[CrawlerEngine] Queue stats:', removed);
    }, 60000);

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[CrawlerEngine] Received SIGTERM, shutting down...');
      await engine.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error('[CrawlerEngine] Failed to start:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default CrawlerEngine;
