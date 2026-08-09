import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { hashPassword, verifyPassword } from '../src/auth/password.js'
import { siteAccessWhere } from '../src/auth/authorization.js'

describe('password security', () => {
    test('hashes and verifies a password without storing it in plain text', async () => {
        const password = 'a-secure-password-123'
        const hash = await hashPassword(password)
        assert.match(hash, /^scrypt\$/)
        assert.equal(hash.includes(password), false)
        assert.equal(await verifyPassword(password, hash), true)
        assert.equal(await verifyPassword('wrong-password', hash), false)
    })

    test('rejects short passwords and malformed hashes', async () => {
        await assert.rejects(() => hashPassword('too-short'))
        assert.equal(await verifyPassword('anything', 'invalid'), false)
    })
})

describe('site authorization', () => {
    test('scopes regular users to their own sites', () => {
        assert.deepEqual(siteAccessWhere({ id: 12, role: 'USER' }), { owner_id: 12 })
        assert.deepEqual(siteAccessWhere({ id: 12, role: 'USER' }, 8), { id: 8, owner_id: 12 })
    })

    test('allows administrators to query all sites', () => {
        assert.deepEqual(siteAccessWhere({ id: 1, role: 'ADMIN' }), {})
        assert.deepEqual(siteAccessWhere({ id: 1, role: 'ADMIN' }, 8), { id: 8 })
    })
})
