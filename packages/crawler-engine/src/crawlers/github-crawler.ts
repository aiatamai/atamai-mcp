import { Octokit } from '@octokit/rest';
import { readFileSync } from 'fs';
import { extname } from 'path';
import { CrawlJobData, CrawlJobResult } from '../queue/job-queue';
import { Job } from 'bullmq';

export interface GitHubFile {
  path: string;
  type: 'file' | 'dir';
  content?: string;
  url?: string;
}

export interface ExtractedContent {
  files: GitHubFile[];
  readme?: string;
  packageJson?: Record<string, unknown>;
  exampleCount: number;
}

/**
 * GitHub Repository Crawler
 * Extracts documentation, examples, and code from GitHub repositories
 */
export class GitHubCrawler {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(githubToken?: string) {
    this.octokit = new Octokit({
      auth: githubToken || process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Parse full name (owner/repo) into components
   */
  static parseFullName(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split('/');
    if (!owner || !repo) {
      throw new Error(`Invalid full name format: ${fullName}`);
    }
    return { owner, repo };
  }

  /**
   * Initialize crawler for a repository
   */
  async initialize(fullName: string): Promise<void> {
    const { owner, repo } = GitHubCrawler.parseFullName(fullName);
    this.owner = owner;
    this.repo = repo;

    try {
      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo,
      });
      console.log(`[GitHubCrawler] Initialized for ${fullName}`);
      console.log(`[GitHubCrawler] Repository: ${repoData.full_name} (${repoData.stargazers_count} stars)`);
    } catch (error) {
      throw new Error(`Failed to initialize crawler for ${fullName}: ${error.message}`);
    }
  }

  /**
   * Crawl repository and extract documentation, examples, and metadata
   */
  async crawl(job?: Job): Promise<ExtractedContent> {
    const content: ExtractedContent = {
      files: [],
      exampleCount: 0,
    };

    // Get README
    try {
      const readme = await this.getReadme();
      if (readme) {
        content.readme = readme;
        if (job) job.updateProgress(10);
      }
    } catch (error) {
      console.warn(`[GitHubCrawler] Could not fetch README: ${error.message}`);
    }

    // Get package.json
    try {
      const packageJson = await this.getPackageJson();
      if (packageJson) {
        content.packageJson = packageJson;
        if (job) job.updateProgress(20);
      }
    } catch (error) {
      console.warn(`[GitHubCrawler] Could not fetch package.json: ${error.message}`);
    }

    // Extract documentation files
    try {
      const docFiles = await this.getDocumentationFiles();
      content.files.push(...docFiles);
      if (job) job.updateProgress(50);
    } catch (error) {
      console.warn(`[GitHubCrawler] Could not fetch documentation: ${error.message}`);
    }

    // Extract example files
    try {
      const exampleFiles = await this.getExampleFiles();
      content.files.push(...exampleFiles);
      content.exampleCount = exampleFiles.length;
      if (job) job.updateProgress(80);
    } catch (error) {
      console.warn(`[GitHubCrawler] Could not fetch examples: ${error.message}`);
    }

    if (job) job.updateProgress(100);
    return content;
  }

  /**
   * Get repository README
   */
  private async getReadme(): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getReadme({
        owner: this.owner,
        repo: this.repo,
      });

      if (typeof data === 'string') {
        return data;
      }

      // Handle BufferEncoding
      const buffer = Buffer.from(data.content, 'base64');
      return buffer.toString('utf-8');
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get package.json (for JavaScript/TypeScript projects)
   */
  private async getPackageJson(): Promise<Record<string, unknown> | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'package.json',
      });

      if (Array.isArray(data)) {
        return null;
      }

      const buffer = Buffer.from(data.content, 'base64');
      const content = buffer.toString('utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Extract documentation files from docs/ or doc/ directories
   */
  private async getDocumentationFiles(): Promise<GitHubFile[]> {
    const files: GitHubFile[] = [];
    const docPaths = ['docs', 'doc', 'website', 'documentation'];

    for (const docPath of docPaths) {
      try {
        const dirFiles = await this.getFilesFromDirectory(docPath, /\.(md|markdown)$/i);
        files.push(...dirFiles);
        if (files.length > 0) break; // Stop after finding docs
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }

    return files;
  }

  /**
   * Extract example files from examples/ or example/ directories
   */
  private async getExampleFiles(): Promise<GitHubFile[]> {
    const files: GitHubFile[] = [];
    const examplePaths = ['examples', 'example', 'samples', 'demo', 'demos'];

    for (const examplePath of examplePaths) {
      try {
        const dirFiles = await this.getFilesFromDirectory(examplePath, /\.(js|ts|jsx|tsx|py|java)$/i);
        files.push(...dirFiles);
        if (files.length > 0) break;
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }

    return files;
  }

  /**
   * Recursively get files from a directory matching a pattern
   */
  private async getFilesFromDirectory(
    path: string,
    pattern: RegExp,
    maxFiles: number = 50,
  ): Promise<GitHubFile[]> {
    const files: GitHubFile[] = [];
    let fileCount = 0;

    const traverse = async (currentPath: string): Promise<void> => {
      if (fileCount >= maxFiles) return;

      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: currentPath,
        });

        if (!Array.isArray(data)) {
          return;
        }

        for (const item of data) {
          if (fileCount >= maxFiles) break;

          if (item.type === 'file' && pattern.test(item.path)) {
            try {
              const { data: fileData } = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: item.path,
              });

              if (!Array.isArray(fileData)) {
                const buffer = Buffer.from(fileData.content, 'base64');
                files.push({
                  path: item.path,
                  type: 'file',
                  content: buffer.toString('utf-8'),
                  url: fileData.html_url,
                });
                fileCount++;
              }
            } catch (error) {
              console.warn(`[GitHubCrawler] Failed to get file ${item.path}: ${error.message}`);
            }
          } else if (item.type === 'dir') {
            await traverse(item.path);
          }
        }
      } catch (error) {
        throw error;
      }
    };

    await traverse(path);
    return files;
  }

  /**
   * Get available versions (git tags with semantic versioning)
   */
  async getVersions(): Promise<string[]> {
    try {
      const { data: tags } = await this.octokit.repos.listTags({
        owner: this.owner,
        repo: this.repo,
        per_page: 100,
      });

      return tags
        .map((tag) => {
          // Clean version (remove 'v' prefix if present)
          return tag.name.replace(/^v/, '');
        })
        .filter((version) => {
          // Filter valid semver
          return /^\d+\.\d+\.\d+/.test(version);
        })
        .slice(0, 10); // Get latest 10 versions
    } catch (error) {
      console.warn(`[GitHubCrawler] Could not fetch versions: ${error.message}`);
      return [];
    }
  }

  /**
   * Process crawl job from queue
   */
  async processJob(job: Job<CrawlJobData>): Promise<CrawlJobResult> {
    const startTime = Date.now();
    const { libraryId, libraryName, fullName, version } = job.data;

    try {
      // Initialize crawler for repository
      await this.initialize(fullName);

      // Crawl repository
      const content = await this.crawl(job);

      // Count total items
      const pagesCrawled = (content.files?.length || 0) + (content.readme ? 1 : 0);

      return {
        jobId: job.id,
        libraryId,
        status: 'completed',
        pagesCrawled,
        pagesIndexed: pagesCrawled,
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
}
