import { useEffect } from 'react'

interface SEOProps {
  title: string
  description: string
  canonical?: string
}

const BASE_URL = 'https://json.jobby-time.com'
const SITE_NAME = 'JSON Tools'

export function useSEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
    document.title = fullTitle

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attr, name)
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    updateMeta('description', description)
    updateMeta('og:title', fullTitle, true)
    updateMeta('og:description', description, true)
    updateMeta('twitter:title', fullTitle)
    updateMeta('twitter:description', description)

    if (canonical) {
      updateMeta('og:url', `${BASE_URL}${canonical}`, true)
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = `${BASE_URL}${canonical}`
    }
  }, [title, description, canonical])
}
