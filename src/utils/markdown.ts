import { Marked } from 'marked'
import DOMPurify from 'dompurify'

const markdown = new Marked({
  gfm: true,
  // AI answers use single line breaks inside list items and paragraphs
  breaks: true,
})

// Only the tags Markdown produces for text. The answer is generated from the
// PDF content, so it's untrusted HTML: scripts, iframes, forms, styles and
// images (which could leak data through their URL) are removed.
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'strong', 'em', 'del', 'code', 'pre', 'blockquote',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const ALLOWED_ATTR = ['href', 'title', 'start', 'align']

let hooksRegistered = false

const registerHooks = () => {
  if (hooksRegistered) return
  hooksRegistered = true

  // Open links in a new tab so the current conversation isn't lost
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

/**
 * Converts the AI answer (Markdown) into sanitized HTML.
 * Returns an empty string outside the browser, where DOMPurify can't run.
 */
export const renderMarkdown = (text: string): string => {
  if (!text || !DOMPurify.isSupported) {
    return ''
  }

  registerHooks()

  const html = markdown.parse(text, { async: false })

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}
