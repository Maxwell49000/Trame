export function createRateLimit({ windowMs, max, message }) {
    const buckets = new Map()
    return function rateLimit(req, res, next) {
        const now = Date.now()
        if (buckets.size > 10_000) {
            for (const [bucketKey, bucket] of buckets) {
                if (now - bucket.startedAt >= windowMs) buckets.delete(bucketKey)
            }
        }
        const key = req.ip || 'unknown'
        const current = buckets.get(key)
        if (!current || now - current.startedAt >= windowMs) {
            buckets.set(key, { startedAt: now, count: 1 })
            return next()
        }
        current.count += 1
        if (current.count > max) {
            res.setHeader('Retry-After', String(Math.ceil((windowMs - (now - current.startedAt)) / 1000)))
            return res.status(429).json({ error: message })
        }
        next()
    }
}
