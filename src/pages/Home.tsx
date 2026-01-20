import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BracesIcon, FileJsonIcon, ArrowRightLeftIcon, GitCompareIcon, SearchIcon, FileCodeIcon, ShieldCheckIcon, GithubIcon, StarIcon, SparklesIcon, CodeIcon, TableIcon, Minimize2Icon, CheckIcon, Maximize2Icon } from '../components/Icons'
import { useSEO } from '../hooks/useSEO'
import { getRecentTools, type RecentTool } from '../hooks/useRecentTools'

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format and validate your JSON with syntax highlighting',
    href: '/formatter',
    icon: FileJsonIcon,
  },
  {
    name: 'JSON Validator',
    description: 'Validate JSON syntax with error details and line numbers',
    href: '/validator',
    icon: CheckIcon,
  },
  {
    name: 'JSON Viewer',
    description: 'Interactive tree view to explore JSON structure',
    href: '/viewer',
    icon: SearchIcon,
  },
  {
    name: 'JSON Beautifier',
    description: 'Pretty print JSON with customizable indentation',
    href: '/beautifier',
    icon: Maximize2Icon,
  },
  {
    name: 'JSON Minifier',
    description: 'Compress JSON by removing whitespace',
    href: '/minifier',
    icon: Minimize2Icon,
  },
  {
    name: 'JSON to TypeScript',
    description: 'Generate TypeScript interfaces from JSON',
    href: '/to-typescript',
    icon: FileCodeIcon,
  },
  {
    name: 'JSON to CSV',
    description: 'Convert JSON arrays to CSV format',
    href: '/to-csv',
    icon: TableIcon,
  },
  {
    name: 'JSON ↔ YAML',
    description: 'Convert between JSON and YAML formats',
    href: '/to-yaml',
    icon: ArrowRightLeftIcon,
  },
  {
    name: 'JSON to Schema',
    description: 'Generate JSON Schema with format detection',
    href: '/to-schema',
    icon: BracesIcon,
  },
  {
    name: 'JSON Query',
    description: 'Query JSON using JSONPath expressions',
    href: '/json-query',
    icon: CodeIcon,
  },
  {
    name: 'JSON Diff',
    description: 'Compare two JSON objects side by side',
    href: '/diff',
    icon: GitCompareIcon,
  },
  {
    name: 'JSON Escape',
    description: 'Escape and unescape JSON string characters',
    href: '/escape',
    icon: CodeIcon,
  },
  {
    name: 'JSON to XML',
    description: 'Convert JSON to XML format',
    href: '/to-xml',
    icon: FileCodeIcon,
  },
  {
    name: 'JSON Sorter',
    description: 'Sort JSON object keys alphabetically',
    href: '/sorter',
    icon: ArrowRightLeftIcon,
  },
  {
    name: 'JSON Base64',
    description: 'Encode/decode JSON to Base64',
    href: '/base64',
    icon: CodeIcon,
  },
  {
    name: 'JSON Flattener',
    description: 'Flatten nested JSON to dot notation',
    href: '/flattener',
    icon: BracesIcon,
  },
  {
    name: '✨ AI Assistant',
    description: 'Generate JSON from natural language with AI',
    href: '/ai-assistant',
    icon: SparklesIcon,
  },
]

export function Home() {
  const [recentTools, setRecentTools] = useState<RecentTool[]>([])

  useEffect(() => {
    setRecentTools(getRecentTools())
  }, [])

  useSEO({
    title: 'JSON Tools - Free Online JSON Formatter, Validator & Converter',
    description: 'Free online JSON tools - format, validate, convert to TypeScript/CSV/Schema, compare, and find paths. Privacy-first: all processing happens in your browser.',
    canonical: '/',
  })

  return (
    <div className="space-y-12">
      {recentTools.length > 0 && (
        <section className="bg-secondary/30 rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Recently Used</h2>
          <div className="flex flex-wrap gap-2">
            {recentTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="text-center space-y-4 py-12">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <BracesIcon className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          JSON Tools
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Free online tools to format, validate, convert, and compare JSON.
          All processing happens in your browser - your data never leaves your device.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-sm font-medium">100% Client-Side Processing</span>
          </div>
          <a
            href="https://github.com/Root-kjh/json-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <GithubIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Star on GitHub</span>
            <StarIcon className="h-3 w-3" />
          </a>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="group relative rounded-lg border bg-card p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <tool.icon className="h-6 w-6" />
              </div>
              <h2 className="font-semibold">{tool.name}</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {tool.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="border rounded-lg p-8 bg-card">
        <h2 className="text-2xl font-bold mb-4">Why JSON Tools?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              All processing happens client-side. Your JSON data never leaves your browser.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              No server round-trips. Instant results powered by your browser.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">All-in-One</h3>
            <p className="text-sm text-muted-foreground">
              Format, validate, convert, compare - all your JSON needs in one place.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
