/**
 * Library Seeding Script
 * Populates initial libraries into the database
 * Run with: npm run seed
 */

import { DataSource } from 'typeorm';
import { Library } from '../entities/library.entity';
import { LibraryVersion } from '../entities/library-version.entity';
import { DocumentationPage } from '../entities/documentation-page.entity';
import { CodeExample } from '../entities/code-example.entity';

export const librariesToSeed = [
  // JavaScript/TypeScript
  {
    name: 'React',
    fullName: 'facebook/react',
    description: 'A JavaScript library for building user interfaces with reusable components',
    ecosystem: 'javascript',
    repositoryUrl: 'https://github.com/facebook/react',
    stars: 220000,
    benchmarkScore: 98,
    reputation: 'high',
    versions: ['18.2.0', '18.1.0', '17.0.2'],
    docs: 245,
  },
  {
    name: 'Next.js',
    fullName: 'vercel/next.js',
    description: 'The React Framework for Production with built-in optimization',
    ecosystem: 'javascript',
    repositoryUrl: 'https://github.com/vercel/next.js',
    stars: 125000,
    benchmarkScore: 96,
    reputation: 'high',
    versions: ['14.0.3', '13.5.6', '12.3.4'],
    docs: 389,
  },
  {
    name: 'Vue.js',
    fullName: 'vuejs/vue',
    description: 'Progressive JavaScript framework for building user interfaces',
    ecosystem: 'javascript',
    repositoryUrl: 'https://github.com/vuejs/vue',
    stars: 207000,
    benchmarkScore: 94,
    reputation: 'high',
    versions: ['3.3.4', '3.2.47', '2.7.14'],
    docs: 267,
  },
  {
    name: 'Express.js',
    fullName: 'expressjs/express',
    description: 'Fast, unopinionated, minimalist web framework for Node.js',
    ecosystem: 'javascript',
    repositoryUrl: 'https://github.com/expressjs/express',
    stars: 64000,
    benchmarkScore: 85,
    reputation: 'high',
    versions: ['4.18.2', '4.17.1', '4.16.4'],
    docs: 156,
  },
  {
    name: 'TypeScript',
    fullName: 'microsoft/typescript',
    description: 'Typed superset of JavaScript that compiles to clean JavaScript',
    ecosystem: 'javascript',
    repositoryUrl: 'https://github.com/microsoft/typescript',
    stars: 101000,
    benchmarkScore: 97,
    reputation: 'high',
    versions: ['5.3.3', '5.2.2', '5.1.6'],
    docs: 423,
  },

  // Python
  {
    name: 'Python',
    fullName: 'python/cpython',
    description: 'The Python programming language and standard library',
    ecosystem: 'python',
    repositoryUrl: 'https://github.com/python/cpython',
    stars: 63000,
    benchmarkScore: 99,
    reputation: 'high',
    versions: ['3.12.0', '3.11.6', '3.10.13'],
    docs: 543,
  },
  {
    name: 'Django',
    fullName: 'django/django',
    description: 'High-level Python web framework encouraging rapid development',
    ecosystem: 'python',
    repositoryUrl: 'https://github.com/django/django',
    stars: 78000,
    benchmarkScore: 92,
    reputation: 'high',
    versions: ['4.2.8', '4.1.13', '3.2.20'],
    docs: 334,
  },
  {
    name: 'FastAPI',
    fullName: 'tiangolo/fastapi',
    description: 'Modern, fast Python web framework for building APIs',
    ecosystem: 'python',
    repositoryUrl: 'https://github.com/tiangolo/fastapi',
    stars: 72000,
    benchmarkScore: 95,
    reputation: 'high',
    versions: ['0.104.1', '0.103.2', '0.95.2'],
    docs: 289,
  },

  // AI/ML
  {
    name: 'LangChain',
    fullName: 'langchain-ai/langchain',
    description: 'Building applications with LLMs through composability',
    ecosystem: 'ai-ml',
    repositoryUrl: 'https://github.com/langchain-ai/langchain',
    stars: 68000,
    benchmarkScore: 91,
    reputation: 'high',
    versions: ['0.1.0', '0.0.347', '0.0.250'],
    docs: 156,
  },
  {
    name: 'OpenAI Python',
    fullName: 'openai/openai-python',
    description: 'Official Python library for OpenAI API',
    ecosystem: 'ai-ml',
    repositoryUrl: 'https://github.com/openai/openai-python',
    stars: 22000,
    benchmarkScore: 89,
    reputation: 'high',
    versions: ['1.3.7', '0.28.1', '0.27.8'],
    docs: 198,
  },
  {
    name: 'Anthropic SDK',
    fullName: 'anthropics/anthropic-sdk-python',
    description: 'Official Python library for Anthropic APIs',
    ecosystem: 'ai-ml',
    repositoryUrl: 'https://github.com/anthropics/anthropic-sdk-python',
    stars: 1200,
    benchmarkScore: 88,
    reputation: 'high',
    versions: ['0.7.1', '0.7.0', '0.6.0'],
    docs: 134,
  },

  // Rust
  {
    name: 'Rust',
    fullName: 'rust-lang/rust',
    description: 'A systems programming language with strong guarantees',
    ecosystem: 'rust',
    repositoryUrl: 'https://github.com/rust-lang/rust',
    stars: 98000,
    benchmarkScore: 99,
    reputation: 'high',
    versions: ['1.74.0', '1.73.0', '1.72.1'],
    docs: 567,
  },
  {
    name: 'Tokio',
    fullName: 'tokio-rs/tokio',
    description: 'An asynchronous runtime for the Rust programming language',
    ecosystem: 'rust',
    repositoryUrl: 'https://github.com/tokio-rs/tokio',
    stars: 28000,
    benchmarkScore: 94,
    reputation: 'high',
    versions: ['1.35.0', '1.34.0', '1.33.0'],
    docs: 223,
  },

  // Additional
  {
    name: 'Docker',
    fullName: 'moby/moby',
    description: 'Open source containerization platform',
    ecosystem: 'devops',
    repositoryUrl: 'https://github.com/moby/moby',
    stars: 71000,
    benchmarkScore: 95,
    reputation: 'high',
    versions: ['24.0.7', '23.0.6', '20.10.21'],
    docs: 456,
  },
  {
    name: 'Kubernetes',
    fullName: 'kubernetes/kubernetes',
    description: 'Production-Grade Container Orchestration',
    ecosystem: 'devops',
    repositoryUrl: 'https://github.com/kubernetes/kubernetes',
    stars: 113000,
    benchmarkScore: 98,
    reputation: 'high',
    versions: ['1.28.5', '1.27.8', '1.26.11'],
    docs: 789,
  },
  {
    name: 'PostgreSQL',
    fullName: 'postgres/postgres',
    description: 'Advanced open source relational database',
    ecosystem: 'database',
    repositoryUrl: 'https://github.com/postgres/postgres',
    stars: 23000,
    benchmarkScore: 99,
    reputation: 'high',
    versions: ['16.1', '15.5', '14.10'],
    docs: 634,
  },
];

