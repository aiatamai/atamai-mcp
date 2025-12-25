import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { URL } from 'url';
import { CrawlJobData, CrawlJobResult } from '../queue/job-queue';
import { Job } from 'bullmq';

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  type: 'guide' | 'api' | 'example' | 'other';
  topics: string[];
  depth: number;
}

/**
 * Documentation Site Scraper
 * Scrapes content from official documentation websites
 */
export class DocsScraper {
  private baseUrl: string;
  private scrapedUrls: Set<string> = new Set();
  private maxPages: number = 200;
  private maxDepth: number = 5;
  private delayMs: number = 500; // Respectful rate limiting

  constructor(baseUrl: string, maxPages: number = 200) {
    this.baseUrl = baseUrl;
    this.maxPages = maxPages;
  }

  /**
   * Scrape documentation site
   */
  async scrape(job?: Job): Promise<ScrapedPage[]> {
    const pages: ScrapedPage[] = [];

    try {
      const startUrl = new URL(this.baseUrl);
      await this.crawlPage(startUrl, pages, 0, job);
    } catch (error) {
      console.error(`[DocsScraper] Scraping failed: ${error.message}`);
    }

    console.log(`[DocsScraper] Scraped ${pages.length} pages from ${this.baseUrl}`);
    return pages;
  }

  /**
   * Recursively crawl pages from the documentation site
   */
  private async crawlPage(
    url: URL,
    pages: ScrapedPage[],
    depth: number,
    job?: Job,
  ): Promise<void> {
    // Check limits
    if (pages.length >= this.maxPages || depth > this.maxDepth) {
      return;
    }

    const urlString = url.toString();
    if (this.scrapedUrls.has(urlString)) {
      return;
    }

    this.scrapedUrls.add(urlString);

    // Respectful rate limiting
    await this.delay(this.delayMs);

    try {
      const response = await fetch(urlString, {
        headers: {
          'User-Agent': 'atamai-crawler/1.0 (+https://atamai.dev)',
        },
      });

      if (!response.ok) {
        console.warn(`[DocsScraper] HTTP ${response.status} for ${urlString}`);
        return;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract page content
      const title = $('h1').first().text() || $('title').text() || 'Untitled';
      const content = this.extractMainContent($);
      const type = this.classifyPageType(urlString, $);
      const topics = this.extractTopics($);

      if (content.length > 100) {
        // Only save pages with meaningful content
        pages.push({
          url: urlString,
          title,
          content,
          type,
          topics,
          depth,
        });

        if (job) {
          job.updateProgress((pages.length / this.maxPages) * 100);
        }
      }

      // Extract and enqueue child links
      const links = this.extractInternalLinks($, url);
      for (const link of links) {
        if (pages.length >= this.maxPages) break;
        await this.crawlPage(link, pages, depth + 1, job);
      }
    } catch (error) {
      console.warn(`[DocsScraper] Failed to scrape ${urlString}: ${error.message}`);
    }
  }

  /**
   * Extract main content from page
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try common content selectors
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.documentation',
      '.docs',
      '.page-content',
    ];

    for (const selector of selectors) {
      const $content = $(selector).first();
      if ($content.length > 0) {
        // Remove common unwanted elements
        $content.find('script, style, nav, header, footer, .sidebar, .toc').remove();
        const text = $content.text();
        if (text.length > 100) {
          return text.trim();
        }
      }
    }

    // Fallback: use body
    const $body = $('body');
    $body.find('script, style, nav, header, footer, .sidebar, .toc').remove();
    return $body.text().trim();
  }

  /**
   * Classify page type from URL and content
   */
  private classifyPageType(url: string, $: cheerio.CheerioAPI): ScrapedPage['type'] {
    if (url.includes('/api') || url.includes('/reference')) return 'api';
    if (url.includes('/guide') || url.includes('/tutorial')) return 'guide';
    if (url.includes('/example') || url.includes('/sample')) return 'example';
    if ($('h1').first().text().toLowerCase().includes('api')) return 'api';
    return 'other';
  }

  /**
   * Extract topics/keywords from page
   */
  private extractTopics($: cheerio.CheerioAPI): string[] {
    const topics: Set<string> = new Set();

    // Extract from headings
    $('h2, h3').each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text.length > 3 && text.length < 100) {
        topics.add(text);
      }
    });

    // Extract from meta keywords
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      keywords.split(',').forEach((kw) => {
        const trimmed = kw.trim().toLowerCase();
        if (trimmed.length > 3) {
          topics.add(trimmed);
        }
      });
    }

    return Array.from(topics).slice(0, 10);
  }

  /**
   * Extract internal links from page
   */
  private extractInternalLinks($: cheerio.CheerioAPI, baseUrl: URL): URL[] {
    const links: URL[] = [];
    const baseHost = baseUrl.hostname;

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      try {
        const url = new URL(href, baseUrl.toString());

        // Only follow internal links
        if (url.hostname === baseHost && !url.hash.includes('//')) {
          // Avoid hash-only links
          if (url.toString() !== baseUrl.toString()) {
            links.push(url);
          }
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });

    // Deduplicate
    const uniqueUrls = Array.from(new Map(links.map((url) => [url.toString(), url])).values());
    return uniqueUrls.slice(0, 20); // Limit concurrent requests
  }

  /**
   * Helper: delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Process crawl job from queue
   */
  async processJob(job: Job<CrawlJobData>): Promise<CrawlJobResult> {
    const startTime = Date.now();
    const { libraryId, libraryName } = job.data;

    try {
      // Set base URL from repository or use default docs domain
      const docsUrl = this.getDocsUrl(job.data);
      this.baseUrl = docsUrl;

      // Scrape documentation
      const pages = await this.scrape(job);

      return {
        jobId: job.id,
        libraryId,
        status: 'completed',
        pagesCrawled: pages.length,
        pagesIndexed: pages.length,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        jobId: job.id,
        libraryId,
        status: 'failed',
        pagesCrawled: 0,
        pagesIndexed: 0,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Determine documentation URL from job data
   */
  private getDocsUrl(data: CrawlJobData): string {
    // Check metadata first
    if (data.metadata?.docsUrl) {
      return data.metadata.docsUrl as string;
    }

    // Try common documentation URLs
    const { fullName } = data;
    const [owner, repo] = fullName.split('/');

    // Common patterns
    const patterns = [
      `https://${repo}.dev`,
      `https://${repo}.io`,
      `https://${owner}.github.io/${repo}`,
      `https://docs.${owner}.com`,
      `https://${repo}.readthedocs.io`,
    ];

    // Return first pattern (in production, these should be validated)
    return patterns[0];
  }
}
