export interface ExtractedCodeExample {
  language: string;
  code: string;
  description: string;
  topics: string[];
  context: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CodeAnalysis {
  language: string;
  functions: string[];
  classes: string[];
  imports: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Code Extractor
 * Extracts and analyzes code examples from documentation
 */
export class CodeExtractor {
  /**
   * Extract code examples from mixed content (markdown + code blocks)
   */
  extractExamples(content: string, language?: string): ExtractedCodeExample[] {
    const examples: ExtractedCodeExample[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/gm;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const blockLanguage = match[1] || language || 'text';
      const code = match[2];

      // Skip very short snippets
      if (code.trim().length < 20) continue;

      // Extract context (preceding text)
      const startIndex = Math.max(0, match.index - 300);
      const precedingText = content.substring(startIndex, match.index);
      const context = this.extractContext(precedingText);
      const description = this.generateDescription(code, context);
      const topics = this.extractTopics(code, precedingText);
      const difficulty = this.calculateDifficulty(code);

      examples.push({
        language: blockLanguage,
        code: code.trim(),
        description,
        topics,
        context,
        difficulty,
      });
    }

    return examples;
  }

  /**
   * Extract context from preceding text
   */
  private extractContext(text: string): string {
    const lines = text.split('\n');
    const lastLine = lines[lines.length - 1]?.trim();
    const lastHeading = lines
      .reverse()
      .find((line) => line.startsWith('#'))
      ?.trim();

    return lastHeading || lastLine || '';
  }

  /**
   * Generate human-readable description from code
   */
  private generateDescription(code: string, context: string): string {
    // Try to extract meaningful comment or context
    const commentMatch = code.match(/\/\/\s*(.+)$/m);
    if (commentMatch) {
      return commentMatch[1];
    }

    const docstringMatch = code.match(/"""\s*(.+?)\s*"""/);
    if (docstringMatch) {
      return docstringMatch[1];
    }

    // Fall back to context
    if (context) {
      return context.replace(/^#+\s*/, '');
    }

    return 'Code example';
  }

  /**
   * Extract topics/keywords from code
   */
  private extractTopics(code: string, context: string): string[] {
    const topics = new Set<string>();

    // Extract function/class names
    const names = code.match(/(?:function|class|const|let|var)\s+(\w+)/g) || [];
    names.forEach((name) => {
      const match = name.match(/\s+(\w+)/);
      if (match) topics.add(match[1].toLowerCase());
    });

    // Extract from context headings
    const headingMatch = context.match(/#+\s+(.+)/);
    if (headingMatch) {
      headingMatch[1]
        .toLowerCase()
        .split(/\s+/)
        .forEach((word) => {
          if (word.length > 3) topics.add(word);
        });
    }

    // Extract common API patterns
    const apiPatterns = ['fetch', 'async', 'await', 'promise', 'callback', 'event', 'handler'];
    apiPatterns.forEach((pattern) => {
      if (code.toLowerCase().includes(pattern)) {
        topics.add(pattern);
      }
    });

    return Array.from(topics).slice(0, 8);
  }

  /**
   * Calculate difficulty level
   */
  private calculateDifficulty(code: string): ExtractedCodeExample['difficulty'] {
    let score = 0;

    // Count complexity indicators
    if (code.includes('async') || code.includes('await')) score++;
    if (code.includes('Promise')) score++;
    if (code.includes('class ')) score++;
    if (code.includes('interface ')) score++;
    if (code.includes('generics') || code.includes('<')) score += 2;
    if (code.includes('recursion')) score += 2;
    if (code.includes('reduce') || code.includes('map')) score++;
    if (code.match(/\{[\s\S]{50,}\}/)) score++; // Complex nesting

    if (score === 0) return 'beginner';
    if (score < 4) return 'intermediate';
    return 'advanced';
  }

  /**
   * Analyze code structure
   */
  analyzeCode(code: string, language: string): CodeAnalysis {
    const analysis: CodeAnalysis = {
      language,
      functions: this.extractFunctions(code, language),
      classes: this.extractClasses(code, language),
      imports: this.extractImports(code, language),
      complexity: this.analyzeComplexity(code),
    };

    return analysis;
  }

  /**
   * Extract function definitions
   */
  private extractFunctions(code: string, language: string): string[] {
    const functions: Set<string> = new Set();

    // JavaScript/TypeScript pattern
    if (['js', 'javascript', 'ts', 'typescript', 'tsx', 'jsx'].includes(language.toLowerCase())) {
      const jsPattern = /(?:function\s+|const\s+|let\s+|var\s+)(\w+)\s*=?\s*(?:function|\(|async)/g;
      let match;
      while ((match = jsPattern.exec(code)) !== null) {
        functions.add(match[1]);
      }
    }

    // Python pattern
    if (['py', 'python'].includes(language.toLowerCase())) {
      const pyPattern = /def\s+(\w+)\s*\(/g;
      let match;
      while ((match = pyPattern.exec(code)) !== null) {
        functions.add(match[1]);
      }
    }

    return Array.from(functions);
  }

  /**
   * Extract class definitions
   */
  private extractClasses(code: string, language: string): string[] {
    const classes: Set<string> = new Set();

    // JavaScript/TypeScript pattern
    if (['js', 'javascript', 'ts', 'typescript', 'tsx', 'jsx'].includes(language.toLowerCase())) {
      const pattern = /class\s+(\w+)/g;
      let match;
      while ((match = pattern.exec(code)) !== null) {
        classes.add(match[1]);
      }
    }

    // Python pattern
    if (['py', 'python'].includes(language.toLowerCase())) {
      const pattern = /class\s+(\w+)/g;
      let match;
      while ((match = pattern.exec(code)) !== null) {
        classes.add(match[1]);
      }
    }

    return Array.from(classes);
  }

  /**
   * Extract import statements
   */
  private extractImports(code: string, language: string): string[] {
    const imports: Set<string> = new Set();

    // JavaScript/TypeScript pattern
    if (['js', 'javascript', 'ts', 'typescript', 'tsx', 'jsx'].includes(language.toLowerCase())) {
      const pattern = /(?:import|require)\s*[\(\{]?['"]([^'"]+)['"]/g;
      let match;
      while ((match = pattern.exec(code)) !== null) {
        imports.add(match[1]);
      }
    }

    // Python pattern
    if (['py', 'python'].includes(language.toLowerCase())) {
      const pattern = /(?:from|import)\s+([^\s]+)/g;
      let match;
      while ((match = pattern.exec(code)) !== null) {
        imports.add(match[1]);
      }
    }

    return Array.from(imports);
  }

  /**
   * Analyze code complexity
   */
  private analyzeComplexity(code: string): CodeAnalysis['complexity'] {
    let score = 0;

    // Count lines
    const lines = code.split('\n').length;
    if (lines > 50) score++;
    if (lines > 100) score++;

    // Check for advanced patterns
    if (code.includes('async') || code.includes('await')) score++;
    if (code.includes('Promise')) score++;
    if (code.match(/\.then\s*\(/)) score++;
    if (code.includes('try') && code.includes('catch')) score++;
    if (code.match(/\[.*for.*in.*\]/)) score++; // Comprehension/reduction
    if ((code.match(/{/g) || []).length > 10) score++; // Deep nesting

    if (score <= 1) return 'simple';
    if (score <= 3) return 'moderate';
    return 'complex';
  }

  /**
   * Extract code snippets for specific use cases
   */
  extractUseCases(content: string): Map<string, ExtractedCodeExample[]> {
    const useCases = new Map<string, ExtractedCodeExample[]>();
    const examples = this.extractExamples(content);

    // Group by inferred use case from topics
    for (const example of examples) {
      const primaryTopic = example.topics[0] || 'general';
      if (!useCases.has(primaryTopic)) {
        useCases.set(primaryTopic, []);
      }
      useCases.get(primaryTopic)?.push(example);
    }

    return useCases;
  }
}
