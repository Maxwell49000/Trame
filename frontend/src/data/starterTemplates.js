import { createSection } from '../utils/siteSections.js'

export function createStarterSite(template, initializeSite) {
  if (!template || template === 'blank') return initializeSite()
  const draft = initializeSite()

  if (template === 'portfolio') {
    draft.name = 'Mon portfolio'
    draft.slug = 'mon-portfolio'
    Object.assign(draft.config.theme, {
      colorPalette: 'custom', primaryColor: '#f04a32', secondaryColor: '#171714',
      accentColor: '#4054d8', titleFont: 'Georgia, serif'
    })
    Object.assign(draft.config.header, { enabled: true, logoText: 'VOTRE NOM', logoAlign: 'left', textColor: '#171714' })
    draft.sections = [
      createSection(1, 'hero', { heroTitle: 'Créer avec intention.', heroSubtitle: 'Designer & développeur — sélection de projets', ctaLabel: 'Découvrir les projets', ctaUrl: '#projets', heroHeight: '72vh' }),
      createSection(2, 'text', { title: 'Projets choisis', content: 'Présentez ici les réalisations qui racontent le mieux votre manière de travailler.', style: { background: '#f3f0e8', textColor: '#171714', padding: '64px 32px', margin: null, fullWidth: false } }),
      createSection(3, 'text', { title: 'Travaillons ensemble', content: 'Expliquez brièvement votre disponibilité et la meilleure façon de vous contacter.', style: { background: '#4054d8', textColor: '#ffffff', padding: '64px 32px', margin: null, fullWidth: false } })
    ]
  } else if (template === 'studio') {
    draft.name = 'Studio créatif'
    draft.slug = 'studio-creatif'
    Object.assign(draft.config.theme, {
      colorPalette: 'custom', primaryColor: '#4054d8', secondaryColor: '#171714',
      accentColor: '#f04a32', titleFont: 'Georgia, serif'
    })
    Object.assign(draft.config.header, { enabled: true, logoText: 'STUDIO / 01', logoAlign: 'left', textColor: '#171714' })
    draft.sections = [
      createSection(1, 'hero', { heroTitle: 'Des idées aux formes.', heroSubtitle: 'Identité, direction artistique et expériences numériques.', ctaLabel: 'Parler de votre projet', ctaUrl: '#contact', heroHeight: '68vh' }),
      createSection(2, 'text', { title: 'Ce que nous façonnons', content: 'Identités visuelles\nSites éditoriaux\nSystèmes de marque', style: { background: '#ffffff', textColor: '#171714', padding: '72px 40px', margin: null, fullWidth: false } }),
      createSection(3, 'text', { title: 'Une méthode simple', content: 'Écouter. Clarifier. Concevoir. Livrer une solution juste et durable.', style: { background: '#f3f0e8', textColor: '#171714', padding: '72px 40px', margin: null, fullWidth: false } })
    ]
  }

  draft.config.sections = draft.sections
  return draft
}
