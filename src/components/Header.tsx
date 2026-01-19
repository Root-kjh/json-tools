import { Link } from 'react-router-dom'
import { BracesIcon, GithubIcon } from './Icons'

const tools = [
  { name: 'Formatter', href: '/formatter' },
  { name: 'To TypeScript', href: '/to-typescript' },
  { name: 'To CSV', href: '/to-csv' },
  { name: 'Diff', href: '/diff' },
  { name: 'Path Finder', href: '/path-finder' },
]

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <BracesIcon className="h-6 w-6 text-primary" />
            <span>JSON Tools</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {tool.name}
              </Link>
            ))}
            <a
              href="https://github.com/Root-kjh/json-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
