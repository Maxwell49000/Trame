import { serializeSection } from './siteSections.js'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function convertFile(owner, fileKey, valueKey) {
  if (owner?.[fileKey] && !owner[valueKey]) owner[valueKey] = await readFileAsDataUrl(owner[fileKey])
  if (owner) owner[fileKey] = null
}

export function stripTransientValues(value) {
  return JSON.parse(JSON.stringify(value, (key, item) => key.startsWith('_') ? undefined : item))
}

export async function createSitePayload(site) {
  for (const section of site.sections) await convertFile(section, '_file', 'image')

  const config = site.config
  await Promise.all([
    convertFile(config, '_bgFile', 'backgroundImage'),
    convertFile(config, '_ogImageFile', 'ogImage'),
    convertFile(config, '_faviconFile', 'favicon'),
    convertFile(config.header, '_logoFile', 'logo'),
    convertFile(config.footer, '_logoFile', 'logo'),
    convertFile(config.desktopBackground, '_file', 'image')
  ])

  const cleanConfig = stripTransientValues(config)
  cleanConfig.title = cleanConfig.title?.trim() || site.name.trim()
  cleanConfig.sections = site.sections.map(serializeSection)
  return { name: site.name.trim(), slug: site.slug.trim(), config: cleanConfig }
}
