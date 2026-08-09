import { z } from 'zod'

const shortText = z.string().max(500)
const longText = z.string().max(20_000)
const asset = z.string().max(14_000_000)
const nullableAsset = asset.nullable().optional()
const color = z.string().regex(/^(#[0-9a-f]{3,8}|[a-z-]+|var\(--[a-z0-9-]+\))$/i).max(64)
const cssSize = z.string().regex(/^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/).max(24)

export const sectionSchema = z.object({
    id: z.number().int().nonnegative().optional(),
    type: z.enum(['text', 'image', 'hero']).default('text'),
    title: shortText.optional(),
    content: longText.optional(),
    textAlign: z.enum(['left', 'center', 'right']).nullable().optional(),
    titleAlign: z.enum(['left', 'center', 'right']).nullable().optional(),
    image: nullableAsset,
    alt: shortText.nullable().optional(),
    align: z.enum(['left', 'center', 'right']).nullable().optional(),
    imageWidth: z.number().min(10).max(100).nullable().optional(),
    imagePosition: z.enum(['before', 'after']).nullable().optional(),
    imageShape: z.enum(['square', 'rounded', 'circle']).nullable().optional(),
    heroTitle: shortText.nullable().optional(),
    heroSubtitle: longText.nullable().optional(),
    ctaLabel: shortText.nullable().optional(),
    ctaUrl: z.string().max(2_048).nullable().optional(),
    heroOverlayColor: color.nullable().optional(),
    heroOverlayOpacity: z.union([z.string(), z.number()]).nullable().optional(),
    heroHeight: cssSize.nullable().optional(),
    style: z.object({
        background: color.nullable().optional(),
        textColor: color.nullable().optional(),
        fontFamily: z.string().max(200).nullable().optional(),
        padding: z.string().max(50).nullable().optional(),
        margin: z.string().max(50).nullable().optional(),
        fullWidth: z.boolean().optional()
    }).passthrough().optional().default({})
}).passthrough()

export const headerSchema = z.object({
    enabled: z.boolean().optional(),
    logo: nullableAsset,
    logoText: shortText.nullable().optional(),
    logoAlign: z.enum(['left', 'center', 'right']).nullable().optional(),
    logoShape: z.enum(['square', 'rounded', 'circle']).optional(),
    backgroundColor: color.optional(),
    textColor: color.optional(),
    height: cssSize.optional()
}).passthrough()

export const footerSchema = z.object({
    enabled: z.boolean().optional(),
    companyName: shortText.nullable().optional(),
    companyDescription: longText.nullable().optional(),
    logo: nullableAsset,
    logoShape: z.enum(['square', 'rounded', 'circle']).optional(),
    email: z.string().email().or(z.literal('')).nullable().optional(),
    phone: shortText.nullable().optional(),
    address: longText.nullable().optional(),
    socialLinks: z.array(z.object({
        platform: shortText.optional(),
        label: shortText.optional(),
        url: z.string().max(2_048).optional(),
        icon: shortText.optional()
    })).max(30).optional(),
    quickLinks: z.array(z.object({
        label: shortText.optional(),
        url: z.string().max(2_048).optional()
    })).max(50).optional(),
    copyrightText: shortText.nullable().optional(),
    backgroundColor: color.optional(),
    textColor: color.optional()
}).passthrough()

export const siteConfigSchema = z.object({
    title: shortText.optional(),
    description: longText.nullable().optional(),
    author: shortText.nullable().optional(),
    language: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/).optional(),
    favicon: nullableAsset,
    ogImage: nullableAsset,
    backgroundColor: color.optional(),
    textColor: color.optional(),
    fontFamily: z.string().max(200).optional(),
    fontSize: cssSize.optional(),
    backgroundImage: nullableAsset,
    theme: z.object({
        colorPalette: shortText.optional(),
        primaryColor: color.optional(),
        secondaryColor: color.optional(),
        accentColor: color.optional(),
        successColor: color.optional(),
        warningColor: color.optional(),
        errorColor: color.optional(),
        titleFont: z.string().max(200).optional(),
        bodyFont: z.string().max(200).optional(),
        borderRadius: z.enum(['none', 'small', 'medium', 'large']).optional(),
        spacing: z.enum(['compact', 'medium', 'spacious']).optional()
    }).passthrough().optional(),
    desktopBackground: z.object({
        type: z.enum(['color', 'image', 'gradient']).optional(),
        color: color.nullable().optional(),
        image: nullableAsset,
        gradientStart: color.nullable().optional(),
        gradientEnd: color.nullable().optional(),
        gradientDirection: z.enum(['to top', 'to right', 'to bottom', 'to left', 'to bottom right', 'to bottom left']).nullable().optional()
    }).passthrough().optional(),
    smoothScroll: z.boolean().optional(),
    seo: z.object({ title: shortText.optional(), description: longText.optional() }).optional(),
    images: z.array(asset).max(100).optional(),
    header: headerSchema.optional(),
    footer: footerSchema.optional(),
    sections: z.array(sectionSchema).max(100).optional()
}).passthrough()

export function validateConfig(config) {
    return siteConfigSchema.parse(config)
}

export function validateSitePayload(payload) {
    return z.object({
        name: z.string().trim().min(1, 'Le nom du site est requis').max(120),
        slug: z.string().trim().min(1, 'Le slug est requis').max(100)
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit contenir uniquement des minuscules, chiffres et tirets'),
        config: siteConfigSchema
    }).parse(payload)
}