export async function seedLibraries(dataSource: DataSource) {
  const libraryRepo = dataSource.getRepository(Library);
  const versionRepo = dataSource.getRepository(LibraryVersion);
  const docPageRepo = dataSource.getRepository(DocumentationPage);

  console.log('🌱 Starting library seeding...');

  for (const libData of librariesToSeed) {
    try {
      // Create library
      let library = await libraryRepo.findOne({
        where: { fullName: libData.fullName },
      });

      if (!library) {
        library = libraryRepo.create({
          name: libData.name,
          fullName: libData.fullName,
          description: libData.description,
          ecosystem: libData.ecosystem as any,
          repository_url: libData.repositoryUrl,
          stars: libData.stars,
          benchmark_score: libData.benchmarkScore,
          reputation: libData.reputation as any,
        });

        library = await libraryRepo.save(library);
        console.log(`✅ Created library: ${libData.name}`);
      }

      // Create versions
      for (const versionString of libData.versions) {
        let version = await versionRepo.findOne({
          where: {
            library_id: library.id,
            version: versionString,
          },
        });

        if (!version) {
          version = versionRepo.create({
            library_id: library.id,
            version: versionString,
            git_tag: `v${versionString}`,
            is_latest: versionString === libData.versions[0],
            documentation_status: 'indexed',
            release_date: new Date(2023, 0, 1),
          });

          version = await versionRepo.save(version);
        }

        // Create sample documentation pages
        const sampleDocs = [
          {
            title: `Getting Started with ${libData.name}`,
            content: `Learn how to install and use ${libData.name}. This guide covers basic setup and common use cases.`,
            type: 'guide',
            topics: ['setup', 'installation', 'getting-started'],
          },
          {
            title: `${libData.name} API Reference`,
            content: `Complete API documentation for ${libData.name} including all functions and classes.`,
            type: 'reference',
            topics: ['api', 'reference', 'documentation'],
          },
          {
            title: `${libData.name} Examples`,
            content: `Practical examples demonstrating common patterns and best practices.`,
            type: 'example',
            topics: ['examples', 'patterns', 'best-practices'],
          },
        ];

        for (const docData of sampleDocs) {
          const existing = await docPageRepo.findOne({
            where: {
              library_version_id: version.id,
              title: docData.title,
            },
          });

          if (!existing) {
            const docPage = docPageRepo.create({
              library_version_id: version.id,
              source_type: 'docs',
              source_url: `https://docs.example.com/${libData.name}`,
              path: `/${docData.type}/${docData.title.toLowerCase().replace(/\s+/g, '-')}`,
              title: docData.title,
              content: docData.content,
              content_type: 'markdown',
              page_type: docData.type as any,
              topics: docData.topics,
              metadata: {
                difficulty: 'beginner',
                estimatedReadTime: 5,
              },
            });

            await docPageRepo.save(docPage);
          }
        }

        console.log(`  📚 Seeded version ${versionString}`);
      }
    } catch (error) {
      console.error(`❌ Error seeding ${libData.name}:`, error);
    }
  }

  console.log('✨ Library seeding complete!');
}
