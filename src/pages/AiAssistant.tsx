import { useState, useCallback } from 'react'
import { CopyIcon, CheckIcon, Trash2Icon, SparklesIcon, UploadIcon } from '../components/Icons'
import { useFileDrop } from '../hooks/useFileDrop'
import { useSEO } from '../hooks/useSEO'

type Mode = 'generate' | 'explain' | 'mock'

const STORAGE_KEY = 'openai_api_key'

export function AiAssistant() {
  useSEO({
    title: 'AI JSON Assistant - Generate & Explain JSON',
    description: 'AI-powered JSON assistant. Generate JSON from natural language, explain complex JSON structures, create mock data. Powered by OpenAI GPT.',
    canonical: '/ai-assistant',
  })

  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<Mode>('generate')

  const saveApiKey = useCallback((key: string) => {
    setApiKey(key)
    if (key) {
      localStorage.setItem(STORAGE_KEY, key)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const callOpenAI = useCallback(async (systemPrompt: string, userPrompt: string) => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to call OpenAI API')
      return null
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    const systemPrompt = `You are a JSON generator. Generate valid JSON based on the user's description.
Rules:
- Output ONLY valid JSON, no explanations or markdown
- Use realistic sample data
- Follow common naming conventions (camelCase for keys)
- Include appropriate data types`

    const result = await callOpenAI(systemPrompt, prompt)
    if (result) {
      try {
        const parsed = JSON.parse(result)
        setOutput(JSON.stringify(parsed, null, 2))
      } catch {
        const jsonMatch = result.match(/```json?\s*([\s\S]*?)```/) || result.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const extracted = jsonMatch[1] || jsonMatch[0]
            const parsed = JSON.parse(extracted)
            setOutput(JSON.stringify(parsed, null, 2))
          } catch {
            setOutput(result)
          }
        } else {
          setOutput(result)
        }
      }
    }
  }, [prompt, callOpenAI])

  const handleExplain = useCallback(async () => {
    if (!jsonInput.trim()) return

    const systemPrompt = `You are a JSON expert. Explain the given JSON structure clearly and concisely.
Include:
- Overall structure description
- Purpose of each field
- Data types and their meanings
- Any patterns or conventions used
Keep the explanation concise but informative.`

    const result = await callOpenAI(systemPrompt, `Explain this JSON:\n${jsonInput}`)
    if (result) {
      setOutput(result)
    }
  }, [jsonInput, callOpenAI])

  const handleMockData = useCallback(async () => {
    if (!jsonInput.trim()) return

    const systemPrompt = `You are a mock data generator. Given a JSON structure or schema, generate realistic mock data.
Rules:
- Output ONLY valid JSON, no explanations
- Use realistic, varied sample data
- Maintain the exact same structure as input
- Generate 3-5 items if it's an array structure`

    const result = await callOpenAI(systemPrompt, `Generate mock data based on this structure:\n${jsonInput}`)
    if (result) {
      try {
        const parsed = JSON.parse(result)
        setOutput(JSON.stringify(parsed, null, 2))
      } catch {
        const jsonMatch = result.match(/```json?\s*([\s\S]*?)```/) || result.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const extracted = jsonMatch[1] || jsonMatch[0]
            const parsed = JSON.parse(extracted)
            setOutput(JSON.stringify(parsed, null, 2))
          } catch {
            setOutput(result)
          }
        } else {
          setOutput(result)
        }
      }
    }
  }, [jsonInput, callOpenAI])

  const handleSubmit = useCallback(() => {
    switch (mode) {
      case 'generate':
        handleGenerate()
        break
      case 'explain':
        handleExplain()
        break
      case 'mock':
        handleMockData()
        break
    }
  }, [mode, handleGenerate, handleExplain, handleMockData])

  const copyToClipboard = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const clearAll = useCallback(() => {
    setPrompt('')
    setJsonInput('')
    setOutput('')
    setError(null)
  }, [])

  const { isDragging, dragProps } = useFileDrop({
    onFileDrop: setJsonInput,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SparklesIcon className="h-8 w-8 text-primary" />
          AI JSON Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate JSON from natural language, explain structures, or create mock data
        </p>
      </div>

      <div className="p-4 bg-card border rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">OpenAI API Key</label>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Get API Key →
          </a>
        </div>
        <div className="flex gap-2">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-md border border-border font-mono text-sm"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally in your browser and never sent to our servers.
        </p>
      </div>

      <div className="flex gap-2">
        {(['generate', 'explain', 'mock'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-md transition-colors capitalize ${
              mode === m
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {m === 'generate' ? '✨ Generate' : m === 'explain' ? '📖 Explain' : '🎲 Mock Data'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !apiKey || (mode === 'generate' ? !prompt.trim() : !jsonInput.trim())}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="h-4 w-4" />
          {loading ? 'Processing...' : mode === 'generate' ? 'Generate JSON' : mode === 'explain' ? 'Explain' : 'Generate Mock'}
        </button>
        <button
          onClick={copyToClipboard}
          disabled={!output}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <Trash2Icon className="h-4 w-4" />
          Clear
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {mode === 'generate' ? 'Describe the JSON you want' : 'Input JSON'}
          </label>
          {mode === 'generate' ? (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a user profile with name, email, age, and list of hobbies..."
              className="w-full h-[400px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          ) : (
            <div
              {...dragProps}
              className={`relative ${isDragging ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
              {isDragging && (
                <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-primary">
                    <UploadIcon className="h-6 w-6" />
                    <span className="font-medium">Drop JSON file here</span>
                  </div>
                </div>
              )}
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={mode === 'explain' ? 'Paste JSON to explain...' : 'Paste JSON structure to generate mock data...'}
                className="w-full h-[400px] p-4 font-mono text-sm bg-card border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                spellCheck={false}
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Output {output && mode !== 'explain' && <span className="text-muted-foreground">({output.length} chars)</span>}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder={loading ? 'AI is thinking...' : 'AI output will appear here...'}
            className="w-full h-[400px] p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
