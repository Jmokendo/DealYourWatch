import { describe, it, expect, vi } from 'vitest'
import { requireSuperAdmin } from '@/lib/admin-auth'

// Mock the dependencies
vi.mock('@/lib/getUser', () => ({
  getUserIdFromCookie: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  getPrisma: vi.fn(),
}))

describe('Admin Permissions', () => {
  it('should allow super admin', async () => {
    const { getUserIdFromCookie } = await import('@/lib/getUser')
    const { getPrisma } = await import('@/lib/prisma')

    getUserIdFromCookie.mockResolvedValue('admin-1')
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'admin-1',
          role: 'SUPER_ADMIN',
          isBanned: false,
        }),
      },
    }
    getPrisma.mockReturnValue(mockPrisma)

    const result = await requireSuperAdmin()

    expect(result).toEqual({ userId: 'admin-1' })
  })

  it('should deny non-super admin', async () => {
    const { getUserIdFromCookie } = await import('@/lib/getUser')
    const { getPrisma } = await import('@/lib/prisma')

    getUserIdFromCookie.mockResolvedValue('user-1')
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          role: 'USER',
          isBanned: false,
        }),
      },
    }
    getPrisma.mockReturnValue(mockPrisma)

    const result = await requireSuperAdmin()

    expect(result).toEqual({ status: 403, message: 'Forbidden' })
  })

  it('should deny banned user', async () => {
    const { getUserIdFromCookie } = await import('@/lib/getUser')
    const { getPrisma } = await import('@/lib/prisma')

    getUserIdFromCookie.mockResolvedValue('user-1')
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          role: 'SUPER_ADMIN',
          isBanned: true,
        }),
      },
    }
    getPrisma.mockReturnValue(mockPrisma)

    const result = await requireSuperAdmin()

    expect(result).toEqual({ status: 403, message: 'Forbidden' })
  })

  it('should deny unauthenticated user', async () => {
    const { getUserIdFromCookie } = await import('@/lib/getUser')

    getUserIdFromCookie.mockResolvedValue(null)

    const result = await requireSuperAdmin()

    expect(result).toEqual({ status: 401, message: 'Unauthorized' })
  })

  it('should handle database error', async () => {
    const { getUserIdFromCookie } = await import('@/lib/getUser')
    const { getPrisma } = await import('@/lib/prisma')

    getUserIdFromCookie.mockResolvedValue('user-1')
    getPrisma.mockReturnValue(null)

    const result = await requireSuperAdmin()

    expect(result).toEqual({ status: 503, message: 'Service unavailable' })
  })
})