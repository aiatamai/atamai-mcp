import { marked } from 'marked';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import { Root, Heading, Paragraph, Code, CodeBlock } from 'mdast';

export interface ParsedMarkdown {
  title?: string;
  description?: string;
  content: string;
  headings: Heading[];
  codeBlocks: CodeBlock[];
  topics: string[];
  frontmatter?: Record<string, unknown>;
}

export interface ParsedHeading {
  level: number;
  text: string;
  slug: string;
}

/**
 * Markdown Parser
 * Parses markdown content and extracts structured data
 */
export class MarkdownParser {
  private processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml', 'toml']);

  /**
   * Parse markdown content
   */
  parse(content: string): ParsedMarkdown {
    const ast = this.processor.parse(content) as Root;
    const tree = this.processor.runSync(ast);

    const headings = this.extractHeadings(tree as Root);
    const codeBlocks = this.extractCodeBlocks(tree as Root);
    const topics = this.extractTopics(headings);
    const title = headings[0]?.text;
    const description = this.extractDescription(tree as Root);

    return {
      title,
      description,
      content,
      headings,
      codeBlocks,
      topics,
    };
  }

  /**
   * Extract all headings from markdown
   */
  private extractHeadings(tree: Root): Heading[] {
    const headings: Heading[] = [];

    const traverse = (node: any) => {
      if (node.type === 'heading') {
        const text = this.extractNodeText(node);
        headings.push({
          level: node.depth,
          text,
          slug: this.slugify(text),
        } as Heading);
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(tree);
    return headings;
  }

  /**
   * Extract all code blocks from markdown
   */
  private extractCodeBlocks(tree: Root): CodeBlock[] {
    const blocks: CodeBlock[] = [];

    const traverse = (node: any, context: string = '') => {
      if (node.type === 'code') {
        blocks.push({
          language: node.lang || 'text',
          code: node.value,
          meta: node.meta,
          context,
        } as CodeBlock);
      }

      if (node.children) {
        node.children.forEach((child: any) => traverse(child, context));
      }
    };

    traverse(tree);
    return blocks;
  }

  /**
   * Extract description (first paragraph)
   */
  private extractDescription(tree: Root): string | undefined {
    let foundHeading = false;

    for (const node of tree.children) {
      if (node.type === 'heading') {
        foundHeading = true;
        continue;
      }

      if (foundHeading && node.type === 'paragraph') {
        return this.extractNodeText(node as Paragraph);
      }
    }

    return undefined;
  }

  /**
   * Extract topics from headings
   */
  private extractTopics(headings: Heading[]): string[] {
    return headings
      .filter((h) => h.level <= 3)
      .map((h) => h.text.toLowerCase())
      .filter((text) => text.length > 3)
      .slice(0, 10);
  }

  /**
   * Extract plain text from node
   */
  private extractNodeText(node: any): string {
    if (node.type === 'text') {
      return node.value;
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map((child: any) => this.extractNodeText(child)).join('');
    }

    return '';
  }

  /**
   * Convert text to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Extract code examples with context
   */
  extractCodeExamples(content: string): Array<{
    language: string;
    code: string;
    context: string;
  }> {
    const examples: Array<{ language: string; code: string; context: string }> = [];

    // Match code blocks with markdown syntax
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2];

      // Extract preceding text as context (up to 200 chars)
      const startIndex = Math.max(0, match.index - 200);
      const context = content.substring(startIndex, match.index).trim();

      examples.push({
        language,
        code: code.trim(),
        context: context.split('\n').pop() || '',
      });
    }

    return examples;
  }

  /**
   * Chunk markdown into sections
   */
  chunkByHeadings(content: string, maxChunkLength: number = 2000): string[] {
    const chunks: string[] = [];
    const lines = content.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      currentChunk += line + '\n';

      // Start new chunk at heading or when size limit reached
      if ((line.startsWith('#') && currentChunk.length > 500) || currentChunk.length >= maxChunkLength) {
        chunks.push(currentChunk.trim());
        currentChunk = line + '\n'; // Keep heading in next chunk
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Extract table of contents from markdown
   */
  extractTableOfContents(content: string): ParsedHeading[] {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const toc: ParsedHeading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      toc.push({
        level,
        text,
        slug: this.slugify(text),
      });
    }

    return toc;
  }
}

// Type extensions for mdast
declare global {
  namespace Mdast {
    interface Heading {
      level: number;
      text: string;
      slug: string;
    }

    interface CodeBlock {
      language: string;
      code: string;
      meta?: string;
      context?: string;
    }
  }
}
