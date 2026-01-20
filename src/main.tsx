import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Formatter } from './pages/Formatter'
import { ToTypeScript } from './pages/ToTypeScript'
import { ToCsv } from './pages/ToCsv'
import { ToSchema } from './pages/ToSchema'
import { Diff } from './pages/Diff'
import { PathFinder } from './pages/PathFinder'
import { AiAssistant } from './pages/AiAssistant'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="formatter" element={<Formatter />} />
          <Route path="to-typescript" element={<ToTypeScript />} />
          <Route path="to-csv" element={<ToCsv />} />
          <Route path="to-schema" element={<ToSchema />} />
          <Route path="diff" element={<Diff />} />
          <Route path="path-finder" element={<PathFinder />} />
          <Route path="ai-assistant" element={<AiAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
