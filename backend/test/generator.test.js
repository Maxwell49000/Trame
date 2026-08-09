import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { after, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { escapeHtml, generateStaticSite, safeUrl, sanitizeSlug } from '../src/utils/generator.js'
import { validateSitePayload } from '../src/validators/siteValidator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const generatedRoot = path.resolve(__dirname, '../generated')
const testSlug = `generator-test-${process.pid}`

after(async () => {
    await fs.rm(path.join(generatedRoot, testSlug), { recursive: true, force: true })
})

describe('generator helpers', () => {
    test('sanitizes slugs and HTML', () => {
        assert.equal(sanitizeSlug(' Démo / Client '), 'demo-client')
        assert.equal(escapeHtml('<script>'), '&lt;script&gt;')
    })

    test('rejects executable URLs', () => {
        assert.equal(safeUrl('javascript:alert(1)'), '#')
        assert.equal(safeUrl('https://example.com'), 'https://example.com')
    })
})

describe('site validation', () => {
    test('accepts a valid minimal site', () => {
        const result = validateSitePayload({
            name: 'Démo',
            slug: 'demo',
            config: { sections: [{ type: 'text', content: 'Bonjour' }] }
        })
        assert.equal(result.slug, 'demo')
    })

    test('rejects unsafe slugs and removed section types', () => {
        assert.throws(() => validateSitePayload({ name: 'Démo', slug: '../demo', config: {} }))
        assert.throws(() => validateSitePayload({
            name: 'Démo',
            slug: 'demo',
            config: { sections: [{ type: 'visitCard' }] }
        }))
    })
})

test('generates a static site without executable user content', async () => {
    const folder = await generateStaticSite({
        name: 'Test',
        slug: testSlug,
        config: {
            title: 'Test <script>',
            theme: { bodyFont: 'Arial";background:url(javascript:alert(1))' },
            desktopBackground: {
                type: 'gradient',
                gradientDirection: 'to bottom right',
                gradientStart: '#112233',
                gradientEnd: '#445566'
            },
            sections: [
                {
                    id: 1,
                    type: 'hero',
                    heroTitle: '<img src=x onerror=alert(1)>',
                    ctaLabel: 'Cliquer',
                    ctaUrl: 'javascript:alert(1)'
                },
                {
                    id: 2,
                    type: 'text',
                    content: 'Texte',
                    style: { fontFamily: 'Arial" onmouseover="alert(1)' }
                }
            ]
        }
    })

    const html = await fs.readFile(path.join(folder, 'index.html'), 'utf8')
    const css = await fs.readFile(path.join(folder, 'styles.css'), 'utf8')
    assert.match(html, /Test &lt;script&gt;/)
    assert.match(html, /href="#"/)
    assert.doesNotMatch(html, /<img src=x onerror=/)
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
    assert.doesNotMatch(html, /onmouseover=/)
    assert.doesNotMatch(html, /EmailJS|visitCard/)
    assert.match(css, /linear-gradient\(to bottom right, #112233, #445566\)/)
})
