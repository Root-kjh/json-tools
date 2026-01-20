import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'

const Formatter = lazy(() => import('./pages/Formatter').then(m => ({ default: m.Formatter })))
const Minifier = lazy(() => import('./pages/Minifier').then(m => ({ default: m.Minifier })))
const Validator = lazy(() => import('./pages/Validator').then(m => ({ default: m.Validator })))
const Beautifier = lazy(() => import('./pages/Beautifier').then(m => ({ default: m.Beautifier })))
const Viewer = lazy(() => import('./pages/Viewer').then(m => ({ default: m.Viewer })))
const ToTypeScript = lazy(() => import('./pages/ToTypeScript').then(m => ({ default: m.ToTypeScript })))
const ToCsv = lazy(() => import('./pages/ToCsv').then(m => ({ default: m.ToCsv })))
const ToSchema = lazy(() => import('./pages/ToSchema').then(m => ({ default: m.ToSchema })))
const ToYaml = lazy(() => import('./pages/ToYaml').then(m => ({ default: m.ToYaml })))
const FromYaml = lazy(() => import('./pages/FromYaml').then(m => ({ default: m.FromYaml })))
const JsonQuery = lazy(() => import('./pages/JsonQuery').then(m => ({ default: m.JsonQuery })))
const Diff = lazy(() => import('./pages/Diff').then(m => ({ default: m.Diff })))
const PathFinder = lazy(() => import('./pages/PathFinder').then(m => ({ default: m.PathFinder })))
const AiAssistant = lazy(() => import('./pages/AiAssistant').then(m => ({ default: m.AiAssistant })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="formatter" element={<Suspense fallback={<PageLoader />}><Formatter /></Suspense>} />
          <Route path="minifier" element={<Suspense fallback={<PageLoader />}><Minifier /></Suspense>} />
          <Route path="validator" element={<Suspense fallback={<PageLoader />}><Validator /></Suspense>} />
          <Route path="beautifier" element={<Suspense fallback={<PageLoader />}><Beautifier /></Suspense>} />
          <Route path="viewer" element={<Suspense fallback={<PageLoader />}><Viewer /></Suspense>} />
          <Route path="to-typescript" element={<Suspense fallback={<PageLoader />}><ToTypeScript /></Suspense>} />
          <Route path="to-csv" element={<Suspense fallback={<PageLoader />}><ToCsv /></Suspense>} />
          <Route path="to-schema" element={<Suspense fallback={<PageLoader />}><ToSchema /></Suspense>} />
          <Route path="to-yaml" element={<Suspense fallback={<PageLoader />}><ToYaml /></Suspense>} />
          <Route path="from-yaml" element={<Suspense fallback={<PageLoader />}><FromYaml /></Suspense>} />
          <Route path="json-query" element={<Suspense fallback={<PageLoader />}><JsonQuery /></Suspense>} />
          <Route path="diff" element={<Suspense fallback={<PageLoader />}><Diff /></Suspense>} />
          <Route path="path-finder" element={<Suspense fallback={<PageLoader />}><PathFinder /></Suspense>} />
          <Route path="ai-assistant" element={<Suspense fallback={<PageLoader />}><AiAssistant /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
