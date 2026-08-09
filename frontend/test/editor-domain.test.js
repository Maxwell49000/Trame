import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { useSiteInitialization } from '../src/composables/useSiteInitialization.js'
import { createStarterSite } from '../src/data/starterTemplates.js'
import { createSection, nextSectionId, normalizeSection, serializeSection } from '../src/utils/siteSections.js'
import { stripTransientValues } from '../src/utils/sitePayload.js'
import { generateSlug, isValidSlug } from '../src/utils/siteSlug.js'

describe('slugs', () => {
  test('normalizes accents and separators', () => {
    assert.equal(generateSlug(' Démo & Création '), 'demo-creation')
    assert.equal(isValidSlug('demo-creation'), true)
    assert.equal(isValidSlug('demo_creation'), false)
  })
})

describe('sections', () => {
  test('normalizes, serializes and allocates stable identifiers', () => {
    const section = normalizeSection({ id: 4, title: 'Intro', _previewUrl: 'blob:test' })
    const serialized = serializeSection(section)
    assert.equal(serialized.style.background, null)
    assert.equal('_previewUrl' in serialized, false)
    assert.equal(nextSectionId([section, { id: 8 }]), 9)
  })

  test('creates independent style objects', () => {
    const first = createSection(1)
    const second = createSection(2)
    first.style.background = '#000000'
    assert.notEqual(first.style.background, second.style.background)
  })
})

describe('editor payloads and templates', () => {
  test('removes editor-only values recursively', () => {
    assert.deepEqual(stripTransientValues({ title: 'Test', _file: {}, child: { value: 1, _preview: 'blob:test' } }), {
      title: 'Test',
      child: { value: 1 }
    })
  })

  test('creates valid starter templates with unique section identifiers', () => {
    const { initializeSite } = useSiteInitialization()
    for (const template of ['blank', 'portfolio', 'studio']) {
      const site = createStarterSite(template, initializeSite)
      const ids = site.sections.map(section => section.id)
      assert.equal(new Set(ids).size, ids.length)
      assert.ok(site.config.desktopBackground)
    }
  })
})
