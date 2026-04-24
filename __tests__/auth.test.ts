import { describe, it, expect, vi } from 'vitest'

// Mock env before importing
vi.stubEnv('JWT_SECRET', 'test-secret')

import { hashPassword, verifyPassword, signToken, auth } from '@/lib/auth'

// Mock jwt and bcrypt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })
  it('should hash password', async () => {
    const bcrypt = await import('bcryptjs')
    bcrypt.default.hash.mockResolvedValue('hashed-password')

    const result = await hashPassword('password123')
    expect(result).toBe('hashed-password')
    expect(bcrypt.default.hash).toHaveBeenCalledWith('password123', 10)
  })

  it('should verify password', async () => {
    const bcrypt = await import('bcryptjs')
    bcrypt.default.compare.mockResolvedValue(true)

    const result = await verifyPassword('password123', 'hashed-password')
    expect(result).toBe(true)
    expect(bcrypt.default.compare).toHaveBeenCalledWith('password123', 'hashed-password')
  })

  it('should sign token', async () => {
    const jwt = await import('jsonwebtoken')
    jwt.default.sign.mockReturnValue('mock-token')

    const result = signToken('user-1')
    expect(result).toBe('mock-token')
    expect(jwt.default.sign).toHaveBeenCalled()
  })

  it('should return user from valid token', async () => {
    const jwt = await import('jsonwebtoken')
    const { cookies } = await import('next/headers')

    jwt.default.verify.mockReturnValue({ userId: 'user-1' })
    cookies.mockReturnValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    })

    const result = await auth()
    expect(result).toEqual({ user: { id: 'user-1', role: 'USER' } })
  })

  it('should return null for invalid token', async () => {
    const jwt = await import('jsonwebtoken')
    const { cookies } = await import('next/headers')

    jwt.default.verify.mockImplementation(() => { throw new Error('Invalid token') })
    cookies.mockReturnValue({
      get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
    })

    const result = await auth()
    expect(result).toBe(null)
  })

  it('should return null when no token', async () => {
    const { cookies } = await import('next/headers')

    cookies.mockReturnValue({
      get: vi.fn().mockReturnValue(undefined),
    })

    const result = await auth()
    expect(result).toBe(null)
  })
})
