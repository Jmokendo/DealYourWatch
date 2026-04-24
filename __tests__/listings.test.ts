import { describe, it, expect } from 'vitest'
import { parseCreateListingBody } from '@/lib/api/validate'

describe('Create Listing Validation', () => {
  it('should validate valid listing body', () => {
    const input = {
      title: 'Test Watch',
      price: 1000,
      description: 'A nice watch',
      condition: 'EXCELLENT',
      hasBox: true,
      hasPapers: true,
      imageUrl: 'http://example.com/image.jpg',
      userName: 'Test User',
      currency: 'USD',
    }

    const result = parseCreateListingBody(input)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.body.title).toBe('Test Watch')
      expect(result.body.price).toBe(1000)
      expect(result.body.condition).toBe('EXCELLENT')
    }
  })

  it('should reject missing title', () => {
    const input = {
      price: 1000,
    }

    const result = parseCreateListingBody(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('title is required')
    }
  })

  it('should reject invalid price', () => {
    const input = {
      title: 'Test Watch',
      price: 'invalid',
    }

    const result = parseCreateListingBody(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('price must be a positive number')
    }
  })

  it('should reject negative price', () => {
    const input = {
      title: 'Test Watch',
      price: -100,
    }

    const result = parseCreateListingBody(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('price must be a positive number')
    }
  })

  it('should reject invalid condition', () => {
    const input = {
      title: 'Test Watch',
      price: 1000,
      condition: 'INVALID',
    }

    const result = parseCreateListingBody(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('invalid condition')
    }
  })

  it('should accept valid condition', () => {
    const input = {
      title: 'Test Watch',
      price: 1000,
      condition: 'MINT',
    }

    const result = parseCreateListingBody(input)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.body.condition).toBe('MINT')
    }
  })

  it('should accept image objects with optional publicId', () => {
    const input = {
      title: 'Test Watch',
      price: 1000,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          publicId: 'dealyourwatch/listings/draft-123/sample',
        },
        {
          url: 'https://example.com/legacy-image.jpg',
        },
      ],
    }

    const result = parseCreateListingBody(input)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.body.images).toEqual([
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          publicId: 'dealyourwatch/listings/draft-123/sample',
        },
        {
          url: 'https://example.com/legacy-image.jpg',
          publicId: undefined,
        },
      ])
    }
  })
})
