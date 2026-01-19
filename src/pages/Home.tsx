import { Link } from 'react-router-dom'
import { BracesIcon, FileJsonIcon, ArrowRightLeftIcon, GitCompareIcon, SearchIcon, FileCodeIcon } from '../components/Icons'

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format, beautify, and validate your JSON with syntax highlighting',
    href: '/formatter',
    icon: FileJsonIcon,
  },
  {
    name: 'JSON to TypeScript',
    description: 'Generate TypeScript interfaces from JSON data',
    href: '/to-typescript',
    icon: FileCodeIcon,
  },
  {
    name: 'JSON to CSV',
    description: 'Convert JSON arrays to CSV format for spreadsheets',
    href: '/to-csv',
    icon: ArrowRightLeftIcon,
  },
  {
    name: 'JSON Diff',
    description: 'Compare two JSON objects and see the differences',
    href: '/diff',
    icon: GitCompareIcon,
  },
  {
    name: 'JSON Path Finder',
    description: 'Click on any value to get its JSON path',
    href: '/path-finder',
    icon: SearchIcon,
  },
]

export function Home() {
  return (
    <div className="space-y-12">
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
