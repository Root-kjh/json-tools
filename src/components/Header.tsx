import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BracesIcon, GithubIcon, SunIcon, MoonIcon } from './Icons'
import { useTheme } from '../hooks/useTheme'

const tools = [
  { name: 'Formatter', href: '/formatter' },
  { name: 'Validator', href: '/validator' },
  { name: 'Viewer', href: '/viewer' },
  { name: 'Minifier', href: '/minifier' },
  { name: 'Beautifier', href: '/beautifier' },
  { name: 'To TS', href: '/to-typescript' },
  { name: 'JSON↔YAML', href: '/to-yaml' },
  { name: 'Query', href: '/json-query' },
  { name: 'Diff', href: '/diff' },
  { name: '✨ AI', href: '/ai-assistant' },
]

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
)

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b bg-card relative">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <BracesIcon className="h-6 w-6 text-primary" />
            <span>JSON Tools</span>
          </Link>

<nav className="hidden lg:flex items-center gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {tool.name}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
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

<div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

{mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-card border-b shadow-lg z-50">
          <nav className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <a
                href="https://github.com/Root-kjh/json-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              >
                <GithubIcon className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
