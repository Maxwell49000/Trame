import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GENERATED_ROOT = path.resolve(__dirname, '../../generated')
const IMAGE_DATA_RE = /^data:image\/(png|jpe?g|webp|gif);base64,([a-z0-9+/=\r\n]+)$/i
const COLOR_RE = /^(#[0-9a-f]{3,8}|[a-z-]+|var\(--[a-z0-9-]+\))$/i
const SIZE_RE = /^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/
const GRADIENT_DIRECTIONS = new Set(['to top', 'to right', 'to bottom', 'to left', 'to bottom right', 'to bottom left'])

export function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export function sanitizeSlug(value = '') {
    return String(value)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'site'
}

export function safeUrl(value, fallback = '#') {
    if (!value) return fallback
    const url = String(value).trim()
    if (/^(https?:|mailto:|tel:)/i.test(url) || url.startsWith('/') || url.startsWith('#')) {
        return escapeHtml(url)
    }
    return fallback
}

function safeColor(value, fallback) {
    return COLOR_RE.test(String(value || '')) ? String(value) : fallback
}

function safeSize(value, fallback) {
    return SIZE_RE.test(String(value || '')) ? String(value) : fallback
}

function safeBoxSize(value, fallback) {
    const tokens = String(value || '').trim().split(/\s+/)
    return tokens.length >= 1 && tokens.length <= 4 && tokens.every(token => SIZE_RE.test(token))
        ? tokens.join(' ')
        : fallback
}

function safeFont(value, fallback) {
    const font = String(value || '')
    return /^[a-z0-9 ,.'-]{1,200}$/i.test(font) ? font : fallback
}

function borderRadius(value) {
    return ({ none: '0', small: '4px', medium: '8px', large: '16px' })[value] || '8px'
}

function align(value, fallback = 'left') {
    return ['left', 'center', 'right'].includes(value) ? value : fallback
}

async function createAssetWriter(targetDir) {
    const assetsDir = path.join(targetDir, 'assets')
    const cache = new Map()
    let counter = 0

    return async function writeAsset(value) {
        if (!value || typeof value !== 'string') return ''
        if (cache.has(value)) return cache.get(value)

        const match = value.match(IMAGE_DATA_RE)
        if (!match) return ''

        await fs.mkdir(assetsDir, { recursive: true })
        const extension = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase()
        const relativePath = `assets/image-${++counter}.${extension}`
        await fs.writeFile(path.join(targetDir, relativePath), Buffer.from(match[2], 'base64'))
        cache.set(value, relativePath)
        return relativePath
    }
}

function renderTextSection(section, config, imageUrl) {
    const style = section.style || {}
    const background = safeColor(style.background, 'transparent')
    const textColor = safeColor(style.textColor, safeColor(config.textColor, '#222222'))
    const fontFamily = safeFont(style.fontFamily, 'var(--body-font)')
    const padding = safeBoxSize(style.padding, '40px 20px')
    const margin = safeBoxSize(style.margin, '0px')
    const radius = safeSize(style.borderRadius, '0px')
    const widthClass = style.fullWidth ? ' section--full' : ''
    const imageWidth = Math.min(100, Math.max(10, Number(section.imageWidth) || 100))
    const imagePosition = section.imagePosition === 'after' ? 'after' : 'before'
    const shape = section.imageShape === 'circle' ? '50%' : section.imageShape === 'rounded' ? '12px' : '0'
    const image = imageUrl
        ? `<div class="section-image section-image--${align(section.align, 'center')}"><img src="${imageUrl}" alt="${escapeHtml(section.alt)}" style="max-width:${imageWidth}%;border-radius:${shape}"></div>`
        : ''

    return `<section class="section${widthClass}" style="background:${background};color:${textColor};font-family:${fontFamily};padding:${padding};margin:${margin};border-radius:${radius}">
  <div class="section-inner">
    ${imagePosition === 'before' ? image : ''}
    ${section.title ? `<h2 style="text-align:${align(section.titleAlign)}">${escapeHtml(section.title)}</h2>` : ''}
    ${section.content ? `<div class="section-content" style="text-align:${align(section.textAlign)}">${escapeHtml(section.content).replace(/\r?\n/g, '<br>')}</div>` : ''}
    ${imagePosition === 'after' ? image : ''}
  </div>
</section>`
}

function renderHeroSection(section, imageUrl, config) {
    const height = safeSize(section.heroHeight, '60vh')
    const overlay = safeColor(section.heroOverlayColor, safeColor(config.theme?.primaryColor, '#1976d2'))
    const opacity = Math.min(1, Math.max(0, Number(section.heroOverlayOpacity) || 0.3))
    const cta = section.ctaLabel && section.ctaUrl
        ? `<a class="cta" href="${safeUrl(section.ctaUrl)}">${escapeHtml(section.ctaLabel)}</a>`
        : ''

    return `<section class="hero" style="min-height:${height};${imageUrl ? `background-image:url('${imageUrl}')` : ''}">
  <div class="hero-overlay" style="background:${overlay};opacity:${opacity}"></div>
  <div class="hero-content">
    ${section.heroTitle || section.title ? `<h1>${escapeHtml(section.heroTitle || section.title)}</h1>` : ''}
    ${section.heroSubtitle ? `<p>${escapeHtml(section.heroSubtitle)}</p>` : ''}
    ${cta}
  </div>
</section>`
}

function renderFooter(config, logoUrl) {
    const footer = config.footer
    if (!footer?.enabled) return ''
    const links = [...(footer.quickLinks || []), ...(footer.socialLinks || [])]
        .filter(link => link?.url)
        .map(link => `<a href="${safeUrl(link.url)}">${escapeHtml(link.label || link.platform || 'Lien')}</a>`)
        .join('')

    return `<footer style="background:${safeColor(footer.backgroundColor, '#222222')};color:${safeColor(footer.textColor, '#ffffff')}">
  <div class="footer-inner">
    ${logoUrl ? `<img class="footer-logo" src="${logoUrl}" alt="">` : ''}
    ${footer.companyName ? `<strong>${escapeHtml(footer.companyName)}</strong>` : ''}
    ${footer.companyDescription ? `<p>${escapeHtml(footer.companyDescription)}</p>` : ''}
    <div class="contact">
      ${footer.email ? `<a href="mailto:${escapeHtml(footer.email)}">${escapeHtml(footer.email)}</a>` : ''}
      ${footer.phone ? `<a href="tel:${escapeHtml(footer.phone)}">${escapeHtml(footer.phone)}</a>` : ''}
      ${footer.address ? `<span>${escapeHtml(footer.address)}</span>` : ''}
    </div>
    ${links ? `<nav class="footer-links">${links}</nav>` : ''}
    ${footer.copyrightText ? `<small>${escapeHtml(footer.copyrightText)}</small>` : ''}
  </div>
</footer>`
}

function desktopBackground(config, imageUrl) {
    const background = config.desktopBackground || {}
    if (background.type === 'image' && imageUrl) return `url('${imageUrl}') center / cover fixed`
    if (background.type === 'gradient') {
        const direction = GRADIENT_DIRECTIONS.has(background.gradientDirection)
            ? background.gradientDirection
            : 'to bottom'
        return `linear-gradient(${direction}, ${safeColor(background.gradientStart, '#eef1f5')}, ${safeColor(background.gradientEnd, '#dfe5ec')}) fixed`
    }
    return safeColor(background.color, '#eef1f5')
}

function buildCss(config, desktopBackgroundUrl = '') {
    const theme = config.theme || {}
    const primary = safeColor(theme.primaryColor, '#1976d2')
    const secondary = safeColor(theme.secondaryColor, '#222222')
    const accent = safeColor(theme.accentColor, '#ff6b6b')
    const bodyFont = safeFont(theme.bodyFont || config.fontFamily, 'system-ui, -apple-system, sans-serif')
    const titleFont = safeFont(theme.titleFont, bodyFont)
    const radius = borderRadius(theme.borderRadius)

    return `:root{--primary:${primary};--secondary:${secondary};--accent:${accent};--body-font:${bodyFont};--title-font:${titleFont};--radius:${radius}}
*{box-sizing:border-box}
html{scroll-behavior:${config.smoothScroll === false ? 'auto' : 'smooth'}}
body{margin:0;background:${desktopBackground(config, desktopBackgroundUrl)};color:${safeColor(config.textColor, '#222222')};font-family:var(--body-font);font-size:${safeSize(config.fontSize, '16px')};line-height:1.6}
.site-shell{width:min(100%,1100px);min-height:100vh;margin:0 auto;background:${safeColor(config.backgroundColor, '#ffffff')};box-shadow:0 8px 40px rgba(15,23,42,.12)}
h1,h2,h3{font-family:var(--title-font);line-height:1.2;margin:0 0 1rem}
a{color:inherit}.header{display:flex;align-items:center;padding:0 24px}.header-brand{display:flex;align-items:center;gap:12px;width:100%;font-weight:700}.header-logo{max-height:56px;max-width:180px;object-fit:contain}
.hero{position:relative;display:grid;place-items:center;background-position:center;background-size:cover;overflow:hidden}.hero-overlay{position:absolute;inset:0}.hero-content{position:relative;z-index:1;max-width:760px;padding:48px 24px;text-align:center;color:#fff}.hero h1{font-size:clamp(2rem,7vw,4.5rem)}.hero p{font-size:clamp(1rem,3vw,1.35rem)}
.cta{display:inline-block;margin-top:12px;padding:12px 22px;border-radius:var(--radius);background:var(--accent);color:#fff;text-decoration:none;font-weight:700}
.section{max-width:100%}.section:not(.section--full) .section-inner{max-width:900px;margin:0 auto}.section h2{color:var(--primary)}.section-content{overflow-wrap:anywhere}.section-image{display:flex;margin:18px 0}.section-image--left{justify-content:flex-start}.section-image--center{justify-content:center}.section-image--right{justify-content:flex-end}.section-image img{display:block;height:auto;object-fit:cover}
footer{padding:36px 24px}.footer-inner{max-width:900px;margin:0 auto;display:grid;gap:12px}.footer-logo{max-height:56px;max-width:180px}.contact,.footer-links{display:flex;flex-wrap:wrap;gap:12px 20px}.footer-links a,.contact a{text-decoration:none}
@media(max-width:700px){body{background:#fff}.site-shell{box-shadow:none}.header{padding:0 16px}.section{padding-left:20px!important;padding-right:20px!important}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.cta{transition:none}}`
}

export async function generateStaticSite(site) {
    if (!site?.config) throw new Error('Missing site configuration')

    const slug = sanitizeSlug(site.slug || site.name)
    const finalDir = path.join(GENERATED_ROOT, slug)
    const tempDir = path.join(GENERATED_ROOT, `.${slug}-${Date.now()}.tmp`)
    await fs.mkdir(tempDir, { recursive: true })

    try {
        const writeAsset = await createAssetWriter(tempDir)
        const config = site.config
        const header = config.header || {}
        const headerLogo = await writeAsset(header.logo)
        const footerLogo = await writeAsset(config.footer?.logo)
        const favicon = await writeAsset(config.favicon)
        const ogImage = await writeAsset(config.ogImage)
        const desktopBackgroundUrl = await writeAsset(config.desktopBackground?.image)
        const sections = []

        for (const section of config.sections || []) {
            if (!['text', 'image', 'hero'].includes(section.type)) continue
            const image = await writeAsset(section.image)
            sections.push(section.type === 'hero'
                ? renderHeroSection(section, image, config)
                : renderTextSection(section, config, image))
        }

        const headerHtml = header.enabled ? `<header class="header" style="height:${safeSize(header.height, '80px')};background:${safeColor(header.backgroundColor, '#ffffff')};color:${safeColor(header.textColor, '#222222')}">
  <div class="header-brand" style="justify-content:${align(header.logoAlign, 'center')}">
    ${headerLogo ? `<img class="header-logo" src="${headerLogo}" alt="">` : ''}
    ${header.logoText ? `<span>${escapeHtml(header.logoText)}</span>` : ''}
  </div>
</header>` : ''

        const title = escapeHtml(config.title || site.name || 'Mon site')
        const html = `<!doctype html>
<html lang="${escapeHtml(config.language || 'fr')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  ${config.description ? `<meta name="description" content="${escapeHtml(config.description)}">` : ''}
  ${config.author ? `<meta name="author" content="${escapeHtml(config.author)}">` : ''}
  ${favicon ? `<link rel="icon" href="${favicon}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="site-shell">
    ${headerHtml}
    <main>${sections.join('\n')}</main>
    ${renderFooter(config, footerLogo)}
  </div>
</body>
</html>`

        await Promise.all([
            fs.writeFile(path.join(tempDir, 'index.html'), html, 'utf8'),
            fs.writeFile(path.join(tempDir, 'styles.css'), buildCss(config, desktopBackgroundUrl), 'utf8')
        ])

        if (fsSync.existsSync(finalDir)) await fs.rm(finalDir, { recursive: true, force: true })
        await fs.rename(tempDir, finalDir)
        return finalDir
    } catch (error) {
        if (fsSync.existsSync(tempDir)) await fs.rm(tempDir, { recursive: true, force: true })
        throw error
    }
}
