/**
 * ee.dd — forest chrome + the riverbank painting as the chat backdrop.
 * Named after him.
 */

import * as sdk from '@hermes/plugin-sdk'

const ID = 'ee.dd'
const DOM = ID.replace(/\./g, '-')
const STYLE_ID = `${DOM}-style`
const WALLPAPER_ID = `${DOM}-wallpaper`
const FONT_ID = `${DOM}-font`

const forest = {
  background: '#122D1D',
  foreground: '#E8E0C8',
  card: '#1A3324',
  cardForeground: '#E8E0C8',
  muted: '#1E3B25',
  mutedForeground: '#8AA67A',
  popover: '#1A3324',
  popoverForeground: '#E8E0C8',
  primary: '#EDE4C0',
  primaryForeground: '#122D1D',
  secondary: '#244830',
  secondaryForeground: '#E8E0C8',
  accent: '#1E3B25',
  accentForeground: '#E8E0C8',
  border: '#2A4A34',
  input: '#163426',
  ring: '#EDE4C0',
  midground: '#EDE4C0',
  midgroundForeground: '#122D1D',
  composerRing: '#EDE4C0',
  destructive: '#E07060',
  destructiveForeground: '#122D1D',
  sidebarBackground: '#163426',
  sidebarBorder: '#2A4A34',
  userBubble: '#244830',
  userBubbleBorder: '#2A4A34'
}

const theme = {
  name: ID,
  label: 'ee.dd',
  description: 'Forest chrome over the riverbank painting. Named after him.',
  colors: forest,
  darkColors: forest
}

const CSS = `
#${WALLPAPER_ID} {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 55% 52%;
  z-index: 0;
  pointer-events: none;
  display: none;
}

html[data-hermes-theme="${ID}"] #${WALLPAPER_ID} {
  display: block;
}

html[data-hermes-theme="${ID}"] #root {
  position: relative;
  z-index: 1;
  background: transparent !important;
}

html[data-hermes-theme="${ID}"] body {
  background: transparent !important;
}

html[data-hermes-theme="${ID}"] {
  --ui-chat-surface-background: transparent !important;
  --ui-editor-surface-background: transparent !important;
  --ui-surface-background: transparent !important;
  --composer-fill: color-mix(in srgb, #1A3324 82%, transparent) !important;
}

html[data-hermes-theme="${ID}"] [data-chat-surface],
html[data-hermes-theme="${ID}"] [data-slot="aui_thread-viewport"],
html[data-hermes-theme="${ID}"] [data-slot="aui_thread-content"],
html[data-hermes-theme="${ID}"] [data-slot="aui_intro"] {
  background: transparent !important;
}

html[data-hermes-theme="${ID}"] [data-slot="composer-root"] {
  --composer-fill: color-mix(in srgb, #1A3324 82%, transparent) !important;
}

html[data-hermes-theme="${ID}"] [data-slot="composer-surface"] {
  background: var(--composer-fill) !important;
  border-color: color-mix(in srgb, #EDE4C0 22%, transparent) !important;
  backdrop-filter: blur(10px);
}

html[data-hermes-theme="${ID}"] .wordmark {
  font-family: "Cinzel", "Times New Roman", serif !important;
  font-weight: 700 !important;
  color: #F2E8C8 !important;
  mix-blend-mode: normal !important;
  letter-spacing: 0.14em !important;
  text-shadow: 0 2px 22px rgba(10, 24, 16, 0.55);
}

html[data-hermes-theme="${ID}"] [data-slot="aui_intro"] p {
  color: #E8DCC0 !important;
  text-shadow: 0 1px 12px rgba(10, 24, 16, 0.5);
}

html[data-hermes-theme="${ID}"] [data-slot="aui_intro"] {
  color: #E8DCC0 !important;
}
`

function toFileUrl(p) {
  const normalized = String(p).replace(/\\/g, '/')
  const path = /^[A-Za-z]:/.test(normalized) ? '/' + normalized : normalized
  return encodeURI('file://' + path)
}

function joinPath(root, name) {
  const sep = String(root).includes('\\') ? '\\' : '/'
  return String(root).replace(/[\\/]+$/, '') + sep + ID + sep + name
}

async function resolveWallpaperUrl() {
  const desktop = typeof window !== 'undefined' ? window.hermesDesktop : null
  let filePath = ''
  try {
    const root = await desktop?.desktopPluginsRoot?.()
    if (root) filePath = joinPath(root, 'wallpaper.jpg')
  } catch {
    /* fall through */
  }

  if (desktop?.readFileDataUrl && filePath) {
    try {
      const dataUrl = await desktop.readFileDataUrl(filePath)
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) return dataUrl
    } catch {
      /* file URL next */
    }
  }

  if (!filePath) return ''
  const url = toFileUrl(filePath)
  return url + (url.includes('?') ? '&' : '?') + 'v=3'
}

function ensureStyle() {
  let el = document.getElementById(STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = CSS
}

function ensureFont() {
  if (document.getElementById(FONT_ID)) return
  const link = document.createElement('link')
  link.id = FONT_ID
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=swap'
  document.head.appendChild(link)
}

function ensureWallpaper(url) {
  if (!url) return
  let img = document.getElementById(WALLPAPER_ID)
  if (!img) {
    img = document.createElement('img')
    img.id = WALLPAPER_ID
    img.alt = ''
    document.body.prepend(img)
  }
  img.src = url
}

function clearWallpaperSurfaces() {
  if (typeof document === 'undefined') return
  if (document.documentElement.dataset.hermesTheme !== ID) return
  const vw = window.innerWidth
  const vh = window.innerHeight
  const skip = new Set([WALLPAPER_ID, STYLE_ID, FONT_ID])
  for (const el of document.body.querySelectorAll('*')) {
    if (skip.has(el.id)) continue
    const r = el.getBoundingClientRect()
    if (r.width < 80 || r.height < 80) continue
    const w = r.width / vw
    const h = r.height / vh
    if (w >= 0.5 && h >= 0.4) {
      el.style.setProperty('background', 'transparent', 'important')
      el.style.setProperty('background-color', 'transparent', 'important')
    }
  }
}

export default {
  id: ID,
  name: 'ee.dd',
  description: 'Forest chrome over the riverbank painting. Named after him.',
  register(ctx) {
    const area = sdk.THEMES_AREA
    if (area) {
      ctx.register({
        id: 'theme',
        area,
        data: theme
      })
    }
    if (typeof sdk.requestTheme === 'function') {
      sdk.requestTheme(ID)
    }

    if (typeof document === 'undefined') return

    ensureFont()
    ensureStyle()

    let stopped = false
    resolveWallpaperUrl().then(url => {
      if (!stopped && url) ensureWallpaper(url)
    })

    const tick = setInterval(clearWallpaperSurfaces, 1500)
    const obs = new MutationObserver(clearWallpaperSurfaces)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-hermes-theme', 'class'] })

    ctx.onDispose(() => {
      stopped = true
      clearInterval(tick)
      obs.disconnect()
      document.getElementById(STYLE_ID)?.remove()
      document.getElementById(WALLPAPER_ID)?.remove()
      document.getElementById(FONT_ID)?.remove()
    })
  }
}
