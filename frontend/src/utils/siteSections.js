export function createSection(id, type = 'text', values = {}) {
  return {
    id,
    type,
    title: '',
    content: '',
    titleAlign: 'left',
    textAlign: 'left',
    style: {
      background: null,
      textColor: null,
      fontFamily: null,
      padding: null,
      margin: null,
      fullWidth: false
    },
    image: null,
    imagePosition: 'before',
    imageShape: 'square',
    alt: '',
    align: 'center',
    imageWidth: 80,
    heroTitle: '',
    heroSubtitle: '',
    ctaLabel: '',
    ctaUrl: '',
    heroOverlayColor: null,
    heroOverlayOpacity: '0.3',
    heroHeight: '60vh',
    ...values
  }
}

export function normalizeSection(section, id) {
  const normalized = createSection(section.id ?? id, String(section.type || 'text'), section)
  normalized.style = {
    ...createSection(0).style,
    ...(section.style && typeof section.style === 'object' && !Array.isArray(section.style) ? section.style : {})
  }
  return normalized
}

export function serializeSection(section) {
  return {
    id: section.id,
    type: String(section.type || 'text'),
    title: section.title || '',
    content: section.content || '',
    titleAlign: section.titleAlign || 'left',
    textAlign: section.textAlign || 'left',
    style: {
      background: section.style?.background || null,
      textColor: section.style?.textColor || null,
      fontFamily: section.style?.fontFamily || null,
      padding: section.style?.padding || null,
      margin: section.style?.margin || null,
      fullWidth: Boolean(section.style?.fullWidth)
    },
    image: section.image || null,
    imagePosition: section.imagePosition || 'before',
    imageShape: section.imageShape || 'square',
    alt: section.alt || null,
    align: section.align || 'center',
    imageWidth: Number(section.imageWidth) || 80,
    heroTitle: section.heroTitle || null,
    heroSubtitle: section.heroSubtitle || null,
    ctaLabel: section.ctaLabel || null,
    ctaUrl: section.ctaUrl || null,
    heroOverlayColor: section.heroOverlayColor || null,
    heroOverlayOpacity: section.heroOverlayOpacity ?? '0.3',
    heroHeight: section.heroHeight || '60vh'
  }
}

export function nextSectionId(sections = []) {
  return sections.reduce((max, section) => Math.max(max, Number(section.id) || 0), 0) + 1
}
