import crypto from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(crypto.scrypt)
const KEY_LENGTH = 64
const COST = 32_768
const BLOCK_SIZE = 8
const PARALLELIZATION = 1

export async function hashPassword(password) {
    if (typeof password !== 'string' || password.length < 12 || password.length > 200) {
        throw new Error('Le mot de passe doit contenir entre 12 et 200 caractères')
    }
    const salt = crypto.randomBytes(16).toString('hex')
    const derivedKey = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, {
        N: COST,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: 64 * 1024 * 1024
    })
    return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password, encodedHash) {
    try {
        const [algorithm, cost, blockSize, parallelization, salt, hash] = String(encodedHash).split('$')
        if (algorithm !== 'scrypt' || !salt || !hash) return false
        const expected = Buffer.from(hash, 'hex')
        const actual = await scrypt(String(password).normalize('NFKC'), salt, expected.length, {
            N: Number(cost),
            r: Number(blockSize),
            p: Number(parallelization),
            maxmem: 64 * 1024 * 1024
        })
        return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
    } catch {
        return false
    }
}
